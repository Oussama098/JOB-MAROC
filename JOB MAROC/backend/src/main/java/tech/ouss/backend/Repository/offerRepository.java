package tech.ouss.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tech.ouss.backend.models.offer;

import java.util.List;

@Repository
public interface offerRepository extends JpaRepository<offer, Integer> {
    List<offer> findByCompanyName(String companyName);

    @Query("SELECT o FROM offer o JOIN FETCH o.managerId m JOIN FETCH m.user u WHERE u.email = :email")
    List<offer> findByManagerEmail(String email);
}
