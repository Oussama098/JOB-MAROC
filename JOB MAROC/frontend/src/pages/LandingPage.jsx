import { useState } from "react";
import { Briefcase,Info,MessageSquareMore ,ChartNoAxesGantt,ChevronDown ,Send ,Phone , BookOpen, Check, Star, ChevronRight, Menu, X, User, Mail, Key, Calendar, Clock, MapPin, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { ReactTyped } from "react-typed";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("talents");
  const [activeQuestion, setActiveQuestion] = useState(null);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  const toggleQuestion = (id) => {
    if (activeQuestion === id) {
      setActiveQuestion(null);
    } else {
      setActiveQuestion(id);
    }
  };

  // FAQ questions data
  const faqQuestions = [
    {
      id: 1,
      question: "Comment créer un compte sur Job Maroc ?",
      answer: "Pour créer un compte, cliquez sur le bouton 'S'inscrire' en haut à droite du site. Choisissez entre un profil 'Talent' ou 'Recruteur', puis remplissez le formulaire avec vos informations personnelles. Une fois votre email vérifié, vous pourrez accéder à votre compte."
    },
    {
      id: 2,
      question: "L'inscription est-elle gratuite  ?",
      answer: "Oui, l'inscription est totalement gratuite . Vous pourrez créer un profil complet, consulter toutes les offres d'emploi disponibles et postuler sans aucun frais."
    },
    {
      id: 3,
      question: "Quels types d'emplois puis-je trouver sur Job Maroc ?",
      answer: "Job Maroc propose une large variété d'emplois à temps partiel adaptés aux talent : service en restauration, vente, garde d'enfants, soutien scolaire, administration, marketing digital, etc. Tous les emplois sont conçus pour être compatibles avec un emploi du temps universitaire."
    },
    {
      id: 4,
      question: "Comment les recruteurs peuvent-ils publier une offre d'emploi ?",
      answer: "Les recruteurs doivent d'abord créer un compte et choisir l'un de nos forfaits. Ensuite, ils peuvent publier leurs offres via leur tableau de bord en cliquant sur 'Publier une offre', en remplissant tous les détails nécessaires comme le titre du poste, la description, le salaire et les horaires."
    },
    {
      id: 5,
      question: "Y a-t-il un service de support client disponible ?",
      answer: "Oui, notre équipe de support est disponible du lundi au vendredi de 9h à 18h. Vous pouvez nous contacter par email à support@job-maroc.ma ou par téléphone au +212 522 123 456. Nous nous efforçons de répondre à toutes les demandes dans un délai de 24 heures."
    }
  ];

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: "Hassan Driouch",
      role: "Etudiant a Epicerie",
      image: "/icon.jpg",
      quote: "Grâce à Job Maroc, j'ai trouvé un emploi à temps partiel dans un cabinet d'avocats qui me permet de financer mes études tout en acquérant une expérience professionnelle précieuse dans mon domaine.",
      stars: 5
    },
    {
      id: 2,
      name: "Oussama El Bakri",
      role: "Recruteur chez Capgemini",
      image: "/icon.jpg",
      quote: "La plateforme nous a permis de trouver rapidement des talents qualifiés et motivés pour nos postes en développement web. L'interface est intuitive et le support client est excellent.",
      stars: 4
    },
    {
      id: 3,
      name: "Bouhaddou Mohammed",
      role: "talent en Ai",
      image: "/icon.jpg",
      quote: "J'ai pu concilier mes études et un travail dans une agence de communication grâce à Job Maroc. Les horaires flexibles me permettent d'assister à tous mes cours tout en gagnant un revenu régulier.",
      stars: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation */}
      <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <div className="flex items-center">
              <div className="bg-[blue] w-12 h-12 flex items-center justify-center rounded-sm">
                <span className="text-white text-3xl font-bold">J</span>
              </div>
              <div className="flex flex-col ml-2">
                <span className="text-black text-3xl font-extrabold leading-none mt-2 pl-[-3px]">MAROC</span>
                <ReactTyped
                      strings={['MAROC', 'JOB MAROC']}
                      typeSpeed={140}
                      backSpeed={120}
                      loop
                    />
              </div>
            </div>

            {/* Menu Items for Desktop */}
            <div className="hidden md:flex md:space-x-8">
              <Link to="/" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-blue-500">
                Accueil
              </Link>
              <a href="#how-it-works" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300 border-b-2 border-transparent">
                Comment ça marche
              </a>
              <a href="#jobs" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300 border-b-2 border-transparent">
                Emplois
              </a>
              <a href="#testimonials" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300 border-b-2 border-transparent">
                Témoignages
              </a>
              <a href="#faq" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300 border-b-2 border-transparent">
                FAQ
              </a>
              <a href="#contact" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-gray-300 border-b-2 border-transparent">
                Contact
              </a>
            </div>
          </div>

          {/* Right Side - Login / Register */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link to="/login" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              Se connecter
            </Link>
            <Link to="/signup/choice" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300">
              S'inscrire
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <ChartNoAxesGantt className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="pt-2 pb-3 space-y-1">
            <a href="#" className="block pl-3 pr-4 py-2 border-l-4 border-blue-500 text-base font-medium text-blue-700 bg-blue-50">
              Accueil
            </a>
            <a href="#how-it-works" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300">
              Comment ça marche
            </a>
            <a href="#jobs" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300">
              Emplois
            </a>
            <a href="#testimonials" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300">
              Témoignages
            </a>
            <a href="#faq" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300">
              FAQ
            </a>
            <a href="#contact" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300">
              Contact
            </a>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <User className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-3">
                <Link to="/login" className="block text-base font-medium text-gray-800">Se connecter</Link>
                <Link to="/signup/choice" className="mt-1 block text-sm font-medium text-blue-600 hover:text-blue-500">
                  S'inscrire maintenant
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>



      {/* Hero Section */}
      <div className="bg-white pt-16">
        <div className="relative">
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gray-100" />
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="relative shadow-xl sm:rounded-2xl sm:overflow-hidden">
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-blue-600 mix-blend-multiply" />
              </div>
              <div className="relative px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8">
                <h1 className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                  <span className="block text-white">Trouvez l'offre d'emploi</span>
                  <span className="block text-blue-200">qui vous convient</span>
                </h1>
                <p className="mt-6 max-w-lg mx-auto text-center text-xl text-white sm:max-w-3xl">
                  Job Maroc est une paltform vous aide à trouver un emploi compatible avec vos formations. Des millieurs d'offres d'emploi dans toute le Maroc.
                </p>
                <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
                  <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
                    <Link
                      to="/signup/etudiant"
                      className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-blue-700 bg-white hover:bg-blue-100 sm:px-8"
                    >
                      Je suis Talent
                    </Link>
                    <Link
                      to="/signup/recruteur"
                      className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-500 bg-opacity-60 hover:bg-opacity-70 sm:px-8"
                    >
                      Je suis recruteur
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center bg-white p-6 rounded-lg shadow-sm">
              <p className="text-5xl font-extrabold text-blue-600">25k+</p>
              <p className="mt-2 text-lg font-medium text-gray-600">talents inscrits</p>
            </div>
            <div className="text-center bg-white p-6 rounded-lg shadow-sm">
              <p className="text-5xl font-extrabold text-blue-600">5k+</p>
              <p className="mt-2 text-lg font-medium text-gray-600">Entreprises partenaires</p>
            </div>
            <div className="text-center bg-white p-6 rounded-lg shadow-sm">
              <p className="text-5xl font-extrabold text-blue-600">10k+</p>
              <p className="mt-2 text-lg font-medium text-gray-600">Emplois pourvus</p>
            </div>
          </div>
        </div>
      </div>

      {/* How it works section */}
      <div id="how-it-works" className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Guide simple</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">Comment ça marche ?</p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Trois étapes simples pour trouver votre emploi idéal ou recruter le(a) candidat(e) parfait.
            </p>
          </div>

          <div className="mt-12">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
              <div>
                <div className="mt-10 space-y-12">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-blue-600 to-blue-400 text-white">
                        <User className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">1. Créez votre profil</h3>
                      <p className="mt-2 text-base text-gray-500">
                        Inscrivez-vous gratuitement et créez un profil complet mettant en avant vos compétences, disponibilités et préférences de travail.
                      </p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-blue-600 to-blue-400 text-white">
                        <Briefcase className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">2. Trouvez les opportunités</h3>
                      <p className="mt-2 text-base text-gray-500">
                        Explorez les milliers d'offres d'emploi à temps partiel adaptées à vos horaires d'études et à votre localisation.
                      </p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-blue-600 to-blue-400 text-white">
                        <Check className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">3. Postulez et décrochez le job</h3>
                      <p className="mt-2 text-base text-gray-500">
                        Postulez en quelques clics, recevez des réponses rapidement et commencez à gagner de l'argent tout en poursuivant vos études.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 -mx-4 lg:mt-0 relative">
                <div className="relative rounded-xl shadow-lg overflow-hidden">
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400" />
                  </div>
                  <div className="relative pt-10 pb-8 px-8 flex flex-col items-center">
                    <BookOpen className="h-16 w-16 text-white" />
                    <div className="mt-6 max-w-sm mx-auto text-center">
                      <h3 className="text-2xl font-bold text-white">Trouvez l'équilibre parfait</h3>
                      <p className="mt-3 text-lg text-blue-100">
                        Notre algorithme de matching intelligent vous connecte avec des emplois adaptés à votre emploi du temps universitaire.
                      </p>
                      <div className="mt-8">
                        <a
                          href="#"
                          className="px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                        >
                          En savoir plus
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Section */}
      <div id="jobs" className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Emplois populaires</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Découvrez nos dernières offres
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Des milliers d'offres d'emploi à temps partiel mises à jour quotidiennement.
            </p>
          </div>

          <div className="mt-10">
            <div className="flex justify-center mb-8">
              <div className="bg-white inline-flex p-1 rounded-lg shadow-sm">
                <button
                  onClick={() => setActiveTab("talents")}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    activeTab === "talents" ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Pour les talents
                </button>
                <button
                  onClick={() => setActiveTab("employers")}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    activeTab === "employers" ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Pour les recruteurs
                </button>
              </div>
            </div>

            {activeTab === "talents" && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Job Card 1 */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-lg text-gray-900">Serveur(se) - Temps partiel</div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        15€/h
                      </span>
                    </div>
                    <div className="mt-2 text-gray-500 text-sm">Restaurant Le Parisien</div>
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      Paris, 75008
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      15-20h par semaine, soirs et week-ends
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 line-clamp-3">
                        Nous recherchons un(e) serveur(se) dynamique pour notre restaurant. Expérience souhaitée mais pas obligatoire. Pourboires avantageux.
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                      Voir l'offre <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>
                </div>

                {/* Job Card 2 */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-lg text-gray-900">Assistant Marketing Digital</div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        18€/h
                      </span>
                    </div>
                    <div className="mt-2 text-gray-500 text-sm">Agence WebMarketing Pro</div>
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      Lyon, 69002
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      20h par semaine, horaires flexibles
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 line-clamp-3">
                        Rejoignez notre équipe pour gérer les réseaux sociaux et créer du contenu digital. Stage pouvant déboucher sur un CDI.
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                      Voir l'offre <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>
                </div>

                {/* Job Card 3 */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-lg text-gray-900">Livreur à vélo</div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        14€/h
                      </span>
                    </div>
                    <div className="mt-2 text-gray-500 text-sm">FoodExpress</div>
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      Marseille, 13001
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      10-30h par semaine, à la demande
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 line-clamp-3">
                        Livraison de repas à domicile. Vélo fourni. Travaillez quand vous voulez, idéal pour les talents.
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                      Voir l'offre <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "employers" && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Employer Card 1 */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-lg text-gray-900">Forfait Recrutement Standard</div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        299€
                      </span>
                    </div>
                    <div className="mt-3">
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Check className="flex-shrink-0 h-5 w-5 text-blue-500" />
                          <span className="ml-2 text-sm text-gray-500">Publication de 3 offres d'emploi</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="flex-shrink-0 h-5 w-5 text-blue-500" />
                          <span className="ml-2 text-sm text-gray-500">Accès à la CVthèque pendant 1 mois</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="flex-shrink-0 h-5 w-5 text-blue-500" />
                          <span className="ml-2 text-sm text-gray-500">Mise en avant durant 7 jours</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                      Choisir cette offre <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>
                </div>

                {/* Employer Card 2 */}
                <div className="bg-white overflow-hidden shadow rounded-lg border-2 border-blue-500">
                  <div className="p-1 bg-blue-500 text-center">
                    <span className="text-xs font-semibold uppercase tracking-wide text-white">Le plus populaire</span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-lg text-gray-900">Forfait Premium</div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        499€
                      </span>
                    </div>
                    <div className="mt-3">
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Check className="flex-shrink-0 h-5 w-5 text-blue-500" />
                          <span className="ml-2 text-sm text-gray-500">Publication de 10 offres d'emploi</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="flex-shrink-0 h-5 w-5 text-blue-500" />
                          <span className="ml-2 text-sm text-gray-500">Accès illimité à la CVthèque pendant 3 mois</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="flex-shrink-0 h-5 w-5 text-blue-500" />
                          <span className="ml-2 text-sm text-gray-500">Mise en avant durant 30 jours</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="flex-shrink-0 h-5 w-5 text-blue-500" />
                          <span className="ml-2 text-sm text-gray-500">Accompagnement personnalisé</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                      Choisir cette offre <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>
                </div>

                {/* Employer Card 3 */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-lg text-gray-900">Forfait Entreprise</div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Sur mesure
                      </span>
                    </div>
                    <div className="mt-3">
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Check className="flex-shrink-0 h-5 w-5 text-blue-500" />
                          <span className="ml-2 text-sm text-gray-500">Publications illimitées</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="flex-shrink-0 h-5 w-5 text-blue-500" />
                          <span className="ml-2 text-sm text-gray-500">Accès CVthèque illimité</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="flex-shrink-0 h-5 w-5 text-blue-500" />
                          <span className="ml-2 text-sm text-gray-500">API d'intégration</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="flex-shrink-0 h-5 w-5 text-blue-500" />
                          <span className="ml-2 text-sm text-gray-500">Gestionnaire de compte dédié</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                      Nous contacter <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-10 text-center">
              <a
                href="/login"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Voir toutes les offres <ChevronRight className="ml-2 h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

     {/* Testimonials section */}
     <div id="testimonials" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Témoignages</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Ils nous font confiance
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Découvrez ce que nos utilisateurs disent de leur expérience avec Job Maroc.
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center mb-4">
                      <img
                        className="h-12 w-12 rounded-full"
                        src={testimonial.image}
                        alt={testimonial.name}
                      />
                      <div className="ml-4">
                        <h4 className="text-lg font-bold text-gray-900">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < testimonial.stars ? "text-yellow-400" : "text-gray-300"
                          }`}
                          fill={i < testimonial.stars ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 text-center">
            <a
              href="#"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
            >
              Voir plus de témoignages <ChevronRight className="ml-2 h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      {/* FAQ section */}
      <div id="faq" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Questions fréquentes</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Vous avez des questions ?
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Nous avons les réponses. Si vous ne trouvez pas ce que vous cherchez, n'hésitez pas à nous contacter.
            </p>
          </div>

          <div className="mt-12 max-w-3xl mx-auto">
            <dl className="space-y-6">
              {faqQuestions.map((faq) => (
                <div key={faq.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <dt className="text-lg">
                    <button
                      onClick={() => toggleQuestion(faq.id)}
                      className="flex w-full items-start justify-between text-left p-6 focus:outline-none"
                    >
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      <span className="ml-6 h-7 flex items-center">
                        <ChevronDown
                          className={`h-6 w-6 transform ${activeQuestion === faq.id ? "-rotate-180" : "rotate-0"} text-blue-500 transition-transform duration-200 ease-in-out`}
                        />
                      </span>
                    </button>
                  </dt>
                  <dd 
                    className={`${activeQuestion === faq.id ? "block" : "hidden"} px-6 pb-6 text-base text-gray-600`}
                  >
                    <p>{faq.answer}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-12 text-center">
            <p className="text-lg text-gray-600">
              Vous ne trouvez pas la réponse à votre question ?
            </p>
            <a
              href="#contact"
              className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Contactez-nous
            </a>
          </div>
        </div>
      </div>

      {/* Contact section with Google Maps */}
      <div id="contact" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Contact</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Contactez-nous
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Notre équipe est à votre disposition pour répondre à toutes vos questions.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Contact form */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nom complet
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="votre.email@exemple.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                    Sujet
                  </label>
                  <div className="relative">
                  <Info  className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />

                    <select
                      id="subject"
                      name="subject"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                      <option>Information générale</option>
                      <option>Support technique</option>
                      <option>Partenariat</option>
                      <option>Facturation</option>
                      <option>Autre</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <div className="relative">
                  <MessageSquareMore className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Votre message..."
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Envoyer <Send className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Contact info and Google Maps */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-64 bg-gray-300 relative">
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3298.0980246138324!2d-6.587453388984623!3d34.24604227297237!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda759f000000001%3A0xb0f2670fb7c990f7!2sIbn%20Tofail%20University!5e0!3m2!1sen!2sma!4v1744293493053!5m2!1sen!2sma" 
                    width="600" 
                    height="450" 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full"
                  />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Nos coordonnées</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                    <div className="ml-3 text-gray-600">
                      <p>Maghreb Arabi Ouelad Oujih</p>
                      <p>Kénitra, 14000</p>
                      <p>Maroc</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                    <div className="ml-3 text-gray-600">
                      <p>+212 644965524</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                    <div className="ml-3 text-gray-600">
                      <p>contact@job-maroc.ma</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                    <div className="ml-3 text-gray-600">
                      <p>Lundi - Vendredi: 9h00 - 18h00</p>
                      <p>Fermé les weekends et jours fériés</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and info */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center">
                <div className="bg-blue-500 w-10 h-10 flex items-center justify-center rounded-sm">
                  <span className="text-white text-xl font-bold">J</span>
                </div>
                <div className="flex flex-col ml-2">
                  <span className="text-white text-xl font-bold">Maroc</span>
                  <span className="text-xs text-gray-400">Job Maroc</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-400">
                Connecter les talents avec des opportunités d'emploi flexibles depuis 2020.
              </p>
              <div className="mt-6 flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Links for talents */}
            <div>
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
                Pour les talents
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    Trouver un job
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    Créer un CV
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    Conseils de carrière
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    Blog talent
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    Programme d'ambassadeur
                  </a>
                </li>
              </ul>
            </div>

            {/* Links for employers */}
            <div>
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
                Pour les recruteurs
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    Publier une offre
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    Rechercher des CV
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    Solutions de recrutement
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    Tarifs entreprises
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    Témoignages recruteurs
                  </a>
                </li>
              </ul>
            </div>

            {/* Company & Legal */}
            <div>
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
                Société & Légal
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    À propos de nous
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    Conditions d'utilisation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    Politique de confidentialité
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    Nous rejoindre
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    Centre d'aide
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-gray-700 pt-8">
            <p className="text-base text-gray-400 text-center">
              &copy; {new Date().getFullYear()} Job Maroc. Tous droits réservés.
            </p>
          </div>
        </div>
        </footer>
      </div>
  )}