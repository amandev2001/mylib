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

//  Request Interceptor
api.interceptors.request.use(
  (config) => {
    const skipUrls = ['/register', '/api/users/register', '/api/users/login', '/refresh-token'];
    if (skipUrls.includes(config.url)) {
      return config;
    }

    const token = authService.getCurrentToken(); // 🟢 Centralized token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

//  Response Interceptor (Handles 401 + Token Refresh)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest.url === '/api/users/login' || originalRequest.url === '/refresh-token') {
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

        //  Update token via authService
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

    return Promise.reject(error);
  }
);

//  Handle 404 Errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 404) {
      console.error('Resource not found:', error.config.url);
    }
    return Promise.reject(error);
  }
);

//  Add New Book (Multipart)
export const addBook = async (formData) => {
  const multipartApi = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Accept': 'application/json'
    }
  });

  const token = authService.getCurrentToken(); //  Use central method
  if (token) {
    multipartApi.defaults.headers.Authorization = `Bearer ${token}`;
  }

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
