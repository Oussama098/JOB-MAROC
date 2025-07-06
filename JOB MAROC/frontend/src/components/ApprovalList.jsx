import { useState, useEffect } from 'react'; // Importe useEffect
import { Check, X, ChevronDown, ChevronUp, Search, Eye, MoreHorizontal, Info } from 'lucide-react'; // Ajout des icônes MoreHorizontal, Info
import { Api } from '../services/Api'; // Supposons que l'API est configurée correctement

const ApprovalList = () => {
  // État pour contenir la liste des utilisateurs avec le statut WAITING
  const [usersWaitingStatus, setUsersWaitingStatus] = useState([]);
  const [loading, setLoading] = useState(true); // État pour suivre le statut de chargement
  const [error, setError] = useState(null); // État pour suivre les erreurs

  const [searchQuery, setSearchQuery] = useState('');

  // État pour gérer les notifications
  const [notification, setNotification] = useState(null); // { message: '...', type: 'success' | 'error' }

  // État de tri, mis à jour pour correspondre aux champs de userEntity
  const [sortConfig, setSortConfig] = useState({ key: 'registrationDate', direction: 'desc' }); // Tri par défaut par date d'inscription

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fonction pour afficher une notification
  const showNotification = (message, type) => {
    setNotification({ message, type });
    // Masquer automatiquement la notification après 5 secondes
    setTimeout(() => {
      setNotification(null);
    }, 5000); // 5000 millisecondes = 5 secondes
  };


  // Fonction pour récupérer les utilisateurs avec le statut WAITING depuis l'API
  const fetchUsersWaitingStatus = async () => {
    setLoading(true); // Commencer le chargement
    setError(null); // Effacer les erreurs précédentes

    // Récupérer le jeton stocké depuis localStorage
    const storedToken = localStorage.getItem('jwtToken'); // <-- Récupère le jeton ici

    // Vérifier si le jeton existe avant de faire la requête authentifiée
    if (!storedToken) {
      console.error("Aucun jeton JWT trouvé dans localStorage. L'utilisateur n'est pas authentifié.");
      setError("Authentification requise. Veuillez vous connecter."); // Définir l'état d'erreur
      setLoading(false); // Arrêter le chargement
      // Optionnellement, rediriger l'utilisateur vers la page de connexion
      // navigate('/login'); // Supposons que vous avez un hook de navigation
      return; // Arrêter l'exécution si aucun jeton n'est trouvé
    }

    try {
      // Effectuer l'appel API pour récupérer les utilisateurs avec le statut WAITING
      // Assurez-vous que ce chemin '/usersWaitingStatus' est correct par rapport à votre URL de base d'API
      const response = await Api.get('/users/usersWaitingStatus', {
        headers: {
          'Authorization': `Bearer ${storedToken}`, // <-- Inclure le jeton JWT
          'Content-Type': 'application/json'
        }
      });

      // Vérifier si response.data est un tableau avant de définir l'état
      if (Array.isArray(response.data)) {
        setUsersWaitingStatus(response.data); // Mettre à jour l'état avec les données récupérées
      } else {
        console.error("Les données de réponse de l'API ne sont pas un tableau :", response.data);
        setUsersWaitingStatus([]); // Définir sur un tableau vide si les données sont inattendues
        setError("Données invalides reçues de l'API."); // Définir l'état d'erreur
      }

    } catch (err) {
      console.error("Erreur lors de la récupération du statut des utilisateurs en attente :", err);
      setError("Échec de la récupération des candidats."); // Définir l'état d'erreur
      // Gérer les réponses d'erreur spécifiques (par exemple, 401 Non autorisé si le jeton est expiré/invalide)
      if (err.response && err.response.status === 401) {
          setError("Authentification expirée. Veuillez vous reconnecter.");
          // Optionnellement, effacer le jeton invalide et rediriger vers la connexion
          // localStorage.removeItem('jwtToken');
          // navigate('/login');
      }
    } finally {
      setLoading(false); // Arrêter le chargement que ce soit un succès ou un échec
    }
  };

  // Récupérer les données lorsque le composant est monté
  useEffect(() => {
    fetchUsersWaitingStatus();
    // Le tableau de dépendances vide garantit que cet effet ne s'exécute qu'une seule fois au montage
  }, []);

  // --- Logique de tri et de filtrage (adaptée à la structure userEntity) ---

  // Filtrer par requête de recherche
  // Filtrer en fonction des champs userEntity : firstName, lastName, email, situation_familliale, role.role_name
  const filteredData = usersWaitingStatus.filter(item =>
    item.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.situation_familliale?.toLowerCase().includes(searchQuery.toLowerCase()) || // Supposons que toString() de l'énumération est en minuscules
    item.role?.role_name?.toLowerCase().includes(searchQuery.toLowerCase()) // Rechercher par nom de rôle
  );

  // Fonction de tri (adaptée aux champs userEntity)
  const sortedData = [...filteredData].sort((a, b) => {
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    // Gérer les champs imbriqués pour le tri (par exemple, role.role_name)
    if (sortConfig.key === 'role') {
        aValue = a.role?.role_name || ''; // Utiliser role_name pour le tri du rôle
        bValue = b.role?.role_name || '';
    } else if (sortConfig.key === 'situation_familliale') {
          aValue = a.situation_familliale || ''; // Utiliser l'énumération situation_familliale
          bValue = b.situation_familliale || '';
    }
    // Ajouter d'autres vérifications ici pour d'autres champs imbriqués ou complexes que vous souhaitez trier

    // Gérer les valeurs nulles ou indéfinies potentielles lors de la comparaison
    if (aValue == null) aValue = '';
    if (bValue == null) bValue = '';

    // Effectuer la comparaison
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Gestionnaire de tri
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Réinitialiser à la première page lors du changement de tri
  };

  // Rendre l'icône de tri
  const renderSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ?
        <ChevronUp size={16} className="ml-1" /> :
        <ChevronDown size={16} className="ml-1" />;
    }
    return null; // Pas d'icône si non trié par cette clé
  };

  // --- Gestionnaires d'actions (Accepter/Refuser) ---
  // Ceux-ci devraient appeler votre API backend pour mettre à jour le statut de l'utilisateur

  const handleAcceptUser = async (userId) => {
      console.log(`Tentative d'accepter l'utilisateur avec l'ID : ${userId}`);
      const storedToken = localStorage.getItem('jwtToken');
      if (!storedToken) {
          console.error("Aucun jeton JWT trouvé pour la mise à jour du statut.");
          showNotification("Authentification requise. Veuillez vous connecter.", "error"); // Afficher la notification d'erreur
          return;
      }

      try {
          // Construire le corps de la requête pour correspondre à la structure userEntity attendue par le backend
          // Nous n'avons besoin d'envoyer que le champ 'is_accepted'
          const requestBody = {
              is_accepted: 'ACCEPTED' // Envoyer le statut désiré sous forme de chaîne
              // Vous pourriez avoir besoin d'inclure d'autres champs si votre backend les exige
              // en fonction de la façon dont userEntity est désérialisé, mais 'is_accepted' est le principal ici.
          };

          // Effectuer l'appel API pour mettre à jour le statut de l'utilisateur à ACCEPTED
          // En utilisant le point de terminaison backend : /users/updateStatus/{userId}
          const response = await Api.put(`/users/updateStatus/${userId}`, requestBody, {
              headers: {
                  'Authorization': `Bearer ${storedToken}`,
                  'Content-Type': 'application/json'
              }
          });

          if (response.status === 200) { // Vérifier la réponse réussie (ajuster en fonction de la réponse de votre backend)
                 console.log(`Utilisateur ${userId} accepté avec succès.`);
                 // Supprimer l'utilisateur de la liste locale de manière optimiste après une mise à jour réussie
                 setUsersWaitingStatus(prevUsers => prevUsers.filter(user => user.userId !== userId));
                 showNotification("Candidat accepté avec succès !", "success"); // Afficher la notification de succès
          } else {
                 console.error("L'appel API pour accepter l'utilisateur a échoué avec le statut :", response.status);
                 showNotification("Échec de l'acceptation du candidat. Veuillez réessayer.", "error"); // Afficher la notification d'erreur
          }

      } catch (error) {
          console.error("Erreur lors de l'acceptation de l'utilisateur :", error);
          showNotification("Une erreur est survenue lors de l'acceptation du candidat.", "error"); // Afficher la notification d'erreur générique
      }
  };

  const handleRefuseUser = async (userId) => {
        console.log(`Tentative de refuser l'utilisateur avec l'ID : ${userId}`);
        const storedToken = localStorage.getItem('jwtToken');
        if (!storedToken) {
            console.error("Aucun jeton JWT trouvé pour la mise à jour du statut.");
            showNotification("Authentification requise. Veuillez vous connecter.", "error"); // Afficher la notification d'erreur
            return;
        }

        try {
            // Construire le corps de la requête pour correspondre à la structure userEntity attendue par le backend
            // Nous n'avons besoin d'envoyer que le champ 'is_accepted'
            const requestBody = {
                is_accepted: 'REFUSED' // Envoyer le statut désiré sous forme de chaîne
                // Vous pourriez avoir besoin d'inclure d'autres champs si votre backend les exige
            };

            // Effectuer l'appel API pour mettre à jour le statut de l'utilisateur à REJECTED
            // En utilisant le point de terminaison backend : /users/updateStatus/{userId}
            const response = await Api.put(`/users/updateStatus/${userId}`, requestBody, {
                headers: {
                    'Authorization': `Bearer ${storedToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) { // Vérifier la réponse réussie (ajuster en fonction de la réponse de votre backend)
                 console.log(`Utilisateur ${userId} refusé avec succès.`);
                 // Supprimer l'utilisateur de la liste locale de manière optimiste après une mise à jour réussie
                 setUsersWaitingStatus(prevUsers => prevUsers.filter(user => user.userId !== userId));
                 // --- Type de notification CHANGÉ en 'error' pour le refus ---
                 showNotification("Candidat refusé.", "error"); // Afficher la notification d'erreur pour le refus
                 // --- Fin du changement ---
            } else {
                 console.error("L'appel API pour refuser l'utilisateur a échoué avec le statut :", response.status);
                 showNotification("Échec du refus du candidat. Veuillez réessayer.", "error"); // Afficher la notification d'erreur
            }

        } catch (error) {
            console.error("Erreur lors du refus de l'utilisateur :", error);
            showNotification("Une erreur est survenue lors du refus du candidat.", "error"); // Afficher la notification d'erreur générique
        }
  };


  // Gestionnaire de bascule de menu déroulant
  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleDropdown = (id) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Fermer les menus déroulants en cliquant à l'extérieur (implémentation basique)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Vérifier si le clic est en dehors de n'importe quel bouton ou menu déroulant
      // Utiliser un sélecteur plus spécifique si nécessaire, mais '.relative' pourrait fonctionner s'il englobe le bouton et le menu déroulant
      if (!event.target.closest('.relative')) {
        setOpenDropdowns({}); // Fermer tous les menus déroulants
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);


  // --- Logique de rendu ---

  if (loading) {
    return <div className="text-center text-gray-600 dark:text-gray-300 py-8">Chargement des candidats...</div>; // Ajout d'un padding
  }

  if (error) {
    return <div className="text-center text-red-600 dark:text-red-400 py-8">Erreur : {error}</div>; // Ajout d'un padding
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 relative"> {/* Ajout du positionnement relatif */}
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Liste d'approbation</h2>

      {/* --- Affichage des notifications --- */}
      {notification && (
        <div className={`absolute top-4 right-4 p-4 rounded-md shadow-lg z-50 flex items-center space-x-2
                            ${notification.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
          {notification.type === 'success' ? (
              <Check size={20} className="text-green-500" />
          ) : (
              <Info size={20} className="text-red-500" />
          )}
          <p className="text-sm font-medium">{notification.message}</p>
          <button onClick={() => setNotification(null)} className="ml-auto text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <X size={16} />
          </button>
        </div>
      )}
      {/* --- Fin de l'affichage des notifications --- */}


      {/* Recherche et filtres */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            placeholder="Rechercher des candidats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 self-center">
            Total : {filteredData.length} candidats
          </span>
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                onClick={() => requestSort('firstName')} // Trier par firstName (partie du nom)
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
              >
                <div className="flex items-center">
                  Candidat {renderSortIcon('firstName')}
                </div>
              </th>
              {/* Ajouter l'en-tête de colonne Situation */}
                <th
                  onClick={() => requestSort('situation_familliale')} // Trier par situation_familliale
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                >
                  <div className="flex items-center">
                    Situation {renderSortIcon('situation_familliale')}
                  </div>
                </th>
                {/* Ajouter l'en-tête de colonne Rôle */}
                 <th
                   onClick={() => requestSort('role')} // Trier par nom de rôle
                   className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                 >
                   <div className="flex items-center">
                     Rôle {renderSortIcon('role')}
                   </div>
                 </th>
              <th
                onClick={() => requestSort('registrationDate')} // Trier par registrationDate
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
              >
                <div className="flex items-center">
                  Date d'inscription {renderSortIcon('registrationDate')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {currentItems.length > 0 ? (
              currentItems.map((item) => ( // 'item' est un objet userEntity
                <tr key={item.userId} className="hover:bg-gray-50 dark:hover:bg-gray-700"> {/* Utiliser userId comme clé */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {/* Ajouter l'avatar/image de l'utilisateur si disponible */}
                      {/* <img className="h-10 w-10 rounded-full" src={item.image_path || '/default-avatar.png'} alt={`${item.firstName} ${item.lastName}`} /> */}
                      <div className="ml-0"> {/* Supprimé ml-4 car pas de placeholder d'image */}
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.firstName} {item.lastName} {/* Utiliser firstName et lastName */}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.email} {/* Utiliser email */}
                        </div>
                      </div>
                    </div>
                  </td>
                  {/* --- CELLULE SITUATION FAMILIALE STYLÉE --- */}
                   <td className="px-6 py-4 whitespace-nowrap">
                     {item.situation_familliale ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          // Appliquer différents styles en fonction de la valeur de situation_familliale
                          item.situation_familliale === 'SINGLE'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : item.situation_familliale === 'MARRIED'
                              ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
                            : item.situation_familliale === 'DIVORCED'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : item.situation_familliale === 'WIDOWED'
                              ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            : // Style par défaut pour les autres situations ou situations inconnues
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {item.situation_familliale}
                          </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">N/A</span> // Afficher N/A si nul
                      )}
                    </td>
                    {/* --- FIN DE LA CELLULE SITUATION FAMILIALE STYLÉE --- */}
                    {/* --- CELLULE DE RÔLE STYLÉE --- */}
                     <td className="px-6 py-4 whitespace-nowrap">
                       {item.role ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            // Appliquer différents styles en fonction du nom du rôle
                            item.role.role_name === 'ADMIN'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : item.role.role_name === 'MANAGER'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : item.role.role_name === 'TALENT'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : // Style par défaut pour les autres rôles ou si role_name est inattendu
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {item.role.role_name}
                          </span>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">N/A</span> // Afficher N/A si le rôle est nul
                        )}
                      </td>
                      {/* --- FIN DE LA CELLULE DE RÔLE STYLÉE --- */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {item.registrationDate ? new Date(item.registrationDate).toLocaleDateString() : 'N/A'} {/* Utiliser registrationDate, gérer les nuls */}
                    </div>
                  </td>
                  {/* --- CELLULE D'ACTION STYLÉE --- */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right"> {/* Ajout de text-right pour l'alignement */}
                    <div className="relative inline-block"> {/* Ajout de inline-block pour contenir le menu déroulant */}
                      {/* Bouton d'action (Icône) */}
                      <button
                        onClick={() => toggleDropdown(item.userId)} // Utiliser userId pour la clé du menu déroulant
                        // Ajouter une classe au div parent du bouton ou au bouton lui-même pour la détection du clic extérieur
                        className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                        title="Plus d'actions" // Ajouter un titre pour l'accessibilité
                      >
                        <MoreHorizontal size={20} /> {/* Utiliser l'icône MoreHorizontal */}
                      </button>

                      {/* Menu déroulant */}
                      {openDropdowns[item.userId] && ( // Utiliser userId pour la clé du menu déroulant
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-10 origin-top-right"> {/* Largeur et origine ajustées */}
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            {/* Bouton Accepter */}
                            <button
                              onClick={() => {
                                handleAcceptUser(item.userId); // Appeler le gestionnaire d'acceptation avec userId
                                toggleDropdown(item.userId); // Fermer le menu déroulant
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left"
                              role="menuitem"
                            >
                              <Check size={16} className="mr-2 text-green-500" />
                              Accepter
                            </button>
                            {/* Bouton Refuser */}
                            <button
                              onClick={() => {
                                handleRefuseUser(item.userId); // Appeler le gestionnaire de refus avec userId
                                toggleDropdown(item.userId); // Fermer le menu déroulant
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left"
                              role="menuitem"
                            >
                              <X size={16} className="mr-2 text-red-500" />
                              Refuser
                            </button>
                            {/* Ajouter d'autres actions comme Voir les détails si nécessaire */}
                             {/* <button
                               onClick={() => {
                                 // onViewDetails(item); // Appeler le gestionnaire d'affichage des détails
                                 toggleDropdown(item.userId); // Fermer le menu déroulant
                               }}
                               className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left"
                               role="menuitem"
                             >
                               <Eye size={16} className="mr-2 text-blue-500" />
                               Voir les détails
                             </button> */}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  {/* --- FIN DE LA CELLULE D'ACTION STYLÉE --- */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'Aucun candidat trouvé correspondant à votre recherche.' : 'Aucun candidat en attente d\'approbation.'} {/* Message vide mis à jour */}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredData.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredData.length)} sur {filteredData.length} résultats
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Précédent
            </button>

            {/* Numéros de pagination */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === page
                    ? 'bg-blue-600 text-white dark:bg-blue-800' // Style de page active
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600' // Style de page inactive
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalList;