package tech.ouss.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tech.ouss.backend.models.offerLanguages;

@Repository
public interface offersLangagesRepository extends JpaRepository<offerLanguages, Integer> {
//    List<offerLangages> findByOfferId(int offerId);
}
