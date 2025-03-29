import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

// Role constants
const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  USER: 'ROLE_USER',
  LIBRARIAN: 'ROLE_LIBRARIAN',
  STUDENT: 'ROLE_STUDENT'
};

function RoleProtectedRoute({ children, allowedRoles }) {
  const isAuthenticated = authService.isAuthenticated();
  const userRoles = authService.getUserRoles();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Check if user has any of the allowed roles
  const hasAllowedRole = allowedRoles.some(role => userRoles.includes(role));

  if (!hasAllowedRole) {
    // Redirect to home if user doesn't have required role
    return <Navigate to="/" replace />;
  }

  return children;
}

export { RoleProtectedRoute, ROLES }; 