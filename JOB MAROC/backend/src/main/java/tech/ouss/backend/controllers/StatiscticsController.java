package tech.ouss.backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import tech.ouss.backend.services.StatisticsService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/statistics")
public class StatiscticsController {

    private final StatisticsService statisticsService;

    public StatiscticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    /**
     * Endpoint pour récupérer le top 5 des secteurs d'activité avec le nombre d'offres.
     * Retourne une liste de Map<String, Object> au lieu d'un DTO spécifique.
     * Accessible par les rôles ADMIN et MANAGER.
     */
    @GetMapping("/top5-sectors")
    @PreAuthorize("hasAnyAuthority('ADMIN')") // Exemple de sécurité : ajustez selon vos besoins
    public ResponseEntity<List<Map<String, Object>>> getTop5Sectors() {
        List<Map<String, Object>> topSectors = statisticsService.getTop5Sectors();
        return ResponseEntity.ok(topSectors);
    }

    @GetMapping("/offers-by-modality")
    @PreAuthorize("hasAnyAuthority('ADMIN')") // Exemple de sécurité
    public ResponseEntity<List<Map<String, Object>>> getOffersByModality() {
        List<Map<String, Object>> modalityData = statisticsService.getOffersByModality();
        return ResponseEntity.ok(modalityData);
    }

    @GetMapping("/offers-by-study-level")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')") // Exemple de sécurité
    public ResponseEntity<List<Map<String, Object>>> getOffersByStudyLevel() {
        List<Map<String, Object>> studyLevelData = statisticsService.getOffersByStudyLevel();
        return ResponseEntity.ok(studyLevelData);
    }

    @GetMapping("/offers-by-region")
    @PreAuthorize("hasAnyAuthority('ADMIN')") // Exemple de sécurité
    public ResponseEntity<List<Map<String, Object>>> getOffersByRegion() {
        List<Map<String, Object>> regionsData = statisticsService.getOffersByRegion();
        return ResponseEntity.ok(regionsData);
    }

//    @GetMapping("/offers-monthly-by-year")
//    @PreAuthorize("hasAnyAuthority('ADMIN')")
//    public ResponseEntity<List<Map<String, Object>>> getOffersMonthlyByYear(@RequestParam("year") int year) {
//        List<Map<String, Object>> monthlyData = statisticsService.getMonthlyOfferCountsForYear(year);
//        return ResponseEntity.ok(monthlyData);
//    }


}
