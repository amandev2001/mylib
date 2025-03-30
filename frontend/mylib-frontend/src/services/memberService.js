import api from './api';

const USERS_URL = '/api/users/all';

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
    const response = await api.put(`/api/users/${id}`, memberData);
    return response.data;
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
    const response = await api.post(`/api/users/${userId}/profile-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getCurrentMember: async () => {
    
    const response = await api.get('/api/users/current');
    return response.data;
  }
};