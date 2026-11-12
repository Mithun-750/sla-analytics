
import json
import os
import time
import uuid
from datetime import timezone
from pathlib import Path

import boto3
import psycopg
from dotenv import load_dotenv
from psycopg.rows import dict_row

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

AWS_PROFILE = os.getenv("AWS_PROFILE", "s3-user")
AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-2")
S3_BUCKET = os.getenv("S3_BUCKET", "mithun-750-sla")

BATCH_SIZE = int(os.getenv("BATCH_SIZE", "50"))
LOCK_DURATION_SECONDS = int(os.getenv("LOCK_DURATION_SECONDS", "300"))
POLL_INTERVAL_SECONDS = int(os.getenv("POLL_INTERVAL_SECONDS", "5"))

DATABASE_URL = os.environ["DATABASE_URL"]


def create_connections():
    connection = psycopg.connect(
        DATABASE_URL,
        row_factory=dict_row
    )

    session = boto3.Session(
        profile_name=AWS_PROFILE,
        region_name=AWS_REGION
    )

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


def event_key(event):
    occurred_at = event["occurred_at"].astimezone(timezone.utc)
    ingestion_date = occurred_at.strftime("%Y-%m-%d")

    attempt_id = uuid.uuid4().hex

    return (
        f"events/{event['table_name']}/"
        f"ingestion_date={ingestion_date}/"
        f"{event['id']}-{attempt_id}.json"
    )


def upload_event(s3, event):
    key = event_key(event)

    payload = {
        "id": event["id"],
        "table": event["table_name"],
        "operation": event["operation"],
        "occurred_at": event["occurred_at"].isoformat(),
        "row": event["row_data"]
    }

    s3.put_object(
        Bucket=S3_BUCKET,
        Key=key,
        Body=json.dumps(payload, default=str),
        ContentType="application/json"
    )

    return key


def mark_processed(connection, event_id):
    query = """
        UPDATE outbox_events
        SET
            processed_at = NOW(),
            locked_until = NULL,
            last_error = NULL
        WHERE id = %s
    """

    connection.execute(query, (event_id,))


def mark_failed(connection, event_id, error):
    query = """
        UPDATE outbox_events
        SET
            locked_until = NOW() + (
                LEAST(POWER(2, attempts), 300) * INTERVAL '1 second'
            ),
            last_error = %s
        WHERE id = %s
    """

    connection.execute(
        query,
        (str(error)[:4000], event_id)
    )


def process_event(connection, s3, event):
    event_id = event["id"]

    try:
        key = upload_event(s3, event)

        mark_processed(connection, event_id)

        print(f"Uploaded event {event_id}: {key}")

    except Exception as error:
        mark_failed(connection, event_id, error)

        print(f"Failed event {event_id}: {error}")


def run():
    connection, s3 = create_connections()

    print("Outbox publisher started")

    try:
        while True:
            events = claim_events(connection)

            if not events:
                time.sleep(POLL_INTERVAL_SECONDS)
                continue

            for event in events:
                process_event(connection, s3, event)

    except KeyboardInterrupt:
        print("Stopping outbox publisher")

    finally:
        connection.close()


if __name__ == "__main__":
    run()
