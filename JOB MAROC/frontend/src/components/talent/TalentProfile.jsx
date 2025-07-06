import React, { useState, useEffect } from 'react';
import { Api } from '../../services/Api';
import { 
  User, Mail, Phone, MapPin, Briefcase, CalendarDays, LogIn, 
  CheckCircle, XCircle, AlertTriangle, ShieldCheck, Navigation, 
  Cake, Landmark, Users, BookOpen, Layers, FileText, GraduationCap, 
  CreditCard, Award, FileBadge, FileCode, FileSearch, Globe, Star,
  Loader2, Info,Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TalentProfile = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [talentData, setTalentData] = useState({
    diplomes: [],
    experiences: [],
    cvs: [],
    skills: [],
    loading: true,
    error: null
  });
  // const goToSettings = () => {
  //   if (!user) {
  //     console.error("User data is missing");
  //     return;
  //   }
  //   navigate('/talent-space/parametres', { state: { user } });
  // };
  useEffect(() => {
    const fetchTalentData = async () => {
      if (!user?.userId) {
        setTalentData({
          diplomes: [],
          experiences: [],
          cvs: [],
          skills: [],
          loading: false,
          error: "Données utilisateur incomplètes"
        });
        return;
      }

      try {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
          throw new Error("Token d'authentification manquant");
        }

        const response = await Api.get(`talent/all-data/${user.userId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 10000
        });

        if (!response.data) {
          throw new Error("Aucune donnée reçue du serveur");
        }

        setTalentData({
          diplomes: response.data.diplomes || [],
          experiences: response.data.experiences || [],
          cvs: response.data.cvs || [],
          skills: response.data.skills || [],
          loading: false,
          error: null
        });

      } catch (error) {
        console.error("Erreur détaillée:", error);
        setTalentData(prev => ({
          ...prev,
          loading: false,
          error: error.response?.data?.message || error.message || "Erreur lors du chargement des données"
        }));
      }
    };

    

    fetchTalentData();

  }, [user]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) 
        ? 'Date invalide' 
        : date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
    } catch (error) {
      return 'Date invalide';
    }
  };

  const formatBoolean = (value) => {
    if (value === true) {
      return <CheckCircle className="text-green-500 inline-block mr-1 h-5 w-5" />;
    } else if (value === false) {
      return <XCircle className="text-red-500 inline-block mr-1 h-5 w-5" />;
    }
    return <span className="text-gray-400 dark:text-gray-500">N/A</span>;
  };

  const formatStatus = (status) => {
    if (!status) return 'N/A';
    switch (String(status).toUpperCase()) {
      case 'WAITING':
        return <span className="flex items-center text-yellow-600 dark:text-yellow-400"><AlertTriangle className="mr-1 h-5 w-5" /> En attente</span>;
      case 'ACCEPTED':
        return <span className="flex items-center text-green-600 dark:text-green-400"><CheckCircle className="mr-1 h-5 w-5" /> Accepté</span>;
      case 'REFUSED':
        return <span className="flex items-center text-red-600 dark:text-red-400"><XCircle className="mr-1 h-5 w-5" /> Rejeté</span>;
      default:
        return String(status);
    }
  };

  const getSkillLevelDisplay = (level) => {
    const levels = {
      1: { name: 'Débutant', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', stars: 1 },
      2: { name: 'Intermédiaire', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', stars: 2 },
      3: { name: 'Avancé', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', stars: 3 },
      4: { name: 'Expert', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', stars: 4 },
      5: { name: 'Maître', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', stars: 5 }
    };
    return levels[level] || { name: 'Non défini', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', stars: 0 };
  };

  const SkillStars = ({ level }) => {
    const skillLevel = getSkillLevelDisplay(level);
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${
              index < skillLevel.stars 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

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

  const getGenderDisplay = (gender) => {
    if (!gender) return 'N/A';
    switch (String(gender).toUpperCase()) {
      case 'MALE': return 'Homme';
      case 'FEMALE': return 'Femme';
      case 'OTHER': return 'Autre';
      case 'M': return 'Homme';
      case 'F': return 'Femme';
      default: return String(gender);
    }
  };

  const getMaritalStatusDisplay = (status) => {
    if (!status) return 'N/A';
    switch (String(status).toUpperCase()) {
      case 'SINGLE': return 'Célibataire';
      case 'MARRIED': return 'Marié(e)';
      case 'DIVORCED': return 'Divorcé(e)';
      case 'WIDOWED': return 'Veuf/Veuve';
      default: return String(status).charAt(0).toUpperCase() + String(status).slice(1).toLowerCase();
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <Info className="h-12 w-12 text-gray-400 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Aucune donnée utilisateur disponible</p>
        </div>
      </div>
    );
  }

  if (talentData.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-12 w-12 mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des données du talent...</p>
        </div>
      </div>
    );
  }

  if (talentData.error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-md">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erreur de chargement</h3>
              <p className="text-sm text-red-700 mt-2">{talentData.error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-lg overflow-hidden">
        {/* En-tête du profil */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8 text-white">
  <div className="relative flex flex-col md:flex-row items-center">
    <img
      src={user.image_path || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.username || 'User')}&backgroundColor=3b82f6`}
      alt={user.username || 'Utilisateur'}
      className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-blue-300 object-cover shadow-lg"
      onError={(e) => {
        e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.username || 'User')}&backgroundColor=3b82f6`;
      }}
    />
    <div className="mt-4 md:mt-0 md:ml-6 text-center md:text-left">
      <h1 className="text-3xl md:text-4xl font-bold">
        {user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.username || 'Utilisateur'}
      </h1>
      <p className="text-lg text-blue-200 dark:text-blue-300 flex items-center justify-center md:justify-start mt-1">
        <Briefcase className="h-5 w-5 mr-2" />
        {user.role?.role_name || user.role || 'N/A'}
      </p>
      {user.email && (
        <p className="text-blue-200 dark:text-blue-300 flex items-center justify-center md:justify-start mt-1">
          <Mail className="h-4 w-4 mr-2" />
          {user.email}
        </p>
      )}
    </div>

    {/* Bouton Paramètres */}
    {/* <button
      onClick={goToSettings}
      className="absolute top-4 right-4 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-md transition-all duration-200 flex items-center justify-center group"
      aria-label="Modifier les paramètres du profil"
    >
      <Settings size={20} className="transform transition-transform duration-200 group-hover:rotate-45" />
      <span className="hidden md:inline-block ml-2 text-sm font-medium opacity-50 group-hover:opacity-100 transition-opacity duration-200">Paramètres</span>
    </button> */}
  </div>
</div>


        {/* Onglets de navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'personal' 
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <User className="inline-block mr-2 h-5 w-5" />
              Informations personnelles
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'skills' 
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <FileCode className="inline-block mr-2 h-5 w-5" />
              Compétences
            </button>
            <button
              onClick={() => setActiveTab('diplomas')}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'diplomas' 
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <FileBadge className="inline-block mr-2 h-5 w-5" />
              Diplômes
            </button>
            <button
              onClick={() => setActiveTab('experience')}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'experience' 
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Briefcase className="inline-block mr-2 h-5 w-5" />
              Expérience
            </button>
            <button
              onClick={() => setActiveTab('cv')}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'cv' 
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <FileSearch className="inline-block mr-2 h-5 w-5" />
              CV
            </button>
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="p-6 md:p-8">
          {/* Onglet Informations personnelles */}
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Colonne 1: Informations de contact */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300 border-b-2 border-blue-200 dark:border-blue-700 pb-2">
                  Contact
                </h2>
                <ProfileDataItem icon={Mail} label="Email" value={user.email} />
                <ProfileDataItem icon={Phone} label="Téléphone" value={user.num_tel || user.phone} />
                <ProfileDataItem icon={MapPin} label="Adresse" value={user.address} />
              </div>

              {/* Colonne 2: Détails personnels */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300 border-b-2 border-blue-200 dark:border-blue-700 pb-2">
                  Détails personnels
                </h2>
                <ProfileDataItem icon={Cake} label="Date de naissance" value={formatDate(user.datenais || user.birthDate)} />
                <ProfileDataItem icon={Landmark} label="Lieu de naissance" value={user.lieu || user.birthPlace} />
                <ProfileDataItem icon={User} label="Genre" value={getGenderDisplay(user.sexe || user.gender)} />
                <ProfileDataItem icon={Navigation} label="Nationalité" value={user.nationality} />
                <ProfileDataItem icon={Users} label="Situation familiale" value={getMaritalStatusDisplay(user.situation_familliale || user.maritalStatus)} />
                <ProfileDataItem icon={CreditCard} label="CIN" value={user.cin || user.nationalId} />
              </div>

              {/* Colonne 3: Statut du compte */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300 border-b-2 border-blue-200 dark:border-blue-700 pb-2">
                  Statut du compte
                </h2>
                <ProfileDataItem icon={CalendarDays} label="Date d'inscription" value={formatDate(user.registrationDate || user.createdAt)} />
                <ProfileDataItem icon={LogIn} label="Dernière connexion" value={formatDate(user.lastLoginDate || user.lastLogin)} />
                {/* <ProfileDataItem
                  icon={user.active ? ShieldCheck : AlertTriangle}
                  label="Compte actif"
                  value={formatBoolean(user.active)}
                />
                <ProfileDataItem
                  icon={AlertTriangle}
                  label="Statut d'acceptation"
                  value={formatStatus(user.is_accepted || user.status)}
                />
                {user.deletedAt && (
                  <ProfileDataItem 
                    icon={CalendarDays} 
                    label="Date de suppression" 
                    value={formatDate(user.deletedAt)} 
                    valueClassName="text-red-600 dark:text-red-400 font-medium" 
                  />
                )} */}
              </div>
            </div>
          )}

          {/* Onglet Compétences */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-300">
                Compétences professionnelles
              </h2>
              
              {talentData.skills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {talentData.skills.map((skill) => (
                    <div 
                      key={skill.id} 
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                          {skill.skill_name}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          getSkillLevelDisplay(skill.skillLevel).color
                        }`}>
                          {getSkillLevelDisplay(skill.skillLevel).name}
                        </span>
                      </div>
                      
                      <div className="flex items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Niveau:</span>
                        <SkillStars level={skill.skillLevel} />
                      </div>
                      
                      {skill.skill_description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          {skill.skill_description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <FileCode className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <p className="mt-2 text-gray-500 dark:text-gray-400">
                    Aucune compétence enregistrée
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Onglet Diplômes */}
          {activeTab === 'diplomas' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-300">
                Diplômes et certifications
              </h2>
              
              {talentData.diplomes.length > 0 ? (
                <div className="space-y-4">
                  {talentData.diplomes.map((diplome) => (
                    <div 
                      key={diplome.diplome_id} 
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-start">
                        <Award className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3 mt-1 flex-shrink-0" />
                        <div className="flex-grow">
                          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                            {diplome.diplome_name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            {diplome.diplome_etablissement}
                          </p>
                          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                            <ProfileDataItem 
                              label="Période" 
                              value={`${formatDate(diplome.diplome_date_debut)} - ${formatDate(diplome.diplome_date_fin)}`} 
                            />
                          </div>
                          {diplome.diplome_description && (
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                              {diplome.diplome_description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <p className="mt-2 text-gray-500 dark:text-gray-400">
                    Aucun diplôme enregistré
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Onglet Expérience professionnelle */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-300">
                Expérience professionnelle
              </h2>
              
              {talentData.experiences.length > 0 ? (
                <div className="space-y-4">
                  {talentData.experiences.map((exp) => (
                    <div 
                      key={exp.experiance_id} 
                      className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-r-lg"
                    >
                      <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                        {exp.job_title} {exp.company_name && `chez ${exp.company_name}`}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {formatDate(exp.start_date)} - {exp.end_date ? formatDate(exp.end_date) : 'Présent'}
                      </p>
                      {exp.description && (
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <Briefcase className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <p className="mt-2 text-gray-500 dark:text-gray-400">
                    Aucune expérience professionnelle enregistrée
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Onglet CV */}
          {activeTab === 'cv' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-300">
                Curriculum Vitae
              </h2>
              
              {talentData.cvs.length > 0 ? (
                <div className="space-y-4">
                  {talentData.cvs.map((cv) => (
                    <div 
                      key={cv.cv_id} 
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="flex-shrink-0">
                          <FileText className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                            CV de {user.firstName || user.username}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Téléversé le: {formatDate(cv.upload_date)}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-3">
                            <a
                              href={cv.cv_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                              <FileSearch className="mr-2 h-5 w-5" />
                              Voir le CV
                            </a>
                            <a
                              href={cv.cv_path}
                              download
                              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <FileText className="mr-2 h-5 w-5" />
                              Télécharger
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <p className="mt-2 text-gray-500 dark:text-gray-400">
                    Aucun CV téléchargé
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TalentProfile;