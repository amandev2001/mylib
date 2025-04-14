import api from './api';
import { authService } from './authService';

const BOOKS_URL = '/book';

export const bookService = {
  getAllBooks: async () => {
    const response = await api.get(`${BOOKS_URL}/all-books`);
    return response.data;
  },

  getBookById: async (id) => {
    const response = await api.get(`${BOOKS_URL}/${id}`);
    return response.data;
  },

  createBook: async (bookData) => {
    const token = authService.getCurrentToken();

    const multipartApi = api.create({
      headers: {
        'Accept': 'application/json'
      }
    });

    if (token) {
      multipartApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    const response = await multipartApi.post(`/admin/book/add`, bookData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    return response.data;
  },

  updateBook: async (id, bookData) => {
    const token = authService.getCurrentToken();

    const multipartApi = api.create({
      headers: {
        'Accept': 'application/json'
      }
    });

    if (token) {
      multipartApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    const response = await multipartApi.put(`/admin/book/update/${id}`, bookData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    return response.data;
  },

  deleteBook: async (bookId) => {
    const response = await api.delete(`/admin/book/delete/${bookId}`);
    return response.data;
  },

  searchBooks: async (query) => {
    const response = await api.get(`${BOOKS_URL}/search`, { params: { query } });
    return response.data;
  }
};
