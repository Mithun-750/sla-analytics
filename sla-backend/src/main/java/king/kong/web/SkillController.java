package king.kong.web;

import king.kong.dto.SkillDto;
import king.kong.service.SkillService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    @GetMapping
    public ResponseEntity<List<SkillDto>> list() {
        return ResponseEntity.ok(skillService.list());
    }

    @PostMapping
    public ResponseEntity<SkillDto> create(@RequestBody CreateSkillRequest request) {
        SkillDto created = skillService.create(request.getName());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    public static class CreateSkillRequest {
        private String name;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}

