package king.kong.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "tickets")
@Data
@NoArgsConstructor
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name = "ticket_number", nullable = false, unique = true)
    private String ticketNumber;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id")
    private Customer customer;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_agent_id")
    private User assignedAgent;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "required_skill_id")
    private Skill requiredSkill;
    private String slaPolicyKey;
    private String slaPolicyVersion;
    private String calendarConfigVersion;
    @Column(nullable = false)
    private String subject;
    @Column(columnDefinition = "text")
    private String description;
    @Enumerated(EnumType.STRING)
    private Urgency urgency;
    @Enumerated(EnumType.STRING)
    private TicketPriority priority;
    @Column(name = "is_priority_overridden")
    private boolean priorityOverridden;
    @Enumerated(EnumType.STRING)
    private TicketStatus status = TicketStatus.OPEN;
    @Enumerated(EnumType.STRING)
    @Column(name = "sla_clock_status")
    private SlaClockStatus slaClockStatus = SlaClockStatus.RUNNING;
    private Integer slaTargetSeconds;
    private Integer slaEscalationThresholdPct;
    private int slaConsumedSeconds;
    private Instant slaLastStartedAt;
    private Instant slaDeadlineAt;
    private boolean slaBreached;
    private Integer riskScore;
    @Enumerated(EnumType.STRING)
    private RiskLevel riskLevel;
    private int reopenedCount;
    private int reassignmentCount;
    private Instant firstAssignedAt;
    private Instant resolvedAt;
    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void touch() {
        updatedAt = Instant.now();
    }
}
