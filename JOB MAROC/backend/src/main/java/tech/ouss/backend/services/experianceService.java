package tech.ouss.backend.services;
import tech.ouss.backend.Repository.experianceRepository;
import org.springframework.stereotype.Service;
import tech.ouss.backend.models.talent_experiance;
import tech.ouss.backend.models.talent_experiance;

import java.util.List;

@Service
public class experianceService {
    private final experianceRepository experianceRepository;
    public experianceService(experianceRepository experianceRepository) {
        this.experianceRepository = experianceRepository;
    }
    public List<talent_experiance> getAllExperiances() {
        return experianceRepository.findAll();
    }
    public talent_experiance getExperianceById(int id) {
        return experianceRepository.findById(id).orElse(null);
    }
    public talent_experiance addExperiance(talent_experiance experiance) {
        return experianceRepository.save(experiance);
    }
    public void updateExperiance(talent_experiance experiance) {
        experianceRepository.save(experiance);
    }
    public void deleteExperiance(int id) {
        experianceRepository.deleteById(id);
    }

    public List<talent_experiance> findByTalentId(int talentId) {
        return this.experianceRepository.findByTalentId(talentId);
    }

    public void delete(talent_experiance experience) {
        this.experianceRepository.delete(experience);
    }
}
