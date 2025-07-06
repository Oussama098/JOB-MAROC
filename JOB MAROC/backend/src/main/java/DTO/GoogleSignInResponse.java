package DTO; // Or your appropriate DTO package

import java.util.Collection;
import java.util.stream.Collectors;
import org.springframework.security.core.GrantedAuthority;
import tech.ouss.backend.Enums.AcceptanceStatus;

public class GoogleSignInResponse {
    private String token;
    private String email;
    private String firstName;
    private String lastName;
    private String pictureUrl;
    private String role; // Primary role as a string
    private Collection<String> roles; // Full list of roles
    private String is_accepted; // Added field for acceptance status
    private String type = "Bearer";

    public GoogleSignInResponse(
            String token,
            String email,
            String firstName,
            String lastName,
            String pictureUrl,
            Collection<? extends GrantedAuthority> authorities,
            AcceptanceStatus acceptanceStatus // New parameter
    ) {
        this.token = token;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.pictureUrl = pictureUrl;

        if (authorities != null && !authorities.isEmpty()) {
            this.roles = authorities.stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());
            // Assuming the role name might be prefixed (e.g., "ROLE_ADMIN")
            // If not, and authorities directly give "ADMIN", "TALENT", this is fine.
            this.role = this.roles.stream()
                    .findFirst()
                    .map(r -> r.startsWith("ROLE_") ? r.substring(5) : r) // Remove "ROLE_" prefix if present
                    .orElse(null);
        } else {
            this.roles = null;
            this.role = null;
        }
        // Convert enum to string for the response
        this.is_accepted = (acceptanceStatus != null) ? acceptanceStatus.name() : null;
    }


    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPictureUrl() {
        return pictureUrl;
    }

    public void setPictureUrl(String pictureUrl) {
        this.pictureUrl = pictureUrl;
    }

    public Collection<String> getRoles() {
        return roles;
    }

    public void setRoles(Collection<String> roles) {
        this.roles = roles;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}