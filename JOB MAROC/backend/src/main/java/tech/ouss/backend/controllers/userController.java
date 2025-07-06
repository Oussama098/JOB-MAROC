package tech.ouss.backend.controllers;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import tech.ouss.backend.Enums.AcceptanceStatus;
import tech.ouss.backend.Enums.NotificationType;
import tech.ouss.backend.models.*;
import tech.ouss.backend.services.*;
import tech.ouss.backend.Repository.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

import static org.hibernate.sql.ast.SqlTreeCreationLogger.LOGGER;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;


@RestController
@RequestMapping(path = "/users")
public class userController {
    private final UserService userService;
    private final EmailService emailService;
    private final notificationRepository notificationRepository;
    public userController(UserService userService, EmailService emailService, tech.ouss.backend.Repository.notificationRepository notificationRepository) {
        this.userService = userService;
        this.emailService = emailService;
        this.notificationRepository = notificationRepository;
    }

    @GetMapping( path = "/all", produces = APPLICATION_JSON_VALUE)
    public List<userEntity> getAllUsers() {
        return this.userService.getAllUsers();
    }


    @PostMapping(path = "/add" , consumes = APPLICATION_JSON_VALUE)
    public ResponseEntity<userEntity> addUser(@RequestBody userEntity user) {
        user.setRegistrationDate(LocalDateTime.now());
        userEntity savedUser = userService.addUser(user);
        return ResponseEntity.ok(savedUser);
    }

    @GetMapping(path = "/email/{email}", produces = APPLICATION_JSON_VALUE)
    public ResponseEntity<userEntity> getUserByEmail(@PathVariable("email") String email) {
        userEntity user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping(path = "/delete/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable("id") int id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted");
    }


    @GetMapping(path = "/{id}", produces = APPLICATION_JSON_VALUE)
    public userEntity getUserById(@PathVariable("id") int id) {
        userEntity user = userService.getUserById(id);
        return user;
    }

    @PutMapping(path = "/update/{id}", consumes = APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateUser(@PathVariable("id") int id, @RequestBody userEntity user) {
        userEntity ExistedUser = this.userService.getUserById(id);
        userEntity ExistedUserEmail = this.userService.getUserByEmail(user.getEmail());
        LOGGER.info(ExistedUser);
        if(ExistedUser == null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("the user with userID "+id+" not found");
        }
        if(ExistedUserEmail == null && ExistedUserEmail.getUserId() != id){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("the user email is already existed");
        }
        user.setPassword(ExistedUser.getPassword());
        userEntity updatedUser = userService.updateUser(user);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping(path = "/usersWaitingStatus", produces = APPLICATION_JSON_VALUE)
    public List<userEntity> getUsersWaitingStatus() {
        return this.userService.getUsersByStatus(AcceptanceStatus.WAITING);
    }

    @PutMapping(path = "/updateStatus/{userId}", consumes = APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateAcceptanceStatus(
            @PathVariable("userId") Long userId,
            @RequestBody userEntity request // Accept the DTO matching the JSON body
    ) {
        try {
            if (request == null || request.getIs_accepted() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Request body or 'is_accepted' status is missing.");
            }

            Optional<userEntity> userOptional = Optional.ofNullable(userService.getUserById(Math.toIntExact(userId)));

            if (!userOptional.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User with ID " + userId + " not found.");
            }

            userEntity user = userOptional.get();
            AcceptanceStatus newStatus = request.getIs_accepted();

            notification notification = new notification();
            notification.setType(NotificationType.UPDATE_USER_INFORMATIONS);

            // Only update if the status is actually changing
            if (user.getIs_accepted() != newStatus) {
                user.setIs_accepted(newStatus);
                // Save the updated status

                // --- Prepare and Send HTML Email Based on New Status ---
                String subject;
                String htmlBody; // Use a variable for HTML body

                if (newStatus == AcceptanceStatus.ACCEPTED) {
                    subject = "Your Application Status: Accepted - Welcome to Job Maroc!";
                    htmlBody = """
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
                        """.formatted(user.getFirstName()); // Apply formatted() here
                    notification.setMessage("votre compte est approvee par l'admin");

                } else if (newStatus == AcceptanceStatus.REFUSED) {
                    subject = "Your Application Status Update from Job Maroc";
                    // Use text block starting on a new line and String.formatted() for variable insertion
                    htmlBody = """
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Your Application Status: Update</title>
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
                                    border-top: 4px solid #F44336; /* Red border for refusal */
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
                                    color: #F44336; /* Red color for heading */
                                    font-size: 24px;
                                    margin-top: 10px;
                                }
                                .content {
                                    margin-bottom: 20px;
                                }
                                .content p {
                                    margin-bottom: 15px;
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
                                     <h1>Application Status Update</h1>
                                </div>
                                <div class="content">
                                    <p>Dear %s,</p> <p>Thank you for your interest in Job Maroc and for submitting your application.</p>
                                    <p>We have carefully reviewed your profile. At this time, we are unable to offer you access to our platform.</p>
                                    <p>We receive a large number of applications, and decisions are based on a variety of factors and current needs.</p>
                                    <p>We encourage you to continue developing your skills and experience.</p>
                                    <p>We wish you the best in your future endeavors.</p>
                                </div>
                                <div class="footer">
                                    <p>&copy; 2025 Job Maroc. All rights reserved.</p>
                                    <p>Job Maroc Team</p>
                                </div>
                            </div>
                        </body>
                        </html>
                        """.formatted(user.getFirstName()); // Apply formatted() here
                    notification.setMessage("votre compte est refusee par l'admin");
                } else {
                    // Generic email for other statuses (can be HTML or plain)
                    subject = "Your Application Status Updated";
                    htmlBody = "<p>Dear %s,</p><p>Your application status has been updated to: <strong>%s</strong>.</p>".formatted(user.getFirstName(), newStatus.name()); // Use formatted()
                }

                // Send the email using the new sendEmail method with isHtml = true
                emailService.sendEmail(user.getEmail(), subject, htmlBody, true);


                notification.setUserRecipent(user);
                this.notificationRepository.save(notification);
                // --- End Prepare and Send HTML Email ---
                userEntity updatedUser = userService.updateUser(user);


                return ResponseEntity.ok(updatedUser);

            } else {
                return ResponseEntity.ok().body("User status is already " + newStatus.name());
            }




        } catch (Exception e) {
            System.err.println("Error updating user status or sending email for ID " + userId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update user status or send email: " + e.getMessage());
        }
    }

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()") // Ensure only authenticated users can access
    public ResponseEntity<?> getUserProfile() {
        try {
            // Get the currently authenticated user principal from Spring Security Context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Object principal = authentication.getPrincipal();

            // Check if the principal is your userEntity (which implements UserDetails)
            if (principal instanceof userEntity) {
                userEntity authenticatedUser = (userEntity) principal;
                System.out.println(authenticatedUser);
                return ResponseEntity.ok(authenticatedUser);
            } else {
                // This case should ideally not happen in an authenticated context with your setup
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Could not retrieve authenticated user details.");
            }

        } catch (Exception e) {
            System.err.println("Error fetching user profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to fetch user profile.");
        }
    }
}
