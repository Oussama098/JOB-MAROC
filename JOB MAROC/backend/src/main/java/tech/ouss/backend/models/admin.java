package tech.ouss.backend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import tech.ouss.backend.models.userEntity;

import java.sql.Time;
import java.sql.Timestamp;
import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class admin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id" , nullable = false)
    private userEntity user;
    @Column(name = "created_at" , nullable = false)
    private LocalDateTime created_at = LocalDateTime.now();
    @Column(name = "updated_at")
    private LocalDateTime updated_at;
    @Column(name = "isMain")
    private boolean isMain = false;
}
