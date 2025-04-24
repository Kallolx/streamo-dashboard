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

/**
 * Login a user with email and password
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await api.post('/auth/login', credentials);
    
    if (response.data.success) {
      // Save auth data to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.user.role);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
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
    if (response.data.success) {
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
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userData');
};

/**
 * Check if the user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

/**
 * Get the current user's role
 */
export const getUserRole = (): string | null => {
  return localStorage.getItem('userRole');
};

/**
 * Get the current user's data
 */
export const getUserData = (): any => {
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