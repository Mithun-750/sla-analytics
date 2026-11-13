package king.kong.service;

import king.kong.dto.SkillDto;
import king.kong.model.Skill;
import king.kong.repository.SkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SkillService {

    private final SkillRepository skillRepository;

    public SkillService(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    @Transactional(readOnly = true)
    public List<SkillDto> list() {
        return skillRepository.findAll().stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public SkillDto create(String name) {
        Skill skill = new Skill();
        skill.setName(name);
        return toDto(skillRepository.save(skill));
    }

    private SkillDto toDto(Skill skill) {
        SkillDto dto = new SkillDto();
        dto.setId(skill.getId());
        dto.setName(skill.getName());
        return dto;
    }
}

