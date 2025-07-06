package tech.ouss.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tech.ouss.backend.models.talent_diplome;

import java.util.List;
@Repository
public interface talent_diplomeRepository extends JpaRepository<talent_diplome, Integer> {
    @Query("SELECT t FROM talent_diplome t WHERE t.talent.talent_id = :talentId")
    List<talent_diplome> findByTalentId(@Param("talentId") int talentId);
}
