import api from './api';

const USERS_URL = '/api/users/';

export const userService = {

  getUserById: async (id) => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/api/users/${id}`, userData);
    
    // Check if the response contains a new token
    const newToken = response.headers["authorization"];
    if (newToken) {
        localStorage.setItem("token", newToken.split(" ")[1]); // Update token
    }

    return response.data;
},

  deleteUser: async (id) => {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  },

  searchUsers: async (query) => {
    const response = await api.get(`/api/users/search`, { params: { query } });
    return response.data;
  },

  getUserLoans: async (id) => {
    const response = await api.get(`/borrow/history/${id}`);
    return response.data;
  },

  uploadProfileImage: async (userId, formData) => {
    const response = await api.post(`/api/users/${userId}/profile-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};
