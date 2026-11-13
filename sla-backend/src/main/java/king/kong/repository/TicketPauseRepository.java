package king.kong.repository;

import king.kong.model.PauseDecisionStatus;
import king.kong.model.TicketPause;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TicketPauseRepository extends JpaRepository<TicketPause, Integer> {

    List<TicketPause> findByTicketId(Integer ticketId);

    @Query("SELECT p FROM TicketPause p WHERE (:status IS NULL OR p.decisionStatus = :status) "
            + "AND (:search = '' OR LOWER(p.attemptedReason) LIKE LOWER(CONCAT('%', :search, '%')) "
            + "OR LOWER(p.remarks) LIKE LOWER(CONCAT('%', :search, '%')) "
            + "OR LOWER(p.ticket.ticketNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<TicketPause> searchPauses(
            @Param("status") PauseDecisionStatus status,
            @Param("search") String search,
            Pageable pageable);

    long countByDecisionStatus(PauseDecisionStatus decisionStatus);
}
