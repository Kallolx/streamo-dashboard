import api from './api';

export interface RoyaltyStatement {
  id: string;
  period: string;
  amount: string;
  status: 'pending' | 'paid';
  date: string;
  downloadUrl?: string;
}

export interface EarningsData {
  totalEarnings: string;
  lastStatement: string;
  pendingPayments: string;
  statementHistory: RoyaltyStatement[];
}

export interface StatementSummary {
  period: string;
  totalTracks: number;
  totalStreams: number;
  totalRevenue: number;
  platformBreakdown: {
    platform: string;
    streams: number;
    revenue: number;
    percentage: number;
  }[];
  territoryBreakdown: {
    territory: string;
    streams: number;
    revenue: number;
    percentage: number;
  }[];
  artists: {
    name: string;
    tracks: number;
    streams: number;
    revenue: number;
  }[];
}

export interface Transaction {
  _id: string;
  csvUploadId: string;
  rowNumber: number;
  transactionId: string;
  title: string;
  artist: string;
  isrc: string;
  upc: string;
  label: string;
  serviceType: string;
  territory: string;
  transactionType: string;
  quantity: number;
  revenue: number;
  currency: string;
  revenueUSD: number;
  transactionDate: string;
  notes: string;
  rawData: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CsvUpload {
  id: string;
  fileName: string;
  status: string;
  processedRows: number;
  totalRows: number;
  createdAt: string;
}

/**
 * Get total earnings and last statement data
 */
export const getEarningsData = async (): Promise<EarningsData> => {
  try {
    const response = await api.get('/royalties/summary');
    
    // Ensure all values are present or default to $0
    const data = response.data || {};
    return {
      totalEarnings: data.totalEarnings || '$0',
      lastStatement: data.lastStatement || '$0',
      pendingPayments: data.pendingPayments || '$0',
      statementHistory: Array.isArray(data.statementHistory) ? data.statementHistory : []
    };
  } catch (error) {
    console.error('Error fetching earnings data:', error);
    
    // Return default values on error
    return {
      totalEarnings: '$0',
      lastStatement: '$0',
      pendingPayments: '$0',
      statementHistory: []
    };
  }
};

/**
 * Get statement history
 */
export const getStatementHistory = async (): Promise<RoyaltyStatement[]> => {
  try {
    const response = await api.get('/royalties/statements');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching statement history:', error);
    return [];
  }
};

/**
 * Download a specific statement
 */
export const downloadStatement = async (statementId: string): Promise<Blob> => {
  try {
    const response = await api.get(`/royalties/statements/${statementId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading statement:', error);
    throw error;
  }
};

/**
 * Get CSV uploads
 */
export const getCsvUploads = async (): Promise<CsvUpload[]> => {
  try {
    const response = await api.get('/csv', { 
      params: { 
        status: 'completed',
        limit: 20,
        page: 1
      } 
    });
    
    if (response.data && response.data.uploads) {
      return response.data.uploads;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching CSV uploads:', error);
    return [];
  }
};

/**
 * Get transactions for a specific CSV upload
 */
export const getTransactionsForCsv = async (csvUploadId: string): Promise<Transaction[]> => {
  try {
    // Use large limit to get all transactions for the CSV
    const response = await api.get('/transactions', {
      params: {
        csvUploadId,
        limit: 5000,
        page: 1
      }
    });
    
    return response.data && response.data.data ? response.data.data : [];
  } catch (error) {
    console.error('Error fetching transactions for CSV:', error);
    return [];
  }
};

/**
 * Get transaction summary data
 */
export const getTransactionSummary = async (startDate?: string, endDate?: string): Promise<any> => {
  try {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await api.get('/transactions/summary', { params });
    return response.data && response.data.summary ? response.data : null;
  } catch (error) {
    console.error('Error fetching transaction summary:', error);
    return null;
  }
};

/**
 * Generate statement summary from transactions
 */
export const generateStatementSummaryFromTransactions = (transactions: Transaction[]): StatementSummary => {
  if (!transactions || transactions.length === 0) {
    return {
      period: 'Unknown',
      totalTracks: 0,
      totalStreams: 0,
      totalRevenue: 0,
      platformBreakdown: [],
      territoryBreakdown: [],
      artists: []
    };
  }
  
  // Extract period from the transactions
  const period = extractPeriodFromTransactions(transactions);
  
  // Track sets and maps for unique items and aggregations
  const trackSet = new Set<string>();
  const platformMap = new Map<string, { streams: number, revenue: number }>();
  const territoryMap = new Map<string, { streams: number, revenue: number }>();
  const artistMap = new Map<string, { tracks: Set<string>, streams: number, revenue: number }>();
  
  let totalStreams = 0;
  let totalRevenue = 0;
  
  // Process each transaction
  transactions.forEach(transaction => {
    const { title, artist, serviceType, territory, quantity, revenueUSD } = transaction;
    
    // Add track to set
    if (title) trackSet.add(title);
    
    // Update totals
    totalStreams += quantity || 0;
    totalRevenue += revenueUSD || 0;
    
    // Update platform data
    const platform = serviceType || 'Unknown';
    if (!platformMap.has(platform)) {
      platformMap.set(platform, { streams: 0, revenue: 0 });
    }
    const platformData = platformMap.get(platform)!;
    platformData.streams += quantity || 0;
    platformData.revenue += revenueUSD || 0;
    
    // Update territory data
    const territoryName = territory || 'Unknown';
    if (!territoryMap.has(territoryName)) {
      territoryMap.set(territoryName, { streams: 0, revenue: 0 });
    }
    const territoryData = territoryMap.get(territoryName)!;
    territoryData.streams += quantity || 0;
    territoryData.revenue += revenueUSD || 0;
    
    // Update artist data
    const artistName = artist || 'Unknown';
    if (!artistMap.has(artistName)) {
      artistMap.set(artistName, { tracks: new Set(), streams: 0, revenue: 0 });
    }
    const artistData = artistMap.get(artistName)!;
    if (title) artistData.tracks.add(title);
    artistData.streams += quantity || 0;
    artistData.revenue += revenueUSD || 0;
  });
  
  // Create platform breakdown
  const platformBreakdown = Array.from(platformMap.entries()).map(([platform, data]) => ({
    platform,
    streams: data.streams,
    revenue: data.revenue,
    percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0
  })).sort((a, b) => b.revenue - a.revenue);
  
  // Create territory breakdown
  const territoryBreakdown = Array.from(territoryMap.entries()).map(([territory, data]) => ({
    territory,
    streams: data.streams,
    revenue: data.revenue,
    percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0
  })).sort((a, b) => b.revenue - a.revenue);
  
  // Create artist breakdown
  const artists = Array.from(artistMap.entries()).map(([name, data]) => ({
    name,
    tracks: data.tracks.size,
    streams: data.streams,
    revenue: data.revenue
  })).sort((a, b) => b.revenue - a.revenue);
  
  // Create and return summary
  return {
    period,
    totalTracks: trackSet.size,
    totalStreams,
    totalRevenue,
    platformBreakdown,
    territoryBreakdown,
    artists
  };
};

/**
 * Extract period string from transactions
 */
const extractPeriodFromTransactions = (transactions: Transaction[]): string => {
  if (!transactions || transactions.length === 0) return 'Unknown';
  
  // Try to find transactions with rawData that has Statement Period
  const withStatementPeriod = transactions.find(t => 
    t.rawData && t.rawData['Statement Period']
  );
  
  if (withStatementPeriod && withStatementPeriod.rawData['Statement Period']) {
    return withStatementPeriod.rawData['Statement Period'];
  }

  // If not found, try to extract from transaction dates
  try {
    // Get the earliest and latest transaction dates
    const dates = transactions
      .map(t => new Date(t.transactionDate))
      .filter(d => !isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());
    
    if (dates.length > 0) {
      const earliestDate = dates[0];
      const latestDate = dates[dates.length - 1];
      
      // Format as "MMM YYYY" if in same month, or "MMM - MMM YYYY" if different months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      if (earliestDate.getMonth() === latestDate.getMonth() && 
          earliestDate.getFullYear() === latestDate.getFullYear()) {
        return `${months[earliestDate.getMonth()]} ${earliestDate.getFullYear()}`;
      } else {
        return `${months[earliestDate.getMonth()]} - ${months[latestDate.getMonth()]} ${latestDate.getFullYear()}`;
      }
    }
  } catch (error) {
    console.error('Error processing transaction dates:', error);
  }
  
  return 'Unknown Period';
};

/**
 * Generate a CSV file from statement summary
 */
export const generateStatementCSV = (summary: StatementSummary): Blob => {
  // Build CSV content
  let csvContent = '';
  
  // Add header
  csvContent += `Statement Summary for ${summary.period}\r\n\r\n`;
  
  // Add overall summary
  csvContent += 'Overall Summary\r\n';
  csvContent += `Total Tracks,${summary.totalTracks}\r\n`;
  csvContent += `Total Streams,${summary.totalStreams}\r\n`;
  csvContent += `Total Revenue,$${summary.totalRevenue.toFixed(2)}\r\n\r\n`;
  
  // Add platform breakdown
  csvContent += 'Platform Breakdown\r\n';
  csvContent += 'Platform,Streams,Revenue,Percentage\r\n';
  summary.platformBreakdown.forEach(platform => {
    csvContent += `${platform.platform},${platform.streams},$${platform.revenue.toFixed(2)},${platform.percentage.toFixed(2)}%\r\n`;
  });
  csvContent += '\r\n';
  
  // Add territory breakdown
  csvContent += 'Territory Breakdown\r\n';
  csvContent += 'Territory,Streams,Revenue,Percentage\r\n';
  summary.territoryBreakdown.forEach(territory => {
    csvContent += `${territory.territory},${territory.streams},$${territory.revenue.toFixed(2)},${territory.percentage.toFixed(2)}%\r\n`;
  });
  csvContent += '\r\n';
  
  // Add artist summary
  csvContent += 'Artist Summary\r\n';
  csvContent += 'Artist,Tracks,Streams,Revenue\r\n';
  summary.artists.forEach(artist => {
    csvContent += `${artist.name},${artist.tracks},${artist.streams},$${artist.revenue.toFixed(2)}\r\n`;
  });
  
  // Convert to blob
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  return blob;
}; 