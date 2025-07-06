package tech.ouss.backend.services;
//import Repository.roleRepository;
//import Repository.userRepository;
//import tech.ouss.backend.Repository.*;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tech.ouss.backend.Enums.AcceptanceStatus;
import tech.ouss.backend.Repository.*;
import tech.ouss.backend.models.*;
//import models.role;
//import models.userEntity;

import java.util.List;

@Service
public class UserService {
    private final roleRepository roleRepository;
    private final userRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(roleRepository roleRepository, userRepository userRepository , PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<userEntity> getAllUsers() {
        return userRepository.findAll();
    }

    public userEntity addUser(userEntity user) {
        role role = roleRepository.findById(user.getRole().getRole_id())
                .orElseThrow(() -> new RuntimeException("Role not found"));
        user.setRole(role);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public userEntity getUserByEmail(String email) {
        return  userRepository.findByEmail(email);
    }

    public void deleteUser(int id) {
        userRepository.deleteById(id);
    }

    public userEntity updateUser(userEntity user) {
        userEntity existingUser = userRepository.findById(Math.toIntExact(user.getUserId()));
        if (existingUser == null) {
            throw new RuntimeException("User not found");
        }
        existingUser.setEmail(user.getEmail());
        existingUser.setFirstName(user.getFirstName());
        existingUser.setLastName(user.getLastName());
        existingUser.setPassword(user.getPassword());
        existingUser.setAddress(user.getAddress());
        existingUser.setNationality(user.getNationality());
        existingUser.setSexe(user.getSexe());
        existingUser.setDatenais(user.getDatenais());
        existingUser.setLieu(user.getLieu());
        existingUser.setSituation_familliale(user.getSituation_familliale());
        existingUser.setNum_tel(user.getNum_tel());
        existingUser.setImage_path(user.getImage_path());
        existingUser.setCin(user.getCin());
        existingUser.setIs_accepted(user.getIs_accepted());
        existingUser.setLastLoginDate(user.getLastLoginDate());
        existingUser.setDeletation_Date(user.getDeletation_Date());

        return userRepository.save(existingUser);
    }

    public userEntity getUserById(int id) {
        return userRepository.findById(id);
    }

    public List<userEntity> getUsersByStatus(AcceptanceStatus acceptanceStatus) {
        return userRepository.findByIs_accepted(acceptanceStatus);
    }
}
