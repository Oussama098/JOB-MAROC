// TalentSettings.jsx
import React, { useState, useEffect, useCallback, memo } from 'react';
import {
    User, Mail, Phone, MapPin, Briefcase, CalendarDays, LogIn,
    CheckCircle, XCircle, AlertTriangle, ShieldCheck, Navigation,
    Cake, Landmark, Users, BookOpen, Layers, FileText, GraduationCap,
    CreditCard, Award, FileBadge, FileCode, FileSearch, Globe, Star,
    Loader2, Info, Settings, Save, KeyRound, Eye, EyeOff, Upload, Plus, Trash2, Edit
} from 'lucide-react';
import { Api } from '../../services/Api'; // Assuming Api is your Axios instance
import { useNavigate } from 'react-router-dom';

// Helper function for date formatting
const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
    } catch (error) {
        return '';
    }
};

// Helper function for rendering stars
const renderStars = (level) => {
    return '⭐'.repeat(level);
};

// Memoized ProfileInput component
const ProfileInput = memo(({ label, name, value, onChange, type = "text", icon: Icon, placeholder = "", disabled = false, options = [] }) => {
    return (
        <div className="mb-4">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {label}
            </label>
            <div className="relative">
                {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />}
                {type === "select" ? (
                    <select
                        id={name}
                        name={name}
                        value={value}
                        onChange={onChange}
                        disabled={disabled}
                        className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                            dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${disabled ? 'bg-gray-100 dark:bg-gray-600' : 'bg-white dark:bg-gray-800'}`}
                    >
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={type}
                        id={name}
                        name={name}
                        // Pass the value prop directly. For type="date", HTML input expects YYYY-MM-DD.
                        // We ensure 'value' prop passed to ProfileInput is already YYYY-MM-DD from state.
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                            dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 ${disabled ? 'bg-gray-100 dark:bg-gray-600' : 'bg-white dark:bg-gray-800'}`}
                    />
                )}
            </div>
        </div>
    );
});


const TalentSettings = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [talentId , setTalentId] = useState(null);
    const [talentData, setTalentData] = useState({
        personal: {
            firstName: '', lastName: '', email: '', num_tel: '', address: '',
            datenais: '', lieu: '', sexe: '', nationality: '', situation_familliale: '', cin: ''
        },
        skills: [],
        diplomes: [],
        experiences: [],
        cvs: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [activeSection, setActiveSection] = useState('personal');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [newSkill, setNewSkill] = useState({ skill_name: '', skillLevel: 1, skill_description: ''  });
    const [newDiplome, setNewDiplome] = useState({
        diplome_name: '',
        diplome_description : '',
        diplome_date_debut: '',
        diplome_date_fin: '',
        diplome_etablissement: '',
    });
    const [newExperience, setNewExperience] = useState({
        // position: '',
        job_title :'',
        company_name: '',
        start_date: '',
        end_date: '',
        description: '',
        // sector: ''
    });
    const [selectedCvFile, setSelectedCvFile] = useState(null);

    const userEmailFromStorage = localStorage.getItem('username');
    const token = localStorage.getItem('jwtToken');

    const fetchUserAndTalentData = useCallback(async () => {
        if (!userEmailFromStorage || !token) {
            setError("Jeton d'authentification ou email utilisateur introuvable. Veuillez vous connecter.");
            setLoading(false);
            navigate('/login');
            return;
        }

        try {
            const userResponse = await Api.get(`/users/email/${userEmailFromStorage}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const fetchedUser = userResponse.data;
            setCurrentUser(fetchedUser);

            const talentResponse = await Api.get(`/talent/all-data/${fetchedUser.userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = talentResponse.data || {};
            
            setTalentId(data.talentId || fetchedUser.talent_id); 
            console.log("Fetched Talent ID:", data.talentId );
            setTalentData({
                personal: {
                    firstName: fetchedUser.firstName || '',
                    lastName: fetchedUser.lastName || '',
                    email: fetchedUser.email || '',
                    num_tel: data.num_tel || fetchedUser.num_tel || '',
                    address: data.address || fetchedUser.address || '',
                    datenais: formatDateForInput(data.datenais || fetchedUser.datenais || ''), // Format here once
                    lieu: data.lieu || fetchedUser.lieu || '',
                    sexe: data.sexe || fetchedUser.sexe || '',
                    nationality: data.nationality || fetchedUser.nationality || '',
                    situation_familliale: data.situation_familliale || fetchedUser.situation_familliale || '',
                    cin: data.cin || fetchedUser.cin || ''
                },
                skills: data.skills || [],
                diplomes: data.diplomes || [],
                experiences: data.experiences || [],
                cvs: data.cvs || [],
            });
        } catch (err) {
            console.error("Failed to fetch user or talent data:", err);
            setError("Échec du chargement des données du profil.");
        } finally {
            setLoading(false);
        }
    }, [token, userEmailFromStorage, navigate]);


    useEffect(() => {
        fetchUserAndTalentData();
    }, [fetchUserAndTalentData]);


    const handlePersonalInputChange = useCallback((e) => {
        const { name, value, type } = e.target;
        setTalentData(prev => ({
            ...prev,
            personal: {
                ...prev.personal,
                [name]: type === 'date' ? value : value // Store as YYYY-MM-DD string directly from date input
            }
        }));
    }, []);

    const handlePasswordChange = useCallback((e) => {
        const { name, value } = e.target;
        if (name === "currentPassword") setCurrentPassword(value);
        else if (name === "newPassword") setNewPassword(value);
        else if (name === "confirmPassword") setConfirmPassword(value);
    }, []);

    const handleNewSkillChange = useCallback((e) => {
        const { name, value } = e.target;
        setNewSkill(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleNewDiplomeChange = useCallback((e) => {
        const { name, value } = e.target;
        setNewDiplome(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleNewExperienceChange = useCallback((e) => {
        const { name, value } = e.target;
        setNewExperience(prev => ({ ...prev, [name]: value }));
    }, []);


    const handleSubmitPersonal = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage(null);
        setError(null);

        try {
            const payload = {
                userId: currentUser.userId, 
                firstName: talentData.personal.firstName,
                lastName: talentData.personal.lastName,
                num_tel: talentData.personal.num_tel,
                address: talentData.personal.address,
                datenais: talentData.personal.datenais,
                lieu: talentData.personal.lieu,
                sexe: talentData.personal.sexe,
                nationality: talentData.personal.nationality,
                situation_familliale: talentData.personal.situation_familliale,
                cin: talentData.personal.cin,
                user_id: currentUser.userId, // Use fetched user's ID
                email: currentUser.email // Use fetched user's email
            };

            const response = await Api.put(`talent/update`, payload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSuccessMessage("Informations personnelles mises à jour avec succès !");
            fetchUserAndTalentData();
        } catch (err) {
            console.error("Error updating personal information:", err);
            setError(err.response?.data?.message || err.message || "Échec de la mise à jour des informations personnelles.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage(null);
        setError(null);

        if (newPassword !== confirmPassword) {
            setError("Le nouveau mot de passe et la confirmation ne correspondent pas.");
            setLoading(false);
            return;
        }

        try {
            const userId = currentUser?.userId;
            if (!userId) {
                throw new Error("User ID not found.");
            }

            await Api.put(`/talent/update/password`, {
                userId: userId,
                email: currentUser.email, 
                oldPassword: currentPassword,
                newPassword: newPassword,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccessMessage("Mot de passe mis à jour avec succès !");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error("Failed to update password:", err);
            setError(err.response?.data?.message || "Échec de la mise à jour du mot de passe.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddSkill = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage(null);
        setError(null);

        if (!newSkill.skill_name || !newSkill.skillLevel) {
            setError("Le nom et le niveau de la compétence sont requis.");
            setLoading(false);
            return;
        }

        try {
            const userId = currentUser?.userId;
            if (!userId) throw new Error("User ID not found.");

            const response = await Api.post(`talent/skills/add/${talentId}`, newSkill, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setTalentData(prev => ({
                ...prev,
                skills: [...prev.skills, response.data]
            }));
            setNewSkill({ skill_name: '', skillLevel: 1, skill_description: '' });
            setSuccessMessage("Compétence ajoutée avec succès !");
        } catch (err) {
            console.error("Failed to add skill:", err);
            setError(err.response?.data?.message || "Échec de l'ajout de la compétence.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSkill = async (skillId) => {
        setLoading(true);
        setSuccessMessage(null);
        setError(null);

        try {
            const userId = currentUser?.userId;
            if (!userId) throw new Error("User ID not found.");

            await Api.delete(`/talent/skill/delete/${skillId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setTalentData(prev => ({
                ...prev,
                skills: prev.skills.filter(s => s.id !== skillId)
            }));
            setSuccessMessage("Compétence supprimée avec succès !");
        } catch (err) {
            console.error("Failed to delete skill:", err);
            setError(err.response?.data?.message || "Échec de la suppression de la compétence.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddDiplome = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage(null);
        setError(null);

        if (!newDiplome.diplome_name || !newDiplome.diplome_etablissement || !newDiplome.diplome_date_debut) {
            setError("Le nom du diplôme, l'établissement et la date de début sont requis.");
            setLoading(false);
            return;
        }

        try {
            const userId = currentUser?.userId;
            if (!userId) throw new Error("User ID not found.");

            const response = await Api.post(`/talent/diplome/add/${talentId}`, {
                ...newDiplome,
                diplome_date_debut: newDiplome.diplome_date_debut ? new Date(newDiplome.diplome_date_debut).toISOString() : null,
                diplome_date_fin: newDiplome.diplome_date_fin ? new Date(newDiplome.diplome_date_fin).toISOString() : null,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setTalentData(prev => ({
                ...prev,
                diplomes: [...prev.diplomes, response.data]
            }));
            setNewDiplome({
                diplome_name: '', diplome_type: '', diplome_speciality: '',
                diplome_date_debut: '', diplome_date_fin: '', diplome_institution: '', diplome_grade: ''
            });
            setSuccessMessage("Diplôme ajouté avec succès !");
        } catch (err) {
            console.error("Failed to add diploma:", err);
            setError(err.response?.data?.message || "Échec de l'ajout du diplôme.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDiplome = async (diplomeId) => {
        setLoading(true);
        setSuccessMessage(null);
        setError(null);

        try {
            const userId = currentUser?.userId;
            if (!userId) throw new Error("User ID not found.");

            await Api.delete(`/talent/diplome/delete/${diplomeId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setTalentData(prev => ({
                ...prev,
                diplomes: prev.diplomes.filter(d => d.diplome_id !== diplomeId)
            }));
            setSuccessMessage("Diplôme supprimé avec succès !");
        } catch (err) {
            console.error("Failed to delete diploma:", err);
            setError(err.response?.data?.message || "Échec de la suppression du diplôme.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddExperience = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage(null);
        setError(null);

        if (!newExperience.job_title|| !newExperience.company_name || !newExperience.start_date) {
            setError("Le poste, l'entreprise et la date de début sont requis.");
            setLoading(false);
            return;
        }

        try {
            const userId = currentUser?.userId;
            if (!userId) throw new Error("User ID not found.");

            const response = await Api.post(`/talent/experience/add/${talentId}`, {
                ...newExperience,
                start_date: newExperience.start_date ? new Date(newExperience.start_date).toISOString() : null,
                end_date: newExperience.end_date ? new Date(newExperience.end_date).toISOString() : null,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setTalentData(prev => ({
                ...prev,
                experiences: [...prev.experiences, response.data]
            }));
            setNewExperience({
                job_title: '', company_name: '', start_date: '',
                end_date: '', description: ''
            });
            setSuccessMessage("Expérience ajoutée avec succès !");
        } catch (err) {
            console.error("Failed to add experience:", err);
            setError(err.response?.data?.message || "Échec de l'ajout de l'expérience.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteExperience = async (experienceId) => {
        setLoading(true);
        setSuccessMessage(null);
        setError(null);

        try {
            const userId = currentUser?.userId;
            if (!userId) throw new Error("User ID not found.");

            await Api.delete(`/talent/experience/delete/${experienceId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setTalentData(prev => ({
                ...prev,
                experiences: prev.experiences.filter(e => e.experiance_id !== experienceId)
            }));
            setSuccessMessage("Expérience supprimée avec succès !");
        } catch (err) {
            console.error("Failed to delete experience:", err);
            setError(err.response?.data?.message || "Échec de la suppression de l'expérience.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = useCallback((e) => {
        setSelectedCvFile(e.target.files[0]);
    }, []);

    const handleUploadCv = async (e) => {
        e.preventDefault();
        console.log("selected cv" ,selectedCvFile);
        if (!selectedCvFile) {
            setError("Veuillez sélectionner un fichier à télécharger.");
            return;
        }

        setLoading(true);
        setSuccessMessage(null);
        setError(null);

        try {
            const userId = currentUser?.userId;
            if (!userId) throw new Error("User ID not found.");

            const formData = {
                talent: {
                        user_id: {
                            email: userEmailFromStorage 
                        }
                    },
                cv_path: selectedCvFile.name,
                
            };
            

            const response = await Api.post(`talent/cv/upload`, formData, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            setTalentData(prev => ({
                ...prev,
                cvs: [...prev.cvs, response.data]
            }));
            setSelectedCvFile(null); // Clear selected file
            setSuccessMessage("CV téléchargé avec succès !");
        } catch (err) {
            console.error("Failed to upload CV:", err);
            setError(err.response?.data?.message || "Échec du téléchargement du CV.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCv = async (cvId) => {
        setLoading(true);
        setSuccessMessage(null);
        setError(null);

        try {
            const userId = currentUser?.userId;
            if (!userId) throw new Error("User ID not found.");

            await Api.delete(`/talent/cv/delete/${cvId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setTalentData(prev => ({
                ...prev,
                cvs: prev.cvs.filter(c => c.cv_id !== cvId)
            }));
            setSuccessMessage("CV supprimé avec succès !");
        } catch (err) {
            console.error("Failed to delete CV:", err);
            setError(err.response?.data?.message || "Échec de la suppression du CV.");
        } finally {
            setLoading(false);
        }
    };


    if (loading && !talentData.personal.firstName) { // Only show full loading if initial data is not there
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
                <p className="ml-3">Chargement du profil...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-center text-blue-600 dark:text-blue-400">Paramètres du Profil</h1>

                {error && (
                    <div className="bg-red-100 dark:bg-red-800 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative mb-4" role="alert">
                        <AlertTriangle className="inline mr-2 h-5 w-5" />
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                {successMessage && (
                    <div className="bg-green-100 dark:bg-green-800 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded relative mb-4" role="alert">
                        <CheckCircle className="inline mr-2 h-5 w-5" />
                        <span className="block sm:inline">{successMessage}</span>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 lg:p-8 flex flex-col lg:flex-row">
                    <aside className="lg:w-1/4 pr-0 lg:pr-8 mb-8 lg:mb-0 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700">
                        <nav className="space-y-4">
                            <button
                                onClick={() => setActiveSection('personal')}
                                className={`flex items-center w-full px-4 py-3 rounded-md text-left transition-colors duration-200
                                    ${activeSection === 'personal' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 font-semibold' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            >
                                <User className="mr-3 h-5 w-5" /> Informations Personnelles
                            </button>
                            <button
                                onClick={() => setActiveSection('password')}
                                className={`flex items-center w-full px-4 py-3 rounded-md text-left transition-colors duration-200
                                    ${activeSection === 'password' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 font-semibold' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            >
                                <KeyRound className="mr-3 h-5 w-5" /> Changer le Mot de Passe
                            </button>
                            <button
                                onClick={() => setActiveSection('skills')}
                                className={`flex items-center w-full px-4 py-3 rounded-md text-left transition-colors duration-200
                                    ${activeSection === 'skills' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 font-semibold' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            >
                                <FileCode className="mr-3 h-5 w-5" /> Compétences
                            </button>
                            <button
                                onClick={() => setActiveSection('diplomas')}
                                className={`flex items-center w-full px-4 py-3 rounded-md text-left transition-colors duration-200
                                    ${activeSection === 'diplomas' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 font-semibold' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            >
                                <GraduationCap className="mr-3 h-5 w-5" /> Diplômes
                            </button>
                            <button
                                onClick={() => setActiveSection('experiences')}
                                className={`flex items-center w-full px-4 py-3 rounded-md text-left transition-colors duration-200
                                    ${activeSection === 'experiences' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 font-semibold' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            >
                                <Briefcase className="mr-3 h-5 w-5" /> Expériences
                            </button>
                            <button
                                onClick={() => setActiveSection('cvs')}
                                className={`flex items-center w-full px-4 py-3 rounded-md text-left transition-colors duration-200
                                    ${activeSection === 'cvs' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 font-semibold' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            >
                                <FileText className="mr-3 h-5 w-5" /> CVs
                            </button>
                        </nav>
                    </aside>

                    <main className="lg:w-3/4 lg:pl-8">
                        {activeSection === 'personal' && (
                            <div className="section-content">
                                <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Informations Personnelles</h2>
                                <form onSubmit={handleSubmitPersonal}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ProfileInput label="Prénom" name="firstName" value={talentData.personal.firstName} onChange={handlePersonalInputChange} icon={User} />
                                        <ProfileInput label="Nom" name="lastName" value={talentData.personal.lastName} onChange={handlePersonalInputChange} icon={User} />
                                        <ProfileInput label="Email" name="email" value={talentData.personal.email} onChange={handlePersonalInputChange} type="email" icon={Mail} disabled={true} />
                                        <ProfileInput label="Numéro de téléphone" name="num_tel" value={talentData.personal.num_tel} onChange={handlePersonalInputChange} icon={Phone} />
                                        <ProfileInput label="Adresse" name="address" value={talentData.personal.address} onChange={handlePersonalInputChange} icon={MapPin} />
                                        {/* Corrected: Removed formatDateForInput wrapper here */}
                                        <ProfileInput label="Date de Naissance" name="datenais" value={talentData.personal.datenais} onChange={handlePersonalInputChange} type="date" icon={Cake} />
                                        <ProfileInput label="Lieu de naissance" name="lieu" value={talentData.personal.lieu} onChange={handlePersonalInputChange} icon={Landmark} />
                                        <ProfileInput
                                            label="Sexe"
                                            name="sexe"
                                            value={talentData.personal.sexe}
                                            onChange={handlePersonalInputChange}
                                            type="select"
                                            icon={Users}
                                            options={[
                                                { value: '', label: 'Sélectionner' },
                                                { value: 'M', label: 'Homme' },
                                                { value: 'F', label: 'Femme' }
                                            ]}
                                        />
                                        <ProfileInput label="Nationalité" name="nationality" value={talentData.personal.nationality} onChange={handlePersonalInputChange} icon={Globe} />
                                        <ProfileInput
                                            label="Situation Familiale"
                                            name="situation_familliale"
                                            value={talentData.personal.situation_familliale}
                                            onChange={handlePersonalInputChange}
                                            type="select"
                                            icon={Users}
                                            options={[
                                                { value: '', label: 'Sélectionner' },
                                                { value: 'SINGLE', label: 'Célibataire' },
                                                { value: 'MARRIED', label: 'Marié(e)' },
                                                { value: 'DIVORCED', label: 'Divorcé(e)' },
                                                { value: 'WIDOWER', label: 'Veuf(ve)' }
                                            ]}
                                        />
                                        <ProfileInput label="CIN" name="cin" value={talentData.personal.cin} onChange={handlePersonalInputChange} icon={CreditCard} />
                                    </div>
                                    <div className="mt-6 flex justify-end">
                                        <button
                                            type="submit"
                                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
                                            disabled={loading}
                                        >
                                            {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-5 w-5" />}
                                            Enregistrer les modifications
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeSection === 'password' && (
                            <div className="section-content">
                                <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Changer le Mot de Passe</h2>
                                <form onSubmit={handleSubmitPassword}>
                                    <div className="space-y-4">
                                        <ProfileInput
                                            label="Mot de passe actuel"
                                            name="currentPassword"
                                            value={currentPassword}
                                            onChange={handlePasswordChange}
                                            type={showPassword ? "text" : "password"}
                                            icon={KeyRound}
                                        />
                                        <ProfileInput
                                            label="Nouveau mot de passe"
                                            name="newPassword"
                                            value={newPassword}
                                            onChange={handlePasswordChange}
                                            type={showPassword ? "text" : "password"}
                                            icon={KeyRound}
                                        />
                                        <ProfileInput
                                            label="Confirmer le nouveau mot de passe"
                                            name="confirmPassword"
                                            value={confirmPassword}
                                            onChange={handlePasswordChange}
                                            type={showPassword ? "text" : "password"}
                                            icon={KeyRound}
                                        />
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="showPassword"
                                                checked={showPassword}
                                                onChange={() => setShowPassword(!showPassword)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                            />
                                            <label htmlFor="showPassword" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                                Afficher les mots de passe
                                            </label>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex justify-end">
                                        <button
                                            type="submit"
                                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
                                            disabled={loading}
                                        >
                                            {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-5 w-5" />}
                                            Mettre à jour le mot de passe
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeSection === 'skills' && (
                            <div className="section-content">
                                <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Vos Compétences</h2>

                                {/* Add New Skill Form */}
                                <form onSubmit={handleAddSkill} className="mb-8 p-6 border border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-gray-700 shadow-inner">
                                    <h3 className="text-xl font-medium mb-4 text-blue-700 dark:text-blue-300">Ajouter une Nouvelle Compétence</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ProfileInput
                                            label="Nom de la compétence"
                                            name="skill_name"
                                            value={newSkill.skill_name}
                                            onChange={handleNewSkillChange} // Use memoized handler
                                            placeholder="ex: React, Python, Analyse de données"
                                            icon={FileCode}
                                        />
                                        <ProfileInput
                                            label="Niveau de compétence"
                                            name="skillLevel"
                                            value={newSkill.skillLevel}
                                            onChange={handleNewSkillChange} // Use memoized handler
                                            type="select"
                                            icon={Star}
                                            options={[
                                                { value: 1, label: '⭐' }, { value: 2, label: '⭐⭐' },
                                                { value: 3, label: '⭐⭐⭐' }, { value: 4, label: '⭐⭐⭐⭐' },
                                                { value: 5, label: '⭐⭐⭐⭐⭐' },
                                            ]}
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="skill_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Description (Facultatif)
                                        </label>
                                        <textarea
                                            id="skill_description"
                                            name="skill_description"
                                            rows="3"
                                            value={newSkill.skill_description}
                                            onChange={handleNewSkillChange} // Use memoized handler
                                            className="block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder="Décrivez votre niveau de maîtrise ou vos projets pertinents..."
                                        ></textarea>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
                                            disabled={loading}
                                        >
                                            {loading ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2 h-4 w-4" />}
                                            Ajouter la compétence
                                        </button>
                                    </div>
                                </form>

                                {/* Existing Skills List */}
                                {talentData.skills.length > 0 ? (
                                    <div className="space-y-4">
                                        {talentData.skills.map((skill) => (
                                            <div key={skill.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 shadow-sm">
                                                <div>
                                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{skill.skill_name}</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">Niveau: {renderStars(skill.skillLevel)}</p>
                                                    {skill.skill_description && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{skill.skill_description}</p>}
                                                </div>
                                                <div className="mt-3 sm:mt-0 flex space-x-2">
                                                    {/* <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-100 dark:hover:bg-blue-700 transition-colors">
                                                        <Edit className="mr-2 h-4 w-4" /> Modifier
                                                    </button> */}
                                                    <button
                                                        onClick={() => handleDeleteSkill(skill.id)}
                                                        className="inline-flex items-center px-3 py-1.5 border border-red-400 text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900 transition-colors text-sm"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <Layers className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                                        <p className="mt-2 text-gray-500 dark:text-gray-400">Aucune compétence ajoutée pour l'instant.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeSection === 'diplomas' && (
                            <div className="section-content">
                                <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Vos Diplômes</h2>

                                {/* Add New Diploma Form */}
                                <form onSubmit={handleAddDiplome} className="mb-8 p-6 border border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-gray-700 shadow-inner">
                                    <h3 className="text-xl font-medium mb-4 text-blue-700 dark:text-blue-300">Ajouter un Nouveau Diplôme</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ProfileInput
                                            label="Nom du Diplôme"
                                            name="diplome_name"
                                            value={newDiplome.diplome_name}
                                            onChange={handleNewDiplomeChange} // Use memoized handler
                                            icon={Award}
                                        />
                                        {/* <ProfileInput
                                            label="Type de Diplôme"
                                            name="diplome_type"
                                            value={newDiplome.diplome_type}
                                            onChange={handleNewDiplomeChange} // Use memoized handler
                                            icon={BookOpen}
                                        /> */}
                                        {/* <ProfileInput
                                            label="Spécialité"
                                            name="diplome_speciality"
                                            value={newDiplome.diplome_speciality}
                                            onChange={handleNewDiplomeChange} // Use memoized handler
                                            icon={FileBadge}
                                        /> */}
                                        <ProfileInput
                                            label="Date de Début"
                                            name="diplome_date_debut"
                                            value={newDiplome.diplome_date_debut}
                                            onChange={handleNewDiplomeChange} // Use memoized handler
                                            type="date"
                                            icon={CalendarDays}
                                        />
                                        <ProfileInput
                                            label="Date de Fin (Facultatif)"
                                            name="diplome_date_fin"
                                            value={newDiplome.diplome_date_fin}
                                            onChange={handleNewDiplomeChange} // Use memoized handler
                                            type="date"
                                            icon={CalendarDays}
                                        />
                                        <ProfileInput
                                            label="Établissement"
                                            name="diplome_etablissement"
                                            value={newDiplome.diplome_etablissement}
                                            onChange={handleNewDiplomeChange} // Use memoized handler
                                            icon={Landmark}
                                        />
                                        <ProfileInput
                                            label="Description"
                                            name="diplome_description"
                                            value={newDiplome.diplome_description}
                                            onChange={handleNewDiplomeChange} // Use memoized handler
                                            // icon={Award}
                                        />
                                    </div>
                                    <div className="flex justify-end mt-6">
                                        <button
                                            type="submit"
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
                                            disabled={loading}
                                        >
                                            {loading ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2 h-4 w-4" />}
                                            Ajouter le diplôme
                                        </button>
                                    </div>
                                </form>

                                {/* Existing Diplomas List */}
                                {talentData.diplomes.length > 0 ? (
                                    <div className="space-y-4">
                                        {talentData.diplomes.map((diplome) => (
                                            <div key={diplome.diplome_id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 shadow-sm">
                                                <div>
                                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{diplome.diplome_name}</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">{diplome.diplome_institution}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                                        {formatDateForInput(diplome.diplome_date_debut)} - {diplome.diplome_date_fin ? formatDateForInput(diplome.diplome_date_fin) : 'Actuel'}
                                                    </p>
                                                </div>
                                                <div className="mt-3 sm:mt-0 flex space-x-2">
                                                    <button
                                                        onClick={() => handleDeleteDiplome(diplome.diplome_id)}
                                                        className="inline-flex items-center px-3 py-1.5 border border-red-400 text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900 transition-colors text-sm"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <GraduationCap className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                                        <p className="mt-2 text-gray-500 dark:text-gray-400">Aucun diplôme ajouté pour l'instant.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeSection === 'experiences' && (
                            <div className="section-content">
                                <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Vos Expériences</h2>

                                {/* Add New Experience Form */}
                                <form onSubmit={handleAddExperience} className="mb-8 p-6 border border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-gray-700 shadow-inner">
                                    <h3 className="text-xl font-medium mb-4 text-blue-700 dark:text-blue-300">Ajouter une Nouvelle Expérience</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ProfileInput
                                            label="Poste"
                                            name="job_title"
                                            value={newExperience.job_title}
                                            onChange={handleNewExperienceChange} // Use memoized handler
                                            icon={Briefcase}
                                        />
                                        <ProfileInput
                                            label="Nom de l'Entreprise"
                                            name="company_name"
                                            value={newExperience.company_name}
                                            onChange={handleNewExperienceChange} // Use memoized handler
                                            icon={Landmark}
                                        />
                                        <ProfileInput
                                            label="Date de Début"
                                            name="start_date"
                                            value={newExperience.start_date}
                                            onChange={handleNewExperienceChange} // Use memoized handler
                                            type="date"
                                            icon={CalendarDays}
                                        />
                                        <ProfileInput
                                            label="Date de Fin (Facultatif)"
                                            name="end_date"
                                            value={newExperience.end_date}
                                            onChange={handleNewExperienceChange} // Use memoized handler
                                            type="date"
                                            icon={CalendarDays}
                                        />
                                        {/* <ProfileInput
                                            label="Secteur (Facultatif)"
                                            name="sector"
                                            value={newExperience.sector}
                                            onChange={handleNewExperienceChange} // Use memoized handler
                                            icon={Layers}
                                        /> */}
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="experience_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Description (Facultatif)
                                        </label>
                                        <textarea
                                            id="experience_description"
                                            name="description"
                                            rows="3"
                                            value={newExperience.description}
                                            onChange={handleNewExperienceChange} // Use memoized handler
                                            className="block w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder="Décrivez vos responsabilités et réalisations..."
                                        ></textarea>
                                    </div>
                                    <div className="flex justify-end mt-6">
                                        <button
                                            type="submit"
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
                                            disabled={loading}
                                        >
                                            {loading ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2 h-4 w-4" />}
                                            Ajouter l'expérience
                                        </button>
                                    </div>
                                </form>

                                {/* Existing Experiences List */}
                                {talentData.experiences.length > 0 ? (
                                    <div className="space-y-4">
                                        {talentData.experiences.map((exp) => (
                                            <div key={exp.experiance_id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 shadow-sm">
                                                <div>
                                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{exp.job_title} chez {exp.company_name}</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                                        {formatDateForInput(exp.start_date)} - {exp.end_date ? formatDateForInput(exp.end_date) : 'Actuel'}
                                                    </p>
                                                    {exp.description && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{exp.description}</p>}
                                                </div>
                                                <div className="mt-3 sm:mt-0 flex space-x-2">
                                                    <button
                                                        onClick={() => handleDeleteExperience(exp.experiance_id)}
                                                        className="inline-flex items-center px-3 py-1.5 border border-red-400 text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900 transition-colors text-sm"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <Briefcase className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                                        <p className="mt-2 text-gray-500 dark:text-gray-400">Aucune expérience ajoutée pour l'instant.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeSection === 'cvs' && (
                            <div className="section-content">
                                <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Vos CVs</h2>

                                {/* Upload CV Form */}
                                <form onSubmit={handleUploadCv} className="mb-8 p-6 border border-blue-200 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-gray-700 shadow-inner">
                                    <h3 className="text-xl font-medium mb-4 text-blue-700 dark:text-blue-300">Télécharger un Nouveau CV</h3>
                                    <div className="mb-4">
                                        <label htmlFor="cv_upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Sélectionner un Fichier CV (PDF, DOC, DOCX)
                                        </label>
                                        <input
                                            type="file"
                                            id="cv_upload"
                                            name="cvFile"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleFileChange}
                                            className="block w-full text-sm text-gray-900 dark:text-gray-300
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-md file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-blue-50 file:text-blue-700
                                                hover:file:bg-blue-100 dark:file:bg-gray-800 dark:file:text-blue-300 dark:hover:file:bg-gray-700"
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
                                            disabled={loading}
                                        >
                                            {loading ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2 h-4 w-4" />}
                                            Télécharger le CV
                                        </button>
                                    </div>
                                </form>

                                {/* Existing CVs List */}
                                {talentData.cvs.length > 0 ? (
                                    <div className="space-y-4">
                                        {talentData.cvs.map((cv) => (
                                            <div key={cv.cv_id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 shadow-sm">
                                                <div>
                                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{(cv.cv_path || cv.path || '').split(/[\\/]/).pop()}</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">Téléchargé le: {new Date(cv.upload_date).toLocaleDateString()}</p>
                                                </div>
                                                <div className="mt-3 sm:mt-0 flex space-x-2">
                                                    <a
                                                        href={cv.file_path} // Assuming file_path is the direct URL to the CV
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-4 py-2 border border-blue-400 text-blue-700 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors text-sm"
                                                    >
                                                        <FileSearch className="mr-2 h-4 w-4" />
                                                        Afficher/Télécharger
                                                    </a>
                                                    <button
                                                        onClick={() => handleDeleteCv(cv.cv_id)}
                                                        className="inline-flex items-center px-4 py-2 border border-red-400 text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900 transition-colors text-sm"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                                        <p className="mt-2 text-gray-500 dark:text-gray-400">Aucun CV téléchargé pour l'instant.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default TalentSettings;