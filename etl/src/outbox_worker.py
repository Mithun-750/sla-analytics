import json
import os
import time
from datetime import timezone
from pathlib import Path

import boto3
import pandas as pd
import psycopg
from dotenv import load_dotenv
from psycopg.rows import dict_row

from sync import (
    clean_table,
    dataframe_to_parquet,
    get_table_metadata,
    normalize_value,
)


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


def dataframe_key(event, dataset):
    occurred_at = event["occurred_at"].astimezone(timezone.utc)
    return (
        f"{dataset}/{event['table_name']}/"
        f"ingestion_date={occurred_at:%Y-%m-%d}/"
        f"event_id={event['id']}/{event['table_name']}.parquet"
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


def upload_dataframe(s3, event, dataset, dataframe):
    s3.put_object(
        Bucket=S3_BUCKET,
        Key=dataframe_key(event, dataset),
        Body=dataframe_to_parquet(dataframe),
        ContentType="application/octet-stream",
    )


def event_dataframe(event, columns):
    row = event["row_data"]
    return pd.DataFrame(
        [{column: normalize_value(row.get(column)) for column in columns}],
        columns=columns,
    )


def add_event_metadata(dataframe, event):
    result = dataframe.copy()
    result["_event_id"] = event["id"]
    result["_operation"] = event["operation"]
    result["_occurred_at"] = event["occurred_at"]
    return result


def process_event(s3, connection, event):
    columns, required_columns, primary_keys = get_table_metadata(
        connection, event["table_name"]
    )
    raw = add_event_metadata(event_dataframe(event, columns), event)
    clean, rejected = clean_table(raw, required_columns, primary_keys)

    upload_event(s3, event)
    upload_dataframe(s3, event, "raw", raw)
    if clean.empty:
        upload_dataframe(s3, event, "rejected", rejected)
    else:
        upload_dataframe(s3, event, "clean", clean)
    if not rejected.empty:
        upload_dataframe(s3, event, "rejected", rejected)


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
                    process_event(s3, connection, event)
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
