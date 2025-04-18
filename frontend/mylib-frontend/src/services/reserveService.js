import api from './api';
import { authService } from './authService';

const handleAuthError = (error) => {
  if (error.response?.status === 401) {
    authService.logout();
    window.location.href = '/login';
  }
  throw error;
};

const reserveService = {
  createReserve: async (userId, bookId) => {
    try {
      const response = await api.post(
        `/reservation/user/${userId}/${bookId}`
      );
      return response.data;
    } catch (error) {
      handleAuthError(error);
      if (error.response?.data) {
        const errorMessage = error.response.data;
        if (typeof errorMessage === 'string') {
          if (errorMessage.includes("already reserved this book")) {
            throw new Error("You have already reserved this book.");
          } else if (errorMessage.includes("Book is available")) {
            throw new Error("This book is available and doesn't need to be reserved. Try borrowing it instead.");
          } else if (errorMessage.includes("Book Not Found")) {
            throw new Error("The requested book was not found.");
          } else if (errorMessage.includes("User not found")) {
            throw new Error("User information not found. Please try logging in again.");
          }
          throw new Error(errorMessage);
        }
      }
      throw new Error(error.response?.data || error.message || 'Failed to create reservation');
    }
  },

  getReservesByUser: async (userId) => {
    try {
      const response = await api.get(`/reservation/user/${userId}`);
      return response.data;
    } catch (error) {
      handleAuthError(error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch user reservations');
    }
  },

  getAllReservations: async () => {
    try {
      const response = await api.get('/reservation/all');
      return response.data;
    } catch (error) {
      handleAuthError(error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch all reservations');
    }
  },

  cancelReserve: async (reserveId) => {
    try {
      const response = await api.put(`/reservation/user/${reserveId}`);
      return response.data;
    } catch (error) {
      handleAuthError(error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to cancel reservation');
    }
  }
};

export { reserveService };
