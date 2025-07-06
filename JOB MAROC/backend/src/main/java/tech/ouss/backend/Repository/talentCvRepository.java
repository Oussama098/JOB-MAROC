package tech.ouss.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tech.ouss.backend.models.talentCv;

import java.util.List;
import java.util.Optional;

@Repository
public interface talentCvRepository extends JpaRepository<talentCv, Integer> {
    @Query("SELECT t FROM talentCv t WHERE t.talent.talent_id = :talentId")
    List<talentCv> findByTalentId(@Param("talentId") int talentId);


}
