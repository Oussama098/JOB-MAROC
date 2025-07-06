package tech.ouss.backend.models;

import com.fasterxml.jackson.annotation.JsonIgnore; // Import JsonIgnore
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.ToString; // Import ToString
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import tech.ouss.backend.Enums.AcceptanceStatus;
import tech.ouss.backend.Enums.SituationFamiliale;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import java.io.Serializable;
import java.sql.Date;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "user_entity")

@ToString(exclude = {"talent_id", "notifications", "role"})
//@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})

public class userEntity implements UserDetails,Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "email", nullable = false, unique = true) // Email should likely be unique
    private String email;

    @Column(name = "first_name" , nullable = false)
    private String firstName;

    @Column(name = "last_name" , nullable = false)
    private String lastName;

    @Column(name = "password", nullable = false) // Password should be non-null
    private String password;

    // @ManyToOne(cascade = CascadeType.ALL) // CascadeType.ALL on ManyToOne is often problematic
    @ManyToOne // Remove CascadeType.ALL unless you specifically need it here
    @JoinColumn(name = "role_id", nullable = false)
    private role role;

    @Column(name = "registration_date", nullable = false) // Registration date should be non-null
    private LocalDateTime registrationDate = LocalDateTime.now();

    @Column(name = "last_login_Date")
    private LocalDateTime lastLoginDate = null;

    @Column(name = "Deletation_Date")
    private LocalDateTime Deletation_Date = null;

    @Column(name = "is_active", nullable = false) // Should be non-null
    private boolean isActive = false;

    @Column(name = "address") // Make nullable if it can be null
    private String address;

    @Column(name = "Nationality") // Make nullable if it can be null
    private String Nationality;

    @Column(name = "sexe") // Make nullable if it can be null
    private Character sexe; // Use Character for nullable char

    @Column(name = "datenais", nullable = false)
    private Date datenais;

    @Column(name = "lieu", nullable = false)
    private String lieu;

    @Column(name = "situation_familliale") // <-- Corrected field name based on previous turn
    private SituationFamiliale situation_familliale;

    @Column(name = "num_tel", nullable = false)
    private String num_tel;

    @Column(name = "image_path") // Make nullable if it can be null
    private String image_path;

    @Column(name = "is_accepted", nullable = false) // Should be non-null
    private AcceptanceStatus is_accepted  = AcceptanceStatus.WAITING;

    @Column(name = "cin") // Make nullable if it can be null
    private String cin;



    // The back-reference from talent
    // mappedBy = "user_id" means the field in the Talent entity is named 'user_id'
    @OneToOne(mappedBy = "user_id", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // <-- Add this annotation to prevent serialization recursion
    private talent talent_id;

    @OneToMany(mappedBy = "userRecipent", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
//    @JsonManagedReference("user-notifications")
//    @JsonIgnore
    private List<notification> notifications = new ArrayList<>();


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (this.role == null) {
            return List.of();
        }
        return List.of(new SimpleGrantedAuthority(role.getRole_name()));
    }

    @Override
    public String getUsername() {
        return email; // Authenticate using email
    }

    @Override
    public String getPassword() {
        return password; // Return the stored encoded password
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Implement actual logic if needed
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Implement actual logic if needed
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Implement actual logic if needed
    }

    @Override
    public boolean isEnabled() {
        return this.is_accepted == AcceptanceStatus.ACCEPTED; // Keep using acceptance status
    }
}
