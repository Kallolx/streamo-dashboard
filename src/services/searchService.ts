import api from './api';

export interface SearchResult {
  id: string;
  title: string;
  type: 'track' | 'artist' | 'release' | 'label' | 'user';
  image?: string;
  subtitle?: string; // artist name for tracks, label for artists, email for users, etc.
  data?: any; // Original data object for additional context
}

export interface SearchResponse {
  results: SearchResult[];
  totalResults: number;
}

/**
 * Helper function to normalize MongoDB-style IDs
 */
const normalizeId = (obj: any) => {
  if (obj?._id?.$oid) {
    return obj._id.$oid;
  } else if (obj?._id) {
    return obj._id;
  } else if (obj?.id) {
    return obj.id;
  }
  return '';
};

/**
 * Helper function to handle MongoDB date formats
 */
const formatDate = (dateObj: any): string => {
  if (!dateObj) return '';
  
  try {
    if (dateObj.$date) {
      // If it's MongoDB format with $date and $numberLong
      if (dateObj.$date.$numberLong) {
        return new Date(parseInt(dateObj.$date.$numberLong)).toLocaleDateString();
      }
      // If it's MongoDB format with just $date
      return new Date(dateObj.$date).toLocaleDateString();
    }
    // If it's a regular date string or timestamp
    return new Date(dateObj).toLocaleDateString();
  } catch {
    return '';
  }
};

/**
 * Perform a global search across tracks, artists, releases, labels, and users
 */
export const globalSearch = async (query: string): Promise<SearchResponse> => {
  try {
    if (!query.trim()) {
      return { results: [], totalResults: 0 };
    }

    const searchResults: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();
    
    // 1. Search for users
    try {
      // Try to get all users since filtering might not be supported by the API
      const usersResponse = await api.get('/users');
      
      let users = [];
      
      // Handle different response formats
      if (usersResponse.data && Array.isArray(usersResponse.data)) {
        users = usersResponse.data; 
      } else if (usersResponse.data?.users && Array.isArray(usersResponse.data.users)) {
        users = usersResponse.data.users;
      } else if (usersResponse.data?.data && Array.isArray(usersResponse.data.data)) {
        users = usersResponse.data.data;
      } else if (usersResponse.data?.documents && Array.isArray(usersResponse.data.documents)) {
        users = usersResponse.data.documents;
      }
      
      // Client-side filtering since the API might not support search parameters
      const filteredUsers = users.filter((user: any) => {
        return (
          (user.name && user.name.toLowerCase().includes(lowerQuery)) ||
          (user.email && user.email.toLowerCase().includes(lowerQuery)) ||
          (user.role && user.role.toLowerCase().includes(lowerQuery)) ||
          (user.phone && user.phone?.includes(lowerQuery))
        );
      });
      
      // Map users to search results
      filteredUsers.forEach((user: any) => {
        searchResults.push({
          id: normalizeId(user),
          title: user.name || user.username || 'Unknown User',
          type: 'user',
          subtitle: user.email || '',
          image: user.profileImage || user.avatar || null,
          data: user
        });
      });
    } catch (userError) {
      console.error('Error searching users:', userError);
    }

    // 2. Search for tracks (if available)
    try {
      const tracksResponse = await api.get('/tracks');
      let tracks = [];
      
      if (tracksResponse.data && Array.isArray(tracksResponse.data)) {
        tracks = tracksResponse.data;
      } else if (tracksResponse.data?.tracks && Array.isArray(tracksResponse.data.tracks)) {
        tracks = tracksResponse.data.tracks;
      } else if (tracksResponse.data?.data && Array.isArray(tracksResponse.data.data)) {
        tracks = tracksResponse.data.data;
      }
      
      const filteredTracks = tracks.filter((track: any) => {
        return (
          (track.title && track.title.toLowerCase().includes(lowerQuery)) ||
          (track.artist && track.artist.toLowerCase().includes(lowerQuery)) ||
          (track.genre && track.genre.toLowerCase().includes(lowerQuery))
        );
      });
      
      filteredTracks.forEach((track: any) => {
        searchResults.push({
          id: normalizeId(track),
          title: track.title || 'Untitled Track',
          type: 'track',
          subtitle: track.artist || '',
          image: track.coverArt || track.thumbnail || null,
          data: track
        });
      });
    } catch (trackError) {
      console.error('Error searching tracks:', trackError);
    }
    
    // 3. Search for releases
    try {
      const releasesResponse = await api.get('/releases');
      let releases = [];
      
      if (releasesResponse.data && Array.isArray(releasesResponse.data)) {
        releases = releasesResponse.data;
      } else if (releasesResponse.data?.releases && Array.isArray(releasesResponse.data.releases)) {
        releases = releasesResponse.data.releases;
      } else if (releasesResponse.data?.data && Array.isArray(releasesResponse.data.data)) {
        releases = releasesResponse.data.data;
      }
      
      const filteredReleases = releases.filter((release: any) => {
        return (
          (release.title && release.title.toLowerCase().includes(lowerQuery)) ||
          (release.artist && release.artist.toLowerCase().includes(lowerQuery)) ||
          (release.genre && release.genre.toLowerCase().includes(lowerQuery)) ||
          (release.label && release.label.toLowerCase().includes(lowerQuery))
        );
      });
      
      filteredReleases.forEach((release: any) => {
        searchResults.push({
          id: normalizeId(release),
          title: release.title || 'Untitled Release',
          type: 'release',
          subtitle: release.artist || release.label || '',
          image: release.coverArt || release.artwork || release.image || null,
          data: release
        });
      });
    } catch (releaseError) {
      console.error('Error searching releases:', releaseError);
    }
    
    // 4. Search for artists (if needed/available)
    // Similar implementation for artists
    
    // 5. Search for labels (if needed/available)
    // Similar implementation for labels
    
    return {
      results: searchResults.slice(0, 20), // Limit results to 20 items
      totalResults: searchResults.length
    };
  } catch (error) {
    console.error('Error performing global search:', error);
    throw error;
  }
}; 