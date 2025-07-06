import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Clock, Home, ArrowLeft } from 'lucide-react';

const PendingApprovalPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email; // Get email from state if passed during navigation

  // Your Website Logo Component/JSX
  const WebsiteLogo = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="bg-blue-600 w-16 h-16 flex items-center justify-center rounded-xl shadow-lg">
        <span className="text-white text-4xl font-extrabold">J</span>
      </div>
      <div className="flex flex-col ml-3">
        <span className="text-gray-900 text-4xl font-extrabold leading-none tracking-tight">Maroc</span>
        <span className="text-blue-600 text-lg font-semibold -mt-1 pl-12">JOB MAROC</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 text-gray-800 p-6 font-sans">
      {/* Back Button - Top Left */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
          aria-label="Retour à l'accueil"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">Retour à l'accueil</span>
        </button>
      </div>

      {/* Main Content Card */}
      <div className="relative z-0 text-center max-w-xl w-full bg-white shadow-xl rounded-xl p-8 md:p-10 border border-blue-100 transform transition-all duration-300 ease-in-out hover:scale-[1.01]">
        
        {/* Website Logo */}
        <WebsiteLogo />

        {/* Icon (optional, if you want to keep a small icon) */}
        <div className="mb-6">
          <Clock className="w-16 h-16 text-blue-500 mx-auto opacity-80" />
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 leading-tight">
          Votre compte est en attente d'activation
        </h1>

        {/* Dynamic Email Display (if available) */}
        {email && (
          <p className="text-gray-600 text-lg mb-4 font-medium">
            Un e-mail de confirmation a été envoyé à : <strong className="text-blue-600">{email}</strong>.
          </p>
        )}

        {/* Core Message */}
        <p className="text-gray-700 text-md md:text-lg mb-6 leading-relaxed">
          Merci de vous être inscrit(e) sur <strong>Job Maroc</strong>. Votre profil est en cours d'examen par notre équipe.
        </p>
        <p className="text-gray-500 text-sm md:text-base mb-8">
          Vous recevrez une notification par e-mail dès que votre compte sera activé. Cela peut prendre jusqu'à 24-48 heures.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            to="/"
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
          >
            <Home className="w-5 h-5 mr-2" />
            Retour à l'accueil
          </Link>
          <Link
            to="/#contact"
            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-blue-400 text-blue-700 bg-white hover:bg-blue-50 font-semibold rounded-lg shadow-sm transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-75"
          >
            <Mail className="w-5 h-5 mr-2" />
            Nous Contacter
          </Link>
        </div>
        
        {/* Footer */}
        <p className="mt-10 text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Job Maroc. Tous droits réservés.
        </p>
      </div>
    </div>
  );
};

export default PendingApprovalPage;