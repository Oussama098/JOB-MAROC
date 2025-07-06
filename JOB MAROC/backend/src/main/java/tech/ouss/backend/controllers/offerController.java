package tech.ouss.backend.controllers;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.ouss.backend.Enums.NotificationType;
import  tech.ouss.backend.services.*;
import  tech.ouss.backend.models.*;

import java.util.*;

@RestController
@RequestMapping("/offers")
public class offerController {

    private final offerService offerService;
    private final offersLangagesService offersLangagesService;
    private final contractTypeService contractTypeService;
    private final managerService managerService;

    public offerController(offerService offerService, offersLangagesService offersLangagesService, contractTypeService contractTypeService, tech.ouss.backend.services.managerService managerService) {
        this.offerService = offerService;
        this.offersLangagesService = offersLangagesService;
        this.contractTypeService = contractTypeService;
        this.managerService = managerService;
    }

    @GetMapping(path = "/all" , produces = "application/json")
    public List<offer> getAllOffers() {
//        List<offer> l = new ArrayList<>();
//        for (offer o : this.offerService.getAllOffers()){
//            if (o.getOffer_id() == 7152){
//                l.add(o);
//            }
//        }
//        return l;
        return this.offerService.getAllOffers();
    }

    @PostMapping(path = "/add" , consumes = "application/json")
    public ResponseEntity<?> createOffer(@Valid @RequestBody offer incomingOffer) { // Added @Valid, renamed parameter
        try {
            if (incomingOffer.getTitle() == null || incomingOffer.getDescription() == null || incomingOffer.getCompanyName() == null) {
                return ResponseEntity.badRequest().body("Invalid offer data: Missing required fields.");
            }
            offer offerToSave = new offer();

            Optional<manager> existingManager = Optional.ofNullable(this.managerService.getManagerByEmail(incomingOffer.getManagerId().getUser().getEmail()));
            existingManager.ifPresent(offerToSave::setManagerId);
            offerToSave.setTitle(incomingOffer.getTitle());
            offerToSave.setDescription(incomingOffer.getDescription());
            offerToSave.setLocation(incomingOffer.getLocation());
            offerToSave.setBasicSalary(incomingOffer.getBasicSalary());
            offerToSave.setDatePublication(incomingOffer.getDatePublication());
            offerToSave.setDateExpiration(incomingOffer.getDateExpiration());
            offerToSave.setCompanyName(incomingOffer.getCompanyName());
            offerToSave.setSectorActivity(incomingOffer.getSectorActivity());
            offerToSave.setStudyLevel(incomingOffer.getStudyLevel()); // Corrected field name capitalization
            offerToSave.setExperience(incomingOffer.getExperience());
            offerToSave.setSkills(incomingOffer.getSkills());
            offerToSave.setModality(incomingOffer.getModality());
            offerToSave.setFlexibleHours(incomingOffer.getFlexibleHours()); // Corrected getter for boolean
            Set<offerLanguages> languagesToLink = new HashSet<>();
            if (incomingOffer.getLanguages() != null) {
                for (offerLanguages lang : incomingOffer.getLanguages()) {
                    offerLanguages languageToLink = new offerLanguages();
                    languageToLink.setLanguageName(lang.getLanguageName());
                    languageToLink.setDescription(lang.getDescription());
                    languageToLink.setLevel(lang.getLevel());
                    languageToLink.setOfferId(offerToSave);

                    languagesToLink.add(languageToLink);
                }
            }
            offerToSave.setLanguages(languagesToLink); // Set the collection on the offer to be saved
            if (incomingOffer.getManagerId() != null &&
                    incomingOffer.getManagerId().getUser() != null && // Assurez-vous que l'objet user n'est pas null
                    incomingOffer.getManagerId().getUser().getEmail() != null &&
                    !incomingOffer.getManagerId().getUser().getEmail().isEmpty()) {

                manager foundManager = managerService.getManagerByEmail(incomingOffer.getManagerId().getUser().getEmail());
                if (foundManager != null) {
                    offerToSave.setManagerId(foundManager);
                } else {
//                    System.err.println("Manager with email " + incomingOffer.getManagerId().getUser().getEmail() + " not found. Offer will be created without manager association.");
                    offerToSave.setManagerId(null); // Assurez-vous que la relation est null si non trouvée
                }
            } else {
                offerToSave.setManagerId(null);
            }
            Set<ContractType> contractTypesToLink = new HashSet<>();

            if (incomingOffer.getContractTypes() != null) {
                for(ContractType incomingContractType : incomingOffer.getContractTypes()) {

                    ContractType existingContractType = contractTypeService.getContractTypeByName(incomingContractType.getTypeName());

                    if (existingContractType != null) {
                        // If found, add the existing database-managed entity to the set
                        contractTypesToLink.add(existingContractType);
                        // !!! IMPORTANT: Set the bidirectional link on the ContractType side !!!
                        // This is often necessary for Hibernate to correctly manage the many-to-many join table.
                        // Ensure ContractType.addOffer() is implemented SAFELY to avoid StackOverflowError.
                        existingContractType.addOffer(offerToSave);
                    } else {
                        // If not found, return an error as the contract type must exist
                        return ResponseEntity.badRequest().body("Contract type not found: " + incomingContractType.getTypeName());
                    }
                }
            }

            offerToSave.setContractTypes(contractTypesToLink);

            offer createdOffer = offerService.createOffer(offerToSave);
            notification notification = new notification();
            notification.setType(NotificationType.NEW_OFFER_CREATED);
            notification.setMessage("Vous avez cree l'offre : "+ createdOffer.getTitle() +" avec succees");
            notification.setUserRecipent(createdOffer.getManagerId().getUser());
            return ResponseEntity.status(201).body(createdOffer);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("An error occurred while creating the offer.");
        }
    }

    @DeleteMapping(path = "/delete/{id}")
    public ResponseEntity<?> deleteOffer(@PathVariable int id) {
        try {
            offer existedOffer= this.offerService.getOfferById(id);
            if (existedOffer == null){
                return ResponseEntity.notFound().build();
            }
            offerService.deleteOffer(id);
            notification notification = new notification();
            notification.setType(NotificationType.UPDATED_OFFER);
            notification.setMessage("L'offre : "+existedOffer.getTitle()+" est supprimee avec succes");
            notification.setUserRecipent(existedOffer.getManagerId().getUser());
            return ResponseEntity.ok("Offer deleted successfully.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("An error occurred while deleting the offer.");
        }
    }

    @GetMapping(path = "/manager/{Email}", produces = "application/json")
    public ResponseEntity<?> getOfferByManagerEmail(@PathVariable String Email) {
        try {
            List<offer> offers = offerService.getOffersByManagerEmail(Email);
            if (offers.isEmpty()) {
                return ResponseEntity.status(404).body("No offers found for this manager.");
            }
            return ResponseEntity.ok(offers);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("An error occurred while fetching offers for the manager.");
        }
    }





}
