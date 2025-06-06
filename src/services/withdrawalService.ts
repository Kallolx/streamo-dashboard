import api from './api';

export interface WithdrawalRequest {
  amount: number;
  paymentMethod: 'Bank' | 'BKash' | 'Nagad';
  bankDetails?: {
    country?: string;
    routingNumber?: string;
    bankName: string;
    accountName: string;
    swiftCode: string;
    accountNumber: string;
    branch?: string;
  };
  mobileNumber?: string;
  savedBankInfo?: boolean;
}

export interface WithdrawalResponse {
  id: string;
  user: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  paymentMethod: 'Bank' | 'BKash' | 'Nagad';
  bankDetails?: {
    country?: string;
    routingNumber?: string;
    bankName: string;
    accountName: string;
    swiftCode: string;
    accountNumber: string;
    branch?: string;
  };
  mobileNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankInfo {
  country: string;
  routingNumber?: string;
  bankName: string;
  accountName: string;
  swiftCode: string;
  accountNumber: string;
  branch?: string;
}

/**
 * Create a new withdrawal request
 * @param withdrawalData - Withdrawal data to submit
 */
export const createWithdrawalRequest = async (withdrawalData: WithdrawalRequest): Promise<WithdrawalResponse> => {
  try {
    const response = await api.post('/withdrawals', withdrawalData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating withdrawal request:', error);
    throw error;
  }
};

/**
 * Get all withdrawal requests for the current user
 */
export const getUserWithdrawalRequests = async (): Promise<WithdrawalResponse[]> => {
  try {
    const response = await api.get('/withdrawals');
    return response.data.data;
  } catch (error) {
    console.error('Error getting user withdrawal requests:', error);
    throw error;
  }
};

/**
 * Get withdrawal request by ID
 * @param id - Withdrawal request ID
 */
export const getWithdrawalRequestById = async (id: string): Promise<WithdrawalResponse> => {
  try {
    const response = await api.get(`/withdrawals/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error getting withdrawal request with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get all withdrawal requests (admin only)
 */
export const getAllWithdrawalRequests = async (): Promise<WithdrawalResponse[]> => {
  try {
    const response = await api.get('/withdrawals/all');
    return response.data.data;
  } catch (error) {
    console.error('Error getting all withdrawal requests:', error);
    throw error;
  }
};

/**
 * Update withdrawal request status (admin only)
 * @param id - Withdrawal request ID
 * @param status - New status
 * @param notes - Optional notes
 */
export const updateWithdrawalRequestStatus = async (
  id: string, 
  status: 'pending' | 'approved' | 'rejected' | 'completed',
  notes?: string
): Promise<WithdrawalResponse> => {
  try {
    const response = await api.put(`/withdrawals/${id}`, { status, notes });
    return response.data.data;
  } catch (error) {
    console.error(`Error updating withdrawal request with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete withdrawal request (admin only)
 * @param id - Withdrawal request ID
 */
export const deleteWithdrawalRequest = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/withdrawals/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting withdrawal request with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Save user bank information
 * @param bankInfo - Bank information to save
 */
export const saveUserBankInfo = async (bankInfo: BankInfo): Promise<BankInfo> => {
  try {
    const response = await api.post('/bank-info', bankInfo);
    return response.data.data;
  } catch (error) {
    console.error('Error saving user bank info:', error);
    throw error;
  }
};

/**
 * Get user's saved bank information
 */
export const getUserBankInfo = async (): Promise<BankInfo | null> => {
  try {
    const response = await api.get('/bank-info');
    return response.data.data;
  } catch (error) {
    // If no bank info is found, return null instead of throwing an error
    if (error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 
        'status' in error.response && error.response.status === 404) {
      return null;
    }
    console.error('Error getting user bank info:', error);
    throw error;
  }
};