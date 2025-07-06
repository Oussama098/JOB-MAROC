package tech.ouss.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tech.ouss.backend.models.application;

import java.util.List;
import java.util.Optional;

@Repository
public interface applicationRepository extends JpaRepository<application, Integer> {
    @Query("SELECT app FROM application app JOIN FETCH app.talent t JOIN FETCH t.user_id u JOIN FETCH app.offer o WHERE app.offer.offer_id = :offerId")
    List<application> findByOfferId(@Param("offerId") int offerId);

    @Query("SELECT app FROM application app JOIN FETCH app.talent t JOIN FETCH t.user_id u JOIN FETCH app.offer o JOIN FETCH o.managerId m WHERE m.id = :id")
    Optional<List<application>> findByManager(@Param("id") int id);

    @Query("SELECT app FROM application app WHERE app.talent.talent_id =:id")
    Optional<List<application>> findByTalent(@Param("id") int id);

}
