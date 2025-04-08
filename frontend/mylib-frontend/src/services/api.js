import axios from 'axios';
import { authService } from './authService';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = 'http://localhost:8080';
console.log("Base URL:", API_BASE_URL); 



const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add a request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Skip authentication for registration and login endpoints
    if (config.url === '/register' || config.url === '/api/users/register' || 
        config.url === '/api/users/login' || config.url === '/refresh-token') {
      return config;
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry if it's a login request or refresh token request that failed
    if (originalRequest.url === '/api/users/login' || originalRequest.url === '/refresh-token') {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await authService.refreshToken();
        const newToken = response.data.token;
        
        localStorage.setItem('token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        
        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        authService.logout();
        window.location.href = '/login'; // Redirect to login page
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 404) {
      console.error('Resource not found:', error.config.url);
      // You might want to show a user-friendly message here
    }
    return Promise.reject(error);
  }
);

// Add a new book
export const addBook = async (formData) => {
  // Create a new axios instance without default Content-Type header
  const multipartApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Accept': 'application/json'
    }
  });

  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    multipartApi.defaults.headers.Authorization = `Bearer ${token}`;
  }

  // Ensure the bookDTO is properly stringified and the file is properly set
  const bookData = formData.get('bookDTO');
  if (bookData instanceof Blob) {
    formData.set('bookDTO', new Blob([bookData], { type: 'application/json' }));
  }

  const response = await multipartApi.post('/admin/book/add', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export default api;