# SLA Analysis

Spring Boot SLA application with PostgreSQL and deterministic seed data.

## Setup

Requirements: Docker, pnpm, Maven, and uv.

```bash
pnpm db:up
pnpm data:load
```

The application starts with the generated data in `data/generated/`.

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
pnpm data:load      # Generate and import data
pnpm data:drop      # Remove rows and keep the schema
pnpm db:reset       # Delete and recreate PostgreSQL
pnpm db:outbox      # Install or refresh PostgreSQL outbox triggers
pnpm db:outbox:backfill # Queue existing rows for one-time publication
pnpm start          # Start the backend and outbox worker together
pnpm test           # Run tests
pnpm build          # Build the application
pnpm etl:sync       # Install ETL dependencies
pnpm etl:run        # Run the legacy full-table export
```

The outbox worker publishes to S3. Configure the database, AWS, and worker
settings in the root `.env` file.
