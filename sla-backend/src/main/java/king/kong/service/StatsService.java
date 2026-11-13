package king.kong.service;

import king.kong.dto.AgentStatsDto;
import king.kong.dto.StatsOverviewDto;
import king.kong.model.EscalationStatus;
import king.kong.model.PauseDecisionStatus;
import king.kong.model.TicketStatus;
import king.kong.repository.TicketEscalationRepository;
import king.kong.repository.TicketPauseRepository;
import king.kong.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class StatsService {

    private final TicketRepository ticketRepository;
    private final TicketEscalationRepository ticketEscalationRepository;
    private final TicketPauseRepository ticketPauseRepository;

    public StatsService(TicketRepository ticketRepository,
                        TicketEscalationRepository ticketEscalationRepository,
                        TicketPauseRepository ticketPauseRepository) {
        this.ticketRepository = ticketRepository;
        this.ticketEscalationRepository = ticketEscalationRepository;
        this.ticketPauseRepository = ticketPauseRepository;
    }

    @Transactional(readOnly = true)
    public StatsOverviewDto getOverview() {
        StatsOverviewDto dto = new StatsOverviewDto();
        Map<String, Long> statusCounts = new HashMap<>();
        for (TicketStatus status : TicketStatus.values()) {
            long count = ticketRepository.countByStatus(status);
            statusCounts.put(status.name(), count);
        }
        dto.setCountsByStatus(statusCounts);
        dto.setTotalTickets(ticketRepository.count());
        dto.setSlaBreachedCount(ticketRepository.countBySlaBreached(true));
        dto.setOpenEscalationsCount(ticketEscalationRepository.countByStatus(EscalationStatus.OPEN));
        dto.setPendingPausesCount(ticketPauseRepository.countByDecisionStatus(PauseDecisionStatus.REQUESTED));

        long openCount = statusCounts.getOrDefault("OPEN", 0L);
        dto.setNewCount(openCount);
        dto.setAssignedCount(statusCounts.getOrDefault("IN_PROGRESS", 0L));
        dto.setInProgressCount(statusCounts.getOrDefault("IN_PROGRESS", 0L));
        dto.setPendingCustomerCount(statusCounts.getOrDefault("PENDING", 0L));
        dto.setResolvedCount(statusCounts.getOrDefault("RESOLVED", 0L));
        dto.setClosedCount(statusCounts.getOrDefault("CLOSED", 0L));

        return dto;
    }

    @Transactional(readOnly = true)
    public AgentStatsDto getAgentStats(Integer id) {
        AgentStatsDto dto = new AgentStatsDto();
        dto.setAgentId(id);
        dto.setAssignedCount(ticketRepository.countByAssignedAgentId(id));
        dto.setResolvedCount(ticketRepository.countResolvedByAgentId(id));
        dto.setSlaBreachedCount(ticketRepository.countSlaBreachedByAgentId(id));
        return dto;
    }
}
