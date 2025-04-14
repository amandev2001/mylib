import api from "./api";
import Cookies from "js-cookie";

const TOKEN_KEY = "token";
const USER_ROLES_KEY = "user_roles";
const USER_DATA_KEY = "user_data";

// Detect if running on localhost
const isLocalhost = window.location.hostname === "localhost";

// Cookie options
const cookieOptions = {
  expires: 7,
  secure: !isLocalhost, // secure: false on localhost, true otherwise
  sameSite: isLocalhost ? "Lax" : "None", // SameSite None for cross-site cookies
};

let cachedRoles = null;

export const authService = {
  login: async (credentials) => {
    try {
      console.group("LOGIN");
      const response = await api.post("/api/users/login", credentials);
      console.log(response.data);

      if (response.data) {
        const { token, roles, email, name, userId } = response.data;

        // Save in cookies
        Cookies.set(TOKEN_KEY, token, cookieOptions);
        Cookies.set(USER_ROLES_KEY, JSON.stringify(roles), cookieOptions);

        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        cachedRoles = roles;

        const user = { id: userId, email, name, roles };
        Cookies.set(USER_DATA_KEY, JSON.stringify(user), cookieOptions);

        console.groupEnd();
        return response.data;
      }

      throw new Error("No data received from login");
    } catch (error) {
      authService.logout();
      throw error;
    }
  },

  refreshAuthToken: async () => {
    try {
      const token = Cookies.get(TOKEN_KEY);
      if (!token) throw new Error("No token available for refresh");

      const response = await api.post("/api/users/refresh-token", null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.token) {
        Cookies.set(TOKEN_KEY, response.data.token, cookieOptions);
        api.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
        return response.data.token;
      }

      throw new Error("Invalid refresh token response");
    } catch (error) {
      authService.logout();
      throw error;
    }
  },

  logout: () => {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(USER_ROLES_KEY);
    Cookies.remove(USER_DATA_KEY);
    delete api.defaults.headers.common["Authorization"];
    cachedRoles = null;
  },

  getCurrentToken: () => {
    return Cookies.get(TOKEN_KEY);
  },

  getUserRoles: () => {
    if (cachedRoles) return cachedRoles;
    const roles = Cookies.get(USER_ROLES_KEY);
    try {
      const parsed = JSON.parse(roles);
      cachedRoles = Array.isArray(parsed) ? parsed : [];
      return cachedRoles;
    } catch {
      return [];
    }
  },

  hasRole: (role) => {
    return authService.getUserRoles().includes(role);
  },

  isAuthenticated: () => {
    return !!Cookies.get(TOKEN_KEY);
  },

  initializeAuth: () => {
    const token = Cookies.get(TOKEN_KEY);
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  },

  getCurrentUser: async () => {
    const token = Cookies.get(TOKEN_KEY);
    if (!token) return null;

    try {
      const userData = Cookies.get(USER_DATA_KEY);
      if (userData) {
        const user = JSON.parse(userData);
        if (!user.id || !user.email || !user.name || !user.roles) {
          authService.logout();
          return null;
        }
        return user;
      }
      return null;
    } catch {
      authService.logout();
      return null;
    }
  },

  resetPassword: async (email, newPassword) => {
    const response = await api.post("/api/users/admin/reset-password", {
      email,
      newPassword,
    });
    return response.data;
  },
};
