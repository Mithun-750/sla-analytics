package king.kong.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.Embeddable;
import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
public class UserSkillId implements Serializable {
    private Integer userId;
    private Integer skillId;
}
