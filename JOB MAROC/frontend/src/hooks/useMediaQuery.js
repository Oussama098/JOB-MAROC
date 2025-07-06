import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design
 * @param {string} query - Media query string e.g. '(min-width: 768px)'
 * @returns {boolean} - Returns true if the media query matches
 */
const useMediaQuery = (query) => {
  // Initialize with the current match state
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false; // Default on server-side
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia(query);
      
      // Initial check
      setMatches(mediaQuery.matches);
      
      // Add listener for changes
      const handleChange = (event) => {
        setMatches(event.matches);
      };
      
      // Modern approach
      mediaQuery.addEventListener('change', handleChange);
      
      // Cleanup
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, [query]);

  return matches;
};

export default useMediaQuery;