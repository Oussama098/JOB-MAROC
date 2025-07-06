package tech.ouss.backend.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.ouss.backend.Repository.*;
import tech.ouss.backend.models.notification;
import tech.ouss.backend.models.userEntity;
import tech.ouss.backend.services.UserService;

import java.util.List;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@RestController
@RequestMapping("/notifications")
public class notificationController {
    private final notificationRepository notificationRepository;
    private final UserService userService;

    public notificationController(notificationRepository notificationRepository, UserService userService) {
        this.notificationRepository = notificationRepository;
        this.userService = userService;
    }

    @GetMapping(path = "/{email}" , produces = APPLICATION_JSON_VALUE)
    public ResponseEntity<?> NotificationsByUser (@PathVariable("email") String email){
        try {
            userEntity existedUser = this.userService.getUserByEmail(email);
            if(existedUser == null){
                return ResponseEntity.badRequest().body("ce utilsateur n'existe pas");
            }

            return ResponseEntity.ok(this.notificationRepository.getnotificationByEmail(email));


        }catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred  " + e.getMessage());
        }
    }

    @PutMapping(path = "/markAllAsRead/{email}")
    public ResponseEntity<?> markAllNotificationsAsRead(@PathVariable("email") String email) {
        try {
            userEntity user = userService.getUserByEmail(email);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur avec l'email " + email + " introuvable.");
            }

            List<notification> unreadNotifications = notificationRepository.findByUserRecipentAndIsReadFalse(email);

            if (unreadNotifications.isEmpty()) {
                return ResponseEntity.ok().body("Aucune nouvelle notification à marquer comme lue pour cet utilisateur.");
            }

            for (notification notif : unreadNotifications) {
                notif.setRead(true);
            }

            notificationRepository.saveAll(unreadNotifications);

            return ResponseEntity.ok().body("Toutes les notifications ont été marquées comme lues pour " + email + ".");

        } catch (Exception e) {
            System.err.println("Erreur lors de la mise à jour de toutes les notifications comme lues pour l'email " + email + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Une erreur est survenue lors de la mise à jour de toutes les notifications : " + e.getMessage());
        }
    }


}
