package tech.ouss.backend.Repository;

//import models.talent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tech.ouss.backend.models.admin;
import tech.ouss.backend.models.manager;
import tech.ouss.backend.models.talent;
import tech.ouss.backend.models.userEntity;

import java.util.Optional;

@Repository
public interface talentRepository extends JpaRepository<talent, Integer> {
//    Optional<talent> findById(int id);
    @Query("SELECT t FROM talent t WHERE t.user_id.userId = :userId")
    talent findTalentByUserId(@Param("userId") int userID);

    @Query("SELECT t FROM talent t WHERE t.user_id.email = :email")
    talent findTalentByEmail(@Param("email") String email);
}
