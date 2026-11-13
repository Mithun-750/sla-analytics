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

    @Query("SELECT t FROM Ticket t WHERE (:status IS NULL OR t.status = :status) "
            + "AND (:customerId IS NULL OR t.customer.id = :customerId) "
            + "AND (:agentId IS NULL OR t.assignedAgent.id = :agentId) "
            + "AND (:priority IS NULL OR t.priority = :priority) "
            + "AND (:search = '' OR LOWER(t.subject) LIKE LOWER(CONCAT('%', :search, '%')) "
            + "OR LOWER(t.ticketNumber) LIKE LOWER(CONCAT('%', :search, '%')) "
            + "OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Ticket> searchTickets(
            @Param("status") TicketStatus status,
            @Param("customerId") Integer customerId,
            @Param("agentId") Integer agentId,
            @Param("priority") TicketPriority priority,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.assignedAgent.id = :agentId")
    long countByAssignedAgentId(@Param("agentId") Integer agentId);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.assignedAgent.id = :agentId AND t.status = 'RESOLVED'")
    long countResolvedByAgentId(@Param("agentId") Integer agentId);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.assignedAgent.id = :agentId AND t.slaBreached = true")
    long countSlaBreachedByAgentId(@Param("agentId") Integer agentId);

    long countBySlaBreached(boolean slaBreached);

    long countByStatus(TicketStatus status);
}
