import api from './api';

// Release data interface
export interface Release {
  id?: string;
  title: string;
  artist: string;
  coverArt: string; // URL to stored image
  releaseType: string; // Single, Album, EP
  format: string; // Digital, CD, Vinyl, Cassette
  genre: string;
  language?: string;
  upc?: string;
  releaseDate?: string;
  
  // Contributors
  featuredArtist?: string;
  remixerArtist?: string; 
  composer?: string;
  lyricist?: string;
  musicProducer?: string;
  publisher?: string;
  singer?: string;
  musicDirector?: string;
  copyrightHeader?: string;
  
  // Selected stores
  stores: string[]; // Array of store IDs or names
  
  // Tracks
  tracks: Track[];
  
  // Status & metadata
  status?: 'draft' | 'submitted' | 'processing' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

// Track interface
export interface Track {
  id?: string;
  title: string;
  artistName: string;
  duration?: string;
  isrc?: string;
}

// Create release data form for submission
export interface CreateReleaseData {
  title: string;
  artist: string;
  coverArt?: File; // Make coverArt optional
  releaseType: string;
  format: string;
  genre: string;
  language?: string;
  upc?: string;
  releaseDate?: string;
  stores: string[];
  tracks: Omit<Track, 'id'>[];
  // Contributors
  featuredArtist?: string;
  remixerArtist?: string;
  composer?: string;
  lyricist?: string;
  musicProducer?: string;
  publisher?: string;
  singer?: string;
  musicDirector?: string;
  copyrightHeader?: string;
}

/**
 * Get all releases with optional filtering
 */
export const getAllReleases = async (filters = {}) => {
  try {
    const response = await api.get('/releases', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching releases:', error);
    throw error;
  }
};

/**
 * Get release by ID
 */
export const getReleaseById = async (releaseId: string) => {
  try {
    const response = await api.get(`/releases/${releaseId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching release with ID ${releaseId}:`, error);
    throw error;
  }
};

/**
 * Create a new release
 * Uses FormData to handle file uploads
 */
export const createRelease = async (releaseData: CreateReleaseData) => {
  try {
    // Create FormData object to handle the file upload
    const formData = new FormData();
    
    // Add coverArt file if provided
    if (releaseData.coverArt instanceof File) {
      formData.append('coverArt', releaseData.coverArt);
    }
    
    // Add all other fields as JSON string under 'data' key
    const releaseDataWithoutFile = { ...releaseData };
    // Safe deletion of coverArt property
    const { coverArt, ...dataWithoutCoverArt } = releaseDataWithoutFile;
    
    formData.append('data', JSON.stringify(dataWithoutCoverArt));
    
    const response = await api.post('/releases', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating release:', error);
    throw error;
  }
};

/**
 * Create a new release without file upload
 * Simplified version that skips the FormData and file handling
 */
export const createReleaseWithoutFile = async (releaseData: Omit<CreateReleaseData, 'coverArt'>) => {
  try {
    // Send the data directly as JSON
    const response = await api.post('/releases/json', releaseData);
    return response.data;
  } catch (error) {
    console.error('Error creating release:', error);
    throw error;
  }
};

/**
 * Update an existing release
 */
export const updateRelease = async (releaseId: string, releaseData: Partial<CreateReleaseData>) => {
  try {
    // Create FormData object to handle the file upload if needed
    const formData = new FormData();
    
    // Add coverArt file if provided
    if (releaseData.coverArt instanceof File) {
      formData.append('coverArt', releaseData.coverArt);
    }
    
    // Add all other fields as JSON string under 'data' key
    const { coverArt, ...dataWithoutCoverArt } = releaseData;
    
    formData.append('data', JSON.stringify(dataWithoutCoverArt));
    
    const response = await api.put(`/releases/${releaseId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error updating release with ID ${releaseId}:`, error);
    throw error;
  }
};

/**
 * Delete a release
 */
export const deleteRelease = async (releaseId: string) => {
  try {
    const response = await api.delete(`/releases/${releaseId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting release with ID ${releaseId}:`, error);
    throw error;
  }
};

/**
 * Update release status
 */
export const updateReleaseStatus = async (releaseId: string, status: string) => {
  try {
    const response = await api.patch(`/releases/${releaseId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating status for release with ID ${releaseId}:`, error);
    throw error;
  }
};

/**
 * Get mock/fallback release data for development
 */
export const getFallbackReleases = (limit: number = 5): Release[] => {
  const mockReleases: Release[] = [
    {
      id: '1',
      title: 'Midnight Drive',
      artist: 'Neon Pulse',
      coverArt: '/images/music/1.png',
      releaseType: 'Single',
      format: 'Digital',
      genre: 'Electronic',
      stores: ['spotify', 'apple', 'youtube'],
      tracks: [
        {
          id: 'TRK00123',
          title: 'Midnight Drive',
          artistName: 'Neon Pulse',
          duration: '3:41',
          isrc: 'US-XYZ-23-00001'
        }
      ],
      status: 'approved',
      createdAt: '2023-05-15T14:30:00Z',
      updatedAt: '2023-05-15T14:30:00Z'
    },
    {
      id: '2',
      title: 'Urban Echoes',
      artist: 'Cyber Waves',
      coverArt: '/images/music/2.png',
      releaseType: 'EP',
      format: 'Digital',
      genre: 'Electronic',
      stores: ['spotify', 'apple', 'youtube', 'soundcloud'],
      tracks: [
        {
          id: 'TRK00124',
          title: 'Urban Echoes',
          artistName: 'Cyber Waves',
          duration: '4:15',
          isrc: 'US-XYZ-23-00002'
        },
        {
          id: 'TRK00125',
          title: 'Night City',
          artistName: 'Cyber Waves',
          duration: '3:58',
          isrc: 'US-XYZ-23-00003'
        }
      ],
      status: 'processing',
      createdAt: '2023-06-20T10:15:00Z',
      updatedAt: '2023-06-20T10:15:00Z'
    }
  ];
  
  return mockReleases.slice(0, limit);
}; 