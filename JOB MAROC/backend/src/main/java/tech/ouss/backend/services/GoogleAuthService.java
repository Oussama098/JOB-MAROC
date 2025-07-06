package tech.ouss.backend.services;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails; // Keep import as userEntity implements it
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tech.ouss.backend.Enums.AcceptanceStatus; // Assuming AcceptanceStatus enum
import tech.ouss.backend.Repository.roleRepository; // Assuming RoleRepository
import tech.ouss.backend.Repository.talentRepository;
import tech.ouss.backend.Repository.userRepository; // Assuming userRepository
import tech.ouss.backend.models.AuthResponse;
import tech.ouss.backend.models.role; // Assuming Role model
import tech.ouss.backend.models.talent;
import tech.ouss.backend.models.userEntity; // Assuming userEntity model
import tech.ouss.backend.components.JwtUtils; // Assuming JwtUtils
// Removed import tech.ouss.backend.security.services.UserDetailsImpl;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Date; // Import Date
import java.util.Optional;

@Service
public class GoogleAuthService {

    @Value("${google.client.id}")
    private String googleClientId;

    @Autowired
    private userRepository userRepository;

    @Autowired
    private roleRepository roleRepository; // To assign roles to new users

    @Autowired
    private talentRepository talentRepository;

    @Autowired
    private PasswordEncoder encoder; // To encode a dummy password for new users

    @Autowired
    private JwtUtils jwtUtils; // To generate JWT for authenticated users

    // Google ID Token Verifier
    private final GoogleIdTokenVerifier verifier;

    public GoogleAuthService(@Value("${google.client.id}") String googleClientId) {
        this.googleClientId = googleClientId;
        // Initialize the GoogleIdTokenVerifier
        this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(googleClientId)) // Specify the CLIENT_ID of the app that accesses the backend
                .build();
    }





    public AuthResponse authenticateOrRegisterGoogleUser(String googleIdToken) throws GeneralSecurityException, IOException {
        GoogleIdToken idToken = verifier.verify(googleIdToken);

        if (idToken != null) {
            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");
            // String locale = (String) payload.get("locale"); // available if needed
            String familyName = (String) payload.get("family_name");
            String givenName = (String) payload.get("given_name");

            System.out.println("Google Token Verified. Email: " + email);

            Optional<userEntity> userOptional = Optional.ofNullable(userRepository.findByEmail(email));
            userEntity user;

            if (userOptional.isPresent()) {
                user = userOptional.get();
                System.out.println("User found in database. Authenticating...");
            } else {
                System.out.println("New user. Registering...");
                user = new userEntity();
                user.setEmail(email);
                user.setFirstName(givenName != null ? givenName : (name != null ? name.split(" ")[0] : ""));
                user.setLastName(familyName != null ? familyName : (name != null && name.contains(" ") ? name.substring(name.indexOf(" ") + 1) : ""));
                user.setPassword(encoder.encode("google-auth-dummy-password-" + System.currentTimeMillis()));
                user.setImage_path(pictureUrl);
                user.setRegistrationDate(LocalDateTime.now());
                user.setIs_accepted(AcceptanceStatus.WAITING); // Or AcceptanceStatus.ACCEPTED if auto-accepted

                role defaultRole = roleRepository.findByRole_name("TALENT");
                if (defaultRole == null) {
                    // Consider creating the role if it doesn't exist, or handle this more gracefully
                    System.err.println("Error: Default role 'TALENT' is not found. Please ensure it exists in the database.");
                    throw new RuntimeException("Error: Default role 'TALENT' is not found.");
                }
                user.setRole(defaultRole);
                userEntity addedUser = userRepository.save(user);
                talent talent = new talent();
                talent.setUser_id(addedUser);
                this.talentRepository.save(talent);
                System.out.println("New user registered successfully.");
            }

            // Authenticate the user in Spring Security context
            // 'user' is your userEntity which should implement UserDetails
            UserDetails userDetails = user; // Since userEntity implements UserDetails
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null, // No password for Google auth
                    userDetails.getAuthorities()); // Get authorities from userEntity (UserDetails)

            SecurityContextHolder.getContext().setAuthentication(authentication);
            System.out.println("User '" + user.getEmail() + "' authenticated via Google and set in SecurityContext.");

            UserDetails principal = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String jwt = jwtUtils.generateJwtToken(principal); // Ensure jwtUtils.generateJwtToken accepts UserDetails
            System.out.println("Generated application JWT for " + principal.getUsername());

            return new AuthResponse(jwt, user); // Return the JWT and the user entity

        } else {
            System.err.println("Google ID token verification failed.");
            return null; // Or throw a specific exception
        }
    }

}
