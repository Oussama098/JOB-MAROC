package tech.ouss.backend.services;
import tech.ouss.backend.Repository.contractTypeRepository;
import org.springframework.stereotype.Service;
import tech.ouss.backend.models.ContractType;

import java.util.List;

@Service
public class contractTypeService {
    private final contractTypeRepository contractTypeRepository;

    public contractTypeService(contractTypeRepository contractTypeRepository) {
        this.contractTypeRepository = contractTypeRepository;
    }
    public ContractType createContractType(ContractType contractType) {
        return contractTypeRepository.save(contractType);
    }

    public ContractType getContractTypeById(int id) {
        return contractTypeRepository.findById(id).orElse(null);
    }
    public void deleteContractType(int id) {
        contractTypeRepository.deleteById(id);
    }
    public ContractType updateContractType(int id, ContractType contractType) {
        if (contractTypeRepository.existsById(id)) {
            contractType.setId(id);
            return contractTypeRepository.save(contractType);
        }
        return null;
    }
    public List<ContractType> getAllContractTypes() {
        return contractTypeRepository.findAll();
    }

    public ContractType getContractTypeByName(String name) {
        return contractTypeRepository.findByName(name);
    }

}
