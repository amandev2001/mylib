import api from './api';

const BORROW_URL = '/borrow';

export const loanService = {
  getAllLoans: async () => {
    const response = await api.get(`${BORROW_URL}/admin/all`);
    return response.data;
  },

  getAllActiveBorrows: async () => {
    const response = await api.get(`${BORROW_URL}/admin/active`);
    return response.data;
  },

  getLoanById: async (id) => {
    const response = await api.get(`${BORROW_URL}/${id}`);
    return response.data;
  },

  createLoan: async (userId, bookId) => {
    console.log('Creating loan with userId:', userId, 'bookId:', bookId);
    const response = await api.post(`${BORROW_URL}/request/${userId}/${bookId}`);
    console.log('Loan creation response:', response.data);
    return response.data;
  },

  requestReturn: async (borrowRecordId) => {
    console.log('Requesting return for borrow record:', borrowRecordId);
    const response = await api.put(`${BORROW_URL}/return/request/${borrowRecordId}`);
    console.log('Return request response:', response.data);
    return response.data;
  },

  approveLoan: async (id) => {
    const response = await api.put(`${BORROW_URL}/admin/approve/${id}`);
    return response.data;
  },

  approveReturn: async (id) => {
    const response = await api.put(`${BORROW_URL}/admin/return/approve/${id}`);
    return response.data;
  },

  getUserLoans: async (userId) => {
    const response = await api.get(`${BORROW_URL}/history/${userId}`);
    return response.data;
  },

  getBookBorrowHistory: async (bookId) => {
    console.log('Fetching borrow history for book:', bookId);
    const response = await api.get(`${BORROW_URL}/book/${bookId}/history`);
    console.log('Book borrow history response:', response.data);
    return response.data;
  },

  getActiveBorrows: async (userId) => {
    console.log('Fetching active borrows for user:', userId);
    const response = await api.get(`${BORROW_URL}/active/${userId}`);
    console.log('Active borrows response:', response.data);
    return response.data;
  },

  getOverdueLoans: async () => {
    const response = await api.get(`${BORROW_URL}/overdue`);
    return response.data;
  },

  searchLoans: async (query) => {
    const response = await api.get(`${BORROW_URL}/search`, { params: { query } });
    return response.data;
  },

  cancelBorrowRequest: async (id) => {
    const response = await api.put(`${BORROW_URL}/cancel/request/${id}`);
    return response.data;
  },

  cancelReturnRequest: async (id) => {
    const response = await api.put(`${BORROW_URL}/cancel/return/${id}`);
    return response.data;
  },

  updateBorrowRecord: async (id, data) => {
    const response = await api.put(`${BORROW_URL}/admin/update/${id}`, data);
    return response.data;
  }
}; 