import api from './api';

export interface UserEarnings {
  userId: string;
  totalEarnings: number;
  lastPayout: number;
  pendingPayments: number;
  transactions: {
    _id: string;
    title: string;
    artist: string;
    isrc: string;
    serviceType: string;
    quantity: number;
    revenueUSD: number;
    transactionDate: string;
  }[];
}

/**
 * Get user earnings based on ISRC codes associated with their releases
 * 
 * This function fetches all transactions and matches them to the user's releases
 * based on the ISRC code to calculate the total earnings, pending payments,
 * and the last payout.
 */
export const getUserEarnings = async (): Promise<UserEarnings> => {
  try {
    // Fetch the user's earnings data
    const response = await api.get('/earnings/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching user earnings:', error);
    
    // Return default data in case of error
    return {
      userId: '',
      totalEarnings: 0,
      lastPayout: 0,
      pendingPayments: 0,
      transactions: []
    };
  }
};

/**
 * Get the total earnings amount for the current user formatted as a string
 */
export const getTotalEarnings = async (): Promise<string> => {
  try {
    const earnings = await getUserEarnings();
    return formatCurrency(earnings.totalEarnings);
  } catch (error) {
    console.error('Error getting total earnings:', error);
    return '$0';
  }
};

/**
 * Get the last payout amount for the current user formatted as a string
 */
export const getLastPayout = async (): Promise<string> => {
  try {
    const earnings = await getUserEarnings();
    return formatCurrency(earnings.lastPayout);
  } catch (error) {
    console.error('Error getting last payout:', error);
    return '$0';
  }
};

/**
 * Get the pending payments amount for the current user formatted as a string
 */
export const getPendingPayments = async (): Promise<string> => {
  try {
    const earnings = await getUserEarnings();
    return formatCurrency(earnings.pendingPayments);
  } catch (error) {
    console.error('Error getting pending payments:', error);
    return '$0';
  }
};

/**
 * Format a number as currency
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}; 