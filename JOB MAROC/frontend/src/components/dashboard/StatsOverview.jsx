import React, { useState, useEffect } from 'react';
import StatCard from '../dashboard/StatCard'; // Chemin ajusté
import { Users, Briefcase, DollarSign, TrendingUp, UserCheck, UserMinus, UserCog } from 'lucide-react';
import { Api } from '../../services/Api'; // Chemin ajusté
import { Loader2, AlertTriangle } from 'lucide-react';

const StatsOverview = () => {
  // États pour les valeurs dynamiques (totaux globaux)
  const [overallTotalUsers, setOverallTotalUsers] = useState('0');
  const [overallTotalTalents, setOverallTotalTalents] = useState('0');
  const [overallTotalManagers, setOverallTotalManagers] = useState('0');
  const [overallTotalOffers, setOverallTotalOffers] = useState('0');

  // États pour les valeurs de changement (comparaison d'un mois à l'autre pour les nouvelles inscriptions/publications)
  const [usersChange, setUsersChange] = useState('0%');
  const [usersChangeType, setUsersChangeType] = useState('neutral'); // 'increase', 'decrease', 'neutral'

  const [talentsChange, setTalentsChange] = useState('0%');
  const [talentsChangeType, setTalentsChangeType] = useState('neutral');

  const [managersChange, setManagersChange] = useState('0%');
  const [managersChangeType, setManagersChangeType] = useState('neutral');

  const [offersChange, setOffersChange] = useState('0%');
  const [offersChangeType, setOffersChangeType] = useState('neutral');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction utilitaire pour calculer le pourcentage de changement et le type
  const calculateChange = (current, previous) => {
    if (previous === 0) {
      if (current > 0) return { change: '100%', changeType: 'increase' };
      return { change: '0%', changeType: 'neutral' };
    }
    const percentage = ((current - previous) / previous) * 100;
    const changeType = percentage > 0 ? 'increase' : (percentage < 0 ? 'decrease' : 'neutral');
    return {
      change: `${Math.abs(percentage).toFixed(0)}%`, // Afficher en pourcentage absolu
      changeType: changeType
    };
  };

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('jwtToken');

      if (!token) {
        setError('Authentification requise. Veuillez vous connecter.');
        setLoading(false);
        return;
      }

      try {
        // --- Récupérer tous les utilisateurs ---
        const usersResponse = await Api.get('/users/all', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const allUsers = usersResponse.data || usersResponse;
        if (!Array.isArray(allUsers)) {
          console.error('La réponse API pour les utilisateurs n\'est pas un tableau :', usersResponse);
          throw new Error('Données utilisateur invalides reçues de l\'API.');
        }

        // --- Calculer les totaux globaux pour les utilisateurs, talents, managers ---
        setOverallTotalUsers(allUsers.length.toLocaleString());
        setOverallTotalTalents(allUsers.filter(user => user.role?.role_name === 'TALENT').length.toLocaleString());
        setOverallTotalManagers(allUsers.filter(user => user.role?.role_name === 'MANAGER').length.toLocaleString());

        // --- Calcul des dates pour filtrer les inscriptions/publications mensuelles ---
        const currentDate = new Date();
        const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const previousMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const previousMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0); // Dernier jour du mois précédent

        // Compteurs pour les nouvelles inscriptions d'utilisateurs ce mois-ci vs le mois précédent
        let newUsersCurrentMonth = 0;
        let newUsersPreviousMonth = 0;
        let newTalentsCurrentMonth = 0;
        let newTalentsPreviousMonth = 0;
        let newManagersCurrentMonth = 0;
        let newManagersPreviousMonth = 0;

        allUsers.forEach(user => {
          const registrationDate = new Date(user.registrationDate); // Convertir la chaîne LocalDateTime en objet Date

          // Vérifier les nouvelles inscriptions du mois en cours
          if (registrationDate >= currentMonthStart && registrationDate <= currentDate) {
            newUsersCurrentMonth++;
            if (user.role?.role_name === 'TALENT') newTalentsCurrentMonth++;
            if (user.role?.role_name === 'MANAGER') newManagersCurrentMonth++;
          }

          // Vérifier les nouvelles inscriptions du mois précédent
          if (registrationDate >= previousMonthStart && registrationDate <= previousMonthEnd) {
            newUsersPreviousMonth++;
            if (user.role?.role_name === 'TALENT') newTalentsPreviousMonth++;
            if (user.role?.role_name === 'MANAGER') newManagersPreviousMonth++;
          }
        });

        // --- Calculer et mettre à jour les paramètres de changement pour les nouvelles inscriptions d'utilisateurs ---
        const usersStats = calculateChange(newUsersCurrentMonth, newUsersPreviousMonth);
        setUsersChange(usersStats.change);
        setUsersChangeType(usersStats.changeType);

        const talentsStats = calculateChange(newTalentsCurrentMonth, newTalentsPreviousMonth);
        setTalentsChange(talentsStats.change);
        setTalentsChangeType(talentsStats.changeType);

        const managersStats = calculateChange(newManagersCurrentMonth, newManagersPreviousMonth);
        setManagersChange(managersStats.change);
        setManagersChangeType(managersStats.changeType);

        // --- Récupérer toutes les offres ---
        const offersResponse = await Api.get('/offers/all', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const allOffers = offersResponse.data || offersResponse;
        if (!Array.isArray(allOffers)) {
          console.error('La réponse API pour les offres n\'est pas un tableau :', offersResponse);
          throw new Error('Données d\'offres invalides reçues de l\'API.');
        }

        // --- Calculer les totaux globaux pour les offres ---
        setOverallTotalOffers(allOffers.length.toLocaleString());

        // Compteurs pour les nouvelles publications d'offres ce mois-ci vs le mois précédent
        let newOffersCurrentMonth = 0;
        let newOffersPreviousMonth = 0;

        allOffers.forEach(offer => {
            const publicationDate = new Date(offer.datePublication); // Supposons que 'datePublication' est le champ pour la date de publication de l'offre

            // Vérifier les nouvelles publications du mois en cours
            if (publicationDate >= currentMonthStart && publicationDate <= currentDate) {
                newOffersCurrentMonth++;
            }

            // Vérifier les nouvelles publications du mois précédent
            if (publicationDate >= previousMonthStart && publicationDate <= previousMonthEnd) {
                newOffersPreviousMonth++;
            }
        });

        // --- Calculer et mettre à jour les paramètres de changement pour les nouvelles publications d'offres ---
        const offersStats = calculateChange(newOffersCurrentMonth, newOffersPreviousMonth);
        setOffersChange(offersStats.change);
        setOffersChangeType(offersStats.changeType);

      } catch (err) {
        console.error('Échec de la récupération des statistiques :', err);
        const errorMessage = err.response?.data?.message || err.message || 'Une erreur inattendue est survenue lors du chargement des statistiques.';
        setError(errorMessage);
        // Réinitialiser tous les états à leur valeur par défaut/erreur en cas d'échec
        setOverallTotalUsers('0');
        setOverallTotalTalents('0');
        setOverallTotalManagers('0');
        setOverallTotalOffers('0');
        setUsersChange('0%'); setUsersChangeType('neutral');
        setTalentsChange('0%'); setTalentsChangeType('neutral');
        setManagersChange('0%'); setManagersChangeType('neutral');
        setOffersChange('0%'); setOffersChangeType('neutral');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []); // Le tableau de dépendances vide signifie que cela s'exécute une seule fois au montage du composant

  const stats = [
    {
      id: 1,
      title: 'Total Utilisateurs',
      value: overallTotalUsers, // Total global
      icon: <Users size={18} />,
      change: usersChange, // Changement mensuel des nouvelles inscriptions
      changeType: usersChangeType
    },
    {
      id: 2,
      title: 'Total Talents',
      value: overallTotalTalents, // Total global
      icon: <UserCheck size={18} />,
      change: talentsChange, // Changement mensuel des nouvelles inscriptions
      changeType: talentsChangeType
    },
    {
      id: 3,
      title: 'Total Managers',
      value: overallTotalManagers, // Total global
      icon: <UserCog size={18} />,
      change: managersChange, // Changement mensuel des nouvelles inscriptions
      changeType: managersChangeType
    },
    {
      id: 4,
      title: 'Total d\'offres',
      value: overallTotalOffers, // Total global des offres
      icon: <Briefcase size={18} />,
      change: offersChange, // Changement mensuel des nouvelles publications d'offres
      changeType: offersChangeType
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-slate-600 dark:text-slate-400 py-10">
        <Loader2 size={48} className="animate-spin mb-4 text-sky-500" />
        <p className="text-xl font-medium">Chargement des statistiques...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-6 rounded-lg shadow-md border border-red-200 dark:border-red-700/50">
        <AlertTriangle size={48} className="mb-3 text-red-500 dark:text-red-400" />
        <p className="text-xl font-semibold mb-1">Erreur de chargement des statistiques</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <StatCard
          key={stat.id}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          change={stat.change}
          changeType={stat.changeType}
        />
      ))}
    </div>
  );
};

export default StatsOverview;
