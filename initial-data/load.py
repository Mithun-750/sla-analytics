"""Load generated SLA CSV data into PostgreSQL."""

from __future__ import annotations

import argparse
import csv
import os
from pathlib import Path

import psycopg
from dotenv import load_dotenv


ROOT = Path(__file__).resolve().parents[1]
SCHEMA = ROOT / "scripts" / "schema.sql"
IDENTITY_TABLES = (
    "users",
    "customers",
    "skills",
    "tickets",
    "ticket_assignments",
    "ticket_pauses",
    "ticket_escalations",
)


def connection() -> psycopg.Connection:
    load_dotenv(ROOT / ".env")
    return psycopg.connect(
        os.getenv("SOURCE_DB_URL", "postgresql://localhost:5432/sla"),
        user=os.getenv("SOURCE_DB_USERNAME", "postgres"),
        password=os.getenv("SOURCE_DB_PASSWORD", "postgres"),
    )


def value(row: dict[str, str], column: str) -> str | None:
    raw = row[column]
    return raw or None


def integer(row: dict[str, str], column: str) -> int | None:
    raw = value(row, column)
    return int(raw) if raw is not None else None


def boolean(row: dict[str, str], column: str) -> bool | None:
    raw = value(row, column)
    return raw.lower() == "true" if raw is not None else None


def rows(directory: Path, filename: str):
    file = directory / filename
    if not file.is_file():
        raise FileNotFoundError(f"Missing seed data file: {file}")
    with file.open(newline="", encoding="utf-8") as source:
        yield from csv.DictReader(source)


def load_users(cursor, directory: Path) -> None:
    for row in rows(directory, "users.csv"):
        cursor.execute(
            """
            INSERT INTO users
                (id, username, role, is_available, max_concurrent_tickets, created_at)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING
            """,
            (
                integer(row, "id"), value(row, "username"), value(row, "role"),
                boolean(row, "is_available"), integer(row, "max_concurrent_tickets"),
                value(row, "created_at"),
            ),
        )


def load_simple(cursor, directory: Path, table: str, columns: tuple[str, ...]) -> None:
    placeholders = ", ".join(["%s"] * len(columns))
    names = ", ".join(columns)
    query = f"""
        INSERT INTO {table} ({names}) VALUES ({placeholders})
        ON CONFLICT DO NOTHING
    """
    for row in rows(directory, f"{table}.csv"):
        cursor.execute(query, tuple(value(row, column) for column in columns))


def load_user_skills(cursor, directory: Path) -> None:
    for row in rows(directory, "user_skills.csv"):
        cursor.execute(
            """
            INSERT INTO user_skills (user_id, skill_id, proficiency_level)
            VALUES (%s, %s, %s)
            ON CONFLICT DO NOTHING
            """,
            (integer(row, "user_id"), integer(row, "skill_id"),
             integer(row, "proficiency_level")),
        )


def load_tickets(cursor, directory: Path) -> None:
    columns = (
        "id", "ticket_number", "customer_id", "assigned_agent_id", "required_skill_id",
        "sla_policy_key", "sla_policy_version", "calendar_config_version", "subject",
        "description", "urgency", "priority", "is_priority_overridden", "status",
        "sla_clock_status", "sla_target_seconds", "sla_escalation_threshold_pct",
        "sla_consumed_seconds", "sla_last_started_at", "sla_deadline_at", "sla_breached",
        "risk_score", "risk_level", "reopened_count", "reassignment_count",
        "first_assigned_at", "resolved_at", "created_at", "updated_at",
    )
    for row in rows(directory, "tickets.csv"):
        values = []
        for column in columns:
            if column in {"id", "customer_id", "assigned_agent_id", "required_skill_id",
                          "sla_target_seconds", "sla_escalation_threshold_pct",
                          "sla_consumed_seconds", "risk_score", "reopened_count",
                          "reassignment_count"}:
                values.append(integer(row, column))
            elif column in {"is_priority_overridden", "sla_breached"}:
                values.append(boolean(row, column))
            else:
                values.append(value(row, column))
        cursor.execute(
            f"""
            INSERT INTO tickets ({", ".join(columns)})
            VALUES ({", ".join(["%s"] * len(columns))})
            ON CONFLICT DO NOTHING
            """,
            values,
        )


def load(directory: Path) -> None:
    with connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(SCHEMA.read_text(encoding="utf-8"))
            load_users(cursor, directory)
            load_simple(cursor, directory, "customers",
                        ("id", "name", "email", "tier", "created_at"))
            load_simple(cursor, directory, "skills", ("id", "name"))
            load_user_skills(cursor, directory)
            load_tickets(cursor, directory)
            load_simple(cursor, directory, "ticket_assignments",
                        ("id", "ticket_id", "agent_id", "assigned_by", "assignment_type",
                         "routing_score", "routing_factors", "assigned_at", "ended_at",
                         "assignment_duration_business_seconds"))
            load_simple(cursor, directory, "ticket_pauses",
                        ("id", "ticket_id", "initiated_by", "attempted_reason",
                         "decision_status", "approved_by", "remarks", "requested_at",
                         "paused_at", "resumed_at", "paused_duration_business_seconds"))
            load_simple(cursor, directory, "ticket_escalations",
                        ("id", "ticket_id", "created_by", "owner_supervisor_id",
                         "assigned_agent_id", "reason", "description", "status",
                         "created_at", "claimed_at", "resolved_at", "resolution_notes"))
            load_simple(cursor, directory, "ticket_events",
                        ("id", "ticket_id", "actor_id", "actor_type", "event_type",
                         "event_version", "from_state", "to_state",
                         "sla_consumed_seconds_snapshot", "risk_score_snapshot",
                         "metadata", "created_at"))
            for table in IDENTITY_TABLES:
                cursor.execute(
                    f"""
                    SELECT setval(pg_get_serial_sequence(%s, 'id'),
                        COALESCE((SELECT MAX(id) FROM {table}), 1), true)
                    """,
                    (table,),
                )
    print(f"Loaded seed data from {directory}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=ROOT / "data" / "generated")
    args = parser.parse_args()
    load(args.input)


if __name__ == "__main__":
    main()
