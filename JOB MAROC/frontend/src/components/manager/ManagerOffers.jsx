// ManagerOffers.jsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'; // Added useCallback and X
import {
    PlusCircle, AlertTriangle, Info, Loader2, Search, SlidersHorizontal,
    ChevronLeft, ChevronRight, CheckCircle, X // Imported X for close button on messages
} from 'lucide-react';
import OfferCard from '../users/OfferCard';
import AddOfferModal from '../../Others/AddOfferModal';
import DeleteConfirmationModal from '../../Others/DeleteConfirmationModal';
import { Api } from '../../services/Api';
import OfferDetailModal from '../users/OfferDetailModal';

const ManagerOffers = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);

    const handleOpenModal = (offer) => {
        setSelectedOffer(offer);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOffer(null);
    };
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [offerToDelete, setOfferToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteSuccessMessage, setDeleteSuccessMessage] = useState(null);
    const [deleteErrorMessage, setDeleteErrorMessage] = useState(null);

    // New states for application status update messages
    const [applicationStatusMessage, setApplicationStatusMessage] = useState(null);
    const [applicationErrorMessage, setApplicationErrorMessage] = useState(null);

    const successMessageTimeoutRef = useRef(null);
    const errorMessageTimeoutRef = useRef(null);
    const appStatusMessageTimeoutRef = useRef(null);
    const appErrorMessageTimeoutRef = useRef(null);


    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        modality: '',
        sectorActivity: '',
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const visiblePageNumbers = 3;


    const token = localStorage.getItem('jwtToken');

    // Helper function to show timed messages (for all message types)
    const showTimedMessage = useCallback((type, message, duration = 5000) => {
        if (type === 'success') {
            setDeleteSuccessMessage(message);
            if (successMessageTimeoutRef.current) clearTimeout(successMessageTimeoutRef.current);
            successMessageTimeoutRef.current = setTimeout(() => setDeleteSuccessMessage(null), duration);
        } else if (type === 'error') {
            setDeleteErrorMessage(message);
            if (errorMessageTimeoutRef.current) clearTimeout(errorMessageTimeoutRef.current);
            errorMessageTimeoutRef.current = setTimeout(() => setDeleteErrorMessage(null), duration + 2000); // Errors stay longer
        } else if (type === 'appSuccess') {
            setApplicationStatusMessage(message);
            if (appStatusMessageTimeoutRef.current) clearTimeout(appStatusMessageTimeoutRef.current);
            appStatusMessageTimeoutRef.current = setTimeout(() => setApplicationStatusMessage(null), duration);
        } else if (type === 'appError') {
            setApplicationErrorMessage(message);
            if (appErrorMessageTimeoutRef.current) clearTimeout(appErrorMessageTimeoutRef.current);
            appErrorMessageTimeoutRef.current = setTimeout(() => setApplicationErrorMessage(null), duration + 2000);
        }
    }, []);

    // Effect for clearing delete messages
    useEffect(() => {
        return () => {
            if (successMessageTimeoutRef.current) clearTimeout(successMessageTimeoutRef.current);
            if (errorMessageTimeoutRef.current) clearTimeout(errorMessageTimeoutRef.current);
        };
    }, [deleteSuccessMessage, deleteErrorMessage]);

    // Effect for clearing application status messages
    useEffect(() => {
        return () => {
            if (appStatusMessageTimeoutRef.current) clearTimeout(appStatusMessageTimeoutRef.current);
            if (appErrorMessageTimeoutRef.current) clearTimeout(appErrorMessageTimeoutRef.current);
        };
    }, [applicationStatusMessage, applicationErrorMessage]);


    const fetchAllOffers = useCallback(async () => {
        setLoading(true);
        setError(null);
        setOffers([]);
        setCurrentPage(1);
        setDeleteSuccessMessage(null); // Clear messages on new fetch
        setDeleteErrorMessage(null);
        setApplicationStatusMessage(null); // Clear app status messages on new fetch
        setApplicationErrorMessage(null);


        let managerEmail = localStorage.getItem('username');
        let backendData = [];
        if (token) {
            try {
                const responseData = await Api.get(`/offers/manager/${managerEmail}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log("ManagerOffers: Backend API response data:", responseData);


                if (responseData && Array.isArray(responseData.data)) {
                    backendData = responseData.data;
                }
                else if (Array.isArray(responseData)) {
                    backendData = responseData;
                }
                else if (responseData && Array.isArray(responseData.content)) {
                    backendData = responseData.content;
                } else if (responseData && Array.isArray(responseData._embedded?.offers)) {
                    backendData = responseData._embedded.offers;
                }
                else {
                    console.error("Backend API response is not in an expected array format or is null/undefined.", responseData);
                }

            } catch (err) {
                console.error("Failed to fetch backend offers:", err);
                const fetchErrorMessage = err.response?.data?.message || err.message || "Impossible de charger les offres disponibles. Veuillez vérifier votre connexion.";
                setError(new Error(fetchErrorMessage));
            }
        } else {
            console.warn("No JWT token found. Skipping backend offer fetch.");
            setError(new Error("Jeton d'authentification manquant. Veuillez vous connecter."));
        }


        const allOffers = [...(Array.isArray(backendData) ? backendData : [])];
        setOffers(allOffers);
        setLoading(false);

    }, [token, showTimedMessage]);


    useEffect(() => {
        fetchAllOffers();
    }, [fetchAllOffers]);


    const handleOfferAdded = () => {
        fetchAllOffers(); // Re-fetch all offers after a new one is added
    };

    const handleDeleteOfferClick = (offerId) => {
        console.log("Delete icon clicked for offer ID:", offerId);
        const offer = offers.find(o => o.offer_id === offerId);
        if (offer) {
            setOfferToDelete(offer);
            setIsDeleteModalOpen(true);
            showTimedMessage('success', null, 0); // Clear previous messages
            showTimedMessage('error', null, 0);
        } else {
            console.error("Offer with ID not found for deletion:", offerId);
            showTimedMessage('error', "Impossible de trouver l'offre à supprimer.");
        }
    };

    const handleConfirmDelete = async () => {
        if (!offerToDelete || isDeleting) return;

        setIsDeleting(true);
        showTimedMessage('success', null, 0);
        showTimedMessage('error', null, 0);

        try {
            if (!token) {
                showTimedMessage('error', "Jeton d'authentification introuvable. Impossible de supprimer l'offre.");
                setIsDeleting(false);
                setIsDeleteModalOpen(false);
                setOfferToDelete(null);
                return;
            }

            console.log("Attempting to delete offer with ID:", offerToDelete.offer_id);
            const response = await Api.delete(`/offers/delete/${offerToDelete.offer_id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status >= 200 && response.status < 300) {
                console.log("Offer deleted successfully:", offerToDelete.offer_id);
                showTimedMessage('success', `L'offre "${offerToDelete.title}" a été supprimée avec succès.`);
                setOffers(offers.filter(offer => offer.offer_id !== offerToDelete.offer_id));

            } else {
                const errorMessage = response.data?.message || `Échec de la suppression de l'offre avec le statut: ${response.status}`;
                console.error("Backend reported error deleting offer:", errorMessage);
                showTimedMessage('error', `Échec de la suppression de l'offre "${offerToDelete.title}": ${errorMessage}`);
            }

        } catch (err) {
            console.error("Error during offer deletion API call:", err);
            const errorMessage = err.response?.data?.message || err.message || "Une erreur inattendue est survenue lors de la suppression.";
            showTimedMessage('error', `Échec de la suppression de l'offre "${offerToDelete?.title || 'cette offre'}": ${errorMessage}`);
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            setOfferToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        console.log("Deletion cancelled.");
        setIsDeleteModalOpen(false);
        setOfferToDelete(null);
    };


    // New function to update application status
    const handleUpdateApplicationStatus = useCallback(async (applicationId, newStatus) => {
        setApplicationStatusMessage(null); // Clear previous messages
        setApplicationErrorMessage(null);

        try {
            if (!token) {
                showTimedMessage('appError', "Jeton d'authentification manquant. Impossible de mettre à jour le statut de la candidature.");
                return;
            }

            console.log(`Updating application ${applicationId} status to ${newStatus}`);
            // Assuming your backend endpoint to update status is PUT /applications/{applicationId}/status
            const response = await Api.put(`/applications/status/${applicationId}`, { status: newStatus }, {
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            });

            if (response.status >= 200 && response.status < 300) {
                // showTimedMessage('appSuccess', `Le statut de la candidature #${applicationId} a été mis à jour à "${newStatus}".`);
                // // Optionally, re-fetch applications or update the local state if application list is displayed here
                // // For example, if OfferDetailModal shows applications, it might need to re-fetch or update its own state.
                // // If OfferDetailModal handles its own application list, it might need a prop to trigger re-fetch.
            } else {
                const errorMessage = response.data?.message || `Échec de la mise à jour du statut de la candidature: Statut ${response.status}`;
                showTimedMessage('appError', `Échec de la mise à jour du statut de la candidature #${applicationId}: ${errorMessage}`);
            }
        } catch (err) {
            console.error("Error updating application status:", err);
            const errorMessage = err.response?.data?.message || err.message || "Une erreur inattendue est survenue lors de la mise à jour du statut de la candidature.";
            showTimedMessage('appError', `Échec de la mise à jour du statut de la candidature #${applicationId}: ${errorMessage}`);
        }
    }, [token, showTimedMessage]);


    const filteredOffers = useMemo(() => {
        if (!Array.isArray(offers)) {
            console.warn("Offers state is not an array, returning empty list for filtering.");
            return [];
        }

        let currentOffers = offers;

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            currentOffers = currentOffers.filter(offer =>
                offer.title?.toLowerCase().includes(lowerCaseSearchTerm) ||
                offer.companyName?.toLowerCase().includes(lowerCaseSearchTerm) ||
                offer.skills?.toLowerCase().includes(lowerCaseSearchTerm) ||
                offer.location?.toLowerCase().includes(lowerCaseSearchTerm) ||
                offer.description?.toLowerCase().includes(lowerCaseSearchTerm) ||
                (offer.originalHref?.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (offer.cardType?.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (offer.cardFooter1?.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (offer.cardFooter3?.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (Array.isArray(offer.contractTypes) && offer.contractTypes.some(type =>
                    type.typeName?.toLowerCase().includes(lowerCaseSearchTerm)
                ))
            );
        }

        if (filters.modality) {
            currentOffers = currentOffers.filter(offer =>
                offer.modality === filters.modality
            );
        }

        if (filters.sectorActivity) {
            currentOffers = currentOffers.filter(offer =>
                offer.sectorActivity === filters.sectorActivity
            );
        }

        setCurrentPage(1);

        return currentOffers;
    }, [offers, searchTerm, filters]);

    const indexOfLastOffer = currentPage * itemsPerPage;
    const indexOfFirstOffer = indexOfLastOffer - itemsPerPage;
    const currentOffersForPage = Array.isArray(filteredOffers) ? filteredOffers.slice(indexOfFirstOffer, indexOfLastOffer) : [];


    const totalOffersCount = Array.isArray(filteredOffers) ? filteredOffers.length : 0;
    const totalPages = Math.ceil(totalOffersCount / itemsPerPage);


    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const maxVisible = visiblePageNumbers;
    const sidePages = Math.floor(maxVisible / 2);

    let startPage = Math.max(1, currentPage - sidePages);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - maxVisible + 1);
    }
    if (startPage === 1) {
        endPage = Math.min(totalPages, maxVisible);
    }
    startPage = Math.max(1, startPage);


    const pageNumbersArray = useMemo(() => {
        const numbers = [];

        if (startPage > 1) {
            numbers.push(1);
            if (startPage > 2) {
                numbers.push('...');
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            numbers.push(i);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                numbers.push('...');
            }
            if (totalPages > 1) {
                numbers.push(totalPages);
            }
        }

        if (totalPages <= maxVisible && totalPages > 0) {
            numbers.length = 0;
            for (let i = 1; i <= totalPages; i++) {
                numbers.push(i);
            }
        }
        return numbers;
    }, [totalPages, currentPage, visiblePageNumbers, startPage, endPage]);


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
            sectorActivity: '',
        });
        setCurrentPage(1);
    };


    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-8 md:py-12 font-sans transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 md:mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4 sm:mb-0">
                        Offres d'emploi
                    </h1>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
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
                        <div className="col-span-1 md:col-span-2 lg:col-span-1 flex items-end">
                            <label htmlFor="search" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white sr-only">Rechercher</label>
                            <div className="relative w-full">
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
                                    placeholder="Rechercher par titre, entreprise, compétences, type de contrat..."
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="modalityFilter" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Modalité</label>
                            <select
                                id="modalityFilter"
                                name="modality"
                                value={filters.modality}
                                onChange={handleFilterChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            >
                                <option value="">Toutes les modalités</option>
                                <option value="OnSite">Sur site</option>
                                <option value="Remote">À distance</option>
                                <option value="Hybrid">Hybride</option>
                                <option value="Annonce">Annonce</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="sectorActivityFilter" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Secteur d'activité</label>
                            <select
                                id="sectorActivityFilter"
                                name="sectorActivity"
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
                                <option value="Retail">Commerce de Détail</option>
                                <option value="Construction">Construction</option>
                                <option value="Hospitality">Hôtellerie</option>
                                <option value="Other">Autre</option>
                            </select>
                        </div>

                        <div className="flex items-end">
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

                {/* --- Messages de statut --- */}
                {deleteSuccessMessage && (
                    <div className="flex items-center justify-center text-center bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-3 rounded-lg shadow-md mb-4 animate-fade-in-up">
                        <CheckCircle size={20} className="mr-2 flex-shrink-0" />
                        <p className="text-sm font-medium">{deleteSuccessMessage}</p>
                        <button onClick={() => showTimedMessage('success', null, 0)} className="ml-auto text-green-700 dark:text-green-400 hover:opacity-75"><X size={16} /></button>
                    </div>
                )}
                {deleteErrorMessage && (
                    <div className="flex items-center justify-center text-center bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-lg shadow-md mb-4 animate-fade-in-up">
                        <AlertTriangle size={20} className="mr-2 flex-shrink-0" />
                        <p className="text-sm font-medium">{deleteErrorMessage}</p>
                        <button onClick={() => showTimedMessage('error', null, 0)} className="ml-auto text-red-700 dark:text-red-400 hover:opacity-75"><X size={16} /></button>
                    </div>
                )}
                {applicationStatusMessage && (
                    <div className="flex items-center justify-center text-center bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-3 rounded-lg shadow-md mb-4 animate-fade-in-up">
                        <CheckCircle size={20} className="mr-2 flex-shrink-0" />
                        <p className="text-sm font-medium">{applicationStatusMessage}</p>
                        <button onClick={() => showTimedMessage('appSuccess', null, 0)} className="ml-auto text-green-700 dark:text-green-400 hover:opacity-75"><X size={16} /></button>
                    </div>
                )}
                {applicationErrorMessage && (
                    <div className="flex items-center justify-center text-center bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-lg shadow-md mb-4 animate-fade-in-up">
                        <AlertTriangle size={20} className="mr-2 flex-shrink-0" />
                        <p className="text-sm font-medium">{applicationErrorMessage}</p>
                        <button onClick={() => showTimedMessage('appError', null, 0)} className="ml-auto text-red-700 dark:text-red-400 hover:opacity-75"><X size={16} /></button>
                    </div>
                )}
                {/* --- Fin des messages de statut --- */}

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
                        <button
                            onClick={fetchAllOffers}
                            className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-md transition-colors"
                        >
                            Réessayer
                        </button>
                    </div>
                )}

                {!loading && !error && Array.isArray(filteredOffers) && filteredOffers.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-center text-slate-600 dark:text-slate-400 py-10 bg-white dark:bg-slate-800/50 p-6 rounded-lg shadow">
                        <Info size={48} className="mb-3 text-sky-500" />
                        <p className="text-xl font-semibold mb-1">Aucune offre trouvée</p>
                        {searchTerm || Object.values(filters).some(filter => filter !== '') ? (
                            <p>Aucune offre ne correspond à vos critères de filtre et de recherche actuels.</p>
                        ) : (
                            <p>Il n'y a actuellement aucune offre d'emploi à afficher.</p>
                        )}
                    </div>
                )}

                {!loading && !error && Array.isArray(currentOffersForPage) && currentOffersForPage.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {currentOffersForPage.map(offer => (
                            <OfferCard
                                key={offer.offer_id}
                                offer={offer}
                                onDelete={handleDeleteOfferClick}
                                onViewDetails={handleOpenModal}
                            />
                        ))}
                    </div>
                )}

                {/* --- Contrôles de pagination --- */}
                {!loading && !error && Array.isArray(filteredOffers) && filteredOffers.length > 0 && totalPages > 1 && (
                    <nav className="flex justify-center items-center space-x-1 mt-8 md:mt-12" aria-label="Pagination">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white dark:disabled:bg-gray-800 dark:disabled:text-gray-500 transition-colors"
                            aria-label="Page précédente"
                        >
                            <ChevronLeft size={18} className="mr-2" />
                            Précédent
                        </button>

                        {pageNumbersArray.map((item, index) => (
                            item === '...' ? (
                                <span key={`ellipsis-${index}`} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={item}
                                    onClick={() => paginate(item)}
                                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                                        currentPage === item
                                            ? 'text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
                                            : 'text-gray-700 bg-white hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white'
                                    }
                                    border border-gray-300 dark:border-gray-600
                                    ${item === totalPages ? 'rounded-r-lg' : ''}`}
                                >
                                    {item}
                                </button>
                            )
                        ))}

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

                {/* Modales */}
                <AddOfferModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onOfferAdded={handleOfferAdded}
                />

                {offerToDelete && (
                    <DeleteConfirmationModal
                        isOpen={isDeleteModalOpen}
                        onClose={handleCancelDelete}
                        onConfirm={handleConfirmDelete}
                        itemName={offerToDelete.title}
                        isDeleting={isDeleting}
                    />
                )}

                {isModalOpen && selectedOffer && (
                    <OfferDetailModal
                        offer={selectedOffer}
                        onClose={handleCloseModal}
                        isOpen={isModalOpen}
                        onUpdateApplicationStatus={handleUpdateApplicationStatus} // Pass the handler here
                    />
                )}
            </div>
        </div>
    );
};

export default ManagerOffers;
