import api from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  profileImage?: string;
  lastLogin?: Date;
  createdAt?: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: string;
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
 * Get a single user by ID (admin/superadmin only)
 */
export const getUserById = async (id: string): Promise<User> => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new user (superadmin only)
 */
export const createUser = async (userData: CreateUserData): Promise<User> => {
  try {
    // Use the register endpoint to create a new user
    const response = await api.post('/auth/register', userData);
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
    const response = await api.get('/users/whoami');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
}; 