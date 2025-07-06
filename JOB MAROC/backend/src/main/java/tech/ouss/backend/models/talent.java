package tech.ouss.backend.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
//import models.userEntity;
import tech.ouss.backend.models.userEntity;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class talent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int talent_id;
    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id" , nullable = false)
    private userEntity user_id;

    @Column(name = "cv_path" , nullable = false)
    private String cv_path;

    @OneToMany(mappedBy = "talent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonBackReference
    private List<talent_skills> skillsList;

    @OneToMany(mappedBy = "talent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<talent_experiance> experianceList;

    @OneToMany(mappedBy = "talent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<talent_diplome> diplomeList;

    @OneToMany(mappedBy = "talent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)

    private List<talentCv> talentCvList;
}
