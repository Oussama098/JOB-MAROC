import React, { useState, useEffect, useMemo, useRef } from 'react'; // Import useRef
import {
    PlusCircle, AlertTriangle, Info, Loader2, Search, SlidersHorizontal,
    ChevronLeft, ChevronRight, CheckCircle
} from 'lucide-react';
import OfferCard from '../users/OfferCard'; // Ensure correct path
import AddOfferModal from '../../Others/AddOfferModal'; // Ensure correct path
import DeleteConfirmationModal from '../../Others/DeleteConfirmationModal'; // Ensure correct path
import { Api } from '../../services/Api';
import OfferDetailModal from '../users/OfferDetailModal';




const AdminOffers = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);

    const handleOpenModal = (offer) => {
        setSelectedOffer(offer); // This stores the data of the offer that was clicked
        setIsModalOpen(true);    // This tells the app to show the modal
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOffer(null); // Clear selected offer
    };
    // State for managing the list of offers from backend and scraped data
    const [offers, setOffers] = useState([]); // Combined list of offers
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // State for controlling the visibility of the Add Offer modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false); // Renamed for clarity

    // --- State for Delete Confirmation Modal ---
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [offerToDelete, setOfferToDelete] = useState(null); // Stores the offer object to delete
    const [isDeleting, setIsDeleting] = useState(false); // State to track deletion in progress
    // --- State for Delete Status Messages ---
    const [deleteSuccessMessage, setDeleteSuccessMessage] = useState(null);
    const [deleteErrorMessage, setDeleteErrorMessage] = useState(null);
    // Refs to store timeout IDs for messages
    const successMessageTimeoutRef = useRef(null);
    const errorMessageTimeoutRef = useRef(null);
    // --- End State for Delete Status Messages ---
    // --- End State for Delete Confirmation Modal ---


    // --- State for Filtering and Search ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        modality: '',
        sectorActivity: '',
        // Add more filter states here
    });
   
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6); // Number of offers to display per page
    const visiblePageNumbers = 3; // Number of page numbers to show around the current page
    // --- End State for Pagination ---


    // Retrieve the JWT token from local storage for authentication
    const token = localStorage.getItem('jwtToken');

    // Function to fetch offers from the backend API and load scraped data
    const fetchAllOffers = async () => {
        setLoading(true); 
        setError(null); 
        setOffers([]); 
        setCurrentPage(1); 
        setDeleteSuccessMessage(null);
        setDeleteErrorMessage(null);


        // Fetch offers from your backend API
        let backendData = [];
        if (token) { // Only fetch from backend if token exists
            try {
                // Use the imported Api service to make the GET request
                const responseData = await Api.get('/offers/all', {
                     headers: {
                         'Authorization': `Bearer ${token}` // Include the JWT token in headers
                     }
                });

                console.log("AdminOffers: Backend API response data:", responseData);

                // --- Backend Data Handling Logic ---
                // Assuming Api.get returns the full Axios response object,
                // the actual data is in responseData.data
                if (responseData && Array.isArray(responseData.data)) {
                    backendData = responseData.data;
                }
                 // Add checks for other common nested structures as fallbacks if needed
                else if (Array.isArray(responseData)) { // Fallback for direct array response
                    backendData = responseData;
                }
                else if (responseData && Array.isArray(responseData.content)) {
                    backendData = responseData.content;
                } else if (responseData && Array.isArray(responseData._embedded?.offers)) {
                     backendData = responseData._embedded.offers;
                }
                else {
                    console.error("Backend API response is not in an expected array format or is null/undefined.", responseData);
                    // Optionally set a backend-specific error here if needed
                }
                // --- End Backend Data Handling Logic ---

            } catch (err) {
                console.error("Failed to fetch backend offers:", err);
                // Set a general error, but still attempt to load scraped data
                setError(prevError =>
                    prevError
                        ? new Error(`${prevError.message}\nFailed to fetch backend offers: ${err.message}`)
                        : new Error(`Failed to fetch backend offers: ${err.message}`)
                );
            }
        } else {
             console.warn("No JWT token found. Skipping backend offer fetch.");
             // Optionally set a warning message to the user
        }


        const allOffers = [...(Array.isArray(backendData) ? backendData : [])];
        setOffers(allOffers); // Set the combined list to the main offers state
        setLoading(false); // Set loading to false after both fetches complete

    };

    // useEffect hook to fetch all offers when the component mounts or when the token changes
    useEffect(() => {
        fetchAllOffers();
    }, [token]); // Rerun effect if the token changes

    // Function to handle when a new offer is successfully added via the modal
    const handleOfferAdded = (newOffer) => {
        // After an offer is added to the backend, refetch all offers (backend + scraped)
        // This ensures the list is up-to-date including the new offer and scraped data.
        fetchAllOffers();
    };

    // --- Delete Offer Logic ---
    // Function called when the delete icon is clicked on an OfferCard
    const handleDeleteOfferClick = (offerId) => {
        console.log("Delete icon clicked for offer ID:", offerId);
        // Find the offer object by ID to pass its title to the modal
        const offer = offers.find(o => o.offer_id === offerId);
        if (offer) {
            setOfferToDelete(offer); // Store the offer object
            setIsDeleteModalOpen(true); // Open the confirmation modal
            // Clear previous delete messages when opening modal
            setDeleteSuccessMessage(null);
            setDeleteErrorMessage(null);
        } else {
            console.error("Offer with ID not found for deletion:", offerId);
            // Optionally show an error message to the user
            setDeleteErrorMessage("Could not find the offer to delete.");
        }
    };

    // Function called when the user confirms deletion in the modal
    const handleConfirmDelete = async () => {
        if (!offerToDelete || isDeleting) return; // Prevent deletion if no offer selected or already deleting

        setIsDeleting(true); // Set deleting state to true
        setDeleteSuccessMessage(null); // Clear previous success message
        setDeleteErrorMessage(null); // Clear previous error message


        try {
            // Ensure a token is available before attempting to delete
            if (!token) {
                 setDeleteErrorMessage("Authentication token not found. Cannot delete offer.");
                 setIsDeleting(false);
                 setIsDeleteModalOpen(false); // Close modal on error
                 setOfferToDelete(null); // Clear offer to delete
                 return;
            }

            console.log("Attempting to delete offer with ID:", offerToDelete.offer_id);
            // --- UPDATED API CALL TO MATCH BACKEND ENDPOINT ---
            const response = await Api.delete(`/offers/delete/${offerToDelete.offer_id}`, {
                 headers: {
                     'Authorization': `Bearer ${token}` // Include the JWT token
                 }
            });
            // --- END UPDATED API CALL ---

            console.log("Delete API response:", response);

            // If deletion is successful (check response status or data structure based on your API)
            // Assuming a successful response status (2xx) indicates success
            if (response.status >= 200 && response.status < 300) {
                 console.log("Offer deleted successfully:", offerToDelete.offer_id);
                 setDeleteSuccessMessage(`Offer "${offerToDelete.title}" deleted successfully.`);
                 // Remove the deleted offer from the local state
                 setOffers(offers.filter(offer => offer.offer_id !== offerToDelete.offer_id));
                 // Optional: Refetch offers after successful deletion if needed for complex state updates
                 // fetchAllOffers(); // Uncomment if local state update is not sufficient
            } else {
                 // Handle cases where the API call was successful but the backend reported an error
                 // Check for a specific error message in the response body if your backend provides one
                 const errorBody = await response.text().catch(() => "Unknown error"); // Attempt to get text, fallback if fails
                 const errorMessage = errorBody || `Failed to delete offer with status: ${response.status}`; // Assuming backend sends a string message
                 console.error("Backend reported error deleting offer:", errorMessage);
                 setDeleteErrorMessage(`Failed to delete offer "${offerToDelete.title}": ${errorMessage}`);
            }

        } catch (err) {
            console.error("Error during offer deletion API call:", err);
            // Handle network errors or other API call failures
            const errorMessage = err.response?.data || err.message || "An unexpected error occurred during deletion."; // Assuming backend sends a string message or use generic error
            setDeleteErrorMessage(`Failed to delete offer "${offerToDelete?.title || 'this offer'}": ${errorMessage}`);
        } finally {
            setIsDeleting(false); // Set deleting state to false
            setIsDeleteModalOpen(false); // Close the modal
            setOfferToDelete(null); // Clear the offer to delete
            // Messages will remain visible until cleared by a new action (like fetching or opening modal)
        }
    };

    // Function called when the user cancels deletion in the modal
    const handleCancelDelete = () => {
        console.log("Deletion cancelled.");
        setIsDeleteModalOpen(false); // Close the modal
        setOfferToDelete(null); // Clear the offer to delete
        // Keep success/error messages visible until a new action occurs
    };
    // --- End Delete Offer Logic ---

    // --- Message Auto-hide Logic ---
    useEffect(() => {
        // Clear any existing timeout when success message changes
        if (successMessageTimeoutRef.current) {
            clearTimeout(successMessageTimeoutRef.current);
        }
        if (deleteSuccessMessage) {
            // Set a new timeout to clear the message after 5 seconds
            successMessageTimeoutRef.current = setTimeout(() => {
                setDeleteSuccessMessage(null);
            }, 5000); // 5000 milliseconds = 5 seconds
        }

        // Cleanup function to clear timeout if component unmounts or message changes
        return () => {
            if (successMessageTimeoutRef.current) {
                clearTimeout(successMessageTimeoutRef.current);
            }
        };
    }, [deleteSuccessMessage]); // Effect runs when deleteSuccessMessage changes

    useEffect(() => {
        // Clear any existing timeout when error message changes
        if (errorMessageTimeoutRef.current) {
            clearTimeout(errorMessageTimeoutRef.current);
        }
        if (deleteErrorMessage) {
            // Set a new timeout to clear the message after 7 seconds (slightly longer for errors)
            errorMessageTimeoutRef.current = setTimeout(() => {
                setDeleteErrorMessage(null);
            }, 7000); // 7000 milliseconds = 7 seconds
        }

        // Cleanup function to clear timeout if component unmounts or message changes
        return () => {
            if (errorMessageTimeoutRef.current) {
                clearTimeout(errorMessageTimeoutRef.current);
            }
        };
    }, [deleteErrorMessage]); // Effect runs when deleteErrorMessage changes
    // --- End Message Auto-hide Logic ---


    // --- Filtering Logic ---
    // Use useMemo to memoize the filtered offers and avoid unnecessary recalculations
    const filteredOffers = useMemo(() => {
        // Add check to ensure offers is an array before filtering
        if (!Array.isArray(offers)) {
            console.warn("Offers state is not an array, returning empty list for filtering.");
            return [];
        }

        let currentOffers = offers; // Use the combined list

        // Apply Search Term Filter
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            currentOffers = currentOffers.filter(offer =>
                offer.title?.toLowerCase().includes(lowerCaseSearchTerm) ||
                offer.companyName?.toLowerCase().includes(lowerCaseSearchTerm) ||
                offer.skills?.toLowerCase().includes(lowerCaseSearchTerm) || // Search backend offers skills
                offer.location?.toLowerCase().includes(lowerCaseSearchTerm) || // Search backend offers location
                offer.description?.toLowerCase().includes(lowerCaseSearchTerm) || // Search backend offers description
                 // Search scraped data fields if they exist
                 (offer.originalHref?.toLowerCase().includes(lowerCaseSearchTerm)) ||
                 (offer.cardType?.toLowerCase().includes(lowerCaseSearchTerm)) ||
                 (offer.cardFooter1?.toLowerCase().includes(lowerCaseSearchTerm)) || // Search cardFooter1
                 (offer.cardFooter3?.toLowerCase().includes(lowerCaseSearchTerm)) || // Search cardFooter3
                // Search by contract type name (for backend offers)
                (Array.isArray(offer.contractTypes) && offer.contractTypes.some(type =>
                    type.typeName?.toLowerCase().includes(lowerCaseSearchTerm)
                ))
                // Add other searchable fields here if you map them from scraped data
            );
        }

        // Apply Modality Filter (primarily for backend offers, scraped offers are "N/A" or "Annonce")
        if (filters.modality) {
            currentOffers = currentOffers.filter(offer =>
                offer.modality === filters.modality
            );
        }

        // Apply Sector Activity Filter (primarily for backend offers, scraped offers are "N/A")
        if (filters.sectorActivity) {
             currentOffers = currentOffers.filter(offer =>
                 offer.sectorActivity === filters.sectorActivity
             );
        }

        // Add more filter logic here for other criteria

        // Reset to first page if filters/search change
        setCurrentPage(1);

        return currentOffers;
    }, [offers, searchTerm, filters]); // Dependencies: recalculate if offers, searchTerm, or filters change
    // --- End Filtering Logic ---

    // --- Pagination Logic ---
    // Calculate indexes for the current page
    const indexOfLastOffer = currentPage * itemsPerPage;
    const indexOfFirstOffer = indexOfLastOffer - itemsPerPage;
    // Get the offers for the current page
    // Add check before slicing filteredOffers
    const currentOffersForPage = Array.isArray(filteredOffers) ? filteredOffers.slice(indexOfFirstOffer, indexOfLastOffer) : [];


    // Calculate total pages (moved outside useMemo for access in JSX)
    const totalOffersCount = Array.isArray(filteredOffers) ? filteredOffers.length : 0;
    const totalPages = Math.ceil(totalOffersCount / itemsPerPage);


    // Function to change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Generate page numbers for the pagination controls
    // Calculate startPage and endPage here as well for JSX access
    const maxVisible = visiblePageNumbers;
    const sidePages = Math.floor(maxVisible / 2);

    let startPage = Math.max(1, currentPage - sidePages);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    // Adjust start and end if they hit boundaries
    if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - maxVisible + 1);
    }
     if (startPage === 1) {
         endPage = Math.min(totalPages, maxVisible);
     }
     // Ensure startPage is at least 1 after all adjustments
     startPage = Math.max(1, startPage);


    const pageNumbersArray = useMemo(() => {
        const numbers = [];

        // Add first page and ellipsis if needed
        if (startPage > 1) {
            numbers.push(1);
            if (startPage > 2) {
                numbers.push('...'); // Ellipsis
            }
        }

        // Add the visible page numbers
        for (let i = startPage; i <= endPage; i++) {
            numbers.push(i);
        }

        // Add ellipsis and last page if needed
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                numbers.push('...'); // Ellipsis
            }
            if (totalPages > 1) { // Ensure last page is pushed only if there's more than 1 page
                 numbers.push(totalPages);
            }
        }

         // Add current page if total pages is less than or equal to visible pages
         if (totalPages <= maxVisible && totalPages > 0) {
             numbers.length = 0; // Clear if previously populated by ellipsis logic
              for (let i = 1; i <= totalPages; i++) {
                 numbers.push(i);
             }
         }


        return numbers;
    }, [totalPages, currentPage, visiblePageNumbers, startPage, endPage]); // Depend on calculated start/end

    // --- End Pagination Logic ---


    // --- Filter and Search Handlers ---
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilters({
            modality: '',
            sectorActivity: '', // Reset Sector Activity filter
            // Reset other filter states here
        });
        // Reset to first page when filters are cleared
        setCurrentPage(1);
    };
    // --- End Filter and Search Handlers ---


    return (
        // Main container with background, padding, and font styling
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-8 md:py-12 font-sans transition-colors duration-300">
  <div className="container mx-auto px-4">
    {/* Section d'en-tête avec titre et bouton Ajouter une offre */}
    <div className="flex flex-col sm:flex-row justify-between items-center mb-8 md:mb-12">
      <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4 sm:mb-0">
        Offres d'emploi
      </h1>
      <button
        onClick={() => setIsAddModalOpen(true)} // Utiliser l'état isAddModalOpen
        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-950 transition-all duration-300 group shadow-md hover:shadow-lg"
      >
        <PlusCircle size={20} className="mr-2 -ml-1 transition-transform duration-300 group-hover:rotate-90" />
        Ajouter une nouvelle offre
      </button>
    </div>

    {/* --- Section de filtrage et barre de recherche --- */}
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-8 md:mb-12 border border-slate-200 dark:border-slate-700">
      <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
        <SlidersHorizontal size={24} className="mr-3 text-sky-500 dark:text-sky-400" />
        Filtrer & Rechercher des offres
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Champ de recherche */}
        <div className="col-span-1 md:col-span-2 lg:col-span-1 flex items-end"> {/* Ajout de flex et items-end */}
          <label htmlFor="search" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white sr-only">Rechercher</label>
          <div className="relative w-full"> {/* Ajout de w-full pour que l'entrée prenne toute la largeur */}
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={20} className="text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              id="search"
              name="search"
              value={searchTerm}
              onChange={handleSearchChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Rechercher par titre, entreprise, compétences, type de contrat..." // Espace réservé mis à jour
            />
          </div>
        </div>

        {/* Filtre de modalité */}
        <div>
          <label htmlFor="modalityFilter" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Modalité</label>
          <select
            id="modalityFilter"
            name="modality" // Correspond à la clé de l'état
            value={filters.modality}
            onChange={handleFilterChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="">Toutes les modalités</option>
            <option value="OnSite">Sur site</option>
            <option value="Remote">À distance</option>
            <option value="Hybrid">Hybride</option>
            {/* Ajouter l'option "Annonce" pour les données scrappées */}
            <option value="Annonce">Annonce</option>
            {/* Ajouter l'option "N/A" si vous souhaitez filtrer les offres scrappées sans type */}
            {/* <option value="N/A">N/A</option> */}
          </select>
        </div>

        {/* Filtre d'activité sectorielle */}
        <div>
          <label htmlFor="sectorActivityFilter" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Secteur d'activité</label>
          <select
            id="sectorActivityFilter"
            name="sectorActivity" // Correspond à la clé de l'état
            value={filters.sectorActivity}
            onChange={handleFilterChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="">Tous les secteurs</option>
            <option value="Information Technology">Technologies de l'information</option>
            <option value="Finance">Finance</option>
            <option value="Healthcare">Santé</option>
            <option value="Education">Éducation</option>
            <option value="Marketing and Advertising">Marketing et Publicité</option>
            <option value="Manufacturing">Fabrication</option>
            <option value="Retail">Commerce de détail</option>
            <option value="Construction">Construction</option>
            <option value="Hospitality">Hôtellerie</option>
            <option value="Other">Autre</option>
            {/* Ajouter l'option "N/A" si vous souhaitez filtrer les offres scrappées */}
            {/* <option value="N/A">N/A</option> */}
            {/* Ajouter plus d'options de secteur ici */}
          </select>
        </div>

        {/* Ajouter d'autres entrées de filtre ici */}

        {/* Bouton Effacer les filtres */}
        <div className="flex items-end"> {/* Aligner le bouton en bas */}
          <button
            type="button"
            onClick={handleClearFilters}
            className="w-full px-4 py-2.5 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-600"
          >
            Effacer les filtres
          </button>
        </div>
      </div>
    </div>
    {/* --- Fin de la section de filtrage et barre de recherche --- */}

    {/* --- Messages de statut de suppression --- */}
    {deleteSuccessMessage && (
      <div className="flex items-center justify-center text-center bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-3 rounded-lg shadow-md mb-4">
        <CheckCircle size={20} className="mr-2 flex-shrink-0" />
        <p className="text-sm font-medium">{deleteSuccessMessage}</p>
      </div>
    )}
    {deleteErrorMessage && (
      <div className="flex items-center justify-center text-center bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-lg shadow-md mb-4">
        <AlertTriangle size={20} className="mr-2 flex-shrink-0" />
        <p className="text-sm font-medium">{deleteErrorMessage}</p>
      </div>
    )}
    {/* --- Fin des messages de statut de suppression --- */}

    {/* Afficher les états de chargement, d'erreur ou vides */}
    {loading && (
      <div className="flex flex-col items-center justify-center text-center text-slate-600 dark:text-slate-400 py-10">
        <Loader2 size={48} className="animate-spin mb-4 text-sky-500" />
        <p className="text-xl font-medium">Chargement des offres...</p>
        <p>Veuillez patienter un instant.</p>
      </div>
    )}
    {error && (
      <div className="flex flex-col items-center justify-center text-center bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-6 rounded-lg shadow-md border border-red-200 dark:border-red-700/50">
        <AlertTriangle size={48} className="mb-3 text-red-500 dark:text-red-400" />
        <p className="text-xl font-semibold mb-1">Erreur lors du chargement des offres</p>
        <p className="text-sm">{error.message}</p>
        {/* Bouton pour réessayer la récupération */}
        <button
          onClick={fetchAllOffers} // Réessayer de récupérer les données du backend et les données scrappées
          className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-md transition-colors"
        >
          Réessayer
        </button>
      </div>
    )}

    {/* Afficher "Aucune offre trouvée" uniquement si non en chargement, sans erreur, et que le tableau d'offres filtrées est vide */}
    {/* Vérifier la longueur de filteredOffers */}
    {!loading && !error && Array.isArray(filteredOffers) && filteredOffers.length === 0 && (
      <div className="flex flex-col items-center justify-center text-center text-slate-600 dark:text-slate-400 py-10 bg-white dark:bg-slate-800/50 p-6 rounded-lg shadow">
        <Info size={48} className="mb-3 text-sky-500" />
        <p className="text-xl font-semibold mb-1">Aucune offre trouvée</p>
        {/* Le message change si des filtres sont appliqués */}
        {searchTerm || Object.values(filters).some(filter => filter !== '') ? (
          <p>Aucune offre ne correspond à vos critères de filtre et de recherche actuels.</p>
        ) : (
          <p>Il n'y a actuellement aucune offre d'emploi à afficher.</p>
        )}
      </div>
    )}

    {/* Afficher la liste des offres filtrées dans une grille responsive */}
    {/* Itérer sur currentOffersForPage */}
    {!loading && !error && Array.isArray(currentOffersForPage) && currentOffersForPage.length > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Itérer sur les offres de la page actuelle */}
        {currentOffersForPage.map(offer => ( // 'item' est un objet userEntity
          // Utiliser offer.offer_id comme clé en supposant qu'il est unique
          // Passer la fonction handleDeleteOfferClick comme prop onDelete
          <OfferCard
            key={offer.offer_id}
            offer={offer}
            onDelete={handleDeleteOfferClick}
            onViewDetails={handleOpenModal} // Important : Passer la fonction ici
          />
        ))}
      </div>
    )}

    {/* --- Contrôles de pagination --- */}
    {/* Afficher la pagination uniquement s'il y a des offres et plus d'une page */}
    {!loading && !error && Array.isArray(filteredOffers) && filteredOffers.length > 0 && totalPages > 1 && (
      <nav className="flex justify-center items-center space-x-1 mt-8 md:mt-12" aria-label="Pagination">
        {/* Bouton Précédent */}
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white dark:disabled:bg-gray-800 dark:disabled:text-gray-500 transition-colors"
          aria-label="Page précédente"
        >
          <ChevronLeft size={18} className="mr-2" />
          Précédent
        </button>

        {/* Boutons de numéro de page */}
        {/* Logique modifiée pour n'afficher qu'un nombre limité de numéros de page avec des points de suspension */}
        {pageNumbersArray.map((item, index) => ( // Utiliser pageNumbersArray et item/index
          item === '...' ? (
            <span key={`ellipsis-${index}`} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"> {/* Ajout de border/bg pour un style cohérent */}
              ...
            </span>
          ) : (
            <button
              key={item} // Utiliser item comme clé
              onClick={() => paginate(item)} // Passer item à paginate
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                currentPage === item // Comparer currentPage avec item
                  ? 'text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
                  : 'text-gray-700 bg-white hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white'
              }
              border border-gray-300 dark:border-gray-600
              ${item === pageNumbersArray[0] && item !== 1 ? 'rounded-l-lg' : ''} {/* Appliquer rounded-l uniquement si c'est le premier *nombre* affiché et non la page 1 */}
              ${item === pageNumbersArray[pageNumbersArray.length - 1] && item !== totalPages ? 'rounded-r-lg' : ''} {/* Appliquer rounded-r uniquement si c'est le dernier *nombre* affiché et non la dernière page */}
              ${pageNumbersArray.length === 1 ? 'rounded-lg' : ''} {/* Arrondir si un seul bouton est affiché */}
              ${item === 1 && pageNumbersArray[0] === 1 && pageNumbersArray.length > 1 ? 'rounded-l-lg' : ''} {/* S'assurer que le premier bouton est arrondi à gauche s'il s'agit de la page 1 et qu'il y a d'autres boutons */}
              ${item === totalPages && pageNumbersArray[pageNumbersArray.length - 1] === totalPages && pageNumbersArray.length > 1 ? 'rounded-r-lg' : ''} {/* S'assurer que le dernier bouton est arrondi à droite s'il s'agit de totalPages et qu'il y a d'autres boutons */}
              `}
              aria-current={currentPage === item ? 'page' : undefined}
              aria-label={`Page ${item}`}
            >
              {item}
            </button>
          )
        ))}

        {/* Bouton Suivant */}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white dark:disabled:bg-gray-800 dark:disabled:text-gray-500 transition-colors"
          aria-label="Page suivante"
        >
          Suivant
          <ChevronRight size={18} className="ml-2" />
        </button>
      </nav>
    )}
    {/* --- Fin des contrôles de pagination --- */}

    {/* Le composant du modal de détails de l'offre */}
    {isModalOpen && selectedOffer && (
      <OfferDetailModal offer={selectedOffer} onClose={handleCloseModal} />
    )}

    {/* Le composant du modal d'ajout d'offre */}
    <AddOfferModal
      isOpen={isAddModalOpen} // Utiliser l'état isAddModalOpen
      onClose={() => setIsAddModalOpen(false)} // Fonction pour fermer le modal
      onOfferAdded={handleOfferAdded} // Fonction à appeler après qu'une offre ait été ajoutée avec succès
    />

    {/* --- Modal de confirmation de suppression --- */}
    <DeleteConfirmationModal
      isOpen={isDeleteModalOpen} // Contrôler la visibilité
      onClose={handleCancelDelete} // Gérer l'annulation/fermeture
      onConfirm={handleConfirmDelete} // Gérer la confirmation
      offerTitle={offerToDelete?.title} // Passer le titre au modal
      loading={isDeleting} // Passer l'état de suppression pour désactiver les boutons
    />
    {/* --- Fin du modal de confirmation de suppression --- */}
  </div>
</div>
    );
};

export default AdminOffers; // Export AdminOffers as the main component
