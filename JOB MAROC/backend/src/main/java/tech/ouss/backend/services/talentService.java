package tech.ouss.backend.services;
//import Repository.*;
//import models.talent;
//import models.userEntity;
import tech.ouss.backend.Repository.*;
import tech.ouss.backend.models.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class talentService {
    private final talentRepository talentRepository;
    private final userRepository userRepository;
    private final talentCvRepository talentCvRepository;

    public talentService(talentRepository talentRepository, userRepository userRepository, tech.ouss.backend.Repository.talentCvRepository talentCvRepository) {
        this.talentRepository = talentRepository;
        this.userRepository = userRepository;
        this.talentCvRepository = talentCvRepository;
    }


    public talent save(talent talent) {
        return this.talentRepository.save(talent);
    }

    public talent getTalentById(int id) {
        return this.talentRepository.findById(id).orElseThrow(() -> new RuntimeException("Talent not found"));
    }

    public void deleteTalent(int id){
        this.talentRepository.deleteById(id);
    }

    public talent getTalentByUserID(int userId){
        return this.talentRepository.findTalentByUserId(userId);
    }

    public talent getTalentByEmail(String email) {
        return this.talentRepository.findTalentByEmail(email);
    }

    public List<talentCv> getTalentCvsByTalentId(int talentId) {
        return this.talentCvRepository.findByTalentId(talentId);
    }
}
