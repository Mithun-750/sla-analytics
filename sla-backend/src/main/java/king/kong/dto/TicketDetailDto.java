package king.kong.dto;

import java.time.Instant;
import java.util.List;

public class TicketDetailDto {
    private Integer id;
    private String ticketNumber;
    private String subject;
    private String description;
    private String status;
    private String priority;
    private String urgency;
    private boolean priorityOverridden;
    private String slaPolicyKey;
    private String slaPolicyVersion;
    private String calendarConfigVersion;
    private String slaClockStatus;
    private int slaConsumedSeconds;
    private Integer slaTargetSeconds;
    private Integer slaEscalationThresholdPct;
    private Instant slaLastStartedAt;
    private Instant slaDeadlineAt;
    private boolean slaBreached;
    private Integer riskScore;
    private String riskLevel;
    private int reopenedCount;
    private int reassignmentCount;
    private Instant firstAssignedAt;
    private Instant resolvedAt;
    private Instant createdAt;
    private Instant updatedAt;
    private Integer customerId;
    private String customerName;
    private Integer assignedAgentId;
    private String assignedAgentUsername;
    private Integer requiredSkillId;
    private String requiredSkillName;
    private List<TicketEventDto> recentEvents;
    private List<TicketAssignmentDto> assignments;
    private TicketPauseDto activePause;
    private TicketEscalationDto activeEscalation;

    public TicketDetailDto() {
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

    public boolean isPriorityOverridden() {
        return priorityOverridden;
    }

    public void setPriorityOverridden(boolean priorityOverridden) {
        this.priorityOverridden = priorityOverridden;
    }

    public String getSlaPolicyKey() {
        return slaPolicyKey;
    }

    public void setSlaPolicyKey(String slaPolicyKey) {
        this.slaPolicyKey = slaPolicyKey;
    }

    public String getSlaPolicyVersion() {
        return slaPolicyVersion;
    }

    public void setSlaPolicyVersion(String slaPolicyVersion) {
        this.slaPolicyVersion = slaPolicyVersion;
    }

    public String getCalendarConfigVersion() {
        return calendarConfigVersion;
    }

    public void setCalendarConfigVersion(String calendarConfigVersion) {
        this.calendarConfigVersion = calendarConfigVersion;
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

    public Integer getSlaEscalationThresholdPct() {
        return slaEscalationThresholdPct;
    }

    public void setSlaEscalationThresholdPct(Integer slaEscalationThresholdPct) {
        this.slaEscalationThresholdPct = slaEscalationThresholdPct;
    }

    public Instant getSlaLastStartedAt() {
        return slaLastStartedAt;
    }

    public void setSlaLastStartedAt(Instant slaLastStartedAt) {
        this.slaLastStartedAt = slaLastStartedAt;
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

    public Integer getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(Integer riskScore) {
        this.riskScore = riskScore;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public int getReopenedCount() {
        return reopenedCount;
    }

    public void setReopenedCount(int reopenedCount) {
        this.reopenedCount = reopenedCount;
    }

    public int getReassignmentCount() {
        return reassignmentCount;
    }

    public void setReassignmentCount(int reassignmentCount) {
        this.reassignmentCount = reassignmentCount;
    }

    public Instant getFirstAssignedAt() {
        return firstAssignedAt;
    }

    public void setFirstAssignedAt(Instant firstAssignedAt) {
        this.firstAssignedAt = firstAssignedAt;
    }

    public Instant getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(Instant resolvedAt) {
        this.resolvedAt = resolvedAt;
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

    public Integer getRequiredSkillId() {
        return requiredSkillId;
    }

    public void setRequiredSkillId(Integer requiredSkillId) {
        this.requiredSkillId = requiredSkillId;
    }

    public Integer getSkillId() {
        return requiredSkillId;
    }

    public void setSkillId(Integer skillId) {
        this.requiredSkillId = skillId;
    }

    public String getRequiredSkillName() {
        return requiredSkillName;
    }

    public void setRequiredSkillName(String requiredSkillName) {
        this.requiredSkillName = requiredSkillName;
    }

    public String getSkillName() {
        return requiredSkillName;
    }

    public void setSkillName(String skillName) {
        this.requiredSkillName = skillName;
    }

    public List<TicketEventDto> getRecentEvents() {
        return recentEvents;
    }

    public void setRecentEvents(List<TicketEventDto> recentEvents) {
        this.recentEvents = recentEvents;
    }

    public List<TicketEventDto> getEvents() {
        return recentEvents;
    }

    public void setEvents(List<TicketEventDto> events) {
        this.recentEvents = events;
    }

    public List<TicketAssignmentDto> getAssignments() {
        return assignments;
    }

    public void setAssignments(List<TicketAssignmentDto> assignments) {
        this.assignments = assignments;
    }

    public TicketPauseDto getActivePause() {
        return activePause;
    }

    public void setActivePause(TicketPauseDto activePause) {
        this.activePause = activePause;
    }

    public TicketEscalationDto getActiveEscalation() {
        return activeEscalation;
    }

    public void setActiveEscalation(TicketEscalationDto activeEscalation) {
        this.activeEscalation = activeEscalation;
    }
}
