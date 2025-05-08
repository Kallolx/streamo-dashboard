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
  isPendingApproval?: boolean;
  message?: string;
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
    if (error.response) {
      // Handle pending approval case
      if (error.response.status === 403 && error.response.data?.isPendingApproval) {
        return {
          success: false,
          isPendingApproval: true,
          message: error.response.data.message,
          token: '',
          user: { id: '', name: '', email: '', role: '' }
        };
      }
      
      // Handle other auth errors
      if (error.response.status === 401) {
        // Create a custom error with the server's message
        const errorMessage = error.response.data?.message || 'Invalid credentials. Please try again.';
        const customError = new Error(errorMessage);
        customError.name = 'AuthenticationError';
        throw customError;
      }
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
 * Check if the current user has admin or superadmin role
 */
export const isAdmin = (): boolean => {
  const role = getUserRole();
  return role === 'admin' || role === 'superadmin';
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
 * Save admin credentials before impersonating a user
 */
export const saveAdminCredentials = (): void => {
  if (!isBrowser) return;
  
  const adminToken = localStorage.getItem('token');
  const adminRole = localStorage.getItem('userRole');
  const adminData = localStorage.getItem('userData');
  
  if (adminToken && adminRole && adminData) {
    localStorage.setItem('adminToken', adminToken);
    localStorage.setItem('adminRole', adminRole);
    localStorage.setItem('adminData', adminData);
  }
};

/**
 * Restore admin credentials after impersonation
 */
export const restoreAdminCredentials = (): boolean => {
  if (!isBrowser) return false;
  
  const adminToken = localStorage.getItem('adminToken');
  const adminRole = localStorage.getItem('adminRole');
  const adminData = localStorage.getItem('adminData');
  
  if (adminToken && adminRole && adminData) {
    localStorage.setItem('token', adminToken);
    localStorage.setItem('userRole', adminRole);
    localStorage.setItem('userData', adminData);
    
    // Clear the saved admin credentials
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminData');
    
    return true;
  }
  
  return false;
};

/**
 * Impersonate a user (admin-only feature)
 */
export const impersonateUser = async (userId: string): Promise<boolean> => {
  try {
    // Save current admin credentials to allow switching back
    saveAdminCredentials();
    
    // Get user data to impersonate
    const response = await api.post('/auth/impersonate', { userId });
    
    if (response.data.success) {
      // Update localStorage with impersonated user's data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.user.role);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      
      // Save a flag indicating we're in impersonation mode
      localStorage.setItem('isImpersonating', 'true');
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('User impersonation error:', error);
    throw error;
  }
};

/**
 * Check if the user has a specific role
 */
export const hasRole = (roles: string[]): boolean => {
  const userRole = getUserRole();
  return !!userRole && roles.includes(userRole);
}; 