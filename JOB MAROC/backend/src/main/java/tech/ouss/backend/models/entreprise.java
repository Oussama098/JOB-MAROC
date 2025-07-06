package tech.ouss.backend.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonManagedReference; // Import ajouté
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class entreprise {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(name = "nomEntreprise", nullable = false, length = 100)
    private String nomEntreprise;
    @Column(name = "adresse", length = 255)
    private String adresse;
    @Column(name = "telephone", length = 20)
    private String telephone;
    @Column(name = "email", length = 100)
    private String email;
    @Column(name = "siteWeb", length = 100)
    private String siteWeb;
    @Column(name = "description", length = 500)
    private String description;
    @Column(name = "logo", length = 255)
    private String logo;
    @Column(name = "secteurActivite", length = 100)
    private String secteurActivite;
    @Column(name = "tailleEntreprise", length = 50)
    private String tailleEntreprise;
    @Column(name = "anneeCreation", length = 4)
    private String anneeCreation;
    @Column(name = "pays", length = 50)
    private String pays;
    @Column(name = "ville", length = 50)
    private String ville;
    @Column(name = "codePostal", length = 20)
    private String codePostal;
    @Column(name = "region", length = 50)
    private String region;
    @Column(name = "statutJuridique", length = 50)
    private String statutJuridique;
    @Column(name = "numeroSiren", length = 20)
    private String numeroSiren;
    @Column(name = "numeroSiret", length = 20)
    private String numeroSiret;
    @Column(name = "numeroTvaIntra", length = 20)
    private String numeroTvaIntra;
    @Column(name = "capitalSocial", length = 50)
    private String capitalSocial;
    @Column(name = "formeJuridique", length = 50)
    private String formeJuridique;

    @OneToMany(mappedBy = "entreprise", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    private List<manager> managers = new ArrayList<>();

}
