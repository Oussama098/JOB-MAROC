import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Api } from '../../services/Api'; // Assurez-vous que le chemin est correct
import { Loader2, AlertTriangle, Info } from 'lucide-react';

const OffersByModalityChart = () => {
  const [modalityData, setModalityData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  useEffect(() => {
    const fetchModalityData = async () => {
      setChartLoading(true);
      setChartError(null);
      const token = localStorage.getItem('jwtToken');

      if (!token) {
        setChartError("Authentification requise pour charger les données du graphique.");
        setChartLoading(false);
        return;
      }

      try {
        // --- CHANGEMENT ICI : Appel au nouvel endpoint backend ---
        const response = await Api.get('/statistics/offers-by-modality', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = response.data; // Le backend renvoie déjà le tableau agrégé
        if (!Array.isArray(data)) {
          console.error('La réponse API pour les modalités est invalide:', response);
          throw new Error('Données de modalités invalides reçues du backend.');
        }

        setModalityData(data); // Définir directement les données reçues du backend

      } catch (err) {
        console.error('Échec du chargement des données de modalité des offres:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Une erreur inattendue est survenue lors du chargement des données du graphique.';
        setChartError(errorMessage);
      } finally {
        setChartLoading(false);
      }
    };

    fetchModalityData();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Répartition des Offres par Modalité</h3>
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
        ) : modalityData.length === 0 || modalityData.every(item => item.value === 0) ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <Info size={36} className="mb-3" />
            <p>Aucune donnée de modalité d'offres disponible.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={modalityData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {modalityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#E5E7EB' }}
              />
              <Legend wrapperStyle={{ color: '#E5E7EB', paddingTop: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default OffersByModalityChart;
