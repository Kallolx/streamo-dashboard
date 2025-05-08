import api from './api';

// Interface for track data
export interface Track {
  _id?: string;
  title: string;
  artist: string;
  coverArt?: string;
  videoFile?: string;
  releaseType?: string;
  format?: string;
  genre?: string;
  language?: string;
  label?: string;
  recordingYear?: string;
  releaseDate?: string;
  isrc?: string;
  upc?: string;
  type?: string;
  version?: string;
  contentRating?: string;
  lyrics?: string;
  featuredArtist?: string;
  composer?: string;
  lyricist?: string;
  musicProducer?: string;
  publisher?: string;
  singer?: string;
  musicDirector?: string;
  copyrightHeader?: string;
  stores?: string[];
  pricing?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Get all videos with optional filtering
 */
export const getAllTracks = async (filters = {}) => {
  try {
    const response = await api.get('/tracks', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};

/**
 * Get video by ID
 */
export const getTrackById = async (trackId: string) => {
  try {
    const response = await api.get(`/tracks/${trackId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching video with ID ${trackId}:`, error);
    throw error;
  }
};

/**
 * Create a new video
 * Uses FormData to handle file uploads
 */
export const createTrack = async (trackData: FormData) => {
  try {
    console.log('Track service: Creating track...');
    
    // Debug: Log FormData entries
    console.log('Track service: FormData contents:');
    for (const pair of trackData.entries()) {
      console.log(`${pair[0]}: ${typeof pair[1] === 'string' ? pair[1] : 'File'}`);
    }
    
    const response = await api.post('/tracks', trackData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('Track service: Track created successfully', response.data);
    return response.data;
  } catch (error) {
    console.error('Track service: Error creating video:', error);
    throw error;
  }
};

/**
 * Update an existing video
 * Uses FormData to handle file uploads
 */
export const updateTrack = async (trackId: string, trackData: FormData) => {
  try {
    const response = await api.put(`/tracks/${trackId}`, trackData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating video with ID ${trackId}:`, error);
    throw error;
  }
};

/**
 * Delete a video
 */
export const deleteTrack = async (trackId: string) => {
  try {
    const response = await api.delete(`/tracks/${trackId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting video with ID ${trackId}:`, error);
    throw error;
  }
};

/**
 * Update video status
 */
export const updateTrackStatus = async (trackId: string, status: string) => {
  try {
    const response = await api.patch(`/tracks/${trackId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating status for video with ID ${trackId}:`, error);
    throw error;
  }
}; 