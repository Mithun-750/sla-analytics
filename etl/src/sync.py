
import json
import os
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path
from uuid import UUID

import boto3
import pandas as pd
import psycopg
import pyarrow as pa
import pyarrow.parquet as pq
from dotenv import load_dotenv
from psycopg import sql
from psycopg.rows import dict_row


load_dotenv(Path(__file__).resolve().parents[2] / ".env")

TABLES = [
    "users",
    "customers",
    "skills",
    "user_skills",
    "tickets",
    "ticket_assignments",
    "ticket_pauses",
    "ticket_escalations",
    "ticket_events",
]

DATABASE_URL = os.getenv(
    "SOURCE_DB_URL",
    "postgresql://localhost:5432/sla"
)

DATABASE_USERNAME = os.getenv("SOURCE_DB_USERNAME", "postgres")
DATABASE_PASSWORD = os.getenv("SOURCE_DB_PASSWORD", "postgres")

AWS_PROFILE = os.getenv("AWS_PROFILE", "s3-user")
AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-2")
S3_BUCKET = os.getenv("S3_BUCKET", "mithun-sla-data")

RUN_ID = str(uuid.uuid4())
INGESTION_DATE = datetime.now(timezone.utc).strftime("%Y-%m-%d")


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


def get_table_metadata(connection, table):
    query = """
        SELECT
            c.column_name,
            c.is_nullable,
            CASE WHEN pk.column_name IS NOT NULL THEN TRUE ELSE FALSE END
                AS is_primary_key
        FROM information_schema.columns c
        LEFT JOIN (
            SELECT
                kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            WHERE tc.constraint_type = 'PRIMARY KEY'
                AND tc.table_schema = current_schema()
                AND tc.table_name = %s
        ) pk ON c.column_name = pk.column_name
        WHERE c.table_schema = current_schema()
          AND c.table_name = %s
        ORDER BY c.ordinal_position
    """

    with connection.cursor() as cursor:
        cursor.execute(query, (table, table))
        metadata = cursor.fetchall()

    if not metadata:
        raise ValueError(f"Table '{table}' was not found in the current schema")

    columns = [item["column_name"] for item in metadata]

    required_columns = [
        item["column_name"]
        for item in metadata
        if item["is_nullable"] == "NO"
    ]

    primary_keys = [
        item["column_name"]
        for item in metadata
        if item["is_primary_key"]
    ]

    return columns, required_columns, primary_keys


def normalize_value(value):
    if isinstance(value, (dict, list)):
        return json.dumps(value, default=str)

    if isinstance(value, (UUID, Decimal)):
        return str(value)

    return value


def extract_table(connection, table, columns):
    query = sql.SQL("SELECT {} FROM {}").format(
        sql.SQL(", ").join(map(sql.Identifier, columns)),
        sql.Identifier(table),
    )

    with connection.cursor() as cursor:
        cursor.execute(query)
        records = cursor.fetchall()

    dataframe = pd.DataFrame(records, columns=columns)

    for column in dataframe.columns:
        dataframe[column] = dataframe[column].map(normalize_value)

    return dataframe


def clean_table(dataframe, required_columns, primary_keys):
    cleaned = dataframe.copy()

    for column in cleaned.select_dtypes(include=["object"]).columns:
        cleaned[column] = cleaned[column].map(
            lambda value: value.strip()
            if isinstance(value, str)
            else value
        )

        cleaned[column] = cleaned[column].replace("", None)

    rejection_reasons = pd.Series(
        [[] for _ in range(len(cleaned))],
        index=cleaned.index,
        dtype=object,
    )

    for column in required_columns:
        invalid = cleaned[column].isna()
        rejection_reasons.loc[invalid] = rejection_reasons.loc[
            invalid
        ].map(lambda reasons: reasons + [f"Missing required field: {column}"])

    if primary_keys:
        duplicate = cleaned.duplicated(
            subset=primary_keys,
            keep="first",
        )

        rejection_reasons.loc[duplicate] = rejection_reasons.loc[
            duplicate
        ].map(
            lambda reasons: reasons + [
                f"Duplicate primary key: {', '.join(primary_keys)}"
            ]
        )

    rejected_mask = rejection_reasons.map(bool)

    rejected = cleaned.loc[rejected_mask].copy()
    rejected["_rejection_reason"] = rejection_reasons.loc[
        rejected_mask
    ].map(lambda reasons: "; ".join(reasons))

    valid = cleaned.loc[~rejected_mask].copy()

    return valid, rejected


def dataframe_to_parquet(dataframe):
    table = pa.Table.from_pandas(
        dataframe,
        preserve_index=False,
    )

    buffer = pa.BufferOutputStream()
    pq.write_table(table, buffer, compression="snappy")

    return buffer.getvalue().to_pybytes()


def upload_dataframe(s3, table, dataset, dataframe):
    key = (
        f"{dataset}/{table}/"
        f"ingestion_date={INGESTION_DATE}/"
        f"run_id={RUN_ID}/{table}.parquet"
    )

    content = dataframe_to_parquet(dataframe)

    s3.put_object(
        Bucket=S3_BUCKET,
        Key=key,
        Body=content,
        ContentType="application/octet-stream",
    )

    print(
        f"Uploaded {dataset}/{table}: "
        f"{len(dataframe)} records"
    )


def process_table(connection, s3, table):
    print(f"\nProcessing table: {table}")

    columns, required_columns, primary_keys = get_table_metadata(
        connection,
        table,
    )

    extracted = extract_table(connection, table, columns)

    cleaned, rejected = clean_table(
        extracted,
        required_columns,
        primary_keys,
    )

    upload_dataframe(s3, table, "raw", extracted)
    upload_dataframe(s3, table, "clean", cleaned)
    upload_dataframe(s3, table, "rejected", rejected)

    print(
        f"Finished {table} | "
        f"Extracted: {len(extracted)} | "
        f"Clean: {len(cleaned)} | "
        f"Rejected: {len(rejected)}"
    )


def main():
    print("Starting PostgreSQL to S3 ETL")
    print(f"Bucket: {S3_BUCKET}")
    print(f"Run ID: {RUN_ID}")

    connection = None

    try:
        connection, s3 = create_connections()

        for table in TABLES:
            process_table(connection, s3, table)

        print("\nETL completed successfully")

    except Exception as error:
        print(f"\nETL failed: {error}")
        raise

    finally:
        if connection:
            connection.close()


if __name__ == "__main__":
    main()
