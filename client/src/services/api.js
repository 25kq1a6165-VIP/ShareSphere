import axios from 'axios';
import { handleMockRequest } from './mockApi';

// Determine if we are running on HTTPS where baseURL points to insecure localhost
const isHttpsWithInsecureBase =
  typeof window !== 'undefined' &&
  window.location.protocol === 'https:' &&
  (!import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL.startsWith('http://localhost'));

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  adapter: isHttpsWithInsecureBase
    ? async (config) => handleMockRequest(config)
    : undefined,
});

// Interceptor to attach Authorization header if token exists in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sharesphere_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global errors and fallback
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If network error (no response received, e.g. server down or CORS/mixed-content blocked)
    if (!error.response && error.config) {
      console.warn('[ShareSphere API] Backend unreachable, using resilient client store.');
      try {
        return await handleMockRequest(error.config);
      } catch (fallbackError) {
        return Promise.reject(fallbackError);
      }
    }

    if (error.response && error.response.status === 401) {
      // If unauthorized and not on login/register page, clear token
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('sharesphere_token');
        localStorage.removeItem('sharesphere_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
