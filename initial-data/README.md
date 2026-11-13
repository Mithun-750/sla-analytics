# SLA dummy data generator

Generates deterministic CSV seed data matching the application's JPA entities.
The output includes customers, users, skills, tickets, assignments, pauses,
escalations, and ticket event timelines.

```bash
cd initial-data
uv run --no-project python generate.py --output ../data/generated
```

From the repository root, the recommended command is:

```bash
pnpm data:generate
```

The normal seed generates 5,000 tickets. Use `pnpm data:load-temp` when you
want a smaller 30-ticket batch for quick local testing.

CSV files are written to `data/generated/`, which is ignored as generated
output. The generated data intentionally includes:

- open, in-progress, pending, resolved, and closed tickets;
- SLA breaches and risk levels;
- reassigned tickets with assignment history;
- approved, rejected, and resumed SLA pauses;
- open, claimed, and resolved escalations;
- event histories for ticket state transitions.

Load the generated CSV files into PostgreSQL with:

```bash
uv run --project initial-data python initial-data/load.py
```

The loader applies `scripts/schema.sql` before inserting rows and keeps the
entire load in one transaction.

Generate and load a fresh smaller batch with:

```bash
pnpm data:load-temp
```

This clears `data/temp/`, generates 6 users, 3 customers, 3 skills, and 30
tickets, then loads them using the next ID range recorded in
`data/temp-state.json`. Temporary batches use IDs starting at 10,000 so they
do not conflict with the normal 5,000-ticket seed. Repeating the command
creates another non-conflicting batch.