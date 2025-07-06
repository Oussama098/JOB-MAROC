package tech.ouss.backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tech.ouss.backend.Repository.entrepriseRepository;

@RestController
@RequestMapping("/entreprise")
public class entrepriseController {
    private final entrepriseRepository entrepriseRepository;

    public entrepriseController(entrepriseRepository entrepriseRepository) {
        this.entrepriseRepository = entrepriseRepository;
    }


}
