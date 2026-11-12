package king.kong.web;

import king.kong.model.Customer;
import king.kong.model.Skill;
import king.kong.model.Ticket;
import king.kong.model.TicketPriority;
import king.kong.model.Urgency;
import king.kong.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.Instant;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {
    private final TicketRepository ticketRepository;
    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    public TicketController(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<Ticket> create(@RequestBody CreateTicketRequest request) {
        if (request.ticketNumber == null || request.ticketNumber.trim().isEmpty()
                || request.subject == null || request.subject.trim().isEmpty()
                || request.customerId == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        Ticket ticket = new Ticket();
        ticket.setTicketNumber(request.ticketNumber);
        ticket.setSubject(request.subject);
        ticket.setDescription(request.description);
        ticket.setUrgency(request.urgency);
        ticket.setPriority(request.priority);
        ticket.setCustomer(entityManager.getReference(Customer.class, request.customerId));
        if (request.requiredSkillId != null) {
            ticket.setRequiredSkill(entityManager.getReference(Skill.class, request.requiredSkillId));
        }
        ticket.setCreatedAt(Instant.now());
        ticket.setUpdatedAt(Instant.now());
        return new ResponseEntity<>(ticketRepository.save(ticket), HttpStatus.CREATED);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public ResponseEntity<Ticket> get(@PathVariable Integer id) {
        Ticket ticket = ticketRepository.findById(id).orElse(null);
        return ticket == null
                ? new ResponseEntity<Ticket>(HttpStatus.NOT_FOUND)
                : new ResponseEntity<>(ticket, HttpStatus.OK);
    }

    public static class CreateTicketRequest {
        public String ticketNumber;
        public Integer customerId;
        public Integer requiredSkillId;
        public String subject;
        public String description;
        public Urgency urgency;
        public TicketPriority priority;
    }
}
