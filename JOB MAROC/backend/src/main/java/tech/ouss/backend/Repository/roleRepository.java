package tech.ouss.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tech.ouss.backend.models.role;

import java.util.Optional;

@Repository
public interface roleRepository extends JpaRepository<role, Integer> {
    @Query("SELECT u FROM role u WHERE u.role_name = :role")
    role findByRole_name(@Param("role") String role);

}
