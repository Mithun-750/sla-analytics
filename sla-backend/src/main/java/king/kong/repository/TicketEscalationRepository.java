package king.kong.repository;

import king.kong.model.EscalationStatus;
import king.kong.model.TicketEscalation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TicketEscalationRepository extends JpaRepository<TicketEscalation, Integer> {

    List<TicketEscalation> findByTicketId(Integer ticketId);

    @Query("SELECT e FROM TicketEscalation e WHERE (:status IS NULL OR e.status = :status) "
            + "AND (:supervisorId IS NULL OR e.ownerSupervisor.id = :supervisorId) "
            + "AND (:search = '' OR LOWER(e.reason) LIKE LOWER(CONCAT('%', :search, '%')) "
            + "OR LOWER(e.description) LIKE LOWER(CONCAT('%', :search, '%')) "
            + "OR LOWER(e.ticket.ticketNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<TicketEscalation> searchEscalations(
            @Param("status") EscalationStatus status,
            @Param("supervisorId") Integer supervisorId,
            @Param("search") String search,
            Pageable pageable);

    long countByStatus(EscalationStatus status);
}
