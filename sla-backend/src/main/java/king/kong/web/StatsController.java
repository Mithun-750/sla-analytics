package king.kong.web;

import king.kong.dto.AgentStatsDto;
import king.kong.dto.StatsOverviewDto;
import king.kong.service.StatsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/overview")
    public ResponseEntity<StatsOverviewDto> getOverview() {
        return ResponseEntity.ok(statsService.getOverview());
    }

    @GetMapping("/agent/{id}")
    public ResponseEntity<AgentStatsDto> getAgentStats(@PathVariable Integer id) {
        return ResponseEntity.ok(statsService.getAgentStats(id));
    }
}

