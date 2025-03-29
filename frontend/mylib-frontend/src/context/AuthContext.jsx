import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

// Create the auth context
const AuthContext = createContext(null);

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [userRoles, setUserRoles] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Initialize auth state when component mounts
  useEffect(() => {
    const initializeAuth = () => {
      const token = authService.getCurrentToken();
      if (token) {
        const roles = authService.getUserRoles();
        setIsAuthenticated(true);
        setUserRoles(roles);
        // You could also fetch user details here if needed
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      setIsAuthenticated(true);
      setUserRoles(response.roles || []);
      setUser({
        email: response.email,
        name: response.name
      });
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUserRoles([]);
    setUser(null);
  };

  // Provide auth context value
  const value = {
    isAuthenticated,
    userRoles,
    user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 