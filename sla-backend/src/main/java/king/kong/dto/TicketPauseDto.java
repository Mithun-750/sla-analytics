package king.kong.dto;

import java.time.Instant;

public class TicketPauseDto {
    private Integer id;
    private Integer ticketId;
    private String ticketNumber;
    private Integer initiatedById;
    private String initiatedByUsername;
    private String attemptedReason;
    private String decisionStatus;
    private Integer approvedById;
    private String approvedByUsername;
    private String remarks;
    private Instant requestedAt;
    private Instant pausedAt;
    private Instant resumedAt;
    private Integer pausedDurationBusinessSeconds;

    public TicketPauseDto() {
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

    public Integer getInitiatedById() {
        return initiatedById;
    }

    public void setInitiatedById(Integer initiatedById) {
        this.initiatedById = initiatedById;
    }

    public String getInitiatedByUsername() {
        return initiatedByUsername;
    }

    public void setInitiatedByUsername(String initiatedByUsername) {
        this.initiatedByUsername = initiatedByUsername;
    }

    public String getAttemptedReason() {
        return attemptedReason;
    }

    public void setAttemptedReason(String attemptedReason) {
        this.attemptedReason = attemptedReason;
    }

    public String getReason() {
        return attemptedReason;
    }

    public void setReason(String reason) {
        this.attemptedReason = reason;
    }

    public Integer getRequestedById() {
        return initiatedById;
    }

    public void setRequestedById(Integer requestedById) {
        this.initiatedById = requestedById;
    }

    public String getRequestedByUsername() {
        return initiatedByUsername;
    }

    public void setRequestedByUsername(String requestedByUsername) {
        this.initiatedByUsername = requestedByUsername;
    }

    public String getDecisionStatus() {
        return decisionStatus;
    }

    public void setDecisionStatus(String decisionStatus) {
        this.decisionStatus = decisionStatus;
    }

    public Integer getApprovedById() {
        return approvedById;
    }

    public void setApprovedById(Integer approvedById) {
        this.approvedById = approvedById;
    }

    public String getApprovedByUsername() {
        return approvedByUsername;
    }

    public void setApprovedByUsername(String approvedByUsername) {
        this.approvedByUsername = approvedByUsername;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public Instant getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(Instant requestedAt) {
        this.requestedAt = requestedAt;
    }

    public Instant getPausedAt() {
        return pausedAt;
    }

    public void setPausedAt(Instant pausedAt) {
        this.pausedAt = pausedAt;
    }

    public Instant getApprovedAt() {
        return pausedAt;
    }

    public Instant getPauseStartedAt() {
        return pausedAt;
    }

    public Instant getResumedAt() {
        return resumedAt;
    }

    public void setResumedAt(Instant resumedAt) {
        this.resumedAt = resumedAt;
    }

    public Instant getPauseEndedAt() {
        return resumedAt;
    }

    public Integer getPausedDurationBusinessSeconds() {
        return pausedDurationBusinessSeconds;
    }

    public void setPausedDurationBusinessSeconds(Integer pausedDurationBusinessSeconds) {
        this.pausedDurationBusinessSeconds = pausedDurationBusinessSeconds;
    }
}
