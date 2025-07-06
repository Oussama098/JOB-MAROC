import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Briefcase,ArrowLeft } from 'lucide-react';

export default function SignupChoice() {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleSelection = (role) => {
    setSelectedRole(role);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
      <div className="w-full max-w-md mb-4">
  <button
    onClick={() => window.history.back()}
    className="flex items-center text-gray-600 hover:text-green-600 transition-colors duration-200"
  >
    <ArrowLeft className="h-5 w-5 mr-1" />
    <span className="text-sm font-medium">Retour</span>
  </button>
</div>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Choisir un type de compte
        </h2>
        

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Carte Étudiant */}
          <label
            className={`flex flex-col items-center p-6 ${selectedRole === 'etudiant' ? 'bg-green-100' : 'bg-white'} border-2 border-gray-300 rounded-lg shadow-lg hover:shadow-2xl cursor-pointer transition-all duration-300`}
            onClick={() => handleSelection('etudiant')}
          >
            <div className="flex flex-col items-center space-y-4">
              <User className="w-16 h-16 text-green-600" />
              <span className="text-xl font-semibold text-gray-800">Talent</span>
              <p className="text-center text-sm text-gray-600">
                Si vous êtes un talent à la recherche d'opportunités professionnelles, inscrivez-vous ici.
              </p>
            </div>
            <div className="mt-4 p-2 bg-green-600 text-white rounded-md text-center w-full">
            <Link to="/signup/etudiant">Sélectionner</Link> 
            </div>
          </label>

          {/* Carte Recruteur */}
          <label
            className={`flex flex-col items-center p-6 ${selectedRole === 'recruteur' ? 'bg-blue-100' : 'bg-white'} border-2 border-gray-300 rounded-lg shadow-lg hover:shadow-2xl cursor-pointer transition-all duration-300`}
            onClick={() => handleSelection('recruteur')}
          >
            <div className="flex flex-col items-center space-y-4">
              <Briefcase className="w-16 h-16 text-blue-600" />
              <span className="text-xl font-semibold text-gray-800">Manager</span>
              <p className="text-center text-sm text-gray-600">
                Si vous êtes gestionnaire à la recherche de talents, sélectionnez cette option pour publier vos offres.
              </p>
            </div>
            <div className="mt-4 p-2 bg-blue-600 text-white rounded-md text-center w-full">
              <Link to="/signup/recruteur">Sélectionner</Link> 
            </div>
          </label>
        </div>

        <div className="text-center mt-8">
        <span>
            Déjà un compte  ?{" "}
            <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
              Se connecter
            </Link>
            </span>
        </div>
      </div>
    </div>
  );
}
