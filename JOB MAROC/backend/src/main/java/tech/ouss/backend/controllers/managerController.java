package tech.ouss.backend.controllers;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tech.ouss.backend.Enums.AcceptanceStatus;
import tech.ouss.backend.Enums.NotificationType;
import tech.ouss.backend.Repository.notificationRepository;
import tech.ouss.backend.Repository.roleRepository;
import tech.ouss.backend.models.*;
import tech.ouss.backend.services.*;
import tech.ouss.backend.Repository.entrepriseRepository;

import java.time.LocalDateTime;

import static org.hibernate.sql.ast.SqlTreeCreationLogger.LOGGER;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@RestController
@RequestMapping("/manager")
public class managerController {
    private final managerService managerService;
    private final UserService userService;
    private final entrepriseRepository entrepriseRepository;
    private final roleRepository roleRepository;
    private final notificationRepository notificationRepository;

    public managerController(EmailService emailService, UserService userService, tech.ouss.backend.services.managerService managerService, entrepriseRepository entrepriseRepository, roleRepository roleRepository, tech.ouss.backend.Repository.notificationRepository notificationRepository) {
        this.emailService = emailService;
        this.userService = userService;
        this.managerService = managerService;
        this.entrepriseRepository = entrepriseRepository;
        this.roleRepository = roleRepository;
        this.notificationRepository = notificationRepository;
    }

    private final  EmailService emailService;

    @PostMapping(path = "/add" , consumes = APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addManager(@RequestBody manager manager) {
        System.out.println("manager: " + manager);
        userEntity ExistedUser = this.userService.getUserByEmail(manager.getUser().getEmail());
        if (ExistedUser != null){
            return ResponseEntity.badRequest().body("User already exist");
        }
        if(manager.getUser() == null) {
            throw new IllegalArgumentException("Manager username and password cannot be null");
        }

        try {
            manager.getUser().setPassword("manager");
            manager.getUser().setRole(new role(3));
            manager.setCreatedAt(LocalDateTime.now());
            String subject = "Your Manager Account Information";
            String htmlBody = """
                    <!DOCTYPE html>
                           <html lang="en">
                           <head>
                               <meta charset="UTF-8">
                               <meta name="viewport" content="width=device-width, initial-scale=1.0">
                               <title>Your Manager Account Information</title>
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
                                       border-top: 4px solid #007BFF; /* Blue border for manager */
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
                                       color: #007BFF; /* Blue color for heading */
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
                                       background-color: #007BFF; /* Blue button */
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
                                       <h1>Your Manager Account Has Been Created</h1>
                                   </div>
                                   <div class="content">
                                       <p>Dear,</p>
                                       <p>This email confirms that your manager account for Job Maroc has been successfully created.</p>
                                       <p>You can log in using your email address and the temporary password provided (manager)</p>
                                       <p style="text-align: center;">
                                           <a href="%s" class="button">Go to Login</a>
                                       </p>
                                       <p>Please log in as soon as possible to set your permanent password and begin managing the platform.</p>
                                       <p>If you have any questions, please contact technical support.</p>
                                   </div>
                                   <div class="footer">
                                       <p>&copy; 2025 Job Maroc. All rights reserved.</p>
                                       <p>Job Maroc Team</p>
                                   </div>
                               </div>
                           </body>
                           </html>
                      \s""";
            emailService.sendEmail(manager.getUser().getEmail(), subject, htmlBody, true);
            this.userService.addUser(manager.getUser());
            manager newManager = this.managerService.addManager(manager);
            notification notification = new notification();
            notification.setType(NotificationType.NEW_USER_REGISTERED);
            notification.setMessage(newManager.getUser().getFirstName() +" "+newManager.getUser().getLastName() +" est inscrit avec succes");
            notification.setUserRecipent(newManager.getUser());
            this.notificationRepository.save(notification);
            return ResponseEntity.ok(manager);
        }catch (Exception ex) {
            return ResponseEntity.badRequest().body("Error: " + ex.getMessage());
        }

    }

    @DeleteMapping("/delete/{userId}")
    public ResponseEntity<?> deleteManager(@PathVariable int userId) {
        LOGGER.info("Attempting to Manager manager associated with user ID: {"+userId+"}");
        try {

            userEntity user = userService.getUserById(userId);
            if (user == null) {
                LOGGER.warn("No user found for user ID: {"+userId+"}. Cannot delete.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("user not found for user ID: " + userId);
            }
            manager manager = this.managerService.getManagerByUserId(userId);
            if (manager == null) {
                LOGGER.info("No manager found for user ID: {"+userId+"}. we will delete the user.");
                this.userService.deleteUser(userId);
                return ResponseEntity.noContent().build();
            }

            this.userService.deleteUser(userId);
            LOGGER.info("manager and potentially associated user with user ID {} deleted successfully.");
            return ResponseEntity.noContent().build();

        } catch (IllegalArgumentException iae) { // Catch specific exceptions if Math.toIntExact was the issue elsewhere
            LOGGER.error("Invalid argument during deletion for user ID {"+userId+"}: {"+ iae.getMessage()+"}");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid data provided for deletion: " + iae.getMessage());
        } catch (Exception ex) {
            LOGGER.error("An unexpected error occurred while deleting manager for user ID {"+userId+"}: {"+ ex.getMessage()+"}");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + ex.getMessage());
        }
    }

    @GetMapping(path = "/{email}" , produces = APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getManagerByEmail(@PathVariable String email) {
        LOGGER.info("Fetching manager associated with email: {"+email+"}");
        try {
            manager manager = this.managerService.getManagerByEmail(email);
            if (manager == null) {
                LOGGER.warn("No manager found for email: {"+email+"}");
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No manager found for email: " + email);
            }
            return ResponseEntity.ok(manager);
        } catch (Exception ex) {
            LOGGER.error("An error occurred while fetching manager for email {"+email+"}: {"+ ex.getMessage()+"}");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + ex.getMessage());
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getManagerByUserId(@PathVariable int userId) {
        LOGGER.info("Fetching manager associated with user ID: {"+userId+"}");
        try {
            manager manager = this.managerService.getManagerByUserId(userId);
            if (manager == null) {
                LOGGER.warn("No manager found for user ID: {"+userId+"}");
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No manager found for user ID: " + userId);
            }
            return ResponseEntity.ok(manager);
        } catch (Exception ex) {
            LOGGER.error("An error occurred while fetching manager for user ID {"+userId+"}: {"+ ex.getMessage()+"}");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + ex.getMessage());
        }
    }

    @PostMapping("/addNew")
    @Transactional // Assure que toutes les opérations de persistance sont atomiques
    public ResponseEntity<?> registerManager(@Valid @RequestBody manager requestPayload) {
        // Accéder aux entités directes du payload
        userEntity userData = requestPayload.getUser();
        entreprise entrepriseData = requestPayload.getEntreprise();

        // 1. Vérifier si l'utilisateur existe déjà par email
        if (this.userService.getUserByEmail(userData.getEmail()) != null) {
            return new ResponseEntity<>("Email utilisateur déjà utilisé.", HttpStatus.CONFLICT);
        }

        // 2. Vérifier si une entreprise avec le même nom ou email existe déjà
        if (entrepriseRepository.findByNomEntreprise(entrepriseData.getNomEntreprise()).isPresent()) {
            return new ResponseEntity<>("Une entreprise avec ce nom existe déjà.", HttpStatus.CONFLICT);
        }
        if (entrepriseData.getEmail() != null && entrepriseRepository.findByEmail(entrepriseData.getEmail()).isPresent()) {
            return new ResponseEntity<>("Une entreprise avec cet email existe déjà.", HttpStatus.CONFLICT);
        }

        try {
            // 3. Créer la nouvelle entreprise
            entreprise newEntreprise = new entreprise();
            // Copiez les données de `entrepriseData` vers `newEntreprise`
            newEntreprise.setNomEntreprise(entrepriseData.getNomEntreprise());
            newEntreprise.setAdresse(entrepriseData.getAdresse());
            newEntreprise.setEmail(entrepriseData.getEmail());
            newEntreprise.setTelephone(entrepriseData.getTelephone());
            newEntreprise.setSiteWeb(entrepriseData.getSiteWeb());
            newEntreprise.setDescription(entrepriseData.getDescription());
            newEntreprise.setLogo(entrepriseData.getLogo());
            newEntreprise.setSecteurActivite(entrepriseData.getSecteurActivite());
            newEntreprise.setTailleEntreprise(entrepriseData.getTailleEntreprise());
            newEntreprise.setAnneeCreation(entrepriseData.getAnneeCreation());
            newEntreprise.setPays(entrepriseData.getPays());
            newEntreprise.setVille(entrepriseData.getVille());
            newEntreprise.setCodePostal(entrepriseData.getCodePostal());
            newEntreprise.setRegion(entrepriseData.getRegion());
            newEntreprise.setStatutJuridique(entrepriseData.getStatutJuridique());
            newEntreprise.setNumeroSiren(entrepriseData.getNumeroSiren());
            newEntreprise.setNumeroSiret(entrepriseData.getNumeroSiret());
            newEntreprise.setNumeroTvaIntra(entrepriseData.getNumeroTvaIntra());
            newEntreprise.setCapitalSocial(entrepriseData.getCapitalSocial());
            newEntreprise.setFormeJuridique(entrepriseData.getFormeJuridique());
            entreprise savedEntreprise = entrepriseRepository.save(newEntreprise);

            userEntity newUser = new userEntity();
            newUser.setFirstName(userData.getFirstName());
            newUser.setLastName(userData.getLastName());
            newUser.setEmail(userData.getEmail());
            newUser.setPassword(userData.getPassword());
            newUser.setImage_path(" ");

            newUser.setRegistrationDate(LocalDateTime.now());
            newUser.setActive(false);
            newUser.setIs_accepted(AcceptanceStatus.WAITING);

            role managerRole = roleRepository.findByRole_name("MANAGER");
            if (managerRole == null) {
                throw new RuntimeException("Rôle 'MANAGER' non trouvé dans la base de données.");
            }
            newUser.setRole(managerRole);

            userEntity savedUser = userService.addUser(newUser);

            manager newManager = new manager();
            newManager.setUser(savedUser);
            newManager.setEntreprise(savedEntreprise);
            newManager.setCreatedAt(LocalDateTime.now());

            managerService.addManager(newManager);

            notification notification = new notification();
            notification.setType(NotificationType.NEW_USER_REGISTERED);
            notification.setMessage("Bienvenue au notre platforme");
            notification.setUserRecipent(newManager.getUser());
            this.notificationRepository.save(notification);

            return new ResponseEntity<>("Inscription du manager réussie.", HttpStatus.CREATED);

        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            e.printStackTrace(); // Log l'exception pour le débogage
            return new ResponseEntity<>("Erreur interne du serveur lors de l'inscription.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping(path = "/update", consumes = APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateManager(@RequestBody userEntity userUpdated) {
        LOGGER.info("Updating manager with user ID: {"+userUpdated.getUserId()+"}");
        try {
            LOGGER.info("Received user data for update: {"+userUpdated+"}");
            manager existingManager = this.managerService.getManagerByUserId(Math.toIntExact(userUpdated.getUserId()));
            if (existingManager == null) {
                LOGGER.warn("No manager found for user ID: {"+userUpdated.getUserId()+"}");
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No manager found for user ID: " + userUpdated.getUserId());
            }
            existingManager.getUser().setNationality(userUpdated.getNationality());
            existingManager.getUser().setFirstName(userUpdated.getFirstName());
            existingManager.getUser().setLastName(userUpdated.getLastName());
            existingManager.getUser().setEmail(userUpdated.getEmail());
            existingManager.getUser().setNum_tel(userUpdated.getNum_tel());
            existingManager.getUser().setAddress(userUpdated.getAddress());
            existingManager.getUser().setSexe(userUpdated.getSexe());
            existingManager.getUser().setDatenais(userUpdated.getDatenais());
            existingManager.getUser().setLieu(userUpdated.getLieu());
            existingManager.getUser().setSituation_familliale(userUpdated.getSituation_familliale());
            existingManager.getUser().setCin(userUpdated.getCin());
            existingManager.getUser().setNationality(userUpdated.getNationality());
            existingManager.setUpdatedAt(LocalDateTime.now());
            this.managerService.addManager(existingManager);
            notification notification = new notification();
            notification.setType(NotificationType.UPDATE_USER_INFORMATIONS);
            notification.setMessage(existingManager.getUser().getFirstName() +" est modifiee ses infos avec succes");
            notification.setUserRecipent(existingManager.getUser());
            this.notificationRepository.save(notification);
            return ResponseEntity.ok(existingManager);
        } catch (Exception ex) {
            LOGGER.error("An error occurred while updating manager for user ID {"+userUpdated.getUserId()+"}: {"+ ex.getMessage()+"}");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + ex.getMessage());
        }
    }

    @PutMapping(path = "/entreprise/update/{emailManager}" , consumes = "application/json")
    public ResponseEntity<?> updateEntreprise(@PathVariable("emailManager") String emailManager , @RequestBody entreprise updateEntreprise){
        try {
            manager existingManager = this.managerService.getManagerByEmail(emailManager);
            if (existingManager == null){
                return ResponseEntity.badRequest().body("ce manager n'existe pas");
            }
            entreprise managerEntreprise = existingManager.getEntreprise();
            managerEntreprise.setNomEntreprise(updateEntreprise.getNomEntreprise());
            managerEntreprise.setAdresse(updateEntreprise.getAdresse());
            managerEntreprise.setTelephone(updateEntreprise.getTelephone());
            managerEntreprise.setEmail(updateEntreprise.getEmail());
            managerEntreprise.setSiteWeb(updateEntreprise.getSiteWeb());
            managerEntreprise.setDescription(updateEntreprise.getDescription());
            managerEntreprise.setLogo(updateEntreprise.getLogo());
            managerEntreprise.setSecteurActivite(updateEntreprise.getSecteurActivite());
            managerEntreprise.setTailleEntreprise(updateEntreprise.getTailleEntreprise());
            managerEntreprise.setAnneeCreation(updateEntreprise.getAnneeCreation());
            managerEntreprise.setPays(updateEntreprise.getPays());
            managerEntreprise.setVille(updateEntreprise.getVille());
            managerEntreprise.setCodePostal(updateEntreprise.getCodePostal());
            managerEntreprise.setRegion(updateEntreprise.getRegion());
            managerEntreprise.setStatutJuridique(updateEntreprise.getStatutJuridique());
            managerEntreprise.setNumeroSiren(updateEntreprise.getNumeroSiren());
            managerEntreprise.setNumeroSiret(updateEntreprise.getNumeroSiret());
            managerEntreprise.setNumeroTvaIntra(updateEntreprise.getNumeroTvaIntra());
            managerEntreprise.setCapitalSocial(updateEntreprise.getCapitalSocial());
            managerEntreprise.setFormeJuridique(updateEntreprise.getFormeJuridique());
            existingManager.setEntreprise(managerEntreprise);
            manager addedManager = this.managerService.addManager(existingManager);
            notification notification = new notification();
            notification.setType(NotificationType.UPDATE_USER_INFORMATIONS);
            notification.setMessage(addedManager.getUser().getFirstName() +", les donnees de votre entreprise sont modifiees avec avec succes");
            notification.setUserRecipent(addedManager.getUser());
            this.notificationRepository.save(notification);
            return ResponseEntity.ok(addedManager);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e);
        }
    }
}
