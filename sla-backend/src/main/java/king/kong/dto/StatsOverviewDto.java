package king.kong.dto;

import java.util.Map;

public class StatsOverviewDto {
    private Map<String, Long> countsByStatus;
    private long slaBreachedCount;
    private long totalTickets;
    private long openEscalationsCount;
    private long pendingPausesCount;

    // Direct counts for frontend convenience
    private long newCount;
    private long assignedCount;
    private long inProgressCount;
    private long pendingCustomerCount;
    private long escalatedCount;
    private long resolvedCount;
    private long closedCount;

    public StatsOverviewDto() {
    }

    public Map<String, Long> getCountsByStatus() {
        return countsByStatus;
    }

    public void setCountsByStatus(Map<String, Long> countsByStatus) {
        this.countsByStatus = countsByStatus;
    }

    public long getSlaBreachedCount() {
        return slaBreachedCount;
    }

    public void setSlaBreachedCount(long slaBreachedCount) {
        this.slaBreachedCount = slaBreachedCount;
    }

    public long getTotalTickets() {
        return totalTickets;
    }

    public void setTotalTickets(long totalTickets) {
        this.totalTickets = totalTickets;
    }

    public long getOpenEscalationsCount() {
        return openEscalationsCount;
    }

    public void setOpenEscalationsCount(long openEscalationsCount) {
        this.openEscalationsCount = openEscalationsCount;
    }

    public long getPendingPausesCount() {
        return pendingPausesCount;
    }

    public void setPendingPausesCount(long pendingPausesCount) {
        this.pendingPausesCount = pendingPausesCount;
    }

    public long getNewCount() {
        return newCount;
    }

    public void setNewCount(long newCount) {
        this.newCount = newCount;
    }

    public long getAssignedCount() {
        return assignedCount;
    }

    public void setAssignedCount(long assignedCount) {
        this.assignedCount = assignedCount;
    }

    public long getInProgressCount() {
        return inProgressCount;
    }

    public void setInProgressCount(long inProgressCount) {
        this.inProgressCount = inProgressCount;
    }

    public long getPendingCustomerCount() {
        return pendingCustomerCount;
    }

    public void setPendingCustomerCount(long pendingCustomerCount) {
        this.pendingCustomerCount = pendingCustomerCount;
    }

    public long getEscalatedCount() {
        return escalatedCount;
    }

    public void setEscalatedCount(long escalatedCount) {
        this.escalatedCount = escalatedCount;
    }

    public long getResolvedCount() {
        return resolvedCount;
    }

    public void setResolvedCount(long resolvedCount) {
        this.resolvedCount = resolvedCount;
    }

    public long getClosedCount() {
        return closedCount;
    }

    public void setClosedCount(long closedCount) {
        this.closedCount = closedCount;
    }
}
