
import json
import os
import time
from datetime import timezone
from pathlib import Path

import boto3
import psycopg
from dotenv import load_dotenv
from psycopg.rows import dict_row

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-2")
S3_BUCKET = os.getenv("S3_BUCKET", "mithun-750-sla")

BATCH_SIZE = int(os.getenv("OUTBOX_BATCH_SIZE", os.getenv("BATCH_SIZE", "500")))
LOCK_DURATION_SECONDS = int(os.getenv("OUTBOX_CLAIM_TIMEOUT_SECONDS", os.getenv("LOCK_DURATION_SECONDS", "300")))
POLL_INTERVAL_SECONDS = int(os.getenv("OUTBOX_POLL_INTERVAL_SECONDS", os.getenv("POLL_INTERVAL_SECONDS", "5")))
LOG_INTERVAL = max(1, int(os.getenv("OUTBOX_LOG_INTERVAL", "10")))
S3_BATCH_SIZE = max(1, int(os.getenv("OUTBOX_S3_BATCH_SIZE", "500")))

DATABASE_URL = os.getenv("SOURCE_DB_URL") or os.getenv("DATABASE_URL") or "postgresql://localhost:5432/sla"
DATABASE_USERNAME = os.getenv("SOURCE_DB_USERNAME")
DATABASE_PASSWORD = os.getenv("SOURCE_DB_PASSWORD")


def create_connections():
    conn_kwargs = {"row_factory": dict_row}
    if DATABASE_USERNAME:
        conn_kwargs["user"] = DATABASE_USERNAME
    if DATABASE_PASSWORD:
        conn_kwargs["password"] = DATABASE_PASSWORD

    connection = psycopg.connect(
        DATABASE_URL,
        **conn_kwargs
    )

    session = boto3.Session(region_name=AWS_REGION)

    s3 = session.client("s3")

    return connection, s3


def claim_events(connection):
    query = """
        WITH claimed AS (
            SELECT id
            FROM outbox_events
            WHERE processed_at IS NULL
              AND (
                  locked_until IS NULL
                  OR locked_until < NOW()
              )
            ORDER BY id
            LIMIT %s
            FOR UPDATE SKIP LOCKED
        )
        UPDATE outbox_events AS events
        SET
            attempts = events.attempts + 1,
            locked_until = NOW() + (%s * INTERVAL '1 second')
        FROM claimed
        WHERE events.id = claimed.id
        RETURNING
            events.id,
            events.table_name,
            events.operation,
            events.row_data,
            events.occurred_at,
            events.attempts
    """

    with connection.transaction():
        events = connection.execute(
            query,
            (BATCH_SIZE, LOCK_DURATION_SECONDS)
        ).fetchall()

    return events


def event_payload(event):
    return {
        "id": event["id"],
        "table": event["table_name"],
        "operation": event["operation"],
        "occurred_at": event["occurred_at"].isoformat(),
        "row": event["row_data"],
    }


def batch_key(events):
    first = events[0]
    occurred_at = first["occurred_at"].astimezone(timezone.utc)
    ingestion_date = occurred_at.strftime("%Y-%m-%d")
    event_ids = sorted(str(event["id"]) for event in events)

    return (
        f"events/{first['table_name']}/"
        f"ingestion_date={ingestion_date}/"
        f"{event_ids[0]}-{event_ids[-1]}-{len(event_ids)}.json"
    )


def upload_batch(s3, events):
    key = batch_key(events)
    payload = [event_payload(event) for event in events]

    s3.put_object(
        Bucket=S3_BUCKET,
        Key=key,
        Body=json.dumps(payload, default=str),
        ContentType="application/json"
    )

    return len(events)


def mark_processed_many(connection, event_ids):
    if not event_ids:
        return

    query = """
        UPDATE outbox_events
        SET
            processed_at = NOW(),
            locked_until = NULL,
            last_error = NULL
        WHERE id = ANY(%s)
    """

    with connection.transaction():
        connection.execute(query, (event_ids,))


def mark_failed_many(connection, failures):
    if not failures:
        return

    query = """
        UPDATE outbox_events
        SET
            locked_until = NOW() + (
                LEAST(POWER(2, attempts), 300) * INTERVAL '1 second'
            ),
            last_error = %s
        WHERE id = %s
    """

    with connection.transaction():
        connection.executemany(
            query,
            [(str(error)[:4000], event_id) for event_id, error in failures],
        )


def group_events(events):
    groups = {}
    for event in events:
        occurred_at = event["occurred_at"].astimezone(timezone.utc)
        group_key = (event["table_name"], occurred_at.strftime("%Y-%m-%d"))
        groups.setdefault(group_key, []).append(event)

    batches = []
    for group in groups.values():
        for start in range(0, len(group), S3_BATCH_SIZE):
            batches.append(group[start:start + S3_BATCH_SIZE])
    return batches


def process_batch(connection, s3, events):
    processed_ids = []
    failures = []

    for event_batch in group_events(events):
        try:
            upload_batch(s3, event_batch)
            processed_ids.extend(event["id"] for event in event_batch)
        except Exception as error:
            failures.extend((event["id"], error) for event in event_batch)
            print(
                f"Failed batch {batch_key(event_batch)} "
                f"({len(event_batch)} events): {error}"
            )

    mark_processed_many(connection, processed_ids)
    mark_failed_many(connection, failures)
    return len(processed_ids), len(failures)


def run():
    connection, s3 = create_connections()

    print(
        f"Outbox publisher started (up to {S3_BATCH_SIZE} events per S3 object, "
        f"progress every {LOG_INTERVAL} events)"
    )
    processed_count = 0
    failed_count = 0
    next_log_at = LOG_INTERVAL

    try:
        while True:
            events = claim_events(connection)

            if not events:
                time.sleep(POLL_INTERVAL_SECONDS)
                continue

            uploaded, failed = process_batch(connection, s3, events)
            processed_count += uploaded
            failed_count += failed

            while processed_count + failed_count >= next_log_at:
                print(
                    f"Outbox progress: {processed_count} uploaded, "
                    f"{failed_count} failed"
                )
                next_log_at += LOG_INTERVAL

    except KeyboardInterrupt:
        print("Stopping outbox publisher")

    finally:
        connection.close()


if __name__ == "__main__":
    run()
