package king.kong.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ticket_events")
@Data
@NoArgsConstructor
public class TicketEvent {
    @Id
    @GeneratedValue
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ticket_id")
    private Ticket ticket;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private User actor;
    private String actorType;
    private String eventType;
    private int eventVersion;
    private String fromState;
    private String toState;
    private Integer slaConsumedSecondsSnapshot;
    private Integer riskScoreSnapshot;
    @Column(columnDefinition = "jsonb")
    private String metadata;
    private Instant createdAt = Instant.now();
}
