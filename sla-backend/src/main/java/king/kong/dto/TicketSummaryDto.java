package king.kong.dto;

import java.time.Instant;

public class TicketSummaryDto {
    private Integer id;
    private String ticketNumber;
    private String subject;
    private String status;
    private String priority;
    private String urgency;
    private String slaClockStatus;
    private int slaConsumedSeconds;
    private Integer slaTargetSeconds;
    private Instant slaDeadlineAt;
    private boolean slaBreached;
    private String riskLevel;
    private Instant createdAt;
    private Instant updatedAt;
    private Integer customerId;
    private String customerName;
    private Integer assignedAgentId;
    private String assignedAgentUsername;

    public TicketSummaryDto() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTicketNumber() {
        return ticketNumber;
    }

    public void setTicketNumber(String ticketNumber) {
        this.ticketNumber = ticketNumber;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getUrgency() {
        return urgency;
    }

    public void setUrgency(String urgency) {
        this.urgency = urgency;
    }

    public String getSlaClockStatus() {
        return slaClockStatus;
    }

    public void setSlaClockStatus(String slaClockStatus) {
        this.slaClockStatus = slaClockStatus;
    }

    public int getSlaConsumedSeconds() {
        return slaConsumedSeconds;
    }

    public void setSlaConsumedSeconds(int slaConsumedSeconds) {
        this.slaConsumedSeconds = slaConsumedSeconds;
    }

    public Integer getSlaTargetSeconds() {
        return slaTargetSeconds;
    }

    public void setSlaTargetSeconds(Integer slaTargetSeconds) {
        this.slaTargetSeconds = slaTargetSeconds;
    }

    public Instant getSlaDeadlineAt() {
        return slaDeadlineAt;
    }

    public void setSlaDeadlineAt(Instant slaDeadlineAt) {
        this.slaDeadlineAt = slaDeadlineAt;
    }

    public boolean isSlaBreached() {
        return slaBreached;
    }

    public void setSlaBreached(boolean slaBreached) {
        this.slaBreached = slaBreached;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
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
}

