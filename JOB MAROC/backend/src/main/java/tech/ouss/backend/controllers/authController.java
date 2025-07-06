package tech.ouss.backend.controllers;

import DTO.GoogleSignInRequest;
import DTO.GoogleSignInResponse;
import DTO.userDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import tech.ouss.backend.Enums.AcceptanceStatus;
import tech.ouss.backend.components.JwtUtils;
import tech.ouss.backend.models.AuthResponse;
import tech.ouss.backend.models.userEntity;
import tech.ouss.backend.services.GoogleAuthService;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.HashMap;
import java.util.Map;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;
// Removed unused stream/Collectors imports

/**
 * REST Controller for handling authentication requests (e.g., user sign-in).
 */
@RestController
@CrossOrigin(origins = "*", maxAge = 3600) // Allow requests from any origin - adjust in production!
public class authController { // Class name should start with uppercase by convention

    private static final Logger logger = LoggerFactory.getLogger(authController.class); // Logger instance

    @Autowired
    private GoogleAuthService googleAuthService;

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    JwtUtils jwtUtils;

    /**
     * Handles user sign-in requests.
     * Authenticates the user based on username and password provided in the request body.
     * If authentication is successful, generates a JWT and returns it along with user details.
     * If authentication fails, returns a 401 Unauthorized error.
     *
     * @param loginRequest DTO containing the username and password.
     * @return ResponseEntity containing user details and JWT on success, or an error message on failure.
     */
    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody userDTO loginRequest) { // Use the DTO
        logger.info("Authentication attempt for user: {}", loginRequest.getUsername());

        try {
            // Attempt to authenticate the user using the provided credentials
            // This call will use your standard DaoAuthenticationProvider
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword())
            );

            // If authentication is successful, set the Authentication object in the SecurityContext
            SecurityContextHolder.getContext().setAuthentication(authentication);
            logger.info("User '{}' authenticated successfully.", loginRequest.getUsername());

            // Get the authenticated principal (which should be our UserEntity)
            userEntity userDetails = (userEntity) authentication.getPrincipal();

            String jwtToken = jwtUtils.generateJwtToken(userDetails);
            logger.debug("Generated JWT for user '{}'. Token length: {}", userDetails.getUsername(), jwtToken != null ? jwtToken.length() : 0);

            // Create the response DTO containing username, role, and token
            userDTO responseDTO = new userDTO(
                    userDetails.getUsername(), // email
                    userDetails.getRole().getRole_name(), // Get role name from the Role entity
                    userDetails.getIs_accepted(),
                    jwtToken
            );

            return ResponseEntity.ok(responseDTO);

        } catch (BadCredentialsException e) {
            logger.warn("Authentication failed for user '{}': Invalid credentials (BadCredentials)", loginRequest.getUsername());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Invalid username or password."); // Unified message
            errorResponse.put("status", false);
            return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED); // 401
        } catch (UsernameNotFoundException e) {
            // This block catches the exception thrown by DaoAuthenticationProvider
            // when the userDetailsService cannot find the user.
            logger.warn("Authentication failed for user '{}': User not found", loginRequest.getUsername());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Invalid username or password."); // Unified message
            errorResponse.put("status", false);
            return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED); // 401
        }
        catch (AuthenticationException e) {
            // This block will now primarily catch other AuthenticationExceptions,
            // like DisabledException (because userEntity.isEnabled() returned false due to is_accepted status),
            // LockedException, AccountExpiredException, etc.
            logger.error("Authentication failed for user '{}': {}", loginRequest.getUsername(), e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            // You could refine this message based on the specific exception type if needed
            errorResponse.put("message", "Authentication failed: " + e.getMessage()); // Shows the specific error like "User is disabled"
            errorResponse.put("status", false);
            // HttpStatus.LOCKED (423) is reasonable for account status issues like disabled/locked
            return new ResponseEntity<>(errorResponse, HttpStatus.LOCKED);
        } catch (Exception e) {
            // Handle unexpected errors during the authentication process
            logger.error("An unexpected error occurred during authentication for user '{}': {}", loginRequest.getUsername(), e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "An internal error occurred during authentication.");
            errorResponse.put("status", false);
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR); // 500
        }
    }




    @PostMapping(value = "/google-signin", consumes = APPLICATION_JSON_VALUE, produces = APPLICATION_JSON_VALUE)
    public ResponseEntity<?> authenticateGoogleUser(@RequestBody GoogleSignInRequest googleSignInRequest) {
        try {
            String googleIdToken = googleSignInRequest.getGoogleIdToken();
            if (googleIdToken == null || googleIdToken.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("message", "Google ID token is missing.");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            AuthResponse authResponse = googleAuthService.authenticateOrRegisterGoogleUser(googleIdToken);

            if (authResponse != null && authResponse.getUser() != null) {
                userEntity user = authResponse.getUser();

                // --- NEW: Check acceptance status and return 423 if not accepted ---
                if (user.getIs_accepted() != AcceptanceStatus.ACCEPTED) {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("message", "Votre compte est en attente d'approbation ou a été refusé.");
                    errorResponse.put("status", user.getIs_accepted().name()); // Send the actual status (WAITING, DENIED)
                    errorResponse.put("email", user.getEmail()); // Optionally send email
                    return new ResponseEntity<>(errorResponse, HttpStatus.LOCKED); // 423 Locked
                }
                // --- END NEW CHECK ---

                // If accepted, proceed with token generation and successful response
                String jwtToken = authResponse.getJwt(); // Get JWT from authResponse
                if (jwtToken == null) {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("message", "Authentication successful but JWT token not generated.");
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
                }

                GoogleSignInResponse signInResponse = new GoogleSignInResponse(
                        jwtToken,
                        user.getEmail(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getImage_path(),
                        user.getAuthorities(),
                        user.getIs_accepted()
                );
                return ResponseEntity.ok(signInResponse);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("message", "Invalid Google ID token or user authentication failed.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

        } catch (GeneralSecurityException | IOException e) {
            System.err.println("Error verifying Google token: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error processing Google sign-in: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        } catch (RuntimeException e) {
            System.err.println("Error during Google user registration/authentication: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            if (e.getMessage() != null && e.getMessage().contains("Default role") && e.getMessage().contains("not found")) {
                errorResponse.put("message", "Configuration error: Default user role not found. Please contact support.");
            } else {
                errorResponse.put("message", "Error during Google sign-in: " + e.getMessage());
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        } catch (Exception e) { // Catch any other unexpected exceptions
            System.err.println("An unexpected error occurred during Google sign-in: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "An internal error occurred during Google sign-in.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }


}
