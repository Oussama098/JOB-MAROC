// src/components/layout/MainLayout.jsx
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header'; // Ensure correct path
import Sidebar from './SideBar'; // Ensure correct path
import Footer from './Footer'; // Assuming you might use it later

const MainLayout = () => {
  // State to control sidebar visibility (toggled by button)
  // Initialize based on screen width: open on desktop (>= 768px), closed on mobile (< 768px)
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  // State to track if the screen is mobile size
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // State to track if the sidebar is being hovered (for hover-to-expand)
  const [isHoveringSidebar, setIsHoveringSidebar] = useState(false);

  // State for dark mode
  const [darkMode, setDarkMode] = useState(false); // Initialize as false, will read from localStorage

  // State for user role
  const [userRole, setUserRole] = useState(null); // New state for user role

  // Effect to handle window resizing
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // If resizing to mobile, close the sidebar (mobile uses overlay)
      if (mobile) {
        setSidebarOpen(false);
      } else {
        // If resizing to desktop, open the sidebar by default
        setSidebarOpen(true); // Default to open on desktop
      }
    };

    // Add resize event listener
    window.addEventListener('resize', handleResize);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array: runs once on mount and cleanup on unmount

  // Effect to read dark mode preference from localStorage on mount
  useEffect(() => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
          setDarkMode(true);
      } else {
          // Default to light if no preference or 'light' is saved
          setDarkMode(false);
      }
  }, []); // Empty dependency array: runs once on mount

  // Effect to apply dark mode class to the html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark'); // Save preference
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light'); // Save preference
    }
  }, [darkMode]);

  // Effect to read user role from localStorage on mount
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role) {
      setUserRole(role);
    }
  }, []); // Run once on mount

  // Determine the effective sidebar state for rendering
  // Sidebar is "actually open" if it's explicitly open OR it's collapsed on desktop and being hovered
  const isSidebarActuallyOpen = sidebarOpen || (!isMobile && isHoveringSidebar);

  return (
    // Use CSS Grid to define the layout columns
    <div
      className={`grid h-screen overflow-hidden ${darkMode ? 'dark' : ''}`}
      style={{
        // Define grid columns: [sidebar width] [main content width]
        // On mobile, sidebar is an overlay (1fr).
        // On desktop:
        //   - If sidebar is explicitly open OR being hovered, it's 16rem (full width).
        //   - Otherwise (collapsed and not hovered), it's 4rem (collapsed width).
        gridTemplateColumns: isMobile ? '1fr' : (isSidebarActuallyOpen ? '16rem 1fr' : '4rem 1fr'),
        // Apply transition to the grid-template-columns property for smooth animation
        transition: 'grid-template-columns 300ms ease-in-out',
      }}
    >
      {/* Sidebar - This element occupies the first grid column */}
      <aside
        className={`
          ${isMobile ? 'fixed z-30 h-full w-64' : 'relative flex-shrink-0'} {/* Mobile: fixed, full height, explicit width */}
          ${isMobile && sidebarOpen ? 'translate-x-0' : (isMobile ? '-translate-x-full' : 'translate-x-0')} {/* Mobile: slide in/out */}
          transition-transform duration-300 ease-in-out border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col
          min-w-16 /* Ensure a minimum width for icons when collapsed */
        `}
        // Hide horizontal overflow on the sidebar during transition
        style={{ overflowX: 'hidden' }}
        // Add hover event listeners for desktop only
        onMouseEnter={!isMobile && !sidebarOpen ? () => setIsHoveringSidebar(true) : null}
        onMouseLeave={!isMobile && !sidebarOpen ? () => setIsHoveringSidebar(false) : null}
      >
         {/* Pass necessary props to the Sidebar component */}
         {/* Pass isSidebarActuallyOpen to control internal sidebar rendering */}
         <Sidebar open={isSidebarActuallyOpen} setOpen={setSidebarOpen} isMobile={isMobile} userRole={userRole} /> {/* Pass userRole */}
      </aside>

      {/* Main Content Area - This element occupies the second grid column */}
      <div className="flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
         <Header
           sidebarOpen={sidebarOpen} // Header still controls the 'sidebarOpen' state (toggled by button)
           setSidebarOpen={setSidebarOpen}
           darkMode={darkMode}
           setDarkMode={setDarkMode}
         />

         <main className="flex-1 overflow-y-auto p-4 md:p-6">
           <Outlet/>
         </main>
         {/* <Footer/> */}
      </div>
    </div>
  );
};

export default MainLayout;
