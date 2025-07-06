import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 md:flex md:items-center md:justify-between">
        <div className="text-center md:text-left">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {currentYear} Company Name. All rights reserved.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex justify-center md:justify-end space-x-6">
          <a href="#terms" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            Terms of Service
          </a>
          <a href="#privacy" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            Privacy Policy
          </a>
          <a href="#contact" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;