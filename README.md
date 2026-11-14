# SLA Analysis

Spring Boot SLA application with PostgreSQL and deterministic seed data.

## Setup

Requirements: Docker, pnpm, Maven, and uv.

For local configuration, copy the example environment file and replace the
placeholder values:

```bash
cp .env.example .env
```

Keep `.env` private. It contains database and AWS configuration. Do not commit
it or put real credentials in `.env.example`.

```bash
pnpm db:up
pnpm data:load
```

`pnpm db:up` starts PostgreSQL only for local development. The Python loader
creates the schema and loads the generated data. For the complete Docker
workflow, data initialization is opt-in; see
[Docker startup](#docker-startup).

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
pnpm app:run        # Start backend, worker, and Vite frontend locally
pnpm data:generate  # Generate CSV data
pnpm data:load      # Start PostgreSQL, then generate and load data locally
pnpm data:load-temp # Start PostgreSQL, then load a smaller batch locally
pnpm data:drop      # Remove rows and keep the schema
pnpm db:reset       # Recreate PostgreSQL and run the init profile
pnpm db:schema      # Create or validate the application schema
pnpm db:outbox      # Install or refresh PostgreSQL outbox triggers
pnpm db:outbox:backfill # Queue existing rows for one-time publication
pnpm start          # Start backend, worker, and Vite frontend locally
pnpm docker:init    # Run the Compose seed initializer explicitly
pnpm docker:up      # Start the complete containerized application
pnpm docker:down    # Stop and remove application containers
pnpm test           # Run tests
pnpm build          # Build the application
pnpm etl:sync       # Install ETL dependencies
pnpm etl:run        # Run the legacy full-table export
```

The outbox worker publishes to S3. Configure the database, AWS, and worker
settings in the root `.env` file. It uses boto3's standard environment
credential chain; an AWS CLI profile and a `~/.aws` mount are not required.
AWS authentication uses the standard
environment variables `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
(optionally `AWS_SESSION_TOKEN` for temporary credentials). It writes one
deterministic object per
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

### Docker startup

The default Compose startup does not run the seed initializer:

```bash
pnpm docker:up
```

For a new database, initialize the schema and seed data explicitly before
starting the application services:

```bash
pnpm docker:init
pnpm docker:up
```

The initializer is safe to run against an existing database, but it is
intentionally opt-in so normal restarts do not regenerate or reload seed data.

For an already initialized database, start the application directly:

```bash
pnpm docker:up
```

To check the service state:

```bash
docker compose ps
```

The equivalent pnpm command is:

```bash
pnpm docker:up
```
