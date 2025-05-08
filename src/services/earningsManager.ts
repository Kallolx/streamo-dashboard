import api from './api';
import { getUserData } from './authService';

// Singleton factory for managing earnings state across the app
class EarningsManager {
  private static instances: Map<string, EarningsManager> = new Map();
  private userId: string;
  private cachedEarnings: {
    totalEarnings: number;
    lastPayout: number;
    pendingPayments: number;
  } = {
    totalEarnings: 0,
    lastPayout: 0,
    pendingPayments: 0
  };

  private lastFetchTime: number = 0;
  private pendingWithdrawals: Map<string, number> = new Map(); // Maps withdrawal IDs to amounts
  private listeners: (() => void)[] = [];

  private constructor(userId: string) {
    this.userId = userId;
    console.log(`Creating EarningsManager for user: ${userId}`);
    
    // Initialize with data from localStorage if available
    const storageKey = `userEarnings_${userId}`;
    const storedEarnings = localStorage.getItem(storageKey);
    if (storedEarnings) {
      try {
        const parsed = JSON.parse(storedEarnings);
        this.cachedEarnings = {
          totalEarnings: parsed.totalEarnings || 0,
          lastPayout: parsed.lastPayout || 0,
          pendingPayments: parsed.pendingPayments || 0
        };
        console.log(`Loaded cached earnings from localStorage for user ${userId}:`, this.cachedEarnings);
      } catch (error) {
        console.error('Error parsing stored earnings:', error);
      }
    }

    // Initialize pending withdrawals from localStorage if available
    const withdrawalsKey = `pendingWithdrawals_${userId}`;
    const storedWithdrawals = localStorage.getItem(withdrawalsKey);
    if (storedWithdrawals) {
      try {
        const parsed = JSON.parse(storedWithdrawals);
        this.pendingWithdrawals = new Map(parsed);
        console.log(`Loaded pending withdrawals from localStorage for user ${userId}:`, this.pendingWithdrawals);
      } catch (error) {
        console.error('Error parsing stored withdrawals:', error);
      }
    }
    
    // Setup event listener for withdrawal status changes
    window.addEventListener('withdrawalStatusChanged', (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        const { id, status, amount, userId: eventUserId } = customEvent.detail;
        // Only process events for this user
        if (eventUserId === this.userId && id && amount) {
          if (status === 'completed' || status === 'approved') {
            this.confirmWithdrawal(id);
          } else if (status === 'rejected') {
            this.rejectWithdrawal(id);
          }
        }
      }
    });
    
    // Also listen for localStorage changes
    window.addEventListener('storage', (e: StorageEvent) => {
      if (e.key === 'withdrawalStatusChanged') {
        try {
          const data = e.newValue ? JSON.parse(e.newValue) : null;
          if (data && data.userId === this.userId && data.id && data.amount) {
            if (data.status === 'completed' || data.status === 'approved') {
              this.confirmWithdrawal(data.id);
            } else if (data.status === 'rejected') {
              this.rejectWithdrawal(data.id);
            }
          }
        } catch (error) {
          console.error('Error parsing withdrawal status data:', error);
        }
      }
    });
  }

  public static getInstance(userId?: string): EarningsManager {
    // If no userId provided, try to get it from authService
    if (!userId) {
      const userData = getUserData();
      userId = userData?.id || userData?._id;
      
      if (!userId) {
        console.error('No user ID available for EarningsManager');
        // Fallback to a guest ID to prevent errors
        userId = 'guest';
      }
    }
    
    if (!EarningsManager.instances.has(userId)) {
      EarningsManager.instances.set(userId, new EarningsManager(userId));
    }
    return EarningsManager.instances.get(userId)!;
  }

  // Create a new withdrawal - reduces balance immediately
  public createWithdrawal(id: string, amount: number): void {
    console.log(`EarningsManager for user ${this.userId}: Creating withdrawal ${id} for ${amount}`);
    this.pendingWithdrawals.set(id, amount);
    this.cachedEarnings.totalEarnings -= amount;
    this.saveState();
    this.notifyListeners();
  }

  // Confirm a withdrawal - keeps the reduced balance
  public confirmWithdrawal(id: string): void {
    console.log(`EarningsManager for user ${this.userId}: Confirming withdrawal ${id}`);
    if (this.pendingWithdrawals.has(id)) {
      // Just remove it from pending, balance already reduced
      this.pendingWithdrawals.delete(id);
      this.saveState();
      this.notifyListeners();
    }
  }

  // Reject a withdrawal - restores the balance
  public rejectWithdrawal(id: string): void {
    console.log(`EarningsManager for user ${this.userId}: Rejecting withdrawal ${id}`);
    const amount = this.pendingWithdrawals.get(id);
    if (amount) {
      // Restore the balance
      this.cachedEarnings.totalEarnings += amount;
      this.pendingWithdrawals.delete(id);
      this.saveState();
      this.notifyListeners();
    }
  }

  // Force refresh data from API
  public async refreshFromAPI(): Promise<void> {
    try {
      console.log(`EarningsManager for user ${this.userId}: Refreshing from API`);
      const response = await api.get('/earnings/user');
      const earnings = response.data;
      
      if (!earnings) {
        throw new Error('No earnings data returned from API');
      }
      
      // Update cached values with API data
      this.cachedEarnings = {
        totalEarnings: earnings.totalEarnings || 0,
        lastPayout: earnings.lastPayout || 0,
        pendingPayments: earnings.pendingPayments || 0
      };
      
      // Re-apply any pending withdrawals that may not be reflected in the API yet
      this.pendingWithdrawals.forEach((amount, id) => {
        console.log(`Re-applying pending withdrawal ${id} for ${amount}`);
        this.cachedEarnings.totalEarnings -= amount;
      });
      
      this.lastFetchTime = Date.now();
      this.saveState();
      this.notifyListeners();
      console.log(`EarningsManager for user ${this.userId}: Refresh complete, new balance:`, this.cachedEarnings.totalEarnings);
    } catch (error) {
      console.error('Error refreshing earnings from API:', error);
      throw error;
    }
  }

  // Get current total earnings (after pending withdrawals)
  public getTotalEarnings(): number {
    return this.cachedEarnings.totalEarnings;
  }

  // Get formatted total earnings
  public getFormattedTotalEarnings(): string {
    return this.formatCurrency(this.cachedEarnings.totalEarnings);
  }

  // Get last payout amount
  public getLastPayout(): number {
    return this.cachedEarnings.lastPayout;
  }

  // Get formatted last payout
  public getFormattedLastPayout(): string {
    return this.formatCurrency(this.cachedEarnings.lastPayout);
  }

  // Get pending payments amount
  public getPendingPayments(): number {
    return this.cachedEarnings.pendingPayments;
  }

  // Get formatted pending payments
  public getFormattedPendingPayments(): string {
    return this.formatCurrency(this.cachedEarnings.pendingPayments);
  }

  // Get current user ID
  public getUserId(): string {
    return this.userId;
  }

  // Register a listener to be notified when earnings change
  public addListener(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Error in earnings listener:', error);
      }
    });
  }

  private saveState(): void {
    // Save current state to localStorage for persistence with user-specific keys
    localStorage.setItem(`userEarnings_${this.userId}`, JSON.stringify(this.cachedEarnings));
    localStorage.setItem(`pendingWithdrawals_${this.userId}`, JSON.stringify(Array.from(this.pendingWithdrawals.entries())));
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
}

// Export singleton instance getter
export const getEarningsManager = (userId?: string): EarningsManager => {
  return EarningsManager.getInstance(userId);
};

// Export methods that work with the manager
export const updateEarningsForWithdrawal = (
  withdrawalId: string, 
  amount: number, 
  action: 'create' | 'approve' | 'reject',
  userId?: string
): void => {
  const earningsManager = getEarningsManager(userId);
  
  if (action === 'create') {
    earningsManager.createWithdrawal(withdrawalId, amount);
  } else if (action === 'approve') {
    earningsManager.confirmWithdrawal(withdrawalId);
  } else if (action === 'reject') {
    earningsManager.rejectWithdrawal(withdrawalId);
  }
}; 