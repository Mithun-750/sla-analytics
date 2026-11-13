package king.kong.service;

import king.kong.dto.PagedResponse;
import king.kong.dto.TicketAssignmentDto;
import king.kong.dto.TicketDetailDto;
import king.kong.dto.TicketEscalationDto;
import king.kong.dto.TicketEventDto;
import king.kong.dto.TicketPauseDto;
import king.kong.dto.TicketSummaryDto;
import king.kong.model.Customer;
import king.kong.model.Skill;
import king.kong.model.Ticket;
import king.kong.model.TicketAssignment;
import king.kong.model.TicketEscalation;
import king.kong.model.TicketEvent;
import king.kong.model.TicketPause;
import king.kong.model.TicketPriority;
import king.kong.model.TicketStatus;
import king.kong.model.Urgency;
import king.kong.model.User;
import king.kong.repository.CustomerRepository;
import king.kong.repository.SkillRepository;
import king.kong.repository.TicketAssignmentRepository;
import king.kong.repository.TicketEscalationRepository;
import king.kong.repository.TicketEventRepository;
import king.kong.repository.TicketPauseRepository;
import king.kong.repository.TicketRepository;
import king.kong.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final TicketEventRepository ticketEventRepository;
    private final TicketAssignmentRepository ticketAssignmentRepository;
    private final TicketEscalationRepository ticketEscalationRepository;
    private final TicketPauseRepository ticketPauseRepository;

    public TicketService(TicketRepository ticketRepository,
                         CustomerRepository customerRepository,
                         UserRepository userRepository,
                         SkillRepository skillRepository,
                         TicketEventRepository ticketEventRepository,
                         TicketAssignmentRepository ticketAssignmentRepository,
                         TicketEscalationRepository ticketEscalationRepository,
                         TicketPauseRepository ticketPauseRepository) {
        this.ticketRepository = ticketRepository;
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
        this.ticketEventRepository = ticketEventRepository;
        this.ticketAssignmentRepository = ticketAssignmentRepository;
        this.ticketEscalationRepository = ticketEscalationRepository;
        this.ticketPauseRepository = ticketPauseRepository;
    }

    @Transactional(readOnly = true)
    public PagedResponse<TicketSummaryDto> getTickets(String search, String status, Integer customerId,
                                                       Integer agentId, String priority,
                                                       Pageable pageable) {
        TicketStatus ts = (status != null && !status.isBlank())
                ? TicketStatus.valueOf(status.toUpperCase()) : null;
        TicketPriority tp = (priority != null && !priority.isBlank())
                ? TicketPriority.valueOf(priority.toUpperCase()) : null;
        String s = (search != null && !search.isBlank()) ? search.trim() : "";

        Page<Ticket> result = ticketRepository.searchTickets(ts, customerId, agentId, tp, s, pageable);

        List<TicketSummaryDto> dtos = result.getContent().stream()
                .map(this::toSummaryDto).collect(Collectors.toList());
        return new PagedResponse<>(dtos, pageable.getPageNumber(), pageable.getPageSize(),
                result.getTotalElements(), result.getTotalPages());
    }

    @Transactional(readOnly = true)
    public TicketDetailDto getById(Integer id) {
        Ticket t = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + id));
        return toDetailDto(t);
    }

    @Transactional
    public TicketSummaryDto createTicket(Integer customerId, String subject, String description,
                                         String urgency, String priority, Integer skillId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + customerId));

        Ticket ticket = new Ticket();
        ticket.setTicketNumber("TKT-" + System.currentTimeMillis());
        ticket.setCustomer(customer);
        ticket.setSubject(subject);
        ticket.setDescription(description);
        ticket.setStatus(TicketStatus.OPEN);
        if (urgency != null && !urgency.isBlank()) {
            ticket.setUrgency(Urgency.valueOf(urgency.toUpperCase()));
        }
        if (priority != null && !priority.isBlank()) {
            ticket.setPriority(TicketPriority.valueOf(priority.toUpperCase()));
        } else {
            ticket.setPriority(TicketPriority.MEDIUM);
        }
        if (skillId != null) {
            Skill skill = skillRepository.findById(skillId)
                    .orElseThrow(() -> new RuntimeException("Skill not found: " + skillId));
            ticket.setRequiredSkill(skill);
        }

        Ticket saved = ticketRepository.save(ticket);
        logEvent(saved, null, "SYSTEM", "TICKET_CREATED", null, "OPEN");
        return toSummaryDto(saved);
    }

    @Transactional
    public TicketSummaryDto updateStatus(Integer ticketId, String newStatus) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));
        String fromStatus = ticket.getStatus() != null ? ticket.getStatus().name() : null;
        ticket.setStatus(TicketStatus.valueOf(newStatus.toUpperCase()));
        if (ticket.getStatus() == TicketStatus.RESOLVED && ticket.getResolvedAt() == null) {
            ticket.setResolvedAt(Instant.now());
        }
        Ticket saved = ticketRepository.save(ticket);
        logEvent(saved, null, "USER", "STATUS_CHANGED", fromStatus, newStatus);
        return toSummaryDto(saved);
    }

    @Transactional
    public TicketSummaryDto assignTicket(Integer ticketId, Integer agentId, Integer assignedById) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));
        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found: " + agentId));
        User assignedBy = userRepository.findById(assignedById)
                .orElseThrow(() -> new RuntimeException("AssignedBy user not found: " + assignedById));

        ticket.setAssignedAgent(agent);
        if (ticket.getFirstAssignedAt() == null) {
            ticket.setFirstAssignedAt(Instant.now());
        }
        ticket.setReassignmentCount(ticket.getReassignmentCount() + 1);
        Ticket saved = ticketRepository.save(ticket);

        TicketAssignment assignment = new TicketAssignment();
        assignment.setTicket(saved);
        assignment.setAgent(agent);
        assignment.setAssignedBy(assignedBy);
        assignment.setAssignmentType("MANUAL");
        ticketAssignmentRepository.save(assignment);

        logEvent(saved, assignedBy, "USER", "TICKET_ASSIGNED", null, agent.getUsername());
        return toSummaryDto(saved);
    }

    @Transactional(readOnly = true)
    public List<TicketEventDto> getEvents(Integer ticketId) {
        return ticketEventRepository.findByTicketIdOrderByCreatedAtAsc(ticketId).stream()
                .map(this::toEventDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TicketAssignmentDto> getAssignments(Integer ticketId) {
        return ticketAssignmentRepository.findByTicketId(ticketId).stream()
                .map(this::toAssignmentDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TicketPauseDto> getPauses(Integer ticketId) {
        return ticketPauseRepository.findByTicketId(ticketId).stream()
                .map(this::toPauseDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TicketEscalationDto> getEscalations(Integer ticketId) {
        return ticketEscalationRepository.findByTicketId(ticketId).stream()
                .map(this::toEscalationDto).collect(Collectors.toList());
    }

    private void logEvent(Ticket ticket, User actor, String actorType, String eventType,
                          String fromState, String toState) {
        TicketEvent event = new TicketEvent();
        event.setTicket(ticket);
        event.setActor(actor);
        event.setActorType(actorType);
        event.setEventType(eventType);
        event.setEventVersion(1);
        event.setFromState(fromState);
        event.setToState(toState);
        event.setSlaConsumedSecondsSnapshot(ticket.getSlaConsumedSeconds());
        ticketEventRepository.save(event);
    }

    private TicketSummaryDto toSummaryDto(Ticket t) {
        TicketSummaryDto dto = new TicketSummaryDto();
        dto.setId(t.getId());
        dto.setTicketNumber(t.getTicketNumber());
        dto.setSubject(t.getSubject());
        dto.setStatus(t.getStatus() != null ? t.getStatus().name() : null);
        dto.setPriority(t.getPriority() != null ? t.getPriority().name() : null);
        dto.setUrgency(t.getUrgency() != null ? t.getUrgency().name() : null);
        dto.setSlaClockStatus(t.getSlaClockStatus() != null ? t.getSlaClockStatus().name() : null);
        dto.setSlaConsumedSeconds(t.getSlaConsumedSeconds());
        dto.setSlaTargetSeconds(t.getSlaTargetSeconds() != null ? t.getSlaTargetSeconds() : 0);
        dto.setSlaDeadlineAt(t.getSlaDeadlineAt());
        dto.setSlaBreached(t.isSlaBreached());
        dto.setRiskLevel(t.getRiskLevel() != null ? t.getRiskLevel().name() : null);
        dto.setCreatedAt(t.getCreatedAt());
        dto.setUpdatedAt(t.getUpdatedAt());
        if (t.getCustomer() != null) {
            dto.setCustomerId(t.getCustomer().getId());
            dto.setCustomerName(t.getCustomer().getName());
        }
        if (t.getAssignedAgent() != null) {
            dto.setAssignedAgentId(t.getAssignedAgent().getId());
            dto.setAssignedAgentUsername(t.getAssignedAgent().getUsername());
        }
        return dto;
    }

    private TicketDetailDto toDetailDto(Ticket t) {
        TicketDetailDto dto = new TicketDetailDto();
        dto.setId(t.getId());
        dto.setTicketNumber(t.getTicketNumber());
        dto.setSubject(t.getSubject());
        dto.setDescription(t.getDescription());
        dto.setStatus(t.getStatus() != null ? t.getStatus().name() : null);
        dto.setPriority(t.getPriority() != null ? t.getPriority().name() : null);
        dto.setUrgency(t.getUrgency() != null ? t.getUrgency().name() : null);
        dto.setSlaClockStatus(t.getSlaClockStatus() != null ? t.getSlaClockStatus().name() : null);
        dto.setSlaConsumedSeconds(t.getSlaConsumedSeconds());
        dto.setSlaTargetSeconds(t.getSlaTargetSeconds() != null ? t.getSlaTargetSeconds() : 0);
        dto.setSlaDeadlineAt(t.getSlaDeadlineAt());
        dto.setSlaBreached(t.isSlaBreached());
        dto.setRiskLevel(t.getRiskLevel() != null ? t.getRiskLevel().name() : null);
        dto.setCreatedAt(t.getCreatedAt());
        dto.setUpdatedAt(t.getUpdatedAt());
        if (t.getCustomer() != null) {
            dto.setCustomerId(t.getCustomer().getId());
            dto.setCustomerName(t.getCustomer().getName());
        }
        if (t.getAssignedAgent() != null) {
            dto.setAssignedAgentId(t.getAssignedAgent().getId());
            dto.setAssignedAgentUsername(t.getAssignedAgent().getUsername());
        }

        List<TicketEvent> events = ticketEventRepository.findByTicketIdOrderByCreatedAtAsc(t.getId());
        dto.setEvents(events.stream().map(this::toEventDto).collect(Collectors.toList()));

        List<TicketPause> pauses = ticketPauseRepository.findByTicketId(t.getId());
        pauses.stream()
                .filter(p -> p.getDecisionStatus() != null
                        && (p.getDecisionStatus().name().equals("APPROVED")
                        || p.getDecisionStatus().name().equals("REQUESTED")))
                .filter(p -> p.getResumedAt() == null)
                .findFirst()
                .ifPresent(p -> dto.setActivePause(toPauseDto(p)));

        List<TicketEscalation> escalations = ticketEscalationRepository.findByTicketId(t.getId());
        escalations.stream()
                .filter(e -> e.getStatus() != null
                        && !e.getStatus().name().equals("RESOLVED"))
                .findFirst()
                .ifPresent(e -> dto.setActiveEscalation(toEscalationDto(e)));

        return dto;
    }

    private TicketEventDto toEventDto(TicketEvent e) {
        TicketEventDto dto = new TicketEventDto();
        dto.setId(e.getId());
        dto.setTicketId(e.getTicket() != null ? e.getTicket().getId() : null);
        dto.setActorId(e.getActor() != null ? e.getActor().getId() : null);
        dto.setActorType(e.getActorType());
        dto.setEventType(e.getEventType());
        dto.setFromState(e.getFromState());
        dto.setToState(e.getToState());
        dto.setSlaConsumedSecondsSnapshot(e.getSlaConsumedSecondsSnapshot());
        dto.setMetadata(e.getMetadata());
        dto.setCreatedAt(e.getCreatedAt());
        return dto;
    }

    private TicketAssignmentDto toAssignmentDto(TicketAssignment a) {
        TicketAssignmentDto dto = new TicketAssignmentDto();
        dto.setId(a.getId());
        if (a.getTicket() != null) {
            dto.setTicketId(a.getTicket().getId());
            dto.setTicketNumber(a.getTicket().getTicketNumber());
        }
        if (a.getAgent() != null) {
            dto.setAgentId(a.getAgent().getId());
            dto.setAgentUsername(a.getAgent().getUsername());
        }
        if (a.getAssignedBy() != null) {
            dto.setAssignedById(a.getAssignedBy().getId());
            dto.setAssignedByUsername(a.getAssignedBy().getUsername());
        }
        dto.setAssignmentType(a.getAssignmentType());
        dto.setRoutingScore(a.getRoutingScore());
        dto.setRoutingFactors(a.getRoutingFactors());
        dto.setAssignedAt(a.getAssignedAt());
        dto.setEndedAt(a.getEndedAt());
        dto.setAssignmentDurationBusinessSeconds(a.getAssignmentDurationBusinessSeconds());
        return dto;
    }

    private TicketPauseDto toPauseDto(TicketPause p) {
        TicketPauseDto dto = new TicketPauseDto();
        dto.setId(p.getId());
        if (p.getTicket() != null) {
            dto.setTicketId(p.getTicket().getId());
            dto.setTicketNumber(p.getTicket().getTicketNumber());
        }
        if (p.getInitiatedBy() != null) {
            dto.setInitiatedById(p.getInitiatedBy().getId());
            dto.setInitiatedByUsername(p.getInitiatedBy().getUsername());
        }
        dto.setAttemptedReason(p.getAttemptedReason());
        dto.setDecisionStatus(p.getDecisionStatus() != null ? p.getDecisionStatus().name() : null);
        if (p.getApprovedBy() != null) {
            dto.setApprovedById(p.getApprovedBy().getId());
            dto.setApprovedByUsername(p.getApprovedBy().getUsername());
        }
        dto.setRemarks(p.getRemarks());
        dto.setRequestedAt(p.getRequestedAt());
        dto.setPausedAt(p.getPausedAt());
        dto.setResumedAt(p.getResumedAt());
        dto.setPausedDurationBusinessSeconds(p.getPausedDurationBusinessSeconds());
        return dto;
    }

    private TicketEscalationDto toEscalationDto(TicketEscalation e) {
        TicketEscalationDto dto = new TicketEscalationDto();
        dto.setId(e.getId());
        if (e.getTicket() != null) {
            dto.setTicketId(e.getTicket().getId());
            dto.setTicketNumber(e.getTicket().getTicketNumber());
        }
        if (e.getCreatedBy() != null) {
            dto.setCreatedById(e.getCreatedBy().getId());
            dto.setCreatedByUsername(e.getCreatedBy().getUsername());
        }
        if (e.getOwnerSupervisor() != null) {
            dto.setOwnerSupervisorId(e.getOwnerSupervisor().getId());
            dto.setOwnerSupervisorUsername(e.getOwnerSupervisor().getUsername());
        }
        if (e.getAssignedAgent() != null) {
            dto.setAssignedAgentId(e.getAssignedAgent().getId());
            dto.setAssignedAgentUsername(e.getAssignedAgent().getUsername());
        }
        dto.setReason(e.getReason());
        dto.setDescription(e.getDescription());
        dto.setStatus(e.getStatus() != null ? e.getStatus().name() : null);
        dto.setCreatedAt(e.getCreatedAt());
        dto.setClaimedAt(e.getClaimedAt());
        dto.setResolvedAt(e.getResolvedAt());
        dto.setResolutionNotes(e.getResolutionNotes());
        return dto;
    }
}
