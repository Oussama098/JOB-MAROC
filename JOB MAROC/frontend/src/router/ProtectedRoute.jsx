// src/components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * A component that protects routes, redirecting unauthenticated or unauthorized users.
 * Checks for a JWT token and optionally verifies the user's role against allowedRoles.
 * Redirects unauthenticated users to the login page and unauthorized users to the root path.
 *
 * @param {string} redirectPath - The path to redirect to if not authenticated (defaults to '/login').
 * @param {string[]} allowedRoles - An array of role strings that are allowed to access this route.
 * If null or empty, only authentication is checked.
 * @param {string} unauthorizedRedirectPath - The path to redirect to if authenticated but role is not allowed (defaults to '/').
 */
const ProtectedRoute = ({ redirectPath = '/login', allowedRoles = null, unauthorizedRedirectPath = '/' }) => {
  // --- Authentication Check ---
  // IMPORTANT: Replace this with your actual, robust authentication check logic.
  // This example checks for a JWT token in localStorage.
  const jwtToken = localStorage.getItem('jwtToken');
  const isAuthenticated = !!jwtToken;

  // Get the user's role from localStorage (assuming it's stored there during login)
  const userRole = localStorage.getItem('userRole'); // Get the user's role

  console.log("ProtectedRoute: Checking authentication and role...");
  console.log("ProtectedRoute: jwtToken present:", !!jwtToken);
  console.log("ProtectedRoute: isAuthenticated:", isAuthenticated);
  console.log("ProtectedRoute: userRole:", userRole);
  console.log("ProtectedRoute: allowedRoles:", allowedRoles);


  // If the user is NOT authenticated, redirect them to the login page
  if (!isAuthenticated) {
    console.log(`ProtectedRoute: User not authenticated (isAuthenticated is false), redirecting to ${redirectPath}`);
    return <Navigate to={redirectPath} replace />;
  }

  // --- Role Check (only if allowedRoles are specified) ---
  if (allowedRoles && allowedRoles.length > 0) {
    // Check if the user's role is in the list of allowed roles
    const isAuthorized = userRole && allowedRoles.includes(userRole);

    console.log("ProtectedRoute: isAuthorized by role:", isAuthorized);

    // If authenticated but NOT authorized by role, redirect them
    if (!isAuthorized) {
      console.log(`ProtectedRoute: User authenticated but role '${userRole}' is not allowed. Redirecting to ${unauthorizedRedirectPath}`);
      return <Navigate to={unauthorizedRedirectPath} replace />;
    }
  }

  // If the user IS authenticated (and authorized by role if applicable), render the child routes
  console.log("ProtectedRoute: User is authenticated and authorized, rendering protected route.");
  return <Outlet />;
};

export default ProtectedRoute;
