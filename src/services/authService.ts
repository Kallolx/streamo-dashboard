import api from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    profileImage?: string;
  };
}

// Check if code is running in browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Login a user with email and password
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await api.post('/auth/login', credentials);
    
    if (response.data.success && isBrowser) {
      // Save auth data to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.user.role);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Handle specific authentication errors
    if (error.response && error.response.status === 401) {
      // Create a custom error with the server's message
      const errorMessage = error.response.data?.message || 'Invalid credentials. Please try again.';
      const customError = new Error(errorMessage);
      customError.name = 'AuthenticationError';
      throw customError;
    }
    
    throw error;
  }
};

/**
 * Register a new user
 */
export const register = async (userData: any): Promise<any> => {
  try {
    // Send user data directly as JSON without file handling
    const response = await api.post('/auth/register', userData);
    
    // If registration is successful, store auth data
    if (response.data.success && isBrowser) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.user.role);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Logout the current user
 */
export const logout = (): void => {
  // Clear all auth data from localStorage
  if (isBrowser) {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
  }
};

/**
 * Check if the user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return isBrowser ? !!localStorage.getItem('token') : false;
};

/**
 * Get the current user's role
 */
export const getUserRole = (): string | null => {
  return isBrowser ? localStorage.getItem('userRole') : null;
};

/**
 * Get the current user's data
 */
export const getUserData = (): any => {
  if (!isBrowser) return null;
  
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

/**
 * Check if the user has a specific role
 */
export const hasRole = (roles: string[]): boolean => {
  const userRole = getUserRole();
  return !!userRole && roles.includes(userRole);
}; 