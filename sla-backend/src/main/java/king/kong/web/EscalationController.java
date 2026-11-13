package king.kong.web;

import king.kong.dto.PagedResponse;
import king.kong.dto.TicketEscalationDto;
import king.kong.service.EscalationService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/escalations")
public class EscalationController {

    private final EscalationService escalationService;

    public EscalationController(EscalationService escalationService) {
        this.escalationService = escalationService;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<TicketEscalationDto>> getEscalations(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer supervisorId,
            @PageableDefault(page = 0, size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ResponseEntity.ok(escalationService.list(search, status, supervisorId, pageable));
    }

    @PostMapping("/tickets/{ticketId}/escalations")
    public ResponseEntity<TicketEscalationDto> createForTicket(
            @PathVariable Integer ticketId,
            @RequestBody CreateEscalationRequest request) {
        if (request.getReason() == null || request.getReason().trim().isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        Integer createdById = request.getCreatedById() != null ? request.getCreatedById() : 1;
        TicketEscalationDto created = escalationService.create(
                ticketId, createdById, request.getReason().trim(), request.getDescription());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PostMapping
    public ResponseEntity<TicketEscalationDto> create(
            @RequestBody CreateEscalationRequest request) {
        if (request.getTicketId() == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        if (request.getReason() == null || request.getReason().trim().isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        Integer createdById = request.getCreatedById() != null ? request.getCreatedById() : 1;
        TicketEscalationDto created = escalationService.create(
                request.getTicketId(), createdById, request.getReason().trim(), request.getDescription());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/claim")
    public ResponseEntity<TicketEscalationDto> patchClaim(
            @PathVariable Integer id,
            @RequestBody Map<String, Integer> body) {
        Integer supervisorId = body.get("supervisorId");
        if (supervisorId == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        return ResponseEntity.ok(escalationService.claim(id, supervisorId));
    }

    @PostMapping("/{id}/claim")
    public ResponseEntity<TicketEscalationDto> postClaim(
            @PathVariable Integer id,
            @RequestBody Map<String, Integer> body) {
        Integer supervisorId = body.get("supervisorId");
        if (supervisorId == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        return ResponseEntity.ok(escalationService.claim(id, supervisorId));
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<TicketEscalationDto> patchResolve(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        String resolutionNotes = body.get("resolutionNotes") != null
                ? body.get("resolutionNotes")
                : body.get("resolutionNote");
        return ResponseEntity.ok(escalationService.resolve(id, resolutionNotes));
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<TicketEscalationDto> postResolve(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        String resolutionNotes = body.get("resolutionNotes") != null
                ? body.get("resolutionNotes")
                : body.get("resolutionNote");
        return ResponseEntity.ok(escalationService.resolve(id, resolutionNotes));
    }

    public static class CreateEscalationRequest {
        private Integer ticketId;
        private Integer createdById;
        private String reason;
        private String description;

        public Integer getTicketId() {
            return ticketId;
        }

        public void setTicketId(Integer ticketId) {
            this.ticketId = ticketId;
        }

        public Integer getCreatedById() {
            return createdById;
        }

        public void setCreatedById(Integer createdById) {
            this.createdById = createdById;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }
}
