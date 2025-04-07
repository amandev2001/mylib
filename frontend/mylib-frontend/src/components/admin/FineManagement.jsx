import { useState, useEffect } from 'react';
import { 
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  UserGroupIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { useDarkMode } from '../../context/DarkModeContext';
import { formatDate } from '../../utils/dateExtensions';

export default function FineManagement() {
  const { isDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fines, setFines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [stats, setStats] = useState({
    totalFines: 0,
    paidFines: 0,
    pendingFines: 0,
    totalAmount: 0
  });

  useEffect(() => {
    fetchFines();
  }, []);

  const fetchFines = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to fetch fines
      // const response = await fineService.getAllFines();
      // setFines(response.data);
      // calculateStats(response.data);
    } catch (err) {
      console.error('Error fetching fines:', err);
      setError('Failed to load fines. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (finesData) => {
    const totalFines = finesData.length;
    const paidFines = finesData.filter(fine => fine.status === 'PAID').length;
    const pendingFines = totalFines - paidFines;
    const totalAmount = finesData.reduce((sum, fine) => sum + fine.amount, 0);

    setStats({
      totalFines,
      paidFines,
      pendingFines,
      totalAmount
    });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredFines = fines.filter(fine => 
    fine.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fine.bookTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedFines = [...filteredFines].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Fine Management
        </h1>
        <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage and track library fines
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Fines</p>
              <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalFines}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="flex items-center">
            <ArrowUpIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Paid Fines</p>
              <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.paidFines}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="flex items-center">
            <ArrowDownIcon className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending Fines</p>
              <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.pendingFines}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Amount</p>
              <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ${stats.totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by user or book..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <MagnifyingGlassIcon className={`absolute right-3 top-2.5 h-5 w-5 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`} />
        </div>
      </div>

      {/* Fines Table */}
      <div className={`rounded-lg shadow overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('userName')}
              >
                <div className="flex items-center">
                  <UserGroupIcon className="h-4 w-4 mr-1" />
                  User
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('bookTitle')}
              >
                <div className="flex items-center">
                  <BookOpenIcon className="h-4 w-4 mr-1" />
                  Book
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                  Amount
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('dueDate')}
              >
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  Due Date
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('status')}
              >
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : sortedFines.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No fines found
                </td>
              </tr>
            ) : (
              sortedFines.map((fine) => (
                <tr key={fine.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {fine.userName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      {fine.bookTitle}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${fine.amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      {formatDate(fine.dueDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      fine.status === 'PAID'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {fine.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {/* TODO: Implement mark as paid */}}
                      className={`text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300`}
                    >
                      Mark as Paid
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}