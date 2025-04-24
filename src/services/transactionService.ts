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