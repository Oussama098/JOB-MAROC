package tech.ouss.backend.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonBackReference; // Import ajouté
import lombok.ToString;

import java.time.LocalDateTime;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class manager {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @OneToOne
    @JoinColumn(name = "user_id" ,  referencedColumnName = "user_id" , nullable = false)
    private userEntity user;


    @ManyToOne
    @JoinColumn(name = "entreprise_id")
    @ToString.Exclude
    private entreprise entreprise;

    @Column(name = "createdAt"  , nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    @Column(name = "updatedAt")
    private LocalDateTime updatedAt;
}
