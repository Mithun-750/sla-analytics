package king.kong.dto;

import java.time.Instant;

public class TicketEscalationDto {
    private Integer id;
    private Integer ticketId;
    private String ticketNumber;
    private Integer createdById;
    private String createdByUsername;
    private Integer ownerSupervisorId;
    private String ownerSupervisorUsername;
    private Integer assignedAgentId;
    private String assignedAgentUsername;
    private String reason;
    private String description;
    private String status;
    private Instant createdAt;
    private Instant claimedAt;
    private Instant resolvedAt;
    private String resolutionNotes;

    public TicketEscalationDto() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getTicketId() {
        return ticketId;
    }

    public void setTicketId(Integer ticketId) {
        this.ticketId = ticketId;
    }

    public String getTicketNumber() {
        return ticketNumber;
    }

    public void setTicketNumber(String ticketNumber) {
        this.ticketNumber = ticketNumber;
    }

    public Integer getCreatedById() {
        return createdById;
    }

    public void setCreatedById(Integer createdById) {
        this.createdById = createdById;
    }

    public String getCreatedByUsername() {
        return createdByUsername;
    }

    public void setCreatedByUsername(String createdByUsername) {
        this.createdByUsername = createdByUsername;
    }

    public Integer getOwnerSupervisorId() {
        return ownerSupervisorId;
    }

    public void setOwnerSupervisorId(Integer ownerSupervisorId) {
        this.ownerSupervisorId = ownerSupervisorId;
    }

    public String getOwnerSupervisorUsername() {
        return ownerSupervisorUsername;
    }

    public void setOwnerSupervisorUsername(String ownerSupervisorUsername) {
        this.ownerSupervisorUsername = ownerSupervisorUsername;
    }

    public Integer getAssignedAgentId() {
        return assignedAgentId;
    }

    public void setAssignedAgentId(Integer assignedAgentId) {
        this.assignedAgentId = assignedAgentId;
    }

    public String getAssignedAgentUsername() {
        return assignedAgentUsername;
    }

    public void setAssignedAgentUsername(String assignedAgentUsername) {
        this.assignedAgentUsername = assignedAgentUsername;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getClaimedAt() {
        return claimedAt;
    }

    public void setClaimedAt(Instant claimedAt) {
        this.claimedAt = claimedAt;
    }

    public Instant getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(Instant resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public String getResolutionNote() {
        return resolutionNotes;
    }

    public void setResolutionNote(String resolutionNote) {
        this.resolutionNotes = resolutionNote;
    }

    public Integer getResolvedById() {
        return ownerSupervisorId;
    }

    public String getResolvedByUsername() {
        return ownerSupervisorUsername;
    }

    public Instant getUpdatedAt() {
        if (resolvedAt != null) {
            return resolvedAt;
        }
        if (claimedAt != null) {
            return claimedAt;
        }
        return createdAt;
    }
}
