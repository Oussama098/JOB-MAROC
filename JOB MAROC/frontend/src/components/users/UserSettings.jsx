import React, { useState ,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ManagerSettingsPage from '../manager/ManagerSettings';
import TalentSettings from '../talent/TalentSettings';

const UserSettings = () => {
    const navigate = useNavigate();
    const  [userRole, setUserRole] = useState(null); // State to store user role
    useEffect(() => {
        const userRole = localStorage.getItem('userRole'); // Retrieve user role
        
        if (!userRole) {
            // If no role, redirect to login page
            console.warn("UserSettings: No user role found, redirecting to login.");
            navigate('/login', { replace: true });
            return;
        }
        setUserRole(userRole); // Set the user role state

        
    }, [navigate]);
    
    if(userRole === 'MANAGER') {
        console.log("UserSettings: User role is MANAGER, rendering ManagerSettingsPage.");
        return <ManagerSettingsPage />; 
    }else if(userRole === 'TALENT') {
        return <TalentSettings/>
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 bg-opacity-75 z-[100] transition-colors duration-300">
            <div className="flex flex-col items-center justify-center text-center text-slate-600 dark:text-slate-400 py-10">
                <Loader2 size={48} className="animate-spin mb-4 text-blue-500" />
                <p className="text-xl font-medium">Redirection vers les paramètres du profil...</p>
                <p>Veuillez patienter un instant.</p>
            </div>
        </div>
    );

    
};

export default UserSettings;
