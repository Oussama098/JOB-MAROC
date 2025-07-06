package tech.ouss.backend.services;

import org.springframework.stereotype.Service;
import tech.ouss.backend.models.offer; // Assurez-vous d'importer votre entité Offer
import tech.ouss.backend.Repository.offerRepository; // Assurez-vous d'importer votre OfferRepository

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatisticsService {

    private final offerRepository offerRepository;

    public StatisticsService(offerRepository offerRepository) {
        this.offerRepository = offerRepository;
    }

    /**
     * Calcule le top 5 des secteurs d'activité basés sur le nombre d'offres,
     * retournant une liste de Map au lieu d'un DTO spécifique.
     * @return Une liste de Map<String, Object> où chaque map contient "name" (String) et "count" (Long).
     */
    public List<Map<String, Object>> getTop5Sectors() {
        List<offer> allOffers = offerRepository.findAll();

        // Agréger les offres par secteur d'activité et compter
        Map<String, Long> sectorCounts = allOffers.stream()
                .filter(offer -> offer.getSectorActivity() != null && !offer.getSectorActivity().trim().isEmpty())
                .collect(Collectors.groupingBy(offer::getSectorActivity, Collectors.counting()));

        // Convertir la map en liste de Map<String, Object>, trier et prendre les 5 premiers
        List<Map<String, Object>> topSectors = sectorCounts.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> sectorData = new HashMap<>();
                    sectorData.put("name", entry.getKey());
                    sectorData.put("count", entry.getValue());
                    return sectorData;
                })
                .sorted(Comparator.comparingLong((Map<String, Object> s) -> (Long) s.get("count")).reversed()) // CORRECTION ICI
                .limit(5) // Prendre les 5 premiers
                .collect(Collectors.toList());

        return topSectors;
    }

    public List<Map<String, Object>> getOffersByModality() {
        List<offer> allOffers = offerRepository.findAll();

        // Initialiser les comptes pour les modalités connues à 0
        Map<String, Long> modalityCounts = new HashMap<>();
        modalityCounts.put("OnSite", 0L);
        modalityCounts.put("Remote", 0L);
        modalityCounts.put("Hybrid", 0L);

        allOffers.forEach(offer -> {
            String modality = String.valueOf(offer.getModality());
            if (modality != null && !modality.trim().isEmpty()) {
                // S'assurer que la modalité est l'une de celles attendues
                if (modalityCounts.containsKey(modality)) {
                    modalityCounts.put(modality, modalityCounts.get(modality) + 1);
                }
            }
        });

        // Convertir la map en liste de Map<String, Object>
        List<Map<String, Object>> chartData = modalityCounts.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> modalityMap = new HashMap<>();
                    modalityMap.put("name", entry.getKey());
                    modalityMap.put("value", entry.getValue());
                    return modalityMap;
                })
                .collect(Collectors.toList());

        return chartData;
    }

    private String normalizeStudyLevel(String level) {
        if (level == null || level.trim().isEmpty()) {
            return null;
        }

        String lowerCaseLevel = level.toLowerCase().trim();

        // Règle pour exclure les valeurs d'expérience ou non pertinentes
        if (lowerCaseLevel.contains("expérience") ||
                lowerCaseLevel.contains("ans") ||
                lowerCaseLevel.contains("years") ||
                lowerCaseLevel.contains("débutant") ||
                lowerCaseLevel.contains("beginner") ||
                lowerCaseLevel.contains("confirmé") ||
                lowerCaseLevel.contains("senior") ||
                lowerCaseLevel.contains("junior") ||
                lowerCaseLevel.contains("expert") ||
                lowerCaseLevel.contains("from") ||
                lowerCaseLevel.contains("to") ||
                lowerCaseLevel.contains("student") ||
                lowerCaseLevel.contains("intern") ||
                lowerCaseLevel.contains("stage")
        ) {
            return null;
        }

        // Prioriser les niveaux les plus élevés et les plus spécifiques
        if (lowerCaseLevel.contains("bac+5") || lowerCaseLevel.contains("master") || lowerCaseLevel.contains("ingénieur") || lowerCaseLevel.contains("doctorat") || lowerCaseLevel.contains("bac+6") || lowerCaseLevel.contains("bac+7")) {
            return "Bac+5 et plus";
        }
        if (lowerCaseLevel.contains("bac+4")) {
            return "Bac+4";
        }
        if (lowerCaseLevel.contains("bac+3") || lowerCaseLevel.contains("licence")) {
            return "Bac+3";
        }
        if (lowerCaseLevel.contains("bac+2") || lowerCaseLevel.contains("dut") || lowerCaseLevel.contains("bts")) {
            return "Bac+2";
        }
        if (lowerCaseLevel.contains("bac+1") || lowerCaseLevel.contains("freshman year")) {
            return "Bac+1";
        }

        // Gérer le 'Bac' seul et ses variations
        if (lowerCaseLevel.equals("bac") || lowerCaseLevel.contains("niveau bac") || lowerCaseLevel.equals("> bac")) {
            return "Bac";
        }

        // Gérer les niveaux inférieurs au Bac
        if (lowerCaseLevel.contains("qualification avant bac") || lowerCaseLevel.contains("sans bac") || lowerCaseLevel.contains("brevet") || lowerCaseLevel.contains("collège") || lowerCaseLevel.contains("primaire") || lowerCaseLevel.contains("less than bac") || lowerCaseLevel.contains("< bac")) {
            return "< Bac";
        }

        if (lowerCaseLevel.contains("self-educated")) {
            return "Autodidacte";
        }

        System.err.println("Niveau d'étude non reconnu: " + lowerCaseLevel); // Pour le débogage
        return null;
    }


    public List<Map<String, Object>> getOffersByStudyLevel() {
        List<offer> allOffers = offerRepository.findAll();

        Map<String, Long> studyLevelCounts = new HashMap<>();

        allOffers.forEach(offer -> {
            String rawStudyLevel = offer.getStudyLevel(); // Assurez-vous que c'est le bon getter
            if (rawStudyLevel != null) {
                // Diviser la chaîne par des délimiteurs communs pour traiter plusieurs niveaux (ex: "bac+2, bac+3")
                List<String> levelsArray = Arrays.stream(rawStudyLevel.split("[,&/]|et plus|or"))
                        .map(String::trim)
                        .collect(Collectors.toList());

                levelsArray.forEach(levelPart -> {
                    String normalized = normalizeStudyLevel(levelPart);
                    if (normalized != null) { // Si normalized est null, c'est une entrée à ignorer
                        studyLevelCounts.put(normalized, studyLevelCounts.getOrDefault(normalized, 0L) + 1);
                    }
                });
            }
        });

        // Définir l'ordre souhaité des catégories pour le graphique (identique au frontend)
        List<String> desiredOrder = Arrays.asList(
                "Autodidacte", "< Bac", "Bac", "Bac+1", "Bac+2", "Bac+3", "Bac+4", "Bac+5 et plus"
        );

        // Construire le tableau final pour le graphique en respectant l'ordre
        List<Map<String, Object>> chartData = desiredOrder.stream()
                .map(name -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("name", name);
                    data.put("count", studyLevelCounts.getOrDefault(name, 0L)); // Obtenir le compte, ou 0 si la catégorie n'a pas d'offres
                    return data;
                })
                .collect(Collectors.toList());

        return chartData;
    }

    private String removeAccents(String str) {
        if (str == null) {
            return null;
        }
        // Normalize to NFD (Canonical Decomposition) and remove diacritical marks
        String normalized = Normalizer.normalize(str, Normalizer.Form.NFD);
        // Replace all characters that are not ASCII or specific extended characters (like œ, æ)
        // This regex removes combining diacritical marks (U+0300 to U+036F)
        String cleaned = normalized.replaceAll("\\p{M}", "");
        // Handle specific ligatures if necessary (e.g., œ -> oe, æ -> ae)
        cleaned = cleaned.replace("œ", "oe").replace("Œ", "OE");
        cleaned = cleaned.replace("æ", "ae").replace("Æ", "AE");
        return cleaned;
    }

    private String normalizeRegion(String location) {
        if (location == null || location.trim().isEmpty()) {
            return "Non spécifié";
        }

        // Apply removeAccents and trim() after toLowerCase()
        String cleanedLocation = removeAccents(location).toLowerCase().trim();

        // -- Traiter les cas génériques ou non pertinents en premier --
        if (
                cleanedLocation.contains("international") ||
                        cleanedLocation.equals("maroc") ||
                        cleanedLocation.contains("tout le maroc") ||
                        cleanedLocation.contains("plusieurs villes") ||
                        cleanedLocation.contains("service client") ||
                        cleanedLocation.contains("teletravail") ||
                        cleanedLocation.equals("tele travail") ||
                        cleanedLocation.equals("remote") ||
                        cleanedLocation.equals("hybrid") ||
                        cleanedLocation.equals("on site") ||
                        cleanedLocation.equals("on-site") ||
                        cleanedLocation.equals("a distance") ||
                        cleanedLocation.contains("toute le maroc") ||
                        cleanedLocation.contains("tous le maroc")
        ) {
            return "Non spécifié";
        }

        Map<String, String> moroccanRegionNamesDisplay = new HashMap<>();
        moroccanRegionNamesDisplay.put("tanger-tetouan-al hoceima", "Tanger-Tétouan-Al Hoceïma");
        moroccanRegionNamesDisplay.put("l'oriental", "L'Oriental");
        moroccanRegionNamesDisplay.put("fes-meknes", "Fès-Meknès");
        moroccanRegionNamesDisplay.put("rabat-sale-kenitra", "Rabat-Salé-Kénitra");
        moroccanRegionNamesDisplay.put("beni mellal-khenifra", "Béni Mellal-Khénifra");
        moroccanRegionNamesDisplay.put("casablanca-settat", "Casablanca-Settat");
        moroccanRegionNamesDisplay.put("marrakech-safi", "Marrakech-Safi");
        moroccanRegionNamesDisplay.put("draa-tafilalet", "Drâa-Tafilalet");
        moroccanRegionNamesDisplay.put("souss-massa", "Souss-Massa");
        moroccanRegionNamesDisplay.put("guelmim-oued noun", "Guelmim-Oued Noun");
        moroccanRegionNamesDisplay.put("laayoune-sakia el hamra", "Laâyoune-Sakia El Hamra");
        moroccanRegionNamesDisplay.put("dakhla-oued ed-dahab", "Dakhla-Oued Ed-Dahab");

        for (Map.Entry<String, String> entry : moroccanRegionNamesDisplay.entrySet()) {
            if (cleanedLocation.contains(entry.getKey())) {
                return entry.getValue();
            }
        }

        // Mapping des villes/zones aux 12 régions du Maroc (mots-clés également en non-accentué)
        if (cleanedLocation.contains("tanger") ||
                cleanedLocation.contains("tetouan") ||
                cleanedLocation.contains("al hoceima") ||
                cleanedLocation.contains("larache") ||
                cleanedLocation.contains("chefchaouen") ||
                cleanedLocation.contains("m'diq") ||
                cleanedLocation.contains("fnideq") ||
                cleanedLocation.contains("ouezzane") ||
                cleanedLocation.contains("martil") ||
                cleanedLocation.contains("asilah") ||
                cleanedLocation.contains("el houceima")
        ) {
            return "Tanger-Tétouan-Al Hoceïma";
        }
        if (cleanedLocation.contains("oujda") ||
                cleanedLocation.contains("nador") ||
                cleanedLocation.contains("berkane") ||
                cleanedLocation.contains("taourirt") ||
                cleanedLocation.contains("jerada") ||
                cleanedLocation.contains("figuig") ||
                cleanedLocation.contains("driouch") ||
                cleanedLocation.contains("guercif")
        ) {
            return "L'Oriental";
        }
        if (cleanedLocation.contains("fes") ||
                cleanedLocation.contains("meknes") ||
                cleanedLocation.contains("ifrane") ||
                cleanedLocation.contains("sidi kacem") ||
                cleanedLocation.contains("taza") ||
                cleanedLocation.contains("boulemane") ||
                cleanedLocation.contains("el hajeb") ||
                cleanedLocation.contains("khemisset") ||
                cleanedLocation.contains("moulay yaacoub") ||
                cleanedLocation.contains("sefrou")
        ) {
            return "Fès-Meknès";
        }
        if (cleanedLocation.contains("rabat") ||
                cleanedLocation.contains("sale") ||
                cleanedLocation.contains("kenitra") ||
                cleanedLocation.contains("skhirat") ||
                cleanedLocation.contains("temara") ||
                cleanedLocation.contains("khemisset") ||
                cleanedLocation.contains("sidi slimane") ||
                cleanedLocation.contains("sidi yahya el gharb") ||
                cleanedLocation.contains("ain aouda") ||
                cleanedLocation.contains("ain atiq") ||
                cleanedLocation.contains("bouznika") ||
                cleanedLocation.contains("sala al jadida") ||
                cleanedLocation.contains("belksiri") ||
                cleanedLocation.contains("tiflet") ||
                cleanedLocation.contains("moulay bousselham") ||
                cleanedLocation.contains("technopolis") ||
                cleanedLocation.contains("ain el aouda") ||
                cleanedLocation.contains("sidi allal bahraoui") ||
                cleanedLocation.contains("skhrirat")
        ) {
            return "Rabat-Salé-Kénitra";
        }
        if (cleanedLocation.contains("beni mellal") ||
                cleanedLocation.contains("khenifra") ||
                cleanedLocation.contains("fquih ben salah") ||
                cleanedLocation.contains("azilal") ||
                cleanedLocation.contains("khouribga")
        ) {
            return "Béni Mellal-Khénifra";
        }
        if (cleanedLocation.contains("casablanca") ||
                cleanedLocation.contains("mohammedia") ||
                cleanedLocation.contains("settat") ||
                cleanedLocation.contains("el jadida") ||
                cleanedLocation.contains("sidi bennour") ||
                cleanedLocation.contains("berrechid") ||
                cleanedLocation.contains("nouaceur") ||
                cleanedLocation.contains("mediouna") ||
                cleanedLocation.contains("ben slimane") ||
                cleanedLocation.contains("had soualem") ||
                cleanedLocation.contains("bouskoura") ||
                cleanedLocation.contains("sidi rahhal") ||
                cleanedLocation.contains("tit mellil") ||
                cleanedLocation.contains("jorf lasfar") ||
                cleanedLocation.contains("casabanca") ||
                cleanedLocation.contains("ain sbaa") ||
                cleanedLocation.contains("dar bouazza")
        ) {
            return "Casablanca-Settat";
        }
        if (cleanedLocation.contains("marrakech") ||
                cleanedLocation.contains("safi") ||
                cleanedLocation.contains("essaouira") ||
                cleanedLocation.contains("kelaa sraghna") ||
                cleanedLocation.contains("chichaoua") ||
                cleanedLocation.contains("youssoufia") ||
                cleanedLocation.contains("rehamna") ||
                cleanedLocation.contains("sebt gzoula") ||
                cleanedLocation.contains("benguerir") ||
                cleanedLocation.contains("imintanoute")
        ) {
            return "Marrakech-Safi";
        }
        if (cleanedLocation.contains("errachidia") ||
                cleanedLocation.contains("ouarzazate") ||
                cleanedLocation.contains("zagora") ||
                cleanedLocation.contains("tinghir") ||
                cleanedLocation.contains("midelt") ||
                cleanedLocation.contains("region draa tafilalet") ||
                cleanedLocation.contains("el jorf")
        ) {
            return "Drâa-Tafilalet";
        }
        if (cleanedLocation.contains("agadir") ||
                cleanedLocation.contains("inezgane") ||
                cleanedLocation.contains("tiznit") ||
                cleanedLocation.contains("taroudant") ||
                cleanedLocation.contains("chtouka ait baha") ||
                cleanedLocation.contains("ait melloul") ||
                cleanedLocation.contains("sidi ifni") ||
                cleanedLocation.contains("tata") ||
                cleanedLocation.contains("taliouine") ||
                cleanedLocation.contains("inzegane") ||
                cleanedLocation.contains("dcheira") ||
                cleanedLocation.contains("oulad teima")
        ) {
            return "Souss-Massa";
        }
        if (cleanedLocation.contains("guelmim") ||
                cleanedLocation.contains("tan-tan") ||
                cleanedLocation.contains("assah") ||
                cleanedLocation.contains("smara") ||
                cleanedLocation.contains("boujdour")
        ) {
            return "Guelmim-Oued Noun";
        }
        if (cleanedLocation.contains("laayoune") ||
                cleanedLocation.contains("smara") ||
                cleanedLocation.contains("boujdour") ||
                cleanedLocation.contains("tarfaya")
        ) {
            return "Laâyoune-Sakia El Hamra";
        }
        if (cleanedLocation.contains("dakhla") ||
                cleanedLocation.contains("aousserd")
        ) {
            return "Dakhla-Oued Ed-Dahab";
        }

        System.err.println("Région non reconnue pour la localisation: " + location);
        return "Non spécifié";
    }

    /**
     * Calcule la répartition des offres par région au Maroc.
     * La logique de normalisation des régions est déplacée du frontend.
     * @return Une liste de Map<String, Object> où chaque map contient "name" (nom de la région) et "count" (nombre d'offres).
     */
    public List<Map<String, Object>> getOffersByRegion() {
        List<offer> allOffers = offerRepository.findAll();

        Map<String, Long> regionCounts = new HashMap<>();
        List<String> moroccanRegions = Arrays.asList(
                "Tanger-Tétouan-Al Hoceïma", "L'Oriental", "Fès-Meknès",
                "Rabat-Salé-Kénitra", "Béni Mellal-Khénifra", "Casablanca-Settat",
                "Marrakech-Safi", "Drâa-Tafilalet", "Souss-Massa",
                "Guelmim-Oued Noun", "Laâyoune-Sakia El Hamra", "Dakhla-Oued Ed-Dahab",
                "Non spécifié" // Inclure cette catégorie pour les non-spécifiés ou non reconnus
        );
        moroccanRegions.forEach(region -> regionCounts.put(region, 0L)); // Initialize all regions to 0

        allOffers.forEach(offer -> {
            String rawLocation = offer.getLocation(); // Assurez-vous que c'est le bon getter
            if (rawLocation != null && !rawLocation.trim().isEmpty()) {
                // Split the location string by common delimiters, then clean and normalize each part
                List<String> locationParts = Arrays.stream(rawLocation.split("[ -]+|,\\s*|\\s*-\\s*|/|\\s*et\\s*")) // Regex for common delimiters
                        .map(String::trim)
                        .filter(part -> !part.isEmpty())
                        .collect(Collectors.toList());

                boolean foundRegionForOffer = false;

                if (!locationParts.isEmpty()) {
                    for (String part : locationParts) {
                        String normalizedRegion = normalizeRegion(part);
                        if (normalizedRegion != null && !normalizedRegion.equals("Non spécifié")) {
                            regionCounts.put(normalizedRegion, regionCounts.getOrDefault(normalizedRegion, 0L) + 1);
                            foundRegionForOffer = true;
                        }
                    }
                }

                // If no specific region was found for any part, or if the original rawLocation was empty/null,
                // count it as 'Non spécifié'. This handles "international", "maroc", etc.
                if (!foundRegionForOffer && (rawLocation.trim().isEmpty() || normalizeRegion(rawLocation).equals("Non spécifié"))) {
                    regionCounts.put("Non spécifié", regionCounts.getOrDefault("Non spécifié", 0L) + 1);
                }
            } else {
                // If rawLocation is null or empty, count it directly as 'Non spécifié'
                regionCounts.put("Non spécifié", regionCounts.getOrDefault("Non spécifié", 0L) + 1);
            }
        });

        // Convert map to list, filter out regions with 0 count unless it's "Non spécifié"
        List<Map<String, Object>> chartData = moroccanRegions.stream()
                .map(regionName -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("name", regionName);
                    data.put("count", regionCounts.getOrDefault(regionName, 0L));
                    return data;
                })
                .filter(item -> (Long) item.get("count") > 0 || "Non spécifié".equals(item.get("name"))) // Keep if count > 0 or if it's "Non spécifié"
                .collect(Collectors.toList());

        return chartData;
    }

//    public List<Map<String, Object>> getMonthlyOfferCountsForYear(int year) {
//        List<offer> allOffers = offerRepository.findAll();
//
//        Map<Integer, Long> monthlyCounts = new HashMap<>();
//        // Initialize counts for all 12 months to 0 (month index 0-11)
//        for (int i = 0; i < 12; i++) {
//            monthlyCounts.put(i, 0L);
//        }
//
//        allOffers.stream()
//                .filter(offer -> offer.getDatePublication() != null)
//                .forEach(offer -> {
//                    // Directly use the LocalDate returned by getDatePublication()
//                    LocalDate publicationDate = offer.getDatePublication(); // <<< This is the fix
//
//                    if (publicationDate.getYear() == year) {
//                        int monthIndex = publicationDate.getMonthValue() - 1; // MonthValue is 1-12, we need 0-11
//                        monthlyCounts.put(monthIndex, monthlyCounts.getOrDefault(monthIndex, 0L) + 1);
//                    }
//                });
//
//        // Convert map to list for Recharts, ensuring correct order (January to December)
//        return monthlyCounts.entrySet().stream()
//                .sorted(Map.Entry.comparingByKey()) // Sort by month index (0-11)
//                .map(entry -> {
//                    Map<String, Object> monthData = new HashMap<>();
//                    monthData.put("monthIndex", entry.getKey());
//                    monthData.put("count", entry.getValue());
//                    return monthData;
//                })
//                .collect(Collectors.toList());
//    }
}
