import { BookOpenIcon, UserGroupIcon, ClipboardDocumentListIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { useDarkMode } from '../context/DarkModeContext';

function StatCard({ title, value, icon: Icon, trend, isDarkMode }) {
  return (
    <div className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} rounded-lg shadow-md p-6 transition-colors duration-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>{title}</p>
          <h3 className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</h3>
          <p className={`${isDarkMode ? 'text-green-400' : 'text-green-600'} text-sm mt-2 flex items-center`}>
            <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
            {trend}% from last month
          </p>
        </div>
        <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-blue-100'} p-3 rounded-full`}>
          <Icon className={`h-6 w-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        </div>
      </div>
    </div>
  );
}

function RecentActivity({ title, date, type, status, isDarkMode }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</p>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{date}</p>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 text-xs rounded-full ${
          type === 'borrow' 
            ? isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700' 
            : isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-700'
        }`}>
          {type}
        </span>
        <span className={`px-2 py-1 text-xs rounded-full ${
          status === 'completed' 
            ? isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-700' 
            : isDarkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {status}
        </span>
      </div>
    </div>
  );
}

function Dashboard() {
  const { isDarkMode } = useDarkMode();
  
  const stats = [
    { title: 'Total Books', value: '1,234', icon: BookOpenIcon, trend: 12 },
    { title: 'Active Members', value: '567', icon: UserGroupIcon, trend: 8 },
    { title: 'Current Loans', value: '89', icon: ClipboardDocumentListIcon, trend: 5 },
  ];

  const recentActivities = [
    { title: 'The Great Gatsby', date: 'Mar 20, 2024', type: 'borrow', status: 'completed' },
    { title: '1984', date: 'Mar 19, 2024', type: 'return', status: 'pending' },
    { title: 'To Kill a Mockingbird', date: 'Mar 18, 2024', type: 'borrow', status: 'completed' },
  ];

  return (
    <div>
      <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} isDarkMode={isDarkMode} />
        ))}
      </div>

      <div className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} rounded-lg shadow-md p-6 transition-colors duration-200`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recent Activities</h3>
        <div className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
          {recentActivities.map((activity) => (
            <RecentActivity key={activity.title} {...activity} isDarkMode={isDarkMode} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 