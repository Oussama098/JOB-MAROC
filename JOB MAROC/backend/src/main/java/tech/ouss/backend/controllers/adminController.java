package tech.ouss.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.ouss.backend.Enums.AcceptanceStatus;
import tech.ouss.backend.Enums.NotificationType;
import tech.ouss.backend.models.admin;
import tech.ouss.backend.models.notification;
import tech.ouss.backend.models.role;
import tech.ouss.backend.models.userEntity;
import tech.ouss.backend.services.*;

import java.time.LocalDateTime;

import static org.hibernate.sql.ast.SqlTreeCreationLogger.LOGGER;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@RestController
@RequestMapping("/admin")
public class adminController {
    @Autowired
    private final adminService adminService;
    private final UserService userService;
    private final EmailService emailService;

    public adminController(tech.ouss.backend.services.adminService adminService, UserService userService, EmailService emailService) {
        this.adminService = adminService;
        this.userService = userService;
        this.emailService = emailService;
    }

    // Add methods to handle admin-related requests here
    @PostMapping(path = "/add" , consumes = APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addAdmin(@RequestBody admin admin) {
        System.out.println("Admin: " + admin);
        userEntity ExistedUser = this.userService.getUserByEmail(admin.getUser().getEmail());
        if (ExistedUser != null){
            return ResponseEntity.badRequest().body("User already exist");
        }
        if(admin == null) {
            throw new IllegalArgumentException("Admin object cannot be null");
        }
        if(admin.getUser() == null) {
            throw new IllegalArgumentException("Admin username and password cannot be null");
        }

        try {
            admin.getUser().setPassword("admin");
            admin.getUser().setRole(new role(1));
            admin.setCreated_at(LocalDateTime.now());
            admin.getUser().setIs_accepted(AcceptanceStatus.ACCEPTED);
            String subject = "Your Admin Account Information";
            String htmlBody = """
                    <!DOCTYPE html>
                           <html lang="en">
                           <head>
                               <meta charset="UTF-8">
                               <meta name="viewport" content="width=device-width, initial-scale=1.0">
                               <title>Your Admin Account Information</title>
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
                                       border-top: 4px solid #007BFF; /* Blue border for admin */
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
                                       <h1>Your Admin Account Has Been Created</h1>
                                   </div>
                                   <div class="content">
                                       <p>Dear %s,</p>
                                       <p>This email confirms that your administrator account for Job Maroc has been successfully created.</p>
                                       <p>You can log in using your email address and the temporary password provided (admin)</p>
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
                       """;

            emailService.sendEmail(admin.getUser().getEmail(), subject, htmlBody, true);
            userEntity user = this.userService.addUser(admin.getUser());
            notification notification = new notification();
            notification.setType(NotificationType.NEW_USER_REGISTERED);
            notification.setMessage("Votre Compte est cree avec succes");
            notification.setUserRecipent(user);
            return ResponseEntity.ok(adminService.addAdmin(admin));
        }catch (Exception ex) {
            return ResponseEntity.badRequest().body("Error: " + ex.getMessage());
        }


    }

    @DeleteMapping("/delete/{userId}")
    public ResponseEntity<?> deleteAdmin(@PathVariable int userId) {
        LOGGER.info("Attempting to delete admin associated with user ID: {"+userId+"}");
        try {
            // Step 1: Retrieve the admin entity by user ID
            userEntity user = userService.getUserById(userId);
//            LOGGER.info(user.toString());
            // Step 2: Check if the admin exists
            if (user == null) {
                LOGGER.warn("No user found for user ID: {"+userId+"}. Cannot delete.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("user not found for user ID: " + userId);
            }
            admin admin = this.adminService.getAdminByUserId(userId);
            if (admin == null) {
                LOGGER.info("No admin found for user ID: {"+userId+"}. we will delete the user.");
                this.userService.deleteUser(userId);
                return ResponseEntity.noContent().build();
            }
            if(admin.isMain()){
                LOGGER.error("An unexpected error occurred while deleting admin for user ID {"+userId+"}");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("You cannot delete the main Admin");
            }

            this.userService.deleteUser(userId);
            LOGGER.info("admin and potentially associated user with user ID {} deleted successfully.");
            return ResponseEntity.noContent().build();

        } catch (IllegalArgumentException iae) { // Catch specific exceptions if Math.toIntExact was the issue elsewhere
            LOGGER.error("Invalid argument during deletion for user ID {"+userId+"}: {"+ iae.getMessage()+"}");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid data provided for deletion: " + iae.getMessage());
        } catch (Exception ex) {
            LOGGER.error("An unexpected error occurred while deleting admin for user ID {"+userId+"}: {"+ ex.getMessage()+"}");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + ex.getMessage());
        }
    }



}
