package tech.ouss.backend.controllers;
//import tech.ouss.backend.Repository.*;
import tech.ouss.backend.Repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.*;
import tech.ouss.backend.models.role;

import java.util.List;

@RestController

public class testController {
    private final roleRepository roleRepository;

    public testController(roleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }


    @GetMapping(path = "/")
    public String index() {
        return "index.html";
    }

    @GetMapping("/role")
    public String role() {
        return "roles";
    }


    @GetMapping(path = "/roleID/{id}")
    public String getRoleID(@PathVariable("id") int id) {
        return this.roleRepository.findById(id).get().getRole_name();
    }

    @GetMapping(path = "/role/all" , produces = "application/json")
    public List<role> getAllRoles() {
        return this.roleRepository.findAll();
    }
}
