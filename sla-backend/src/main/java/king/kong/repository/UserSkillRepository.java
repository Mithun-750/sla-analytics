package king.kong.repository;

import king.kong.model.UserSkill;
import king.kong.model.UserSkillId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserSkillRepository extends JpaRepository<UserSkill, UserSkillId> {

    List<UserSkill> findByIdUserId(Integer userId);

    void deleteByIdUserId(Integer userId);
}

