package tech.ouss.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tech.ouss.backend.models.ContractType;

@Repository
public interface contractTypeRepository extends JpaRepository<ContractType , Integer> {
    @Query("SELECT ct FROM ContractType ct WHERE ct.typeName = ?1")
    ContractType findByName(@Param("typeName")String typeName);
}
