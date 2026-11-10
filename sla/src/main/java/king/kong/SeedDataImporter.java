package king.kong;

import java.io.IOException;
import java.io.Reader;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * Imports the CSV files produced by initial-data/src/initial_data/generate.py.
 */
@Component
public class SeedDataImporter implements ApplicationRunner {
    private static final String DIRECTORY_OPTION = "seed-data-dir";
    private final JdbcTemplate jdbcTemplate;
    private final TransactionTemplate transactionTemplate;

    public SeedDataImporter(JdbcTemplate jdbcTemplate, TransactionTemplate transactionTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.transactionTemplate = transactionTemplate;
    }

    @Override
    public void run(ApplicationArguments arguments) {
        if (!arguments.containsOption(DIRECTORY_OPTION)) {
            return;
        }
        String directory = arguments.getOptionValues(DIRECTORY_OPTION).stream()
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "--seed-data-dir must specify a directory"));
        transactionTemplate.executeWithoutResult(status -> importDirectory(Path.of(directory)));
    }

    void importDirectory(Path directory) {
        if (!Files.isDirectory(directory)) {
            throw new IllegalArgumentException("Seed data directory does not exist: " + directory);
        }
        importUsers(directory.resolve("users.csv"));
        importCustomers(directory.resolve("customers.csv"));
        importSkills(directory.resolve("skills.csv"));
        importUserSkills(directory.resolve("user_skills.csv"));
        importTickets(directory.resolve("tickets.csv"));
        importAssignments(directory.resolve("ticket_assignments.csv"));
        importPauses(directory.resolve("ticket_pauses.csv"));
        importEscalations(directory.resolve("ticket_escalations.csv"));
        importEvents(directory.resolve("ticket_events.csv"));
        resetSequences();
    }

    private void importUsers(Path file) {
        forEachRecord(file, record -> jdbcTemplate.update("""
                INSERT INTO users (id, username, role, is_available, max_concurrent_tickets, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT (id) DO NOTHING
                """, integer(record, "id"), value(record, "username"), value(record, "role"),
                bool(record, "is_available"), integer(record, "max_concurrent_tickets"),
                instant(record, "created_at")));
    }

    private void importCustomers(Path file) {
        forEachRecord(file, record -> jdbcTemplate.update("""
                INSERT INTO customers (id, name, email, tier, created_at)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT (id) DO NOTHING
                """, integer(record, "id"), value(record, "name"), value(record, "email"),
                value(record, "tier"), instant(record, "created_at")));
    }

    private void importSkills(Path file) {
        forEachRecord(file, record -> jdbcTemplate.update("""
                INSERT INTO skills (id, name)
                VALUES (?, ?)
                ON CONFLICT (id) DO NOTHING
                """, integer(record, "id"), value(record, "name")));
    }

    private void importUserSkills(Path file) {
        forEachRecord(file, record -> jdbcTemplate.update("""
                INSERT INTO user_skills (user_id, skill_id, proficiency_level)
                VALUES (?, ?, ?)
                ON CONFLICT (user_id, skill_id) DO NOTHING
                """, integer(record, "user_id"), integer(record, "skill_id"),
                integer(record, "proficiency_level")));
    }

    private void importTickets(Path file) {
        forEachRecord(file, record -> jdbcTemplate.update("""
                INSERT INTO tickets (id, ticket_number, customer_id, assigned_agent_id,
                    required_skill_id, sla_policy_key, sla_policy_version, calendar_config_version,
                    subject, description, urgency, priority, is_priority_overridden, status,
                    sla_clock_status, sla_target_seconds, sla_escalation_threshold_pct,
                    sla_consumed_seconds, sla_last_started_at, sla_deadline_at, sla_breached,
                    risk_score, risk_level, reopened_count, reassignment_count, first_assigned_at,
                    resolved_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?)
                ON CONFLICT (id) DO NOTHING
                """, integer(record, "id"), value(record, "ticket_number"),
                integer(record, "customer_id"), integer(record, "assigned_agent_id"),
                integer(record, "required_skill_id"), value(record, "sla_policy_key"),
                value(record, "sla_policy_version"), value(record, "calendar_config_version"),
                value(record, "subject"), value(record, "description"), value(record, "urgency"),
                value(record, "priority"), bool(record, "is_priority_overridden"),
                value(record, "status"), value(record, "sla_clock_status"),
                integer(record, "sla_target_seconds"), integer(record, "sla_escalation_threshold_pct"),
                integer(record, "sla_consumed_seconds"), instant(record, "sla_last_started_at"),
                instant(record, "sla_deadline_at"), bool(record, "sla_breached"),
                integer(record, "risk_score"), value(record, "risk_level"),
                integer(record, "reopened_count"), integer(record, "reassignment_count"),
                instant(record, "first_assigned_at"), instant(record, "resolved_at"),
                instant(record, "created_at"), instant(record, "updated_at")));
    }

    private void importAssignments(Path file) {
        forEachRecord(file, record -> jdbcTemplate.update("""
                INSERT INTO ticket_assignments (id, ticket_id, agent_id, assigned_by,
                    assignment_type, routing_score, routing_factors, assigned_at, ended_at,
                    assignment_duration_business_seconds)
                VALUES (?, ?, ?, ?, ?, ?, ?::jsonb, ?, ?, ?)
                ON CONFLICT (id) DO NOTHING
                """, integer(record, "id"), integer(record, "ticket_id"),
                integer(record, "agent_id"), integer(record, "assigned_by"),
                value(record, "assignment_type"), decimal(record, "routing_score"),
                value(record, "routing_factors"), localDateTime(record, "assigned_at"),
                localDateTime(record, "ended_at"),
                integer(record, "assignment_duration_business_seconds")));
    }

    private void importPauses(Path file) {
        forEachRecord(file, record -> jdbcTemplate.update("""
                INSERT INTO ticket_pauses (id, ticket_id, initiated_by, attempted_reason,
                    decision_status, approved_by, remarks, requested_at, paused_at, resumed_at,
                    paused_duration_business_seconds)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (id) DO NOTHING
                """, integer(record, "id"), integer(record, "ticket_id"),
                integer(record, "initiated_by"), value(record, "attempted_reason"),
                value(record, "decision_status"), integer(record, "approved_by"),
                value(record, "remarks"), instant(record, "requested_at"),
                instant(record, "paused_at"), instant(record, "resumed_at"),
                integer(record, "paused_duration_business_seconds")));
    }

    private void importEscalations(Path file) {
        forEachRecord(file, record -> jdbcTemplate.update("""
                INSERT INTO ticket_escalations (id, ticket_id, created_by, owner_supervisor_id,
                    assigned_agent_id, reason, description, status, created_at, claimed_at,
                    resolved_at, resolution_notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (id) DO NOTHING
                """, integer(record, "id"), integer(record, "ticket_id"),
                integer(record, "created_by"), integer(record, "owner_supervisor_id"),
                integer(record, "assigned_agent_id"), value(record, "reason"),
                value(record, "description"), value(record, "status"),
                instant(record, "created_at"), instant(record, "claimed_at"),
                instant(record, "resolved_at"), value(record, "resolution_notes")));
    }

    private void importEvents(Path file) {
        forEachRecord(file, record -> jdbcTemplate.update("""
                INSERT INTO ticket_events (id, ticket_id, actor_id, actor_type, event_type,
                    event_version, from_state, to_state, sla_consumed_seconds_snapshot,
                    risk_score_snapshot, metadata, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?)
                ON CONFLICT (id) DO NOTHING
                """, UUID.fromString(value(record, "id")), integer(record, "ticket_id"),
                integer(record, "actor_id"), value(record, "actor_type"),
                value(record, "event_type"), integer(record, "event_version"),
                value(record, "from_state"), value(record, "to_state"),
                integer(record, "sla_consumed_seconds_snapshot"),
                integer(record, "risk_score_snapshot"), value(record, "metadata"),
                instant(record, "created_at")));
    }

    private void resetSequences() {
        for (String table : new String[] {"users", "customers", "skills", "tickets",
                "ticket_assignments", "ticket_pauses", "ticket_escalations"}) {
            jdbcTemplate.queryForObject("""
                    SELECT setval(pg_get_serial_sequence(?, 'id'),
                        COALESCE((SELECT MAX(id) FROM %s), 1), true)
                    """.formatted(table), Long.class, table);
        }
    }

    private void forEachRecord(Path file, RecordHandler handler) {
        if (!Files.isRegularFile(file)) {
            throw new IllegalArgumentException("Missing seed data file: " + file);
        }
        try (Reader reader = Files.newBufferedReader(file);
                CSVParser parser = CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true)
                        .setIgnoreEmptyLines(true).build().parse(reader)) {
            for (CSVRecord record : parser) {
                handler.accept(record);
            }
        } catch (IOException exception) {
            throw new IllegalStateException("Could not read seed data file: " + file, exception);
        }
    }

    private static String value(CSVRecord record, String column) {
        String value = record.get(column);
        return value.isBlank() ? null : value;
    }

    private static Integer integer(CSVRecord record, String column) {
        String value = value(record, column);
        return value == null ? null : Integer.valueOf(value);
    }

    private static Boolean bool(CSVRecord record, String column) {
        String value = value(record, column);
        return value == null ? null : Boolean.valueOf(value);
    }

    private static BigDecimal decimal(CSVRecord record, String column) {
        String value = value(record, column);
        return value == null ? null : new BigDecimal(value);
    }

    private static Timestamp instant(CSVRecord record, String column) {
        String value = value(record, column);
        return value == null ? null : Timestamp.from(Instant.parse(value));
    }

    private static LocalDateTime localDateTime(CSVRecord record, String column) {
        String value = value(record, column);
        return value == null ? null : LocalDateTime.ofInstant(Instant.parse(value),
                java.time.ZoneOffset.UTC);
    }

    @FunctionalInterface
    private interface RecordHandler {
        void accept(CSVRecord record);
    }
}
