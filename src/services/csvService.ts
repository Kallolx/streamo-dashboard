import api from './api';

// Define interfaces
export interface CsvUpload {
  id: string;
  fileName: string;
  status: string;
  processedRows: number;
  totalRows: number;
  progress: number;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
  uploadedBy?: {
    id: string;
    username: string;
    email: string;
  };
}

export interface CsvUploadResponse {
  success: boolean;
  message: string;
  upload: CsvUpload;
}

export interface CsvUploadsResponse {
  success: boolean;
  uploads: CsvUpload[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Upload a CSV file
 * @param file The CSV file to upload
 * @returns A promise that resolves to the upload response
 */
export const uploadCsv = async (file: File): Promise<CsvUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/csv/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading CSV:', error);
    throw error;
  }
};

/**
 * Get the status of a CSV upload
 * @param id The ID of the CSV upload
 * @returns A promise that resolves to the CSV upload status
 */
export const getCsvStatus = async (id: string): Promise<CsvUploadResponse> => {
  try {
    const response = await api.get(`/csv/${id}/status`);
    return response.data;
  } catch (error) {
    console.error('Error getting CSV status:', error);
    throw error;
  }
};

/**
 * Get a list of all CSV uploads with pagination
 * @param page The page number
 * @param limit The number of items per page
 * @param status Optional status filter
 * @returns A promise that resolves to a paginated list of CSV uploads
 */
export const getCsvUploads = async (
  page = 1,
  limit = 10,
  status?: string
): Promise<CsvUploadsResponse> => {
  try {
    let url = `/csv?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error getting CSV uploads:', error);
    throw error;
  }
};

/**
 * Delete a CSV upload
 * @param id The ID of the CSV upload to delete
 * @returns A promise that resolves to the delete response
 */
export const deleteCsvUpload = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/csv/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting CSV upload:', error);
    throw error;
  }
}; 