package tech.ouss.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tech.ouss.backend.models.talent_diplome;

@Repository
public interface diplomeRepository  extends JpaRepository<talent_diplome, Integer> {

}
