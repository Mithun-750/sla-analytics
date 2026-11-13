package king.kong.repository;

import king.kong.model.PauseDecisionStatus;
import king.kong.model.TicketPause;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketPauseRepository extends JpaRepository<TicketPause, Integer> {

    List<TicketPause> findByTicketId(Integer ticketId);

    Page<TicketPause> findByDecisionStatus(PauseDecisionStatus decisionStatus, Pageable pageable);

    long countByDecisionStatus(PauseDecisionStatus decisionStatus);
}
