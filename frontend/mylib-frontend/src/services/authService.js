import api from './api';

const TOKEN_KEY = 'token';
const USER_ROLES_KEY = 'user_roles';
const USER_DATA_KEY = 'user_data';

export const authService = {

  login: async (credentials) => {
    try {
      console.group('LOGIN');
      console.log('Attempting login with credentials:', credentials);

      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      const response = await api.post('/api/users/login', credentials);
      console.log('Login response:', response);

      if (response.data) {
        const { token, roles, email, name, userId } = response.data;

        console.log('Login response data:', { token, roles, email, name, userId });
        console.log('Type of roles:', typeof roles, 'Value:', roles);

        if (!token || !email || !name || !roles || !userId) {
          throw new Error('Invalid login response data');
        }

        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_ROLES_KEY, JSON.stringify(roles));

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Authorization header set:', `Bearer ${token}`);

        const user = { id: userId, email, name, roles };
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
        console.log('User data stored:', user);

        console.groupEnd();
        return response.data;
      }

      throw new Error('No data received from login');
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      authService.logout();
      if (error.response?.status === 403) {
        throw new Error(error.response?.data?.message || 'Access denied');
      }
      if (error.response?.status === 401) {
        throw new Error(error.response?.data || 'Invalid credentials');
      }
      throw new Error('Failed to login. Please try again.');
    }
  },

  refreshAuthToken: async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) throw new Error('No token available for refresh');

      const response = await api.post('/api/users/refresh-token', null, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data?.token) {
        const newToken = response.data.token;
        localStorage.setItem(TOKEN_KEY, newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        console.log('Token successfully refreshed:', newToken);
        return newToken;
      }

      throw new Error('Invalid refresh token response');
    } catch (error) {
      console.error('Token refresh failed:', error);
      authService.logout();
      throw error;
    }
  },

  register: async (userData) => {
    const response = await api.post('/api/users/register', userData);
    return response.data;
  },

  logout: () => {
    console.group('LOGOUT');
    console.log('Clearing all auth data from localStorage');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ROLES_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    delete api.defaults.headers.common['Authorization'];
    console.groupEnd();
  },

  getCurrentToken: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log('Current token from storage:', token);
    return token;
  },

  getUserRoles: () => {
    const roles = localStorage.getItem(USER_ROLES_KEY);
    console.log('Raw roles from storage:', roles);
    try {
      const parsed = JSON.parse(roles);
      console.log('Parsed roles:', parsed, 'Type:', typeof parsed, 'Is Array:', Array.isArray(parsed));
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Error parsing roles:', e);
      return [];
    }
  },

  hasRole: (role) => {
    const roles = authService.getUserRoles();
    console.log(`Checking if user has role "${role}":`, roles);
    return roles.includes(role);
  },

  isAuthenticated: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log('Token present for authentication check:', !!token);
    return !!token;
  },

  initializeAuth: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Auth initialized with token:', token);
    } else {
      console.log('No token found during initialization');
    }
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      console.log('No token found in storage');
      return null;
    }

    try {
      const userData = localStorage.getItem(USER_DATA_KEY);
      console.log('Raw user data from storage:', userData);

      if (userData) {
        const user = JSON.parse(userData);
        console.log('Parsed user data:', user);

        if (!user.id || !user.email || !user.name || !user.roles) {
          console.error('Invalid user data in storage:', user);
          authService.logout();
          return null;
        }

        return user;
      }

      console.log('No user data found in storage');
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      authService.logout();
      return null;
    }
  }
};
