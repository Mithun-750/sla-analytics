# SLA Analysis

Spring Boot SLA application with PostgreSQL and deterministic seed data.

## Setup

Requirements: Docker, pnpm, Maven, and uv.

```bash
pnpm db:up
pnpm data:load
```

The Python loader creates the schema and loads the generated data before the
application starts.

## Outbox

Changes to the PostgreSQL SLA tables are captured transactionally in the
`outbox_events` table by database triggers. The outbox worker publishes those
events to S3 using the credentials and settings in the root `.env` file.

Initialize the trigger and start both the Spring Boot backend and outbox worker
with:

```bash
pnpm start
```

For an existing database, publish the rows that were loaded before the outbox
was enabled once:

```bash
pnpm db:outbox:backfill
```

The backfill command should not be repeated unless duplicate initial events are
intentional. The trigger migration itself is idempotent and is run
automatically by `pnpm start`.

## Commands

```bash
pnpm app:run        # Start the application
pnpm data:generate  # Generate CSV data
pnpm data:load      # Generate and load data with Python
pnpm data:load-temp # Generate and load a fresh smaller batch
pnpm data:drop      # Remove rows and keep the schema
pnpm db:reset       # Delete and recreate PostgreSQL
pnpm db:schema      # Create or validate the application schema
pnpm db:outbox      # Install or refresh PostgreSQL outbox triggers
pnpm db:outbox:backfill # Queue existing rows for one-time publication
pnpm start          # Start the backend and outbox worker together
pnpm test           # Run tests
pnpm build          # Build the application
pnpm etl:sync       # Install ETL dependencies
pnpm etl:run        # Run the legacy full-table export
```

The outbox worker publishes to S3. Configure the database, AWS, and worker
settings in the root `.env` file. It writes one deterministic object per
outbox event, so retrying an event overwrites the same object instead of
creating a duplicate. Successful uploads are logged every 100 events by
default; set `OUTBOX_LOG_INTERVAL` to change that interval. The worker uploads batch objects sequentially. Events are written as JSON arrays,
grouped by source table and ingestion date, with up to 500 events per object.
Configure this with `OUTBOX_BATCH_SIZE` and
`OUTBOX_S3_BATCH_SIZE`. The database status is committed for each successfully
uploaded object. Individual failed batches are always logged.

The outbox worker writes each incremental change under `events/`, `raw/`,
`clean/`, and `rejected/`. Run `pnpm etl:run` for full-table snapshots and
reconciliation.
