TRUNCATE TABLE
    ticket_events,
    ticket_escalations,
    ticket_pauses,
    ticket_assignments,
    tickets,
    user_skills,
    skills,
    customers,
    users
RESTART IDENTITY CASCADE;
