package king.kong.dto;

import java.time.Instant;
import java.util.UUID;

public class TicketEventDto {
    private UUID id;
    private Integer ticketId;
    private Integer actorId;
    private String actorType;
    private String eventType;
    private String fromState;
    private String toState;
    private Integer slaConsumedSecondsSnapshot;
    private String metadata;
    private Instant createdAt;

    public TicketEventDto() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Integer getTicketId() {
        return ticketId;
    }

    public void setTicketId(Integer ticketId) {
        this.ticketId = ticketId;
    }

    public Integer getActorId() {
        return actorId;
    }

    public void setActorId(Integer actorId) {
        this.actorId = actorId;
    }

    public String getActorType() {
        return actorType;
    }

    public void setActorType(String actorType) {
        this.actorType = actorType;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getFromState() {
        return fromState;
    }

    public void setFromState(String fromState) {
        this.fromState = fromState;
    }

    public String getToState() {
        return toState;
    }

    public void setToState(String toState) {
        this.toState = toState;
    }

    public Integer getSlaConsumedSecondsSnapshot() {
        return slaConsumedSecondsSnapshot;
    }

    public void setSlaConsumedSecondsSnapshot(Integer slaConsumedSecondsSnapshot) {
        this.slaConsumedSecondsSnapshot = slaConsumedSecondsSnapshot;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

