import axios from 'axios';

// Determine the base URL based on environment
export const getBaseUrl = () => {
  // For production environment (Vercel)
  if (process.env.NODE_ENV === 'production') {
    return 'https://streamo-backend.onrender.com/api';
  }
  
  // For local development environment
  return 'http://localhost:5000/api';
};

// Create an axios instance with default config
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists and it's not a test token, add it to the headers
    if (token && token !== 'test-token-for-development') {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (token === 'test-token-for-development') {
      console.log('API - Using test token (no real API calls will be made)');
      // This is a test token, we'll handle it differently in each component
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      // Skip the automatic logout logic for certain endpoints
      const isPasswordChangeEndpoint = error.config && 
        error.config.url && 
        error.config.url.includes('/users/change-password');
        
      const isAuthEndpoint = error.config && 
        error.config.url && 
        (error.config.url.includes('/auth/login') || 
         error.config.url.includes('/auth/register') ||
         error.config.url.includes('/auth/forget-password'));
      
      // Check if we're already on a login page
      const isOnLoginPage = typeof window !== 'undefined' && 
        (window.location.pathname.includes('/auth/login') ||
         window.location.pathname.includes('/auth/signup') ||
         window.location.pathname.includes('/auth/forget-password'));
      
      // Only proceed with logout if not on an auth endpoint and not already on login page
      if (!isPasswordChangeEndpoint && !isAuthEndpoint && !isOnLoginPage) {
        // Clear localStorage and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userData');
        
        // Redirect to login page if we're in a browser environment
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 