package tech.ouss.backend.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import tech.ouss.backend.Enums.Modality;
import tech.ouss.backend.Enums.OfferStatus;

import java.time.LocalDate; // Prefer LocalDate for date-only fields
import java.time.LocalDateTime;
import java.util.HashSet; // Use HashSet for collections
import java.util.Set;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(exclude = {"contractTypes", "languages", "managerId"})
@ToString(exclude = {"contractTypes", "languages", "managerId"})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class offer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // IDENTITY is often preferred for auto-increment
    private int offer_id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT") // Use TEXT for potentially long descriptions
    private String description;

    @Column(name = "location")
    private String location;

    @Column(name = "basic_salary") // Use snake_case for column names
    private Float basicSalary; // CHANGED from 'float' to 'Float' to allow null values

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE}) // Add CascadeType for cascading saves/updates
    @JoinTable(
            name = "offer_contracttypes", 
            joinColumns = @JoinColumn(name = "offer_id"), // Column in join table referencing the Offer ID (matches error message)
            // --- END CORRECTED ---
            inverseJoinColumns = @JoinColumn(name = "contract_type_id") // Column in join table referencing the ContractType ID (matches error message)
    )
    // @JsonIgnore // Keep or remove based on your API response needs
    private Set<ContractType> contractTypes = new HashSet<>();

    @Column(name = "date_publication")
    private LocalDate datePublication;

    @Column(name = "date_expiration")
    private LocalDate dateExpiration;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "sector_activity")
    private String sectorActivity;

    @Column(name = "study_level")
    private String StudyLevel;

    @Column(name = "experience")
    private String experience;

    @OneToMany(mappedBy = "offerId", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY) // ALL includes PERSIST
    // @JsonIgnore // Ignore during JSON serialization to prevent infinite loops with offerLanguages
    private Set<offerLanguages> languages = new HashSet<>(); // Renamed and changed to Set

    @Column(name = "skills", columnDefinition = "TEXT") // Use TEXT for potentially long skill lists
    private String skills;

    @Enumerated(EnumType.STRING) // Store enum as String in DB
    @Column(name = "modality")
    private Modality modality = Modality.OnSite;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private OfferStatus status = OfferStatus.OPEN;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // Prevents lazy loading issues in JSON serialization
    private manager managerId;

    @Column(name = "flexible_hours")
    private Boolean FlexibleHours;

    @Column (name = "offer_url")
    private String offerUrl;// URL for the offer, if applicable

    // Ensure these helper methods safely manage bidirectional links
    public void addLanguage(offerLanguages language) {
        if (this.languages == null) {
            this.languages = new HashSet<>();
        }
        if (!this.languages.contains(language)) {
            this.languages.add(language);
            language.setOfferId(this);
        }
    }

    public void removeLanguage(offerLanguages language) {
        if (this.languages != null) {
            this.languages.remove(language);
        }
        if (language != null) {
            language.setOfferId(null);
        }
    }

    public void addContractType(ContractType contractType) {
        if (this.contractTypes == null) {
            this.contractTypes = new HashSet<>();
        }
        if (!this.contractTypes.contains(contractType)) {
            this.contractTypes.add(contractType);
            // Safely set the bidirectional link on the other side
            if (contractType.getOffers() == null) {
                contractType.setOffers(new HashSet<>());
            }
            if (!contractType.getOffers().contains(this)) {
                contractType.getOffers().add(this);
            }
        }
    }

    public void removeContractType(ContractType contractType) {
        if (this.contractTypes != null) {
            this.contractTypes.remove(contractType);
        }
        if (contractType.getOffers() != null) {
            contractType.getOffers().remove(this);
        }
    }
}
