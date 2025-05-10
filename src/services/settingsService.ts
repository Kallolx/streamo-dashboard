import axios from 'axios';
import api, { getBaseUrl } from './api';

interface Settings {
  logo: string;
  siteName: string;
  primaryColor: string;
}

/**
 * Get all system settings
 */
export const getSettings = async (): Promise<Settings> => {
  try {
    const response = await api.get('/settings');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching settings:', error);
    // Return default settings if API fails
    return {
      logo: '/images/logo.png',
      siteName: 'Music Dashboard',
      primaryColor: '#A365FF'
    };
  }
};

/**
 * Update system settings
 */
export const updateSettings = async (settings: Partial<Settings>): Promise<Settings> => {
  try {
    const response = await api.put('/settings', settings);
    return response.data.data;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

/**
 * Upload a new logo to S3
 */
export const uploadLogo = async (logoFile: File): Promise<Settings> => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('logo', logoFile);

    // Use the axios instance with authorization
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${getBaseUrl()}/settings/logo-s3`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data.data;
  } catch (error) {
    console.error('Error uploading logo to S3:', error);
    throw error;
  }
};