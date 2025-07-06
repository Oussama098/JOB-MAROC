package tech.ouss.backend.models;

import com.fasterxml.jackson.annotation.JsonIgnore; // Import JsonIgnore
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString; // Import ToString

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "role") // Assuming your role table is named 'role'
@ToString(exclude = "users")
public class role implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id") // Use @Column for consistency
    private int role_id;

    @Column(name = "role_name", unique = true, nullable = false)
    private String role_name;

    @Column(name = "role_description")
    private String role_description;

    // The back-reference to userEntity
    // mappedBy refers to the 'role' field in userEntity
    @OneToMany(mappedBy = "role")
    @JsonIgnore // <-- Add this annotation to prevent serialization recursion
    private List<userEntity> users;

    public role(int role_id){
        this.role_id=role_id;
    }


}
