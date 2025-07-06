import React from 'react';
import { XCircle, AlertTriangle , Loader2} from 'lucide-react'; // Import icons

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, offerTitle, loading }) => {
    // If modal is not open, don't render anything
    if (!isOpen) return null;

    return (
        // Modal Overlay (fixed, covers the whole screen, semi-transparent background)
        <div className="fixed inset-0 bg-transparent bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            {/* Modal Content Box */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl overflow-hidden max-w-sm w-full p-6 border border-slate-200 dark:border-slate-700 transform transition-all sm:align-middle">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center">
                        <AlertTriangle size={24} className="mr-2 text-red-500 dark:text-red-400" />
                        Confirm Deletion
                    </h3>
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                        aria-label="Close modal"
                        disabled={loading} // Disable close button while loading
                    >
                        <XCircle size={24} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="text-slate-600 dark:text-slate-400 mb-6">
                    <p className="mb-2">Are you sure you want to delete the offer titled:</p>
                    <p className="font-semibold text-slate-800 dark:text-white break-words">{offerTitle || 'this offer'}</p> {/* Display offer title */}
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">This action cannot be undone.</p>
                </div>

                {/* Modal Footer (Buttons) */}
                <div className="flex justify-end space-x-3">
                    {/* Cancel Button */}
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:ring-offset-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading} // Disable while loading
                    >
                        Cancel
                    </button>
                    {/* Confirm Delete Button */}
                    <button
                        onClick={onConfirm}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-offset-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading} // Disable while loading
                    >
                         {loading && <Loader2 size={16} className="animate-spin mr-2" />} {/* Show spinner if loading */}
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
