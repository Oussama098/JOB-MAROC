// src/App.jsx
import React from 'react'; // Import React if not using new JSX transform
import { RouterProvider } from 'react-router-dom';
import { router } from './router'; // Import your router configuration

/**
 * The main application component.
 * Provides the router context to the application.
 */
function App() {
  // Log the JWT token for debugging
  // No state needed here for basic router setup
  return (
    // RouterProvider makes the router instance available throughout the app
    <RouterProvider router={router} />
    // Optional: Log to confirm router is set up
  );
}

export default App;
