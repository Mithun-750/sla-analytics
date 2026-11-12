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

DATABASE_URL = os.getenv("SOURCE_DB_URL", "postgresql://localhost:5432/sla")
DATABASE_USERNAME = os.getenv("SOURCE_DB_USERNAME", "postgres")
DATABASE_PASSWORD = os.getenv("SOURCE_DB_PASSWORD", "postgres")
AWS_PROFILE = os.getenv("AWS_PROFILE", "s3-user")
AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-2")
S3_BUCKET = os.getenv("S3_BUCKET", "mithun-sla-data")
POLL_INTERVAL_SECONDS = float(os.getenv("OUTBOX_POLL_INTERVAL_SECONDS", "2"))
CLAIM_TIMEOUT_SECONDS = int(os.getenv("OUTBOX_CLAIM_TIMEOUT_SECONDS", "300"))
BATCH_SIZE = int(os.getenv("OUTBOX_BATCH_SIZE", "100"))


def create_connections():
    connection = psycopg.connect(
        DATABASE_URL,
        user=DATABASE_USERNAME,
        password=DATABASE_PASSWORD,
        row_factory=dict_row,
    )
    session = boto3.Session(
        profile_name=AWS_PROFILE,
        region_name=AWS_REGION,
    )
    return connection, session.client("s3")


def claim_events(connection):
    with connection.transaction():
        with connection.cursor() as cursor:
            cursor.execute(
                """
                WITH candidates AS (
                    SELECT id
                    FROM outbox_events
                    WHERE processed_at IS NULL
                      AND (
                          locked_until IS NULL
                          OR locked_until < clock_timestamp()
                      )
                    ORDER BY id
                    FOR UPDATE SKIP LOCKED
                    LIMIT %s
                )
                UPDATE outbox_events AS event
                SET attempts = event.attempts + 1,
                    locked_until = clock_timestamp()
                        + (%s * INTERVAL '1 second')
                FROM candidates
                WHERE event.id = candidates.id
                RETURNING event.*
                """,
                (BATCH_SIZE, CLAIM_TIMEOUT_SECONDS),
            )
            return cursor.fetchall()


def event_key(event):
    occurred_at = event["occurred_at"].astimezone(timezone.utc)
    return (
        f"events/{event['table_name']}/"
        f"ingestion_date={occurred_at:%Y-%m-%d}/"
        f"{event['id']}.json"
    )


def upload_event(s3, event):
    body = json.dumps(
        {
            "id": event["id"],
            "table": event["table_name"],
            "operation": event["operation"],
            "occurred_at": event["occurred_at"].isoformat(),
            "row": event["row_data"],
        },
        default=str,
    ).encode("utf-8")
    s3.put_object(
        Bucket=S3_BUCKET,
        Key=event_key(event),
        Body=body,
        ContentType="application/json",
    )


def mark_processed(connection, event_id):
    with connection.transaction():
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE outbox_events
                SET processed_at = clock_timestamp(),
                    locked_until = NULL,
                    last_error = NULL
                WHERE id = %s
                  AND processed_at IS NULL
                """,
                (event_id,),
            )


def mark_failed(connection, event_id, error):
    with connection.transaction():
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE outbox_events
                SET locked_until = NULL,
                    last_error = %s
                WHERE id = %s
                  AND processed_at IS NULL
                """,
                (str(error), event_id),
            )


def run():
    connection, s3 = create_connections()
    try:
        while True:
            events = claim_events(connection)
            if not events:
                time.sleep(POLL_INTERVAL_SECONDS)
                continue

            for event in events:
                try:
                    upload_event(s3, event)
                    mark_processed(connection, event["id"])
                except Exception as error:
                    mark_failed(connection, event["id"], error)
                    print(
                        f"Failed to publish outbox event {event['id']}: {error}"
                    )
    finally:
        connection.close()


if __name__ == "__main__":
    run()
