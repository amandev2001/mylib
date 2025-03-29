// Role constants - matching backend roles
export const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  LIBRARIAN: 'ROLE_LIBRARIAN',
  STUDENT: 'ROLE_STUDENT'
};

// Define which roles can access which routes/features
export const NAV_PERMISSIONS = {
  dashboard: { roles: [] }, // Empty array means all authenticated users can access
  books: { roles: [] },
  members: { roles: [ROLES.ADMIN, ROLES.LIBRARIAN] },
  loans: { roles: [ROLES.ADMIN, ROLES.LIBRARIAN] }
};

/**
 * Check if user has a specific role
 * @param {Array} userRoles - Array of user's roles
 * @param {String} requiredRole - Role to check for
 * @returns {Boolean}
 */
export const hasRole = (userRoles, requiredRole) => {
  return Array.isArray(userRoles) && userRoles.includes(requiredRole);
};

/**
 * Check if user has any of the required roles
 * @param {Array} userRoles - Array of user's roles
 * @param {Array} requiredRoles - Array of roles to check for
 * @returns {Boolean}
 */
export const hasAnyRole = (userRoles, requiredRoles) => {
  // If no roles required or empty array, allow access
  if (!requiredRoles || requiredRoles.length === 0) return true;
  // Check if user has any of the required roles
  return Array.isArray(userRoles) && requiredRoles.some(role => userRoles.includes(role));
};

/**
 * Check if user can access a specific route
 * @param {Array} userRoles - Array of user's roles
 * @param {String} route - Route name to check access for
 * @returns {Boolean}
 */
export const canAccessRoute = (userRoles, route) => {
  const permission = NAV_PERMISSIONS[route];
  // If no permission defined for route, allow access
  if (!permission) return true;
  // Check if user has any of the required roles
  return hasAnyRole(userRoles, permission.roles);
}; 