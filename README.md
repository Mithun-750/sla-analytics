# SLA Analysis

Spring Boot SLA application with PostgreSQL and deterministic seed data.

## Setup

Requirements: Docker, pnpm, Maven, and uv.

```bash
pnpm db:up
pnpm data:load
```

The application starts with the generated data in `data/generated/`.

## Commands

```bash
pnpm app:run        # Start the application
pnpm data:generate  # Generate CSV data
pnpm data:load      # Generate and import data
pnpm data:drop      # Remove rows and keep the schema
pnpm db:reset       # Delete and recreate PostgreSQL
pnpm test           # Run tests
pnpm build          # Build the application
pnpm etl:sync       # Install ETL dependencies
pnpm etl:run        # Load PostgreSQL into Snowflake
```

The ETL service requires Snowflake connection environment variables; see
`etl/README.md`.
