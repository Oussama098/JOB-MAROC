package tech.ouss.backend.controllers;
//import Repository.roleRepository;
//import models.role;
import tech.ouss.backend.Repository.*;
import tech.ouss.backend.models.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
//@RequestMapping(path = "/roles")
public class roleController {

    private final roleRepository roleRepository;

    public roleController(roleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }
    @GetMapping(path = "/roles")
    public String getAllRolesPage() {
        return "roles";
    }

    @GetMapping(path = "all" , produces = "application/json")
    public List<role> getAllRoles() {
        return this.roleRepository.findAll();
    }
}
