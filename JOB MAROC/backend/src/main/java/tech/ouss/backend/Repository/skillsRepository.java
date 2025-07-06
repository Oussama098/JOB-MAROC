package tech.ouss.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tech.ouss.backend.models.talent_skills;

import java.util.List;

@Repository
public interface skillsRepository extends JpaRepository<talent_skills, Integer> {
    @Query("SELECT s FROM talent_skills s WHERE s.talent.talent_id = :talentId")
    List<talent_skills> findByTalentId(@Param("talentId") int talentId);
}
