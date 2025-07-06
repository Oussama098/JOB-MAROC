import React, { useState } from 'react';
import { Mail, Phone, MapPin, User, Briefcase, CalendarDays, LogIn, CheckCircle, XCircle, AlertTriangle, ShieldCheck, Navigation, Cake, Landmark, Users, IdCard, Building2, Earth, Scale, Info, Settings } from 'lucide-react'; // Importez l'icône Settings
import { useNavigate } from 'react-router-dom';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    if (typeof dateString === 'string' && dateString.includes('T')) {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (dateString instanceof Date) {
      return dateString.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else if (typeof dateString === 'string') {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return 'Format de date invalide';
  } catch (error) {
    console.error("Erreur lors du formatage de la date :", dateString, error);
    return 'Date invalide';
  }
};

// Fonction utilitaire pour afficher joliment les valeurs booléennes
const formatBoolean = (value) => {
  if (value === true) {
    return <CheckCircle className="text-green-500 inline-block mr-1 h-5 w-5" />;
  } else if (value === false) {
    return <XCircle className="text-red-500 inline-block mr-1 h-5 w-5" />;
  }
  return <span className="text-gray-400">N/A</span>;
};

// Fonction utilitaire pour afficher le statut avec des icônes
const formatStatus = (status) => {
  if (!status) return 'N/A';
  switch (String(status).toUpperCase()) {
    case 'WAITING':
      return <span className="flex items-center text-yellow-600 dark:text-yellow-400"><AlertTriangle className="mr-1 h-5 w-5" /> En attente</span>;
    case 'ACCEPTED':
      return <span className="flex items-center text-green-600 dark:text-green-400"><CheckCircle className="mr-1 h-5 w-5" /> Accepté</span>;
    case 'REFUSED':
      return <span className="flex items-center text-red-600 dark:text-red-400"><XCircle className="mr-1 h-5 w-5" /> Refusé</span>;
    default:
      return status;
  }
};

// Composant utilitaire pour afficher un seul élément de donnée
const ProfileDataItem = ({ icon: Icon, label, value, valueClassName = "text-gray-700 dark:text-gray-300" }) => {
  const displayValue = (value === undefined || value === null || (typeof value === 'string' && value.trim() === ''))
    ? <span className="text-gray-400 dark:text-gray-500">N/A</span>
    : value;

  return (
    <div className="flex items-start py-2">
      {Icon && <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-1 flex-shrink-0" />}
      <div className="flex-grow">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className={`text-sm ${valueClassName}`}>{displayValue}</p>
      </div>
    </div>
  );
};

// Fonction utilitaire pour afficher le sexe
const getGenderDisplay = (sexe) => {
  if (!sexe) return 'N/A';
  switch (String(sexe).toUpperCase()) {
    case 'M': return 'Homme';
    case 'F': return 'Femme';
    case 'O': return 'Autre';
    default: return String(sexe);
  }
};

// Fonction utilitaire pour afficher l'état civil
const getMaritalStatusDisplay = (status) => {
  if (!status) return 'N/A';
  const lowerStatus = String(status).toLowerCase();
  switch (lowerStatus) {
    case 'single': return 'Célibataire';
    case 'married': return 'Marié(e)';
    case 'divorced': return 'Divorcé(e)';
    case 'widowed': return 'Veuf(ve)';
    default: return String(status);
  }
};

// --- Fin des fonctions utilitaires ---


const ManagerProfile = ({ user }) => {
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' or 'company'
  const navigate = useNavigate(); // Initialisez useNavigate

  // Accéder directement aux données de l'utilisateur et de l'entreprise
  const managerDetails = user?.user || {};
  const companyDetails = user?.entreprise || null;

  // Log de débogage pour voir la structure des données reçues
  console.log("ManagerProfile: user prop reçue:", user);
  console.log("ManagerProfile: managerDetails (user.user):", managerDetails);
  console.log("ManagerProfile: companyDetails (user.entreprise):", companyDetails);


  if (!user || Object.keys(managerDetails).length === 0) {
    console.log("ManagerProfile: la prop user ou managerDetails est vide, retour de null.");
    return (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            Aucune donnée de manager valide disponible.
        </div>
    );
  }



  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-4 md:p-8 flex justify-center items-start font-sans transition-colors duration-300">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-2xl rounded-lg overflow-hidden">
        {/* En-tête du profil */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8 text-white relative"> {/* Ajout de 'relative' pour le positionnement du bouton */}
          <div className="flex flex-col md:flex-row items-center">
            {/* Image de profil */}
            <img
              src={managerDetails.image_path || `https://placehold.co/120x120/EBF4FF/76A9FA?text=${managerDetails.firstName?.charAt(0) || 'U'}${managerDetails.lastName?.charAt(0) || 'D'}`}
              alt={`${managerDetails.firstName || 'User'} ${managerDetails.lastName || ''}`}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-blue-300 object-cover shadow-lg"
              onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/120x120/EBF4FF/76A9FA?text=${managerDetails.firstName?.charAt(0) || 'U'}${managerDetails.lastName?.charAt(0) || 'D'}`; }}
            />
            {/* Nom de l'utilisateur et rôle */}
            <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold">
                {managerDetails.firstName || 'N/A'} {managerDetails.lastName || ''}
              </h1>
              <p className="text-lg text-blue-200 dark:text-blue-300 flex items-center justify-center md:justify-start mt-1">
                <Briefcase className="h-5 w-5 mr-2" />
                {console.log("ManagerProfile: user", user.user)}
                {user.user.role?.role_name || user.role || 'N/A'}
              </p>
            </div>
          </div>
          
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`px-4 py-3 text-lg font-medium ${
              activeTab === 'personal'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'
            } focus:outline-none transition-colors duration-200`}
            onClick={() => setActiveTab('personal')}
          >
            <User className="inline-block mr-2" size={20} /> Détails Personnels
          </button>
          <button
            className={`px-4 py-3 text-lg font-medium ${
              activeTab === 'company'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'
            } focus:outline-none transition-colors duration-200`}
            onClick={() => setActiveTab('company')}
          >
            <Building2 className="inline-block mr-2" size={20} /> Informations de l'Entreprise
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 md:p-8">
          {activeTab === 'personal' && (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              {/* Colonne 1 : Informations de contact */}
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300 border-b-2 border-blue-200 dark:border-blue-700 pb-2 mb-3">Informations de contact</h2>
                <ProfileDataItem icon={Mail} label="Adresse e-mail" value={managerDetails.email} />
                <ProfileDataItem icon={Phone} label="Numéro de téléphone" value={managerDetails.num_tel} />
                <ProfileDataItem icon={MapPin} label="Adresse" value={managerDetails.address} />
              </div>

              {/* Colonne 2 : Détails personnels */}
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300 border-b-2 border-blue-200 dark:border-blue-700 pb-2 mb-3">Détails personnels</h2>
                <ProfileDataItem icon={Cake} label="Date de naissance" value={formatDate(managerDetails.datenais)} />
                <ProfileDataItem icon={Landmark} label="Lieu de naissance" value={managerDetails.lieu} />
                <ProfileDataItem icon={User} label="Sexe" value={getGenderDisplay(managerDetails.sexe)} />
                <ProfileDataItem icon={Navigation} label="Nationalité" value={managerDetails.nationality} />
                <ProfileDataItem icon={Users} label="Situation familiale" value={getMaritalStatusDisplay(managerDetails.situation_familliale)} />
                <ProfileDataItem icon={IdCard} label="CIN / Numéro d'identité" value={managerDetails.cin} />
              </div>

              {/* Colonne 3 : Statut du compte */}
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300 border-b-2 border-blue-200 dark:border-blue-700 pb-2 mb-3">Statut du compte</h2>
                <ProfileDataItem icon={CalendarDays} label="Date d'inscription" value={formatDate(managerDetails.registrationDate)} />
                <ProfileDataItem icon={LogIn} label="Dernière connexion" value={formatDate(managerDetails.lastLoginDate)} />
                {/* <ProfileDataItem icon={ShieldCheck} label="Compte activé" value={formatBoolean(managerDetails.enabled)} />
                <ProfileDataItem icon={ShieldCheck} label="Compte actif" value={formatBoolean(managerDetails.active)} />
                <ProfileDataItem icon={AlertTriangle} label="Statut d'acceptation" value={formatStatus(managerDetails.is_accepted)} />
                {managerDetails.deletation_Date && (
                  <ProfileDataItem icon={CalendarDays} label="Date de suppression" value={formatDate(managerDetails.deletation_Date)} valueClassName="text-red-600 dark:text-red-400 font-medium" />
                )} */}
              </div>
            </section>
          )}

          {activeTab === 'company' && (
            <section className="space-y-6">
              <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300 border-b-2 border-blue-200 dark:border-blue-700 pb-2 mb-3">Informations Générales</h2>
              {companyDetails ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <ProfileDataItem icon={Building2} label="Nom de l'entreprise" value={companyDetails.nomEntreprise} />
                  <ProfileDataItem icon={MapPin} label="Adresse" value={`${companyDetails.adresse || ''}, ${companyDetails.codePostal ? `${companyDetails.codePostal} ` : ''}${companyDetails.ville || ''}, ${companyDetails.pays || ''}`} />
                  <ProfileDataItem icon={Phone} label="Téléphone" value={companyDetails.telephone} />
                  <ProfileDataItem icon={Mail} label="Email" value={companyDetails.email} />
                  <ProfileDataItem icon={Earth} label="Site Web" value={<a href={companyDetails.siteWeb} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">{companyDetails.siteWeb}</a>} />
                  <ProfileDataItem icon={Info} label="Description" value={companyDetails.description} />
                  <ProfileDataItem icon={Briefcase} label="Secteur d'Activité" value={companyDetails.secteurActivite} />
                  <ProfileDataItem icon={Users} label="Taille de l'Entreprise" value={companyDetails.tailleEntreprise} />
                  <ProfileDataItem icon={CalendarDays} label="Année de Création" value={companyDetails.anneeCreation} />
                  <ProfileDataItem icon={MapPin} label="Région" value={companyDetails.region} />
                  <ProfileDataItem icon={Scale} label="Statut Juridique" value={companyDetails.statutJuridique} />
                  <ProfileDataItem icon={Scale} label="Forme Juridique" value={companyDetails.formeJuridique} />
                  
                  {(companyDetails.numeroSiren || companyDetails.numeroSiret || companyDetails.numeroTvaIntra || companyDetails.capitalSocial) && (
                      <div className="md:col-span-2 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                          <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300 border-b-2 border-blue-200 dark:border-blue-700 pb-2 mb-3">Informations Légales</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <ProfileDataItem icon={IdCard} label="Numéro SIREN" value={companyDetails.numeroSiren} />
                            <ProfileDataItem icon={IdCard} label="Numéro SIRET" value={companyDetails.numeroSiret} />
                            <ProfileDataItem icon={IdCard} label="Numéro TVA Intracommunautaire" value={companyDetails.numeroTvaIntra} />
                            <ProfileDataItem icon={Scale} label="Capital Social" value={companyDetails.capitalSocial} />
                          </div>
                      </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center text-gray-500 dark:text-gray-400 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                  <Info className="h-5 w-5 mr-3" />
                  <p>Aucune information d'entreprise disponible pour ce manager.</p>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerProfile;
