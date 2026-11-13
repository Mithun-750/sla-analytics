package king.kong.service;

import king.kong.dto.PagedResponse;
import king.kong.dto.TicketEscalationDto;
import king.kong.model.EscalationStatus;
import king.kong.model.Ticket;
import king.kong.model.TicketEscalation;
import king.kong.model.User;
import king.kong.repository.TicketEscalationRepository;
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
public class EscalationService {

    private final TicketEscalationRepository ticketEscalationRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public EscalationService(TicketEscalationRepository ticketEscalationRepository,
                             TicketRepository ticketRepository,
                             UserRepository userRepository) {
        this.ticketEscalationRepository = ticketEscalationRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public PagedResponse<TicketEscalationDto> list(String search, String status, Integer supervisorId, Pageable pageable) {
        EscalationStatus es = (status != null && !status.isBlank())
                ? EscalationStatus.valueOf(status.toUpperCase()) : null;
        String s = (search != null && !search.isBlank()) ? search.trim() : "";

        Page<TicketEscalation> result = ticketEscalationRepository.searchEscalations(es, supervisorId, s, pageable);

        List<TicketEscalationDto> dtos = result.getContent().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return new PagedResponse<>(dtos, pageable.getPageNumber(), pageable.getPageSize(),
                result.getTotalElements(), result.getTotalPages());
    }

    @Transactional
    public TicketEscalationDto create(Integer ticketId, Integer createdById, String reason, String description) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));
        User createdBy = userRepository.findById(createdById)
                .orElseThrow(() -> new RuntimeException("User not found: " + createdById));

        TicketEscalation escalation = new TicketEscalation();
        escalation.setTicket(ticket);
        escalation.setCreatedBy(createdBy);
        escalation.setAssignedAgent(ticket.getAssignedAgent());
        escalation.setReason(reason);
        escalation.setDescription(description);
        escalation.setStatus(EscalationStatus.OPEN);
        escalation.setCreatedAt(Instant.now());

        return toDto(ticketEscalationRepository.save(escalation));
    }

    @Transactional
    public TicketEscalationDto claim(Integer escalationId, Integer supervisorId) {
        TicketEscalation escalation = ticketEscalationRepository.findById(escalationId)
                .orElseThrow(() -> new RuntimeException("Escalation not found: " + escalationId));
        User supervisor = userRepository.findById(supervisorId)
                .orElseThrow(() -> new RuntimeException("Supervisor not found: " + supervisorId));

        escalation.setOwnerSupervisor(supervisor);
        escalation.setStatus(EscalationStatus.CLAIMED);
        escalation.setClaimedAt(Instant.now());

        return toDto(ticketEscalationRepository.save(escalation));
    }

    @Transactional
    public TicketEscalationDto resolve(Integer escalationId, String resolutionNotes) {
        TicketEscalation escalation = ticketEscalationRepository.findById(escalationId)
                .orElseThrow(() -> new RuntimeException("Escalation not found: " + escalationId));

        escalation.setStatus(EscalationStatus.RESOLVED);
        escalation.setResolutionNotes(resolutionNotes);
        escalation.setResolvedAt(Instant.now());

        return toDto(ticketEscalationRepository.save(escalation));
    }

    private TicketEscalationDto toDto(TicketEscalation e) {
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
