import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.nrgsolarbd.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000, // 15s Request Timeout to handle cPanel cold-starts safely
});

// Request Interceptor (Inject Auth Cookie safely during client execution)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = Cookies.get('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor (Global Error & Session Management)
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // 1. Handle Unauthenticated (401) Session Expiry
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        Cookies.remove('auth_token');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    // 2. Extract and Normalize Error Message safely
    let message = 'An unexpected error occurred.';

    if (error.response?.data) {
      const responseData = error.response.data as { message?: string; error?: string };
      message = responseData.message || responseData.error || message;
    } else if (error.code === 'ECONNABORTED') {
      message = 'Request timeout. Server took too long to respond.';
    } else if (error.message === 'Network Error' || !error.response) {
      message = 'Network error or backend server is currently unreachable.';
    } else {
      message = error.message;
    }

    // 3. Return a clean standard Error object (prevents raw symbol leaking in server logs)
    const normalizedError = new Error(message);
    
    // Attach safe non-enumerable or clean custom properties if needed
    Object.assign(normalizedError, {
      status: error.response?.status,
      code: error.code,
    });

    return Promise.reject(normalizedError);
  }
);