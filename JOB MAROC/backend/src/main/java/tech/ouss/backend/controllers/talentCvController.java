package tech.ouss.backend.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.ouss.backend.Repository.talentCvRepository;
import tech.ouss.backend.models.talent;
import tech.ouss.backend.models.talentCv;
import tech.ouss.backend.models.talent_experiance;
import tech.ouss.backend.services.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/talent/cv")

public class talentCvController {
    private final talentCvRepository talentCvRepository;
    private final talentService talentService;

    public talentCvController(tech.ouss.backend.Repository.talentCvRepository talentCvRepository, tech.ouss.backend.services.talentService talentService) {
        this.talentCvRepository = talentCvRepository;
        this.talentService = talentService;
    }

    @PostMapping(path = "/upload", consumes = "application/json")
    public ResponseEntity<?> uploadTalentCv(@RequestBody talentCv cvData) {
        try {

            if (cvData == null) {
                return ResponseEntity.badRequest().body("Invalid CV data: CV content cannot be empty.");
            }
            talent talent = this.talentService.getTalentByEmail(cvData.getTalent().getUser_id().getEmail());
            if (talent == null) {
                return ResponseEntity.badRequest().body("Invalid talent: Talent not found.");
            }
            cvData.setTalent(talent);
            cvData.setUpload_date(LocalDateTime.now());
            return ResponseEntity.ok(talentCvRepository.save(cvData));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred while uploading the CV: " + e.getMessage());
        }
    }

    @DeleteMapping(path = "delete/{cvId}")
    public ResponseEntity<?> delete(@PathVariable("cvId") int cvId){
        try {
            talentCv cv = this.talentCvRepository.findById(cvId).orElse(null);
            if (cv==null){
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("cv not found.");
            }
            this.talentCvRepository.delete(cv);
            return ResponseEntity.ok("cv deleted");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }
}
