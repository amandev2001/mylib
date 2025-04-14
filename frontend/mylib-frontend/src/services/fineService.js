import api from './api';

const FINE_URL = '/fine';
const BOOK_URL = '/book';
const USER_URL = '/user';

export const fineService = {
  getAllFines: async () => {
    try {
      const response = await api.get(`${FINE_URL}/admin/all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching fines:', error);
      throw error;
    }
  },
  
  markFineAsPaid: async (borrowRecordId) => {
    try {
      const response = await api.post(`${FINE_URL}/pay/${borrowRecordId}`);
      return response.data;
    } catch (error) {
      console.error('Error marking fine as paid:', error);
      throw error;
    }
  },
  
  getBookDetails: async (bookId) => {
    try {
      const response = await api.get(`${BOOK_URL}/${bookId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching book details for ID ${bookId}:`, error);
      return { title: `Book #${bookId}` };
    }
  },
  
  getUserDetails: async (userId) => {
    try {
      const response = await api.get(`${USER_URL}/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user details for ID ${userId}:`, error);
      return { name: `User #${userId}` };
    }
  }
};
