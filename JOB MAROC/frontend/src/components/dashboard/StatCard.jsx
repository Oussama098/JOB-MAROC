// src/components/dashboard/StatCard.jsx
import { ArrowUp, ArrowDown } from 'lucide-react';

const StatCard = ({ title, value, icon, change, changeType = 'increase' }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 flex flex-col transition-all hover:shadow-md border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
          {icon}
        </div>
      </div>
      <div className="flex-1">
        <p className="text-2xl font-semibold text-gray-800 dark:text-white">{value}</p>
        
        {change && (
          <div className="flex items-center mt-2">
            <span className={`flex items-center text-sm ${
              changeType === 'increase' 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {changeType === 'increase' ? (
                <ArrowUp size={14} className="mr-1" />
              ) : (
                <ArrowDown size={14} className="mr-1" />
              )}
              {change}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs dernière période</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;