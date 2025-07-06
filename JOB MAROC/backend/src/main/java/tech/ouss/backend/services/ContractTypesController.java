package tech.ouss.backend.services;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.ouss.backend.models.ContractType;

import java.util.List;

@RestController
@RequestMapping("/contractTypes")
public class ContractTypesController {
    private final contractTypeService contractTypeService;

    public ContractTypesController(tech.ouss.backend.services.contractTypeService contractTypeService) {
        this.contractTypeService = contractTypeService;
    }

    @PostMapping(path = "/add" , consumes = "application/json")
    public ResponseEntity<?> createContractType(@RequestBody ContractType contractType) {
        try {
            return ResponseEntity.status(200).body(this.contractTypeService.createContractType(contractType));
        }catch (Exception ex){
            return ResponseEntity.badRequest().body("Error : "+ ex.getMessage() );
        }
    }

    @GetMapping(path = "/all" , produces = "application/json")
    public List<ContractType> getAllContractTypes() {
        try {
            return this.contractTypeService.getAllContractTypes();
        }catch (Exception ex){
            ex.printStackTrace();
            return null;
        }
    }
}
