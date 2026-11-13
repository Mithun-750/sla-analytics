package king.kong.repository;

import king.kong.model.Ticket;
import king.kong.model.TicketPriority;
import king.kong.model.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TicketRepository extends JpaRepository<Ticket, Integer> {

    Page<Ticket> findByCustomerId(Integer customerId, Pageable pageable);

    Page<Ticket> findByAssignedAgentId(Integer agentId, Pageable pageable);

    Page<Ticket> findByStatus(TicketStatus status, Pageable pageable);

    Page<Ticket> findByStatusAndCustomerId(TicketStatus status, Integer customerId, Pageable pageable);

    Page<Ticket> findByStatusAndAssignedAgentId(TicketStatus status, Integer agentId, Pageable pageable);

    Page<Ticket> findByStatusAndPriority(TicketStatus status, TicketPriority priority, Pageable pageable);

    Page<Ticket> findByCustomerIdAndAssignedAgentId(Integer customerId, Integer agentId, Pageable pageable);

    Page<Ticket> findByPriority(TicketPriority priority, Pageable pageable);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.assignedAgent.id = :agentId")
    long countByAssignedAgentId(@Param("agentId") Integer agentId);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.assignedAgent.id = :agentId AND t.status = 'RESOLVED'")
    long countResolvedByAgentId(@Param("agentId") Integer agentId);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.assignedAgent.id = :agentId AND t.slaBreached = true")
    long countSlaBreachedByAgentId(@Param("agentId") Integer agentId);

    long countBySlaBreached(boolean slaBreached);

    long countByStatus(TicketStatus status);
}
