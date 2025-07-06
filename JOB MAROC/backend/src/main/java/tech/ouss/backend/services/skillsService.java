package tech.ouss.backend.services;
import tech.ouss.backend.Repository.skillsRepository;
import org.springframework.stereotype.Service;
import tech.ouss.backend.models.talent_skills;

import java.util.List;

@Service
public class skillsService {
    private final skillsRepository skillsRepository;
    public skillsService(skillsRepository skillsRepository) {
        this.skillsRepository = skillsRepository;
    }
    public List<talent_skills> getAllSkills() {
        return skillsRepository.findAll();
    }
    public talent_skills getSkillById(int id) {
        return skillsRepository.findById(id).orElse(null);
    }
    public talent_skills addSkill(talent_skills skill) {
        return skillsRepository.save(skill);
    }
    public void updateSkill(talent_skills skill) {
        skillsRepository.save(skill);
    }
    public List<talent_skills> getSkillsByTalentId(int talentId){
        return this.skillsRepository.findByTalentId(talentId);
    }

    public void delete(talent_skills skill){
        this.skillsRepository.delete(skill);
    }

}
