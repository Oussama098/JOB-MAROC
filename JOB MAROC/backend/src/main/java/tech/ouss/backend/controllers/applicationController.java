package tech.ouss.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.ouss.backend.Enums.ApplicationStatus;
import tech.ouss.backend.Enums.NotificationType;
import tech.ouss.backend.Repository.applicationRepository;
import tech.ouss.backend.Repository.notificationRepository;
import tech.ouss.backend.models.*;
import tech.ouss.backend.services.*;

import java.util.List;
import java.util.Optional;

import static org.hibernate.sql.ast.SqlTreeCreationLogger.LOGGER;
import static org.springframework.http.MediaType.*;

@RestController
@RequestMapping("/applications")
public class applicationController {
    private final applicationRepository applicationRepository;
    private final managerService managerService;
    private final offerService offerService;
    private final talentService talentService;
    private final notificationRepository notificationRepository;


    public applicationController(tech.ouss.backend.Repository.applicationRepository applicationRepository, tech.ouss.backend.services.managerService managerService, tech.ouss.backend.services.offerService offerService, tech.ouss.backend.services.talentService talentService, tech.ouss.backend.Repository.notificationRepository notificationRepository) {
        this.applicationRepository = applicationRepository;
        this.managerService = managerService;
        this.offerService = offerService;
        this.talentService = talentService;
        this.notificationRepository = notificationRepository;
    }

    @GetMapping(path = "/{offerId}", produces = "application/json")
    public ResponseEntity<?> getApplicationsByOfferId(@PathVariable("offerId") int offerId) {
        try {
            List<application> applications = this.applicationRepository.findByOfferId(offerId);
            if (applications.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(applications);
        }catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred while fetching applications: " + e.getMessage());
        }
    }

    @PutMapping(path = "/{applicationId}", consumes = "application/json")
    public ResponseEntity<?> updateApplication(@PathVariable("applicationId") int applicationId, @RequestBody application updatedApplication) {
        try {
            application existingApplication = this.applicationRepository.findById(applicationId)
                    .orElseThrow(() -> new RuntimeException("Application not found with id: " + applicationId));
            updatedApplication.setApplicationId(applicationId);
            updatedApplication.setOffer(existingApplication.getOffer());
            updatedApplication.setTalent(existingApplication.getTalent());
            application savedApplication = this.applicationRepository.save(updatedApplication);
            return ResponseEntity.ok(savedApplication);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred while updating the application: " + e.getMessage());
        }
    }

    @GetMapping(path = "/manager/{email}" , produces = APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getAllApplicationByManager(@PathVariable("email") String email){
        try {
            manager existingManager = this.managerService.getManagerByEmail(email);
            if(existingManager == null){
                return ResponseEntity.badRequest().body("Ce manager avec email "+email +" n'existe pas");
            }

            Optional<List<application>> list = this.applicationRepository.findByManager(existingManager.getId());
            if (list.isPresent()){
                return ResponseEntity.ok(list);
            }
            return null;
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e);
        }
    }

    @PostMapping(path = "/add", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addApplication(@RequestBody application newApplication) {
        try {
            LOGGER.info("Received request to add a new application: " + newApplication);
            if (newApplication == null) {
                return ResponseEntity.badRequest().body("Invalid application data: Request body is empty.");
            }
            if (newApplication.getOffer() == null) {
                return ResponseEntity.badRequest().body("Invalid application data: Offer must not be null.");
            }
            offer applicationOffer = this.offerService.getOfferById(newApplication.getOffer().getOffer_id());
            if (applicationOffer == null) {
                return ResponseEntity.badRequest().body("Invalid application data: Offer with ID " + newApplication.getOffer().getOffer_id() + " does not exist.");
            }
            newApplication.setOffer(applicationOffer);
            LOGGER.info("Talent Email: " + newApplication.getTalent().getUser_id().getEmail());
            talent appliedTalent = this.talentService.getTalentByEmail(newApplication.getTalent().getUser_id().getEmail());
            if (appliedTalent == null) {
                return ResponseEntity.badRequest().body("Invalid application data: Talent with email " + newApplication.getTalent().getUser_id().getEmail() + " does not exist.");
            }
            newApplication.setTalent(appliedTalent);

            if (newApplication.getTalent() == null) {
                return ResponseEntity.badRequest().body("Invalid application data: Talent must not be null.");
            }

            application savedApplication = this.applicationRepository.save(newApplication);
            notification notification = new notification();
            notification.setType(NotificationType.NEW_CANDIDATE_APPLICATION);
            notification.setMessage("votre condidature est envoyer la condidature pour l'offre : "+ savedApplication.getOffer().getTitle()+" avec succes");
            notification.setUserRecipent(savedApplication.getTalent().getUser_id());
            this.notificationRepository.save(notification);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedApplication);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while adding the application: " + e.getMessage());
        }
    }

    @GetMapping(path = "/talent/{email}" , produces = APPLICATION_JSON_VALUE)
    public ResponseEntity<?> talentApplications(@PathVariable("email") String email){
        try {
            talent existedTalent = this.talentService.getTalentByEmail(email);
            if(existedTalent == null){
                return ResponseEntity.badRequest().body("Ce Talent avec email "+email +" n'existe pas");
            }

            return ResponseEntity.ok(this.applicationRepository.findByTalent(existedTalent.getTalent_id()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while adding the application: " + e.getMessage());
        }
    }

    @PutMapping(path = "status/{applicationId}" , consumes = APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateStatus(@PathVariable("applicationId") int applicationId , @RequestBody application application){
        try {
            Optional<application> existdApplication = this.applicationRepository.findById(applicationId);
            if (!existdApplication.isPresent()){
                return ResponseEntity.badRequest().body("Cette condidature avec id "+applicationId +" n'existe pas");
            }
            application.setApplicationId(existdApplication.get().getApplicationId());
            application.setOffer(existdApplication.get().getOffer());
            application.setTalent(existdApplication.get().getTalent());
            application.setAppliedWithCvPath(existdApplication.get().getAppliedWithCvPath());
            application.setCoverLetterPath(existdApplication.get().getCoverLetterPath());
            application.setNotes(existdApplication.get().getNotes());
            if(existdApplication.get().getStatus() == ApplicationStatus.ACCEPTED || existdApplication.get().getStatus() == ApplicationStatus.REJECTED){
                application.setStatus(existdApplication.get().getStatus());
            }

            notification notification = new notification();
            notification.setType(NotificationType.UPDATE_USER_INFORMATIONS);
            notification.setMessage("Votre Condidature pour le poste de "+application.getOffer().getTitle()+ " est modifiee");
            notification.setUserRecipent(application.getTalent().getUser_id());
            this.notificationRepository.save(notification);

            return ResponseEntity.ok(this.applicationRepository.save(application));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while adding the application: " + e.getMessage());
        }
    }

}
