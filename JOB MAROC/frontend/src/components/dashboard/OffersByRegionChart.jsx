import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Api } from '../../services/Api'; // Assurez-vous que ce chemin est correct
import { Loader2, AlertTriangle, Info } from 'lucide-react';

const OffersByRegionChart = () => {
  const [regionsData, setRegionsData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState(null);

  // Les fonctions normalizeRegion et removeAccents sont désormais dans le backend et ne sont plus nécessaires ici.

  useEffect(() => {
    const fetchRegionsData = async () => {
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
        const response = await Api.get('/statistics/offers-by-region', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = response.data; // Le backend renvoie déjà le tableau agrégé et normalisé
        if (!Array.isArray(data)) {
          console.error('La réponse API pour les régions est invalide:', response);
          throw new Error('Données de régions invalides reçues du backend.');
        }

        // Le backend filtre déjà les régions avec count 0, sauf "Non spécifié".
        setRegionsData(data);

      } catch (err) {
        console.error('Échec du chargement des données des régions:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Une erreur inattendue est survenue lors du chargement des données du graphique.';
        setChartError(errorMessage);
      } finally {
        setChartLoading(false);
      }
    };

    fetchRegionsData();
  }, []); // Exécutez une seule fois au montage du composant

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Offres par Région au Maroc</h3>
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
        ) : regionsData.length === 0 || (regionsData.length === 1 && regionsData[0].name === 'Non spécifié' && regionsData[0].count === 0) ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <Info size={36} className="mb-3" />
            <p>Aucune donnée d'offres disponible par région au Maroc.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={regionsData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis 
                type="category" 
                dataKey="name" 
                tick={{ fill: '#6B7280', fontSize: 10 }} 
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

export default OffersByRegionChart;
