package tech.ouss.backend.models;

import com.fasterxml.jackson.annotation.JsonIgnore; // Import for JSON serialization control
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "offer_languages")
public class offerLanguages {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "language_name", nullable = false)
    private String languageName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "level")
    @Min(value = 1, message = "Level must be at least 1") // Add minimum constraint
    @Max(value = 5, message = "Level must be at most 5") // Add maximum constraint
    private int level;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offer_id")
    @JsonIgnore
    private offer offerId;
     @Column(name = "created_at", updatable = false)
     private LocalDateTime createdAt = LocalDateTime.now();
     @Column(name = "updated_at")
     private LocalDateTime updatedAt = LocalDateTime.now();
}
