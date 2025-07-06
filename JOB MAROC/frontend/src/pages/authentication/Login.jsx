import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Globe, ChevronDown, Eye, EyeOff, Lock, Mail, ArrowLeft } from "lucide-react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import LoginGoogle from "../../components/LoginGoogle";
import { Api } from "../../services/Api";
import { ReactTyped } from 'react-typed'; // Import ReactTyped

// Validation schema using Yup
const schema = yup.object({
  username: yup.string().email("Email invalide").required("Email requis"),
  password: yup.string().required("Mot de passe requis"),
}).required();

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [signOutMessage, setSignOutMessage] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    mode: "onSubmit",
    resolver: yupResolver(schema),
  });

  // Effect to check for sign-out message in navigation state
  useEffect(() => {
    if (location.state && location.state.signedOut) {
      console.log("Received sign-out state:", location.state);
      setSignOutMessage(location.state.message || 'You have been signed out successfully.');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // --- Submit Handler with Role-Based Redirection ---
  const submit = async (data) => {
    setIsLoading(true);
    setErrorMessage("");
    setSignOutMessage(null);
    // console.log("Login attempt data:", data);

    try {
      const response = await Api.post("signin",
        {
          username: data.username,
          password: data.password,
        }
      );

      if (response.data && response.data.token && response.data.role) { // Ensure role is present
        const { token, username, role } = response.data;

        localStorage.setItem("jwtToken", token);
        localStorage.setItem("username", username);
        localStorage.setItem("userRole", role); 

        console.log("Login successful, token stored. User role:", role);

        reset();

        // --- NEW: Add a 1.5-second delay before redirection ---
        setTimeout(() => {
          // --- Role-Based Redirection (moved inside setTimeout) ---
          switch (role) {
            case 'ADMIN':
              navigate("/dashboard"); // Redirect Admin to Dashboard
              break;
            case 'TALENT':
              navigate("/talent-space/applications"); // Redirect Talent to Talent Space
              break;
            case 'MANAGER':
              navigate("/manager-space/dashboard"); // Redirect Manager to Manager Space
              break;
            default:
              console.warn("Unknown user role:", role);
              setErrorMessage("Rôle utilisateur inconnu. Impossible de rediriger.");
              break;
          }
          
        }, 1500); 

      } else {
        setErrorMessage("Réponse inattendue du serveur après succès.");
        console.error("Unexpected successful response structure:", response);
        setIsLoading(false); // Stop loading immediately on unexpected response
      }

    } catch (error) {
      setIsLoading(false); // Stop loading on error
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Login error response:", error.response.data);
        console.error("Login error status:", error.response.status);

        if (error.response.status === 401) {
          setErrorMessage(error.response.data.message || "Email ou mot de passe incorrect.");
        } else if (error.response.status === 423) {
          // --- NEW: Redirect to /pending-page if account is locked (status 423) ---
          setErrorMessage(error.response.data.message || "Votre compte est en attente d'approbation.");
          navigate('/pending-approval'); 
        } else if (error.response.data && error.response.data.message) {
          setErrorMessage(error.response.data.message);
        } else {
          setErrorMessage("Une erreur inattendue est survenue lors de la connexion.");
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Login error request:", error.request);
        setErrorMessage("Impossible de se connecter au serveur. Veuillez vérifier votre connexion.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Login error message:", error.message);
        setErrorMessage("Une erreur s'est produite: " + error.message);
      }
    }
  };
  // --- End Submit Handler ---

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      {/* Back Button */}
      <div className="w-full max-w-md mb-4">
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200"
          aria-label="Retour"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span className="text-sm font-medium">Retour</span>
        </button>
      </div>

      {/* Main Logo (static on the login page) */}
      <div className="mb-6">
        <div className="flex items-center">
          <div className="bg-blue-600 w-12 h-12 flex items-center justify-center rounded-lg shadow-md">
            <span className="text-white text-3xl font-bold">J</span>
            </div>
          <div className="flex flex-col ml-2">
            <span className="text-black text-3xl font-extrabold leading-none tracking-tight">MAROC</span>
            <span className="text-sm text-gray-600 pl-10 -mt-1">JOB MAROC</span>
          </div>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Connectez-vous</h1>
          <p className="text-gray-500 mt-1 text-sm">Utilisez vos identifiants Job Maroc</p>
        </div>

        {/* Optional Google Login */}
        <LoginGoogle onError={setErrorMessage}/>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm text-gray-500 font-medium bg-white px-4">OU</div>
        </div>

        {/* Display Sign Out Success Message */}
        {signOutMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 text-sm rounded-lg text-center">
            {signOutMessage}
          </div>
        )}

        {/* Display Login Error Message */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded-lg text-center">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="username"
                type="email"
                {...register("username")}
                placeholder="Adresse e-mail"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                  errors.username ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                aria-invalid={!!errors.username}
                aria-describedby={errors.username ? "username-error" : undefined}
              />
            </div>
            {errors.username && <p id="username-error" className="text-sm text-red-500 mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Mot de passe sécurisé"
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                  errors.password ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label={showPassword ? "Masquer mot de passe" : "Afficher mot de passe"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p id="password-error" className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
          </div>
          {errors.password && <p id="password-error" className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white py-3 rounded-lg font-semibold transition duration-200 shadow-md flex items-center justify-center ${
              isLoading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            aria-live="polite"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Connexion'
            )}
          </button>
        </form>

        {/* Bottom Links */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm text-gray-600 space-y-2 sm:space-y-0">
          <span>
            Pas de compte ?{" "}
            <Link to="/signup/choice" className="text-blue-600 hover:text-blue-700 font-medium">
              S'inscrire
            </Link>
          </span>
          <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
            Mot de passe oublié ?
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-10 w-full max-w-md text-xs text-gray-500 flex flex-col sm:flex-row justify-between items-center px-2 space-y-2 sm:space-y-0">
        <span>&copy; {new Date().getFullYear()} Job Maroc . Tous droits réservés.</span>
        <div className="flex items-center gap-4">
          {/* Simplified language/region selector */}
          <button className="flex items-center text-gray-700 hover:text-gray-900 text-xs">
            <Globe className="h-4 w-4 mr-1" />
            <span>Français (Maroc)</span>
          </button>
        </div>
      </footer>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 bg-opacity-90 dark:bg-gray-900 dark:bg-opacity-90 transition-opacity duration-300">
          <div className="flex flex-col items-center">
            {/* Logo from your request */}
            <div className="flex items-center">
              <div className="bg-blue-600 w-12 h-12 flex items-center justify-center rounded-lg shadow-md">
                <span className="text-white text-3xl font-bold">J</span>
              </div>
              <div className="flex flex-col ml-2">
                <span className="text-black dark:text-white text-3xl font-extrabold leading-none mt-2" style={{ paddingLeft: '-3px' }}>
                  <ReactTyped
                    strings={['MAROC', 'JOB MAROC']}
                    typeSpeed={140}
                    backSpeed={120}
                    loop
                  />
                </span>
                {/* Removed the second static span as ReactTyped covers both */}
              </div>
            </div>
            <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">Connexion en cours...</p>
          </div>
        </div>
      )}
    </div>
  );
}