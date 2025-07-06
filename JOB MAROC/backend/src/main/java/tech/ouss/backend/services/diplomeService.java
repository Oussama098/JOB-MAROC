package tech.ouss.backend.services;
import tech.ouss.backend.Repository.diplomeRepository;
import org.springframework.stereotype.Service;
import tech.ouss.backend.models.talent_diplome;

import java.util.List;

@Service
public class diplomeService {
     private final diplomeRepository diplomeRepository;
     public diplomeService(diplomeRepository diplomeRepository) {
         this.diplomeRepository = diplomeRepository;
     }
     public List<talent_diplome> getAllDiplomes() {
         return diplomeRepository.findAll();
     }
     public talent_diplome getDiplomeById(int id) {
         return diplomeRepository.findById(id).orElse(null);
     }
     public talent_diplome addDiplome(talent_diplome diplome) {
         return diplomeRepository.save(diplome);
     }
     public void updateDiplome(talent_diplome diplome) {
         diplomeRepository.save(diplome);
     }
     public void deleteDiplome(int id) {
         diplomeRepository.deleteById(id);
     }

    public void delete(talent_diplome diplome) {
         this.diplomeRepository.delete(diplome);
    }
}
