// src/main.jsx
import React from 'react'; // Import React
import { createRoot } from 'react-dom/client';
import App from './App.jsx'; // Import your App component
import './index.css'; // Import your main CSS file (assuming you have one)

/**
 * Application entry point.
 * Renders the root App component into the DOM.
 */
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
