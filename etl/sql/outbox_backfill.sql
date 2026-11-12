-- Run once after outbox.sql when the existing rows also need to be published.
-- Do not rerun this script unless duplicate initial events are intentional.
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY ARRAY[
        'users',
        'customers',
        'skills',
        'user_skills',
        'tickets',
        'ticket_assignments',
        'ticket_pauses',
        'ticket_escalations',
        'ticket_events'
    ]
    LOOP
        IF to_regclass(format('%I', table_name)) IS NOT NULL THEN
            EXECUTE format(
                'INSERT INTO outbox_events (table_name, operation, row_data)
                 SELECT %L, ''INSERT'', to_jsonb(source_row)
                 FROM %I AS source_row',
                table_name,
                table_name
            );
        END IF;
    END LOOP;
END;
$$;
