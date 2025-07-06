package tech.ouss.backend.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
//import models.talent;
import tech.ouss.backend.models.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class talent_skills {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JsonBackReference("talent")
    @JoinColumn(name = "talent_id")
    private talent talent;
    @Column(name = "skill_name")
    private String skill_name;
    @Column(name = "skill_level")
    @Min(value = 0, message = "Skill level must be at least 0")
    @Max(value = 5, message = "Skill level must be at most 5")
    private int skillLevel;
    @Column(name = "skill_description")
    private String skill_description;

}
