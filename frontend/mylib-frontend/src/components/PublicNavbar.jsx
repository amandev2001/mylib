import { Link } from "react-router-dom";
import {
  BookOpenIcon,
  ClipboardDocumentListIcon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  BookOpenIcon as BookIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { useDarkMode } from "../context/DarkModeContext";
import { authService } from "../services/authService";
import { APP_NAME } from "../config";
import { memberService } from "../services/memberService";

const DEFAULT_PROFILE = '/images/default.png';

function PublicNavbar({ isDarkMode }) {
  const { toggleDarkMode } = useDarkMode();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  // console.log(`roles: ${userRoles}`);
  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = currentUser?.roleList?.some(role => role === 'ROLE_ADMIN');
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        const user = await memberService.getCurrentMember();
        setCurrentUser(user);
        if (user?.roleList) {
          const formattedRoles = user.roleList.map(
            (role) =>
              role.replace("ROLE_", "").charAt(0).toUpperCase() +
              role.replace("ROLE_", "").slice(1).toLowerCase()
          );
          setUserRoles(formattedRoles);
        }
      }
    };
    fetchUserData();
  }, [isAuthenticated]);

  const handleLogout = () => {
    authService.logout();
    window.location.href = "/login";
  };

  const handleClickOutside = (event) => {
    if (isProfileMenuOpen && !event.target.closest(".profile-menu")) {
      setIsProfileMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 ${
        isDarkMode ? "bg-gray-900" : "bg-white"
      } shadow-md`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/book.svg"
              alt={`${APP_NAME} logo`}
              className={`h-8 w-8 ${
                isDarkMode ? "text-blue-400" : "text-blue-600"
              }`}
            />
            <span
              className={`text-xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {APP_NAME}
            </span>
          </Link>

          {/* Auth Buttons and Dark Mode Toggle */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${
                isDarkMode
                  ? "text-gray-300 hover:bg-gray-800"
                  : "text-gray-600 hover:bg-gray-100"
              } transition-colors`}
            >
              {isDarkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>

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
    </nav>
  );
}

export default PublicNavbar;
