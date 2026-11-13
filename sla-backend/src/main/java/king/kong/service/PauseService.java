package king.kong.service;

import king.kong.dto.PagedResponse;
import king.kong.dto.TicketPauseDto;
import king.kong.model.PauseDecisionStatus;
import king.kong.model.SlaClockStatus;
import king.kong.model.Ticket;
import king.kong.model.TicketPause;
import king.kong.model.User;
import king.kong.repository.TicketPauseRepository;
import king.kong.repository.TicketRepository;
import king.kong.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PauseService {

    private final TicketPauseRepository ticketPauseRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public PauseService(TicketPauseRepository ticketPauseRepository,
                        TicketRepository ticketRepository,
                        UserRepository userRepository) {
        this.ticketPauseRepository = ticketPauseRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public PagedResponse<TicketPauseDto> getPendingApprovals(int page, int size) {
        return getPausesByStatus("REQUESTED", page, size);
    }

    @Transactional(readOnly = true)
    public PagedResponse<TicketPauseDto> getPausesByStatus(String status, int page, int size) {
        PageRequest pr = PageRequest.of(page, size);
        Page<TicketPause> result;
        if (status != null && !status.isBlank()) {
            PauseDecisionStatus pds = PauseDecisionStatus.valueOf(status.toUpperCase());
            result = ticketPauseRepository.findByDecisionStatus(pds, pr);
        } else {
            result = ticketPauseRepository.findAll(pr);
        }
        List<TicketPauseDto> dtos = result.getContent().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return new PagedResponse<>(dtos, page, size, result.getTotalElements(), result.getTotalPages());
    }

    @Transactional
    public TicketPauseDto request(Integer ticketId, Integer initiatedById, String reason) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));
        User user = userRepository.findById(initiatedById)
                .orElseThrow(() -> new RuntimeException("User not found: " + initiatedById));

        TicketPause pause = new TicketPause();
        pause.setTicket(ticket);
        pause.setInitiatedBy(user);
        pause.setAttemptedReason(reason);
        pause.setDecisionStatus(PauseDecisionStatus.REQUESTED);
        pause.setRequestedAt(Instant.now());

        return toDto(ticketPauseRepository.save(pause));
    }

    @Transactional
    public TicketPauseDto approve(Integer pauseId, Integer approvedById) {
        TicketPause pause = ticketPauseRepository.findById(pauseId)
                .orElseThrow(() -> new RuntimeException("Pause request not found: " + pauseId));
        User supervisor = userRepository.findById(approvedById)
                .orElseThrow(() -> new RuntimeException("User not found: " + approvedById));

        pause.setDecisionStatus(PauseDecisionStatus.APPROVED);
        pause.setApprovedBy(supervisor);
        Instant now = Instant.now();
        pause.setPausedAt(now);

        Ticket ticket = pause.getTicket();
        if (ticket != null) {
            ticket.setSlaClockStatus(SlaClockStatus.PAUSED);
            ticketRepository.save(ticket);
        }

        return toDto(ticketPauseRepository.save(pause));
    }

    @Transactional
    public TicketPauseDto reject(Integer pauseId, Integer approvedById, String remarks) {
        TicketPause pause = ticketPauseRepository.findById(pauseId)
                .orElseThrow(() -> new RuntimeException("Pause request not found: " + pauseId));
        User supervisor = userRepository.findById(approvedById)
                .orElseThrow(() -> new RuntimeException("User not found: " + approvedById));

        pause.setDecisionStatus(PauseDecisionStatus.REJECTED);
        pause.setApprovedBy(supervisor);
        pause.setRemarks(remarks);

        return toDto(ticketPauseRepository.save(pause));
    }

    @Transactional
    public TicketPauseDto resume(Integer pauseId) {
        TicketPause pause = ticketPauseRepository.findById(pauseId)
                .orElseThrow(() -> new RuntimeException("Pause request not found: " + pauseId));

        pause.setDecisionStatus(PauseDecisionStatus.RESUMED);
        Instant now = Instant.now();
        pause.setResumedAt(now);
        if (pause.getPausedAt() != null) {
            long seconds = Duration.between(pause.getPausedAt(), now).getSeconds();
            pause.setPausedDurationBusinessSeconds((int) seconds);
        }

        Ticket ticket = pause.getTicket();
        if (ticket != null) {
            ticket.setSlaClockStatus(SlaClockStatus.RUNNING);
            ticketRepository.save(ticket);
        }

        return toDto(ticketPauseRepository.save(pause));
    }

    private TicketPauseDto toDto(TicketPause p) {
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
}

