import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  BookOpenIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  QueueListIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  DocumentChartBarIcon,
  CurrencyDollarIcon,
  BookmarkIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ChatBubbleLeftIcon,
  FolderIcon,
  BellIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { authService } from "../services/authService";
import { useEffect, useState } from "react";

// Role constants
const ROLES = {
  ADMIN: "ROLE_ADMIN",
  USER: "ROLE_USER",
  LIBRARIAN: "ROLE_LIBRARIAN",
  STUDENT: "ROLE_STUDENT",
};

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userRoles = authService.getUserRoles();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const isAdmin = userRoles.includes(ROLES.ADMIN);
  const isLibrarian = userRoles.includes(ROLES.LIBRARIAN);
  const isStudent = userRoles.includes(ROLES.STUDENT);

  // Helper function to determine if a link is active
  const isLinkActive = (path) => {
    return location.pathname === path;
  };

  // Navigation link component with active state
  const NavLink = ({ to, icon: Icon, children }) => {
    const isActive = isLinkActive(to);
    return (
      <Link
        to={to}
        className={`flex items-center px-3 py-2 rounded-md text-sm transition-all duration-200 ${
          isActive
            ? "bg-blue-600 text-white font-medium shadow-md"
            : "text-gray-300 hover:bg-gray-800 hover:text-white"
        }`}
      >
        <Icon
          className={`h-5 w-5 mr-2 transition-transform duration-200 ${
            isActive ? "scale-110" : ""
          }`}
        />
        <span
          className={`${
            isActive ? "transform translate-x-1" : ""
          } transition-transform duration-200`}
        >
          {children}
        </span>
      </Link>
    );
  };

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen bg-gray-900 border-r border-gray-800 z-30">
      {/* Logo Area */}
      <div className="h-16 border-b border-gray-800 flex items-center px-4">
        <Link to="/" className="text-xl font-bold text-blue-400">
          MyLib
        </Link>
      </div>

      {/* Sidebar Navigation */}
      <nav className="h-[calc(100vh-4rem)] overflow-y-auto px-4 py-4">
        <div className="space-y-6">
          {/* Dashboard Section for All Users */}
          <div>
            <NavLink to="/books" icon={BookOpenIcon}>
              Books
            </NavLink>
          </div>

          {/* Admin/Librarian Section */}
          {(isAdmin || isLibrarian) && (
            <div>
              <div className="text-gray-400 uppercase tracking-wider text-xs font-semibold mb-2">
                MANAGEMENT
              </div>
              <div className="space-y-1">
                <NavLink to="/manage-books" icon={BookOpenIcon}>
                  Manage Books
                </NavLink>
                <NavLink to="/members" icon={UserGroupIcon}>
                  Manage Users
                </NavLink>
                {isAdmin && (
                  <NavLink to="/role-management" icon={ShieldCheckIcon}>
                    Role Management
                  </NavLink>
                )}
                <NavLink to="/borrow-management" icon={ClipboardDocumentListIcon}>
                  Borrow Management
                </NavLink>
                <NavLink to="/loans" icon={ClipboardDocumentListIcon}>
                  Loans Management
                </NavLink>
                <NavLink to="/reservation-management" icon={QueueListIcon}>
                  Reservation Requests
                </NavLink>
                <NavLink to="/fines" icon={CurrencyDollarIcon}>
                  Fine Management
                </NavLink>
              </div>
            </div>
          )}

          {/* Student/Reader Section */}
          {isStudent && (
            <div>
              <div className="text-gray-400 uppercase tracking-wider text-xs font-semibold mb-2">
                MY LIBRARY
              </div>
              <div className="space-y-1">
                <NavLink to="/my-borrows" icon={BookmarkIcon}>
                  My Borrows
                </NavLink>
                <NavLink to="/my-reservations" icon={ClockIcon}>
                  Reservation Requests
                </NavLink>
                <NavLink to="/return" icon={ClipboardDocumentCheckIcon}>
                  Return Books
                </NavLink>
                <NavLink to="/history" icon={ChartBarIcon}>
                  History
                </NavLink>
                <NavLink to="/my-fines" icon={CurrencyDollarIcon}>
                  Fines & Payments
                </NavLink>
              </div>
            </div>
          )}

          {/* User Profile Section */}
          <div>
            <div className="text-gray-400 uppercase tracking-wider text-xs font-semibold mb-2">
              ACCOUNT
            </div>
            <div className="space-y-1">
              <NavLink to="/profile" icon={UserCircleIcon}>
                Profile
              </NavLink>
              <NavLink to="/notifications" icon={BellIcon}>
                Notifications
              </NavLink>
            </div>
          </div>

          {/* Support Section */}
          <div>
            <div className="text-gray-400 uppercase tracking-wider text-xs font-semibold mb-2">
              SUPPORT
            </div>
            <div className="space-y-1">
              <NavLink to="/help" icon={QuestionMarkCircleIcon}>
                Help Center
              </NavLink>
              <NavLink to="/support" icon={ChatBubbleLeftIcon}>
                Contact Support
              </NavLink>
            </div>
          </div>

          {/* Settings Section for Admin */}
          {isAdmin && (
            <div>
              <div className="text-gray-400 uppercase tracking-wider text-xs font-semibold mb-2">
                SETTINGS
              </div>
              <div className="space-y-1">
                <NavLink to="/settings" icon={Cog6ToothIcon}>
                  System Settings
                </NavLink>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <div className="pt-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-gray-800"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed bottom-4 right-4 z-50 p-3 rounded-full bg-blue-600 text-white shadow-lg"
      >
        {isMobileMenuOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50">
          <div className="fixed inset-y-0 right-0 w-64 bg-gray-900 shadow-lg">
            <div className="h-full overflow-y-auto">
              <nav className="px-4 py-6 space-y-6">
                {/* Mobile navigation items - same as desktop */}
              </nav>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Navbar;
