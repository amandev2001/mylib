import api from './api';

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
    // Get the current authentication token
    const token = localStorage.getItem('token');
    
    // Create a new axios instance without default Content-Type header
    const multipartApi = api.create({
      headers: {
        'Accept': 'application/json'
      }
    });

    // Add the authentication token to the request
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
    // Get the current authentication token
    const token = localStorage.getItem('token');
    
    // Create a new axios instance without default Content-Type header
    const multipartApi = api.create({
      headers: {
        'Accept': 'application/json'
      }
    });
    
    // Add the authentication token to the request
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

  deleteBook: async (id) => {
    const response = await api.delete(`/admin/book/${id}`);
    return response.data;
  },

  searchBooks: async (query) => {
    const response = await api.get(`${BOOKS_URL}/search`, { params: { query } });
    return response.data;
  }
}; 