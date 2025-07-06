import React from 'react';
import {
    Building2, MapPin, CircleDollarSign, Briefcase,
    GraduationCap, CalendarDays, FileText, ArrowRight
} from 'lucide-react';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    } catch (error) {
        console.error("Error formatting date:", dateString, error);
        return 'Invalid Date';
    }
};

const OfferCard_T = ({ offer, onViewDetails, onApply }) => {
    const displayOffer = offer || {
        title: "Offer data missing",
        companyName: "N/A",
        location: "N/A",
        basicSalary: null,
        modality: "N/A",
        studyLevel: "N/A",
        datePublication: null,
        dateExpiration: null,
        contractTypes: [],
        skills: "N/A",
        experience: "N/A",
        sectorActivity: "N/A",
        flexibleHours: false,
        languages: [],
        originalHref: null,
        cardFooter1: null,
        cardFooter3: null
    };

    const isScrapedOffer = !!displayOffer.originalHref;

    const handleViewDetailsClick = () => {
        if (onViewDetails) {
            onViewDetails(displayOffer);
        }
    };

    const handleApplyClick = () => {
        if (onApply) {
            onApply(displayOffer);
        }
    };

    return (
        <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-lg hover:shadow-2xl p-6 md:p-8 transition-all duration-300 ease-in-out border border-slate-200 dark:border-slate-700 flex flex-col h-full">
            <div className="mb-5 pb-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl md:text-2xl font-bold text-sky-600 dark:text-sky-400 mb-1 leading-tight">{displayOffer.title}</h2>
                <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm">
                    <Building2 size={16} className="mr-2 text-sky-500 dark:text-sky-400 flex-shrink-0" />
                    <p className="font-medium">{displayOffer.companyName}</p>
                </div>
            </div>

            <div className="space-y-3 text-sm md:text-base flex-grow">
                {displayOffer.location && displayOffer.location !== "N/A" && (
                    <div className="flex items-start">
                        <MapPin size={18} className="mr-3 mt-0.5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                        <p><strong className="font-semibold text-slate-700 dark:text-slate-300">Location:</strong> {displayOffer.location}</p>
                    </div>
                )}

                {displayOffer.basicSalary != null && (
                    <div className="flex items-start">
                        <CircleDollarSign size={18} className="mr-3 mt-0.5 text-green-500 dark:text-green-400 flex-shrink-0" />
                        <p><strong className="font-semibold text-slate-700 dark:text-slate-300">Salary:</strong> <span className="text-green-600 dark:text-green-400 font-medium">{displayOffer.basicSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
                    </div>
                )}

                {displayOffer.modality && displayOffer.modality !== "N/A" && (
                    <div className="flex items-start">
                        <Briefcase size={18} className="mr-3 mt-0.5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                        <p><strong className="font-semibold text-slate-700 dark:text-slate-300">Modality:</strong> {displayOffer.modality}</p>
                    </div>
                )}

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2 text-xs md:text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center">
                        <CalendarDays size={16} className="mr-2" />
                        <p><strong>Published:</strong> {formatDate(displayOffer.datePublication)}</p>
                    </div>
                    <div className="flex items-center">
                        <CalendarDays size={16} className="mr-2" />
                        <p><strong>Expires:</strong> {formatDate(displayOffer.dateExpiration)}</p>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center flex flex-col sm:flex-row justify-center gap-4">
                <button
                    onClick={handleViewDetailsClick}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-800 transition-all duration-300 group w-full sm:w-auto"
                >
                    Afficher les détails
                    <ArrowRight size={20} className="ml-2 -mr-1 transition-transform duration-300 group-hover:translate-x-1" />
                </button>

                <button
                    onClick={handleApplyClick}
                    className="inline-flex items-center justify-center px-3 py-1 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-800 transition-all duration-300 group w-full sm:w-auto"
                >
                    Postuler
                    <ArrowRight size={20} className="ml-2 -mr-1 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
            </div>
        </div>
    );
};

export default OfferCard_T;