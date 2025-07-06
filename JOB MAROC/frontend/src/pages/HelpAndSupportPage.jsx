import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertTriangle, Info } from 'lucide-react';

// Import des composants d'aide spécifiques
// import TalentHelpAndSupport from '../components/help_and_support/TalentHelpAndSupport'; // Chemin ajusté
import AdminHelpAndSupport from '../components/admin/AdminHelpAndSupportPage'; // Chemin ajusté
import ManagerHelpAndSupportPage from '../components/manager/ManagerHelpAndSupportPage';
import TalentHelpAndSupport from '../components/talent/TalentHelpAndSupport';

const HelpAndSupportPage = () => {
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserRole = async () => {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('jwtToken');
            const storedRole = localStorage.getItem('userRole');

            if (!token || !storedRole) {
                console.warn("HelpAndSupportPage: Token or role not found, redirecting to login.");
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('userRole');
                localStorage.removeItem('username');
                navigate('/login', { replace: true });
                setLoading(false);
                return;
            }

            try {
                setUserRole(storedRole);
            } catch (err) {
                console.error("HelpAndSupportPage: Error fetching user role (or verifying):", err);
                const errorMessage = err.response?.data?.message || err.message || "Une erreur inattendue est survenue lors de la vérification du rôle.";
                setError(errorMessage);
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('userRole');
                localStorage.removeItem('username');
                navigate('/login', { state: { message: 'Votre session a expiré. Veuillez vous reconnecter.' }, replace: true });
            } finally {
                setLoading(false);
            }
        };

        fetchUserRole();
    }, [navigate]);

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-[100]">
                <div className="flex flex-col items-center justify-center text-center text-slate-600 dark:text-slate-400 py-10">
                    <Loader2 size={48} className="animate-spin mb-4 text-sky-500" />
                    <p className="text-xl font-medium">Chargement de la page d'aide...</p>
                    <p>Veuillez patienter un instant.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-600 dark:text-red-400 py-8">
                Erreur: {error}
            </div>
        );
    }

    // Rendu conditionnel basé sur le rôle de l'utilisateur
    if (userRole === 'TALENT') {
        return <TalentHelpAndSupport />;
    } else if (userRole === 'ADMIN' ) {
        return <AdminHelpAndSupport />;
    }else if (userRole === 'MANAGER') {
        return <ManagerHelpAndSupportPage />;
    }else {
        return (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                Rôle utilisateur inconnu ou non supporté pour la page d'aide.
            </div>
        );
    }
};

export default HelpAndSupportPage;
