import { useEffect, useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, MoreHorizontal, Trash, Edit, UserPlus, Eye, Pencil } from 'lucide-react';
import UserProfileModal from '../users/UserProfilModal';

// Added isLoading prop
const UsersTable = ({ users, onEdit, onDelete, onViewDetails, isLoading }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'firstName', direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Déclarez ces états pour contrôler la visibilité de la modale et l'utilisateur sélectionné
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  // --- End Modal State ---
  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Default items per page
  // --- End Pagination State ---

  // Ensure users is an array and filter based on search term
  const filteredUsers = useMemo(() => {
    // Return empty array immediately if users is not an array or if loading
    if (!Array.isArray(users)) {
      console.error("UsersTable received non-array data:", users);
      return [];
    }
    const term = searchTerm.toLowerCase();
    return users.filter((user) =>
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.nationality?.toLowerCase().includes(term) ||
      user.role?.role_name?.toLowerCase().includes(term)
    );
  }, [users, searchTerm]); // Dependencies: users and searchTerm

  // Handle search - Now only updates the searchTerm
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page on sort
  };

  // Apply sorting to filtered users
  const sortedUsers = useMemo(() => {
    const sortableUsers = [...filteredUsers]; // Use filteredUsers here
    if (sortConfig.key) {
      sortableUsers.sort((a, b) => {
        const aValue = sortConfig.key === 'role' ? (a.role?.role_name || '') : (a[sortConfig.key] || '');
        const bValue = sortConfig.key === 'role' ? (b.role?.role_name || '') : (b[sortConfig.key] || '');

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [filteredUsers, sortConfig]); // Dependencies: filteredUsers and sortConfig

  // --- Pagination Logic ---
  const totalItems = sortedUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedUsers.slice(indexOfFirstItem, indexOfLastItem); // Slice the sorted and filtered users

  const handleViewDetailsClick = (user) => {
    console.log("handleViewDetailsClick called with user:", user);
    setSelectedUser(user);      // Store the user to display in the modal
    setIsModalOpen(true);       // Open the modal
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null); // Reset the selected user
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset to first page if itemsPerPage or totalItems changes significantly
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (currentPage === 0 && totalPages > 0) {
      setCurrentPage(1);
    } else if (totalPages === 0 && currentPage !== 1) { // Reset to page 1 if items become 0
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // --- End Pagination Logic ---

  // Render sort icon
  const renderSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
    }
    return <ChevronDown size={16} className="text-gray-400 opacity-50" />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Les Utilisateurs</h2>
        <div className="flex w-full sm:w-auto gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full dark:bg-gray-700 dark:text-white text-sm"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>
      </div>

      {/* Conditional rendering based on loading state and data */}
      {isLoading ? (
        <p className="text-center text-blue-600 dark:text-blue-400 py-4">Loading users...</p>
      ) : totalItems === 0 && !searchTerm ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-4">No users available.</p>
      ) : currentItems.length === 0 && searchTerm ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-4">No users found matching "{searchTerm}".</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-200 text-left text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-medium cursor-pointer" onClick={() => handleSort('firstName')}>
                  <div className="flex items-center gap-1">
                    Name {renderSortIcon('firstName')}
                  </div>
                </th>
                <th className="px-6 py-3 font-medium cursor-pointer" onClick={() => handleSort('email')}>
                  <div className="flex items-center gap-1">
                    Email {renderSortIcon('email')}
                  </div>
                </th>
                <th className="px-6 py-3 font-medium cursor-pointer" onClick={() => handleSort('role')}>
                  <div className="flex items-center gap-1">
                    Role {renderSortIcon('role')}
                  </div>
                </th>
                <th className="px-6 py-3 font-medium cursor-pointer" onClick={() => handleSort('active')}>
                  <div className="flex items-center gap-1">
                    Status {renderSortIcon('active')}
                  </div>
                </th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm text-gray-900 dark:text-white">
              {/* Use currentItems for rendering */}
              {currentItems.map((user, index) => (
                <tr key={user.userId || index} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.role ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role.role_name === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : user.role.role_name === 'MANAGER'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : user.role.role_name === 'TALENT'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {user.role.role_name}
                      </span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end items-center space-x-2">
                      {onViewDetails && (
                        <button
                          onClick={() => handleViewDetailsClick(user)} 
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-600"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(user)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-600"
                          title="Edit User"
                        >
                          <Pencil size={18} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(user)} 
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-600"
                          title="Delete User"
                        >
                          <Trash size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalItems > 0 && !isLoading && ( 
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            Show
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1); 
              }}
              className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white py-1 px-2"
            >
              <option value={5} >5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            entries
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-sm hidden sm:block"> 
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, totalItems)}</span> of <span className="font-medium">{totalItems}</span> users
          </p>

          <div className="flex gap-1">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:disabled:text-gray-600 text-sm"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:disabled:text-gray-600 text-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
      {totalItems > 0 && currentItems.length === 0 && searchTerm && !isLoading && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-4">No users found matching "{searchTerm}" on this page.</p>
      )}

      {/* Conditional rendering of UserProfileModal outside the table */}
      {isModalOpen && selectedUser && (
        <UserProfileModal
          onClose={handleCloseModal}
          user={selectedUser} // Pass the selected user to the modal
        />
      )}
    </div>
  );
};

export default UsersTable;
