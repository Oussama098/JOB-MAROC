package tech.ouss.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tech.ouss.backend.models.admin;

@Repository
public interface adminRepository extends JpaRepository<admin, Integer> {
    @Query("SELECT a FROM admin a WHERE a.user.userId = :userId")
    admin findadminByUserId(@Param("userId") int userId);
}
