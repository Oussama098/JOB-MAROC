// TalentHelpAndSupport.jsx
import React, { useState } from 'react';
import {
    LifeBuoy, HelpCircle, Mail, Phone, MessageSquare, BookOpen, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';

const TalentHelpAndSupport = () => {
    // State to manage the open/close state of FAQ items
    const [openFaq, setOpenFaq] = useState(null);

    // Function to toggle FAQ item visibility
    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    // Define FAQ data
    const faqs = [
        {
            question: "Comment puis-je mettre à jour mes informations personnelles ?",
            answer: "Vous pouvez mettre à jour vos informations personnelles en allant sur la page 'Paramètres du profil' et en sélectionnant la section 'Informations personnelles'. N'oubliez pas d'enregistrer vos modifications."
        },
        {
            question: "Comment télécharger un nouveau CV ou gérer mes CVs existants ?",
            answer: "Rendez-vous sur la page 'Paramètres du profil', puis accédez à la section 'CVs'. Vous pourrez y télécharger un nouveau fichier ou supprimer ceux qui sont déjà en ligne."
        },
        {
            question: "Je rencontre un problème technique, que dois-je faire ?",
            answer: "Si vous rencontrez un problème technique, veuillez nous contacter via le formulaire de contact ou par email. Décrivez le problème en détail et, si possible, incluez des captures d'écran."
        },
        {
            question: "Comment postuler à une offre d'emploi ?",
            answer: "Pour postuler à une offre, naviguez vers la page 'Offres d'emploi', cliquez sur l'offre qui vous intéresse, puis utilisez le bouton 'Postuler' sur la page de détails de l'offre."
        },
        {
            question: "Comment puis-je changer mon mot de passe ?",
            answer: "Vous pouvez changer votre mot de passe depuis la page 'Paramètres du profil', dans la section 'Changer le mot de passe'. Vous devrez entrer votre mot de passe actuel avant de définir un nouveau mot de passe."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 py-10 sm:py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <h1 className="text-4xl font-extrabold mb-10 text-center text-blue-700 dark:text-blue-400">
                    Aide et Support
                </h1>

                {/* FAQ Section */}
                <section className="mb-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-7 border border-gray-100 dark:border-gray-700">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                        <HelpCircle className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" /> Questions Fréquentes (FAQ)
                    </h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                <button
                                    className="flex justify-between items-center w-full p-4 text-left font-semibold text-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                                    onClick={() => toggleFaq(index)}
                                >
                                    {faq.question}
                                    {openFaq === index ? (
                                        <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                    )}
                                </button>
                                {openFaq === index && (
                                    <div className="p-4 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                                        <p>{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Contact Support Section */}
                <section className="mb-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-7 border border-gray-100 dark:border-gray-700">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                        <LifeBuoy className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" /> Contacter le Support
                    </h2>
                    <div className="space-y-4 text-lg text-gray-700 dark:text-gray-300">
                        <p>Si vous ne trouvez pas la réponse à votre question dans la FAQ, n'hésitez pas à nous contacter.</p>
                        <ul className="space-y-3">
                            <li className="flex items-center">
                                <Mail className="h-6 w-6 text-blue-500 mr-3 flex-shrink-0" />
                                <span className="font-semibold">Email:</span> <a href="mailto:oussamaelbakri92@gmail.com" className="text-blue-600 hover:underline dark:text-blue-400">oussamaelbakri92@gmail.com</a>
                            </li>
                            <li className="flex items-center">
                                <Phone className="h-6 w-6 text-blue-500 mr-3 flex-shrink-0" />
                                <span className="font-semibold">Téléphone:</span> <a href="tel:+1234567890" className="text-blue-600 hover:underline dark:text-blue-400">+212 617 057 583</a>
                            </li>
                            <li className="flex items-center">
                                <MessageSquare className="h-6 w-6 text-blue-500 mr-3 flex-shrink-0" />
                                <span className="font-semibold">Formulaire de contact:</span> <a href="/#contact" className="text-blue-600 hover:underline dark:text-blue-400 inline-flex items-center">Remplir le formulaire <ExternalLink className="h-4 w-4 ml-1" /></a>
                            </li>
                        </ul>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                            Nous nous efforçons de répondre à toutes les demandes dans les 24 heures ouvrables.
                        </p>
                    </div>
                </section>

                {/* Resources Section (Optional) */}
                <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-7 border border-gray-100 dark:border-gray-700">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                        <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" /> Ressources Utiles
                    </h2>
                    <ul className="space-y-3 text-lg text-gray-700 dark:text-gray-300">
                        <li className="flex items-center">
                            <ExternalLink className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
                            <a href="/faq-complete" className="text-blue-600 hover:underline dark:text-blue-400 inline-flex items-center">
                                Guide Complet pour les Talents <ExternalLink className="h-4 w-4 ml-1" />
                            </a>
                        </li>
                        <li className="flex items-center">
                            <ExternalLink className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
                            <a href="/terms-of-service" className="text-blue-600 hover:underline dark:text-blue-400 inline-flex items-center">
                                Conditions Générales d'Utilisation <ExternalLink className="h-4 w-4 ml-1" />
                            </a>
                        </li>
                        <li className="flex items-center">
                            <ExternalLink className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
                            <a href="/privacy-policy" className="text-blue-600 hover:underline dark:text-blue-400 inline-flex items-center">
                                Politique de Confidentialité <ExternalLink className="h-4 w-4 ml-1" />
                            </a>
                        </li>
                    </ul>
                </section>
            </div>
        </div>
    );
};

export default TalentHelpAndSupport;
