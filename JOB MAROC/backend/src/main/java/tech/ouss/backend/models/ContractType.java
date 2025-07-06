package tech.ouss.backend.models;

import com.fasterxml.jackson.annotation.JsonIgnore; // Import for JSON serialization control
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode; // Import for EqualsAndHashCode
import lombok.ToString; // Import for ToString

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "contract_types")
@EqualsAndHashCode(exclude = {"offers"}) // Exclude bidirectional relationship from equals/hashCode
@ToString(exclude = {"offers"}) // Exclude bidirectional relationship from toString
public class ContractType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "type_name", nullable = false, unique = true)
    private String typeName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();


    @ManyToMany(fetch = FetchType.LAZY, mappedBy = "contractTypes") // Lazy loading, mappedBy points to the field in the owning side
    @JsonIgnore // Keep or remove based on your API response needs
    private Set<offer> offers = new HashSet<>();

    // Ensure these helper methods safely manage bidirectional links
    public void addOffer(offer offer) {
        if (this.offers == null) {
            this.offers = new HashSet<>();
        }
        if (!this.offers.contains(offer)) {
            this.offers.add(offer);
            // Safely set the bidirectional link on the other side
            if (offer.getContractTypes() == null) {
                offer.setContractTypes(new HashSet<>());
            }
            if (!offer.getContractTypes().contains(this)) {
                offer.getContractTypes().add(this);
            }
        }
    }

    public void removeOffer(offer offer) {
        if (this.offers != null) {
            this.offers.remove(offer);
        }
        if (offer.getContractTypes() != null) {
            offer.getContractTypes().remove(this);
        }
    }
}
