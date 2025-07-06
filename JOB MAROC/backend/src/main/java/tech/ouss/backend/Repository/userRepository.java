package tech.ouss.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tech.ouss.backend.Enums.AcceptanceStatus;
import tech.ouss.backend.models.userEntity;

import java.util.List;
import java.util.Optional;
//import models.userEntity;
@Repository
public interface userRepository extends JpaRepository<userEntity, Integer> {
//    userEntity findByUsername(String username);
    userEntity findByEmail(String email);
//    userEntity findByName(String name);
    userEntity findById(int id);
    @Query("SELECT u FROM userEntity u WHERE u.is_accepted = :acceptanceStatus")
    List<userEntity> findByIs_accepted(@Param("acceptanceStatus") AcceptanceStatus acceptanceStatus); // Use @Param

//    void deleteById(int id);
}
