import { createContext, useState, useEffect, useContext } from 'react';

// Create Theme context
export const ThemeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
});

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Check for saved theme preference or use system preference
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved preference first
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      return savedTheme === 'true';
    }
    // Otherwise check system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Update local storage and apply class when darkMode changes
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only update if there's no saved preference
      if (localStorage.getItem('darkMode') === null) {
        setDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  return useContext(ThemeContext);
};

export default ThemeProvider;