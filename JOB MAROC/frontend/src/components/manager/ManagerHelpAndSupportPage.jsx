import React, { useState } from 'react';
import {
    ChevronDown,
    Mail,
    Phone,
    ExternalLink,
} from 'lucide-react';

const ManagerHelpAndSupportPage = () => {
    const [openFaq, setOpenFaq] = useState(null);

    const faqData = [
        {
            id: 1,
            question: "Comment créer et gérer des offres d'emploi ?",
            answer:
                "Accédez à la section 'Tableau de board'. Cliquez sur 'Créer une offre' pour en ajouter une nouvelle, Assurez-vous de remplir tous les champs obligatoires avant de publier. Vous pouvez également supprimer une offre existante depuis la liste. .",
        },
        {
            id: 2,
            question: "Comment voir les talents qui ont postulé à mes offres ?",
            answer:
                "Dans la section 'Tableau de board', sélectionnez une offre pour voir la liste des talents qui ont postulé. Vous pouvez consulter leur profil, télécharger leur CV, et les contacter si besoin.",
        },
        {
            id: 3,
            question: "Comment modifier mes informations personnelles ?",
            answer:
                "Allez dans votre profil depuis le menu en haut à droite. Cliquez sur 'Paramètres' pour mettre à jour vos informations personnelles comme votre nom, prénom, mot de passe, etc.",
        },
        {
            id: 4,
            question: "Comment mettre à jour les informations de mon entreprise ?",
            answer:
                "Accédez à la section 'Entreprise' dans votre profil. Vous pouvez y modifier le nom, l'adresse, la description et le logo de votre entreprise. Les modifications doivent être enregistrées pour être prises en compte.",
        },
        {
            id: 5,
            question: "Je rencontre un problème technique, que faire ?",
            answer:
                "Vérifiez votre connexion Internet et rechargez la page. Si le problème persiste, contactez le support technique avec une description du bug, l’heure de l’erreur, et une capture d’écran si possible.",
        },
    ];

    const toggleFaq = (id) => {
        setOpenFaq(openFaq === id ? null : id);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                    Aide et Support Manager
                </h1>
                <p className="text-gray-700 dark:text-gray-300 mb-8 text-center">
                    Bienvenue sur la page d'aide dédiée aux managers. Vous trouverez ici des réponses aux questions fréquentes concernant la gestion des offres, des talents et des informations de votre entreprise.
                </p>

                {/* FAQ Section */}
                <section className="mb-10">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-5 border-b-2 border-indigo-500 pb-2">
                        FAQ Manager
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

                {/* Support Section */}
                <section className="mb-10">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-5 border-b-2 border-indigo-500 pb-2">
                        Support Technique
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                        Pour tout problème technique ou question spécifique, veuillez contacter :
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
                            <Mail className="h-6 w-6 text-indigo-500 mr-3" />
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Email Support</p>
                                <a
                                    href="mailto:oussamaelbakri92@gmail.com"
                                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    oussamaelbakri92@gmail.com
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
                            <Phone className="h-6 w-6 text-indigo-500 mr-3" />
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Ligne d'Urgence</p>
                                <a
                                    href="tel:+212617057582"
                                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    +212 61 705 7582
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Resources Section */}
                <section>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-5 border-b-2 border-indigo-500 pb-2">
                        Documentation et Ressources
                    </h2>
                    <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                        <li>
                            <a href="#" className="flex items-center text-indigo-600 dark:text-indigo-400 hover:underline">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Guide du Manager (PDF)
                            </a>
                        </li>
                        <li>
                            <a href="#" className="flex items-center text-indigo-600 dark:text-indigo-400 hover:underline">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Tutoriel Vidéo : Créer une offre
                            </a>
                        </li>
                        <li>
                            <a href="#" className="flex items-center text-indigo-600 dark:text-indigo-400 hover:underline">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Foire aux Questions Générale
                            </a>
                        </li>
                    </ul>
                </section>
            </div>
        </div>
    );
};

export default ManagerHelpAndSupportPage;
