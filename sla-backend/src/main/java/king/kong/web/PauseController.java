package king.kong.web;

import king.kong.dto.PagedResponse;
import king.kong.dto.TicketPauseDto;
import king.kong.service.PauseService;
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
@RequestMapping("/api/pauses")
public class PauseController {

    private final PauseService pauseService;

    public PauseController(PauseService pauseService) {
        this.pauseService = pauseService;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<TicketPauseDto>> getPauses(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @PageableDefault(page = 0, size = 20, sort = "requestedAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ResponseEntity.ok(pauseService.getPauses(search, status, pageable));
    }

    @PostMapping("/tickets/{ticketId}/pauses")
    public ResponseEntity<TicketPauseDto> createPauseForTicket(
            @PathVariable Integer ticketId,
            @RequestBody CreatePauseRequest request) {
        if (request.getReason() == null || request.getReason().trim().isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        Integer initiatedById = request.getInitiatedById() != null
                ? request.getInitiatedById()
                : request.getAgentId();
        if (initiatedById == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        TicketPauseDto created = pauseService.request(ticketId, initiatedById, request.getReason().trim());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<TicketPauseDto> patchApprove(
            @PathVariable Integer id,
            @RequestBody Map<String, Integer> body) {
        Integer supervisorId = body.get("supervisorId");
        if (supervisorId == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        return ResponseEntity.ok(pauseService.approve(id, supervisorId));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<TicketPauseDto> postApprove(
            @PathVariable Integer id,
            @RequestBody Map<String, Integer> body) {
        Integer supervisorId = body.get("supervisorId");
        if (supervisorId == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        return ResponseEntity.ok(pauseService.approve(id, supervisorId));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<TicketPauseDto> patchReject(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> body) {
        Integer supervisorId = body.get("supervisorId") != null
                ? ((Number) body.get("supervisorId")).intValue() : null;
        if (supervisorId == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        String remarks = (String) body.get("remarks");
        return ResponseEntity.ok(pauseService.reject(id, supervisorId, remarks));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<TicketPauseDto> postReject(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> body) {
        Integer supervisorId = body.get("supervisorId") != null
                ? ((Number) body.get("supervisorId")).intValue() : null;
        if (supervisorId == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        String remarks = (String) body.get("remarks");
        return ResponseEntity.ok(pauseService.reject(id, supervisorId, remarks));
    }

    @PatchMapping("/{id}/resume")
    public ResponseEntity<TicketPauseDto> patchResume(@PathVariable Integer id) {
        return ResponseEntity.ok(pauseService.resume(id));
    }

    @PostMapping("/{id}/resume")
    public ResponseEntity<TicketPauseDto> postResume(@PathVariable Integer id) {
        return ResponseEntity.ok(pauseService.resume(id));
    }

    public static class CreatePauseRequest {
        private Integer initiatedById;
        private Integer agentId;
        private String reason;

        public Integer getInitiatedById() {
            return initiatedById;
        }

        public void setInitiatedById(Integer initiatedById) {
            this.initiatedById = initiatedById;
        }

        public Integer getAgentId() {
            return agentId;
        }

        public void setAgentId(Integer agentId) {
            this.agentId = agentId;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }
}
