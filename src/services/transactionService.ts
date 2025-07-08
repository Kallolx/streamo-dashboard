import api from './api';

// Transaction interface
export interface Transaction {
  id: string;
  _id?: string; // MongoDB's ObjectId as string
  transactionId?: string; // Add the transactionId field as in MongoDB
  title: string;
  artist: string;
  isrc: string;
  upc: string;
  serviceType: string;
  territory: string;
  quantity: number;
  revenue: number;
  revenueUSD: number;
  transactionDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Analytics interfaces
export interface AnalyticsData {
  totalBalance: number;
  lastTransaction: {
    artist: string;
    title: string;
    service: string;
    territory: string;
    date: string;
    amount: number;
  };
  lastStatementPeriod: string;
  totalRevenue: number;
  totalStreams: number;
  performanceData: {
    month: string;
    revenue: number;
    streams: number;
  }[];
  countryData: {
    country: string;
    percentage: number;
  }[];
  platformData: {
    platform: string;
    percentage: number;
  }[];
  yearlyRevenueData: {
    year: string;
    revenue: number;
  }[];
  totalMusic: number;
  totalVideos: number;
  totalRoyalty: number;
}

// Response interfaces
export interface TransactionsResponse {
  success: boolean;
  data: Transaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface TransactionResponse {
  success: boolean;
  data: Transaction;
}

export interface TransactionSummary {
  totalRevenue: number;
  totalStreams: number;
  transactionCount: number;
}

export interface ServiceRevenue {
  service: string;
  revenue: number;
  streams: number;
}

export interface TerritoryRevenue {
  territory: string;
  revenue: number;
  streams: number;
}

export interface MonthlyRevenue {
  year: number;
  month: number;
  revenue: number;
  streams: number;
}

export interface TransactionSummaryResponse {
  success: boolean;
  summary: TransactionSummary;
  serviceRevenue: ServiceRevenue[];
  territoryRevenue: TerritoryRevenue[];
  monthlyRevenue: MonthlyRevenue[];
}

/**
 * Get transactions with pagination and optional filters
 * @param page The page number
 * @param limit The number of items per page
 * @param filters Optional filters (artist, title, serviceType, territory, startDate, endDate)
 * @returns A promise that resolves to a paginated list of transactions
 */
export const getTransactions = async (
  page = 1,
  limit = 20,
  filters?: {
    artist?: string;
    title?: string;
    serviceType?: string;
    territory?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<TransactionsResponse> => {
  try {
    let url = `/transactions?page=${page}&limit=${limit}`;
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          url += `&${key}=${encodeURIComponent(value)}`;
        }
      });
    }

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw error;
  }
};

/**
 * Get a transaction by ID
 * @param id The ID of the transaction
 * @returns A promise that resolves to the transaction
 */
export const getTransactionById = async (id: string): Promise<TransactionResponse> => {
  try {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error getting transaction:', error);
    throw error;
  }
};

/**
 * Create a new transaction
 */
export const createTransaction = async (transactionData: Partial<Transaction>): Promise<Transaction> => {
  try {
    const response = await api.post('/transactions', transactionData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

/**
 * Update an existing transaction
 */
export const updateTransaction = async (id: string, transactionData: Partial<Transaction>): Promise<Transaction> => {
  try {
    const response = await api.put(`/transactions/${id}`, transactionData);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating transaction with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a transaction by ID
 */
export const deleteTransaction = async (id: string): Promise<void> => {
  try {
    await api.delete(`/transactions/${id}`);
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

/**
 * Get a summary of transactions for analytics
 * @param filters Optional date filters
 * @returns A promise that resolves to the transaction summary
 */
export const getTransactionSummary = async (
  filters?: {
    startDate?: string;
    endDate?: string;
  }
): Promise<TransactionSummaryResponse> => {
  try {
    let url = `/transactions/summary`;
    
    if (filters) {
      const params = new URLSearchParams();
      
      if (filters.startDate) {
        params.append('startDate', filters.startDate);
      }
      
      if (filters.endDate) {
        params.append('endDate', filters.endDate);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error getting transaction summary:', error);
    throw error;
  }
};

/**
 * Process transaction data into analytics format
 * @param transactions Array of transactions
 * @returns Processed analytics data
 */
export const processTransactionsToAnalytics = (transactions: Transaction[]): AnalyticsData => {
  if (!transactions || transactions.length === 0) {
    return {
      totalBalance: 0,
      lastTransaction: {
        artist: 'N/A',
        title: 'N/A',
        service: 'N/A',
        territory: 'N/A',
        date: 'N/A',
        amount: 0
      },
      lastStatementPeriod: 'N/A',
      totalRevenue: 0,
      totalStreams: 0,
      performanceData: [],
      countryData: [],
      platformData: [],
      yearlyRevenueData: [],
      totalMusic: 0,
      totalVideos: 0,
      totalRoyalty: 0
    };
  }

  // Calculate basic totals
  const totalBalance = transactions.reduce((sum, tx) => {
    const revenue = tx.revenueUSD || tx.revenue || 0;
    return sum + (typeof revenue === 'number' ? revenue : parseFloat(String(revenue)) || 0);
  }, 0);

  const totalStreams = transactions.reduce((sum, tx) => {
    const quantity = tx.quantity || 0;
    return sum + (typeof quantity === 'number' ? quantity : parseInt(String(quantity)) || 0);
  }, 0);

  // Get the most recent transaction
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = new Date(a.transactionDate || a.createdAt || 0).getTime();
    const dateB = new Date(b.transactionDate || b.createdAt || 0).getTime();
    return dateB - dateA;
  });
  const latestTransaction = sortedTransactions[0];

  // Calculate last statement period
  let lastStatementPeriod = 'N/A';
  if (latestTransaction && latestTransaction.transactionDate) {
    try {
      const date = new Date(latestTransaction.transactionDate);
      if (!isNaN(date.getTime())) {
        lastStatementPeriod = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
    } catch (dateError) {
      console.error("Error parsing transaction date:", dateError);
    }
  }

  // Process performance data (monthly revenue and streams)
  const monthlyData: { [key: string]: { revenue: number; streams: number } } = {};
  
  transactions.forEach(tx => {
    try {
      const date = new Date(tx.transactionDate);
      if (!isNaN(date.getTime())) {
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, streams: 0 };
        }
        
        const revenue = tx.revenueUSD || tx.revenue || 0;
        const streams = tx.quantity || 0;
        
        monthlyData[monthKey].revenue += typeof revenue === 'number' ? revenue : parseFloat(String(revenue)) || 0;
        monthlyData[monthKey].streams += typeof streams === 'number' ? streams : parseInt(String(streams)) || 0;
      }
    } catch (error) {
      console.error('Error processing transaction date:', error);
    }
  });

  const performanceData = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, data]) => {
      const [year, month] = monthKey.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return {
        month: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        revenue: data.revenue,
        streams: data.streams
      };
    });

  // Process country data (territory percentages)
  const territoryData: { [key: string]: number } = {};
  transactions.forEach(tx => {
    const territory = tx.territory || 'Unknown';
    const streams = tx.quantity || 0;
    territoryData[territory] = (territoryData[territory] || 0) + (typeof streams === 'number' ? streams : parseInt(String(streams)) || 0);
  });

  const totalTerritoryStreams = Object.values(territoryData).reduce((sum, streams) => sum + streams, 0);
  const countryData = Object.entries(territoryData)
    .map(([country, streams]) => ({
      country,
      percentage: totalTerritoryStreams > 0 ? parseFloat(((streams / totalTerritoryStreams) * 100).toFixed(1)) : 0
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 6); // Top 6 countries

  // Process platform data (service type percentages)
  const platformData: { [key: string]: number } = {};
  transactions.forEach(tx => {
    const service = tx.serviceType || 'Unknown';
    const streams = tx.quantity || 0;
    platformData[service] = (platformData[service] || 0) + (typeof streams === 'number' ? streams : parseInt(String(streams)) || 0);
  });

  const totalPlatformStreams = Object.values(platformData).reduce((sum, streams) => sum + streams, 0);
  const platformDataArray = Object.entries(platformData)
    .map(([platform, streams]) => ({
      platform,
      percentage: totalPlatformStreams > 0 ? parseFloat(((streams / totalPlatformStreams) * 100).toFixed(1)) : 0
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 4); // Top 4 platforms

  // Ensure percentages add up to 100% by adjusting the largest one if needed
  if (platformDataArray.length > 0) {
    const totalPercentage = platformDataArray.reduce((sum, item) => sum + item.percentage, 0);
    if (totalPercentage < 100 && totalPercentage > 99) {
      const diff = 100 - totalPercentage;
      platformDataArray[0].percentage = parseFloat((platformDataArray[0].percentage + diff).toFixed(1));
    }
  }

  // Process yearly revenue data
  const yearlyData: { [key: string]: number } = {};
  transactions.forEach(tx => {
    try {
      const date = new Date(tx.transactionDate);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear().toString();
        const revenue = tx.revenueUSD || tx.revenue || 0;
        yearlyData[year] = (yearlyData[year] || 0) + (typeof revenue === 'number' ? revenue : parseFloat(String(revenue)) || 0);
      }
    } catch (error) {
      console.error('Error processing transaction date for yearly data:', error);
    }
  });

  const yearlyRevenueData = Object.entries(yearlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, revenue]) => ({
      year,
      revenue
    }));

  // Count unique tracks for totalMusic and totalVideos
  const uniqueTracks = new Set(transactions.map(tx => `${tx.artist}-${tx.title}`));
  const totalMusic = uniqueTracks.size;
  
  // For now, assume all are music tracks (we can refine this based on serviceType if needed)
  const totalVideos = transactions.filter(tx => 
    tx.serviceType && (
      tx.serviceType.toLowerCase().includes('youtube') || 
      tx.serviceType.toLowerCase().includes('video')
    )
  ).length;

  return {
    totalBalance,
    lastTransaction: {
      artist: latestTransaction?.artist || 'N/A',
      title: latestTransaction?.title || 'N/A',
      service: latestTransaction?.serviceType || 'N/A',
      territory: latestTransaction?.territory || 'N/A',
      date: latestTransaction?.transactionDate ? 
        (() => {
          try {
            return new Date(latestTransaction.transactionDate).toLocaleDateString();
          } catch {
            return 'N/A';
          }
        })() : 'N/A',
      amount: (() => {
        const amount = latestTransaction?.revenueUSD || latestTransaction?.revenue || 0;
        return typeof amount === 'number' ? amount : parseFloat(String(amount)) || 0;
      })()
    },
    lastStatementPeriod,
    totalRevenue: totalBalance,
    totalStreams,
    performanceData,
    countryData,
    platformData: platformDataArray,
    yearlyRevenueData,
    totalMusic,
    totalVideos,
    totalRoyalty: totalBalance // Assuming all revenue is royalty for now
  };
};