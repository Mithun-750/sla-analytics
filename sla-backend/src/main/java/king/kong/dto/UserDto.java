package king.kong.dto;

import java.time.Instant;
import java.util.List;

public class UserDto {
    private Integer id;
    private String username;
    private String role;
    private boolean available;
    private int maxConcurrentTickets;
    private Instant createdAt;
    private List<UserSkillDto> skills;

    public UserDto() {
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

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public int getMaxConcurrentTickets() {
        return maxConcurrentTickets;
    }

    public void setMaxConcurrentTickets(int maxConcurrentTickets) {
        this.maxConcurrentTickets = maxConcurrentTickets;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public List<UserSkillDto> getSkills() {
        return skills;
    }

    public void setSkills(List<UserSkillDto> skills) {
        this.skills = skills;
    }

    public static class UserSkillDto {
        private Integer skillId;
        private String skillName;
        private int proficiencyLevel;

        public UserSkillDto() {
        }

        public Integer getSkillId() {
            return skillId;
        }

        public void setSkillId(Integer skillId) {
            this.skillId = skillId;
        }

        public String getSkillName() {
            return skillName;
        }

        public void setSkillName(String skillName) {
            this.skillName = skillName;
        }

        public int getProficiencyLevel() {
            return proficiencyLevel;
        }

        public void setProficiencyLevel(int proficiencyLevel) {
            this.proficiencyLevel = proficiencyLevel;
        }
    }
}

