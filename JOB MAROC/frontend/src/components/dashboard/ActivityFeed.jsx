// src/components/dashboard/ActivityFeed.jsx
import { User, ShoppingCart, DollarSign, Settings } from 'lucide-react';

const ActivityFeed = () => {
  const activities = [
    {
      id: 1,
      user: 'John Doe',
      action: 'created a new account',
      time: '5 minutes ago',
      icon: <User size={16} />,
      iconColor: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
    },
    {
      id: 2,
      user: 'Sarah Smith',
      action: 'purchased Product X',
      time: '2 hours ago',
      icon: <ShoppingCart size={16} />,
      iconColor: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
    },
    {
      id: 3,
      user: 'Mark Wilson',
      action: 'requested a refund',
      time: '5 hours ago',
      icon: <DollarSign size={16} />,
      iconColor: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
    },
    {
      id: 4,
      user: 'Admin',
      action: 'updated system settings',
      time: '1 day ago',
      icon: <Settings size={16} />,
      iconColor: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 border border-gray-100 dark:border-gray-700">
      <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start">
            <div className={`p-2 rounded-full ${activity.iconColor} mr-3 flex-shrink-0 mt-0.5`}>
              {activity.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800 dark:text-gray-200">
                <span className="font-medium">{activity.user}</span> {activity.action}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          View all activity
        </a>
      </div>
    </div>
  );
};

export default ActivityFeed;