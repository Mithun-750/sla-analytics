package king.kong.repository;

import king.kong.model.TicketAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketAssignmentRepository extends JpaRepository<TicketAssignment, Integer> {

    List<TicketAssignment> findByTicketId(Integer ticketId);
}

