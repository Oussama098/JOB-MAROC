package tech.ouss.backend.controllers;
import DTO.changePasswordRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import tech.ouss.backend.Enums.AcceptanceStatus;
import tech.ouss.backend.Enums.NotificationType;
import tech.ouss.backend.Repository.*;
import tech.ouss.backend.models.*;
import tech.ouss.backend.services.*;
import tech.ouss.backend.Repository.talent_diplomeRepository;

import java.time.LocalDateTime;
import java.util.*;

import static org.hibernate.sql.ast.SqlTreeCreationLogger.LOGGER;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@RestController
@RequestMapping(path = "/talent")
public class talentController {
    private final talentService talentService;
    private final UserService userService;
    private final diplomeService diplomeService;
    private final experianceService experianceService;
    private final skillsService skillsService;
    private final EmailService emailService;
    private final talent_diplomeRepository talent_diplomeRepository;
    private final tech.ouss.backend.Repository.talentCvRepository talentCvRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final notificationRepository notificationRepository;

    public talentController(talentService talentService , UserService userService, diplomeService diplomeService, experianceService experianceService, skillsService skillsService, EmailService emailService, talent_diplomeRepository talentDiplomeRepository, talentCvRepository talentCvRepository, notificationRepository notificationRepository) {
        this.talentService = talentService;
        this.userService= userService;
        this.diplomeService = diplomeService;
        this.experianceService = experianceService;
        this.skillsService = skillsService;
        this.emailService = emailService;
        talent_diplomeRepository = talentDiplomeRepository;
        this.talentCvRepository = talentCvRepository;
        this.notificationRepository = notificationRepository;
    }


    @PostMapping(path = "/add" , consumes = APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addUser(@RequestBody talent talent) {
        System.out.println("Talent: " + talent);
        userEntity ExistedUser = this.userService.getUserByEmail(talent.getUser_id().getEmail());
        if (ExistedUser != null) {
            return ResponseEntity.badRequest().body("User already exists");
        }
        talent.getUser_id().setPassword("talent");
//        talent.getUser_id().setSituation_familliale(SituationFamiliale.SINGLE);
        talent.getUser_id().setRole(new role(2));
        talent.getUser_id().setIs_accepted(AcceptanceStatus.ACCEPTED);

        String subject = "Your Application Status: Accepted - Welcome to Job Maroc!";
        String htmlBody = """
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Your Application Status: Accepted</title>
                            <style>
                                body {
                                    font-family: 'Arial', sans-serif;
                                    line-height: 1.6;
                                    color: #333333;
                                    background-color: #f4f4f4;
                                    margin: 0;
                                    padding: 20px;
                                }
                                .container {
                                    max-width: 600px;
                                    margin: 20px auto;
                                    background-color: #ffffff;
                                    padding: 30px;
                                    border-radius: 8px;
                                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                                    border-top: 4px solid #4CAF50; /* Green border for success */
                                }
                                .header {
                                    text-align: center;
                                    margin-bottom: 20px;
                                }
                                .header img {
                                    max-width: 150px; /* Adjust logo size */
                                    height: auto;
                                }
                                .header h1 {
                                    color: #4CAF50; /* Green color for heading */
                                    font-size: 24px;
                                    margin-top: 10px;
                                }
                                .content {
                                    margin-bottom: 20px;
                                }
                                .content p {
                                    margin-bottom: 15px;
                                }
                                .button {
                                    display: inline-block;
                                    background-color: #4CAF50; /* Green button */
                                    color: #ffffff;
                                    padding: 10px 20px;
                                    text-decoration: none;
                                    border-radius: 5px;
                                    font-weight: bold;
                                }
                                .footer {
                                    text-align: center;
                                    margin-top: 30px;
                                    font-size: 12px;
                                    color: #888888;
                                    border-top: 1px solid #eeeeee;
                                    padding-top: 20px;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>Congratulations! Your Application is Accepted</h1>
                                </div>
                                <div class="content">
                                    <p>Dear %s,</p> <p>We are thrilled to inform you that your application to Job Maroc has been reviewed and <strong>accepted</strong>!</p>
                                    <p>We were impressed with your profile and believe you will be a great addition to our platform.</p>
                                    <p>You can now log in to your account to explore opportunities and update your profile.</p>
                                    <p style="text-align: center;">
                                        <a href="YOUR_LOGIN_PAGE_URL" class="button">Go to Your Account</a>
                                    </p>
                                    <p>If you have any questions, feel free to contact us.</p>
                                    <p>Welcome aboard!</p>
                                </div>
                                <div class="footer">
                                    <p>&copy; 2025 Job Maroc. All rights reserved.</p>
                                    <p>Job Maroc Team</p>
                                </div>
                            </div>
                        </body>
                        </html>
                        
                       \s""".formatted(talent.getUser_id().getFirstName());
        emailService.sendEmail(talent.getUser_id().getEmail(), subject, htmlBody, true);
        userEntity user = this.userService.addUser(talent.getUser_id());
        talent.getUser_id().setUserId(user.getUserId());
        talent t = this.talentService.save(talent);
        for (talent_diplome d : talent.getDiplomeList()) {
            d.setTalent(t);
            this.diplomeService.addDiplome(d);
        }
        for(talent_skills s : talent.getSkillsList()){
            s.setTalent(t);
            this.skillsService.addSkill(s);
        }
        for (talent_experiance e : talent.getExperianceList()) {
            e.setTalent(t);
            this.experianceService.addExperiance(e);
        }
        notification notification = new notification();
        notification.setType(NotificationType.NEW_USER_REGISTERED);
        notification.setMessage("Vous etes inscrit avec succes");
        notification.setUserRecipent(t.getUser_id());
        this.notificationRepository.save(notification);
        return ResponseEntity.ok(t);
    }

    @GetMapping(path = "/{id}", produces = APPLICATION_JSON_VALUE)
    public talent getTalentById(@PathVariable("id") int id) {
        try {
            return this.talentService.getTalentById(id);
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            return null;
        }
    }

    @DeleteMapping("/delete/{userId}")
    public ResponseEntity<?> deleteTalent(@PathVariable int userId) {
        LOGGER.info("Attempting to delete talent associated with user ID: {"+userId+"}");

        try {
            // Step 1: Retrieve the Talent entity by user ID
            userEntity user = userService.getUserById(userId);

            // Step 2: Check if the talent exists
            if (user == null) {
                LOGGER.warn("No user found for user ID: {"+userId+"}. Cannot delete.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("user not found for user ID: " + userId);
            }
            talent talent = this.talentService.getTalentByUserID(userId);
            if (talent == null) {
                LOGGER.warn("No talent found for user ID: {"+userId+"}. Cannot delete.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("talent not found for user ID: " + userId);
            }

            this.userService.deleteUser(userId);
            LOGGER.info("Talent and potentially associated user with user ID {} deleted successfully.");
            return ResponseEntity.noContent().build();

        } catch (IllegalArgumentException iae) { // Catch specific exceptions if Math.toIntExact was the issue elsewhere
            LOGGER.error("Invalid argument during deletion for user ID {"+userId+"}: {"+ iae.getMessage()+"}");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid data provided for deletion: " + iae.getMessage());
        } catch (Exception ex) {
            LOGGER.error("An unexpected error occurred while deleting talent for user ID {"+userId+"}: {"+ ex.getMessage()+"}");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + ex.getMessage());
        }
    }

    @GetMapping("/deplomes/{talentId}")
    public ResponseEntity<?> getDiplomesByTalentId(@PathVariable int talentId) {
        try {
            List<talent_diplome> diplomeList = talent_diplomeRepository.findByTalentId(talentId);
            if (diplomeList.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No diplomas found for talent ID: " + talentId);
            }
            return ResponseEntity.ok(diplomeList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }

    @GetMapping(path ="/cvs/{talentEmail}" , produces = APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getTalentByEmail(@PathVariable String talentEmail) {
        try {
            talent talent = this.talentService.getTalentByEmail(talentEmail);
            List<talentCv> talentCvs = this.talentService.getTalentCvsByTalentId(talent.getTalent_id());


            if (talent == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Talent not found for email: " + talentEmail);
            }

            if(talentCvs.isEmpty()){
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No CVs found for talent with email: " + talentEmail);
            }
            return ResponseEntity.ok(talentCvs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }

    @GetMapping("/all-data/{userId}")
    public ResponseEntity<?> getAllTalentData(@PathVariable("userId") int userId) {
        int talentId = 0;
        try {
            talentId = this.talentService.getTalentByUserID(userId).getTalent_id();
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            return null;
        }

        try {
            Map<String, Object> allData = new HashMap<>();
            boolean hasData = false;

            // Récupérer diplômes
            try {
                List<talent_diplome> diplomes = talent_diplomeRepository.findByTalentId(talentId);
                if (diplomes != null && !diplomes.isEmpty()) {
                    allData.put("diplomes", diplomes);
                    hasData = true;
                } else {
                    allData.put("diplomes", new ArrayList<>());
                }
            } catch (Exception e) {
                allData.put("diplomes", new ArrayList<>());
                allData.put("diplomesError", "Erreur lors de la récupération des diplômes: " + e.getMessage());
                System.err.println("Erreur diplômes pour talent " + talentId + ": " + e.getMessage());
            }

            // Récupérer expériences
            try {
                List<talent_experiance> experiences = this.experianceService.findByTalentId(talentId);
                if (experiences != null && !experiences.isEmpty()) {
                    allData.put("experiences", experiences);
                    hasData = true;
                } else {
                    allData.put("experiences", new ArrayList<>());
                }
            } catch (Exception e) {
                allData.put("experiences", new ArrayList<>());
                allData.put("experiencesError", "Erreur lors de la récupération des expériences: " + e.getMessage());
                System.err.println("Erreur expériences pour talent " + talentId + ": " + e.getMessage());
            }

            // Récupérer CVs
            try {
                List<talentCv> cvs = talentCvRepository.findByTalentId(talentId);
                if (cvs != null && !cvs.isEmpty()) {
                    allData.put("cvs", cvs);
                    hasData = true;
                } else {
                    allData.put("cvs", new ArrayList<>());
                }
            } catch (Exception e) {
                allData.put("cvs", new ArrayList<>());
                allData.put("cvsError", "Erreur lors de la récupération des CVs: " + e.getMessage());
                System.err.println("Erreur CVs pour talent " + talentId + ": " + e.getMessage());
            }

            // Récupérer compétences
            try {
                List<talent_skills> skills = this.skillsService.getSkillsByTalentId(talentId);
                if (skills != null && !skills.isEmpty()) {
                    allData.put("skills", skills);
                    hasData = true;
                } else {
                    allData.put("skills", new ArrayList<>());
                }
            } catch (Exception e) {
                allData.put("skills", new ArrayList<>());
                allData.put("skillsError", "Erreur lors de la récupération des compétences: " + e.getMessage());
                System.err.println("Erreur compétences pour talent " + talentId + ": " + e.getMessage());
            }

            allData.put("talentId", talentId);
            allData.put("timestamp", new Date());
            allData.put("hasData", hasData);

            int totalItems = 0;
            totalItems += ((List<?>) allData.get("diplomes")).size();
            totalItems += ((List<?>) allData.get("experiences")).size();
            totalItems += ((List<?>) allData.get("cvs")).size();
            totalItems += ((List<?>) allData.get("skills")).size();
            allData.put("totalItems", totalItems);
            return ResponseEntity.ok(allData);

        } catch (Exception e) {
            System.err.println("Erreur générale pour talent " + talentId + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la récupération des données: " + e.getMessage());
        }

    }


    @PutMapping(path = "/update", consumes = APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateTalent(@RequestBody userEntity userUpdated) {
        LOGGER.info("Updating manager with user ID: {"+userUpdated.getUserId()+"}");
        try {
            LOGGER.info("Received user data for update: {"+userUpdated+"}");
            talent existingTalent = this.talentService.getTalentByUserID(Math.toIntExact(userUpdated.getUserId()));
            if (existingTalent == null) {
                LOGGER.warn("No talent found for user ID: {"+userUpdated.getUserId()+"}");
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No talent found for user ID: " + userUpdated.getUserId());
            }
            existingTalent.getUser_id().setNationality(userUpdated.getNationality());
            existingTalent.getUser_id().setFirstName(userUpdated.getFirstName());
            existingTalent.getUser_id().setLastName(userUpdated.getLastName());
            existingTalent.getUser_id().setEmail(userUpdated.getEmail());
            existingTalent.getUser_id().setNum_tel(userUpdated.getNum_tel());
            existingTalent.getUser_id().setAddress(userUpdated.getAddress());
            existingTalent.getUser_id().setSexe(userUpdated.getSexe());
            existingTalent.getUser_id().setDatenais(userUpdated.getDatenais());
            existingTalent.getUser_id().setLieu(userUpdated.getLieu());
            existingTalent.getUser_id().setSituation_familliale(userUpdated.getSituation_familliale());
            existingTalent.getUser_id().setCin(userUpdated.getCin());
            existingTalent.getUser_id().setNationality(userUpdated.getNationality());

            notification notification = new notification();
            notification.setType(NotificationType.UPDATE_USER_INFORMATIONS);
            notification.setMessage("Votre informations sont modifiees avec succes");
            notification.setUserRecipent(existingTalent.getUser_id());
            this.notificationRepository.save(notification);

//            existingTalent.set(LocalDateTime.now());
            return ResponseEntity.ok(this.talentService.save(existingTalent));
        } catch (Exception ex) {
            LOGGER.error("An error occurred while updating manager for user ID {"+userUpdated.getUserId()+"}: {"+ ex.getMessage()+"}");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + ex.getMessage());
        }
    }

    @PutMapping(path = "/update/password", consumes = APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateTalentPassword(@RequestBody changePasswordRequest userUpdated) {
        LOGGER.info("Updating password for user ID: {"+userUpdated.getUserId()+"}");
        try {
            LOGGER.info("Received user data for password update: {"+userUpdated+"}");
            talent existingTalent = this.talentService.getTalentByUserID(Math.toIntExact(userUpdated.getUserId()));
            if (existingTalent == null) {
                LOGGER.warn("No talent found for user ID: {"+userUpdated.getUserId()+"}");
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No talent found for user ID: " + userUpdated.getUserId());
            }
            LOGGER.info("Current password for user ID {"+userUpdated.getUserId()+"}: {"+existingTalent.getUser_id().getPassword()+"}");
            LOGGER.info("the old password provided: {"+passwordEncoder.encode(userUpdated.getOldPassword())+"}");
            if (!passwordEncoder.matches(userUpdated.getOldPassword(), existingTalent.getUser_id().getPassword())) {
                LOGGER.warn("Current password mismatch for user ID: {}", new Integer[]{userUpdated.getUserId()});
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Le mot de passe actuel est incorrect.");
            }
            existingTalent.getUser_id().setPassword(passwordEncoder.encode(userUpdated.getNewPassword()));
            notification notification = new notification();
            notification.setType(NotificationType.UPDATE_USER_INFORMATIONS);
            notification.setMessage("Votre Mot de Passe a changer avec succees");
            notification.setUserRecipent(existingTalent.getUser_id());
            this.notificationRepository.save(notification);
            return ResponseEntity.ok(this.talentService.save(existingTalent));
        } catch (Exception ex) {
            LOGGER.error("An error occurred while updating password for user ID {"+userUpdated.getUserId()+"}: {"+ ex.getMessage()+"}");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + ex.getMessage());
        }
    }


    @PostMapping(path = "/skills/add/{talentId}" , consumes = APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addTalentSkills(@RequestBody talent_skills talentSkills , @PathVariable int talentId) {
        try {

            talent existingTalent = this.talentService.getTalentById(talentId);
            if (existingTalent == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Talent not found.");
            }
            talentSkills.setTalent(existingTalent);
            this.skillsService.addSkill(talentSkills);
            return ResponseEntity.ok("Skill added successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }

    @PostMapping(path = "/diplome/add/{talentId}" , consumes = APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addTalentDepolome(@RequestBody talent_diplome talentDiplome , @PathVariable int talentId) {
        try {

            talent existingTalent = this.talentService.getTalentById(talentId);
            if (existingTalent == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Talent not found.");
            }
            talentDiplome.setTalent(existingTalent);
            this.diplomeService.addDiplome(talentDiplome);
            return ResponseEntity.ok("Diplome added successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }

    @PostMapping(path = "/experience/add/{talentId}" , consumes = APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addTalentExperience(@RequestBody talent_experiance talentExperiance , @PathVariable int talentId) {
        try {

            talent existingTalent = this.talentService.getTalentById(talentId);
            if (existingTalent == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Talent not found.");
            }
            talentExperiance.setTalent(existingTalent);
            this.experianceService.addExperiance(talentExperiance);
            return ResponseEntity.ok("experience added successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }

    @DeleteMapping(path = "/skill/delete/{skillId}")
    public ResponseEntity<?> deleteSkill(@PathVariable("skillId") int skillId){
        try {
            talent_skills skill = this.skillsService.getSkillById(skillId);
            if (skill==null){
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("skill not found.");
            }
            this.skillsService.delete(skill);
            return ResponseEntity.ok("skill deleted");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }

    @DeleteMapping(path = "/diplome/delete/{diplomeId}")
    public ResponseEntity<?> deleteDiplome(@PathVariable("diplomeId") int diplomeId){
        try {
            talent_diplome diplome = this.diplomeService.getDiplomeById(diplomeId);
            if (diplome==null){
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("diplome not found.");
            }
            this.diplomeService.delete(diplome);
            return ResponseEntity.ok("diplome deleted");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }

    @DeleteMapping(path = "/experience/delete/{experienceId}")
    public ResponseEntity<?> deleteExperienceId(@PathVariable("experienceId") int experienceId){
        try {
            talent_experiance experience = this.experianceService.getExperianceById(experienceId);
            if (experience==null){
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("diplome not found.");
            }
            this.experianceService.delete(experience);
            return ResponseEntity.ok("experience deleted");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }





    
}


