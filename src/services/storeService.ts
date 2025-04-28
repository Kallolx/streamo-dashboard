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
    const response = await api.get(`/stores/${storeId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching store with ID ${storeId}:`, error);
    throw error;
  }
};

/**
 * Create a new store
 * Uses FormData to handle file uploads
 */
export const createStore = async (storeData: FormData) => {
  try {
    const response = await api.post('/stores', storeData, {
      headers: {
        'Content-Type': 'multipart/form-data',
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
    const response = await api.patch(`/stores/${storeId}/toggle-status`);
    return response.data;
  } catch (error) {
    console.error(`Error toggling status for store with ID ${storeId}:`, error);
    throw error;
  }
}; 