import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hotelpro_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto logout if verifying token or on login/register endpoints
      const url = error.config.url;
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('hotelpro_token');
        localStorage.removeItem('hotelpro_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
