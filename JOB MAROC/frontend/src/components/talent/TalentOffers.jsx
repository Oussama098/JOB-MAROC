// TalentOffers.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    AlertTriangle, Loader2, Search, SlidersHorizontal, Info,
    ChevronLeft, ChevronRight, CheckCircle, FileText, Upload, X, Send, MailOpen, User
} from 'lucide-react';
import OfferCard from './OfferCard_T';
import OfferDetailModal from '../users/OfferDetailModal';
import { Api } from '../../services/Api'; // Assuming Api is your Axios instance

const TalenteOffers = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        modality: '',
        sectorActivity: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [selectedCv, setSelectedCv] = useState('');
    const [cvList, setCvList] = useState([]);
    const [cvFile, setCvFile] = useState(null);
    const [coverLetterPath, setCoverLetterPath] = useState('');
    const [notesContent, setNotesContent] = useState('');

    const [applySuccess, setApplySuccess] = useState(null);
    const [applyError, setApplyError] = useState(null);
    const [cvLoading, setCvLoading] = useState(false);
    const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
    const [isUploadingNewCv, setIsUploadingNewCv] = useState(false);


    const token = localStorage.getItem('jwtToken');
    const userEmail = localStorage.getItem('username'); // Get username (email) string directly

    // Helper function to show timed messages
    const showMessage = (type, message, duration = 5000) => {
        if (type === 'success') {
            setApplySuccess(message);
            setTimeout(() => setApplySuccess(null), duration);
        } else {
            setApplyError(message);
            setTimeout(() => setApplyError(null), duration);
        }
    };

    // Fetch user's CVs from the backend
    const fetchUserCvs = useCallback(async () => {
        setCvLoading(true);
        setApplyError(null);

        try {
            if (!userEmail) {
                throw new Error("L'email de l'utilisateur n'a pas été trouvé dans le stockage local. Impossible de récupérer les CVs.");
            }

            // Backend endpoint talent/cvs/{userEmail} expects email in path
            const response = await Api.get(`talent/cvs/${userEmail}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            let cvs = [];
            if (Array.isArray(response.data)) {
                cvs = response.data;
            } else if (response.data?.content && Array.isArray(response.data.content)) {
                cvs = response.data.content;
            } else if (response.data?._embedded?.talentCvList && Array.isArray(response.data._embedded.talentCvList)) {
                cvs = response.data._embedded.talentCvList;
            } else if (response.data?._embedded?.cvs && Array.isArray(response.data._embedded.cvs)) {
                 cvs = response.data._embedded.cvs;
            } else {
                console.warn("Format de réponse inattendu pour les CVs:", response.data);
            }

            if (cvs.length > 0) {
                const formattedCvs = cvs.map(cv => ({
                    id: cv.cv_id || cv.id,
                    path: cv.cv_path || cv.path,
                    uploadDate: cv.upload_date || cv.uploadDate || cv.createdAt,
                    name: (cv.cv_path || cv.path || '').split(/[\\/]/).pop() || `CV_${cv.cv_id || cv.id}`
                }));
                setCvList(formattedCvs);
                if (!selectedCv && formattedCvs.length > 0) {
                    const mostRecentCv = formattedCvs.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))[0];
                    if (mostRecentCv) {
                        setSelectedCv(mostRecentCv.id.toString());
                    }
                }
            } else {
                setCvList([]);
                showMessage('error', "Vous n'avez aucun CV enregistré. Veuillez en téléverser un nouveau.");
            }
        } catch (err) {
            console.error("Erreur lors de la récupération des CVs:", err);
            const errorMessage = err.response?.data?.message || err.message || "Erreur lors du chargement des CVs";
            showMessage('error', errorMessage);
            setCvList([]);
        } finally {
            setCvLoading(false);
        }
    }, [token, selectedCv, userEmail]);

    const uploadCvImmediately = useCallback(async (file) => {
        if (!file || !userEmail) {
            showMessage('error', "Impossible de téléverser le CV: fichier ou email utilisateur manquant.");
            return;
        }

        setIsUploadingNewCv(true);
        setSelectedCv(file.name); // Set selected CV to the new file name
        setApplyError(null);
        setApplySuccess(null);

        try {
            const newCvPath = `/uploads/cvs/${file.name}`; // Simulating a path based on file name

            const cvUploadPayload = {
                talent: {
                        user_id: {
                            email: userEmail
                        }
                    },
                cv_path: newCvPath,

            };

            const uploadCvResponse = await Api.post('/talent/cv/upload', cvUploadPayload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!uploadCvResponse.data || !uploadCvResponse.data.cv_id) {
                throw new Error("Échec du 'téléversement' du nouveau CV. ID non reçu.");
            }
            const newCvId = uploadCvResponse.data.cv_id.toString();

            await fetchUserCvs();
            setSelectedCv(newCvId);
            showMessage('success', 'Nouveau CV téléversé et sélectionné avec succès.');
        } catch (err) {
            console.error("Erreur lors du 'téléversement' du nouveau CV:", err);
            const serverErrorMessage = err.response?.data?.message || err.response?.data?.error;
            const message = serverErrorMessage || err.message || 'Une erreur inconnue est survenue lors du téléversement du CV.';
            showMessage('error', message);
            setSelectedCv(''); // Deselect if upload fails
            setCvFile(null); // Clear file input
        } finally {
            setIsUploadingNewCv(false); // Clear loading state
        }
    }, [userEmail, token, fetchUserCvs]);


    const handleCvFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCvFile(file);
            setSelectedCv(''); // Deselect any existing CV when a new file is chosen
            setApplyError(null);
            uploadCvImmediately(file); // Trigger immediate upload
        } else {
            setCvFile(null);
        }
    };

    const handleCoverLetterPathChange = (e) => {
        setCoverLetterPath(e.target.value);
        setApplyError(null);
    };

    const handleNotesChange = (e) => {
        setNotesContent(e.target.value);
    };

    const handleCvSelect = (cvId) => {
        setSelectedCv(cvId);
        setCvFile(null); // Clear selected file when an existing CV is chosen
        setApplyError(null);
    };

    const handleApplySubmit = async () => {
        if (!selectedOffer) return;
        if (!selectedCv) {
            showMessage('error', "Veuillez sélectionner un CV existant ou téléverser un nouveau CV pour postuler.");
            return;
        }

        if (!userEmail) {
            showMessage('error', "L'email de l'utilisateur n'est pas disponible. Veuillez vous reconnecter.");
            return;
        }

        setIsSubmittingApplication(true);
        setApplyError(null);
        setApplySuccess(null);

        try {

            const cvIdToUse = selectedCv;


            const applicationPayload = {
                talent: {
                    user_id : {
                        email: userEmail
                    }
                },
                offer: { offer_id: selectedOffer.offer_id },

                appliedWithCvPath: { cv_id: parseInt(cvIdToUse, 10) },

                coverLetterPath: coverLetterPath,
                notes: notesContent,

                status: 'APPLIED'
            };

            const applicationResponse = await Api.post('/applications/add', applicationPayload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (applicationResponse.status >= 200 && applicationResponse.status < 300) {
                showMessage('success', 'Votre candidature a été soumise avec succès!');
                handleCloseApplyModal();
            } else {
                throw new Error(`Erreur lors de la soumission de la candidature: Statut ${applicationResponse.status}`);
            }
        } catch (err) {
            console.error("Erreur lors de la soumission de la candidature:", err);
            const serverErrorMessage = err.response?.data?.message || err.response?.data?.error;
            const message = serverErrorMessage || err.message || 'Une erreur inconnue est survenue lors de la soumission de la candidature.';
            showMessage('error', message);
        } finally {
            setIsSubmittingApplication(false);
        }
    };

    const fetchAllOffers = async () => {
        setLoading(true);
        setError(null);
        setOffers([]);
        setCurrentPage(1);

        let backendData = [];
        if (token) {
            try {
                const responseData = await Api.get('/offers/all', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (responseData && Array.isArray(responseData.data)) {
                    backendData = responseData.data;
                } else if (Array.isArray(responseData)) {
                    backendData = responseData;
                } else if (responseData && Array.isArray(responseData.content)) {
                    backendData = responseData.content;
                } else if (responseData && responseData._embedded && Array.isArray(responseData._embedded.offers)) {
                    backendData = responseData._embedded.offers;
                } else {
                    console.warn("Format de réponse inattendu pour les offres:", responseData);
                    backendData = [];
                }
            } catch (err) {
                console.error("Échec de la récupération des offres du backend:", err);
                const fetchErrorMessage = err.response?.data?.message || err.message || "Impossible de charger les offres disponibles. Veuillez vérifier votre connexion.";
                setError(new Error(fetchErrorMessage));
            }
        } else {
            setError(new Error("Jeton d'authentification manquant. Veuillez vous connecter."));
        }

        setOffers(Array.isArray(backendData) ? backendData : []);
        setLoading(false);
    };

    useEffect(() => {
        fetchAllOffers();
        if (token) {
            fetchUserCvs();
        }
    }, [token, fetchUserCvs]);

    const handleOpenModal = (offer) => {
        setSelectedOffer(offer);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOffer(null);
    };

    const handleOpenApplyModal = (offer) => {
        console.log("Opening apply modal for offer:", offer.offerUrl);
        if (offer.offerUrl && offer.offerUrl.trim() !== '') {
            window.open(offer.offerUrl, '_blank');
            return;
        }


        setSelectedOffer(offer);

        setSelectedCv('');
        setCvFile(null);
        setCoverLetterPath('');
        setNotesContent('');
        setApplyError(null);
        setApplySuccess(null);
        setIsApplyModalOpen(true);
        fetchUserCvs(); // Fetch CVs every time the internal modal opens to ensure fresh list
    };

    const handleCloseApplyModal = () => {
        setIsApplyModalOpen(false);
        setSelectedOffer(null);
        setSelectedCv('');
        setCvFile(null);
        setCoverLetterPath('');
        setNotesContent('');
        setApplyError(null);
        setApplySuccess(null);
        setIsUploadingNewCv(false);
    };

    const filteredOffers = useMemo(() => {
        if (!Array.isArray(offers)) return [];

        let currentOffers = offers;

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            currentOffers = currentOffers.filter(offer =>
                offer.title?.toLowerCase().includes(lowerCaseSearchTerm) ||
                offer.description?.toLowerCase().includes(lowerCaseSearchTerm) ||
                offer.location?.toLowerCase().includes(lowerCaseSearchTerm) ||
                offer.companyName?.toLowerCase().includes(lowerCaseSearchTerm) ||
                (Array.isArray(offer.skills) && offer.skills.some(skill =>
                    (typeof skill === 'string' ? skill : skill.skill_name)?.toLowerCase().includes(lowerCaseSearchTerm)
                )) ||
                (Array.isArray(offer.contractTypes) && offer.contractTypes.some(type =>
                    type.typeName?.toLowerCase().includes(lowerCaseSearchTerm)
                ))
            );
        }

        if (filters.modality) {
            currentOffers = currentOffers.filter(offer =>
                offer.modality?.toLowerCase() === filters.modality.toLowerCase()
            );
        }

        if (filters.sectorActivity) {
            currentOffers = currentOffers.filter(offer =>
                offer.sectorActivity?.toLowerCase() === filters.sectorActivity.toLowerCase()
            );
        }

        return currentOffers;
    }, [offers, searchTerm, filters]);

    const totalPages = Math.ceil(filteredOffers.length / itemsPerPage);
    const paginatedOffers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredOffers.slice(startIndex, endIndex);
    }, [filteredOffers, currentPage, itemsPerPage]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
        setCurrentPage(1);
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
                        Offres d'Emploi Disponibles
                    </h1>
                </div>

                {/* Filtering and Search Bar */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-8 md:mb-12 border border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
                        <SlidersHorizontal size={24} className="mr-3 text-sky-500 dark:text-sky-400" />
                        Filtrer & Rechercher des Offres
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="col-span-1 md:col-span-2 lg:col-span-1 flex items-end">
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
                                    placeholder="Rechercher par titre, entreprise, compétences..."
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
                                <option value="">Toutes les Modalités</option>
                                <option value="OnSite">Sur Site</option>
                                <option value="Remote">À Distance</option>
                                <option value="Hybrid">Hybride</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="sectorActivityFilter" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Secteur d'Activité</label>
                            <select
                                id="sectorActivityFilter"
                                name="sectorActivity"
                                value={filters.sectorActivity}
                                onChange={handleFilterChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            >
                                <option value="">Tous les Secteurs</option>
                                <option value="Information Technology">Technologies de l'Information</option>
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
                                Effacer les Filtres
                            </button>
                        </div>
                    </div>
                </div>

                {/* Application Status Messages (using showMessage utility) */}
                {applySuccess && (
                    <div className="flex items-center justify-center text-center bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-3 rounded-lg shadow-md mb-4 animate-fade-in-up">
                        <CheckCircle size={20} className="mr-2 flex-shrink-0" />
                        <p className="text-sm font-medium">{applySuccess}</p>
                        <button onClick={() => setApplySuccess(null)} className="ml-auto text-green-700 dark:text-green-400 hover:opacity-75"><X size={16}/></button>
                    </div>
                )}
                {applyError && (
                    <div className="flex items-center justify-center text-center bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-lg shadow-md mb-4 animate-fade-in-up">
                        <AlertTriangle size={20} className="mr-2 flex-shrink-0" />
                        <p className="text-sm font-medium">{applyError}</p>
                        <button onClick={() => setApplyError(null)} className="ml-auto text-red-700 dark:text-red-400 hover:opacity-75"><X size={16}/></button>
                    </div>
                )}

                {/* Loading state for offers */}
                {loading && (
                    <div className="flex flex-col items-center justify-center text-center text-slate-600 dark:text-slate-400 py-10">
                        <Loader2 size={48} className="animate-spin mb-4 text-sky-500" />
                        <p className="text-xl font-medium">Chargement des offres...</p>
                        <p>Veuillez patienter un instant.</p>
                    </div>
                )}

                {/* Error state for offers */}
                {error && (
                    <div className="flex flex-col items-center justify-center text-center bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-6 rounded-lg shadow-md border border-red-200 dark:border-red-700/50">
                        <AlertTriangle size={48} className="mb-3 text-red-500 dark:text-red-400" />
                        <p className="text-xl font-semibold mb-1">Erreur de Chargement des Offres</p>
                        <p className="text-sm">{error.message}</p>
                        <button
                            onClick={fetchAllOffers}
                            className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-md transition-colors"
                        >
                            Réessayer
                        </button>
                    </div>
                )}

                {/* No offers found state */}
                {!loading && !error && filteredOffers.length === 0 && (
                    <div className="flex flex-col items-center justify-center text-center text-slate-600 dark:text-slate-400 py-10 bg-white dark:bg-slate-800/50 p-6 rounded-lg shadow">
                        <Info size={48} className="mb-3 text-sky-500" />
                        <p className="text-xl font-semibold mb-1">Aucune Offre Trouvée</p>
                        {searchTerm || Object.values(filters).some(filter => filter !== '') ? (
                            <p>Aucune offre ne correspond à vos critères de filtre et de recherche actuels.</p>
                        ) : (
                            <p>Il n'y a actuellement aucune offre d'emploi à afficher.</p>
                        )}
                    </div>
                )}

                {/* Offers Grid */}
                {!loading && !error && filteredOffers.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {paginatedOffers.map(offer => (
                            <OfferCard
                                key={offer.offer_id || offer.id}
                                offer={offer}
                                onViewDetails={handleOpenModal}
                                onApply={handleOpenApplyModal}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination controls */}
                {!loading && !error && filteredOffers.length > itemsPerPage && (
                    <div className="flex justify-center mt-8">
                        <nav className="inline-flex rounded-md shadow">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(page => page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1))
                                .map((page, index, array) => (
                                    <>
                                        {index > 0 && page > array[index - 1] + 1 && (
                                            <span className="px-3 py-2 border-t border-b border-gray-300 text-sm text-gray-500 dark:border-slate-600 dark:text-slate-400">...</span>
                                        )}
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-3 py-2 border-t border-b border-gray-300 text-sm font-medium ${currentPage === page
                                                ? 'bg-blue-50 text-blue-600 border-blue-500 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700'
                                                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
                                            } ${page === 1 ? '' : (page === totalPages ? '' : 'border-r')}`}
                                        >
                                            {page}
                                        </button>
                                    </>
                                ))
                            }
                            <button
                                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </nav>
                    </div>
                )}

                {/* Offer Detail Modal */}
                {isModalOpen && selectedOffer && (
                    <OfferDetailModal offer={selectedOffer} onClose={handleCloseModal} />
                )}

                {/* Apply Modal - Enhanced Styling and UX */}
                {isApplyModalOpen && selectedOffer && (
                    <div className="fixed inset-0 bg-transparent bg-opacity-70 sm flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-xl w-full p-8 flex flex-col max-h-[105vh] overflow-hidden transform scale-95 animate-scale-in border border-slate-200 dark:border-slate-700">
                            {/* Modal Header */}
                            <div className="flex justify-between items-center pb-6 border-b border-slate-200 dark:border-slate-700 mb-6 flex-shrink-0">
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
                                    <Send size={28} className="mr-3 text-blue-600 dark:text-blue-400" />
                                    Postuler à: <span className="text-blue-600 dark:text-blue-400 ml-2">{selectedOffer.title}</span>
                                </h3>
                                <button
                                    onClick={handleCloseApplyModal}
                                    className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    aria-label="Fermer le modal de candidature"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Scrollable Content Area */}
                            {/* Added padding-right to offset scrollbar and -margin-right to keep content centered visually */}
                            <div className="flex-grow overflow-y-auto custom-scrollbar pr-4 -mr-4">
                                <div className="space-y-6 pb-4"> {/* Added pb-4 to give some spacing at bottom of scrollable area */}
                                    {/* Current User Info */}
                                    {/* {userEmail ? ( // Display user email if available
                                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center text-blue-700 dark:text-blue-300">
                                            <User size={20} className="mr-3 flex-shrink-0" />
                                            <p className="text-sm font-medium">
                                                Candidature en tant que: <span className="font-semibold">{userEmail}</span>
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-center text-yellow-700 dark:text-yellow-300">
                                            <AlertTriangle size={20} className="mr-3 flex-shrink-0" />
                                            <p className="text-sm font-medium">
                                                Attention: L'email de l'utilisateur n'est pas disponible. Assurez-vous d'être connecté.
                                            </p>
                                        </div>
                                    )} */}

                                    {/* Section CVs existants */}
                                    <div>
                                        <label className="block text-base font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                            Sélectionner un CV existant
                                        </label>

                                        {cvLoading ? (
                                            <div className="flex justify-center py-6">
                                                <Loader2 size={32} className="animate-spin text-sky-500" />
                                                <span className="ml-3 text-slate-600 dark:text-slate-400">Chargement des CVs...</span>
                                            </div>
                                        ) : cvList.length > 0 ? (
                                            <div className="space-y-3 max-h-56 overflow-y-auto custom-scrollbar border border-slate-300 dark:border-slate-600 rounded-lg p-2">
                                                {cvList.map(cv => (
                                                    <div
                                                        key={cv.id}
                                                        className={`p-4 border rounded-lg cursor-pointer flex items-center transition-all duration-200
                                                            ${selectedCv === cv.id.toString()
                                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500'
                                                                : 'border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                            }`}
                                                        onClick={() => handleCvSelect(cv.id.toString())}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="selectedCv"
                                                            value={cv.id.toString()}
                                                            checked={selectedCv === cv.id.toString()}
                                                            onChange={() => handleCvSelect(cv.id.toString())}
                                                            className="mr-3 h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600"
                                                        />
                                                        <FileText size={20} className="mr-3 text-slate-500 dark:text-slate-400" />
                                                        <div>
                                                            <p className="font-medium text-slate-800 dark:text-slate-200">{cv.name}</p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                Téléversé le: {new Date(cv.uploadDate).toLocaleDateString('fr-FR')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center text-slate-500 dark:text-slate-400 py-6 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
                                                <Info size={32} className="mb-2 mx-auto text-sky-500" />
                                                <p className="text-sm italic">
                                                    Aucun CV trouvé dans votre espace.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Separator */}
                                    <div className="relative py-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="px-2 bg-white dark:bg-slate-800 text-sm text-slate-500 dark:text-slate-400 font-medium">
                                                OU
                                            </span>
                                        </div>
                                    </div>

                                    {/* Section upload nouveau CV (Simulated File "Upload") */}
                                    <div>
                                        <label className="block text-base font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                            Téléverser un nouveau CV (simulé)
                                        </label>
                                        <div className="flex items-center">
                                            <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors duration-200">
                                                {isUploadingNewCv ? (
                                                    <div className="flex flex-col items-center">
                                                        <Loader2 size={28} className="animate-spin mb-3 text-sky-500" />
                                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">Téléversement en cours...</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center">
                                                        <Upload size={28} className="mb-3 text-slate-500 dark:text-slate-400" />
                                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">
                                                            Cliquer pour sélectionner un fichier local
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                            (Le chemin sera envoyé, pas le fichier lui-même)
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                            PDF, DOC, DOCX (MAX. 5MB)
                                                        </p>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={handleCvFileChange}
                                                    accept=".pdf,.doc,.docx"
                                                    disabled={isUploadingNewCv} // Disable input during upload
                                                />
                                            </label>
                                        </div>
                                        {cvFile && (
                                            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-between">
                                                <p className="text-sm text-green-700 dark:text-green-400 flex items-center">
                                                    <CheckCircle size={18} className="mr-2 flex-shrink-0" />
                                                    Fichier sélectionné: <span className="font-medium ml-1 truncate">{cvFile.name}</span>
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        setCvFile(null);
                                                        setSelectedCv(''); // Deselect if file cleared
                                                    }}
                                                    className="text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-200 transition-colors"
                                                    aria-label="Supprimer le fichier CV sélectionné"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Section: Cover Letter Path (Manual Input) */}
                                    <div>
                                        <label htmlFor="coverLetterPath" className="block text-base font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                            Lettre de Motivation (Optionnel)
                                        </label>
                                        <div className="flex items-center relative">
                                            <MailOpen size={20} className="absolute left-3 text-slate-500 dark:text-slate-400" />
                                            <input
                                                type="text" // Changed type to text for path input as it's simulated
                                                id="coverLetterPath"
                                                name="coverLetterPath"
                                                value={coverLetterPath}
                                                onChange={handleCoverLetterPathChange}
                                                className="w-full pl-10 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                placeholder="Ex: https://example.com/ma-lettre-de-motivation.pdf ou /chemin/vers/ma/lettre.docx"
                                            />
                                        </div>
                                    </div>

                                    {/* Section: Notes */}
                                    <div>
                                        <label htmlFor="notes" className="block text-base font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                            Note (Optionnel)
                                        </label>
                                        <textarea
                                            id="notes"
                                            name="notes"
                                            rows="4"
                                            value={notesContent}
                                            onChange={handleNotesChange}
                                            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Ajoutez des notes supplémentaires ici..."
                                        ></textarea>
                                    </div>

                                    {/* Messages d'erreur & submission feedback */}
                                    {applyError && (
                                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center">
                                            <AlertTriangle size={16} className="mr-2" />
                                            <p className="text-sm text-red-700 dark:text-red-400">{applyError}</p>
                                        </div>
                                    )}
                                    {applySuccess && (
                                        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center">
                                            <CheckCircle size={16} className="mr-2" />
                                            <p className="text-sm text-green-700 dark:text-green-400">{applySuccess}</p>
                                        </div>
                                    )}
                                </div> {/* End of space-y-6 container */}
                            </div> {/* End of scrollable content area */}

                            {/* Modal Footer (Buttons) */}
                            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700 mt-6 flex-shrink-0">
                                <button
                                    onClick={handleCloseApplyModal}
                                    className="px-5 py-2.5 text-base font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleApplySubmit}
                                    disabled={isSubmittingApplication || isUploadingNewCv || !selectedCv || !userEmail}
                                    className={`inline-flex items-center justify-center px-5 py-2.5 text-base font-medium text-white rounded-lg shadow-md
                                               ${isSubmittingApplication || isUploadingNewCv || !selectedCv || !userEmail
                                                   ? 'bg-blue-400 dark:bg-blue-700 cursor-not-allowed opacity-70'
                                                   : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                                               }
                                               transition-all duration-300`}
                                >
                                    {isSubmittingApplication ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin mr-2" />
                                            Soumission...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={20} className="mr-2" />
                                            Soumettre la candidature
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TalenteOffers;
