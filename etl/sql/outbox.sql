CREATE TABLE IF NOT EXISTS outbox_events (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    row_data JSONB NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    processed_at TIMESTAMPTZ,
    attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_error TEXT
);

CREATE INDEX IF NOT EXISTS outbox_events_pending_idx
    ON outbox_events (id)
    WHERE processed_at IS NULL;

CREATE OR REPLACE FUNCTION enqueue_outbox_event()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO outbox_events (table_name, operation, row_data)
    VALUES (
        TG_TABLE_NAME,
        TG_OP,
        CASE TG_OP
            WHEN 'DELETE' THEN to_jsonb(OLD)
            ELSE to_jsonb(NEW)
        END
    );

    RETURN CASE TG_OP
        WHEN 'DELETE' THEN OLD
        ELSE NEW
    END;
END;
$$;

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
                'DROP TRIGGER IF EXISTS %I ON %I',
                table_name || '_outbox_trigger',
                table_name
            );
            EXECUTE format(
                'CREATE TRIGGER %I
                 AFTER INSERT OR UPDATE OR DELETE ON %I
                 FOR EACH ROW EXECUTE FUNCTION enqueue_outbox_event()',
                table_name || '_outbox_trigger',
                table_name
            );
        END IF;
    END LOOP;
END;
$$;
