# Data flow

## Overview

The application uses a transactional PostgreSQL outbox to move changes from
the operational database to S3. Python owns the initial seed load and the
incremental event pipeline, while the full-table ETL owns data snapshots.

```text
CSV generator
    |
    v
Python seed loader
    |
    v
PostgreSQL application tables
    |
    | AFTER INSERT / UPDATE / DELETE
    v
outbox_events
    |
    | Python worker polls pending rows
    v
Python outbox worker
    |\
    | +--> events/{table}/.../{event_id}.json
    | +--> raw/{table}/.../{table}.parquet
    | +--> clean/{table}/.../{table}.parquet
    | └--> rejected/{table}/.../{table}.parquet

Full-table ETL
    ├──> raw/{table}/.../{table}.parquet
    ├──> clean/{table}/.../{table}.parquet
    └──> rejected/{table}/.../{table}.parquet
```

## Initial load

`pnpm data:load` performs the following steps:

1. Starts PostgreSQL.
2. Generates deterministic CSV files in `data/generated/`.
3. Applies `scripts/schema.sql`.
4. Loads the CSV files into PostgreSQL in dependency order and one transaction.
5. Resets identity sequences.

The database schema is applied separately from Spring Boot. Hibernate runs in
`validate` mode and does not create or update tables.

## Incremental event flow

`pnpm db:outbox` creates the `outbox_events` table and installs an
`AFTER INSERT OR UPDATE OR DELETE` trigger on each application table. The
trigger stores the changed row, operation, table name, and event timestamp in
the same transaction as the application change.

The worker polls for rows where `processed_at IS NULL`. It claims rows with
row locks and `SKIP LOCKED`, increments the attempt count, and sets a lease
using `locked_until`. This allows retries after a worker crash and permits
multiple workers to process independent events.

For each claimed event, the worker:

1. Uploads the original event envelope under `events/`.
2. Uploads the unmodified changed row as raw Parquet under `raw/`.
3. Normalizes and validates the row.
4. Uploads valid data as clean Parquet under `clean/`.
5. Uploads invalid data as rejected Parquet under `rejected/`.
6. Marks the outbox row processed only after all required uploads succeed.

S3 keys include the outbox event ID. A retry therefore writes the same object
key and is idempotent rather than creating a second object.

## S3 layout

```text
events/{table}/ingestion_date={YYYY-MM-DD}/{event_id}.json
raw/{table}/ingestion_date={YYYY-MM-DD}/event_id={event_id}/{table}.parquet
clean/{table}/ingestion_date={YYYY-MM-DD}/event_id={event_id}/{table}.parquet
rejected/{table}/ingestion_date={YYYY-MM-DD}/event_id={event_id}/{table}.parquet
```

The full-table ETL remains available through `pnpm etl:run` for historical
snapshots and reconciliation.

## Failure and retry behavior

If an S3 upload fails, the worker records the error in `last_error`, clears the
lease, and leaves `processed_at` null. The event is eligible for a later
polling cycle.

If S3 uploads succeed but the worker exits before marking the event processed,
the next attempt uses the same event-based keys. The uploads are overwritten
and the event is then marked processed.
