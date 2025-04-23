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