import React, { useState, useCallback } from 'react';
import { Api } from '../../services/Api'; // Assurez-vous que ce chemin est correct (votre instance Axios)
import { useNavigate } from 'react-router-dom';
import {
    ChevronsLeft, ChevronsRight, ArrowLeft, User, Mail, Lock, School, GraduationCap, Calendar, MapPin, IdCard, Phone, Briefcase, Building, PlusCircle, Trash2, FileText, ImageIcon, Globe, Users, Star, Loader2
} from 'lucide-react';

// --- Helper Components (StepTitle, InputWithIcon, SelectWithIcon, TextAreaWithIcon) ---
function StepTitle({ title }) {
    return <h3 className="text-xl font-semibold mb-6 text-gray-700 dark:text-gray-200">{title}</h3>;
}

function InputWithIcon({ label, name, type = 'text', icon, value, onChange, required = false, placeholder, accept }) {
    const inputProps = type === 'file'
        ? { type, name, onChange, required, placeholder: placeholder || label, accept }
        : { type, name, value: value || '', onChange, required, placeholder: placeholder || label };

    return (
        <div className="flex flex-col">
            <label htmlFor={name} className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5">{React.cloneElement(icon, { className: "w-5 h-5" })}</div>}
                <input
                    id={name}
                    {...inputProps}
                    className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${type === 'file' ? 'file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-green-600 file:text-white hover:file:bg-green-700 transition file:cursor-pointer cursor-pointer' : ''}`}
                />
            </div>
        </div>
    );
}

function SelectWithIcon({ label, name, icon, value, onChange, required = false, children }) {
    return (
        <div className="flex flex-col">
            <label htmlFor={name} className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5">{React.cloneElement(icon, { className: "w-5 h-5" })}</div>}
                <select
                    id={name}
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    required={required}
                    className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600`}
                >
                    {children}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
        </div>
    );
}

function TextAreaWithIcon({ label, name, icon, value, onChange, required = false, placeholder, rows = 3 }) {
    return (
        <div className="flex flex-col">
            <label htmlFor={name} className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                {icon && <div className="absolute left-3 top-3.5 text-gray-400 h-5 w-5">{React.cloneElement(icon, { className: "w-5 h-5" })}</div>}
                <textarea
                    id={name}
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    required={required}
                    placeholder={placeholder || label}
                    rows={rows}
                    className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none dark:bg-gray-700 dark:text-white dark:border-gray-600`}
                />
            </div>
        </div>
    );
}

// --- Main Component ---
export default function SignupTalent() {
    const TOTAL_STEPS = 6;
    const navigate = useNavigate(); // Hook pour la navigation
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        address: '',
        nationality: '',
        sexe: '',
        datenais: '',
        lieu: '',
        situationFamiliale: '',
        num_tel: '',
        cin: '',
        imageFile: null, // Stores the File object
        cvFile: null,    // Stores the File object
        diplomes: [],
        experiences: [],
        skills: [],
    });

    // --- Loading and Error States ---
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // --- Validation Logic for each step ---
    const validateStep = () => {
        setError(null); // Clear previous errors
        console.log(`[VALIDATION] Validating step ${step}...`);
        switch (step) {
            case 1: // Informations Personnelles
                const requiredFieldsStep1 = ['firstName', 'lastName', 'email', 'datenais', 'lieu', 'cin', 'address', 'nationality', 'sexe', 'situationFamiliale', 'num_tel'];
                for (const field of requiredFieldsStep1) {
                    if (!formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')) {
                        setError(`Veuillez remplir le champ "${labelFromFieldName(field)}" dans 'Informations Personnelles'.`);
                        console.log(`[VALIDATION] Failed: Field "${field}" is empty.`);
                        return false;
                    }
                }
                // Basic email validation
                if (!/\S+@\S+\.\S+/.test(formData.email)) {
                    setError("Veuillez entrer une adresse e-mail valide.");
                    console.log("[VALIDATION] Failed: Invalid email format.");
                    return false;
                }
                console.log("[VALIDATION] Step 1 valid.");
                return true;
            case 2: // Sécurité du Compte
                const requiredFieldsStep2 = ['password', 'confirmPassword'];
                for (const field of requiredFieldsStep2) {
                    if (!formData[field] || formData[field].trim() === '') {
                        setError(`Veuillez remplir le champ "${labelFromFieldName(field)}" dans 'Sécurité du Compte'.`);
                        console.log(`[VALIDATION] Failed: Field "${field}" is empty.`);
                        return false;
                    }
                }
                if (formData.password.length < 6) {
                    setError("Le mot de passe doit contenir au moins 6 caractères.");
                    console.log("[VALIDATION] Failed: Password too short.");
                    return false;
                }
                if (formData.password !== formData.confirmPassword) {
                    setError("Les mots de passe ne correspondent pas.");
                    console.log("[VALIDATION] Failed: Passwords do not match.");
                    return false;
                }
                console.log("[VALIDATION] Step 2 valid.");
                return true;
            case 3: // Diplômes
                // Optional: Add validation if at least one diploma is required, or if individual fields are required for each diploma
                if (formData.diplomes.length === 0) {
                     // Optional: If diplomas are not strictly required, remove this block
                     // setError("Veuillez ajouter au moins un diplôme.");
                     // return false;
                }
                for (const diplome of formData.diplomes) {
                    if (!diplome.diplome_name || !diplome.diplome_etablissement || !diplome.diplome_date_fin) {
                        setError("Veuillez remplir tous les champs requis pour chaque diplôme.");
                        console.log("[VALIDATION] Failed: Missing diploma fields.");
                        return false;
                    }
                }
                console.log("[VALIDATION] Step 3 valid.");
                return true;
            case 4: // Expériences
                // Optional: Add validation for experience fields
                if (formData.experiences.length === 0) {
                     // Optional: If experiences are not strictly required, remove this block
                     // setError("Veuillez ajouter au moins une expérience.");
                     // return false;
                }
                for (const exp of formData.experiences) {
                    if (!exp.company_name || !exp.job_title || !exp.start_date) {
                        setError("Veuillez remplir tous les champs requis pour chaque expérience.");
                        console.log("[VALIDATION] Failed: Missing experience fields.");
                        return false;
                    }
                }
                console.log("[VALIDATION] Step 4 valid.");
                return true;
            case 5: // Compétences
                // Optional: Add validation for skills fields
                if (formData.skills.length === 0) {
                     // Optional: If skills are not strictly required, remove this block
                     // setError("Veuillez ajouter au moins une compétence.");
                     // return false;
                }
                for (const skill of formData.skills) {
                    if (!skill.skill_name || !skill.skillLevel) {
                        setError("Veuillez remplir tous les champs requis pour chaque compétence.");
                        console.log("[VALIDATION] Failed: Missing skill fields.");
                        return false;
                    }
                }
                console.log("[VALIDATION] Step 5 valid.");
                return true;
            case 6: // Documents
                // Example: if CV is mandatory
                if (!formData.cvFile) {
                     setError("Veuillez télécharger votre CV.");
                     console.log("[VALIDATION] Failed: CV file is missing.");
                     return false;
                }
                console.log("[VALIDATION] Step 6 valid.");
                return true;
            default:
                return true;
        }
    };

    // Helper to get a more user-friendly label for error messages
    const labelFromFieldName = (fieldName) => {
        switch(fieldName) {
            case 'firstName': return 'Prénom';
            case 'lastName': return 'Nom de famille';
            case 'email': return 'Email';
            case 'datenais': return 'Date de naissance';
            case 'lieu': return 'Lieu de naissance';
            case 'cin': return 'Numéro CIN';
            case 'address': return 'Adresse';
            case 'nationality': return 'Nationalité';
            case 'sexe': return 'Sexe';
            case 'situationFamiliale': return 'Situation Familiale';
            case 'num_tel': return 'Numéro de Téléphone';
            case 'password': return 'Mot de passe';
            case 'confirmPassword': return 'Confirmer le mot de passe';
            default: return fieldName; // Fallback
        }
    };


    // --- Handlers (nextStep, prevStep, handleChange, handleListChange, addListItem, removeListItem) ---
    const nextStep = () => {
        if (validateStep()) {
            setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
        } else {
            // Scroll to top or show prominent error if validation fails
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

    const handleChange = useCallback((e) => {
        const { name, value, type, files } = e.target;
        setSuccessMessage(null); // Clear success message on change
        setError(null); // Clear error on change

        if (type === 'file') {
            // Store the File object directly in formData state
            setFormData(prev => ({ ...prev, [name]: files[0] || null }));
            console.log(`[FORM CHANGE] File selected for ${name}: ${files[0] ? files[0].name : 'None'}`);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    }, []); // Empty dependency array means this function is created once

    const handleListChange = (listName, index, field, value) => {
        setFormData(prev => {
            const updatedList = [...prev[listName]];
            updatedList[index] = { ...updatedList[index], [field]: value };
            return { ...prev, [listName]: updatedList };
        });
    };

    const addListItem = (listName, newItem) => {
        setFormData(prev => ({
            ...prev,
            [listName]: [...prev[listName], newItem]
        }));
    };

    const removeListItem = (listName, index) => {
        setFormData(prev => ({
            ...prev,
            [listName]: prev[listName].filter((_, i) => i !== index)
        }));
    };

    // --- SIMULATED File Path Generation ---
    // This function now *generates a dummy path* instead of uploading a file.
    // In a real application, you would replace this with an actual API call
    // to your chosen file storage service (e.g., Cloudinary, AWS S3).
    const generateSimulatedFilePath = async (file, uploadType) => {
        if (!file) {
            console.log(`[SIMULATION] No file provided for ${uploadType}. Skipping path generation.`);
            return null;
        }

        console.log(`[SIMULATION] Generating simulated path for ${uploadType}: ${file.name}`);
        // Simulate a network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Generate a plausible, but dummy, URL/path
        const baseStorageUrl = "https://example.com/uploads"; // <<< CHANGE THIS to your actual external storage base URL
        const fileName = encodeURIComponent(file.name.replace(/\s/g, '_')); // Basic sanitization
        const simulatedPath = `${baseStorageUrl}/${uploadType}s/${Date.now()}_${fileName}`;
        
        console.log(`[SIMULATION] Simulated ${uploadType} path generated: ${simulatedPath}`);
        return simulatedPath;
    };


    // --- Submit Handler ---
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
        setError(null); // Clear previous errors
        setSuccessMessage(null);

        console.log("[SUBMISSION] Submit button clicked. Initiating final validation...");

        // Final validation before submission (for the very last step)
        if (!validateStep()) {
            console.log("[SUBMISSION] Final form validation failed. Stopping submission.");
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top to show error
            return;
        }

        setIsLoading(true); // Show loading spinner
        console.log("[SUBMISSION] Validation successful. Starting submission process...");

        try {
            // --- Step 1: Generate simulated file paths ---
            // These calls are only made during the final handleSubmit.
            console.log("[SUBMISSION] Attempting to generate simulated file paths...");
            const [imagePath, cvPath] = await Promise.all([
                generateSimulatedFilePath(formData.imageFile, 'image'),
                generateSimulatedFilePath(formData.cvFile, 'cv')
            ]);
            console.log("[SUBMISSION] Simulated file paths generated. Image path:", imagePath, "CV path:", cvPath);

            // --- Step 2: Construct the JSON Payload for /add endpoint ---
            // Ensure payload structure matches your backend's expected 'talent' object
            const payload = {
                user_id: { // Matches userEntity structure expected by backend
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    password: formData.password, // Password sent in plain text to backend for hashing
                    address: formData.address,
                    nationality: formData.nationality,
                    sexe: formData.sexe,
                    datenais: formData.datenais,
                    lieu: formData.lieu,
                    situation_familliale: formData.situationFamiliale, // Corrected to match backend field name
                    num_tel: formData.num_tel,
                    cin: formData.cin,
                    image_path: imagePath || null, // Pass the generated image path or null
                },
                cv_path: cvPath || null, // Pass the generated CV path or null, directly on talent
                diplomeList: formData.diplomes.map(d => ({
                    diplome_name: d.diplome_name,
                    diplome_description: d.diplome_description || null,
                    diplome_date_debut: d.diplome_date_debut || null,
                    diplome_date_fin: d.diplome_date_fin || null,
                    diplome_etablissement: d.diplome_etablissement,
                })),
                skillsList: formData.skills.map(s => ({
                    skill_name: s.skill_name,
                    skillLevel: s.skillLevel ? parseInt(s.skillLevel, 10) : 0,
                    skill_description: s.skill_description || null,
                })),
                experianceList: formData.experiences.map(e => ({
                    company_name: e.company_name,
                    job_title: e.job_title,
                    start_date: e.start_date || null,
                    end_date: e.end_date || null,
                    description: e.description || null,
                })),
            };

            console.log("[SUBMISSION] Sending Payload to talent/add:", JSON.stringify(payload, null, 2));

            // --- Step 3: Make the API call to /talent/add ---
            // Use Api.post for the main JSON payload
            const response = await Api.post('/talent/add', payload); // Axios instance

            if (response.status === 200 || response.status === 201) { // Check for HTTP 200 OK or 201 Created status
                setSuccessMessage("Inscription réussie ! Vous serez redirigé pour l'approbation.");
                console.log("[SUBMISSION] Talent registration successful (HTTP 200/201).");
                
                // Clear form data after successful submission (optional, if you want form to be empty after redirect)
                setFormData({
                    firstName: '', lastName: '', email: '', password: '', confirmPassword: '', datenais: '', lieu: '', cin: '', address: '', nationality: '', sexe: '', situationFamiliale: '', num_tel: '',
                    imageFile: null, cvFile: null, diplomes: [], experiences: [], skills: [],
                });
                setStep(1); // Go back to the first step

                // Redirection après un court délai pour que l'utilisateur lise le message de succès
                setTimeout(() => {
                    navigate('/login', { state: { email: payload.user_id.email } }); // Pass email to pending page
                }, 2000);
                
            } else {
                // Axios typically throws for 4xx/5xx, but good to double-check
                const errorData = response.data; // Axios puts error response body here
                console.error("[SUBMISSION ERROR] Unexpected API response status or error body:", response.status, errorData);
                setErrorMessage(errorData.message || `Une erreur inattendue est survenue lors de l'inscription. (Code: ${response.status})`);
            }
        } catch (submissionError) {
            console.error("[SUBMISSION ERROR] Talent registration failed during API call or simulated path generation:", submissionError);
            const apiErrorMessage = submissionError.response?.data?.message || submissionError.message || "Une erreur inconnue est survenue.";
            setErrorMessage(`L'inscription a échoué : ${apiErrorMessage}`);
        } finally {
            setIsLoading(false); // Hide loading spinner
            console.log("[SUBMISSION] Submission process finished.");
        }
    };

    // --- Render Logic ---
    const renderStep = () => {
        switch (step) {
            case 1: // Informations Personnelles
                return (
                    <>
                        <StepTitle title="Informations Personnelles" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputWithIcon label="Prénom" name="firstName" icon={<User />} value={formData.firstName} onChange={handleChange} required placeholder="Ex: Jean" />
                            <InputWithIcon label="Nom de famille" name="lastName" icon={<User />} value={formData.lastName} onChange={handleChange} required placeholder="Ex: Dupont" />
                            <InputWithIcon label="Email" name="email" type="email" icon={<Mail />} value={formData.email} onChange={handleChange} required placeholder="Ex: jean.dupont@example.com" />
                            <InputWithIcon label="Date de naissance" name="datenais" type="date" icon={<Calendar />} value={formData.datenais} onChange={handleChange} required placeholder="JJ/MM/AAAA" />
                            <InputWithIcon label="Lieu de naissance" name="lieu" icon={<MapPin />} value={formData.lieu} onChange={handleChange} required placeholder="Ex: Paris" />
                            <InputWithIcon label="Numéro CIN" name="cin" icon={<IdCard />} value={formData.cin} onChange={handleChange} required placeholder="Ex: AB123456" />
                            <InputWithIcon label="Adresse" name="address" icon={<MapPin />} value={formData.address} onChange={handleChange} required placeholder="Ex: 123 Rue de la Paix" />
                            <InputWithIcon label="Nationalité" name="nationality" icon={<Globe />} value={formData.nationality} onChange={handleChange} required placeholder="Ex: Française" />
                            <SelectWithIcon label="Sexe" name="sexe" icon={<Users />} value={formData.sexe} onChange={handleChange} required>
                                <option value="">Sélectionner...</option>
                                <option value="M">Masculin</option>
                                <option value="F">Féminin</option>
                            </SelectWithIcon>
                            <SelectWithIcon label="Situation Familiale" name="situationFamiliale" icon={<Users />} value={formData.situationFamiliale} onChange={handleChange} required>
                                <option value="">Sélectionner...</option>
                                <option value="SINGLE">Célibataire</option>
                                <option value="MARRIED">Marié(e)</option>
                                <option value="DIVORCED">Divorcé(e)</option>
                                <option value="WIDOWED">Veuf/Veuve</option>
                            </SelectWithIcon>
                            <InputWithIcon label="Numéro de Téléphone" name="num_tel" type="tel" icon={<Phone />} value={formData.num_tel} onChange={handleChange} required placeholder="Ex: +33 6 12 34 56 78" />
                        </div>
                    </>
                );
            case 2: // Sécurité du Compte
                return (
                    <>
                        <StepTitle title="Sécurité du Compte" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputWithIcon label="Mot de passe" name="password" type="password" icon={<Lock />} value={formData.password} onChange={handleChange} required placeholder="Minimum 6 caractères" />
                            <InputWithIcon label="Confirmer le mot de passe" name="confirmPassword" type="password" icon={<Lock />} value={formData.confirmPassword} onChange={handleChange} required placeholder="Entrez à nouveau le mot de passe" />
                        </div>
                        {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                            <p className="text-red-500 text-sm mt-2">Les mots de passe ne correspondent pas.</p>
                        )}
                        {formData.password && formData.password.length < 6 && (
                            <p className="text-red-500 text-sm mt-2">Le mot de passe doit contenir au moins 6 caractères.</p>
                        )}
                    </>
                );
            case 3: // Diplômes
                return (
                    <>
                        <StepTitle title="Diplômes et Éducation" />
                        {formData.diplomes.map((diplome, index) => (
                            <div key={index} className="mb-6 p-4 border rounded-lg relative bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                                <button type="button" onClick={() => removeListItem('diplomes', index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700" aria-label="Supprimer ce diplôme"> <Trash2 size={18} /> </button>
                                <h4 className="text-md font-semibold mb-3 text-gray-600 dark:text-gray-300">Diplôme #{index + 1}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputWithIcon label="Nom du Diplôme/Cours" name={`diplome_name_${index}`} icon={<GraduationCap />} value={diplome.diplome_name} onChange={(e) => handleListChange('diplomes', index, 'diplome_name', e.target.value)} required placeholder="Ex: Licence en Informatique" />
                                    <InputWithIcon label="Établissement" name={`diplome_etablissement_${index}`} icon={<School />} value={diplome.diplome_etablissement} onChange={(e) => handleListChange('diplomes', index, 'diplome_etablissement', e.target.value)} required placeholder="Ex: Université Paris-Saclay" />
                                    <InputWithIcon label="Date de début" name={`diplome_date_debut_${index}`} type="month" icon={<Calendar />} value={diplome.diplome_date_debut} onChange={(e) => handleListChange('diplomes', index, 'diplome_date_debut', e.target.value)} placeholder="AAAA-MM" />
                                    <InputWithIcon label="Date de fin (ou prévue)" name={`diplome_date_fin_${index}`} type="month" icon={<Calendar />} value={diplome.diplome_date_fin} onChange={(e) => handleListChange('diplomes', index, 'diplome_date_fin', e.target.value)} placeholder="AAAA-MM" required />
                                    <div className="md:col-span-2">
                                        <TextAreaWithIcon label="Description (facultatif)" name={`diplome_description_${index}`} icon={<FileText size={18} />} value={diplome.diplome_description} onChange={(e) => handleListChange('diplomes', index, 'diplome_description', e.target.value)} rows={2} placeholder="Description des cours, projets..." />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={() => addListItem('diplomes', { diplome_name: '', diplome_description: '', diplome_date_debut: '', diplome_date_fin: '', diplome_etablissement: '' })} className="mt-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition inline-flex items-center"> <PlusCircle size={18} className="mr-1" /> Ajouter un Diplôme </button>
                    </>
                );
            case 4: // Expériences
                return (
                    <>
                        <StepTitle title="Expérience Professionnelle" />
                        {formData.experiences.map((exp, index) => (
                            <div key={index} className="mb-6 p-4 border rounded-lg relative bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                                <button type="button" onClick={() => removeListItem('experiences', index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700" aria-label="Supprimer cette expérience"> <Trash2 size={18} /> </button>
                                <h4 className="text-md font-semibold mb-3 text-gray-600 dark:text-gray-300">Expérience #{index + 1}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputWithIcon label="Nom de l'Entreprise" name={`company_name_${index}`} icon={<Building />} value={exp.company_name} onChange={(e) => handleListChange('experiences', index, 'company_name', e.target.value)} required placeholder="Ex: Google" />
                                    <InputWithIcon label="Titre du Poste" name={`job_title_${index}`} icon={<Briefcase />} value={exp.job_title} onChange={(e) => handleListChange('experiences', index, 'job_title', e.target.value)} required placeholder="Ex: Développeur Logiciel" />
                                    <InputWithIcon label="Date de début" name={`start_date_${index}`} type="month" icon={<Calendar />} value={exp.start_date} onChange={(e) => handleListChange('experiences', index, 'start_date', e.target.value)} placeholder="AAAA-MM" required />
                                    <InputWithIcon label="Date de fin (laisser vide si actuel)" name={`end_date_${index}`} type="month" icon={<Calendar />} value={exp.end_date} onChange={(e) => handleListChange('experiences', index, 'end_date', e.target.value)} placeholder="AAAA-MM" />
                                    <div className="md:col-span-2">
                                        <TextAreaWithIcon label="Description de la Mission (facultatif)" name={`description_${index}`} icon={<FileText size={18} />} value={exp.description} onChange={(e) => handleListChange('experiences', index, 'description', e.target.value)} rows={3} placeholder="Détaillez vos responsabilités et réalisations" />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={() => addListItem('experiences', { company_name: '', job_title: '', start_date: '', end_date: '', description: '' })} className="mt-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition inline-flex items-center"> <PlusCircle size={18} className="mr-1" /> Ajouter une Expérience </button>
                    </>
                );
            case 5: // Compétences
                return (
                    <>
                        <StepTitle title="Compétences" />
                        {formData.skills.map((skill, index) => (
                            <div key={index} className="mb-6 p-4 border rounded-lg relative bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                                <button type="button" onClick={() => removeListItem('skills', index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700" aria-label="Supprimer cette compétence"> <Trash2 size={18} /> </button>
                                <h4 className="text-md font-semibold mb-3 text-gray-600 dark:text-gray-300">Compétence #{index + 1}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                    <InputWithIcon label="Nom de la Compétence" name={`skill_name_${index}`} icon={<Star />} value={skill.skill_name} onChange={(e) => handleListChange('skills', index, 'skill_name', e.target.value)} required placeholder="Ex: JavaScript" />
                                    <SelectWithIcon label="Niveau (0-5)" name={`skillLevel_${index}`} icon={<Star />} value={skill.skillLevel} onChange={(e) => handleListChange('skills', index, 'skillLevel', e.target.value)} required>
                                        <option value="">...</option>
                                        <option value="0">0 - Débutant</option>
                                        <option value="1">1</option>
                                        <option value="2">2 - Intermédiaire</option>
                                        <option value="3">3</option>
                                        <option value="4">4 - Avancé</option>
                                        <option value="5">5 - Expert</option>
                                    </SelectWithIcon>
                                    <div className="md:col-span-3">
                                        <TextAreaWithIcon label="Description (facultatif)" name={`skill_description_${index}`} icon={<FileText size={18} />} value={skill.skill_description} onChange={(e) => handleListChange('skills', index, 'skill_description', e.target.value)} rows={1} placeholder="Ex: Développement web full-stack, APIs RESTful" />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={() => addListItem('skills', { skill_name: '', skillLevel: '', skill_description: '' })} className="mt-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition inline-flex items-center"> <PlusCircle size={18} className="mr-1" /> Ajouter une Compétence </button>
                    </>
                );
            case 6: // Documents
                return (
                    <>
                        <StepTitle title="Documents" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputWithIcon label="Photo de Profil (facultatif)" name="imageFile" type="file" icon={<ImageIcon />} onChange={handleChange} accept="image/png, image/jpeg, image/jpg" />
                            <InputWithIcon label="CV (PDF, DOCX)" name="cvFile" type="file" icon={<FileText />} onChange={handleChange} accept=".pdf,.doc,.docx" required />
                        </div>
                        <div className="mt-4 space-y-2 text-gray-600 dark:text-gray-300">
                            {formData.imageFile && <p className="text-sm">Photo sélectionnée : {formData.imageFile.name}</p>}
                            {formData.cvFile && <p className="text-sm">CV sélectionné : {formData.cvFile.name}</p>}
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
                    <button type="button" onClick={() => navigate('/')} className="flex items-center text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition self-start sm:self-center"> <ArrowLeft className="h-5 w-5 mr-2" /> <span className="text-sm font-medium">Retour</span> </button>
                    <div className="flex items-center">
                        <div className="flex space-x-2">
                            {[...Array(TOTAL_STEPS).keys()].map((num) => (
                                <div key={num + 1} className={`w-3 h-3 rounded-full ${step >= (num + 1) ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}`} />
                            ))}
                        </div>
                        <span className="ml-3 text-green-600 dark:text-green-400 font-bold text-sm">Étape {step} sur {TOTAL_STEPS}</span>
                    </div>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-10 text-gray-800 dark:text-white">
                    Inscription Talent
                </h2>

                {/* Display Success/Error Messages */}
                {successMessage && (
                    <div className="mb-4 p-4 text-sm text-green-700 bg-green-100 dark:bg-green-900/30 rounded-lg" role="alert">
                        {successMessage}
                    </div>
                )}
                {error && (
                    <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 dark:bg-red-900/30 rounded-lg" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-10 min-h-[300px]">
                        {renderStep()}
                    </div>

                    {/* Navigation Buttons */}
                    <div className={`flex ${step > 1 ? 'justify-between' : 'justify-end'} items-center`}>
                        {step > 1 && (
                            <button type="button" onClick={prevStep} disabled={isLoading} className="px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium transition inline-flex items-center disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300">
                                <ChevronsLeft size={18} className="inline-block mr-1" /> Précédent
                            </button>
                        )}

                        {isLoading && <span className="text-sm text-gray-500 dark:text-gray-400">Envoi en cours...</span>}

                        {step < TOTAL_STEPS ? (
                            <button type="button" onClick={nextStep} disabled={isLoading} className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
                                Suivant <ChevronsRight size={18} className="inline-block ml-1" />
                            </button>
                        ) : (
                            <button type="submit" disabled={isLoading} className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
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
