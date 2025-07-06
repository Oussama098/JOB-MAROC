import { useState, useEffect } from 'react';
import UserDetails from './UserDetails';
import { AlertTriangle, X, UserPlus, Loader2 } from 'lucide-react';
import UserForm from './UserForm';
import UsersTable from './UserTable';
import { Api } from '../../services/Api'; 

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    userToDelete: null, // Ceci stockera l'objet utilisateur complet
  });

  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getUsers = async () => {
    setIsLoading(true);
    const storedToken = localStorage.getItem('jwtToken');

    if (!storedToken) {
      console.error("Aucun jeton JWT trouvé dans le stockage local. L'utilisateur n'est pas authentifié.");
      setNotification({ type: 'error', message: 'Jeton d\'authentification manquant. Veuillez vous connecter.' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await Api.get('/users/all', {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        console.error("Les données de réponse de l'API ne sont pas un tableau :", response.data);
        setUsers([]); // S'assurer que les utilisateurs est toujours un tableau
        setNotification({ type: 'error', message: 'Échec du chargement des données utilisateur. Un tableau était attendu.' });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs :", error);
      if (error.response && error.response.status === 401) {
        setNotification({ type: 'error', message: 'Authentification expirée. Veuillez vous reconnecter.' });
      } else {
        setNotification({ type: 'error', message: 'Une erreur est survenue lors de la récupération des utilisateurs.' });
      }
      setUsers([]); // S'assurer que les utilisateurs est un tableau en cas d'erreur
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const handleAddUser = () => {
    setCurrentUser(null);
    setIsFormOpen(true);
    setNotification(null);
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setIsFormOpen(true);
    setNotification(null);
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
  };

  const handleDeletePrompt = (user) => {
    setDeleteConfirmation({
      isOpen: true,
      userToDelete: user, // Stocker l'objet utilisateur entier
    });
    setNotification(null); // Effacer les notifications précédentes
  };

  const handleDeleteUser = async () => {
    const userToDelete = deleteConfirmation.userToDelete;

    if (!userToDelete || !userToDelete.userId || !userToDelete.role || !userToDelete.role.role_name) {
      console.error("Données utilisateur invalides pour la suppression :", userToDelete);
      setNotification({ type: 'error', message: 'Impossible de supprimer l\'utilisateur : données utilisateur invalides ou incomplètes.' });
      setDeleteConfirmation({ isOpen: false, userToDelete: null });
      return;
    }

    setIsLoading(true);
    setNotification(null);

    const storedToken = localStorage.getItem('jwtToken');

    if (!storedToken) {
      setNotification({ type: 'error', message: 'Jeton d\'authentification manquant. Suppression annulée.' });
      setIsLoading(false);
      setDeleteConfirmation({ isOpen: false, userToDelete: null });
      return;
    }

    let deleteEndpoint = '';
    const roleName = userToDelete.role.role_name;
    const userId = userToDelete.userId;

    switch (roleName) {
      case 'ADMIN':
        deleteEndpoint = `/admin/delete/${userId}`;
        break;
      case 'TALENT':
        deleteEndpoint = `/talent/delete/${userId}`;
        break;
      case 'MANAGER':
        deleteEndpoint = `/manager/delete/${userId}`;
        break;
      default:
        console.error("Tentative de suppression d'un utilisateur avec un rôle non géré :", roleName);
        setNotification({ type: 'error', message: `Échec de la suppression : le rôle "${roleName}" n'est pas pris en charge pour la suppression.` });
        setIsLoading(false);
        setDeleteConfirmation({ isOpen: false, userToDelete: null });
        return;
    }

    console.log(`Tentative de requête DELETE vers : ${deleteEndpoint} pour l'ID utilisateur : ${userId}`);

    try {
      await Api.delete(deleteEndpoint, {
        headers: { 'Authorization': `Bearer ${storedToken}` }
      });

      setUsers(prevUsers => prevUsers.filter(u => u.userId !== userId));

      setNotification({
        type: 'success',
        message: `L'utilisateur "${userToDelete.firstName} ${userToDelete.lastName}" (${roleName}) a été supprimé avec succès.`
      });

    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur :", error.response || error);
      const errorMessage = error.response?.data?.message || error.message || 'Échec de la suppression de l\'utilisateur. Veuillez réessayer.';
      setNotification({ type: 'error', message: `Échec de la suppression : ${errorMessage}` });
    } finally {
      setIsLoading(false);
      setDeleteConfirmation({
        isOpen: false,
        userToDelete: null
      });
    }
  };

  const handleSaveUser = async (userData) => {
    setIsLoading(true);
    setNotification(null);

    const storedToken = localStorage.getItem('jwtToken');
    if (!storedToken) {
      setNotification({ type: 'error', message: 'Jeton d\'authentification manquant pour la sauvegarde de l\'utilisateur.' });
      setIsLoading(false);
      return;
    }

    // Préparer les données utilisateur communes
    const commonUserData = {
      userId: userData.userId, // Inclure userId pour les mises à jour
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      address: userData.address,
      nationality: userData.nationality, // En supposant que 'nationality' est la bonne clé
      sexe: userData.sexe,
      datenais: userData.datenais ? new Date(userData.datenais).toISOString() : null, // Envoyer en tant que chaîne ISO
      lieu: userData.lieu,
      num_tel: userData.num_tel,
      image_path: userData.image_path,
      isActive: userData.isActive !== undefined ? userData.isActive : false,
      cin: userData.cin,
      situation_familliale: userData.situation_familliale,
      role: userData.role 
    };


    try {
      let response;
      let successMessage = '';

      if (userData.userId) {
        const userId = userData.userId;
        const updateEndpoint = `/users/update/${userId}`; // Utiliser le point de terminaison de votre API
        console.log(`Tentative de requête PUT vers : ${updateEndpoint} pour l'ID utilisateur : ${userId}`);

        // Envoyer l'objet commonUserData directement comme corps de la requête
        response = await Api.put(updateEndpoint, commonUserData, {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'Content-Type': 'application/json'
          }
        });
        successMessage = `L'utilisateur "${userData.firstName}" a été mis à jour avec succès.`;
        console.log('Mise à jour réussie :', response?.data); // Journaliser la réponse en cas de succès

      } else {
        // --- Gérer la création (nouvel utilisateur) ---
        let dataToSend;
        let addEndpoint = '';

        if (userData.role?.role_name === 'TALENT') {
          addEndpoint = '/talent/add';
          dataToSend = {
            user_id: commonUserData, // Correspond à userEntity
            diplomeList: [],
            skillsList: [],
            experianceList: [],
          };
          successMessage = 'Un nouvel utilisateur Talent a été créé avec succès !';
        } else if (userData.role?.role_name === 'ADMIN') {
          addEndpoint = '/admin/add';
          dataToSend = { user: commonUserData }; // Correspond à UserEntityDTO ou similaire
          successMessage = 'Un nouvel utilisateur ADMIN a été créé avec succès !';
        } else if (userData.role?.role_name === 'MANAGER') {
          addEndpoint = '/manager/add';
          dataToSend = { user: commonUserData }; // Correspond à UserEntityDTO ou similaire
          successMessage = 'Un nouvel utilisateur MANAGER a été créé avec succès !';
        } else {
          setNotification({ type: 'error', message: 'Impossible de créer l\'utilisateur : rôle invalide ou non spécifié.' });
          setIsLoading(false);
          return;
        }

        response = await Api.post(addEndpoint, dataToSend, {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'Content-Type': 'application/json'
          }
        });
        successMessage = successMessage; // Utiliser le message de succès déterminé par le rôle
      }

      setNotification({ type: 'success', message: successMessage });
      getUsers(); // Actualiser la liste des utilisateurs
      setIsFormOpen(false);
      setCurrentUser(null);

    } catch (error) {
      console.error('Échec de la sauvegarde :', error.response || error);
      const errorMessage = error.response?.data?.message || error.message || 'Une erreur inattendue est survenue lors de la sauvegarde.';
      setNotification({ type: 'error', message: `Échec de la sauvegarde : ${errorMessage}` });
    } finally {
      setIsLoading(false);
    }
  };


  const clearNotification = () => {
    setNotification(null);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des utilisateurs</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Gérez les membres de votre équipe et leurs permissions de compte</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total des utilisateurs</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{Array.isArray(users) ? users.length : 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Utilisateurs actifs</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
            {Array.isArray(users) ? users.filter(user => user.active || user.isActive).length : 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Administrateurs</h3>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
            {Array.isArray(users) ? users.filter(user => user.role && user.role.role_name === 'ADMIN').length : 0}
          </p>
        </div>
      </div>

      {notification && (
        <div className={`mb-4 p-4 rounded-md flex justify-between items-center ${
          notification.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' :
          'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
        }`} role={notification.type === 'error' ? 'alert' : 'status'}>
          <div className="flex items-center">
            {notification.type === 'error' && <AlertTriangle size={18} className="mr-2" aria-hidden="true" />}
            <p>{notification.message}</p>
          </div>
          <button
            onClick={clearNotification}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Ignorer la notification"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {isLoading && (
                    <div className="flex flex-col items-center justify-center text-center text-slate-600 dark:text-slate-400 py-10">
                        <Loader2 size={48} className="animate-spin mb-4 text-sky-500" />
                        <p className="text-xl font-medium">Loading offers...</p>
                        <p>Please wait a moment.</p>
                    </div>
      )}

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Tous les utilisateurs</h2>
          <button
            onClick={handleAddUser}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            <UserPlus size={18} />
            Ajouter un utilisateur
          </button>
        </div>

        <UsersTable
            users={users}
            onEdit={handleEditUser}
            onDelete={handleDeletePrompt}
            onViewDetails={handleViewDetails}
            isLoading={isLoading && users.length > 0}
        />
        {!isLoading && Array.isArray(users) && users.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                <p className="text-lg">Aucun utilisateur trouvé.</p>
                <p>Cliquez sur "Ajouter un utilisateur" pour commencer.</p>
            </div>
        )}
      </div>

      {isFormOpen && (
        <UserForm
          user={currentUser}
          onSave={handleSaveUser}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      {selectedUser && (
        <UserDetails
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {deleteConfirmation.isOpen && deleteConfirmation.userToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-25 backdrop-blur-sm z-50" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h3 id="delete-modal-title" className="text-lg font-medium text-gray-900 dark:text-white mb-2">Confirmer la suppression</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Êtes-vous sûr de vouloir supprimer l'utilisateur "{deleteConfirmation.userToDelete.firstName} {deleteConfirmation.userToDelete.lastName}" ? Cette action est irréversible.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmation({ isOpen: false, userToDelete: null })}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                  disabled={isLoading}
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? 'Suppression...' : 'Supprimer l\'utilisateur'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;