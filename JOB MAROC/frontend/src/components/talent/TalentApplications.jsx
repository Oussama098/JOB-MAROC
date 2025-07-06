// TalentApplications.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Loader2, AlertTriangle, CheckCircle, FileText, Briefcase, CalendarDays, User, Mail, Info, DownloadCloud
} from 'lucide-react';
import { Api } from '../../services/Api'; // Assuming Api is your Axios instance
import { useNavigate } from 'react-router-dom';

// Helper function for date formatting (reused from TalentSettings)
const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Date invalide' : new Intl.DateTimeFormat('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    } catch (error) {
        return 'Date invalide';
    }
};

const TalentApplications = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null); // Although not directly used for actions here, keeping for consistency

    const userEmail = localStorage.getItem('username');
    const token = localStorage.getItem('jwtToken');

    const fetchTalentApplications = useCallback(async () => {
        if (!userEmail || !token) {
            setError("Jeton d'authentification ou email utilisateur introuvable. Veuillez vous connecter.");
            setLoading(false);
            navigate('/login');
            return;
        }

        setLoading(true);
        setError(null); // Clear previous errors

        try {
            const applicationsResponse = await Api.get(`/applications/talent/${userEmail}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApplications(applicationsResponse.data);

        } catch (err) {
            console.error("Échec de la récupération des candidatures :", err);
            setError(err.response?.data?.message || "Échec du chargement des candidatures.");
        } finally {
            setLoading(false);
        }
    }, [userEmail, token, navigate]);

    useEffect(() => {
        fetchTalentApplications();
    }, [fetchTalentApplications]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
                <p className="ml-3 font-medium">Chargement des candidatures...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 py-10 sm:py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold mb-10 text-center text-blue-700 dark:text-blue-400">Mes Candidatures</h1>

                {error && (
                    <div className="bg-red-100 dark:bg-red-800 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-5 py-4 rounded-lg relative mb-6 shadow-sm" role="alert">
                        <AlertTriangle className="inline mr-3 h-5 w-5" />
                        <span className="block sm:inline font-medium">{error}</span>
                    </div>
                )}
                {successMessage && (
                    <div className="bg-green-100 dark:bg-green-800 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-5 py-4 rounded-lg relative mb-6 shadow-sm" role="alert">
                        <CheckCircle className="inline mr-3 h-5 w-5" />
                        <span className="block sm:inline font-medium">{successMessage}</span>
                    </div>
                )}

                {applications.length > 0 ? (
                    // Changed to grid-cols-1 to ensure each card is in its own "line"
                    // Removed md: and lg: grid-cols to enforce single column on all screens
                    <div className="grid grid-cols-1 gap-8 max-w-2xl mx-auto"> {/* Added max-w-2xl mx-auto to center cards */}
                        {applications.map((app) => (
                            <div key={app.applicationId} className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg p-7 border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer">
                                <div className="flex items-center mb-5 border-b pb-4 border-gray-100 dark:border-gray-700">
                                    <FileText className="h-7 w-7 text-blue-600 dark:text-blue-400 mr-4 flex-shrink-0" />
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                                        Candidature #{app.applicationId}
                                    </h3>
                                </div>
                                <div className="space-y-3 text-gray-700 dark:text-gray-300 text-base">
                                    <p className="flex items-center text-gray-800 dark:text-gray-200">
                                        <Briefcase className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <span className="font-semibold">Offre:</span> {app.offer?.title || 'Non spécifié'}
                                    </p>
                                    {/* <p className="flex items-center">
                                        <User className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <span className="font-semibold">Talent:</span> {app.talent?.firstName || 'N/A'} {app.talent?.lastName || 'N/A'}
                                    </p>
                                    <p className="flex items-center">
                                        <Mail className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <span className="font-semibold">Email Talent:</span> {app.talent?.email || 'N/A'}
                                    </p> */}
                                    <p className="flex items-center text-gray-800 dark:text-gray-200">
                                        <CalendarDays className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <span className="font-semibold">Date de candidature:</span> {formatDateForDisplay(app.applicationDate)}
                                    </p>
                                    <div className="flex items-center">
                                        <Info className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                        <span className="font-semibold">Statut:</span>
                                        <span className={`ml-3 px-3 py-1.5 rounded-full text-sm font-bold tracking-wide
                                            ${app.status === 'APPLIED' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                                              app.status === 'REVIEWED' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                                            //   app.status === 'INTERVIEWED' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300' :
                                              app.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300' :
                                              app.status === 'REJECTED' ? 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300' :
                                              'bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                                            }`}
                                        >
                                            {
                                            app.status === 'APPLIED' ? 'APPLIQUÉE' :
                                             app.status === 'REVIEWED' ? 'EXAMINÉE' :
                                             app.status === 'ACCEPTED' ? 'ACCEPTÉE' :
                                             app.status === 'REJETED' ? 'REJECTÉE' : ""
                                             }
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-4 justify-start">
                                    {app.appliedWithCvPath?.cv_path && (
                                        <a
                                            href={app.appliedWithCvPath.cv_path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-4 py-2 border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors duration-200 text-sm shadow-sm"
                                        >
                                            <DownloadCloud className="h-4 w-4 mr-2" /> CV utilisé
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 shadow-sm">
                        <FileText className="mx-auto h-20 w-20 text-gray-400 dark:text-gray-500 mb-6" />
                        <p className="mt-4 text-gray-600 dark:text-gray-400 text-xl font-semibold">Aucune candidature trouvée pour le moment.</p>
                        <p className="mt-2 text-gray-500 dark:text-gray-400 text-lg">Commencez par explorer les offres d'emploi pour postuler !</p>
                        <button
                            onClick={() => navigate('/offers')} 
                            className="mt-8 inline-flex items-center px-8 py-4 border border-transparent text-base font-bold rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-200 transform hover:scale-105"
                        >
                            Voir les offres d'emploi
                            <Briefcase className="ml-3 h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TalentApplications;
