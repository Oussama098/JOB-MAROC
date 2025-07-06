package tech.ouss.backend.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
//import models.talent;
import tech.ouss.backend.models.*;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class talent_diplome {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int diplome_id;
    @ManyToOne
    @JsonBackReference("talent")
    @JoinColumn(name = "talent_id")
    private talent talent;
    @Column(name = "diplome_name")
    private String diplome_name;
    @Column(name = "diplome_description")
    private String diplome_description;
    @Column(name = "diplome_date_debut")
    private String diplome_date_debut;
    @Column(name = "diplome_date_fin")
    private String diplome_date_fin;
    @Column(name = "diplome_etablissement")
    private String diplome_etablissement;

}
