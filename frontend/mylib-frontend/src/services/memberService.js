import api from './api';
import axios from 'axios';
import Cookies from 'js-cookie'; //  Import Cookies

const USERS_URL = '/api/users/all';

const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const memberService = {
  getAllMembers: async () => {
    const response = await api.get(USERS_URL);
    return response.data;
  },

  getMemberById: async (id) => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  createMember: async (memberData) => {
    const response = await api.post('/register', memberData);
    return response.data;
  },

  updateMember: async (id, memberData) => {
    try {
      const response = await api.put(`/api/users/${id}`, memberData);
      return response.data;
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  },

  deleteMember: async (id) => {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  },

  searchMembers: async (query) => {
    const response = await api.get(`/api/users/search`, { params: { query } });
    return response.data;
  },

  getMemberLoans: async (id) => {
    const response = await api.get(`/borrow/history/${id}`);
    return response.data;
  },

  uploadProfileImage: async (userId, formData) => {
    try {
      const response = await api.post(`/api/users/${userId}/profile-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.token) {
        Cookies.set('token', response.data.token, { expires: 7 });
        setAuthToken(response.data.token);
      }

      return response.data;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  },

  getCurrentMember: async () => {
    const response = await api.get('/api/users/current');
    return response.data;
  },

  setAuthToken,
};
