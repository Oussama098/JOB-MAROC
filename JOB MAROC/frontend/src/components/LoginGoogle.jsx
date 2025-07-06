import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Api } from '../services/Api';
import {ReactTyped} from 'react-typed';

const LoginGoogle = ({ onError }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initializeGoogleLogin = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        console.log("Google Identity Services script loaded. Initializing Google Sign-In.");
        try {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
          });

          const googleButtonContainer = document.getElementById("google-login-button-container");
          if (googleButtonContainer) {
            window.google.accounts.id.renderButton(
              googleButtonContainer,
              {
                theme: "outline",
                size: "large",
                text: "signin_with",
                shape: "rectangular",
                logo_alignment: "left",
                width: "300px" 
              }
            );
            console.log("Google Sign-In button rendered.");
          } else {
            console.error("Google login button container not found.");
            if (onError) onError("Could not display Google Sign-In button.");
          }
        } catch (error) {
            console.error("Error initializing Google Sign-In:", error);
            if (onError) onError("Failed to initialize Google Sign-In. Please try again.");
        }
      } else {
        console.error("Google Identity Services (GIS) script not fully loaded after check.");
        if (onError) onError("Google login services could not be loaded. Please refresh the page or try again later.");
      }
    };

    if (window.google && window.google.accounts && window.google.accounts.id) {
      initializeGoogleLogin();
    } else {
      console.log("Google Identity Services script not found initially. Waiting...");
      let attempts = 0;
      const maxAttempts = 50;
      const interval = setInterval(() => {
        attempts++;
        if (window.google && window.google.accounts && window.google.accounts.id) {
          clearInterval(interval);
          console.log("Google Identity Services script loaded via interval check.");
          initializeGoogleLogin();
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          console.error("Google Identity Services script did not load after waiting.");
          if (onError) onError("Google login services failed to load. Please check your internet connection or try again.");
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [onError]);

  const handleLoginError = (message) => {
    if (onError) {
      onError(message);
    } else {
      console.error("LoginGoogle Error:", message);
      // In a real app, avoid alert(). Use a custom message component.
      // alert(message); 
    }
  };

  const handleCredentialResponse = async (response) => {
    console.log("Google credential received:", response.credential ? "Token present" : "No token");
    setIsLoading(true);
    if (onError) onError(""); // Clear previous errors from parent

    try {
      const backendResponse = await Api.post('/google-signin', { googleIdToken: response.credential });
      console.log("Backend response received:", backendResponse);

      const responseData = backendResponse.data;

      let userRole = null;
      if (responseData && responseData.token) {
        // Prefer 'role' string if available, otherwise check 'roles' array
        if (responseData.role && typeof responseData.role === 'string') {
          userRole = responseData.role;
        } else if (responseData.roles && Array.isArray(responseData.roles) && responseData.roles.length > 0) {
          // Assuming the first role in the array is the primary one, or apply specific logic to pick.
          userRole = responseData.roles[0];
        }

        if (userRole) {
          const { token, email, firstName } = responseData;

          localStorage.setItem("jwtToken", token);
          localStorage.setItem("userRole", userRole); // Store the actual userRole string
          if (email) localStorage.setItem("username", email);
          if (firstName) localStorage.setItem("userFirstName", firstName);

          console.log("Google Backend authentication successful. App JWT stored. User role:", userRole);

          setTimeout(() => {
            // --- Role-Based Redirection ---
            // FIX: Use 'userRole' which is correctly defined in this scope.
            switch (userRole) { 
              case 'ADMIN':
                navigate("/dashboard"); // Redirect Admin to Dashboard
                break;
              case 'TALENT':
                navigate("/talent-space"); // Redirect Talent to Talent Space
                break;
              case 'MANAGER':
                navigate("/manager-space"); // Redirect Manager to Manager Space
                break;
              default:
                console.warn("Unknown user role:", userRole);
                // Use onError prop to report the message to parent
                handleLoginError("Rôle utilisateur inconnu. Impossible de rediriger.");
                break;
            }
          }, 1500); // 1.5 seconds delay for loading animation

        } else {
          console.error("Google Backend login failed: Role not found in response.", responseData);
          handleLoginError("Rôle utilisateur non défini dans la réponse du serveur Google.");
        }
      } else {
        console.error("Google Backend login failed: Unexpected response structure (token missing or data missing).", backendResponse);
        handleLoginError("Réponse inattendue du serveur après la connexion Google.");
      }

    } catch (error) {
      console.error("Google Login API Error:", error);
      if (error.response) {
        console.error("Error Response Data:", error.response.data);
        console.error("Error Response Status:", error.response.status);

        if (error.response.status === 401) {
          handleLoginError(error.response.data?.message || "Authentification Google échouée. Token invalide ou utilisateur non autorisé.");
        } else if (error.response.status === 423) { // Account locked or requires action
          console.log("Account pending approval (status 423 via Google), redirecting to pending-approval page.");
          const userEmail = error.response.data?.email;
          navigate("/pending-approval", { state: { email: userEmail, message: error.response.data?.message || "Votre compte est en attente d'approbation ou a été refusé." } });
          // Do not call handleLoginError here, as navigation is taking over display
        } else {
          handleLoginError(error.response.data?.message || `Erreur de connexion Google (Statut: ${error.response.status}).`);
        }
      } else if (error.request) {
        console.error("Error Request:", error.request);
        handleLoginError("Impossible de contacter le serveur pour la connexion Google. Vérifiez votre connexion.");
      } else {
        console.error("Error Message:", error.message);
        handleLoginError("Une erreur inattendue s'est produite lors de la connexion Google.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div id="google-login-button-container" className="w-full flex justify-center my-3">
        {/* Google button will render here. You can add a placeholder if GIS fails. */}
      </div>
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
              </div>
            </div>
            <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">Connexion en cours...</p>
          </div>
        </div>
      )}
    </>
  );
}

export default LoginGoogle;
