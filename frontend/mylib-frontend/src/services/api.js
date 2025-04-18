import axios from 'axios';
import { authService } from './authService';
import { API_BASE_URL } from '../config';

const BASE_URL = API_BASE_URL;
console.log("Base URL:", BASE_URL); 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
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

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Skip token addition for public endpoints
    const skipTokenUrls = [
      '/api/users/login', 
      '/refresh-token',
      '/register',
      '/api/users/register'
    ];
    
    if (!skipTokenUrls.includes(config.url)) {
      const token = authService.getCurrentToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor with improved error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry for these endpoints
    if (originalRequest.url === '/api/users/login' || 
        originalRequest.url === '/refresh-token' ||
        originalRequest.url === '/register' ||
        originalRequest.url === '/api/users/register') {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await authService.refreshToken();
        const newToken = response.data.token;
        authService.saveToken(newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Enhanced error handling
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.message || error.response.data || error.message;
      error.displayMessage = errorMessage;
    } else if (error.request) {
      // Request made but no response
      error.displayMessage = 'No response from server. Please check your connection.';
    } else {
      // Error in request configuration
      error.displayMessage = 'Failed to send request. Please try again.';
    }

    return Promise.reject(error);
  }
);

export const addBook = async (formData) => {
  const multipartApi = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Accept': 'application/json'
    },
    withCredentials: true
  });
  
  const token = authService.getCurrentToken();
  if (token) {
    multipartApi.defaults.headers.Authorization = `Bearer ${token}`;
  }

  const response = await multipartApi.post('/admin/book/add', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

export default api;
