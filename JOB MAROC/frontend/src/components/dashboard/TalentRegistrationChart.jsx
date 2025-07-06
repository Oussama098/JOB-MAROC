import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Api } from '../../services/Api'; // Chemin ajusté pour Api (tentative de résolution si Api.js est directement sous src/)
import { Loader2, AlertTriangle, Info } from 'lucide-react';

const TalentRegistrationChart = () => {
  const [talentRegistrationData, setTalentRegistrationData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState(null);

  useEffect(() => {
    const fetchTalentRegistrationData = async () => {
      setChartLoading(true);
      setChartError(null);
      const token = localStorage.getItem('jwtToken');

      if (!token) {
        setChartError("Authentification requise pour charger les données du graphique.");
        setChartLoading(false);
        return;
      }

      try {
        const usersResponse = await Api.get('/users/all', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const allUsers = usersResponse.data || usersResponse;
        if (!Array.isArray(allUsers)) {
          console.error('La réponse API pour les utilisateurs n\'est pas un tableau:', usersResponse);
          throw new Error('Données utilisateur invalides reçues de l\'API.');
        }

        // Filter for 'TALENT' users
        const talentUsers = allUsers.filter(user => user.role?.role_name === 'TALENT');

        // --- Process data for the last 12 months ---
        const monthlyCounts = new Map(); // Map to store counts: 'YYYY-MM' -> count
        const monthNames = [
          'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
          'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
        ];

        // Initialize counts for the last 12 months
        const today = new Date();
        for (let i = 0; i < 12; i++) {
          const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const yearMonth = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
          monthlyCounts.set(yearMonth, 0); // Initialize with 0
        }

        talentUsers.forEach(user => {
          const registrationDate = new Date(user.registrationDate);
          if (!isNaN(registrationDate)) { // Ensure valid date
            const yearMonth = `${registrationDate.getFullYear()}-${(registrationDate.getMonth() + 1).toString().padStart(2, '0')}`;
            if (monthlyCounts.has(yearMonth)) { // Only count if within our 12-month window
              monthlyCounts.set(yearMonth, monthlyCounts.get(yearMonth) + 1);
            }
          }
        });

        // Convert map to array for Recharts, ensuring correct order
        const chartData = Array.from(monthlyCounts.keys())
          .sort() // Sort by YYYY-MM to ensure chronological order
          .map(yearMonth => {
            const [year, month] = yearMonth.split('-');
            const monthIndex = parseInt(month, 10) - 1;
            return {
              name: `${monthNames[monthIndex]} ${year.slice(2)}`, // e.g., "Jan 23"
              value: monthlyCounts.get(yearMonth)
            };
          });

        setTalentRegistrationData(chartData);

      } catch (err) {
        console.error('Échec du chargement des données d\'inscription des talents:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Une erreur inattendue est survenue lors du chargement des données du graphique.';
        setChartError(errorMessage);
      } finally {
        setChartLoading(false);
      }
    };

    fetchTalentRegistrationData();
  }, []); // Exécutez une seule fois au montage du composant

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Inscriptions de Talents par Mois</h3>
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
        ) : talentRegistrationData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <Info size={36} className="mb-3" />
            <p>Aucune donnée d'inscription de talent disponible.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={talentRegistrationData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="name" tick={{ fill: '#6B7280' }} />
              <YAxis tick={{ fill: '#6B7280' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} // Darker background
                itemStyle={{ color: '#E5E7EB' }} // Lighter text color
              />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" activeDot={{ r: 8 }} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default TalentRegistrationChart;
