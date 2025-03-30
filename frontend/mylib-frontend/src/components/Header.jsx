import { Link } from 'react-router-dom';
import { 
  HomeIcon,
  BookOpenIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  UserCircleIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  Cog6ToothIcon,
  BookmarkIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useDarkMode } from '../context/DarkModeContext';

function Header() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
        if (user?.roles) {
          // Remove 'ROLE_' prefix and capitalize first letter
          const formattedRoles = user.roles.map(role => 
            role.replace('ROLE_', '').charAt(0).toUpperCase() + 
            role.replace('ROLE_', '').slice(1).toLowerCase()
          );
          setUserRoles(formattedRoles);
        }
      }
    };
    fetchUserData();
  }, [isAuthenticated]);

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  const handleClickOutside = (event) => {
    if (isProfileMenuOpen && !event.target.closest('.profile-menu')) {
      setIsProfileMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const isAdmin = currentUser?.roles?.some(role => role === 'ROLE_ADMIN');

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-20">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left section - Navigation Links */}
        {/* <nav className="hidden md:flex items-center space-x-4">
          <Link to="/" className="flex items-center text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400">
            <HomeIcon className="h-5 w-5" />
            <span className="ml-1">Home</span>
          </Link>
          <Link to="/books" className="flex items-center text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400">
            <BookOpenIcon className="h-5 w-5" />
            <span className="ml-1">Books</span>
          </Link>
          <Link to="/categories" className="flex items-center text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400">
            <FolderIcon className="h-5 w-5" />
            <span className="ml-1">Categories</span>
          </Link>
        </nav> */}

        {/* Center section - Search Bar */}
        <div className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search books, authors, or categories..."
              className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Right section - User Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 relative">
            <BellIcon className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* User Menu */}
          {isAuthenticated ? (
            <div className="relative profile-menu">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <UserCircleIcon className="h-6 w-6" />
                <span className="hidden md:block">{currentUser?.name || 'My Account'}</span>
              </button>

              {/* Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                  {/* User Info Section */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{currentUser?.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {userRoles.map((role, index) => (
                        <span 
                          key={index}
                          className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <UserCircleIcon className="h-5 w-5 mr-3" />
                      Profile Settings
                    </Link>
                    <Link
                      to="/my-borrows"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <BookOpenIcon className="h-5 w-5 mr-3" />
                      My Borrowed Books
                    </Link>
                    <Link
                      to="/reading-list"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <BookmarkIcon className="h-5 w-5 mr-3" />
                      Reading List
                    </Link>
                    <Link
                      to="/history"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <ClipboardDocumentListIcon className="h-5 w-5 mr-3" />
                      Borrow History
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <ShieldCheckIcon className="h-5 w-5 mr-3" />
                        Admin Dashboard
                      </Link>
                    )}
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Cog6ToothIcon className="h-5 w-5 mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;