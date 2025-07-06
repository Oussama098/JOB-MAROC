import React, { useState, useEffect, useCallback } from 'react';
import { Api } from '../../services/Api';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Briefcase, UserCheck, LayoutDashboard, Loader2, Info, List, Clock, TrendingUp, DollarSign } from 'lucide-react'; // Added more icons for potential future use or design
import { useNavigate } from 'react-router-dom';

// Custom colors for charts - more vibrant and harmonious palettes
const COLORS_OFFER_STATUS = ['#6366F1', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6', '#EC4899']; // Indigo, Amber, Red, Emerald, Violet, Pink
const COLORS_APPLICATION_STATUS = ['#3B82F6', '#22C55E', '#FBBF24', '#F97316', '#6B7280', '#DC2626']; // Blue, Green, Yellow, Orange, Gray, Red

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState({
    totalOffersCreated: 0,
    offerStatusDistribution: [],
    totalApplicationsReceived: 0,
    applicationStatusDistribution: []
  });
  const [latestOffers, setLatestOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Function to detect dark mode, memoized with useCallback
  const detectDarkMode = useCallback(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  useEffect(() => {
    // Initial detection of dark mode
    detectDarkMode();

    // Listen for changes in the DOM to update dark mode status dynamically
    const observer = new MutationObserver(() => {
      detectDarkMode();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Cleanup observer on component unmount
    return () => observer.disconnect();
  }, [detectDarkMode]); // Re-run if detectDarkMode function changes (unlikely here but good practice)


  useEffect(() => {
    const fetchAndProcessDashboardData = async () => {
      setLoading(true);
      setError(null); // Clear previous errors
      const token = localStorage.getItem('jwtToken');
      const managerEmail = localStorage.getItem('username'); 

      if (!token || !managerEmail) {
        setError("Authentification requise. Veuillez vous connecter.");
        setLoading(false);
        return;
      }

      try {
        // Fetch Offers Data
        const offersResponse = await Api.get(`/offers/manager/${managerEmail}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const offers = offersResponse.data || [];
        console.log("Fetched raw offers data:", offers);

        // Sort offers by 'createdAt' (descending) or 'offer_id' as fallback for recency
        const sortedOffers = [...offers].sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            // Convert to Date objects for accurate comparison
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          // Fallback to offer_id if createdAt is not available or valid date string
          return (b.offer_id || 0) - (a.offer_id || 0); 
        });
        const top3Offers = sortedOffers.slice(0, 3);
        setLatestOffers(top3Offers); 

        // Calculate Offer Statistics
        const totalOffers = offers.length;
        const offerStatusMap = {};
        offers.forEach(offer => {
          const status = offer.status || 'NON_SPECIFIE'; // Use a default status if missing
          offerStatusMap[status] = (offerStatusMap[status] || 0) + 1;
        });
        const formattedOfferStatus = Object.entries(offerStatusMap).map(([status, count]) => ({
          status,
          count,
        }));

        // Fetch Applications Data
        const applicationsResponse = await Api.get(`/applications/manager/${managerEmail}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const applications = applicationsResponse.data || [];
        console.log("Fetched raw applications data:", applications);

        // Calculate Application Statistics
        const totalApplications = applications.length;
        const applicationStatusMap = {};
        applications.forEach(app => {
          const status = app.status || 'NON_SPECIFIE'; // Use a default status if missing
          applicationStatusMap[status] = (applicationStatusMap[status] || 0) + 1;
        });
        const formattedApplicationStatus = Object.entries(applicationStatusMap).map(([status, count]) => ({
          status,
          count,
        }));

        // Update state with combined and calculated statistics
        setDashboardStats({
          totalOffersCreated: totalOffers,
          offerStatusDistribution: formattedOfferStatus,
          totalApplicationsReceived: totalApplications,
          applicationStatusDistribution: formattedApplicationStatus
        });

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        const msg = err.response?.data?.message || err.message || "Erreur lors du chargement des données du tableau de bord.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessDashboardData();
  }, []); // Empty dependency array means this runs once on mount

  // Display loading state
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 bg-opacity-75 z-[100] transition-colors duration-300">
        <div className="flex flex-col items-center justify-center text-center text-slate-600 dark:text-slate-400 py-10">
          <Loader2 size={48} className="animate-spin mb-4 text-blue-500" />
          <p className="text-xl font-medium">Chargement du tableau de bord...</p>
          <p className="text-sm">Veuillez patienter un instant.</p>
        </div>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 p-6 rounded-lg shadow-md m-4 transition-colors duration-300">
        <Info size={48} className="mb-4" />
        <p className="text-xl font-semibold mb-2">Erreur de chargement !</p>
        <p className="text-lg text-center">{error}</p>
        <p className="text-sm mt-4">Veuillez vérifier votre connexion internet ou contacter l'administrateur si le problème persiste.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // Display no data state
  if (!dashboardStats.totalOffersCreated && !dashboardStats.totalApplicationsReceived) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 p-6 rounded-lg shadow-md m-4 transition-colors duration-300">
        <Info size={48} className="mb-4 text-blue-500" />
        <p className="text-xl font-medium mb-2">Aucune donnée de tableau de bord disponible.</p>
        <p className="text-base text-center">
          Il semble qu'aucune offre n'ait été publiée ou qu'aucune candidature n'ait été reçue pour votre entreprise.
        </p>
        <p className="text-sm mt-2">Veuillez commencer par publier des offres pour voir les statistiques ici.</p>
        <button
          onClick={() => navigate('/manager-space/offers')}
          className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-md
                     text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900
                     transition-all duration-300"
        >
          <Briefcase size={20} className="mr-2" /> Publier une offre
        </button>
      </div>
    );
  }

  // Helper function to format date for display
  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return 'Invalid Date';
    }
  };

  // Determine Recharts theme colors
  const gridStrokeColor = isDarkMode ? '#4a4a4a' : '#e0e0e0';
  const axisTickColor = isDarkMode ? '#CBD5E0' : '#6B7280'; 
  const tooltipFillColor = isDarkMode ? 'rgba(40,40,40,0.9)' : 'rgba(255,255,255,0.9)';
  const tooltipTextColor = isDarkMode ? '#E5E7EB' : '#374151';

  // Destructure from dashboardStats for cleaner JSX
  const { totalOffersCreated, offerStatusDistribution, totalApplicationsReceived, applicationStatusDistribution } = dashboardStats;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 font-sans transition-colors duration-300 ease-in-out">
      <div className="max-w-7xl mx-auto py-8"> {/* Increased vertical padding */}
        {/* Dashboard Header */}
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-10 flex items-center justify-center lg:justify-start animate-fade-in-down">
          <LayoutDashboard size={40} className="mr-4 text-blue-600 dark:text-blue-400" />
          Tableau de Bord Manager
        </h1>

        {/* Stat Cards - Enhanced Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 animate-fade-in">
          {/* Card 1: Offers Published */}
          <div className="relative bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-700 dark:to-blue-900 text-white p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer overflow-hidden">
            <div className="absolute inset-0 opacity-10 flex items-center justify-end pr-4">
              <Briefcase size={96} className="text-white" />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-light uppercase tracking-wider">Offres Publiées</p>
              <p className="text-5xl font-extrabold mt-2">{totalOffersCreated}</p>
            </div>
          </div>

          {/* Card 2: Applications Received */}
          <div className="relative bg-gradient-to-br from-green-500 to-green-700 dark:from-green-700 dark:to-green-900 text-white p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer overflow-hidden">
            <div className="absolute inset-0 opacity-10 flex items-center justify-end pr-4">
              <UserCheck size={96} className="text-white" />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-light uppercase tracking-wider">Candidatures Reçues</p>
              <p className="text-5xl font-extrabold mt-2">{totalApplicationsReceived}</p>
            </div>
          </div>

          {/* Card 3: Active Offers */}
          <div className="relative bg-gradient-to-br from-purple-500 to-purple-700 dark:from-purple-700 dark:to-purple-900 text-white p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer overflow-hidden">
            <div className="absolute inset-0 opacity-10 flex items-center justify-end pr-4">
              <TrendingUp size={96} className="text-white" />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-light uppercase tracking-wider">Offres Actives</p>
              <p className="text-5xl font-extrabold mt-2">
                {offerStatusDistribution.find(d => d.status === 'ACTIVE')?.count || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Charts Section - Refined Presentation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 animate-fade-in delay-100">
          {/* Offer Status Distribution Pie Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col justify-between items-center h-full">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b-2 border-blue-200 dark:border-blue-700 pb-2 w-full text-center">Statut des Offres</h2>
            {offerStatusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={offerStatusDistribution}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60} // Doughnut chart style
                    paddingAngle={5} // Small gap between slices
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false} // Hide lines to labels
                  >
                    {offerStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-offer-${index}`} fill={COLORS_OFFER_STATUS[index % COLORS_OFFER_STATUS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: tooltipFillColor, borderColor: isDarkMode ? '#6B7280' : '#E5E7EB', borderRadius: '8px' }}
                           itemStyle={{ color: tooltipTextColor }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center flex-grow text-gray-500 dark:text-gray-400 py-4">
                <Info size={32} className="mb-2" />
                <p>Pas de données pour le statut des offres.</p>
              </div>
            )}
          </div>

          {/* Application Status Distribution Bar Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col justify-between items-center h-full">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b-2 border-green-200 dark:border-green-700 pb-2 w-full text-center">Statut des Candidatures</h2>
            {applicationStatusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={applicationStatusDistribution}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} /> 
                  <XAxis dataKey="status" tick={{ fill: axisTickColor }} /> 
                  <YAxis tick={{ fill: axisTickColor }} /> 
                  <Tooltip contentStyle={{ backgroundColor: tooltipFillColor, borderColor: isDarkMode ? '#6B7280' : '#E5E7EB', borderRadius: '8px' }}
                           itemStyle={{ color: tooltipTextColor }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="count" name="Nombre" fill={COLORS_APPLICATION_STATUS[0]} radius={[8, 8, 0, 0]} barSize={40}>
                    {applicationStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-app-${index}`} fill={COLORS_APPLICATION_STATUS[index % COLORS_APPLICATION_STATUS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center flex-grow text-gray-500 dark:text-gray-400 py-4">
                <Info size={32} className="mb-2" />
                <p>Pas de données pour le statut des candidatures.</p>
              </div>
            )}
          </div>
        </div>

        {/* Latest Offers Table Section - Professional Look */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl animate-fade-in delay-200"> {/* Increased padding */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center border-b-2 border-gray-200 dark:border-gray-700 pb-3">
            <List size={28} className="mr-3 text-blue-600 dark:text-blue-400" /> Dernières Offres Publiées
          </h2>
          {latestOffers.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700"> {/* Added border to table container */}
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Titre de l'Offre
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Statut
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Date de Création
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {latestOffers.map((offer) => (
                    <tr key={offer.offer_id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {offer.title || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${offer.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                            offer.status === 'INACTIVE' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'}`}>
                          {offer.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <div className="flex items-center">
                            <Clock size={16} className="mr-2 text-gray-400" />
                            {formatDisplayDate(offer.createdAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center">
              <Info size={32} className="mb-4" />
              <p className="text-lg font-medium">Aucune offre récente trouvée.</p>
              <p className="text-sm">Veuillez publier de nouvelles offres pour les voir apparaître ici.</p>
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/manager-space/offers')}
              className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-semibold rounded-lg shadow-xl
                         text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900
                         transition-all duration-300 transform hover:scale-105 group"
            >
              <List size={24} className="mr-3 group-hover:rotate-6 transition-transform duration-200" /> 
              Voir toutes les offres
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
