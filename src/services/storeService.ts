import api from './api';

// Interface for store data
export interface Store {
  _id?: string;
  name: string;
  icon: string;
  status: "Active" | "Inactive";
  category: string;
  videosOnly: boolean;
  color: string;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Utility function to validate if a string is a valid MongoDB ObjectId
 */
export const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Get all stores with optional filtering
 */
export const getAllStores = async (filters = {}) => {
  try {
    const response = await api.get('/stores', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching stores:', error);
    throw error;
  }
};

/**
 * Get store by ID
 */
export const getStoreById = async (storeId: string) => {
  try {
    // Validate store ID format before making API call
    if (!isValidObjectId(storeId)) {
      throw new Error(`Invalid store ID format: ${storeId}`);
    }
    
    const response = await api.get(`/stores/${storeId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching store with ID ${storeId}:`, error);
    throw error;
  }
};

/**
 * Create a new store with JSON data
 */
export const createStore = async (storeData: {
  name: string;
  category: string;
  status: string;
  url: string;
  color: string;
  videosOnly: boolean;
}) => {
  try {
    const response = await api.post('/stores', storeData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating store:', error);
    throw error;
  }
};

/**
 * Update an existing store
 * Uses FormData to handle file uploads
 */
export const updateStore = async (storeId: string, storeData: FormData) => {
  try {
    // Validate store ID format before making API call
    if (!isValidObjectId(storeId)) {
      throw new Error(`Invalid store ID format: ${storeId}`);
    }
    
    const response = await api.put(`/stores/${storeId}`, storeData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating store with ID ${storeId}:`, error);
    throw error;
  }
};

/**
 * Delete a store
 */
export const deleteStore = async (storeId: string) => {
  try {
    // Validate store ID format before making API call
    if (!isValidObjectId(storeId)) {
      throw new Error(`Invalid store ID format: ${storeId}`);
    }
    
    const response = await api.delete(`/stores/${storeId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting store with ID ${storeId}:`, error);
    throw error;
  }
};

/**
 * Toggle store status (Active/Inactive)
 */
export const toggleStoreStatus = async (storeId: string) => {
  try {
    // Validate store ID format before making API call
    if (!isValidObjectId(storeId)) {
      throw new Error(`Invalid store ID format: ${storeId}`);
    }
    
    const response = await api.patch(`/stores/${storeId}/toggle-status`);
    return response.data;
  } catch (error) {
    console.error(`Error toggling status for store with ID ${storeId}:`, error);
    throw error;
  }
}; 