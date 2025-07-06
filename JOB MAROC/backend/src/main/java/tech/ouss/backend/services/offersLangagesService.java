package tech.ouss.backend.services;
import tech.ouss.backend.Repository.offersLangagesRepository;
import tech.ouss.backend.models.offerLanguages;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class offersLangagesService {
    private final offersLangagesRepository offersLangagesRepository;

    public offersLangagesService(tech.ouss.backend.Repository.offersLangagesRepository offersLangagesRepository) {
        this.offersLangagesRepository = offersLangagesRepository;
    }

    public offerLanguages createOfferLangages(offerLanguages offerLanguages) {
        return offersLangagesRepository.save(offerLanguages);
    }

    public offerLanguages getOfferLangagesById(int id) {
        return offersLangagesRepository.findById(id).orElse(null);
    }

    public void deleteOfferLangages(int id) {
        offersLangagesRepository.deleteById(id);
    }

    public offerLanguages updateOfferLangages(int id, offerLanguages offerLanguages) {
        if (offersLangagesRepository.existsById(id)) {
            offerLanguages.setId(id);
            return offersLangagesRepository.save(offerLanguages);
        }
        return null;
    }

    public List<offerLanguages> getAllOfferLangages() {
        return offersLangagesRepository.findAll();
    }
//    public List<offerLangages> getOfferLangagesByOfferId(int offerId) {
//        return offersLangagesRepository.findByOfferId(offerId);
//    }
}
