package tech.ouss.backend.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnore; // Added import
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import tech.ouss.backend.Enums.ApplicationStatus;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "application")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class application{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int applicationId; // Using Long for ID is common practice

    @ManyToOne(fetch = FetchType.LAZY)
//    @JsonBackReference("talent") // Keep this commented as per your original code if not using bi-directional reference
    @JoinColumn(name = "talent_id", nullable = false)

    private talent talent;

    @ManyToOne(fetch = FetchType.LAZY)
//    @JsonBackReference("offer")
    @JoinColumn(name = "offer_id", nullable = false)
    private offer offer;


    @Column(name = "application_date", nullable = false, updatable = false)
    private LocalDateTime applicationDate = LocalDateTime.now(); // Date and time of the application
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ApplicationStatus status;

    @Column(name = "cover_letter_path")
    private String coverLetterPath;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes; // Any internal notes regarding the application

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated = LocalDateTime.now(); // Timestamp for last update


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "applied_with_cv_path")
//    @JsonBackReference("applicationToTalentCv")
    private talentCv appliedWithCvPath;



    @PrePersist
    protected void onCreate() {
        applicationDate = LocalDateTime.now();
        lastUpdated = LocalDateTime.now();
        if (status == null) {
            status = ApplicationStatus.APPLIED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }
}