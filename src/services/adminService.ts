import api from './api';

/**
 * Interface for the result of updating transaction-user links
 */
export interface TransactionLinkResult {
  userId: string;
  name: string;
  email: string;
  role: string;
  isrcCount: number;
  transactionsUpdated: number;
}

/**
 * Interface for the response from the update transaction links endpoint
 */
export interface UpdateTransactionLinksResponse {
  success: boolean;
  message: string;
  results: TransactionLinkResult[];
}

/**
 * Update transaction-user links based on ISRC codes
 * This function calls the admin endpoint that scans all transactions and
 * updates them with user IDs based on matching ISRC codes from tracks and releases.
 * 
 * @returns A promise that resolves to the results of the update operation
 */
export const updateTransactionUserLinks = async (): Promise<UpdateTransactionLinksResponse> => {
  try {
    const response = await api.post('/admin/update-transaction-links');
    return response.data;
  } catch (error) {
    console.error('Error updating transaction-user links:', error);
    throw error;
  }
}; 