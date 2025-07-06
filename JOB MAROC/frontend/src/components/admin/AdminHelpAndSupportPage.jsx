import React, { useState } from 'react';
import { ChevronDown, Mail, Phone, ExternalLink, HardDrive, Settings, Users, Briefcase } from 'lucide-react';

const AdminHelpAndSupportPage = () => {
  // État pour gérer l'ouverture/fermeture des accordéons de la FAQ
  const [openFaq, setOpenFaq] = useState(null);

  const faqData = [
    {
      id: 1,
      question: "Comment gérer les comptes utilisateurs (Talents et Managers) ?",
      answer: "Accédez à la section 'Utilisateurs' dans le menu latéral. Vous pouvez rechercher, modifier les rôles, activer/désactiver des comptes, ou supprimer des utilisateurs. Chaque modification doit être confirmée."
    },
    {
      id: 2,
      question: "Comment vérifier et modérer les offres d'emploi ?",
      answer: "Rendez-vous dans la section 'Offres'. Vous y trouverez toutes les offres publiées. Vous pouvez les consulter en détail, modifier leur statut (actif, inactif, expiré), ou archiver celles qui ne sont plus pertinentes. Utilisez les filtres pour affiner votre recherche."
    },
    {
      id: 3,
      question: "Comment accéder aux statistiques et aux rapports du tableau de bord ?",
      answer: "Le tableau de bord principal affiche un aperçu des statistiques clés. Pour des rapports plus détaillés ou pour exporter des données, naviguez vers la section 'Rapports' ou les graphiques spécifiques comme 'Offres par Mois' pour des vues granulaires."
    },
    {
      id: 4,
      question: "Que faire en cas d'erreur de données ou de problème de performance ?",
      answer: "Vérifiez d'abord les logs d'erreurs dans la console de votre navigateur. Si le problème persiste, contactez le support technique en fournissant une description détaillée de l'erreur, les étapes pour la reproduire, et toute capture d'écran pertinente."
    },
    {
      id: 5,
      question: "Comment mettre à jour les informations de configuration du système ?",
      answer: "Les paramètres de configuration avancés sont accessibles via la section 'Paramètres Système' (si disponible). Soyez prudent lors des modifications car elles peuvent affecter le comportement global de la plateforme. Contactez l'équipe de développement si vous n'êtes pas sûr d'une modification."
    }
  ];

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Aide et Support Administrateur
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mb-8 text-center">
          Bienvenue sur la page d'aide et de support dédiée aux administrateurs. Trouvez des réponses aux questions courantes concernant la gestion de la plateforme.
        </p>

        {/* Section FAQ Admin */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-5 border-b-2 border-indigo-500 pb-2">
            FAQ Administrateur
          </h2>
          <div className="space-y-4">
            {faqData.map((item) => (
              <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <button
                  className="w-full flex justify-between items-center p-4 text-left font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                  onClick={() => toggleFaq(item.id)}
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform duration-300 ${
                      openFaq === item.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === item.id && (
                  <div className="p-4 pt-0 text-gray-600 dark:text-gray-400">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section Support Technique */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-5 border-b-2 border-indigo-500 pb-2">
            Support Technique
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Pour tout problème technique complexe ou assistance de développement, veuillez contacter :
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
              <Mail className="h-6 w-6 text-indigo-500 mr-3" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email du Support Dev</p>
                <a href="mailto:devsupport@example.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                  oussamaelbakri92@gmail.com
                </a>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-500 dark:bg-gray-700 rounded-lg shadow-sm">
              <Phone className="h-6 w-6 text-indigo-500 mr-3" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Ligne d'Urgence Tech</p>
                <a href="tel:+212-99-9999-9999" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                  +212 61 705 7582
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Section Documentation et Ressources */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-5 border-b-2 border-indigo-500 pb-2">
            Documentation et Ressources
          </h2>
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li>
              <a href="#" className="flex items-center text-indigo-600 dark:text-indigo-400 hover:underline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Manuel de l'Administrateur (PDF)
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center text-indigo-600 dark:text-indigo-400 hover:underline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Documentation API (pour intégration)
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center text-indigo-600 dark:text-indigo-400 hover:underline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Politiques de Sécurité et de Confidentialité des Données
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center text-indigo-600 dark:text-indigo-400 hover:underline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Statut du Système (Page de Statut)
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default AdminHelpAndSupportPage;
