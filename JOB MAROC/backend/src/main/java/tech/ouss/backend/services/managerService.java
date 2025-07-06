package tech.ouss.backend.services;

import org.springframework.stereotype.Service;
import tech.ouss.backend.Repository.managerRepository;
import tech.ouss.backend.models.manager;

@Service
public class managerService {
    private final managerRepository managerRepository;

    public managerService(tech.ouss.backend.Repository.managerRepository managerRepository) {
        this.managerRepository = managerRepository;
    }

    public manager addManager(manager manager){
        return this.managerRepository.save(manager);
    }

    public void deleteManager(int managerId) {
        this.managerRepository.deleteById(managerId);
    }

    public manager getManagerByUserId(int userId){
        return this.managerRepository.findManagerByUserId(userId);
    }

    public manager getManagerByEmail(String email) {
        return this.managerRepository.findManagerByEmail(email);
    }
}
