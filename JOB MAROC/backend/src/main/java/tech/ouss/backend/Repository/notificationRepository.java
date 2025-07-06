package tech.ouss.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tech.ouss.backend.models.notification;
import tech.ouss.backend.models.userEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface notificationRepository extends JpaRepository<notification, Integer> {
    @Query("SELECT n FROM notification n JOIN FETCH n.userRecipent u WHERE u.email = :email")
    public Optional<List<notification>> getnotificationByEmail (@Param("email")  String email);

    @Query("SELECT n FROM notification n WHERE n.isRead = false AND n.userRecipent.email = :email")
    List<notification> findByUserRecipentAndIsReadFalse(@Param("email")  String email);
}
