# SLA dummy data generator

Generates deterministic CSV seed data matching the application's JPA entities.
The output includes customers, users, skills, tickets, assignments, pauses,
escalations, and ticket event timelines.

```bash
cd initial-data
python -m initial_data --output generated
```

The generated data intentionally includes:

- open, in-progress, pending, resolved, and closed tickets;
- SLA breaches and risk levels;
- reassigned tickets with assignment history;
- approved, rejected, and resumed SLA pauses;
- open, claimed, and resolved escalations;
- event histories for ticket state transitions.

CSV files are written to `generated/`, which is ignored as generated output.