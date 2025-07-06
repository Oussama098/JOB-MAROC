// src/components/users/UserDetails.jsx
import { X, Mail, Calendar, Briefcase, Activity } from 'lucide-react';
// import Avatar from '../ui/Avatar.jsx';

const UserDetails = ({ user, onClose }) => {
  if (!user) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="relative">
          {/* Header/Cover */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
          
          {/* Avatar */}
          <div className="absolute -bottom-12 left-6">
            {/* <Avatar 
              src={user.avatar}
              alt={user.name}
              className="w-24 h-24 border-4 border-white dark:border-gray-800"
            /> */}
          </div>
        </div>
        
        {/* Content */}
        <div className="pt-16 pb-6 px-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
          
          <div className="mt-1 flex items-center">
            <span className={`px-2 py-1 rounded-full text-xs font-medium mr-2
              ${user.role === 'Admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : ''}
              ${user.role === 'Editor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}
              ${user.role === 'User' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
            `}>
              {user.role}
            </span>
            
            <span className={`px-2 py-1 rounded-full text-xs font-medium
              ${user.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
              ${user.status === 'Inactive' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : ''}
              ${user.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : ''}
            `}>
              {user.status}
            </span>
          </div>
          
          <div className="mt-6 space-y-4">
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <Mail size={18} className="mr-3 text-gray-400" />
              <span>{user.email}</span>
            </div>
            
            {user.phone && (
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <Phone size={18} className="mr-3 text-gray-400" />
                <span>{user.phone}</span>
              </div>
            )}
            
            {user.joinDate && (
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <Calendar size={18} className="mr-3 text-gray-400" />
                <span>Joined {formatDate(user.joinDate)}</span>
              </div>
            )}
            
            {user.department && (
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <Briefcase size={18} className="mr-3 text-gray-400" />
                <span>{user.department}</span>
              </div>
            )}
            
            {user.lastActive && (
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <Activity size={18} className="mr-3 text-gray-400" />
                <span>Last active {formatDate(user.lastActive)}</span>
              </div>
            )}
          </div>
          
          {user.bio && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">About</h3>
              <p className="text-gray-600 dark:text-gray-300">{user.bio}</p>
            </div>
          )}
          
          {/* User permissions/roles section */}
          {user.permissions && user.permissions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Permissions</h3>
              <div className="flex flex-wrap gap-2">
                {user.permissions.map((permission, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;