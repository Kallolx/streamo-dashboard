import api from './api';

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  split?: number;
  isApproved: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Add new fields to match the detailed user data
  password?: string;
  birthDate?: string;
  gender?: string;
  introduction?: string;
  country?: string;
  city?: string;
  phone?: string;
  address?: string;
  currentDistributor?: string;
  distributorNumber?: string;
  youtubeLink?: string;
  facebookLink?: string;
  tiktokLink?: string;
  instagramLink?: string;
  documentType?: string;
  documentId?: string;
  profileImage?: string;
  lastLogin?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: string;
  split?: number;
  isAdminCreated?: boolean;
  plainPassword?: string;
}

/**
 * Get all users (admin/superadmin only)
 */
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get('/users');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Get user by ID with all details
 */
export const getUserById = async (userId: string): Promise<User> => {
  try {
    const response = await api.get(`/users/${userId}`);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch user details');
    }
  } catch (error: any) {
    console.error('Error fetching user details:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch user details');
  }
};

/**
 * Create a new user (superadmin only)
 */
export const createUser = async (userData: CreateUserData): Promise<User> => {
  try {
    // Set flag to indicate this user is being created by an admin
    const dataWithFlag = {
      ...userData,
      isAdminCreated: true,
      // Include the plainPassword for the welcome email
      plainPassword: userData.password
    };
    
    // Use the register endpoint to create a new user
    const response = await api.post('/auth/register', dataWithFlag);
    return response.data.user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Update a user (admin/superadmin only)
 */
export const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {
  try {
    const response = await api.put(`/users/${id}`, userData);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    throw error;
  }
};

/**
 * Update current user's profile
 */
export const updateCurrentUser = async (userData: Partial<User>): Promise<User> => {
  try {
    const response = await api.put('/users/profile', userData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

/**
 * Change current user's password
 */
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const changePassword = async (passwordData: ChangePasswordData): Promise<void> => {
  try {
    await api.post('/users/change-password', passwordData);
  } catch (error: any) {
    // Special handling for incorrect password (401) to prevent logout
    if (error.response && error.response.status === 401) {
      // Throw a custom error that won't trigger the axios interceptor logout
      throw new Error('Current password is incorrect');
    }
    console.error('Error changing password:', error);
    throw error;
  }
};

/**
 * Delete a user (superadmin only)
 */
export const deleteUser = async (id: string): Promise<void> => {
  try {
    await api.delete(`/users/${id}`);
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    throw error;
  }
};

/**
 * Get current user info
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    console.log('Calling /users/whoami API endpoint');
    const response = await api.get('/users/whoami');
    console.log('API response from whoami:', response.data);
    
    if (!response.data.success) {
      throw new Error('Failed to fetch user data: ' + response.data.message);
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

/**
 * Approve a pending user
 */
export const approveUser = async (id: string): Promise<User> => {
  try {
    const response = await api.put(`/users/${id}/approve`);
    return response.data.data;
  } catch (error) {
    console.error(`Error approving user ${id}:`, error);
    throw error;
  }
};

/**
 * Reject a pending user
 */
export const rejectUser = async (id: string): Promise<void> => {
  try {
    await api.delete(`/users/${id}/reject`);
  } catch (error) {
    console.error(`Error rejecting user ${id}:`, error);
    throw error;
  }
}; 