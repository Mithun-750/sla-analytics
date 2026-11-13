package king.kong.web;

import king.kong.dto.PagedResponse;
import king.kong.dto.UserDto;
import king.kong.service.UserService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<UserDto>> getUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search,
            @PageableDefault(page = 0, size = 20, sort = "username", direction = Sort.Direction.ASC)
            Pageable pageable) {
        return ResponseEntity.ok(userService.getUsers(role, search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUser(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    public ResponseEntity<UserDto> createUser(@RequestBody CreateUserRequest request) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        if (request.getRole() == null || request.getRole().trim().isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        UserDto created = userService.createUser(
                request.getUsername().trim(), request.getRole().trim(), request.getMaxConcurrentTickets());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/availability")
    public ResponseEntity<UserDto> toggleAvailability(
            @PathVariable Integer id,
            @RequestBody Map<String, Boolean> body) {
        Boolean available = body.get("available");
        if (available == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        return ResponseEntity.ok(userService.toggleAvailability(id, available));
    }

    @GetMapping("/{id}/skills")
    public ResponseEntity<List<UserDto.UserSkillDto>> getUserSkills(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.getUserSkills(id));
    }

    @PutMapping("/{id}/skills")
    public ResponseEntity<UserDto> updateUserSkills(
            @PathVariable Integer id,
            @RequestBody List<UserService.SkillUpdateRequest> skills) {
        return ResponseEntity.ok(userService.updateUserSkills(id, skills));
    }

    public static class CreateUserRequest {
        private String username;
        private String role;
        private int maxConcurrentTickets = 5;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public int getMaxConcurrentTickets() {
            return maxConcurrentTickets;
        }

        public void setMaxConcurrentTickets(int maxConcurrentTickets) {
            this.maxConcurrentTickets = maxConcurrentTickets;
        }
    }
}
