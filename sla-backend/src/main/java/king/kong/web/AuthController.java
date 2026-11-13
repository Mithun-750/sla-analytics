package king.kong.web;

import king.kong.dto.CustomerDto;
import king.kong.dto.UserDto;
import king.kong.service.CustomerService;
import king.kong.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final CustomerService customerService;

    public AuthController(UserService userService, CustomerService customerService) {
        this.userService = userService;
        this.customerService = customerService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        String type = request.getType();
        Integer id = request.getId();

        LoginResponse response = new LoginResponse();
        response.setType(type);
        response.setId(id);

        if ("customer".equalsIgnoreCase(type)) {
            CustomerDto customer = customerService.getById(id);
            response.setUsername(customer.getName());
            response.setUser(customer);
        } else {
            UserDto user = userService.getUserById(id);
            response.setUsername(user.getUsername());
            response.setRole(user.getRole());
            response.setUser(user);
        }

        return ResponseEntity.ok(response);
    }

    public static class LoginRequest {
        private String type;
        private Integer id;

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public Integer getId() {
            return id;
        }

        public void setId(Integer id) {
            this.id = id;
        }
    }

    public static class LoginResponse {
        private String type;
        private Integer id;
        private String username;
        private String role;
        private Object user;

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public Integer getId() {
            return id;
        }

        public void setId(Integer id) {
            this.id = id;
        }

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

        public Object getUser() {
            return user;
        }

        public void setUser(Object user) {
            this.user = user;
        }
    }
}

