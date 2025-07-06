package tech.ouss.backend.services;
import org.springframework.transaction.annotation.Transactional;
import tech.ouss.backend.Repository.*;
import tech.ouss.backend.models.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class offerService {
    private final offerRepository offerRepository;

    public offerService(tech.ouss.backend.Repository.offerRepository offerRepository) {
        this.offerRepository = offerRepository;
    }

    public offer getOfferById(int id) {
        return offerRepository.findById(id).orElse(null);
    }
    @Transactional
    public offer createOffer(offer newOffer) {
        return offerRepository.save(newOffer);
    }

    public offer updateOffer(int id, offer updatedOffer) {
        if (offerRepository.existsById(id)) {
            updatedOffer.setOffer_id(id);
            return offerRepository.save(updatedOffer);
        }
        return null;
    }

    public void deleteOffer(int id) {
        offerRepository.deleteById(id);
    }
    public List<offer> getAllOffers() {
        return offerRepository.findAll();
    }
    public List<offer> getOffersByCompanyName(String companyName) {
        return offerRepository.findByCompanyName(companyName);
    }

    public List<offer> getOffersByManagerEmail(String email) {
        return offerRepository.findByManagerEmail(email);
    }
}

