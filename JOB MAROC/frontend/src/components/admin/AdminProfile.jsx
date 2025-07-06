import React from 'react';
import { Mail, Phone, MapPin, User, Briefcase, CalendarDays, LogIn, CheckCircle, XCircle, AlertTriangle, ShieldCheck, Navigation, Cake, Landmark, Users, IdCard } from 'lucide-react';

// Fonction utilitaire pour formater les dates (peut être étendue avec une bibliothèque comme date-fns ou moment)
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    // Vérifier si c'est une chaîne de caractères de type LocalDateTime ou un objet Date
    if (typeof dateString === 'string' && dateString.includes('T')) {
      // Gérer la chaîne LocalDateTime du backend Java (format ISO 8601)
      return new Date(dateString).toLocaleDateString('fr-FR', { // Changé en 'fr-FR'
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (dateString instanceof Date) {
      // Gérer directement les objets Date
      return dateString.toLocaleDateString('fr-FR', { // Changé en 'fr-FR'
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else if (typeof dateString === 'string') {
      // Gérer les chaînes de date simples comme "YYYY-MM-DD"
      return new Date(dateString).toLocaleDateString('fr-FR', { // Changé en 'fr-FR'
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return 'Format de date invalide'; // Fallback pour les formats inattendus
  } catch (error) {
    console.error("Erreur lors du formatage de la date :", dateString, error);
    return 'Date invalide';
  }
};

// Fonction utilitaire pour afficher joliment les valeurs booléennes
const formatBoolean = (value) => {
  // Vérifier explicitement pour les booléens true/false
  if (value === true) {
    return <CheckCircle className="text-green-500 inline-block mr-1 h-5 w-5" />;
  } else if (value === false) {
    return <XCircle className="text-red-500 inline-block mr-1 h-5 w-5" />;
  }
  return <span className="text-gray-400">N/A</span>; // Gérer les valeurs null, undefined ou autres
};

// Fonction utilitaire pour afficher le statut avec des icônes
const formatStatus = (status) => {
  if (!status) return 'N/A';
  switch (status.toUpperCase()) {
    case 'WAITING':
      return <span className="flex items-center text-yellow-600 dark:text-yellow-400"><AlertTriangle className="mr-1 h-5 w-5" /> En attente</span>;
    case 'ACCEPTED':
      return <span className="flex items-center text-green-600 dark:text-green-400"><CheckCircle className="mr-1 h-5 w-5" /> Accepté</span>;
    case 'REFUSED': // En supposant qu'un statut REFUSED existe
      return <span className="flex items-center text-red-600 dark:text-red-400"><XCircle className="mr-1 h-5 w-5" /> Refusé</span>;
    default:
      return status; // Afficher la chaîne de statut si elle ne correspond pas aux cas connus
  }
};

// Composant utilitaire pour afficher un seul élément de donnée
const ProfileDataItem = ({ icon: Icon, label, value, valueClassName = "text-gray-700 dark:text-gray-300" }) => {
  // Vérifier si la valeur est nulle, indéfinie ou une chaîne vide après avoir coupé les espaces
  const displayValue = (value === undefined || value === null || (typeof value === 'string' && value.trim() === ''))
    ? <span className="text-gray-400 dark:text-gray-500">N/A</span>
    : value;

  return (
    <div className="flex items-start py-2">
      {Icon && <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-1 flex-shrink-0" />}
      <div className="flex-grow">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        {/* Rendre displayValue directement, appliquer valueClassName */}
        <p className={`text-sm ${valueClassName}`}>{displayValue}</p>
      </div>
    </div>
  );
};

// Le composant principal pour afficher la carte de profil de l'utilisateur
const AdminProfile = ({ user }) => {
  console.log(localStorage.getItem('jwtToken')); // Log de débogage
  // --- Vérification initiale stricte ---
  // Si la prop user est null ou undefined, retourner null immédiatement
  if (!user) {
    console.log("AdminProfileCard: la prop user est null ou undefined, retour de null.");
    return null;
  }
  // --- Fin de la vérification initiale stricte ---

  // Log de débogage : Loguer la prop user et son type lorsque le composant est rendu
  console.log("AdminProfileCard: Rendu.");
  console.log("AdminProfileCard: Prop user reçue :", user);
  console.log("AdminProfileCard: Type de la prop user :", typeof user);

  // Fonction utilitaire pour afficher le sexe
  const getGenderDisplay = (sexe) => {
    if (!sexe) return 'N/A';
    switch (String(sexe).toUpperCase()) { // S'assurer que sexe est traité comme une chaîne
      case 'M': return 'Homme';
      case 'F': return 'Femme';
      case 'O': return 'Autre';
      default: return String(sexe); // Afficher la valeur brute si inconnue
    }
  };

  // Fonction utilitaire pour afficher l'état civil (en supposant que c'est une énumération ou une chaîne)
  const getMaritalStatusDisplay = (status) => {
    if (!status) return 'N/A';
    // En supposant que vos valeurs d'énumération ou vos chaînes sont comme 'SINGLE', 'MARRIED', etc.
    const lowerStatus = String(status).toLowerCase();
    switch (lowerStatus) {
      case 'single': return 'Célibataire';
      case 'married': return 'Marié(e)';
      case 'divorced': return 'Divorcé(e)';
      case 'widowed': return 'Veuf(ve)';
      default: return String(status);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-4 md:p-8 flex justify-center items-start font-sans">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-2xl rounded-lg overflow-hidden">
        {/* En-tête du profil */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8 text-white">
          <div className="flex flex-col md:flex-row items-center">
            {/* Image de profil */}
            <img
              src={user.image_path || `https://placehold.co/120x120/EBF4FF/76A9FA?text=${user.firstName?.charAt(0)}${user.lastName?.charAt(0)}`}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-blue-300 object-cover shadow-lg"
              onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/120x120/EBF4FF/76A9FA?text=${user.firstName?.charAt(0)}${user.lastName?.charAt(0)}`; }}
            />
            {/* Nom de l'utilisateur et rôle */}
            <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold">
                {user.firstName || 'N/A'} {user.lastName || ''}
              </h1>
              <p className="text-lg text-blue-200 dark:text-blue-300 flex items-center justify-center md:justify-start mt-1">
                <Briefcase className="h-5 w-5 mr-2" />
                {/* Accéder en toute sécurité au nom du rôle */}
                {user.role?.role_name || user.role || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Détails du profil */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          {/* Colonne 1 : Informations de contact */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300 border-b-2 border-blue-200 dark:border-blue-700 pb-2 mb-3">Informations de contact</h2>
            <ProfileDataItem icon={Mail} label="Adresse e-mail" value={user.email} />
            <ProfileDataItem icon={Phone} label="Numéro de téléphone" value={user.num_tel} />
            <ProfileDataItem icon={MapPin} label="Adresse" value={user.address} />
          </div>

          {/* Colonne 2 : Détails personnels */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300 border-b-2 border-blue-200 dark:border-blue-700 pb-2 mb-3">Détails personnels</h2>
            <ProfileDataItem icon={Cake} label="Date de naissance" value={formatDate(user.datenais)} />
            <ProfileDataItem icon={Landmark} label="Lieu de naissance" value={user.lieu} />
            <ProfileDataItem icon={User} label="Sexe" value={getGenderDisplay(user.sexe)} />
            <ProfileDataItem icon={Navigation} label="Nationalité" value={user.Nationality} />
            <ProfileDataItem icon={Users} label="Situation familiale" value={getMaritalStatusDisplay(user.situation_familliale)} /> {/* Utiliser l'aide */}
            <ProfileDataItem icon={IdCard} label="CIN / Numéro d'identité" value={user.cin} />
          </div>

          {/* Colonne 3 : Statut du compte */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300 border-b-2 border-blue-200 dark:border-blue-700 pb-2 mb-3">Statut du compte</h2>
            <ProfileDataItem icon={CalendarDays} label="Date d'inscription" value={formatDate(user.registrationDate)} />
            <ProfileDataItem icon={LogIn} label="Dernière connexion" value={formatDate(user.lastLoginDate)} />
            {/* <ProfileDataItem
              icon={user.isActive ? ShieldCheck : AlertTriangle}
              label="Compte actif"
              value={formatBoolean(user.isActive)}
            /> */}
            {/* <ProfileDataItem
              icon={AlertTriangle} // L'icône pourrait nécessiter un ajustement en fonction de la signification du statut
              label="Statut d'acceptation"
              value={formatStatus(user.is_accepted)}
            /> */}
            {/* Afficher conditionnellement la date de suppression */}
            {user.Deletation_Date && (
              <ProfileDataItem icon={CalendarDays} label="Date de suppression" value={formatDate(user.Deletation_Date)} valueClassName="text-red-600 dark:text-red-400 font-medium" />
            )}
          </div>
        </div>

        {/* Optionnel : Pied de page des boutons d'action */}
        {/* <div className="px-6 md:px-8 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 text-right">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out">
            Modifier le profil
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default AdminProfile; // Exporter le composant