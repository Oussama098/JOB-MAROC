package tech.ouss.backend.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.Entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class talentCv {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int cv_id;

    @ManyToOne
    @JsonBackReference("talent")
    @JoinColumn(name = "talent_id")
    private talent talent;

    @Column(name = "cv_path")
    private String cv_path;

    @Column(name = "upload_date")
    private LocalDateTime upload_date = LocalDateTime.now();

    @OneToMany(mappedBy = "appliedWithCvPath", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("applicationToTalentCv")
    @JsonIgnore
    private List<application> applications;



}
