import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Api } from '../../services/Api'; // Vérifiez le chemin !
import { Loader2, AlertTriangle, Info } from 'lucide-react';

const OffersByStudyLevelChart = () => {
  const [studyLevelData, setStudyLevelData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState(null);

  // La fonction normalizeStudyLevel est désormais dans le backend et n'est plus nécessaire ici.

  useEffect(() => {
    const fetchStudyLevelData = async () => {
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
        const response = await Api.get('/statistics/offers-by-study-level', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = response.data; // Le backend renvoie déjà le tableau agrégé et normalisé
        if (!Array.isArray(data)) {
          console.error('La réponse API pour les niveaux d\'études est invalide:', response);
          throw new Error('Données de niveaux d\'études invalides reçues du backend.');
        }

        setStudyLevelData(data); // Définir directement les données reçues du backend

      } catch (err) {
        console.error('Échec du chargement des données des niveaux d\'études:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Une erreur inattendue est survenue lors du chargement des données du graphique.';
        setChartError(errorMessage);
      } finally {
        setChartLoading(false);
      }
    };

    fetchStudyLevelData();
  }, []); // Exécutez une seule fois au montage du composant

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">les Profils les Plus Demandés</h3>
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
        ) : studyLevelData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <Info size={36} className="mb-3" />
            <p>Aucune donnée de niveau d'études disponible.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={studyLevelData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis 
                type="category" 
                dataKey="name" 
                tick={{ fill: '#6B7280' }} 
                angle={-45}
                textAnchor="end"
                height={80}
              /> 
              <YAxis type="number" tick={{ fill: '#6B7280' }} /> 
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

export default OffersByStudyLevelChart;
