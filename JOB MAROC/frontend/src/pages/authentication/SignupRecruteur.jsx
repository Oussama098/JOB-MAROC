import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importez useNavigate
import {
    User, Mail, Calendar, MapPin, IdCard, Globe, Users, Phone, Lock,
    Building, Briefcase, FileText, ImageIcon, ArrowLeft, ChevronsLeft, ChevronsRight, Loader2,
    PlusCircle, Trash2, Star , CircleDollarSign 
} from 'lucide-react';
import { Api } from '../../services/Api'; // Assurez-vous que ce chemin est correct pour votre projet

// --- Composants utilitaires (pour l'exemple, vous pourriez les avoir dans des fichiers séparés) ---

const StepTitle = ({ title }) => (
    <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b pb-2">
        {title}
    </h3>
);

const InputWithIcon = ({ label, name, type = 'text', icon, value, onChange, required, error, placeholder }) => (
    <div className="relative mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                {icon}
            </div>
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${error ? 'border-red-500' : 'border-gray-300'}`}
                required={required}
                placeholder={placeholder} // <<< Ajouté ici
            />
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

const SelectWithIcon = ({ label, name, icon, value, onChange, children, required, error }) => (
    <div className="relative mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                {icon}
            </div>
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${error ? 'border-red-500' : 'border-gray-300'}`}
                required={required}
            >
                {children}
            </select>
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

const TextAreaWithIcon = ({ label, name, icon, value, onChange, rows = 3, required, error, placeholder }) => (
    <div className="relative mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            <div className="absolute top-3 left-3 flex items-center pointer-events-none text-gray-400">
                {icon}
            </div>
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                rows={rows}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${error ? 'border-red-500' : 'border-gray-300'}`}
                required={required}
                placeholder={placeholder} // <<< Ajouté ici
            ></textarea>
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

// --- Composant principal : SignupManager ---

const TOTAL_STEPS = 3;

export default function SignupManager() {
    const navigate = useNavigate(); // Obtenez la fonction navigate
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // Step 1: Informations Personnelles (Manager UserEntity)
        firstName: '',
        lastName: '',
        email: '',
        password: '', // Temporarily here, moved to step 3 for validation
        confirmPassword: '', // Temporarily here, moved to step 3 for validation
        datenais: '', // YYYY-MM-DD
        lieu: '',
        cin: '',
        address: '',
        nationality: '',
        sexe: '', // 'M' or 'F'
        situationFamiliale: '', // 'SINGLE', 'MARRIED', etc. (from Enum)
        num_tel: '',
        // Step 2: Informations de l'Entreprise
        companyName: '', // nomEntreprise
        companyAddress: '', // adresse
        companyTelephone: '', // telephone
        companyEmail: '', // email de l'entreprise
        companyWebsite: '', // siteWeb
        companyDescription: '', // description
        companyLogoPath: '', // logo
        companySectorActivity: '', // secteurActivite
        companySize: '', // tailleEntreprise
        companyCreationYear: '', // anneeCreation
        companyCountry: '', // pays
        companyCity: '', // ville
        companyPostalCode: '', // codePostal
        companyRegion: '', // region
        companyLegalStatus: '', // statutJuridique
        companySirenNumber: '', // numeroSiren
        companySiretNumber: '', // numeroSiret
        companyIntraVatNumber: '', // numeroTvaIntra
        companySocialCapital: '', // capitalSocial
        companyLegalForm: '', // formeJuridique
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for the specific field as user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validateStep = () => {
        let newErrors = {};
        let isValid = true;

        if (step === 1) { // Informations Personnelles
            if (!formData.firstName.trim()) { newErrors.firstName = "Le prénom est requis."; isValid = false; }
            if (!formData.lastName.trim()) { newErrors.lastName = "Le nom est requis."; isValid = false; }
            if (!formData.email.trim()) {
                newErrors.email = "L'email est requis."; isValid = false;
            } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = "Format d'email invalide."; isValid = false;
            }
            if (!formData.datenais) { newErrors.datenais = "La date de naissance est requise."; isValid = false; }
            if (!formData.lieu.trim()) { newErrors.lieu = "Le lieu de naissance est requis."; isValid = false; }
            if (!formData.cin.trim()) { newErrors.cin = "Le numéro CIN est requis."; isValid = false; }
            if (!formData.address.trim()) { newErrors.address = "L'adresse est requise."; isValid = false; }
            if (!formData.nationality.trim()) { newErrors.nationality = "La nationalité est requise."; isValid = false; }
            if (!formData.sexe) { newErrors.sexe = "Le sexe est requis."; isValid = false; }
            if (!formData.situationFamiliale) { newErrors.situationFamiliale = "La situation familiale est requise."; isValid = false; }
            if (!formData.num_tel.trim()) { newErrors.num_tel = "Le numéro de téléphone est requis."; isValid = false; }
        } else if (step === 2) { // Informations de l'Entreprise
            if (!formData.companyName.trim()) { newErrors.companyName = "Le nom de l'entreprise est requis."; isValid = false; }
            if (!formData.companyAddress.trim()) { newErrors.companyAddress = "L'adresse de l'entreprise est requise."; isValid = false; }
            if (!formData.companyEmail.trim()) {
                newErrors.companyEmail = "L'email de l'entreprise est requis."; isValid = false;
            } else if (!/\S+@\S+\.\S+/.test(formData.companyEmail)) {
                newErrors.companyEmail = "Format d'email d'entreprise invalide."; isValid = false;
            }
            // Optional validations for other company fields if they become required later
            // if (!formData.companyTelephone.trim()) { newErrors.companyTelephone = "Le téléphone de l'entreprise est requis."; isValid = false; }
            // if (!formData.companySectorActivity.trim()) { newErrors.companySectorActivity = "Le secteur d'activité est requis."; isValid = false; }
        } else if (step === 3) { // Sécurité du Compte
            if (!formData.password.trim()) {
                newErrors.password = "Le mot de passe est requis."; isValid = false;
            } else if (formData.password.length < 6) {
                newErrors.password = "Le mot de passe doit contenir au moins 6 caractères."; isValid = false;
            }
            if (!formData.confirmPassword.trim()) {
                newErrors.confirmPassword = "La confirmation du mot de passe est requise."; isValid = false;
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "Les mots de passe ne correspondent pas."; isValid = false;
            }
        }
        setErrors(newErrors);
        return isValid;
    };

    const nextStep = () => {
        if (validateStep()) {
            setStep(prev => Math.min(prev + 1, TOTAL_STEPS));
        }
    };

    const prevStep = () => {
        setStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');

        if (!validateStep()) { // Final validation for the last step
            return;
        }

        setIsLoading(true);
        try {
            // Payload structure adapted for your backend if it expects nested objects
            const payload = {
                user: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password,
                    datenais: formData.datenais,
                    lieu: formData.lieu,
                    cin: formData.cin,
                    address: formData.address,
                    nationality: formData.nationality,
                    sexe: formData.sexe,
                    situation_familliale: formData.situationFamiliale, // Match backend field name
                    num_tel: formData.num_tel
                    // role_id will be set by backend based on "MANAGER" role
                },
                entreprise: {
                    nomEntreprise: formData.companyName,
                    adresse: formData.companyAddress,
                    telephone: formData.companyTelephone,
                    email: formData.companyEmail,
                    siteWeb: formData.companyWebsite,
                    description: formData.companyDescription,
                    logo: formData.companyLogoPath, // Assuming path, not actual file upload for now
                    secteurActivite: formData.companySectorActivity,
                    tailleEntreprise: formData.companySize,
                    anneeCreation: formData.companyCreationYear,
                    pays: formData.companyCountry,
                    ville: formData.companyCity,
                    codePostal: formData.companyPostalCode,
                    region: formData.companyRegion,
                    statutJuridique: formData.companyLegalStatus,
                    numeroSiren: formData.companySirenNumber,
                    numeroSiret: formData.companySiretNumber,
                    numeroTvaIntra: formData.companyIntraVatNumber,
                    capitalSocial: formData.companySocialCapital,
                    formeJuridique: formData.companyLegalForm,
                }
            };

            const response = await Api.post('/manager/addNew', payload); // Adjust endpoint as per your backend

            if (response.status === 201) { // 201 Created is common for successful resource creation
                setSuccessMessage("Inscription du manager réussie ! Vous serez redirigé pour l'approbation.");
                setFormData({ // Reset form after successful submission
                    firstName: '', lastName: '', email: '', password: '', confirmPassword: '', datenais: '', lieu: '', cin: '', address: '', nationality: '', sexe: '', situationFamiliale: '', num_tel: '',
                    companyName: '', companyAddress: '', companyTelephone: '', companyEmail: '', companyWebsite: '', companyDescription: '', companyLogoPath: '', companySectorActivity: '', companySize: '', companyCreationYear: '', companyCountry: '', companyCity: '', companyPostalCode: '', companyRegion: '', companyLegalStatus: '', companySirenNumber: '', companySiretNumber: '', companyIntraVatNumber: '', companySocialCapital: '', companyLegalForm: '',
                });
                setErrors({});
                setStep(1); // Go back to the first step (optional, can be removed if redirection is immediate)
                
                // Redirection après un court délai pour que l'utilisateur lise le message de succès
                setTimeout(() => {
                    navigate('/pending-approval'); // Redirige vers la page d'approbation
                }, 2000); // Redirige après 2 secondes
                
            } else {
                setErrorMessage("Une erreur inattendue est survenue lors de l'inscription.");
            }
        } catch (error) {
            console.error("Erreur d'inscription du manager:", error);
            const apiError = error.response?.data?.message || "Erreur de connexion au serveur.";
            setErrorMessage(`Échec de l'inscription: ${apiError}`);
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1: // Informations Personnelles (Manager's UserEntity)
                return (
                    <>
                        <StepTitle title="Informations Personnelles du Manager" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputWithIcon label="Prénom" name="firstName" icon={<User size={18} />} value={formData.firstName} onChange={handleChange} required error={errors.firstName} placeholder="Ex: Jean" />
                            <InputWithIcon label="Nom de famille" name="lastName" icon={<User size={18} />} value={formData.lastName} onChange={handleChange} required error={errors.lastName} placeholder="Ex: Dupont" />
                            <InputWithIcon label="Email" name="email" type="email" icon={<Mail size={18} />} value={formData.email} onChange={handleChange} required error={errors.email} placeholder="Ex: jean.dupont@example.com" />
                            <InputWithIcon label="Date de naissance" name="datenais" type="date" icon={<Calendar size={18} />} value={formData.datenais} onChange={handleChange} required error={errors.datenais} placeholder="JJ/MM/AAAA" />
                            <InputWithIcon label="Lieu de naissance" name="lieu" icon={<MapPin size={18} />} value={formData.lieu} onChange={handleChange} required error={errors.lieu} placeholder="Ex: Paris" />
                            <InputWithIcon label="Numéro CIN" name="cin" icon={<IdCard size={18} />} value={formData.cin} onChange={handleChange} required error={errors.cin} placeholder="Ex: AB123456" />
                            <InputWithIcon label="Adresse" name="address" icon={<MapPin size={18} />} value={formData.address} onChange={handleChange} required error={errors.address} placeholder="Ex: 123 Rue de la Paix" />
                            <InputWithIcon label="Nationalité" name="nationality" icon={<Globe size={18} />} value={formData.nationality} onChange={handleChange} required error={errors.nationality} placeholder="Ex: Française" />
                            <SelectWithIcon label="Sexe" name="sexe" icon={<Users size={18} />} value={formData.sexe} onChange={handleChange} required error={errors.sexe}>
                                <option value="">Sélectionner...</option>
                                <option value="M">Masculin</option>
                                <option value="F">Féminin</option>
                            </SelectWithIcon>
                            <SelectWithIcon label="Situation Familiale" name="situationFamiliale" icon={<Users size={18} />} value={formData.situationFamiliale} onChange={handleChange} required error={errors.situationFamiliale}>
                                <option value="">Sélectionner...</option>
                                <option value="SINGLE">Célibataire</option>
                                <option value="MARRIED">Marié(e)</option>
                                <option value="DIVORCED">Divorcé(e)</option>
                                <option value="WIDOWED">Veuf/Veuve</option>
                            </SelectWithIcon>
                            <InputWithIcon label="Numéro de Téléphone" name="num_tel" type="tel" icon={<Phone size={18} />} value={formData.num_tel} onChange={handleChange} required error={errors.num_tel} placeholder="Ex: +33 6 12 34 56 78" />
                        </div>
                    </>
                );
            case 2: // Informations de l'Entreprise
                return (
                    <>
                        <StepTitle title="Informations de l'Entreprise" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputWithIcon label="Nom de l'Entreprise" name="companyName" icon={<Building size={18} />} value={formData.companyName} onChange={handleChange} required error={errors.companyName} placeholder="Ex: Ma Super Entreprise S.A." />
                            <InputWithIcon label="Adresse de l'Entreprise" name="companyAddress" icon={<MapPin size={18} />} value={formData.companyAddress} onChange={handleChange} required error={errors.companyAddress} placeholder="Ex: 456 Avenue des Champs" />
                            <InputWithIcon label="Email de l'Entreprise" name="companyEmail" type="email" icon={<Mail size={18} />} value={formData.companyEmail} onChange={handleChange} required error={errors.companyEmail} placeholder="Ex: contact@masuperentreprise.com" />
                            <InputWithIcon label="Téléphone de l'Entreprise" name="companyTelephone" type="tel" icon={<Phone size={18} />} value={formData.companyTelephone} onChange={handleChange} error={errors.companyTelephone} placeholder="Ex: +33 1 23 45 67 89" />
                            <InputWithIcon label="Site Web" name="companyWebsite" icon={<Globe size={18} />} value={formData.companyWebsite} onChange={handleChange} error={errors.companyWebsite} placeholder="Ex: www.masuperentreprise.com" />
                            <SelectWithIcon label="Secteur d'Activité" name="companySectorActivity" icon={<Briefcase size={18} />} value={formData.companySectorActivity} onChange={handleChange} error={errors.companySectorActivity}>
                                <option value="">Sélectionner...</option>
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
                            </SelectWithIcon>
                            <InputWithIcon label="Taille de l'Entreprise" name="companySize" icon={<Users size={18} />} value={formData.companySize} onChange={handleChange} error={errors.companySize} placeholder="Ex: 50-100 employés" />
                            <InputWithIcon label="Année de Création" name="companyCreationYear" icon={<Calendar size={18} />} value={formData.companyCreationYear} onChange={handleChange} placeholder="AAAA" error={errors.companyCreationYear} />
                            <InputWithIcon label="Pays" name="companyCountry" icon={<Globe size={18} />} value={formData.companyCountry} onChange={handleChange} error={errors.companyCountry} placeholder="Ex: France" />
                            <InputWithIcon label="Ville" name="companyCity" icon={<MapPin size={18} />} value={formData.companyCity} onChange={handleChange} error={errors.companyCity} placeholder="Ex: Marseille" />
                            <InputWithIcon label="Code Postal" name="companyPostalCode" icon={<MapPin size={18} />} value={formData.companyPostalCode} onChange={handleChange} error={errors.companyPostalCode} placeholder="Ex: 13001" />
                            <InputWithIcon label="Région" name="companyRegion" icon={<MapPin size={18} />} value={formData.companyRegion} onChange={handleChange} error={errors.companyRegion} placeholder="Ex: Provence-Alpes-Côte d'Azur" />
                            <InputWithIcon label="Statut Juridique" name="companyLegalStatus" icon={<FileText size={18} />} value={formData.companyLegalStatus} onChange={handleChange} error={errors.companyLegalStatus} placeholder="Ex: Société anonyme" />
                            <InputWithIcon label="Numéro SIREN" name="companySirenNumber" icon={<IdCard size={18} />} value={formData.companySirenNumber} onChange={handleChange} error={errors.companySirenNumber} placeholder="Ex: 123 456 789" />
                            <InputWithIcon label="Numéro SIRET" name="companySiretNumber" icon={<IdCard size={18} />} value={formData.companySiretNumber} onChange={handleChange} error={errors.companySiretNumber} placeholder="Ex: 12345678900014" />
                            <InputWithIcon label="Numéro TVA Intra" name="companyIntraVatNumber" icon={<IdCard size={18} />} value={formData.companyIntraVatNumber} onChange={handleChange} error={errors.companyIntraVatNumber} placeholder="Ex: FR12345678901" />
                            <InputWithIcon label="Capital Social" name="companySocialCapital" icon={<CircleDollarSign size={18} />} value={formData.companySocialCapital} onChange={handleChange} error={errors.companySocialCapital} placeholder="Ex: 100000 €" />
                            <InputWithIcon label="Forme Juridique" name="companyLegalForm" icon={<FileText size={18} />} value={formData.companyLegalForm} onChange={handleChange} error={errors.companyLegalForm} placeholder="Ex: SARL" />
                            <TextAreaWithIcon label="Description de l'Entreprise (facultatif)" name="companyDescription" icon={<FileText size={18} />} value={formData.companyDescription} onChange={handleChange} rows={3} error={errors.companyDescription} placeholder="Décrivez votre entreprise en quelques mots..." />
                            <InputWithIcon label="Chemin du Logo (URL/Path)" name="companyLogoPath" type="text" icon={<ImageIcon size={18} />} value={formData.companyLogoPath} onChange={handleChange} error={errors.companyLogoPath} placeholder="Ex: https://example.com/logo.png" />
                        </div>
                    </>
                );
            case 3: // Sécurité du Compte
                return (
                    <>
                        <StepTitle title="Sécurité du Compte" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputWithIcon label="Mot de passe" name="password" type="password" icon={<Lock size={18} />} value={formData.password} onChange={handleChange} required error={errors.password} placeholder="Minimum 6 caractères" />
                            <InputWithIcon label="Confirmer le mot de passe" name="confirmPassword" type="password" icon={<Lock size={18} />} value={formData.confirmPassword} onChange={handleChange} required error={errors.confirmPassword} placeholder="Entrez à nouveau le mot de passe" />
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 font-sans bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <div className="bg-white dark:bg-gray-800 w-full max-w-5xl p-8 md:p-10 rounded-xl shadow-xl transition-all duration-300 ease-in-out">
                {/* Header with Back button and Step Indicator */}
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    {/* Utiliser navigate('/') pour revenir à la page d'accueil ou de connexion */}
                    <button type="button" onClick={() => navigate('/')} className="flex items-center text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 transition self-start sm:self-center"> <ArrowLeft className="h-5 w-5 mr-2" /> <span className="text-sm font-medium">Retour</span> </button>
                    <div className="flex items-center">
                        <div className="flex space-x-2">
                            {[...Array(TOTAL_STEPS).keys()].map((num) => (
                                <div
                                    key={num + 1}
                                    className={`w-3 h-3 rounded-full ${step >= (num + 1) ? 'bg-sky-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                                />
                            ))}
                        </div>
                        <span className="ml-3 text-sky-600 dark:text-sky-400 font-bold text-sm">Étape {step} sur {TOTAL_STEPS}</span>
                    </div>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-10 text-gray-800 dark:text-white">
                    Inscription Manager
                </h2>

                {/* Display Success/Error Messages */}
                {successMessage && (
                    <div className="mb-4 p-4 text-sm text-green-700 bg-green-100 dark:bg-green-900/30 rounded-lg" role="alert">
                        {successMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 dark:bg-red-900/30 rounded-lg" role="alert">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-10 min-h-[300px]"> {/* Adjusted min-height for content */}
                        {renderStep()}
                    </div>

                    {/* Navigation Buttons */}
                    <div className={`flex ${step > 1 ? 'justify-between' : 'justify-end'} items-center`}>
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={isLoading}
                                className="px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium transition inline-flex items-center disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                            >
                                <ChevronsLeft size={18} className="inline-block mr-1" /> Précédent
                            </button>
                        )}

                        {isLoading && <span className="text-sm text-gray-500 dark:text-gray-400">Envoi en cours...</span>}

                        {step < TOTAL_STEPS ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                disabled={isLoading}
                                className="px-6 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium transition inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Suivant <ChevronsRight size={18} className="inline-block ml-1" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium transition inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin mr-2" />
                                        Enregistrement...
                                    </>
                                ) : (
                                    'Terminer l\'inscription'
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
