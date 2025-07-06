import React, { useState, useEffect } from 'react'; 
import { X } from 'lucide-react';
import { Api } from '../../services/Api';
import TalentProfile from '../talent/TalentProfile';
import ManagerProfile from '../manager/ManagerProfile'; 
import AdminProfile from '../admin/AdminProfile';

const UserProfileModal = ({ user, onClose }) => {
    if (!user) return null; // Don't render if no user data is provided

    const userRoleName = user.role?.role_name; 
    
    // State to hold manager-specific data
    const [managerSpecificData, setManagerSpecificData] = useState(null);
    const [isManagerDataLoading, setIsManagerDataLoading] = useState(false);
    const [managerDataError, setManagerDataError] = useState(null);

    // useEffect to conditionally fetch manager data when role is MANAGER
    useEffect(() => {
        const fetchManagerData = async () => {
            // Check if the user is a manager and has a userId (important for the API call)
            if (userRoleName === 'MANAGER' && user.userId) { 
                setIsManagerDataLoading(true);
                setManagerDataError(null); // Clear previous errors
                setManagerSpecificData(null); // Clear previous data

                try {
                    const token = localStorage.getItem('jwtToken');
                    if (!token) {
                        throw new Error("Authentication token missing. Cannot fetch manager data.");
                    }
                    
                    const response = await Api.get(`/manager/${user.userId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    setManagerSpecificData(response.data);
                    console.log("UserProfileModal: Manager specific data fetched:", response.data);

                } catch (error) {
                    console.error("UserProfileModal: Error fetching manager-specific data:", error);
                    // Provide a user-friendly error message
                    setManagerDataError(error.response?.data?.message || "Failed to load manager details.");
                    setManagerSpecificData(null); // Ensure data is null on error
                } finally {
                    setIsManagerDataLoading(false);
                }
            } else {
                // Reset manager-specific state if the user is not a manager or userId is missing
                setManagerSpecificData(null);
                setIsManagerDataLoading(false);
                setManagerDataError(null);
            }
        };

        fetchManagerData();
        // The effect re-runs if userRoleName or user.userId changes.
        // user object is included for completeness, but userRoleName and userId are typically sufficient.
    }, [userRoleName, user.userId, user]); 

    let profileComponent;
    let modalTitle;

    // Determine the profile component and modal title based on the user's role and data loading state
    if (!userRoleName) {
        profileComponent = <div className="p-4 text-gray-500 dark:text-gray-400">No specific profile available for this user.</div>;
        modalTitle = "User Profile Details (General)";
        console.warn(`UserProfileModal: No specific user role found for user ID ${user.id}. Displaying general profile.`);
    } else {
        switch (userRoleName) { 
            case 'TALENT':
                profileComponent = <TalentProfile user={user} />;
                modalTitle = "Talent Profile Details";
                break;
            case 'ADMIN':
                profileComponent = <AdminProfile user={user} />;
                modalTitle = "Admin Profile Details";
                break;
            case 'MANAGER':
                // Conditional rendering for Manager based on data loading/error state
                if (isManagerDataLoading) {
                    profileComponent = (
                        <div className="p-8 flex flex-col items-center justify-center min-h-[200px] bg-white dark:bg-gray-800">
                            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                            <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-300">Loading manager details...</p>
                        </div>
                    );
                    modalTitle = "Loading Manager Profile...";
                } else if (managerDataError) {
                    profileComponent = (
                        <div className="p-8 text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 rounded-lg mx-4 my-2">
                            <p className="text-xl font-semibold mb-2">Error!</p>
                            <p className="text-lg">{managerDataError}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Please try closing and reopening the modal.</p>
                        </div>
                    );
                    modalTitle = "Error Loading Profile";
                } else if (managerSpecificData) {
                    // If managerSpecificData is successfully fetched, combine it with the original user object
                    // This creates a comprehensive 'user' object for ManagerProfile
                    const combinedManagerUser = { ...user, ...managerSpecificData };
                    profileComponent = <ManagerProfile user={combinedManagerUser} />;
                    modalTitle = `${userRoleName} Profile Details`; 
                } else {
                    // Fallback if data is not loading, no error, but no data was returned
                    profileComponent = <div className="p-4 text-gray-500 dark:text-gray-400">No manager details found for this user.</div>;
                    modalTitle = `${userRoleName} Profile Details`;
                }
                break;
            default:
                profileComponent = <div className="p-4 text-gray-500 dark:text-gray-400">No specific profile available for this role.</div>;
                modalTitle = "User Profile Details (Unknown Role)";
                console.warn(`UserProfileModal: Unsupported user role "${userRoleName}". Displaying generic fallback.`);
                break;
        }
    }

    return (
        <div className="fixed inset-0  bg-opacity-75 backdrop-blur-sm 
                        flex items-center justify-center p-4 z-50 overflow-y-auto
                        transition-opacity duration-300 ease-out animate-fade-in">
            
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700
                        max-w-4xl lg:max-w-5xl w-full mx-auto my-8 
                        transform transition-all duration-300 ease-in-out scale-95 opacity-0 sm:scale-100 sm:opacity-100
                        animate-modal-slide-up"> 
                
                {/* Modal Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700
                            bg-gray-50 dark:bg-gray-700 rounded-t-xl"> 
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {modalTitle}
                    </h3>
                    <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                                transition-colors duration-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <X size={24} />
                    </button>
                </div>
                
                {/* Modal Content Area (where Talent/Admin/ManagerProfile will be rendered) */}
                <div className="p-0 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {profileComponent} 
                </div>
                
                {/* Modal Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end
                            bg-gray-50 dark:bg-gray-700 rounded-b-xl"> 
                    <button
                        type="button"
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white 
                                rounded-md font-medium transition-colors duration-200
                                shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;
