import api from './api';

export interface DashboardStats {
  totalEarnings: string;
  lastStatement: string;
  releases?: number;
  streams?: number;
  revenue?: number;
}

export interface Release {
  id: number;
  title: string;
  imagePath: string;
  type: string;
}

/**
 * Get dashboard statistics for the current user
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // This is where we'd make a real API call to get dashboard data
    const response = await api.get('/analytics/dashboard');
    
    // Ensure all values have proper defaults if null or undefined
    const data = response.data || {};
    return {
      totalEarnings: data.totalEarnings || '$0',
      lastStatement: data.lastStatement || '$0',
      releases: data.releases || 0,
      streams: data.streams || 0,
      revenue: data.revenue || 0
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    
    // Return default values on error
    return {
      totalEarnings: '$0',
      lastStatement: '$0',
      releases: 0,
      streams: 0,
      revenue: 0
    };
  }
};

/**
 * Get latest releases for the dashboard
 */
export const getLatestReleases = async (limit: number = 5): Promise<Release[]> => {
  try {
    // This is where we'd make a real API call to get latest releases
    const response = await api.get(`/releases/latest?limit=${limit}`);
    
    // Ensure we have an array from the response
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && typeof response.data === 'object') {
      // If it's an object but not an array, check if there's a "data" property that might be an array
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
    }
    
    // If we can't extract an array from the response, return the fallback data
    console.warn('API response does not contain a valid releases array, using fallback data');
    return getFallbackReleases(limit);
  } catch (error) {
    console.error('Error fetching latest releases:', error);
    return getFallbackReleases(limit);
  }
};

/**
 * Get fallback mock release data
 */
const getFallbackReleases = (limit: number): Release[] => {
  const mockReleases = [
    { id: 1, title: 'Pain By Ryan Jones', imagePath: '/images/music/1.png', type: 'Single' },
    { id: 2, title: 'Pain By Ryan Jones', imagePath: '/images/music/2.png', type: 'Single' },
    { id: 3, title: 'Pain By Ryan Jones', imagePath: '/images/music/3.png', type: 'Single' },
    { id: 4, title: 'Pain By Ryan Jones', imagePath: '/images/music/4.png', type: 'Single' },
    { id: 5, title: 'Pain By Ryan Jones', imagePath: '/images/music/5.png', type: 'Single' },
  ];
  
  return mockReleases.slice(0, limit);
}; 