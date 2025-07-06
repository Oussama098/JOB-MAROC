import React, { useState, useEffect } from 'react';
import {
    X, Briefcase, MapPin, CalendarDays, DollarSign, FileText,
    Landmark, Navigation, PlusCircle, Trash2, ChevronDown, ChevronUp
} from 'lucide-react';
import { Api } from '../services/Api'; // Assurez-vous que le chemin est correct

const AddOfferModal = ({ isOpen, onClose, onOfferAdded }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        basicSalary: '',
        datePublication: '',
        dateExpiration: '',
        companyName: '',
        sectorActivity: '',
        studyLevel: '',
        experience: '',
        skills: '',
        modality: 'OnSite', // Default value
        flexibleHours: false,
    });

    // State for managing selected contract types
    const [availableContractTypes, setAvailableContractTypes] = useState([]);
    const [selectedContractTypes, setSelectedContractTypes] = useState([]);
    const [contractTypesLoading, setContractTypesLoading] = useState(true);
    const [contractTypesError, setContractTypesError] = useState(null);
    const [showContractTypeDropdown, setShowContractTypeDropdown] = useState(false);

    // State for managing languages
    const [languages, setLanguages] = useState([{ languageName: '', description: '', level: 1 }]);

    // State for form submission process
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Get the JWT token and user role
    const storedToken = localStorage.getItem('jwtToken');
    const managerEmail = localStorage.getItem('username'); // Retrieve manager's email from local storage
    const userRole = localStorage.getItem('userRole'); // Retrieve user's role

    // --- Fetch Contract Types ---
    const fetchContractTypes = async () => {
        setContractTypesLoading(true);
        setContractTypesError(null);
        if (!storedToken) {
            setContractTypesError(new Error("Authentication token not found. Cannot fetch contract types."));
            setContractTypesLoading(false);
            return;
        }
        try {
            const data = await Api.get('/contractTypes/all', {
                headers: {
                    'Authorization': `Bearer ${storedToken}`,
                },
            });
            console.log("Fetched Contract Types:", data);
            
            if (Array.isArray(data.data)) {
                setAvailableContractTypes(data.data);
            } else {
                console.error("API response for contract types is not an array:", data);
                setContractTypesError(new Error("Received unexpected format for contract types."));
                setAvailableContractTypes([]);
            }
        } catch (err) {
            console.error("Failed to fetch contract types:", err);
            setContractTypesError(new Error(`Failed to fetch contract types: ${err.message}`));
            setAvailableContractTypes([]);
        } finally {
            setContractTypesLoading(false);
        }
    };
    // --- End Fetch Contract Types ---


    // Reset form and messages when modal opens/closes, and fetch contract types
    useEffect(() => {
        if (isOpen) {
            // Reset form data
            setFormData({
                title: '',
                description: '',
                location: '',
                basicSalary: '',
                datePublication: '',
                dateExpiration: '',
                companyName: '',
                sectorActivity: '',
                studyLevel: '',
                experience: '',
                skills: '',
                modality: 'OnSite',
                flexibleHours: false,
            });
            // Reset relationship data
            setSelectedContractTypes([]);
            setLanguages([{ languageName: '', description: '', level: 1 }]); // Start with one empty language input

            // Reset messages and loading state
            setError(null);
            setSuccess(false);
            setLoading(false); // Ensure main form loading is false

            // Fetch contract types when the modal opens
            fetchContractTypes();

        } else {
             // Reset dropdown state when modal closes
             setShowContractTypeDropdown(false);
        }
    }, [isOpen, storedToken]);


    // --- Form Field Change Handler ---
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };
    // --- End Form Field Change Handler ---


    // --- Contract Type Selection Handlers ---
    const handleContractTypeSelect = (contractType) => {
        const isSelected = selectedContractTypes.some(selected => selected.id === contractType.id);

        if (isSelected) {
            setSelectedContractTypes(selectedContractTypes.filter(selected => selected.id !== contractType.id));
        } else {
            setSelectedContractTypes([...selectedContractTypes, contractType]);
        }
    };

    const isContractTypeSelected = (contractType) => {
        return selectedContractTypes.some(selected => selected.id === contractType.id);
    };
    // --- End Contract Type Selection Handlers ---


    // --- Language Handlers ---
    const handleLanguageChange = (index, e) => {
        const { name, value } = e.target;
        const newLanguages = [...languages];
        newLanguages[index][name] = name === 'level' ? parseInt(value, 10) || 1 : value; // Parse level as integer
        setLanguages(newLanguages);
    };

    const handleAddLanguage = () => {
        setLanguages([...languages, { languageName: '', description: '', level: 1 }]);
    };

    const handleRemoveLanguage = (index) => {
        const newLanguages = [...languages];
        newLanguages.splice(index, 1);
        setLanguages(newLanguages);
    };
    // --- End Language Handlers ---


    // --- Form Submission Handler ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError(null);
        setSuccess(false);

        if (!storedToken) {
            setError("Authentication token not found. Please log in.");
            setLoading(false);
            return;
        }

        // Prepare data for the backend
        let offerToCreate = { // Use 'let' to allow modification
            ...formData,
            datePublication: formData.datePublication,
            dateExpiration: formData.dateExpiration,
            basicSalary: formData.basicSalary ? parseFloat(formData.basicSalary) : null,
            contractTypes: selectedContractTypes.map(type => ({
                // Assuming backend expects typeName and description, adjust if only IDs are needed
                id: type.id, // Include ID if the backend might use it for existing entities
                typeName: type.typeName,
                description: type.description
            })),
            languages: languages
                .filter(lang => lang.languageName.trim() !== '')
                .map(lang => ({
                    languageName: lang.languageName,
                    description: lang.description,
                    level: lang.level
                })),
        };

        if (userRole === 'MANAGER' && managerEmail) {
            offerToCreate.managerId = {
                user: {
                    email: managerEmail
                }
                
            };
            console.log("Adding managerId object to offer:", offerToCreate.managerId);
        }

        console.log("Submitting Offer Data:", offerToCreate);

        try {
            const response = await Api.post('/offers/add', offerToCreate, {
                headers: {
                    'Authorization': `Bearer ${storedToken}`,
                    'Content-Type': 'application/json'
                }
            });

            // Le problème de sérialisation était sur la réponse du backend,
            // pas sur l'envoi de la requête. Si le backend renvoie un objet "Offer" avec des
            // entités lazy-loaded, vous pouvez toujours rencontrer le problème côté backend.
            // Ce correctif traite l'envoi de la donnée 'managerEmail' dans la requête.
            const createdOffer = response.data;

            setSuccess(true);
            setError(null);
            console.log("Offer created successfully:", createdOffer);

            onOfferAdded(createdOffer);

            setTimeout(onClose, 1500);

        } catch (err) {
            console.error("Failed to create offer:", err);
            const errorMessage = err.response?.data?.message || err.message || "An unknown error occurred.";
            setError(`Failed to create offer: ${errorMessage}`);
            setSuccess(false);
        } finally {
            setLoading(false);
        }
    };
    // --- End Form Submission Handler ---


    if (!isOpen) return null;

    // Render the modal
    return (
        // Modal Overlay
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-50 backdrop-blur-sm p-4 overflow-y-auto font-sans">
            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden max-h-[90vh]"> 
                {/* Modal Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Add New Job Offer
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                        aria-label="Close modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Modal Body - Form */}
                {/* Added overflow-y-auto to the body for scrolling if content exceeds height */}
                <div className="p-6 space-y-6 overflow-y-auto flex-grow" style={{ maxHeight: 'calc(90vh - 130px)' }}> {/* Dynamic max height */}
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Offer Details Section */}
                        <div className="md:col-span-2 border-b border-gray-200 dark:border-gray-700 pb-4 mb-2">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Offer Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Title */}
                                <div>
                                    <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title</label>
                                    <div className="relative">
                                        <Briefcase size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type="text"
                                            id="title"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="e.g., Software Engineer"
                                        />
                                    </div>
                                </div>

                                {/* Study Level */}
                                <div>
                                    <label htmlFor="studyLevel" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Study Level</label>
                                    <div className="relative">
                                        <Landmark size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type="text"
                                            id="studyLevel"
                                            name="studyLevel"
                                            value={formData.studyLevel}
                                            onChange={handleChange}
                                            required
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="e.g., Bachelor's Degree"
                                        />
                                    </div>
                                </div>

                                {/* Experience */}
                                <div>
                                    <label htmlFor="experience" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Experience</label>
                                    <div className="relative">
                                         <Briefcase size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type="text"
                                            id="experience"
                                            name="experience"
                                            value={formData.experience}
                                            onChange={handleChange}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="e.g., 2+ years"
                                        />
                                    </div>
                                </div>

                                {/* Modality */}
                                <div>
                                    <label htmlFor="modality" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Modality</label>
                                    <div className="relative">
                                        <Navigation size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                        <select
                                            id="modality"
                                            name="modality"
                                            value={formData.modality}
                                            onChange={handleChange}
                                            required
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        >
                                            <option value="OnSite">On-Site</option>
                                            <option value="Remote">Remote</option>
                                            <option value="Hybrid">Hybrid</option>
                                        </select>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Company & Location Section */}
                        <div className="md:col-span-2 border-b border-gray-200 dark:border-gray-700 pb-4 mb-2">
                             <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Company & Location</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {/* Company Name */}
                                 <div>
                                     <label htmlFor="companyName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Company Name</label>
                                     <div className="relative">
                                         <Landmark size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                         <input
                                             type="text"
                                             id="companyName"
                                             name="companyName"
                                             value={formData.companyName}
                                             onChange={handleChange}
                                             required
                                             className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                             placeholder="e.g., Tech Solutions Inc."
                                         />
                                     </div>
                                 </div>

                                 {/* Sector Activity */}
                                 <div>
                                     <label htmlFor="sectorActivity" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Sector Activity</label>
                                     <div className="relative">
                                          <Briefcase size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                         <input
                                             type="text"
                                             id="sectorActivity"
                                             name="sectorActivity"
                                             value={formData.sectorActivity}
                                             onChange={handleChange}
                                             className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                             placeholder="e.g., Information Technology"
                                         />
                                     </div>
                                 </div>

                                  {/* Location */}
                                  <div className="md:col-span-2"> {/* Span across two columns */}
                                      <label htmlFor="location" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Location</label>
                                      <div className="relative">
                                          <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                          <input
                                              type="text"
                                              id="location"
                                              name="location"
                                              value={formData.location}
                                              onChange={handleChange}
                                              required
                                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                              placeholder="e.g., San Francisco, CA"
                                          />
                                      </div>
                                  </div>
                             </div>
                        </div>

                        {/* Salary & Dates Section */}
                        <div className="md:col-span-2 border-b border-gray-200 dark:border-gray-700 pb-4 mb-2">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Salary & Dates</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Basic Salary */}
                                <div>
                                    <label htmlFor="basicSalary" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Basic Salary</label>
                                    <div className="relative">
                                        <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type="number"
                                            id="basicSalary"
                                            name="basicSalary"
                                            value={formData.basicSalary}
                                            onChange={handleChange}
                                            step="0.01"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="e.g., 60000.00"
                                        />
                                    </div>
                                </div>

                                {/* Flexible Hours */}
                                <div className="flex items-center mt-6 md:mt-0"> {/* Adjust margin for alignment in grid */}
                                    <input
                                        type="checkbox"
                                        id="flexibleHours"
                                        name="flexibleHours"
                                        checked={formData.flexibleHours}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <label htmlFor="flexibleHours" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Flexible Hours</label>
                                </div>

                                {/* Publication Date */}
                                <div>
                                    <label htmlFor="datePublication" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Publication Date</label>
                                    <div className="relative">
                                        <CalendarDays size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type="date"
                                            id="datePublication"
                                            name="datePublication"
                                            value={formData.datePublication}
                                            onChange={handleChange}
                                            required
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Expiration Date */}
                                <div>
                                    <label htmlFor="dateExpiration" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Expiration Date</label>
                                    <div className="relative">
                                        <CalendarDays size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                        <input
                                            type="date"
                                            id="dateExpiration"
                                            name="dateExpiration"
                                            value={formData.dateExpiration}
                                            onChange={handleChange}
                                            required
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                         {/* Description & Skills Section */}
                         <div className="md:col-span-2 border-b border-gray-200 dark:border-gray-700 pb-4 mb-2">
                              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Description & Skills</h4>
                              <div className="grid grid-cols-1 gap-4"> {/* Inner grid for text areas */}
                                  {/* Description */}
                                  <div>
                                      <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
                                      <div className="relative">
                                           <FileText size={18} className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" /> {/* Adjust icon position for textarea */}
                                          <textarea
                                              id="description"
                                              name="description"
                                              value={formData.description}
                                              onChange={handleChange}
                                              rows="4" // Increased rows for more space
                                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                              placeholder="Enter detailed job description..."
                                          ></textarea>
                                      </div>
                                  </div>

                                  {/* Skills */}
                                  <div>
                                      <label htmlFor="skills" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Skills</label>
                                      <div className="relative">
                                           <FileText size={18} className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" /> {/* Adjust icon position for textarea */}
                                          <textarea
                                              id="skills"
                                              name="skills"
                                              value={formData.skills}
                                              onChange={handleChange}
                                              rows="2"
                                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                              placeholder="List required skills (comma-separated)..."
                                          ></textarea>
                                      </div>
                                  </div>
                              </div>
                         </div>

                         {/* Contract Types Section */}
                         <div className="md:col-span-2 border-b border-gray-200 dark:border-gray-700 pb-4 mb-2">
                             <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Contract Types</h4>
                             {contractTypesLoading && <p className="text-gray-600 dark:text-gray-400">Loading contract types...</p>}
                             {contractTypesError && <p className="text-red-600 dark:text-red-400">Error loading contract types: {contractTypesError.message}</p>}

                             {!contractTypesLoading && !contractTypesError && (
                                 <div className="relative">
                                     {/* Selected Contract Types Display */}
                                     <div
                                         className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-pointer dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 flex flex-wrap gap-2 items-center min-h-[42px]"
                                         onClick={() => setShowContractTypeDropdown(!showContractTypeDropdown)}
                                     >
                                         {selectedContractTypes.length > 0 ? (
                                             selectedContractTypes.map(type => (
                                                 <span key={type.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                     {type.typeName}
                                                     <button
                                                         type="button"
                                                         className="flex-shrink-0 ml-1.5 inline-flex text-blue-400 hover:text-blue-500 dark:text-blue-300 dark:hover:text-blue-400 focus:outline-none"
                                                         onClick={(e) => { e.stopPropagation(); handleContractTypeSelect(type); }} // Prevent dropdown close on remove
                                                     >
                                                         <X size={12} />
                                                     </button>
                                                 </span>
                                             ))
                                         ) : (
                                             <span className="text-gray-400 dark:text-gray-500">Select contract types...</span>
                                         )}
                                          <span className="ml-auto">
                                             {showContractTypeDropdown ? <ChevronUp size={18} className="text-gray-400 dark:text-gray-500" /> : <ChevronDown size={18} className="text-gray-400 dark:text-gray-500" />}
                                         </span>
                                     </div>

                                     {/* Dropdown List */}
                                     {showContractTypeDropdown && (
                                         <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600 max-h-48 overflow-y-auto">
                                             {availableContractTypes.map(type => (
                                                 <div
                                                     key={type.id}
                                                     className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 ${isContractTypeSelected(type) ? 'bg-blue-50 dark:bg-blue-800' : ''}`}
                                                     onClick={() => handleContractTypeSelect(type)}
                                                 >
                                                     <input
                                                         type="checkbox"
                                                         checked={isContractTypeSelected(type)}
                                                         readOnly // Prevent direct interaction with checkbox, handled by div click
                                                         className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                                     />
                                                     <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer w-full">{type.typeName}</label>
                                                 </div>
                                             ))}
                                         </div>
                                     )}
                                 </div>
                             )}
                         </div>


                         {/* Languages Section */}
                         <div className="md:col-span-2">
                             <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Languages</h4>
                             <div className="space-y-4">
                                 {languages.map((lang, index) => (
                                     <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                         {/* Language Name */}
                                         <div>
                                             <label htmlFor={`languageName-${index}`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Language</label>
                                             <input
                                                 type="text"
                                                 id={`languageName-${index}`}
                                                 name="languageName"
                                                 value={lang.languageName}
                                                 onChange={(e) => handleLanguageChange(index, e)}
                                                 className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                 placeholder="e.g., English"
                                             />
                                         </div>
                                         {/* Language Level */}
                                         <div>
                                             <label htmlFor={`level-${index}`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Level (1-5)</label>
                                             <input
                                                 type="number"
                                                 id={`level-${index}`}
                                                 name="level"
                                                 value={lang.level}
                                                 onChange={(e) => handleLanguageChange(index, e)}
                                                 min="1"
                                                 max="5"
                                                 className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                 placeholder="e.g., 5"
                                             />
                                         </div>
                                          {/* Remove Language Button */}
                                         <div className="flex items-end justify-end sm:justify-start"> {/* Align button */}
                                             {languages.length > 1 && ( // Only show remove button if there's more than one language
                                                 <button
                                                     type="button"
                                                     onClick={() => handleRemoveLanguage(index)}
                                                     className="p-2 text-red-600 bg-red-100 rounded-full hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 transition-colors"
                                                     aria-label={`Remove language ${index + 1}`}
                                                 >
                                                     <Trash2 size={18} />
                                                 </button>
                                             )}
                                         </div>
                                          {/* Language Description (Spans across columns on small screens) */}
                                          <div className="sm:col-span-3">
                                              <label htmlFor={`description-${index}`} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description (Optional)</label>
                                              <textarea
                                                  id={`description-${index}`}
                                                  name="description"
                                                  value={lang.description}
                                                  onChange={(e) => handleLanguageChange(index, e)}
                                                  rows="1"
                                                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                  placeholder="Brief description of proficiency..."
                                              ></textarea>
                                          </div>
                                     </div>
                                 ))}
                                 {/* Add Language Button */}
                                 <button
                                     type="button"
                                     onClick={handleAddLanguage}
                                     className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                                 >
                                     <PlusCircle size={18} className="mr-2" />
                                     Add Another Language
                                 </button>
                             </div>
                         </div>


                    </form>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center p-6 space-x-2 border-t border-gray-200 dark:border-gray-700">
                     {/* Display messages in the footer area */}
                    {success && <p className="text-green-600 dark:text-green-400 text-sm font-medium mr-auto">Offer added successfully!</p>}
                    {error && <p className="text-red-600 dark:text-red-400 text-sm font-medium mr-auto">{error}</p>}

                    <button
                        type="button" // Changed to type="button" as the form has its own submit handler
                        onClick={onClose}
                        className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit" // This button will trigger the form submission
                        onClick={handleSubmit} // Keep onClick for clarity, but type="submit" on button is primary
                        disabled={loading}
                        className={`text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Adding...' : 'Add Offer'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddOfferModal;
