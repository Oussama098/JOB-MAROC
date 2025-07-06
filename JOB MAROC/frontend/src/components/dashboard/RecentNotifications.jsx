// src/components/dashboard/RecentNotifications.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Info, AlertTriangle, CheckCircle, Loader2, X, ChevronDown, ChevronUp } from 'lucide-react'; // Added ChevronDown, ChevronUp
import { Api } from '../../services/Api'; // Assuming Api is your Axios instance

// Helper function to format date to "X time ago"
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

const RecentNotifications = () => {
    const [notifications, setNotifications] = useState([]); // Stores all fetched notifications
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAll, setShowAll] = useState(false); // New state to toggle between recent and all

    const userEmail = localStorage.getItem('username');
    const token = localStorage.getItem('jwtToken');

    // Define how many recent notifications to show by default
    const recentCount = 3;

    const fetchNotifications = useCallback(async () => {
        if (!userEmail || !token) {
            setError("Jeton d'authentification ou email utilisateur introuvable. Veuillez vous connecter.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null); // Clear previous errors

        try {
            const response = await Api.get(`/notifications/${userEmail}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            let fetchedNotifications = [];
            if (Array.isArray(response.data)) {
                fetchedNotifications = response.data;
            } else if (response.data && Array.isArray(response.data.content)) {
                fetchedNotifications = response.data.content;
            } else if (response.data && response.data._embedded && Array.isArray(response.data._embedded.notifications)) {
                fetchedNotifications = response.data._embedded.notifications;
            } else {
                console.warn("Format de réponse inattendu pour les notifications:", response.data);
                fetchedNotifications = [];
            }

            // Map backend data to frontend format
            const formattedNotifications = fetchedNotifications.map(n => ({
                id: n.notificationId,
                title: getNotificationTitle(n.type), // Derive title from type
                description: n.message,
                time: timeAgo(n.createdAt),
                type: mapNotificationType(n.type), // Map backend type to frontend display type
                read: n.isRead // Assuming 'read' field exists and is boolean
            }));
            setNotifications(formattedNotifications);

        } catch (err) {
            console.error("Échec de la récupération des notifications :", err);
            setError(err.response?.data?.message || "Échec du chargement des notifications.");
        } finally {
            setLoading(false);
        }
    }, [userEmail, token]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Function to map backend NotificationType enum to frontend display types
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

    // Function to generate a title based on notification type
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

    // Function to get icon and color based on notification type and read status
    const getNotificationStyles = (type, read) => {
        const baseStyles = read ? 'opacity-50' : '';

        switch (type) {
            case 'info':
                return {
                    icon: <Info size={16} />,
                    colorClass: `bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 ${baseStyles}`
                };
            case 'warning':
                return {
                    icon: <AlertTriangle size={16} />,
                    colorClass: `bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 ${baseStyles}`
                };
            case 'success':
                return {
                    icon: <CheckCircle size={16} />,
                    colorClass: `bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 ${baseStyles}`
                };
            default:
                return {
                    icon: <Bell size={16} />,
                    colorClass: `bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 ${baseStyles}`
                };
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    // Determine which notifications to display based on showAll state
    const notificationsToDisplay = showAll ? notifications : notifications.slice(0, recentCount);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-800 dark:text-white">Notifications Récentes</h2>
                {unreadCount > 0 && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        {unreadCount} nouvelles
                    </span>
                )}
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center py-4 text-gray-600 dark:text-gray-400">
                    <Loader2 size={24} className="animate-spin mb-2 text-blue-500" />
                    <p className="text-sm">Chargement des notifications...</p>
                </div>
            )}

            {error && (
                <div className="flex items-center bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-md">
                    <AlertTriangle size={20} className="mr-2" />
                    <p className="text-sm">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto text-red-700 dark:text-red-400 hover:opacity-75"><X size={16}/></button>
                </div>
            )}

            {!loading && !error && notifications.length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    <Info size={24} className="mx-auto mb-2" />
                    <p className="text-sm">Aucune notification pour le moment.</p>
                </div>
            )}

            {!loading && !error && notifications.length > 0 && (
                <div className="space-y-4">
                    {notificationsToDisplay.map((notification) => {
                        const { icon, colorClass } = getNotificationStyles(notification.type, notification.read);

                        return (
                            <div
                                key={notification.id}
                                className={`flex items-start p-3 rounded-md ${notification.read ? 'bg-transparent' : 'bg-gray-50 dark:bg-gray-700/30'} transition-colors duration-200`}
                            >
                                <div className={`p-2 rounded-full ${colorClass} mr-3 flex-shrink-0 mt-0.5`}>
                                    {icon}
                                </div>
                                <div className="flex-1">
                                    <h4 className={`text-sm font-medium text-gray-800 dark:text-white ${notification.read ? 'opacity-70' : ''}`}>
                                        {notification.title}
                                    </h4>
                                    <p className={`text-xs text-gray-600 dark:text-gray-300 mt-1 ${notification.read ? 'opacity-70' : ''}`}>
                                        {notification.description}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{notification.time}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* "Voir toutes" / "Voir moins" button */}
            {!loading && !error && notifications.length > recentCount && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
                    >
                        {showAll ? (
                            <>
                                Voir moins <ChevronUp size={16} className="ml-1" />
                            </>
                        ) : (
                            <>
                                Voir toutes les notifications <ChevronDown size={16} className="ml-1" />
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default RecentNotifications;
