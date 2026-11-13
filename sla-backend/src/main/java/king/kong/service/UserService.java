package king.kong.service;

import king.kong.dto.UserDto;
import king.kong.model.Skill;
import king.kong.model.User;
import king.kong.model.UserRole;
import king.kong.model.UserSkill;
import king.kong.model.UserSkillId;
import king.kong.repository.SkillRepository;
import king.kong.repository.UserRepository;
import king.kong.repository.UserSkillRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final SkillRepository skillRepository;

    public UserService(UserRepository userRepository,
                       UserSkillRepository userSkillRepository,
                       SkillRepository skillRepository) {
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
        this.skillRepository = skillRepository;
    }

    @Transactional(readOnly = true)
    public king.kong.dto.PagedResponse<UserDto> getUsers(String role, String search, int page, int size) {
        PageRequest pr = PageRequest.of(page, size);
        Page<User> result;
        if (role != null && !role.isBlank()) {
            UserRole userRole = UserRole.valueOf(role.toUpperCase());
            if (search != null && !search.isBlank()) {
                result = userRepository.findByRoleAndUsernameContainingIgnoreCase(userRole, search, pr);
            } else {
                result = userRepository.findByRole(userRole, pr);
            }
        } else if (search != null && !search.isBlank()) {
            result = userRepository.findByUsernameContainingIgnoreCase(search, pr);
        } else {
            result = userRepository.findAll(pr);
        }
        List<UserDto> dtos = result.getContent().stream()
                .map(this::toUserDtoWithSkills)
                .collect(Collectors.toList());
        return new king.kong.dto.PagedResponse<>(dtos, page, size,
                result.getTotalElements(), result.getTotalPages());
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        return toUserDtoWithSkills(user);
    }

    @Transactional
    public UserDto createUser(String username, String role, int maxConcurrentTickets) {
        User user = new User();
        user.setUsername(username);
        user.setRole(UserRole.valueOf(role.toUpperCase()));
        user.setMaxConcurrentTickets(maxConcurrentTickets);
        user.setAvailable(true);
        User saved = userRepository.save(user);
        return toUserDtoWithSkills(saved);
    }

    @Transactional
    public UserDto toggleAvailability(Integer id, boolean available) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        user.setAvailable(available);
        return toUserDtoWithSkills(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public List<UserDto.UserSkillDto> getUserSkills(Integer userId) {
        return userSkillRepository.findByIdUserId(userId).stream()
                .map(this::toUserSkillDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto updateUserSkills(Integer userId, List<SkillUpdateRequest> skillRequests) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        userSkillRepository.deleteByIdUserId(userId);
        userSkillRepository.flush();
        for (SkillUpdateRequest req : skillRequests) {
            Skill skill = skillRepository.findById(req.getSkillId())
                    .orElseThrow(() -> new RuntimeException("Skill not found: " + req.getSkillId()));
            UserSkillId skillId = new UserSkillId();
            skillId.setUserId(userId);
            skillId.setSkillId(req.getSkillId());
            UserSkill userSkill = new UserSkill();
            userSkill.setId(skillId);
            userSkill.setUser(user);
            userSkill.setSkill(skill);
            userSkill.setProficiencyLevel(req.getProficiencyLevel());
            userSkillRepository.save(userSkill);
        }
        return toUserDtoWithSkills(user);
    }

    private UserDto toUserDtoWithSkills(User user) {
        UserDto dto = toUserDto(user);
        List<UserDto.UserSkillDto> skills = userSkillRepository.findByIdUserId(user.getId())
                .stream().map(this::toUserSkillDto).collect(Collectors.toList());
        dto.setSkills(skills);
        return dto;
    }

    private UserDto toUserDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setRole(user.getRole() != null ? user.getRole().name() : null);
        dto.setAvailable(user.isAvailable());
        dto.setMaxConcurrentTickets(user.getMaxConcurrentTickets());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }

    private UserDto.UserSkillDto toUserSkillDto(UserSkill us) {
        UserDto.UserSkillDto dto = new UserDto.UserSkillDto();
        dto.setSkillId(us.getSkill().getId());
        dto.setSkillName(us.getSkill().getName());
        dto.setProficiencyLevel(us.getProficiencyLevel());
        return dto;
    }

    public static class SkillUpdateRequest {
        private Integer skillId;
        private int proficiencyLevel;

        public Integer getSkillId() {
            return skillId;
        }

        public void setSkillId(Integer skillId) {
            this.skillId = skillId;
        }

        public int getProficiencyLevel() {
            return proficiencyLevel;
        }

        public void setProficiencyLevel(int proficiencyLevel) {
            this.proficiencyLevel = proficiencyLevel;
        }
    }
}

