import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Api } from '../../services/Api'; // Assurez-vous du chemin correct
import {
    User, Building2, Mail, Phone, MapPin, Briefcase, CalendarDays,
    Info, Settings, Save, Loader2, CheckCircle, AlertTriangle,
    Navigation, Cake, Landmark, Users, IdCard, Earth, Scale, X
} from 'lucide-react';

// Fonctions utilitaires pour le formatage (copiées pour l'autonomie du composant)
const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
        // Handle ISO 8601 string (e.g., "YYYY-MM-DDTHH:MM:SS") or simple "YYYY-MM-DD"
        const date = new Date(dateString);
        if (isNaN(date.getTime())) { // Check for invalid date
            return '';
        }
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error("Error formatting date for input:", dateString, error);
        return '';
    }
};

const getGenderOptions = () => [
    { value: '', label: 'Sélectionner' },
    { value: 'M', label: 'Homme' },
    { value: 'F', label: 'Femme' },
    { value: 'O', label: 'Autre' },
];

const getMaritalStatusOptions = () => [
    { value: '', label: 'Sélectionner' },
    { value: 'SINGLE', label: 'Célibataire' },
    { value: 'MARRIED', label: 'Marié(e)' },
    { value: 'DIVORCED', label: 'Divorcé(e)' },
    { value: 'WIDOWED', label: 'Veuf(ve)' },
];

const getCompanySizeOptions = () => [
    { value: '', label: 'Sélectionner' },
    { value: 'Micro-entreprise', label: 'Micro-entreprise (<10 employés)' },
    { value: 'Petite entreprise', label: 'Petite entreprise (10-49 employés)' },
    { value: 'PME', label: 'PME (50-249 employés)' },
    { value: 'Grande entreprise', label: 'Grande entreprise (250+ employés)' },
];

const getSectorActivityOptions = () => [
    { value: '', label: 'Sélectionner' },
    { value: 'Information Technology', label: 'Technologies de l\'information' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Healthcare', label: 'Santé' },
    { value: 'Education', label: 'Éducation' },
    { value: 'Marketing et Publicité', label: 'Marketing et Publicité' },
    { value: 'Manufacturing', label: 'Fabrication' },
    { value: 'Retail', label: 'Commerce de détail' },
    { value: 'Construction', label: 'Construction' },
    { value: 'Hospitality', label: 'Hôtellerie' },
    { value: 'Automotive / Motorcycles / Cycles', label: 'Automobile / Motocycles / Cycles' },
    { value: 'Recruitment / HR', label: 'Recrutement / RH' },
    { value: 'Logistics / Transport', label: 'Logistique / Transport' },
    { value: 'Consulting', label: 'Conseil' },
    { value: 'Other', label: 'Autre' },
];

const getLegalStatusOptions = () => [
    { value: '', label: 'Sélectionner' },
    { value: 'Société Anonyme', label: 'Société Anonyme (SA)' },
    { value: 'SARL', label: 'SARL' },
    { value: 'SAS', label: 'SAS' },
    { value: 'Auto-entrepreneur', label: 'Auto-entrepreneur' },
    { value: 'Association', label: 'Association' },
    { value: 'Autre', label: 'Autre' },
];

const ManagerSettingsPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('personal');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // State for manager personal details
    const [personalForm, setPersonalForm] = useState({
        userId: null,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        sexe: '',
        datenais: '',
        lieu: '',
        situation_familliale: '',
        cin: '',
        nationality: ''
    });

    // State for company details
    const [companyForm, setCompanyForm] = useState({
        id: null, 
        nomEntreprise: '',
        adresse: '',
        telephone: '',
        email: '', 
        siteWeb: '',
        description: '',
        logo: '',
        secteurActivite: '',
        tailleEntreprise: '',
        anneeCreation: '',
        pays: '',
        ville: '',
        codePostal: '',
        region: '',
        statutJuridique: '',
        numeroSiren: '',
        numeroSiret: '',
        numeroTvaIntra: '',
        capitalSocial: '',
        formeJuridique: '',
    });

    const successTimeoutRef = useRef(null);
    const errorTimeoutRef = useRef(null);
    
    useEffect(() => {
        const fetchManagerData = async () => {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('jwtToken');
            const userName = localStorage.getItem('username'); // Assuming userId is stored here
            if (!token || !userName) {
                navigate('/login', { replace: true });
                setLoading(false);
                return;
            }

            try {
                // Fetch manager details (which includes user and entreprise)
                const response = await Api.get(`/manager/${userName}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const managerData = response.data; 
                console.log("Fetched manager data for settings:", managerData);

                if (managerData && managerData.user) {
                    setPersonalForm({
                        userId: managerData.user.userId || '',
                        firstName: managerData.user.firstName || '',
                        lastName: managerData.user.lastName || '',
                        email: managerData.user.email || '',
                        phone: managerData.user.num_tel || '', // Map num_tel to phone
                        address: managerData.user.address || '',
                        sexe: managerData.user.sexe || '',
                        datenais: formatDateForInput(managerData.user.datenais),
                        lieu: managerData.user.lieu || '',
                        situation_familliale: managerData.user.situation_familliale || '',
                        cin: managerData.user.cin || '',
                        nationality: managerData.user.nationality || ''
                    });
                } else {
                    setError("Données de profil personnel du manager introuvables.");
                }

                if (managerData && managerData.entreprise) {
                    setCompanyForm({
                        id: managerData.entreprise.id || null,
                        nomEntreprise: managerData.entreprise.nomEntreprise || '',
                        adresse: managerData.entreprise.adresse || '',
                        telephone: managerData.entreprise.telephone || '',
                        email: managerData.entreprise.email || '',
                        siteWeb: managerData.entreprise.siteWeb || '',
                        description: managerData.entreprise.description || '',
                        logo: managerData.entreprise.logo || '',
                        secteurActivite: managerData.entreprise.secteurActivite || '',
                        tailleEntreprise: managerData.entreprise.tailleEntreprise || '',
                        anneeCreation: managerData.entreprise.anneeCreation || '',
                        pays: managerData.entreprise.pays || '',
                        ville: managerData.entreprise.ville || '',
                        codePostal: managerData.entreprise.codePostal || '',
                        region: managerData.entreprise.region || '',
                        statutJuridique: managerData.entreprise.statutJuridique || '',
                        numeroSiren: managerData.entreprise.numeroSiren || '',
                        numeroSiret: managerData.entreprise.numeroSiret || '',
                        numeroTvaIntra: managerData.entreprise.numeroTvaIntra || '',
                        capitalSocial: managerData.entreprise.capitalSocial || '',
                        formeJuridique: managerData.entreprise.formeJuridique || '',
                    });
                } else {
                    setError(prev => prev ? prev + " Et données d'entreprise introuvables." : "Données d'entreprise introuvables.");
                }

            } catch (err) {
                console.error("Failed to fetch manager settings data:", err);
                const msg = err.response?.data?.message || err.message || "Erreur lors du chargement des données.";
                setError(msg);
            } finally {
                setLoading(false);
            }
        };

        fetchManagerData();

        // Cleanup for timeouts
        return () => {
            clearTimeout(successTimeoutRef.current);
            clearTimeout(errorTimeoutRef.current);
        };
    }, [navigate]);

    // Handle form field changes
    const handlePersonalChange = (e) => {
        const { name, value } = e.target;
        setPersonalForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCompanyChange = (e) => {
        const { name, value } = e.target;
        setCompanyForm(prev => ({ ...prev, [name]: value }));
    };

    // Show message utility
    const showMessage = (type, message) => {
        if (type === 'success') {
            setSuccessMessage(message);
            clearTimeout(successTimeoutRef.current);
            successTimeoutRef.current = setTimeout(() => setSuccessMessage(null), 5000);
        } else {
            setError(message);
            clearTimeout(errorTimeoutRef.current);
            errorTimeoutRef.current = setTimeout(() => setError(null), 7000);
        }
    };

    // Handle form submissions
    const handleSubmitPersonal = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        const token = localStorage.getItem('jwtToken');

        const userDataToUpdate = {
            userId: personalForm.userId,
            firstName: personalForm.firstName,
            lastName: personalForm.lastName,
            email: personalForm.email,
            num_tel: personalForm.phone, // Map back to num_tel for backend
            address: personalForm.address,
            sexe: personalForm.sexe,
            datenais: personalForm.datenais,
            lieu: personalForm.lieu,
            situation_familliale: personalForm.situation_familliale,
            cin: personalForm.cin,
            nationality: personalForm.nationality
        };

        try {
            const response = await Api.put(`/manager/update`, userDataToUpdate, { // Assuming this endpoint handles user updates
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status >= 200 && response.status < 300) {
                showMessage('success', 'Informations personnelles mises à jour avec succès !');
                // Potentiellement re-fetch manager data to ensure state consistency
                // fetchManagerData(); 
            } else {
                showMessage('error', 'Échec de la mise à jour des informations personnelles.');
            }
        } catch (err) {
            console.error("Error updating personal info:", err);
            showMessage('error', err.response?.data?.message || err.message || 'Erreur réseau lors de la mise à jour des informations personnelles.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitCompany = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        const token = localStorage.getItem('jwtToken');
        const username = localStorage.getItem('username');

        const companyDataToUpdate = {
            ...companyForm,
        };

        try {
            const response = await Api.put(`/manager/entreprise/update/${username}`, companyDataToUpdate, { // Assuming this endpoint handles entreprise updates
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status >= 200 && response.status < 300) {
                showMessage('success', 'Informations de l\'entreprise mises à jour avec succès !');
                // Potentiellement re-fetch manager data to ensure state consistency
                // fetchManagerData();
            } else {
                showMessage('error', 'Échec de la mise à jour des informations de l\'entreprise.');
            }
        } catch (err) {
            console.error("Error updating company info:", err);
            showMessage('error', err.response?.data?.message || err.message || 'Erreur réseau lors de la mise à jour des informations de l\'entreprise.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 bg-opacity-75 z-[100]">
                <div className="flex flex-col items-center justify-center text-center text-slate-600 dark:text-slate-400 py-10">
                    <Loader2 size={48} className="animate-spin mb-4 text-blue-500" />
                    <p className="text-xl font-medium">Chargement des paramètres...</p>
                    <p>Veuillez patienter un instant.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 font-sans transition-colors duration-300">
            <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8">
                <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                        <Settings size={28} className="mr-3 text-blue-600 dark:text-blue-400" /> Paramètres du Profil
                    </h1>
                </div>

                {/* Messages de statut */}
                {successMessage && (
                    <div className="flex items-center p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-900 dark:text-green-300 animate-fadeInOut" role="alert">
                        <CheckCircle size={20} className="mr-3" />
                        <span className="font-medium">{successMessage}</span>
                        <button onClick={() => setSuccessMessage(null)} className="ml-auto text-green-700 dark:text-green-300 hover:opacity-75"><X size={16}/></button>
                    </div>
                )}
                {error && (
                    <div className="flex items-center p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-300 animate-fadeInOut" role="alert">
                        <AlertTriangle size={20} className="mr-3" />
                        <span className="font-medium">{error}</span>
                        <button onClick={() => setError(null)} className="ml-auto text-red-700 dark:text-red-300 hover:opacity-75"><X size={16}/></button>
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
                    <button
                        className={`py-3 px-6 text-lg font-semibold rounded-t-lg transition-colors duration-200 ${
                            activeTab === 'personal'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => setActiveTab('personal')}
                    >
                        <User className="inline-block mr-2" size={20} /> Informations Personnelles
                    </button>
                    <button
                        className={`py-3 px-6 text-lg font-semibold rounded-t-lg transition-colors duration-200 ${
                            activeTab === 'company'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => setActiveTab('company')}
                    >
                        <Building2 className="inline-block mr-2" size={20} /> Détails de l'Entreprise
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'personal' && (
                    <form onSubmit={handleSubmitPersonal} className="space-y-6 animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Prénom" name="firstName" value={personalForm.firstName} onChange={handlePersonalChange} icon={User} required />
                            <InputField label="Nom" name="lastName" value={personalForm.lastName} onChange={handlePersonalChange} icon={User} required />
                            <InputField label="Email" name="email" value={personalForm.email} onChange={handlePersonalChange} icon={Mail} type="email" required />
                            <InputField label="Téléphone" name="phone" value={personalForm.phone} onChange={handlePersonalChange} icon={Phone} type="tel" />
                            <InputField label="Adresse" name="address" value={personalForm.address} onChange={handlePersonalChange} icon={MapPin} />
                            <SelectField label="Sexe" name="sexe" value={personalForm.sexe} onChange={handlePersonalChange} icon={User} options={getGenderOptions()} />
                            <InputField label="Date de naissance" name="datenais" value={personalForm.datenais} onChange={handlePersonalChange} icon={CalendarDays} type="date" />
                            <InputField label="Lieu de naissance" name="lieu" value={personalForm.lieu} onChange={handlePersonalChange} icon={Landmark} />
                            <SelectField label="Situation Familiale" name="situation_familliale" value={personalForm.situation_familliale} onChange={handlePersonalChange} icon={Users} options={getMaritalStatusOptions()} />
                            <InputField label="CIN / Numéro d'identité" name="cin" value={personalForm.cin} onChange={handlePersonalChange} icon={IdCard} />
                            <InputField label="Nationalité" name="nationality" value={personalForm.nationality} onChange={handlePersonalChange} icon={Navigation} />
                        </div>
                        <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                            <SubmitButton isLoading={loading}>
                                <Save size={20} className="mr-2" /> Enregistrer les informations personnelles
                            </SubmitButton>
                        </div>
                    </form>
                )}

                {activeTab === 'company' && (
                    <form onSubmit={handleSubmitCompany} className="space-y-6 animate-fadeIn">
                        {companyForm.id ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Nom de l'entreprise" name="nomEntreprise" value={companyForm.nomEntreprise} onChange={handleCompanyChange} icon={Building2} required />
                                <InputField label="Adresse" name="adresse" value={companyForm.adresse} onChange={handleCompanyChange} icon={MapPin} />
                                <InputField label="Téléphone" name="telephone" value={companyForm.telephone} onChange={handleCompanyChange} icon={Phone} type="tel" />
                                <InputField label="Email de l'entreprise" name="email" value={companyForm.email} onChange={handleCompanyChange} icon={Mail} type="email" />
                                <InputField label="Site Web" name="siteWeb" value={companyForm.siteWeb} onChange={handleCompanyChange} icon={Earth} />
                                <TextAreaField label="Description" name="description" value={companyForm.description} onChange={handleCompanyChange} icon={Info} rows={3} />
                                <InputField label="Logo URL" name="logo" value={companyForm.logo} onChange={handleCompanyChange} icon={Building2} />
                                <SelectField label="Secteur d'Activité" name="secteurActivite" value={companyForm.secteurActivite} onChange={handleCompanyChange} icon={Briefcase} options={getSectorActivityOptions()} />
                                <SelectField label="Taille de l'Entreprise" name="tailleEntreprise" value={companyForm.tailleEntreprise} onChange={handleCompanyChange} icon={Users} options={getCompanySizeOptions()} />
                                <InputField label="Année de Création" name="anneeCreation" value={companyForm.anneeCreation} onChange={handleCompanyChange} icon={CalendarDays} type="number" />
                                <InputField label="Pays" name="pays" value={companyForm.pays} onChange={handleCompanyChange} icon={MapPin} />
                                <InputField label="Ville" name="ville" value={companyForm.ville} onChange={handleCompanyChange} icon={MapPin} />
                                <InputField label="Code Postal" name="codePostal" value={companyForm.codePostal} onChange={handleCompanyChange} icon={MapPin} />
                                <InputField label="Région" name="region" value={companyForm.region} onChange={handleCompanyChange} icon={MapPin} />
                                <SelectField label="Statut Juridique" name="statutJuridique" value={companyForm.statutJuridique} onChange={handleCompanyChange} icon={Scale} options={getLegalStatusOptions()} />
                                <InputField label="Forme Juridique" name="formeJuridique" value={companyForm.formeJuridique} onChange={handleCompanyChange} icon={Scale} />
                                <InputField label="Numéro SIREN" name="numeroSiren" value={companyForm.numeroSiren} onChange={handleCompanyChange} icon={IdCard} />
                                <InputField label="Numéro SIRET" name="numeroSiret" value={companyForm.numeroSiret} onChange={handleCompanyChange} icon={IdCard} />
                                <InputField label="Numéro TVA Intracommunautaire" name="numeroTvaIntra" value={companyForm.numeroTvaIntra} onChange={handleCompanyChange} icon={IdCard} />
                                <InputField label="Capital Social" name="capitalSocial" value={companyForm.capitalSocial} onChange={handleCompanyChange} icon={Scale} />
                            </div>
                        ) : (
                            <div className="text-center text-gray-600 dark:text-gray-400 p-8 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center">
                                <Info size={32} className="mb-4 text-blue-500" />
                                <p className="text-lg font-medium">Aucune entreprise associée à ce manager.</p>
                                <p className="text-sm">Veuillez contacter l'administrateur pour associer une entreprise.</p>
                            </div>
                        )}
                        {companyForm.id && (
                            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                                <SubmitButton isLoading={loading}>
                                    <Save size={20} className="mr-2" /> Enregistrer les détails de l'entreprise
                                </SubmitButton>
                            </div>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
};

// --- Composants réutilisables pour les champs de formulaire ---

const InputField = ({ label, name, value, onChange, icon: Icon, type = 'text', required = false, rows = 1 }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative rounded-md shadow-sm">
            {Icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
            )}
            <input
                type={type}
                name={name}
                id={name}
                value={value}
                onChange={onChange}
                required={required}
                className={`block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white
                           focus:border-blue-500 focus:ring-blue-500 sm:text-sm pl-10 pr-3 py-2
                           ${Icon ? 'pl-10' : 'pl-3'}`}
                placeholder={`Entrez ${label.toLowerCase()}`}
            />
        </div>
    </div>
);

const TextAreaField = ({ label, name, value, onChange, icon: Icon, required = false, rows = 3 }) => (
    <div className="md:col-span-2"> {/* Span full width in grid */}
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative rounded-md shadow-sm">
            {Icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 top-3 flex items-center pl-3"> {/* Align icon to top */}
                    <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
            )}
            <textarea
                name={name}
                id={name}
                value={value}
                onChange={onChange}
                required={required}
                rows={rows}
                className={`block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white
                           focus:border-blue-500 focus:ring-blue-500 sm:text-sm resize-y
                           ${Icon ? 'pl-10' : 'pl-3'}`}
                placeholder={`Entrez ${label.toLowerCase()}`}
            ></textarea>
        </div>
    </div>
);


const SelectField = ({ label, name, value, onChange, icon: Icon, options, required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative rounded-md shadow-sm">
            {Icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
            )}
            <select
                name={name}
                id={name}
                value={value}
                onChange={onChange}
                required={required}
                className={`block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white
                           focus:border-blue-500 focus:ring-blue-500 sm:text-sm pr-10 py-2
                           ${Icon ? 'pl-10' : 'pl-3'} appearance-none`} // appearance-none to allow custom arrow
            >
                {options.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
            {/* Custom arrow for select field */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </div>
        </div>
    </div>
);

const SubmitButton = ({ children, isLoading }) => (
    <button
        type="submit"
        disabled={isLoading}
        className={`inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white
                   bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2
                   focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-all duration-300 shadow-md hover:shadow-lg
                   ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
        {isLoading ? <Loader2 size={20} className="mr-2 animate-spin" /> : children}
    </button>
);

export default ManagerSettingsPage;
