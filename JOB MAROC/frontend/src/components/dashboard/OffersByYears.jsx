import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Api } from '../../services/Api'; // Assurez-vous que le chemin est correct pour votre structure de projet
import { Loader2, AlertTriangle, Info } from 'lucide-react';

const OffersMonthlyByYearChart = () => {
  const [offersData, setOffersData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString()); // État pour l'année sélectionnée, par défaut l'année en cours
  const [availableYears, setAvailableYears] = useState([]); // État pour les années disponibles dans la liste déroulante

  useEffect(() => {
    const fetchAndProcessOffersData = async () => {
      setChartLoading(true);
      setChartError(null);
      const token = localStorage.getItem('jwtToken');

      if (!token) {
        setChartError("Authentification requise pour charger les données du graphique.");
        setChartLoading(false);
        return;
      }

      try {
        const offersResponse = await Api.get('/offers/all', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const allOffers = offersResponse.data || offersResponse;
        if (!Array.isArray(allOffers)) {
          console.error('La réponse API pour les offres n\'est pas un tableau:', offersResponse);
          throw new Error('Données d\'offres invalides reçues de l\'API.');
        }

        // --- Determine available years for the dropdown ---
        const years = new Set();
        allOffers.forEach(offer => {
          const publicationDate = new Date(offer.datePublication);
          if (!isNaN(publicationDate)) {
            years.add(publicationDate.getFullYear().toString());
          }
        });
        const sortedYears = Array.from(years).sort((a, b) => parseInt(b, 10) - parseInt(a, 10)); // Sort descending
        setAvailableYears(sortedYears);

        // Set default selectedYear if none is explicitly set or if current one is not in available years
        if (!selectedYear || !sortedYears.includes(selectedYear)) {
          setSelectedYear(sortedYears[0] || new Date().getFullYear().toString());
        }


        // --- Process data for the selected year by month ---
        const monthlyCounts = new Map();
        const monthNames = [
          'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
          'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
        ];

        // Initialize counts for all 12 months to 0 for the selected year
        for (let i = 0; i < 12; i++) {
          monthlyCounts.set(i, 0); // Use month index (0-11) as key
        }

        allOffers.forEach(offer => {
          const publicationDate = new Date(offer.datePublication);
          if (!isNaN(publicationDate) && publicationDate.getFullYear().toString() === selectedYear) {
            const monthIndex = publicationDate.getMonth(); // 0 for January, 11 for December
            monthlyCounts.set(monthIndex, monthlyCounts.get(monthIndex) + 1);
          }
        });

        // Convert map to array for Recharts, ensuring correct order (January to December)
        const chartData = Array.from(monthlyCounts.entries())
          .sort((a, b) => a[0] - b[0]) // Sort by month index
          .map(([monthIndex, count]) => ({
            name: monthNames[monthIndex], // Month name for X-axis
            count // The number of offers for that month
          }));

        setOffersData(chartData);

      } catch (err) {
        console.error('Échec du chargement des données des offres par mois:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Une erreur inattendue est survenue lors du chargement des données du graphique.';
        setChartError(errorMessage);
      } finally {
        setChartLoading(false);
      }
    };

    // This effect now depends on selectedYear to re-fetch/re-process data
    // It also runs on initial mount.
    fetchAndProcessOffersData();
  }, [selectedYear]); // Re-run effect when selectedYear changes

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Offres par Mois ({selectedYear})
      </h3>

      {/* Year Selection Dropdown */}
      <div className="mb-4">
        <label htmlFor="year-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Sélectionner l'année :
        </label>
        <select
          id="year-select"
          value={selectedYear}
          onChange={handleYearChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
        >
          {availableYears.length > 0 ? (
            availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))
          ) : (
            <option value="">Chargement des années...</option>
          )}
        </select>
      </div>


      <div className="h-64">
        {chartLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 dark:text-slate-400">
            <Loader2 size={36} className="animate-spin mb-3 text-sky-500" />
            <p>Chargement du graphique...</p>
          </div>
        ) : chartError ? (
          <div className="flex flex-col items-center justify-center h-full bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg">
            <AlertTriangle size={36} className="mb-3 text-red-500 dark:text-red-400" />
            <p className="text-center">Erreur: {chartError}</p>
          </div>
        ) : offersData.length === 0 || offersData.every(item => item.count === 0) ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <Info size={36} className="mb-3" />
            <p>Aucune offre publiée pour l'année sélectionnée.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={offersData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="name" tick={{ fill: '#6B7280' }} />
              <YAxis tick={{ fill: '#6B7280' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#E5E7EB' }}
              />
              <Legend wrapperStyle={{ color: '#E5E7EB' }} />
              <Bar dataKey="count" fill="#3B82F6" name="Nombre d'offres" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default OffersMonthlyByYearChart;
