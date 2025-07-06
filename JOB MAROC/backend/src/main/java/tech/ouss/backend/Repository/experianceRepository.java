package tech.ouss.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tech.ouss.backend.models.talent_experiance;

import java.util.List;

@Repository
public interface experianceRepository extends JpaRepository<talent_experiance, Integer> {
    @Query("SELECT e FROM talent_experiance e WHERE e.talent.talent_id = :talentId")
    List<talent_experiance> findByTalentId(@Param("talentId") int talentId);
}
