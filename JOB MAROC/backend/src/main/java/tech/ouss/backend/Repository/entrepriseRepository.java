package tech.ouss.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tech.ouss.backend.models.entreprise;

import java.util.Optional;

@Repository
public interface entrepriseRepository extends JpaRepository<entreprise, Integer> {
    @Query("SELECT e FROM entreprise e where e.nomEntreprise = :nomEntreprise")
    Optional<entreprise> findByNomEntreprise(@Param("nomEntreprise") String nomEntreprise);
    @Query("SELECT e FROM entreprise e where e.email = :email")
    Optional<entreprise> findByEmail(@Param("email") String email);

    @Query("SELECT m FROM manager m JOIN FETCH m.entreprise e JOIN FETCH m.user u WHERE u.email = :email")
    Optional<entreprise> findByEmailManager(@Param("email") String email);

}
