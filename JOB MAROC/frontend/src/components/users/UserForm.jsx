// src/components/users/StyledUserFormModal.jsx

import React, { useState, useEffect } from 'react';

import { X, User, Mail, Phone, MapPin, Briefcase, CalendarDays, Cake, Landmark, Navigation, Users as UsersIcon, ShieldCheck, AlertTriangle, FileText } from 'lucide-react'; // Importation des icônes Lucide


// Définition des listes prédéfinies pour les rôles, statuts matrimoniaux et statuts d'acceptation
// Ces listes peuvent être récupérées du backend si elles sont dynamiques
const predefinedRoles = [
    { name: 'ADMIN', label: 'Administrateur' },
    { name: 'TALENT', label: 'Talent' },
    { name: 'MANAGER', label: 'Manager' },
    // Ajouter d'autres rôles si nécessaire
];

const maritalStatuses = [
    { name: 'SINGLE', label: 'Célibataire' },
    { name: 'MARRIED', label: 'Marié(e)' },
    { name: 'DIVORCED', label: 'Divorcé(e)' },
    { name: 'WIDOWED', label: 'Veuf(ve)' },
    // Ajouter d'autres statuts
];

const acceptanceStatuses = [
     { name: 'WAITING', label: 'En Attente' },
     { name: 'ACCEPTED', label: 'Accepté' },
     { name: 'REJECTED', label: 'Rejeté' },
     // Ajouter d'autres statuts
];

// Fonction utilitaire pour formater les dates pour les champs input (YYYY-MM-DD)
const formatDateForInput = (dateValue) => {
    if (!dateValue) return '';
    try {
        const date = new Date(dateValue);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Le mois est basé sur 0
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error("Erreur lors du formatage de la date pour l'input :", dateValue, error);
        return '';
    }
};

const UserFormModal = ({ user, onSave, onCancel }) => {
    // État pour contenir les données du formulaire, initialisé avec l'utilisateur pour l'édition ou vide pour l'ajout
    const [formData, setFormData] = useState({
        userId: user?.userId || null, // Conserver userId pour les mises à jour
        email: user?.email || '',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        // Le mot de passe n'est généralement pas édité directement dans un formulaire utilisateur pour des raisons de sécurité.
        // Si vous ajoutez un nouvel utilisateur, la gestion du mot de passe peut être différente.
        // password: user?.password || 'talent', // Éviter de pré-remplir les mots de passe
        role: user?.role?.role_name || '', // Stocker uniquement le nom du rôle en chaîne de caractères
        address: user?.address || '',
        Nationality: user?.Nationality || '',
        sexe: user?.sexe || '', // Caractère ou chaîne 'M', 'F', 'O'
        datenais: formatDateForInput(user?.datenais), // Formater la date pour input type="date"
        lieu: user?.lieu || '',
        situation_familliale: user?.situation_familliale || '', // Valeur d'énumération en chaîne de caractères
        num_tel: user?.num_tel || '',
        image_path: user?.image_path || '', // URL ou chemin
        is_accepted: user?.is_accepted || 'WAITING', // Valeur d'énumération en chaîne de caractères, par défaut 'WAITING'
        isActive: user?.isActive ?? true, // Booléen, par défaut true pour les nouveaux utilisateurs
        cin: user?.cin || '',
        // lastLoginDate et registrationDate sont généralement définis par le backend
    });

    // Gérer les changements des inputs
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Gérer la soumission du formulaire
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Soumission des données du formulaire :", formData);

        // Préparer les données pour le backend
        const dataToSave = {
             ...formData,
             // Convertir la chaîne de date en un format attendu par le backend si nécessaire
             // Si votre backend attend un objet Date ou une chaîne ISO, une conversion peut être nécessaire
             // Pour java.util.Date, new Date(formData.datenais) pourrait fonctionner, mais attention aux fuseaux horaires
             // Pour LocalDateTime, l'envoi d'une chaîne ISO comme "YYYY-MM-DDTHH:mm:ss" est courant
             datenais: formData.datenais ? new Date(formData.datenais).toISOString().split('T')[0] : null, // Format YYYY-MM-DD pour la base de données
             // S'assurer que le rôle est envoyé comme un objet avec role_name si c'est ce que le backend attend pour les mises à jour
             role: formData.role ? { role_name: formData.role } : null,
             // S'assurer que les énumérations sont envoyées comme des chaînes de caractères
             situation_familliale: formData.situation_familliale || null,
             is_accepted: formData.is_accepted || null,
             // S'assurer que isActive est envoyé comme un booléen
             isActive: formData.isActive,
             // Supprimer le champ mot de passe si vous ne gérez pas les mises à jour de mot de passe ici
             // ... (supprimer le mot de passe si présent dans formData)
        };

        onSave(dataToSave); // Appeler la fonction onSave avec les données du formulaire
    };

    // Déterminer si nous sommes en mode ajout ou édition
    const isEditing = user !== null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                {/* En-tête de la modale */}
                <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {isEditing ? 'Modifier l\'utilisateur' : 'Ajouter un nouvel utilisateur'}
                    </h3>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                        aria-label="Fermer la modale"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Corps de la modale - Formulaire */}
                <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-150px)]"> {/* Hauteur max et défilement ajoutés */}
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Informations de base */}
                        <div className="md:col-span-2 border-b border-gray-200 dark:border-gray-700 pb-4 mb-2">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Informations de base</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Prénom</label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="Jean"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nom</label>
                                     <div className="relative">
                                        <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="Dupont"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Adresse e-mail</label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="nom@entreprise.com"
                                            required
                                        />
                                    </div>
                                </div>
                                
                            </div>
                        </div>

                        {/* Coordonnées & Détails Personnels */}
                         <div className="md:col-span-2 border-b border-gray-200 dark:border-gray-700 pb-4 mb-2">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Coordonnées & Détails Personnels</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="num_tel" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Numéro de téléphone</label>
                                     <div className="relative">
                                        <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type="text"
                                            id="num_tel"
                                            name="num_tel"
                                            value={formData.num_tel}
                                            onChange={handleChange}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="Ex: +33 6 12 34 56 78"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="address" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Adresse</label>
                                     <div className="relative">
                                        <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type="text"
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="Rue, Ville, Pays"
                                        />
                                    </div>
                                </div>
                                 <div>
                                     <label htmlFor="datenais" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Date de naissance</label>
                                     <div className="relative">
                                        <CalendarDays size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type="date"
                                            id="datenais"
                                            name="datenais"
                                            value={formData.datenais}
                                            onChange={handleChange}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                     <label htmlFor="lieu" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Lieu de naissance</label>
                                     <div className="relative">
                                        <Landmark size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type="text"
                                            id="lieu"
                                            name="lieu"
                                            value={formData.lieu}
                                            onChange={handleChange}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="Ville, Pays"
                                            required
                                        />
                                    </div>
                                </div>
                                 <div>
                                     <label htmlFor="Nationality" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nationalité</label>
                                     <div className="relative">
                                        <Navigation size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type="text"
                                            id="Nationality"
                                            name="Nationality"
                                            value={formData.Nationality}
                                            onChange={handleChange}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="Ex: Français"
                                        />
                                    </div>
                                </div>
                                <div>
                                     <label htmlFor="sexe" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Sexe</label>
                                     <div className="relative">
                                         <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                         <select
                                            id="sexe"
                                            name="sexe"
                                            value={formData.sexe}
                                            onChange={handleChange}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        >
                                            <option value="">Sélectionner le sexe</option>
                                            <option value="M">Masculin</option>
                                            <option value="F">Féminin</option>
                                        </select>
                                     </div>
                                </div>
                                <div>
                                     <label htmlFor="situation_familliale" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Situation familiale</label>
                                     <div className="relative">
                                         <UsersIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                         <select
                                            id="situation_familliale"
                                            name="situation_familliale"
                                            value={formData.situation_familliale}
                                            onChange={handleChange}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        >
                                            <option value="">Sélectionner le statut</option>
                                            {maritalStatuses.map(status => (
                                                <option key={status.name} value={status.name}>{status.label}</option>
                                            ))}
                                        </select>
                                     </div>
                                </div>
                                <div>
                                     <label htmlFor="cin" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">CIN / Numéro d'identité</label>
                                     <div className="relative">
                                         <FileText size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                         <input
                                            type="text"
                                            id="cin"
                                            name="cin"
                                            value={formData.cin}
                                            onChange={handleChange}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="Ex: AB123456"
                                        />
                                     </div>
                                </div>
                                <div>
                                     <label htmlFor="image_path" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">URL de l'image</label>
                                     <div className="relative">
                                        <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type="text" // Ou type="file" si vous gérez les téléchargements de fichiers
                                            id="image_path"
                                            name="image_path"
                                            value={formData.image_path}
                                            onChange={handleChange}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>
                                </div>
                            </div>
                         </div>

                        {/* Statut du compte & Rôle */}
                        <div className="md:col-span-2">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Statut du compte & Rôle</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Rôle</label>
                                    <div className="relative">
                                        <Briefcase size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                        <select
                                            id="role"
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Sélectionner le rôle</option>
                                            {predefinedRoles.map(role => (
                                                <option key={role.name} value={role.name}>{role.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                    </form>
                </div>

                {/* Pied de la modale */}
                <div className="flex items-center p-6 space-x-2 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="submit" // Ce bouton soumettra le formulaire
                        onClick={handleSubmit}
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                        {isEditing ? 'Enregistrer les modifications' : 'Créer l\'utilisateur'}
                    </button>
                    <button
                        onClick={onCancel}
                        className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserFormModal;
