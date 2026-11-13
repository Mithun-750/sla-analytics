"""Generate deterministic CSV seed data for the SLA domain model."""

from __future__ import annotations

import argparse
import csv
import json
import random
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Iterable


SEED = 750
START = datetime(2026, 1, 5, 8, 0, tzinfo=timezone.utc)
ISO = "%Y-%m-%dT%H:%M:%SZ"
DEFAULT_TICKET_COUNT = 100

PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"]
URGENCIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
STATUSES = ["OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"]
SLA_SECONDS = {"LOW": 259200, "MEDIUM": 86400, "HIGH": 28800, "URGENT": 14400}


def assigned_agent_id(ticket_id: int, agent_count: int, id_offset: int = 0, attempt: int = 0) -> int:
    local_ticket_id = ticket_id - id_offset
    return id_offset + ((local_ticket_id - 1 + attempt) % agent_count) + 4


def timestamp(value: datetime | None) -> str:
    return value.strftime(ISO) if value else ""


def write_csv(path: Path, rows: Iterable[dict[str, object]]) -> int:
    materialized = list(rows)
    if not materialized:
        return 0
    with path.open("w", newline="", encoding="utf-8") as output:
        writer = csv.DictWriter(output, fieldnames=list(materialized[0]))
        writer.writeheader()
        writer.writerows(materialized)
    return len(materialized)


def build_users(count: int = 12, id_offset: int = 0, batch: int = 0) -> list[dict[str, object]]:
    names = [
        ("ava.morgan", "SUPERVISOR", True, 12),
        ("liam.chen", "SUPERVISOR", True, 10),
        ("nora.patel", "ADMIN", True, 20),
        ("oliver.ross", "AGENT", True, 8),
        ("mia.wilson", "AGENT", True, 8),
        ("ethan.kim", "AGENT", True, 6),
        ("sofia.garcia", "AGENT", True, 8),
        ("noah.johnson", "AGENT", False, 6),
        ("isla.thompson", "AGENT", True, 5),
        ("lucas.martin", "AGENT", True, 6),
        ("emily.davis", "AGENT", True, 7),
        ("mason.brown", "AGENT", True, 6),
    ]
    return [
        {
            "id": id_offset + index,
            "username": f"{username}.b{batch}" if batch else username,
            "role": role,
            "is_available": str(available).lower(),
            "max_concurrent_tickets": capacity,
            "created_at": timestamp(START - timedelta(days=400 - index * 11)),
        }
        for index, (username, role, available, capacity) in enumerate(names[:count], 1)
    ]


def build_tickets(
    rng: random.Random,
    customers: int,
    skills: int,
    users: int,
    count: int = 60,
    id_offset: int = 0,
    batch: int = 0,
) -> list[dict[str, object]]:
    subjects = [
        "Production API latency is above SLA",
        "Customer cannot access billing portal",
        "Webhook deliveries are failing",
        "Incorrect priority assigned by routing",
        "Scheduled report has not arrived",
        "Database connection pool is exhausted",
        "User provisioning request is blocked",
        "Intermittent payment timeout",
    ]
    rows = []
    agent_count = max(1, users - 3)
    for local_id in range(1, count + 1):
        ticket_id = id_offset + local_id
        created = START + timedelta(hours=ticket_id * 13 + rng.randint(0, 7))
        priority = rng.choices(PRIORITIES, weights=[18, 40, 30, 12])[0]
        urgency = rng.choices(URGENCIES, weights=[15, 40, 32, 13])[0]
        status = rng.choices(STATUSES, weights=[18, 28, 12, 27, 15])[0]
        if ticket_id in (7, 18, 42):
            status = "PENDING"
        if ticket_id in (9, 23, 37, 51):
            status = "CLOSED"
        breached = ticket_id % 7 in (0, 1)
        resolved = status in ("RESOLVED", "CLOSED")
        elapsed = SLA_SECONDS[priority] * (1.35 if breached else rng.uniform(0.2, 0.85))
        deadline = created + timedelta(seconds=SLA_SECONDS[priority])
        resolved_at = created + timedelta(seconds=elapsed) if resolved else None
        if status == "OPEN":
            clock = "RUNNING"
        elif status == "PENDING":
            clock = "PAUSED"
        else:
            clock = "STOPPED"
        reassignment_count = 2 if ticket_id in (12, 29, 44) else (
            1 if ticket_id % 5 == 0 else 0
        )
        rows.append(
            {
                "id": ticket_id,
                "ticket_number": f"SLA-{created.year}-{ticket_id:05d}-B{batch}" if batch else f"SLA-{created.year}-{ticket_id:05d}",
                "customer_id": id_offset + ((local_id - 1) % customers) + 1,
                "assigned_agent_id": assigned_agent_id(
                    ticket_id, agent_count, id_offset, reassignment_count
                ),
                "required_skill_id": id_offset + ((local_id - 1) % skills) + 1,
                "sla_policy_key": f"{priority.lower()}-standard",
                "sla_policy_version": "2026.1",
                "calendar_config_version": "business-hours-v2",
                "subject": subjects[(ticket_id - 1) % len(subjects)],
                "description": (
                    "Synthetic case for SLA analytics with "
                    f"{'a recorded breach' if breached else 'healthy elapsed time'}."
                ),
                "urgency": urgency,
                "priority": priority,
                "is_priority_overridden": str(ticket_id % 11 == 0).lower(),
                "status": status,
                "sla_clock_status": clock,
                "sla_target_seconds": SLA_SECONDS[priority],
                "sla_escalation_threshold_pct": 80,
                "sla_consumed_seconds": int(min(elapsed, SLA_SECONDS[priority] * 1.5)),
                "sla_last_started_at": timestamp(created + timedelta(minutes=15)),
                "sla_deadline_at": timestamp(deadline),
                "sla_breached": str(breached).lower(),
                "risk_score": min(99, 25 + (35 if breached else 0) + ticket_id % 30),
                "risk_level": "CRITICAL" if breached and priority == "URGENT" else (
                    "HIGH" if breached else "MEDIUM"
                ),
                "reopened_count": 1 if ticket_id in (14, 29, 46) else 0,
                "reassignment_count": reassignment_count,
                "first_assigned_at": timestamp(created + timedelta(minutes=18)),
                "resolved_at": timestamp(resolved_at),
                "created_at": timestamp(created),
                "updated_at": timestamp((resolved_at or created) + timedelta(minutes=5)),
            }
        )
    return rows


def build_events(tickets: list[dict[str, object]], users: int, id_offset: int = 0) -> list[dict[str, object]]:
    rows = []
    event_id = id_offset * 1000
    agent_count = max(1, users - 3)
    for ticket in tickets:
        ticket_id = int(ticket["id"])
        created = datetime.strptime(str(ticket["created_at"]), ISO).replace(tzinfo=timezone.utc)
        sequence = [("CREATED", "", "OPEN"), ("ASSIGNED", "OPEN", "IN_PROGRESS")]
        if ticket["status"] == "PENDING":
            sequence.append(("PAUSE_REQUESTED", "IN_PROGRESS", "PENDING"))
        if ticket["reassignment_count"]:
            sequence.append(("REASSIGNED", "IN_PROGRESS", "IN_PROGRESS"))
        if ticket["status"] in ("RESOLVED", "CLOSED"):
            sequence.append(("RESOLVED", "IN_PROGRESS", ticket["status"]))
        for version, (event_type, from_state, to_state) in enumerate(sequence, 1):
            event_id += 1
            rows.append(
                {
                    "id": f"00000000-0000-4000-8000-{event_id:012d}",
                    "ticket_id": ticket_id,
                    "actor_id": assigned_agent_id(ticket_id + version, agent_count, id_offset),
                    "actor_type": "SYSTEM" if event_type == "CREATED" else "USER",
                    "event_type": event_type,
                    "event_version": version,
                    "from_state": from_state,
                    "to_state": to_state,
                    "sla_consumed_seconds_snapshot": ticket["sla_consumed_seconds"],
                    "risk_score_snapshot": ticket["risk_score"],
                    "metadata": json.dumps({"source": "seed", "ticket": ticket["ticket_number"]}),
                    "created_at": timestamp(created + timedelta(minutes=version * 18)),
                }
            )
    return rows


def build_assignments(tickets: list[dict[str, object]], users: int, id_offset: int = 0) -> list[dict[str, object]]:
    rows = []
    assignment_id = id_offset
    agent_count = max(1, users - 3)
    for ticket in tickets:
        count = int(ticket["reassignment_count"]) + 1
        created = datetime.strptime(str(ticket["created_at"]), ISO).replace(tzinfo=timezone.utc)
        for attempt in range(count):
            assignment_id += 1
            assigned = created + timedelta(minutes=18 + attempt * 95)
            ended = assigned + timedelta(minutes=70) if attempt < count - 1 else None
            rows.append(
                {
                    "id": assignment_id,
                    "ticket_id": ticket["id"],
                    "agent_id": assigned_agent_id(
                        int(ticket["id"]), agent_count, id_offset, attempt
                    ),
                    "assigned_by": id_offset + (1 if attempt else 3),
                    "assignment_type": "REASSIGNMENT" if attempt else "ROUTED",
                    "routing_score": f"{0.61 + attempt * 0.08:.2f}",
                    "routing_factors": json.dumps({"skill_match": 0.9 - attempt * 0.1, "load": 0.4}),
                    "assigned_at": timestamp(assigned),
                    "ended_at": timestamp(ended),
                    "assignment_duration_business_seconds": (
                        int((ended - assigned).total_seconds()) if ended else ""
                    ),
                }
            )
    return rows


def build_pauses(tickets: list[dict[str, object]], id_offset: int = 0) -> list[dict[str, object]]:
    rows = []
    pause_id = id_offset
    for ticket in tickets:
        ticket_id = int(ticket["id"])
        if ticket_id % 6 not in (0, 1):
            continue
        pause_id += 1
        created = datetime.strptime(str(ticket["created_at"]), ISO).replace(tzinfo=timezone.utc)
        approved = ticket["status"] == "PENDING" or ticket_id % 2 == 0
        requested = created + timedelta(hours=5)
        paused = requested + timedelta(minutes=10) if approved else None
        resumed = paused + timedelta(hours=3) if paused and ticket["status"] != "PENDING" else None
        rows.append(
            {
                "id": pause_id,
                "ticket_id": ticket_id,
                "initiated_by": id_offset + ((ticket_id + 2) % 3) + 4,
                "attempted_reason": "Waiting for customer logs",
                "decision_status": "RESUMED" if resumed else ("APPROVED" if approved else "REJECTED"),
                "approved_by": id_offset + 1 if approved else "",
                "remarks": "Approved for customer-provided diagnostic information." if approved else "Insufficient evidence.",
                "requested_at": timestamp(requested),
                "paused_at": timestamp(paused),
                "resumed_at": timestamp(resumed),
                "paused_duration_business_seconds": 10800 if resumed else "",
            }
        )
    return rows


def build_escalations(tickets: list[dict[str, object]], id_offset: int = 0) -> list[dict[str, object]]:
    rows = []
    escalation_id = id_offset
    for ticket in tickets:
        ticket_id = int(ticket["id"])
        if ticket_id % 5 not in (0, 1):
            continue
        escalation_id += 1
        created = datetime.strptime(str(ticket["created_at"]), ISO).replace(tzinfo=timezone.utc)
        claimed = created + timedelta(hours=4) if ticket_id % 3 else None
        resolved = claimed + timedelta(hours=7) if claimed and ticket["status"] in ("RESOLVED", "CLOSED") else None
        rows.append(
            {
                "id": escalation_id,
                "ticket_id": ticket_id,
                "created_by": id_offset + (1 if ticket_id % 2 else 3),
                "owner_supervisor_id": id_offset + 1 if claimed else "",
                "assigned_agent_id": ticket["assigned_agent_id"],
                "reason": "SLA_BREACH" if ticket["sla_breached"] == "true" else "HIGH_RISK",
                "description": "Synthetic escalation for supervisor workflow validation.",
                "status": "RESOLVED" if resolved else ("CLAIMED" if claimed else "OPEN"),
                "created_at": timestamp(created + timedelta(hours=2)),
                "claimed_at": timestamp(claimed),
                "resolved_at": timestamp(resolved),
                "resolution_notes": "Priority adjusted and customer updated." if resolved else "",
            }
        )
    return rows


def generate(
    output: Path,
    *,
    user_count: int = 12,
    customer_count: int = 6,
    skill_count: int = 6,
    ticket_count: int = DEFAULT_TICKET_COUNT,
    id_offset: int = 0,
    batch: int = 0,
) -> None:
    rng = random.Random(SEED)
    output.mkdir(parents=True, exist_ok=True)
    users = build_users(user_count, id_offset, batch)
    skills = [{"id": id_offset + i, "name": f"{name} Batch {batch}" if batch else name}
              for i, name in enumerate(
        ["API", "Database", "Identity", "Payments", "Networking", "Reporting"], 1
    ) if i <= skill_count]
    customers = [
        {
            "id": id_offset + i,
            "name": f"{name} Batch {batch}" if batch else name,
            "email": f"{name.lower().replace(' ', '.')}+b{batch}@example.test" if batch else f"{name.lower().replace(' ', '.')}@example.test",
            "tier": tier,
            "created_at": timestamp(START - timedelta(days=500 - i * 17)),
        }
        for i, (name, tier) in enumerate(
            [("Northwind Retail", "ENTERPRISE"), ("Contoso Health", "PREMIUM"),
             ("Fabrikam Logistics", "STANDARD"), ("Adventure Works", "PREMIUM"),
             ("Tailspin Toys", "STANDARD"), ("Blue Yonder", "ENTERPRISE")], 1
        ) if i <= customer_count
    ]
    tickets = build_tickets(
        rng, len(customers), len(skills), len(users), ticket_count, id_offset, batch
    )
    user_skills = [
        {"user_id": user["id"], "skill_id": skill["id"], "proficiency_level": 3 + (int(user["id"]) + int(skill["id"])) % 3}
        for user in users[3:]
        for skill in skills
        if (int(user["id"]) + int(skill["id"])) % 2 == 0
    ]
    tables = {
        "users.csv": users,
        "customers.csv": customers,
        "skills.csv": skills,
        "user_skills.csv": user_skills,
        "tickets.csv": tickets,
        "ticket_assignments.csv": build_assignments(tickets, len(users), id_offset),
        "ticket_pauses.csv": build_pauses(tickets, id_offset),
        "ticket_escalations.csv": build_escalations(tickets, id_offset),
        "ticket_events.csv": build_events(tickets, len(users), id_offset),
    }
    counts = {name: write_csv(output / name, rows) for name, rows in tables.items()}
    print(f"Generated {sum(counts.values())} rows in {output}")
    for name, count in counts.items():
        print(f"  {name}: {count}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=Path("../data/generated"))
    parser.add_argument("--user-count", type=int, default=12)
    parser.add_argument("--customer-count", type=int, default=6)
    parser.add_argument("--skill-count", type=int, default=6)
    parser.add_argument("--ticket-count", type=int, default=DEFAULT_TICKET_COUNT)
    parser.add_argument("--id-offset", type=int, default=0)
    parser.add_argument("--batch", type=int, default=0)
    args = parser.parse_args()
    generate(
        args.output,
        user_count=args.user_count,
        customer_count=args.customer_count,
        skill_count=args.skill_count,
        ticket_count=args.ticket_count,
        id_offset=args.id_offset,
        batch=args.batch,
    )


if __name__ == "__main__":
    main()
