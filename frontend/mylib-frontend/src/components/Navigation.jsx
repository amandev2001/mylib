import { Link } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';
import authService from '../services/authService';

export default function Navigation() {
  const { isDarkMode } = useDarkMode();
  const linkClasses = 'block px-4 py-2 rounded-md text-sm font-medium';
  const hasAdminAccess = authService.getUserRoles().some(
    role => ['ROLE_ADMIN', 'ROLE_LIBRARIAN'].includes(role)
  );

  return (
    <nav className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md p-4`}>
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className={`${linkClasses} ${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'}`}
        >
          Home
        </Link>
        <Link
          to="/books"
          className={`${linkClasses} ${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'}`}
        >
          Books
        </Link>
        <Link
          to="/loans"
          className={`${linkClasses} ${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'}`}
        >
          Loans
        </Link>
        {hasAdminAccess && (
          <Link
            to="/dashboard"
            className={`${linkClasses} ${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'}`}
          >
            Dashboard
          </Link>
        )}
      </div>
    </nav>
  );
}