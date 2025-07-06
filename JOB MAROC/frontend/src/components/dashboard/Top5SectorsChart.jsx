import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Api } from '../../services/Api';
import { Loader2, AlertTriangle, Info } from 'lucide-react';

const Top5SectorsChart = () => {
  const [sectorsData, setSectorsData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState(null);

  useEffect(() => {
    const fetchSectorsData = async () => {
      setChartLoading(true);
      setChartError(null);
      const token = localStorage.getItem('jwtToken');

      if (!token) {
        setChartError("Authentification requise pour charger les données du graphique.");
        setChartLoading(false);
        return;
      }

      try {
        // --- NOUVEAU : Appel au nouvel endpoint backend pour les statistiques agrégées ---
        const response = await Api.get('/statistics/top5-sectors', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = response.data; // Le backend renvoie déjà le tableau de SectorCountDto
        if (!Array.isArray(data)) {
          console.error('La réponse API pour les secteurs est invalide:', response);
          throw new Error('Données de secteurs invalides reçues du backend.');
        }

        setSectorsData(data); // Définir directement les données reçues
        // --- FIN NOUVEAU ---

      } catch (err) {
        console.error('Échec du chargement des données des secteurs d\'activité:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Une erreur inattendue est survenue lors du chargement des données du graphique.';
        setChartError(errorMessage);
      } finally {
        setChartLoading(false);
      }
    };

    fetchSectorsData();
  }, []); // Exécutez une seule fois au montage du composant

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top 5 des Secteurs d'Activité</h3>
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
        ) : sectorsData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <Info size={36} className="mb-3" />
            <p>Aucune donnée de secteur d'activité disponible.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sectorsData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis type="number" tick={{ fill: '#6B7280' }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#6B7280' }} width={80} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#E5E7EB' }}
              />
              <Bar dataKey="count" fill="#3B82F6" name="Nombre d'offres" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Top5SectorsChart;
