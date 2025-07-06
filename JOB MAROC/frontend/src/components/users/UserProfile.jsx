// src/pages/UserProfilePage.jsx
import React, { useEffect, useState } from 'react';
import { Api } from '../../services/Api'; // Chemin corrigé
import { useNavigate } from 'react-router-dom';
import AdminProfile from '../admin/AdminProfile'; // Chemin corrigé
import TalentProfile from '../talent/TalentProfile'; // Chemin corrigé
import ManagerProfile from '../manager/ManagerProfile'; // Chemin corrigé

// Import Loader2 icon
import { Loader2, AlertTriangle, Info } from 'lucide-react';


const UserProfilePage = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState(null); // State to store user role
    const navigate = useNavigate();

    // console.log("UserProfilePage: Component rendering. Current state:", { userProfile, loading, error, userRole });

    useEffect(() => {
        console.log("UserProfilePage: useEffect triggered.");
        const fetchUserProfile = async () => {
            console.log("UserProfilePage: fetchUserProfile function started.");
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('jwtToken'); 
            const storedRole = localStorage.getItem('userRole'); 
            setUserRole(storedRole); 

            console.log("UserProfilePage: Token retrieved:", token ? "Found" : "Not Found");
            console.log("UserProfilePage: Role retrieved:", storedRole || "Not Found");


            if (!token) {
                console.warn("UserProfilePage: No JWT token found, redirecting to login.");
                navigate('/login', { replace: true });
                setLoading(false); 
                return; 
            }

            try {
                let profileData = null;
                console.log("UserProfilePage: Calling backend endpoint /users/profile to get user ID...");
                const userResponse = await Api.get('/users/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                profileData = userResponse.data; // Ceci devrait être l'objet userEntity
                console.log("UserProfilePage: Initial profile data fetched:", profileData);
                if (!profileData || !profileData.userId) {
                    console.error("UserProfilePage: Initial profile fetch returned no data or no user ID.", profileData);
                    setError("Échec de la récupération du profil utilisateur de base.");
                    setUserProfile(null);
                    setLoading(false);
                    return;
                }

                // Deuxième étape (conditionnelle) : Si l'utilisateur est un MANAGER, récupérer les détails spécifiques du manager
                if (storedRole === 'MANAGER') {
                    const email = profileData.email; // Utilisez l'ID récupéré de l'userEntity
                    // console.log(`UserProfilePage: User is MANAGER. Fetching manager-specific data for user ID: ${userId} from /managers/${userId}`);
                    try {
                        const managerResponse = await Api.get(`/manager/${email}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        // Si l'appel réussit, l'objet retourné sera l'entité manager (qui inclut l'userEntity et l'entreprise)
                        profileData = managerResponse.data;
                        console.log("UserProfilePage: Manager specific data fetched:", profileData);
                    } catch (managerFetchError) {
                        console.error("UserProfilePage: Error fetching manager-specific data:", managerFetchError);
                        // En cas d'échec de la récupération du manager, afficher une erreur spécifique
                        const managerErrorMessage = managerFetchError.response?.data?.message || managerFetchError.message || "Échec de la récupération des détails du manager.";
                        setError(managerErrorMessage);
                        setUserProfile(null); // S'assurer que le profil est nul en cas d'erreur spécifique
                        setLoading(false);
                        return;
                    }
                }

                // Définir les données de profil finales (soit userEntity, soit l'entité manager complète)
                if (profileData) {
                    setUserProfile(profileData);
                    console.log("UserProfilePage: Final userProfile set:", profileData);
                } else {
                    console.error("UserProfilePage: Final profile data is null after all fetches.");
                    setError("Aucune donnée de profil disponible.");
                    setUserProfile(null);
                }

            } catch (err) {
                console.error("UserProfilePage: Error during profile fetch process:", err);

                if (err.response && err.response.status === 401) {
                    console.warn("UserProfilePage: Authentication failed (401) during profile fetch, redirecting to login.");
                    localStorage.removeItem('jwtToken'); // Clear invalid token
                    localStorage.removeItem('userRole'); // Also clear role
                    localStorage.removeItem('username'); // Also clear username
                    navigate('/login', { state: { message: 'Votre session a expiré. Veuillez vous reconnecter.' }, replace: true });
                    setError("Votre session a expiré. Veuillez vous reconnecter."); // Set a user-friendly error message
                } else {
                    const errorMessage = err.response?.data?.message || err.message || "Une erreur inattendue est survenue lors de la récupération du profil.";
                    setError(errorMessage);
                    console.error("UserProfilePage: Setting error state:", errorMessage);
                }
                setUserProfile(null); // Ensure userProfile is null on any fetch error
            } finally {
                console.log("UserProfilePage: fetchUserProfile function finished.");
                setLoading(false); // Set loading to false regardless of success or failure
                console.log("UserProfilePage: Loading state set to false.");
            }
        };

        console.log("UserProfilePage: Calling fetchUserProfile on mount.");
        fetchUserProfile();

    }, [navigate]); // Dependency on navigate

    // This useEffect logs the userProfile state *after* it might have been updated
    useEffect(() => {
        console.log("UserProfilePage: useEffect (state check) triggered. Current userProfile:", userProfile);
    }, [userProfile]); // Dependency on userProfile state


    // --- Rendering Logic ---
    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-[100]">
                <div className="flex flex-col items-center justify-center text-center text-slate-600 dark:text-slate-400 py-10">
                    <Loader2 size={48} className="animate-spin mb-4 text-sky-500" />
                    <p className="text-xl font-medium">Chargement du profil...</p>
                    <p>Veuillez patienter un instant.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-600 dark:text-red-400 py-8">Erreur: {error}</div>;
    }

    // Conditional rendering based on userRole
    if (userProfile) {
        console.log("UserProfilePage: User profile loaded. User role:", userRole);
        if (userRole === 'TALENT') {
            console.log("UserProfilePage: Rendering TalentProfile.");
            return <TalentProfile user={userProfile} />;
        } else if (userRole === 'ADMIN') {
            console.log("UserProfilePage: Rendering AdminProfile.");
            return <AdminProfile user={userProfile} />;
        } else if (userRole === 'MANAGER') { // Condition pour le rôle MANAGER
            console.log("UserProfilePage: Rendering ManagerProfile.");
            // Pour le manager, userProfile contient maintenant l'entité manager complète
            return <ManagerProfile user={userProfile} />; 
        } else {
            console.warn("UserProfilePage: Unknown user role, cannot render specific profile component:", userRole);
            return (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    Rôle utilisateur inconnu. Impossible d'afficher le profil.
                </div>
            );
        }
    }

    console.warn("UserProfilePage: Loading finished, no error, but userProfile is still null. Displaying fallback message.");
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Aucune donnée de profil disponible après le chargement.</div>;

};

export default UserProfilePage;
