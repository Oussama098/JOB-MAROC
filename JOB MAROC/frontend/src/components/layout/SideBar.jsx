import { useState, useEffect, useRef, useMemo } from 'react'; // Ajout de useMemo
import {
  Home,
  Users,
  ShoppingCart,
  Settings,
  BarChart3,
  Calendar,
  HelpCircle,
  X,
  List,
  CarTaxiFront,
  Plus,
  Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Sidebar = ({ open, setOpen, isMobile, userRole }) => { // Ajout de la prop userRole
  const [activeItem, setActiveItem] = useState('dashboard');
  const wasMobileRef = useRef(isMobile);

  // Cet effet gérera la transition de la vue mobile à la vue bureau
  useEffect(() => {
    // Ouvrir la barre latérale uniquement si nous passons du mobile au bureau
    // et que la barre latérale était précédemment fermée (par exemple, venant de la superposition mobile)
    if (wasMobileRef.current && !isMobile) {
      setOpen(true); // Ouvrir automatiquement la barre latérale lors de la transition vers le bureau
    }

    // Mettre à jour la référence pour suivre la valeur précédente
    wasMobileRef.current = isMobile;
  }, [isMobile, setOpen]);

  // Définir tous les éléments de menu possibles
  const allMenuItems = useMemo(() => [
    { id: 'dashboard', label: 'Tableau de bord', icon: <Home size={20} />, path: '/dashboard', roles: ['ADMIN'] },
    { id: 'dashboard', label: 'Tableau de bord', icon: <Home size={20} />, path: '/manager-space/dashboard', roles: ['MANAGER'] },
    { id: 'users', label: 'Utilisateurs', icon: <Users size={20} />, path: '/users', roles: ['ADMIN'] },
    { id: 'applicatons', label: 'Les Condidatures', icon: <List size={20} />, path: '/talent-space/applications', roles: ['TALENT'] },
    { id: 'approvalList', label: 'Liste d\'approbation', icon: <List size={20} />, path: '/approvallist', roles: ['ADMIN'] },
    { id: 'offers', label: 'Offres d\'emploi', icon: <Plus size={20} />, path: '/offers', roles: ['ADMIN'] },
    { id: 'offers', label: 'Offres d\'emploi', icon: <Plus size={20} />, path: '/manager-space/offers', roles: ['MANAGER'] },
    { id: 'offers', label: 'Offres d\'emploi', icon: <Plus size={20} />, path: '/talent-space/offers', roles: ['TALENT'] },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} />, path: '/talent-space/notifications', roles: ['TALENT'] },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} />, path: '/manager-space/notifications', roles: ['MANAGER'] },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} />, path: '/notifications', roles: ['ADMIN'] },
    { id: 'settings', label: 'Paramètres', icon: <Settings size={20} />, path: '/manager-space/settings', roles: ['MANAGER'] },
    { id: 'settings', label: 'Paramètres', icon: <Settings size={20} />, path: '/talent-space/settings', roles: ['TALENT'] },
    { id: 'help', label: 'Aide et support', icon: <HelpCircle size={20} />, path: '/help&support', roles: ['ADMIN'] },
    { id: 'help', label: 'Aide et support', icon: <HelpCircle size={20} />, path: '/manager-space/help&support', roles: ['MANAGER'] },
    { id: 'help', label: 'Aide et support', icon: <HelpCircle size={20} />, path: '/talent-space/help&support', roles: ['TALENT'] },
  ], []);

  const menuItems = useMemo(() => {
    if (!userRole) {
      return []; // Pas de rôle, pas d'éléments de menu
    }
    return allMenuItems.filter(item => item.roles.includes(userRole));
  }, [userRole, allMenuItems]); // Refiltrer lorsque le rôle de l'utilisateur change


  // Arrière-plan de la barre latérale mobile
  const SidebarBackdrop = () => (
    isMobile && open ?
      <div
        className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20"
        onClick={() => setOpen(false)}
      /> : null
  );
  const roleUser = localStorage.getItem('userRole');
  const username = localStorage.getItem('username');

  // isCollapsedDesktop dépend maintenant directement de la prop 'open'
  // Si 'open' est vrai (par clic ou survol), elle n'est pas réduite.
  // Si 'open' est faux et que c'est un bureau, alors elle est réduite.
  const isCollapsedDesktop = !isMobile && !open;

  return (
    <>
      <SidebarBackdrop />
      <aside
        className={`
          h-full flex flex-col
          ${isMobile ? (open ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'} /* CORRIGÉ : Le bureau est toujours translate-x-0, le mobile utilise l'état open pour le glissement */
          ${isMobile ? 'fixed z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700' : 'relative'} /* Le mobile a besoin d'une largeur, d'un arrière-plan et d'une bordure explicites si fixe ; le bureau est relatif */
          transition-transform duration-300 ease-in-out
          ${!isMobile ? 'border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800' : ''} /* Appliquer la bordure et l'arrière-plan pour le bureau si non géré par l'état mobile fixe */
          flex-shrink-0 /* Ceci peut être redondant si l'aside de MainLayout l'a, mais généralement sûr */
        `}
      >
        {/* En-tête de la barre latérale (s'assurer qu'il a son propre arrière-plan si nécessaire, ou dépendre de l'arrière-plan de cet aside) */}
        <div className={`flex items-center h-16 border-b border-gray-200 dark:border-gray-700 ${isCollapsedDesktop ? 'justify-center' : 'justify-between px-4'}`}>
          {/* Logo */}
          <div className="flex items-center overflow-hidden">
            <div className={`bg-blue-600 w-12 h-12 flex items-center justify-center rounded-sm transition-all duration-300 ease-in-out ${isCollapsedDesktop ? 'mx-auto' : ''}`}>
              <span className="text-white text-3xl font-bold">J</span>
            </div>
            {!isCollapsedDesktop && (
              <div className="flex flex-col ml-2 transition-opacity duration-300 ease-in-out">
                <span className="text-black dark:text-white text-3xl font-extrabold leading-none mt-2">MAROC</span>
                <span className="text-sm text-gray-700 dark:text-gray-400 pl-10">JOB MAROC</span>
              </div>
            )}
          </div>
          {isMobile && (
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Menu de navigation */}
        <nav className={`flex-1 py-4 space-y-1 overflow-y-auto ${isCollapsedDesktop ? 'px-2' : 'px-2'}`}>
          {menuItems.map((item) => (
            <Link
              to={item.path || '#'}
              key={item.id}
              onClick={() => {
                setActiveItem(item.id);
                if (isMobile) setOpen(false);
              }}
              className={`
                flex items-center py-2 text-sm font-medium rounded-md group transition-colors
                ${isCollapsedDesktop ? 'w-full justify-center' : 'w-full px-2'}
                ${
                  activeItem === item.id
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }
              `}
              title={isCollapsedDesktop ? item.label : ''}
            >
              <span className={`${isCollapsedDesktop ? 'mr-0' : 'mr-3'} transition-all duration-300 ease-in-out`}>{item.icon}</span>
              {!isCollapsedDesktop && (
                <span className="transition-opacity duration-300 ease-in-out">
                  {item.label}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Pied de page de la barre latérale (informations utilisateur) */}
        <div className={`border-t border-gray-200 dark:border-gray-700 ${isCollapsedDesktop ? 'p-2' : 'p-4'}`}>
          <div className={`flex items-center ${isCollapsedDesktop ? 'justify-center' : ''}`}>
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-200">
                {username ? username[0].toUpperCase() : 'U'}
              </div>
            </div>
            {!isCollapsedDesktop && (
              <div className="ml-3 transition-opacity duration-300 ease-in-out">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {roleUser}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;