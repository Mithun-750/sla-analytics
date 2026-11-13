package king.kong.web;

import king.kong.dto.PagedResponse;
import king.kong.dto.TicketAssignmentDto;
import king.kong.dto.TicketDetailDto;
import king.kong.dto.TicketEscalationDto;
import king.kong.dto.TicketEventDto;
import king.kong.dto.TicketPauseDto;
import king.kong.dto.TicketSummaryDto;
import king.kong.service.PauseService;
import king.kong.service.TicketService;
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

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final PauseService pauseService;

    public TicketController(TicketService ticketService, PauseService pauseService) {
        this.ticketService = ticketService;
        this.pauseService = pauseService;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<TicketSummaryDto>> getTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer customerId,
            @RequestParam(required = false) Integer agentId,
            @RequestParam(required = false) String priority) {
        return ResponseEntity.ok(ticketService.getTickets(status, customerId, agentId, priority, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketDetailDto> getTicket(@PathVariable Integer id) {
        return ResponseEntity.ok(ticketService.getById(id));
    }

    @PostMapping
    public ResponseEntity<TicketSummaryDto> createTicket(@RequestBody CreateTicketRequest request) {
        Integer skillId = request.getRequiredSkillId() != null
                ? request.getRequiredSkillId()
                : request.getSkillId();
        TicketSummaryDto created = ticketService.createTicket(
                request.getCustomerId(),
                request.getSubject(),
                request.getDescription(),
                request.getUrgency(),
                request.getPriority(),
                skillId);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketSummaryDto> updateStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(ticketService.updateStatus(id, status));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<TicketSummaryDto> patchAssign(
            @PathVariable Integer id,
            @RequestBody AssignRequest request) {
        Integer assignedById = request.getAssignedById() != null
                ? request.getAssignedById()
                : request.getAgentId();
        return ResponseEntity.ok(ticketService.assignTicket(id, request.getAgentId(), assignedById));
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<TicketSummaryDto> postAssign(
            @PathVariable Integer id,
            @RequestBody AssignRequest request) {
        Integer assignedById = request.getAssignedById() != null
                ? request.getAssignedById()
                : request.getAgentId();
        return ResponseEntity.ok(ticketService.assignTicket(id, request.getAgentId(), assignedById));
    }

    @GetMapping("/{id}/events")
    public ResponseEntity<List<TicketEventDto>> getEvents(@PathVariable Integer id) {
        return ResponseEntity.ok(ticketService.getEvents(id));
    }

    @GetMapping("/{id}/assignments")
    public ResponseEntity<List<TicketAssignmentDto>> getAssignments(@PathVariable Integer id) {
        return ResponseEntity.ok(ticketService.getAssignments(id));
    }

    @GetMapping("/{id}/pauses")
    public ResponseEntity<List<TicketPauseDto>> getPauses(@PathVariable Integer id) {
        return ResponseEntity.ok(ticketService.getPauses(id));
    }

    @GetMapping("/{id}/escalations")
    public ResponseEntity<List<TicketEscalationDto>> getEscalations(@PathVariable Integer id) {
        return ResponseEntity.ok(ticketService.getEscalations(id));
    }

    @PostMapping("/{id}/pause")
    public ResponseEntity<TicketPauseDto> requestPause(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> body) {
        String reason = (String) body.get("reason");
        Integer agentId = body.get("agentId") != null
                ? ((Number) body.get("agentId")).intValue()
                : ((Number) body.get("initiatedById")).intValue();
        return new ResponseEntity<>(pauseService.request(id, agentId, reason), HttpStatus.CREATED);
    }

    public static class CreateTicketRequest {
        private Integer customerId;
        private String subject;
        private String description;
        private String urgency;
        private String priority;
        private Integer requiredSkillId;
        private Integer skillId;

        public Integer getCustomerId() {
            return customerId;
        }

        public void setCustomerId(Integer customerId) {
            this.customerId = customerId;
        }

        public String getSubject() {
            return subject;
        }

        public void setSubject(String subject) {
            this.subject = subject;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getUrgency() {
            return urgency;
        }

        public void setUrgency(String urgency) {
            this.urgency = urgency;
        }

        public String getPriority() {
            return priority;
        }

        public void setPriority(String priority) {
            this.priority = priority;
        }

        public Integer getRequiredSkillId() {
            return requiredSkillId;
        }

        public void setRequiredSkillId(Integer requiredSkillId) {
            this.requiredSkillId = requiredSkillId;
        }

        public Integer getSkillId() {
            return skillId;
        }

        public void setSkillId(Integer skillId) {
            this.skillId = skillId;
        }
    }

    public static class AssignRequest {
        private Integer agentId;
        private Integer assignedById;

        public Integer getAgentId() {
            return agentId;
        }

        public void setAgentId(Integer agentId) {
            this.agentId = agentId;
        }

        public Integer getAssignedById() {
            return assignedById;
        }

        public void setAssignedById(Integer assignedById) {
            this.assignedById = assignedById;
        }
    }
}
