package tech.ouss.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tech.ouss.backend.Enums.AcceptanceStatus;
import tech.ouss.backend.Repository.adminRepository;
import tech.ouss.backend.models.admin;
import tech.ouss.backend.models.role;
import tech.ouss.backend.models.userEntity;

import java.sql.Timestamp;

@Service
public class adminService {
    private final adminRepository adminRepository;
    private final UserService userService;


    public adminService(adminRepository adminRepository, UserService userService) {
        this.adminRepository = adminRepository;
        this.userService = userService;
    }

    public admin addAdmin(admin admin) {
        return adminRepository.save(admin);
    }

    public void deleteAdmin(int adminId) {
        this.adminRepository.deleteById(adminId);
    }

    public admin getAdminByUserId(int userId){
        return this.adminRepository.findadminByUserId(userId);
    }
}
