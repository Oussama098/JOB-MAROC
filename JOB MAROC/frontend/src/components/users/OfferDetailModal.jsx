import React, { useState, useEffect } from 'react';
import {
    X, Building2, MapPin, CircleDollarSign, Briefcase,
    GraduationCap, CalendarDays, FileText, ArrowRight, Info,
    Loader2, AlertTriangle, Mail, FileUp, User2, CheckCircle, Eye
} from 'lucide-react';
import { Api } from '../../services/Api';
import UserDetailModal from "./UserProfilModal";

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    } catch (error) {
        console.error("Error formatting date:", dateString, error);
        return 'Invalid Date';
    }
};

// Added onUpdateApplicationStatus prop
const OfferDetailModal = ({ offer, onClose, isOpen, onUpdateApplicationStatus }) => {
    if (!offer) return null;

    const userRole = localStorage.getItem('userRole');
    const authToken = localStorage.getItem('jwtToken');

    const [applications, setApplications] = useState([]);
    const [applicationsLoading, setApplicationsLoading] = useState(false);
    const [applicationsError, setApplicationsError] = useState(null);
    const [message, setMessage] = useState(null); // For accept/reject messages

    const [isUserModalOpen, setIsUserModalOpen] = useState(false); // Renamed from isModalOpen to avoid conflict
    const [selectedUser, setSelectedUser] = useState(null);

    // Function to handle showing the user profile modal
    function handleShowProfile(talentUserId, applicationId) {
        console.log("handleShowProfile called for talentUserId:", talentUserId, "and applicationId:", applicationId);
        // Find the full talent object from applications if needed, or directly use talentUserId
        setSelectedUser(talentUserId); // Assuming talentUserId is the user object for the UserDetailModal
        setIsUserModalOpen(true);

        // Call the parent handler to update application status to "REVIEWED"
        if (onUpdateApplicationStatus) {
            onUpdateApplicationStatus(applicationId, 'REVIEWED');
        }
    }

    // Function to close the user profile modal
    function handleCloseUserModal() { // Renamed from handleCloseModal
        setIsUserModalOpen(false);
        setSelectedUser(null);
    }


    const contractTypes = Array.isArray(offer.contractTypes) ? offer.contractTypes : [];
    const languages = Array.isArray(offer.languages) ? offer.languages : [];

    const handleApplicationStatus = async (applicationId, newStatus) => {
        if (!authToken) {
            setMessage("Jeton d'authentification manquant.");
            setTimeout(() => setMessage(null), 3000);
            return;
        }


        

        try {
            const response = await Api.put(
                `/applications/status/${applicationId}`, // Corrected endpoint as per ManagerOffers.jsx
                { status: newStatus },
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status >= 200 && response.status < 300) {
                setApplications((prevApps) =>
                    prevApps.map((app) =>
                        app.applicationId === applicationId
                            ? { ...app, status: newStatus }
                            : app
                    )
                );
                setMessage(`Candidature ${newStatus === 'ACCEPTED' ? 'acceptée' : newStatus === 'REJECTED' ? 'rejetée' : 'mise à jour'} avec succès.`);
                setTimeout(() => setMessage(null), 3000);
            } else {
                 throw new Error(response.data?.message || `Erreur lors de la mise à jour du statut: Statut ${response.status}`);
            }

        } catch (error) {
            console.error(`Erreur lors de la mise à jour du statut (${applicationId}) :`, error);
            const errorMessage = error.response?.data?.message || error.message || "Une erreur s'est produite lors de la mise à jour.";
            setMessage(errorMessage);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    useEffect(() => {
        const fetchApplications = async () => {
            if (!isOpen || userRole !== 'MANAGER' || !offer.offer_id || !authToken) {
                console.log("Conditions not met for fetching applications. Skipping.");
                return;
            }

            setApplicationsLoading(true);
            setApplicationsError(null);
            try {
                const response = await Api.get(`/applications/${offer.offer_id}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });

                if (Array.isArray(response.data)) {
                    setApplications(response.data);
                } else if (response.data && Array.isArray(response.data.content)) {
                    setApplications(response.data.content);
                } else if (response.status === 204) { // HTTP 204 No Content
                    setApplications([]);
                } else {
                    console.error("Unexpected response format for applications:", response);
                    setApplicationsError("Format de données inattendu pour les candidatures.");
                    setApplications([]);
                }
            } catch (error) {
                console.error("Échec de la récupération des candidatures pour offerId", offer.offer_id, ":", error);
                const errorMessage = error.response?.data?.message || error.message || "Une erreur est survenue lors de la récupération des candidatures.";
                setApplicationsError(errorMessage);
                setApplications([]);
            } finally {
                setApplicationsLoading(false);
            }
        };

        fetchApplications();
    }, [isOpen, userRole, offer.offer_id, authToken]);

    return (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalshow">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-5 md:p-6 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl md:text-2xl font-bold text-sky-600 dark:text-sky-400 leading-tight">{offer.title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
                        aria-label="Close modal"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Body - Scrollable */}
                <div className="p-5 md:p-6 space-y-5 overflow-y-auto text-sm md:text-base">
                    <div className="flex items-center text-slate-700 dark:text-slate-300">
                        <Building2 size={18} className="mr-3 text-sky-500 dark:text-sky-400 flex-shrink-0" />
                        <p className="font-semibold">{offer.companyName}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div className="flex items-start">
                            <MapPin size={18} className="mr-3 mt-0.5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                            <p><strong className="font-semibold text-slate-700 dark:text-slate-300">Lieu :</strong> {offer.location}</p>
                        </div>

                        {offer.basicSalary != null && (
                            <div className="flex items-start">
                                <CircleDollarSign size={18} className="mr-3 mt-0.5 text-green-500 dark:text-green-400 flex-shrink-0" />
                                <p><strong className="font-semibold text-slate-700 dark:text-slate-300">Salaire :</strong> <span className="text-green-600 dark:text-green-400 font-medium">{offer.basicSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
                            </div>
                        )}

                        <div className="flex items-start">
                            <Briefcase size={18} className="mr-3 mt-0.5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                            <p><strong className="font-semibold text-slate-700 dark:text-slate-300">Modalité :</strong> {offer.modality}</p>
                        </div>

                        <div className="flex items-start">
                            <GraduationCap size={18} className="mr-3 mt-0.5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                            <p><strong className="font-semibold text-slate-700 dark:text-slate-300">Niveau d'étude :</strong> {offer.studyLevel}</p>
                        </div>

                        {offer.experience && offer.experience !== "N/A" && (
                            <div className="flex items-start md:col-span-2">
                                <Briefcase size={18} className="mr-3 mt-0.5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                                <p><strong className="font-semibold text-slate-700 dark:text-slate-300">Expérience :</strong> {offer.experience}</p>
                            </div>
                        )}
                    </div>

                    {contractTypes.length > 0 && (
                        <div className="flex items-start">
                            <FileText size={18} className="mr-3 mt-1 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                            <div>
                                <strong className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Types de contrat :</strong>
                                <div className="flex flex-wrap gap-2">
                                    {contractTypes.map((type, index) => (
                                        <span key={type.typeName || index} className="bg-sky-100 text-sky-700 dark:bg-sky-700 dark:text-sky-200 text-xs font-semibold px-3 py-1 rounded-full">
                            {type.typeName}
                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {offer.description && offer.description !== "N/A" && (
                        <div className="space-y-1">
                            <strong className="font-semibold text-slate-700 dark:text-slate-300 flex items-center"><FileText size={18} className="mr-2 text-slate-500 dark:text-slate-400 flex-shrink-0" />Description :</strong>
                            <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">{offer.description}</p>
                        </div>
                    )}

                    {offer.skills && offer.skills !== "N/A" && (
                        <div className="space-y-1">
                            <strong className="font-semibold text-slate-700 dark:text-slate-300 flex items-center"><FileText size={18} className="mr-2 text-slate-500 dark:text-slate-400 flex-shrink-0" />Compétences :</strong>
                            <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">{offer.skills}</p>
                        </div>
                    )}

                    {languages.length > 0 && (
                        <div className="flex items-start">
                            <FileText size={18} className="mr-3 mt-1 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                            <div>
                                <strong className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Langues :</strong>
                                <div className="flex flex-wrap gap-2">
                                    {languages.map((lang, index) => (
                                        <span key={lang.languageName || index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            {lang.languageName} ({lang.level})
                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}


                    <div className="space-y-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center">
                            <CalendarDays size={16} className="mr-2" />
                            <p><strong>Publié :</strong> {formatDate(offer.datePublication)}</p>
                        </div>
                        <div className="flex items-center">
                            <CalendarDays size={16} className="mr-2" />
                            <p><strong>Expire :</strong> {formatDate(offer.dateExpiration)}</p>
                        </div>
                    </div>

                    {/* SECTION : CANDIDATURES */}
                    {userRole === 'MANAGER' && (
                        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <h4 className="text-lg md:text-xl font-bold text-sky-600 dark:text-sky-400 mb-4">Candidatures reçues</h4>
                            {applicationsLoading ? (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <Loader2 size={36} className="animate-spin text-sky-500 dark:text-sky-400 mb-3" />
                                    <p className="text-slate-600 dark:text-slate-400">Chargement des candidatures...</p>
                                </div>
                            ) : applicationsError ? (
                                <div className="flex flex-col items-center justify-center py-8 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-400 p-4">
                                    <AlertTriangle size={36} className="mb-3" />
                                    <p className="text-center">Erreur lors du chargement : {applicationsError}</p>
                                </div>
                            ) : applications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 bg-slate-50 dark:bg-slate-700/20 rounded-lg text-slate-500 dark:text-slate-400 p-4">
                                    <Info size={36} className="mb-3" />
                                    <p className="text-center">Aucune candidature reçue pour cette offre.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {message && (
                                        <div className="mb-4 px-4 py-2 rounded-md bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300">
                                            {message}
                                        </div>
                                    )}
                                    {applications.map((app) => (
                                        <div key={app.applicationId} className="bg-slate-50 dark:bg-slate-700 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-600">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center text-slate-800 dark:text-slate-200 font-semibold gap-2">
                                                    <User2 size={18} className="flex-shrink-0" />
                                                    {/* Changed from app.talent?.user_id?.firstName to app.talent?.firstName based on your TalentSettings structure */}
                                                    <span>{app.talent?.user_id?.firstName} {app.talent?.user_id?.lastName}</span>
                                                    {app.status && (
                                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                                            ${app.status === 'ACCEPTED'
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300'
                                                            : app.status === 'REJECTED'
                                                                ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300'
                                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                                            {app.status === 'ACCEPTED' ? 'Acceptée' : app.status === 'REJECTED' ? 'Rejetée' : app.status}
                                        </span>
                                                    )}
                                                </div>

                                            </div>

                                            <div className="flex items-center text-slate-600 dark:text-slate-300 mb-2">
                                                <Mail size={16} className="mr-2 flex-shrink-0" />
                                                {/* Changed from app.talent?.user_id?.email to app.talent?.email */}
                                                <a href={`mailto:${app.talent?.user_id?.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                                                    {app.talent?.user_id?.email}
                                                </a>
                                            </div>

                                            {app.talent?.cv_path && ( // Use cv_path based on talentCv model
                                                <div className="mt-2">
                                                    <a
                                                        href={app.talent.cv_path}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors"
                                                    >
                                                        <FileUp size={16} className="mr-2" /> Voir le CV
                                                    </a>
                                                </div>
                                            )}

                                            <div className="mt-3 flex gap-2">
                                                <button
                                                    onClick={() =>  {{handleApplicationStatus(app.applicationId, 'ACCEPTED')}}}
                                                    disabled={app.status === 'ACCEPTED' || app.status === 'REJECTED'}
                                                    className={`inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-md transition-colors
                                        ${app.status === 'ACCEPTED' || app.status === 'REJECTED'
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-green-600 hover:bg-green-700'}`}
                                                >
                                                    <CheckCircle size={16} className="mr-2" /> Accepter
                                                </button>
                                                <button
                                                    onClick={() => handleApplicationStatus(app.applicationId, 'REJECTED')}
                                                    disabled={app.status === 'ACCEPTED' || app.status === 'REJECTED'}
                                                    className={`inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-md transition-colors
                                        ${app.status === 'ACCEPTED' || app.status === 'REJECTED'
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-red-600 hover:bg-red-700'}`}
                                                >
                                                    <X size={16} className="mr-2" /> Refuser
                                                </button>
                                                <button
                                                    onClick={() => handleShowProfile(app.talent?.user_id || app.talent, app.applicationId)}
                                                    className="inline-flex items-center px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-md transition-colors"
                                                >
                                                    <User2 size={16} className="mr-2" /> Voir profil
                                                </button>

                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>


                {/* Modal Footer */}
                <div className="flex flex-col sm:flex-row justify-end items-center gap-3 p-5 md:p-6 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-800 transition-colors w-full sm:w-auto"
                    >
                        Close
                    </button>
                </div>
            </div>


            <style jsx global>{`
                @keyframes modalshow {
                    0% { opacity: 0; transform: scale(0.95); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .animate-modalshow { animation: modalshow 0.3s forwards ease-out; }
            `}</style>

            {isUserModalOpen && selectedUser && ( // Renamed from isModalOpen
                <UserDetailModal
                    user={selectedUser}
                    onClose={handleCloseUserModal} // Renamed from handleCloseModal
                />
            )}
        </div>
    );
};

export default OfferDetailModal;