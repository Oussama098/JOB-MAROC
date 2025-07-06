package tech.ouss.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tech.ouss.backend.models.manager;

@Repository
public interface managerRepository extends JpaRepository<manager, Integer> {
    @Query("SELECT m FROM manager m WHERE m.user.userId = :userId")
    manager findManagerByUserId(@Param("userId") int userId);

    @Query("SELECT m FROM manager m WHERE m.user.email = :email")
    manager findManagerByEmail(@Param("email") String email);

}
