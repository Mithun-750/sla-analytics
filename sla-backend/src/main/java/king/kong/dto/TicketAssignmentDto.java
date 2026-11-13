package king.kong.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TicketAssignmentDto {
    private Integer id;
    private Integer ticketId;
    private String ticketNumber;
    private Integer agentId;
    private String agentUsername;
    private Integer assignedById;
    private String assignedByUsername;
    private String assignmentType;
    private BigDecimal routingScore;
    private String routingFactors;
    private LocalDateTime assignedAt;
    private LocalDateTime endedAt;
    private Integer assignmentDurationBusinessSeconds;

    public TicketAssignmentDto() {
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

    public Integer getAgentId() {
        return agentId;
    }

    public void setAgentId(Integer agentId) {
        this.agentId = agentId;
    }

    public String getAgentUsername() {
        return agentUsername;
    }

    public void setAgentUsername(String agentUsername) {
        this.agentUsername = agentUsername;
    }

    public Integer getAssignedById() {
        return assignedById;
    }

    public void setAssignedById(Integer assignedById) {
        this.assignedById = assignedById;
    }

    public String getAssignedByUsername() {
        return assignedByUsername;
    }

    public void setAssignedByUsername(String assignedByUsername) {
        this.assignedByUsername = assignedByUsername;
    }

    public String getAssignmentType() {
        return assignmentType;
    }

    public void setAssignmentType(String assignmentType) {
        this.assignmentType = assignmentType;
    }

    public BigDecimal getRoutingScore() {
        return routingScore;
    }

    public void setRoutingScore(BigDecimal routingScore) {
        this.routingScore = routingScore;
    }

    public String getRoutingFactors() {
        return routingFactors;
    }

    public void setRoutingFactors(String routingFactors) {
        this.routingFactors = routingFactors;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    public LocalDateTime getEndedAt() {
        return endedAt;
    }

    public void setEndedAt(LocalDateTime endedAt) {
        this.endedAt = endedAt;
    }

    public LocalDateTime getUnassignedAt() {
        return endedAt;
    }

    public void setUnassignedAt(LocalDateTime unassignedAt) {
        this.endedAt = unassignedAt;
    }

    public Integer getAssignmentDurationBusinessSeconds() {
        return assignmentDurationBusinessSeconds;
    }

    public void setAssignmentDurationBusinessSeconds(Integer assignmentDurationBusinessSeconds) {
        this.assignmentDurationBusinessSeconds = assignmentDurationBusinessSeconds;
    }
}
