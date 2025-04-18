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
  BookmarkIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  Bars3Icon,
  ClipboardIcon,
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useDarkMode } from '../context/DarkModeContext';
import { useSidebar } from '../context/SidebarContext';
import { useUser } from '../context/UserContext';
import { APP_NAME } from "../config";

const DEFAULT_PROFILE = '/images/default.png';

function Header() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const { currentUser, userRoles } = useUser();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = currentUser?.roleList?.some(role => role === 'ROLE_ADMIN');

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

  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30">
      <div className="h-full flex">
        {/* Logo Area with Toggle Button - Fixed width on desktop, auto on mobile */}
        <div className="w-auto md:w-64 h-full flex items-center px-4 border-r border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle Sidebar"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <Link to="/" className="ml-2 text-xl font-bold text-blue-600 dark:text-blue-400 truncate">
            {APP_NAME}
          </Link>
        </div>

        {/* Main Header Content - Takes remaining width */}
        <div className="flex-1 px-4 flex items-center justify-between">
          {/* Center section - Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-2xl">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search books, authors, or categories..."
                className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Right section - User Actions */}
          <div className="flex items-center space-x-4 ml-4">
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

            {/* Notifications
            <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 relative">
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
            </button> */}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative profile-menu">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <img
                    src={`${currentUser?.profilePic}` || DEFAULT_PROFILE}
                    alt="user profile pic"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  {/* <UserCircleIcon className="h-6 w-6" />
                  <span className="hidden md:block">{currentUser?.name || 'My Account'}</span> */}
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
                        to="/books"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <BookOpenIcon className="h-5 w-5 mr-3" />
                        Books
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <UserCircleIcon className="h-5 w-5 mr-3" />
                        Profile Settings
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/loans"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <ClipboardDocumentListIcon className="h-5 w-5 mr-3" />
                          Loan Management
                        </Link>
                      )}
                      {/* <Link
                        to="/my-borrows"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <BookOpenIcon className="h-5 w-5 mr-3" />
                        My Borrowed Books
                      </Link> */}
                      {/* <Link
                        to="/reading-list"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <BookmarkIcon className="h-5 w-5 mr-3" />
                        Reading List
                      </Link> */}
                      {/* <Link
                        to="/history"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <ClipboardDocumentListIcon className="h-5 w-5 mr-3" />
                        Borrow History
                      </Link> */}
                      {/* {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <ShieldCheckIcon className="h-5 w-5 mr-3" />
                          Admin Dashboard
                        </Link>
                      )} */}
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
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
      </div>
    </header>
  );
}

export default Header;