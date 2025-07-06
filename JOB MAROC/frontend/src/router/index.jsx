// src/router/index.jsx
import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/authentication/Login";
import LandingPage from "../pages/LandingPage";
import SignupChoice from "../pages/authentication/SignupChoice"
import SignupRecruteur from "../pages/authentication/SignupRecruteur"
import SignupEtudiant from "../pages/authentication/SignupTalent"
import Dashboard from "../pages/Dashboard";
import MainLayout from "../components/layout/MainLayout"; // Import MainLayout
import UsersPage from "../components/users/UsersPage";
import ApprovalList from "../components/ApprovalList";
import PendingApprovalPage from "../pages/PendingApprovalPage";
import ProtectedRoute from "../router/ProtectedRoute"; // Import ProtectedRoute
import UserProfile from "../components/users/UserProfile";
// import UserProfile from "../components/users/UserProfile";
import AdminOffers from "../components/admin/AdminOffers";
import HelpAndSupportPage from "../pages/HelpAndSupportPage";
import UserSettings from "../components/users/UserSettings";
import ManagerOffers from "../components/manager/ManagerOffers";
import TalenteOffers from "../components/talent/TalentOffers";
import ManagerSettings from "../components/manager/ManagerSettings";
import ManagerSettingsPage from "../components/manager/ManagerSettings";
import ManagerDashboard from "../components/manager/ManagerDashboard";
import TalentApplications from "../components/talent/TalentApplications";
import RecentNotifications from "../components/dashboard/RecentNotifications";
export const router = createBrowserRouter([
    
    {
        path:'/',
        element:<LandingPage/>
    },
    {
        path:'/login',
        element:<Login/>
    },
    {
        path:'/signup/choice',
        element:<SignupChoice/>
    },
    {
        path:'/signup/etudiant',
        element:<SignupEtudiant/>
    },
    {
        path:'/signup/recruteur',
        element:<SignupRecruteur/>
    },

    
    {
        path : '/pending-approval', 
        element : <PendingApprovalPage/>
    },

    {
       
        element: <ProtectedRoute redirectPath="/login" unauthorizedRedirectPath="/" />,
        children: [
            {
               element: <ProtectedRoute allowedRoles={['ADMIN']} unauthorizedRedirectPath="/" />, // Requires ADMIN role
               children: [
                   {
                       element: <MainLayout/>, 
                       children: [
                           {
                               path:'/users', 
                               element:<UsersPage/>
                           },
                           {
                               path:'/dashboard', 
                               element:<Dashboard/>
                           },
                           {
                               path : '/approvallist', 
                               element : <ApprovalList/>
                           },
                           {
                                path : '/profil',
                                element : <UserProfile/>
                           },
                           {
                                path : '/offers',
                                element : <AdminOffers/>
                           },
                           {
                                path : '/help&support',
                                element : <HelpAndSupportPage/>
                           },
                           {
                                path : '/notifications',
                                element : <RecentNotifications/>
                            }
                       ]
                   }
               ]
            },
            {
                element: <ProtectedRoute allowedRoles={['TALENT']} unauthorizedRedirectPath="/" />,
                children: [
                    {
                        path: '/talent-space',
                        element: <MainLayout/>,
                        children : [
                            {
                                path : '/talent-space/profil',
                                element : <UserProfile/>
                            },
                            {
                                path : '/talent-space/offers',
                                element : <TalenteOffers/>
                            },
                            {
                                path : '/talent-space/settings',
                                element : <UserSettings/>
                            },
                            {
                                path : '/talent-space/applications',
                                element : <TalentApplications/>
                            },
                            {
                                path : '/talent-space/help&support',
                                element : <HelpAndSupportPage/>
                            },
                            {
                                path : '/talent-space/notifications',
                                element : <RecentNotifications/>
                            }
                            
                        ] 
                        
                    },
                    
                ]
            },
            
             {
                element: <ProtectedRoute allowedRoles={['MANAGER']} unauthorizedRedirectPath="/" />, // Requires MANAGER role
                children: [
                    {
                        path: '/manager-space', 
                        element: <MainLayout/>,
                        children : [
                            {
                                path : '/manager-space/dashboard',
                                element : <ManagerDashboard/>
                            },
                            {
                                path : '/manager-space/settings',
                                element : <UserSettings/>
                            },
                            {
                                path : '/manager-space/profil',
                                element : <UserProfile/>
                            },
                            {
                                path : '/manager-space/users',
                                element : <UsersPage/>
                            },
                            {
                                path : '/manager-space/profil',
                                element : <UserProfile/>
                            },
                            {
                                path : '/manager-space/settings',
                                element : <UserSettings/>
                            },
                            {
                                path : '/manager-space/offers',
                                element : <ManagerOffers/>
                            },
                            {
                                path : '/manager-space/help&support',
                                element : <HelpAndSupportPage/>
                            },
                            {
                                path : '/manager-space/notifications',
                                element : <RecentNotifications/>
                            }
                        ] 
                    }
                ]
            },
            
        ]
    },
    // --- End Protected Routes ---

    // Catch-all route for 404 - Should be the last route defined
    {
        path:'*',
        element:<div>404 Not Found</div>, // You can replace this with a dedicated 404 component
    },
]);
