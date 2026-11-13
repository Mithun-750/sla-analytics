package king.kong.repository;

import king.kong.model.EscalationStatus;
import king.kong.model.TicketEscalation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketEscalationRepository extends JpaRepository<TicketEscalation, Integer> {

    List<TicketEscalation> findByTicketId(Integer ticketId);

    Page<TicketEscalation> findByStatus(EscalationStatus status, Pageable pageable);

    Page<TicketEscalation> findByOwnerSupervisorId(Integer supervisorId, Pageable pageable);

    long countByStatus(EscalationStatus status);
}
