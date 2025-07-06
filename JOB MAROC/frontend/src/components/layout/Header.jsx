// src/components/layout/Header.jsx
import { Menu, Bell, Sun, Moon, ChevronDown, ChevronLeft, LogOut, Loader2, AlertTriangle, Info } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ReactTyped } from 'react-typed'; // Import ReactTyped
import { Api } from '../../services/Api'; // Import your API instance

// Helper function to format date to "X time ago" (reused from RecentNotifications.jsx)
const timeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " ans";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " mois";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " jours";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " heures";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes";
    return Math.floor(seconds) + " secondes";
};

// Function to map backend NotificationType enum to frontend display types (reused from RecentNotifications.jsx)
const mapNotificationType = (backendType) => {
    switch (backendType) {
        case 'APPLICATION_SUBMITTED':
        case 'NEW_CANDIDATE_APPLICATION':
            return 'success';
        case 'APPLICATION_STATUS_UPDATE':
            return 'info';
        case 'NEW_MESSAGE':
        case 'NEW_OFFER_CREATED':
        case 'NEW_USER_REGISTERED':
        case 'UPDATE_USER_INFORMATIONS':
            return 'info';
        default:
            return 'default';
    }
};

// Function to generate a title based on notification type (reused from RecentNotifications.jsx)
const getNotificationTitle = (backendType) => {
    switch (backendType) {
        case 'APPLICATION_STATUS_UPDATE': return 'Mise à jour du statut de candidature';
        case 'NEW_MESSAGE': return 'Nouveau message';
        case 'NEW_OFFER_CREATED': return 'Nouvelle offre publiée';
        case 'APPLICATION_SUBMITTED': return 'Nouvelle candidature soumise';
        case 'NEW_CANDIDATE_APPLICATION': return 'Nouvelle candidature reçue';
        case 'NEW_USER_REGISTERED': return 'Nouvel utilisateur inscrit';
        case 'UPDATE_USER_INFORMATIONS': return 'Mise à jour de vos informations';
        default: return 'Nouvelle notification';
    }
};


const Header = ({ sidebarOpen, setSidebarOpen, darkMode, setDarkMode }) => {
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [userRole, setUserRole] = useState(null); // New state for user role

    // State for fetched notifications
    const [fetchedNotifications, setFetchedNotifications] = useState([]);
    const [notificationsLoading, setNotificationsLoading] = useState(true);
    const [notificationsError, setNotificationsError] = useState(null);


    // State for dynamic color of the typed text (unused in this component but kept from original)
    const [typedTextColorIndex, setTypedTextColorIndex] = useState(0);
    const typedTextColors = [
        'text-blue-600',
        'text-green-600',
        'text-purple-600',
        'text-red-600',
        'text-yellow-600',
        'text-sky-600'
    ]; // Array of Tailwind text colors

    // Hook for programmatic navigation
    const navigate = useNavigate();

    // Refs to help close dropdowns when clicking outside
    const notificationsRef = useRef(null);
    const profileRef = useRef(null);

    const username = localStorage.getItem('username');
    const token = localStorage.getItem('jwtToken');

    // Fetch notifications from backend
    const fetchNotifications = useCallback(async () => {
        if (!username || !token) {
            setNotificationsError("Jeton d'authentification ou email utilisateur introuvable. Veuillez vous connecter.");
            setNotificationsLoading(false);
            return;
        }

        setNotificationsLoading(true);
        setNotificationsError(null);

        try {
            const response = await Api.get(`/notifications/${username}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            let data = [];
            if (Array.isArray(response.data)) {
                data = response.data;
            } else if (response.data && Array.isArray(response.data.content)) {
                data = response.data.content;
            } else if (response.data && response.data._embedded && Array.isArray(response.data._embedded.notifications)) {
                data = response.data._embedded.notifications;
            } else {
                console.warn("Format de réponse inattendu pour les notifications:", response.data);
                data = [];
            }

            const formatted = data.map(n => ({
                id: n.notificationId,
                text: n.message,
                title: getNotificationTitle(n.type), // Use helper to get a descriptive title
                time: timeAgo(n.createdAt),
                type: mapNotificationType(n.type),
                read: n.isRead // Assuming backend sends 'isRead'
            }));
            setFetchedNotifications(formatted);

        } catch (err) {
            console.error("Échec de la récupération des notifications :", err);
            setNotificationsError(err.response?.data?.message || "Échec du chargement des notifications.");
        } finally {
            setNotificationsLoading(false);
        }
    }, [username, token]);

    // Function to mark all notifications as read
    const markAllNotificationsAsRead = useCallback(async () => {
        if (!username || !token) {
            console.error("Impossible de marquer les notifications comme lues : jeton ou email manquant.");
            return;
        }

        try {
            await Api.put(`/notifications/markAllAsRead/${username}`, {}, { // Empty body for PUT request
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update local state to reflect all are read
            setFetchedNotifications(prevNotifications =>
                prevNotifications.map(n => ({ ...n, read: true }))
            );
            console.log("Toutes les notifications marquées comme lues.");
        } catch (err) {
            console.error("Échec de la mise à jour des notifications comme lues :", err);
            // Optionally, show a temporary error message in the UI
        }
    }, [username, token]);


    // Effect to close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close notifications dropdown if open and click is outside
            if (notificationsOpen && notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setNotificationsOpen(false);
            }
            // Close profile dropdown if open and click is outside
            if (profileOpen && profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };

        // Add event listener to the document body
        document.addEventListener('mousedown', handleClickOutside);

        // Clean up the event listener on component unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [notificationsOpen, profileOpen]); // Re-run effect if dropdown states change

    // Effect to cycle through typed text colors (unused in this component but kept from original)
    useEffect(() => {
        const interval = setInterval(() => {
            setTypedTextColorIndex(prevIndex => (prevIndex + 1) % typedTextColors.length);
        }, 3000); // Change color every 3 seconds

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, [typedTextColors.length]); // Re-run if color array length changes (unlikely)

    // Effect to read user role from localStorage on mount and fetch notifications
    useEffect(() => {
        const role = localStorage.getItem('userRole');
        if (role) {
            setUserRole(role);
        }
        fetchNotifications(); // Fetch notifications when component mounts or user/token changes
    }, [fetchNotifications]); // Depend on fetchNotifications to re-run if its dependencies change


    // --- Sign Out Handler ---
    const handleSignOut = () => {
        console.log("Signing out...");

        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');

        navigate('/login', { state: { signedOut: true, message: 'You have been signed out successfully.' } });

        // 3. Close the profile dropdown
        setProfileOpen(false);
    };
    // --- End Sign Out Handler ---


    // Determine the profile link based on user role
    let profileLink = '/profil'; // Default for ADMIN
    if (userRole === 'TALENT') {
        profileLink = '/talent-space/profil';
    } else if (userRole === 'MANAGER') {
        profileLink = '/manager-space/profil';
    }
    let SettingsLink; // Default for ADMIN
    if (userRole === 'TALENT') {
        SettingsLink = '/talent-space/settings';
    } else if (userRole === 'MANAGER') {
        SettingsLink = '/manager-space/settings';
    }
    // If userRole is ADMIN or any other, it defaults to '/profil' as set initially.

    const unreadNotificationsCount = fetchedNotifications.filter(n => !n.read).length;

    return (
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 flex-shrink-0">
            {/* Left side */}
            <div className="flex items-center">
                {/* Mobile menu button (visible on small screens) */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 mr-2 rounded-md lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    aria-label="Toggle sidebar menu"
                >
                    <Menu size={20} className="text-gray-500 dark:text-gray-400" />
                </button>

                {/* Desktop sidebar collapse button (visible on large screens) */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 mr-2 rounded-md hidden lg:flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-transform duration-300 ease-in-out cursor-pointer"
                    aria-label="Toggle sidebar visibility"
                >
                    <ChevronLeft
                        size={20}
                        className={`text-gray-500 dark:text-gray-400 transition-transform duration-300 ease-in-out ${
                            sidebarOpen ? 'rotate-0' : 'rotate-180'
                        }`}
                    />
                </button>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-3">
                {/* Theme toggle */}
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                    {darkMode ? (
                        <Sun size={20} className="text-gray-500 dark:text-gray-400" />
                    ) : (
                        <Moon size={20} className="text-gray-500" />
                    )}
                </button>

                {/* Notifications dropdown */}
                <div className="relative" ref={notificationsRef}>
                    <button
                        onClick={() => {
                            setNotificationsOpen(!notificationsOpen);
                            if (!notificationsOpen && unreadNotificationsCount > 0) { // If opening and there are unread notifications
                                markAllNotificationsAsRead();
                            }
                        }}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 relative cursor-pointer"
                        aria-label="Show notifications"
                        aria-expanded={notificationsOpen}
                    >
                        <Bell size={20} className="text-gray-500 dark:text-gray-400" />
                        {unreadNotificationsCount > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                    </button>

                    {/* Notifications dropdown menu */}
                    {notificationsOpen && (
                        <div className="absolute right-0 w-72 mt-2 bg-white rounded-md shadow-lg dark:bg-gray-700 ring-1 ring-black ring-opacity-5 origin-top-right z-20">
                            <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Notifications ({unreadNotificationsCount} nouvelles)</h3>
                            </div>
                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                {notificationsLoading ? (
                                    <div className="flex flex-col items-center justify-center py-4 text-gray-600 dark:text-gray-400">
                                        <Loader2 size={24} className="animate-spin mb-2 text-blue-500" />
                                        <p className="text-sm">Chargement...</p>
                                    </div>
                                ) : notificationsError ? (
                                    <div className="flex items-center text-red-700 dark:text-red-400 p-3 text-sm">
                                        <AlertTriangle size={16} className="mr-2" />
                                        <p>{notificationsError}</p>
                                    </div>
                                ) : fetchedNotifications.length > 0 ? (
                                    fetchedNotifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-600 last:border-b-0 ${notification.read ? 'opacity-70' : ''}`}
                                        >
                                            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">{notification.title}</h4>
                                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{notification.text}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{notification.time}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">Aucune nouvelle notification.</div>
                                )}
                            </div>
                            {fetchedNotifications.length > 0 && (
                                <div className="p-2 border-t border-gray-200 dark:border-gray-600">
                                    <Link to="/talent-space/notifications" className="block px-4 py-2 text-xs text-center text-blue-600 dark:text-blue-400 hover:underline">
                                        Voir toutes les notifications
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center rounded-full focus:outline-none focus:ring-2 focus://ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 cursor-pointer"
                        aria-label="User profile menu"
                        aria-expanded={profileOpen}
                    >
                        {/* Placeholder for user avatar */}
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-200">
                            {username ? username[0].toUpperCase() : 'U'}
                        </div>
                        <ChevronDown size={16} className={`ml-1 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : 'rotate-0'}`} />
                    </button>

                    {profileOpen && (
                        <div className="absolute right-0 w-48 mt-2 bg-white rounded-md shadow-lg dark:bg-gray-700 ring-1 ring-black ring-opacity-5 origin-top-right z-20">
                            <div className="py-1">
                                {/* Conditional Profile Link */}
                                <Link to={profileLink} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                                    Profile
                                </Link>
                                <Link to={SettingsLink} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                                    Paramètres
                                </Link>
                                <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left"
                                    role="menuitem"
                                >
                                    <LogOut size={16} className="mr-2" />
                                    Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
