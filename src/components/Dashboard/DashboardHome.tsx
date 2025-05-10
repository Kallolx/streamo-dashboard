'use client';
import { useState, useEffect } from 'react';
import Toast from '@/components/Common/Toast';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import api from '@/services/api';

import { getUserData } from '@/services/authService';
import { getTotalEarnings, getLastPayout, getPendingPayments } from '@/services/earningsService';
import { createWithdrawalRequest, WithdrawalRequest, getUserBankInfo, BankInfo } from '@/services/withdrawalService';
import { getEarningsManager, updateEarningsForWithdrawal } from '@/services/earningsManager';
import ReleaseDetailsModal from './models/ReleaseDetailsModal';

// Interface for release data
interface Release {
  _id: string;
  title: string;
  artist: string;
  coverArt: string;
  releaseType: string;
  genre: string;
  format: string;
  releaseDate: string;
  status: string;
  tracks: any[];
  stores: string[];
  language?: string;
  upc?: string;
  featuredArtist?: string;
  composer?: string;
  lyricist?: string;
  musicProducer?: string;
  publisher?: string;
  singer?: string;
  musicDirector?: string;
  copyrightHeader?: string;
  pricing?: string;
  createdAt: string;
  updatedAt: string;
}

// Icons
const PlayIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
  </svg>
);

const DollarIcon = () => (
  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
  </svg>
);

const WalletIcon = () => (
  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const MusicIcon = () => (
  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
  </svg>
);

export default function DashboardHome() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [earningsData, setEarningsData] = useState({
    totalEarnings: '$0',
    lastStatement: '$0',
    pendingPayments: '$0',
    statementHistory: []
  });
  const [releases, setReleases] = useState<Release[]>([]);
  const [releasesLoading, setReleasesLoading] = useState(true);
  
  // State for selected release and modal
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  
  // State for withdraw modal
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');
  
  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<"Bank" | "BKash" | "Nagad">("Bank");
  const [bankDetails, setBankDetails] = useState({
    country: "Bangladesh",
    routingNumber: "",
    bankName: "",
    accountName: "",
    swiftCode: "",
    accountNumber: "",
    branch: ""
  });
  const [mobileNumber, setMobileNumber] = useState("");
  const [savedBankInfo, setSavedBankInfo] = useState(false);
  const [loadingBankInfo, setLoadingBankInfo] = useState(false);
  const [hasSavedBankInfo, setHasSavedBankInfo] = useState(false);
  
  // List of Bangladesh banks
  const bangladeshBanks = [
    "Al-Arafah Islami Bank PLC",
    "Bangladesh Commerce Bank Limited",
    "Bangladesh Development Bank PLC",
    "Bangladesh Krishi Bank",
    "Bank Al-Falah Limited",
    "Bank Asia PLC.",
    "BASIC Bank Limited",
    "Bengal Commercial Bank PLC.",
    "BRAC Bank PLC",
    "Citibank N.A",
    "Citizens Bank PLC",
    "City Bank PLC",
    "Commercial Bank of Ceylon Limited",
    "Community Bank Bangladesh PLC.",
    "Dhaka Bank PLC",
    "Dutch-Bangla Bank PLC",
    "Eastern Bank PLC",
    "Export Import Bank of Bangladesh PLC",
    "First Security Islami Bank PLC",
    "Global Islami Bank PLC"
  ];
  
  // Constants for withdrawal
  const MIN_WITHDRAWAL_AMOUNT = 500; // Minimum $500 withdrawal
  const [userBalance, setUserBalance] = useState(0);

  // Add toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
  // Handle toast close
  const handleToastClose = () => {
    setToastMessage(null);
  };

  // Function to refresh earnings data
  const refreshEarningsData = async () => {
    try {
      const earningsManager = getEarningsManager();
      
      // First refresh from API to get latest data
      await earningsManager.refreshFromAPI();
      
      // Then get the data from the manager which includes any pending withdrawals
      setEarningsData({
        totalEarnings: earningsManager.getFormattedTotalEarnings(),
        lastStatement: earningsManager.getFormattedLastPayout(),
        pendingPayments: earningsManager.getFormattedPendingPayments(),
        statementHistory: []
      });
      
      // Update user balance with the value from the manager
      setUserBalance(earningsManager.getTotalEarnings());
      
      console.log('Earnings data refreshed, new balance:', earningsManager.getTotalEarnings());
    } catch (err) {
      console.error('Error refreshing earnings data:', err);
    }
  };

  // Real-time notification polling to check for withdrawal status changes
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const startPolling = () => {
      // Check every 10 seconds for updates
      intervalId = setInterval(() => {
        refreshEarningsData();
      }, 10000);
    };

    startPolling();

    // Clean up on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  // Handle storage events to listen for withdrawal status changes
  useEffect(() => {
    // Custom event listener for withdrawal status changes
    const handleWithdrawalStatusChange = (event: Event) => {
      console.log('Withdrawal status changed event received');
      
      // Check if there's event detail data
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        const { status, amount, id, userId: eventUserId } = customEvent.detail;
        const userData = getUserData();
        const currentUserId = userData?.id || userData?._id;
        
        // Only process events for the current user
        if (eventUserId && eventUserId !== currentUserId) {
          console.log(`Ignoring event for different user: ${eventUserId}, current user: ${currentUserId}`);
          return;
        }
        
        if (status === 'rejected') {
          // If rejected, add the amount back to the balance
          console.log(`Withdrawal ${id} rejected, adding ${amount} back to balance`);
          const amountValue = typeof amount === 'number' ? amount : parseFloat(String(amount));
          
          if (isNaN(amountValue)) {
            console.error(`Invalid amount value: ${amount}`);
            refreshEarningsData();
            return;
          }
          
          // Update user balance
          setUserBalance(prevBalance => {
            const newBalance = prevBalance + amountValue;
            console.log(`Updated balance: ${prevBalance} + ${amountValue} = ${newBalance}`);
            return newBalance;
          });
          
          // Update earnings display
          setEarningsData(prev => {
            const currentTotal = parseFloat(prev.totalEarnings.replace(/[$,]/g, '')) || 0;
            return {
              ...prev,
              totalEarnings: formatCurrency(currentTotal + amountValue)
            };
          });
        } else {
          // Immediately refresh data when a withdrawal is approved or completed
          console.log('Withdrawal approved or completed, refreshing data');
          refreshEarningsData();
        }
      } else {
        // Fallback to just refreshing all data
        refreshEarningsData();
      }
    };

    // Listen for the custom event
    window.addEventListener('withdrawalStatusChanged', handleWithdrawalStatusChange);
    
    // Also check localStorage for changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'withdrawalStatusChanged') {
        console.log('Withdrawal status change detected via localStorage');
        
        try {
          // Parse the JSON data from localStorage
          const data = e.newValue ? JSON.parse(e.newValue) : null;
          
          if (!data) {
            console.log('No data in localStorage event');
            return;
          }
          
          // Check if this event is for the current user
          const userData = getUserData();
          const currentUserId = userData?.id || userData?._id;
          
          if (data.userId && data.userId !== currentUserId) {
            console.log(`Ignoring localStorage event for different user: ${data.userId}, current user: ${currentUserId}`);
            return;
          }
          
          if (data.status === 'rejected') {
            // If rejected, add the amount back to the balance
            console.log(`Withdrawal ${data.id} rejected via localStorage, adding ${data.amount} back to balance`);
            const amountValue = typeof data.amount === 'number' ? data.amount : parseFloat(String(data.amount));
            
            if (isNaN(amountValue)) {
              console.error(`Invalid amount value in localStorage: ${data.amount}`);
              refreshEarningsData();
              return;
            }
            
            // Update user balance
            setUserBalance(prevBalance => {
              const newBalance = prevBalance + amountValue;
              console.log(`Updated balance via localStorage: ${prevBalance} + ${amountValue} = ${newBalance}`);
              return newBalance;
            });
            
            // Update earnings display
            setEarningsData(prev => {
              const currentTotal = parseFloat(prev.totalEarnings.replace(/[$,]/g, '')) || 0;
              return {
                ...prev,
                totalEarnings: formatCurrency(currentTotal + amountValue)
              };
            });
          } else {
            // For other statuses, refresh from API
            refreshEarningsData();
          }
        } catch (error) {
          console.error('Error parsing withdrawal status data:', error);
          refreshEarningsData();
        }
      }
    };
    
    // Listen for visibility changes to refresh data when user returns to the page
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Page became visible, refreshing data');
        refreshEarningsData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Setup a MutationObserver to watch for new notifications being added to the DOM
    // This is a backup mechanism to ensure we catch withdrawal status changes
    const observeNotifications = () => {
      const notificationContainer = document.querySelector('.notification-container');
      if (notificationContainer) {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
              // Check if any new notification is related to withdrawals
              Array.from(mutation.addedNodes).forEach((node) => {
                if (node instanceof HTMLElement) {
                  const notificationText = node.textContent?.toLowerCase() || '';
                  if (notificationText.includes('withdrawal') && 
                     (notificationText.includes('approved') || 
                      notificationText.includes('processed') || 
                      notificationText.includes('rejected'))) {
                    console.log('Withdrawal notification detected, refreshing data');
                    refreshEarningsData();
                  }
                }
              });
            }
          });
        });
        
        observer.observe(notificationContainer, { childList: true, subtree: true });
        return observer;
      }
      return null;
    };
    
    // Try to setup the observer, but it's ok if it fails (element might not exist yet)
    const observer = observeNotifications();
    
    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('withdrawalStatusChanged', handleWithdrawalStatusChange);
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  // Listen for BroadcastChannel messages (for cross-tab communication)
  useEffect(() => {
    let broadcastChannel: BroadcastChannel | null = null;
    
    try {
      broadcastChannel = new BroadcastChannel('withdrawal_updates');
      
      broadcastChannel.onmessage = (event) => {
        console.log('BroadcastChannel message received:', event.data);
        
        if (!event.data) {
          console.log('No data in BroadcastChannel event');
          return;
        }
        
        const { status, amount, id, userId } = event.data;
        
        // Check if this event is for the current user
        const userData = getUserData();
        const currentUserId = userData?.id || userData?._id;
        
        if (userId && userId !== currentUserId) {
          console.log(`Ignoring BroadcastChannel event for different user: ${userId}, current user: ${currentUserId}`);
          return;
        }
        
        if (status === 'rejected') {
          // If rejected, add the amount back to the balance
          console.log(`Withdrawal ${id} rejected via BroadcastChannel, adding ${amount} back to balance`);
          const amountValue = typeof amount === 'number' ? amount : parseFloat(String(amount));
          
          if (isNaN(amountValue)) {
            console.error(`Invalid amount value in BroadcastChannel: ${amount}`);
            refreshEarningsData();
            return;
          }
          
          // Update user balance
          setUserBalance(prevBalance => {
            const newBalance = prevBalance + amountValue;
            console.log(`Updated balance via BroadcastChannel: ${prevBalance} + ${amountValue} = ${newBalance}`);
            return newBalance;
          });
          
          // Update earnings display
          setEarningsData(prev => {
            const currentTotal = parseFloat(prev.totalEarnings.replace(/[$,]/g, '')) || 0;
            return {
              ...prev,
              totalEarnings: formatCurrency(currentTotal + amountValue)
            };
          });
        } else if (status === 'completed' || status === 'approved') {
          // If approved or completed, refresh from API
          console.log('Withdrawal approved or completed via BroadcastChannel, refreshing data');
          refreshEarningsData();
        }
      };
    } catch (error) {
      console.error('BroadcastChannel not supported:', error);
      // Fallback to other methods which are already implemented
    }
    
    // Cleanup function
    return () => {
      if (broadcastChannel) {
        broadcastChannel.close();
      }
    };
  }, []);

  // Fetch user data and earnings on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get user data from local storage (previously saved during login)
        const user = getUserData();
        
        if (!user) {
          console.error('No user data found in localStorage');
          return;
        }
        
        setUserData(user);
        
        // Get earnings data from API
        await refreshEarningsData();
        
        // Fetch releases data
        await fetchReleases();
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Function to fetch releases
  const fetchReleases = async () => {
    try {
      setReleasesLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }
      
      const response = await api.get('/releases', {
        params: {
          limit: 6 // Get only 6 most recent releases for the dashboard
        }
      });
      
      console.log("Releases API Response:", response.data);
      
      if (response.data.success) {
        if (Array.isArray(response.data.data)) {
          console.log("Number of releases loaded:", response.data.data.length);
          setReleases(response.data.data);
        } else {
          console.error("API response data is not an array:", response.data.data);
          setReleases([]);
        }
      } else {
        console.error("API returned failure:", response.data);
        setReleases([]);
      }
    } catch (error) {
      console.error("Error fetching releases:", error);
      setReleases([]);
    } finally {
      setReleasesLoading(false);
    }
  };

  // Function to get the correct role badge text
  const getRoleBadgeText = (role: string) => {
    switch(role) {
      case 'superadmin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'labelowner':
        return 'Label Owner';
      case 'artist':
        return 'Artist';
      default:
        return role || 'User';
    }
  };

  // Helper function to ensure values are never null/undefined when displayed
  const displayValue = (value: any, defaultValue: string = '$0') => {
    return value || defaultValue;
  };
  
  // Handle withdraw button click - modified to load saved bank info
  const handleWithdrawClick = async () => {
    setWithdrawError('');
    setWithdrawAmount('');
    setSavedBankInfo(false);
    
    // Reset payment fields
    setBankDetails({
      country: "Bangladesh",
      routingNumber: "",
      bankName: "",
      accountName: "",
      swiftCode: "",
      accountNumber: "",
      branch: ""
    });
    setMobileNumber("");
    setPaymentMethod("Bank");
    
    // Try to load the user's saved bank info
    setLoadingBankInfo(true);
    try {
      const savedInfo = await getUserBankInfo();
      if (savedInfo) {
        setHasSavedBankInfo(true);
      } else {
        setHasSavedBankInfo(false);
      }
    } catch (error) {
      console.error("Error loading saved bank info:", error);
      setHasSavedBankInfo(false);
    } finally {
      setLoadingBankInfo(false);
    }
    
    setShowWithdrawModal(true);
  };
  
  // Handle close modal
  const handleCloseModal = () => {
    setShowWithdrawModal(false);
    setWithdrawAmount('');
    setWithdrawError('');
  };
  
  // Handle bank details change
  const handleBankDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBankDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Load saved bank info
  const handleLoadSavedBankInfo = async () => {
    setLoadingBankInfo(true);
    try {
      const savedInfo = await getUserBankInfo();
      if (savedInfo) {
        setBankDetails({
          country: savedInfo.country || "Bangladesh",
          routingNumber: savedInfo.routingNumber || "",
          bankName: savedInfo.bankName || "",
          accountName: savedInfo.accountName || "",
          swiftCode: savedInfo.swiftCode || "",
          accountNumber: savedInfo.accountNumber || "",
          branch: savedInfo.branch || ""
        });
      }
    } catch (error) {
      console.error("Error loading saved bank info:", error);
      setWithdrawError("Failed to load saved bank information");
    } finally {
      setLoadingBankInfo(false);
    }
  };
  
  // Handle withdraw confirmation
  const handleConfirmWithdraw = async () => {
    // Reset error state
    setWithdrawError('');
    
    // Validate amount
    if (!withdrawAmount || isNaN(parseFloat(withdrawAmount)) || parseFloat(withdrawAmount) < 0) {
      setWithdrawError('Please enter a valid amount (0 or more)');
      return;
    }
    
    const amount = parseFloat(withdrawAmount);
    
    // Validate amount against user balance
    if (amount > userBalance) {
      setWithdrawError(`Insufficient balance. Your available balance is ${formatCurrency(userBalance)}`);
      return;
    }
    
    // Validate payment method details
    if (paymentMethod === "Bank") {
      if (!bankDetails.bankName || !bankDetails.accountName || !bankDetails.swiftCode || !bankDetails.accountNumber) {
        setWithdrawError('Please provide all required bank details');
        return;
      }
    } else if (paymentMethod === "BKash" || paymentMethod === "Nagad") {
      if (!mobileNumber) {
        setWithdrawError('Please enter your mobile number');
        return;
      }
    }
    
    setWithdrawLoading(true);
    
    try {
      // Prepare request data
      const requestData: WithdrawalRequest = {
        amount,
        paymentMethod,
        ...(paymentMethod === "Bank" ? { bankDetails } : { mobileNumber }),
        savedBankInfo
      };
      
      // Send API request using the service
      const response = await createWithdrawalRequest(requestData);
      
      console.log('Withdrawal request submitted successfully:', response);
      
      // Get the withdrawal ID from the response
      const withdrawalId = response.id;

      // Get current user's ID
      const userId = userData?.id || userData?._id;

      // Use the earnings manager to track this withdrawal
      updateEarningsForWithdrawal(withdrawalId, amount, 'create', userId);

      // Show success message using our custom Toast
      setToastType('success');
      setToastMessage(`Withdrawal request for ${formatCurrency(amount)} submitted successfully!`);

      // Update user balance (using the new balance from earnings manager)
      const earningsManager = getEarningsManager();
      setUserBalance(earningsManager.getTotalEarnings());

      // Update earnings display with the new balance
      setEarningsData(prev => ({
        ...prev,
        totalEarnings: earningsManager.getFormattedTotalEarnings()
      }));
      
      setWithdrawLoading(false);
      handleCloseModal();
      
    } catch (error: any) {
      console.error('Error submitting withdraw request:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit withdraw request. Please try again.';
      setWithdrawError(errorMessage);
      
      // Show error message
      setToastType('error');
      setToastMessage(errorMessage);
      
      setWithdrawLoading(false);
    }
  };

  // Function to handle release click - show modal instead of navigating
  const handleReleaseClick = (release: Release) => {
    setSelectedRelease(release);
    setIsReleaseModalOpen(true);
  };

  // Handle close of the release modal
  const handleCloseReleaseModal = () => {
    setIsReleaseModalOpen(false);
    setSelectedRelease(null);
  };
  
  // Dummy handlers for the modal's approve/reject/delete functions
  const handleApproveRelease = (releaseId: string) => {
    console.log(`Approve release: ${releaseId}`);
    // Not implementing actual approval as per requirements
    handleCloseReleaseModal();
  };
  
  const handleRejectRelease = (releaseId: string) => {
    console.log(`Reject release: ${releaseId}`);
    // Not implementing actual rejection as per requirements
    handleCloseReleaseModal();
  };
  
  const handleDeleteRelease = (releaseId: string) => {
    console.log(`Delete release: ${releaseId}`);
    // This would typically delete the release, but we're just closing the modal
    handleCloseReleaseModal();
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Add a helper function to format currency consistently
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Update the withdraw modal UI to show available balance and validate input on change
  const handleWithdrawAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWithdrawAmount(value);
    
    // Clear previous error if user is typing
    if (withdrawError) {
      setWithdrawError('');
    }
    
    // Real-time validation
    if (value && !isNaN(parseFloat(value))) {
      const amount = parseFloat(value);
      if (amount > userBalance) {
        setWithdrawError(`Insufficient balance. Your available balance is ${formatCurrency(userBalance)}`);
      }
    }
  };

  // Add a function to sanitize S3 URLs by removing any '@' prefix
  const sanitizeS3Url = (url: string): string => {
    if (!url) return '';
    // Remove any '@' prefix if present
    return url.startsWith('@') ? url.substring(1) : url;
  };

  // Add logging for debugging image loading issues
  useEffect(() => {
    if (Array.isArray(releases) && releases.length > 0) {
      console.log('Release images to load:', releases.map(r => ({ 
        id: r._id,
        coverArt: r.coverArt
      })));
    }
  }, [releases]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 relative">
      {/* Show Toast if message exists */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={handleToastClose}
        />
      )}
      
      {/* User header section */}
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
            Hi, {userData?.name || 'User'}
          </h1>
          <div className="flex gap-3 flex-wrap">
            <span className="bg-purple-900 text-white px-3 py-1 rounded-md text-sm flex items-center">
              <span className="mr-1">★</span> {getRoleBadgeText(userData?.role || '')}
            </span>
          </div>
        </div>
        
        {/* Withdraw Button */}
        <button
          onClick={handleWithdrawClick}
          className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#A365FF] text-white rounded-md hover:bg-purple-700 transition-colors w-full sm:w-auto"
        >
          Withdraw
        </button>
      </div>

      {/* Earnings and Statements section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-[#161A1F] p-4 sm:p-6 rounded-lg">
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm">Total Earnings</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-white text-xl sm:text-2xl font-bold">{displayValue(earningsData.totalEarnings)}</span>
              <div className="h-7 w-7 sm:h-8 sm:w-8 bg-gray-800 rounded-full flex items-center justify-center">
                <DollarIcon />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-[#161A1F] p-4 sm:p-6 rounded-lg">
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm">Last Statement</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-white text-xl sm:text-2xl font-bold">{displayValue(earningsData.lastStatement)}</span>
              <div className="h-7 w-7 sm:h-8 sm:w-8 bg-gray-800 rounded-full flex items-center justify-center">
                <DocumentIcon />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-[#161A1F] p-4 sm:p-6 rounded-lg sm:col-span-2 lg:col-span-1">
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm">Pending Payments</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-white text-xl sm:text-2xl font-bold">{displayValue(earningsData.pendingPayments)}</span>
              <div className="h-7 w-7 sm:h-8 sm:w-8 bg-gray-800 rounded-full flex items-center justify-center">
                <DollarIcon />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Latest releases section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-white">Latest Releases</h2>
          <a 
            href="/dashboard/catalogue/releases" 
            className="text-purple-500 hover:text-purple-400 text-sm flex items-center"
          >
            View All
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
        
        {releasesLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {Array.isArray(releases) && releases.length > 0 ? (
              releases.map((release) => (
                <div 
                  key={release._id} 
                  className="bg-[#161A1F] rounded-lg overflow-hidden transition-transform hover:scale-105 hover:shadow-lg cursor-pointer"
                  onClick={() => handleReleaseClick(release)}
                >
                  {/* Cover Art Image */}
                  <div className="aspect-square bg-[#1E2329] relative">
                    {release.coverArt ? (
                      <img 
                        src={sanitizeS3Url(release.coverArt)}
                        alt={release.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Error loading cover art:', release.coverArt);
                          const imgElement = e.target as HTMLImageElement;
                          imgElement.style.display = 'none';
                          const parent = imgElement.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-full h-full flex flex-col items-center justify-center p-4">
                                <div class="w-12 h-12 rounded-full bg-[#252A32] flex items-center justify-center mb-2">
                                  <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                  </svg>
                                </div>
                                <span class="text-xs text-gray-400 text-center">
                                  ${release.releaseType || 'Album'}
                                </span>
                              </div>
                            `;
                          }
                        }}
                      />
                    ) : (
                      // Fallback if no cover art is available
                      <div className="w-full h-full flex flex-col items-center justify-center p-4">
                        <div className="w-12 h-12 rounded-full bg-[#252A32] flex items-center justify-center mb-2">
                          <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                        </div>
                        <span className="text-xs text-gray-400 text-center">
                          {release.releaseType || 'Album'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Release details */}
                  <div className="p-3 space-y-1">
                    <h3 className="text-white text-xs font-medium truncate">{release.title || 'Untitled'}</h3>
                    <p className="text-gray-400 text-xs truncate">{release.artist || 'Unknown Artist'}</p>
                    <span className="text-gray-500 text-xs">{new Date(release.releaseDate).getFullYear()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-[#1A1E24] p-4 sm:p-6 rounded-lg text-center">
                <div className="flex flex-col items-center py-4 sm:py-6">
                  <div className="text-blue-500 mb-2">
                    <MusicIcon />
                  </div>
                  <h3 className="text-white font-medium mt-2">No Releases Found</h3>
                  <p className="text-gray-400 text-sm mt-1 mb-4">Start by creating your first release</p>
                  <a 
                    href="/dashboard/create-new?tab=releases" 
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors flex items-center text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    Create Release
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* ReleaseDetailsModal */}
      {selectedRelease && (
        <ReleaseDetailsModal 
          isOpen={isReleaseModalOpen}
          onClose={handleCloseReleaseModal}
          release={selectedRelease}
          onApprove={handleApproveRelease}
          onReject={handleRejectRelease}
          onDelete={handleDeleteRelease}
          userRole={userData?.role}
        />
      )}
      
      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop with blur */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          ></div>
          
          {/* Modal */}
          <div className="relative z-10 bg-[#111417] rounded-lg overflow-hidden shadow-xl w-[95%] max-w-2xl max-h-[90vh] sm:max-h-[80vh] animate-fadeIn flex flex-col m-2">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-800">
              <h3 className="text-lg sm:text-xl font-semibold text-white">Request Withdrawal</h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white transition-colors focus:outline-none"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-4 sm:p-5 flex-1 overflow-auto">
              {/* Error message */}
              {withdrawError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 sm:px-4 py-2 rounded-lg mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">{withdrawError}</span>
                  </div>
                </div>
              )}
              
              {/* Prioritize Withdrawal Amount */}
              <div className="mb-4 sm:mb-5 bg-[#161A1F] p-4 sm:p-5 rounded-lg border border-gray-800">
                <h4 className="text-white text-sm sm:text-base font-medium mb-3">Withdrawal Amount</h4>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <span className="text-gray-400 font-medium text-lg">$</span>
                  </div>
                  <input
                    type="text"
                    placeholder="0.00"
                    className={`w-full py-3 sm:py-4 pl-10 pr-3 rounded-lg bg-gray-800/60 text-white text-lg sm:text-xl font-medium border ${
                      withdrawError && withdrawError.includes('Insufficient balance') 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-700 focus:ring-[#A365FF] focus:border-[#A365FF]'
                    } focus:outline-none focus:ring-1`}
                    value={withdrawAmount}
                    onChange={handleWithdrawAmountChange}
                  />
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-xs sm:text-sm text-gray-400 flex items-center">
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 text-[#A365FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Available Balance: {formatCurrency(userBalance)}
                  </p>
                  <button 
                    type="button"
                    onClick={() => setWithdrawAmount(userBalance.toString())}
                    className="text-[#A365FF] hover:text-purple-400 text-xs"
                  >
                    Max
                  </button>
                </div>
              </div>
              
              {/* Payment Method Tabs */}
              <div className="mb-4">
                <h4 className="text-white text-sm sm:text-base font-medium mb-3">Payment Method</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-3 sm:px-4 py-2 rounded-md flex items-center transition-all text-sm ${
                      paymentMethod === "Bank" 
                        ? "bg-[#A365FF] text-white" 
                        : "bg-[#1A1E24] text-gray-300 hover:bg-[#252A32]"
                    }`}
                    onClick={() => setPaymentMethod("Bank")}
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Bank
                  </button>
                  
                  <button
                    className={`px-3 sm:px-4 py-2 rounded-md flex items-center transition-all text-sm ${
                      paymentMethod === "BKash" 
                        ? "bg-[#A365FF] text-white" 
                        : "bg-[#1A1E24] text-gray-300 hover:bg-[#252A32]"
                    }`}
                    onClick={() => setPaymentMethod("BKash")}
                  >
                    <img src="/icons/bkash.svg" alt="BKash" className="w-4 h-4 mr-1.5" />
                    BKash
                  </button>
                  
                  <button
                    className={`px-3 sm:px-4 py-2 rounded-md flex items-center transition-all text-sm ${
                      paymentMethod === "Nagad" 
                        ? "bg-[#A365FF] text-white" 
                        : "bg-[#1A1E24] text-gray-300 hover:bg-[#252A32]"
                    }`}
                    onClick={() => setPaymentMethod("Nagad")}
                  >
                    <img src="/icons/nagad.svg" alt="Nagad" className="w-4 h-4 mr-1.5" />
                    Nagad
                  </button>
                </div>
              </div>
              
              {/* Payment Details Form */}
              <div className="bg-[#161A1F] rounded-lg p-4 sm:p-5 border border-gray-800 mb-4">
                {paymentMethod === "Bank" ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white text-xs sm:text-sm font-medium">Bank Account Details</h4>
                      
                      {hasSavedBankInfo && (
                        <button
                          onClick={handleLoadSavedBankInfo}
                          className="text-xs flex items-center text-purple-400 hover:text-purple-300 transition-colors focus:outline-none"
                          disabled={loadingBankInfo}
                        >
                          {loadingBankInfo ? (
                            <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          )}
                          Load saved info
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {/* Country Field - Disabled and set to Bangladesh */}
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">Country</label>
                        <input
                          type="text"
                          name="country"
                          value={bankDetails.country}
                          disabled
                          className="w-full py-2 sm:py-2.5 px-3 rounded-lg bg-gray-700/60 text-white text-sm border border-gray-700 focus:outline-none cursor-not-allowed"
                          placeholder="Country"
                        />
                      </div>
                      
                      {/* Routing Number */}
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">Routing Number</label>
                        <input
                          type="text"
                          name="routingNumber"
                          value={bankDetails.routingNumber}
                          onChange={handleBankDetailsChange}
                          className="w-full py-2 sm:py-2.5 px-3 rounded-lg bg-gray-800/60 text-white text-sm border border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#A365FF] focus:border-[#A365FF]"
                          placeholder="Enter routing number"
                        />
                      </div>
                      
                      {/* Bank Name Dropdown */}
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">Bank Name*</label>
                        <select
                          name="bankName"
                          value={bankDetails.bankName}
                          onChange={handleBankDetailsChange}
                          className="w-full py-2 sm:py-2.5 px-3 rounded-lg bg-gray-800/60 text-white text-sm border border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#A365FF] focus:border-[#A365FF]"
                        >
                          <option value="">Select a bank</option>
                          {bangladeshBanks.map((bank) => (
                            <option key={bank} value={bank}>
                              {bank}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Account Name */}
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">Account Name*</label>
                        <input
                          type="text"
                          name="accountName"
                          value={bankDetails.accountName}
                          onChange={handleBankDetailsChange}
                          className="w-full py-2 sm:py-2.5 px-3 rounded-lg bg-gray-800/60 text-white text-sm border border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#A365FF] focus:border-[#A365FF]"
                          placeholder="Enter account name"
                        />
                      </div>
                      
                      {/* Swift Code */}
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">Swift Code*</label>
                        <input
                          type="text"
                          name="swiftCode"
                          value={bankDetails.swiftCode}
                          onChange={handleBankDetailsChange}
                          className="w-full py-2 sm:py-2.5 px-3 rounded-lg bg-gray-800/60 text-white text-sm border border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#A365FF] focus:border-[#A365FF]"
                          placeholder="Enter swift code"
                        />
                      </div>
                      
                      {/* Account Number */}
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">Account Number*</label>
                        <input
                          type="text"
                          name="accountNumber"
                          value={bankDetails.accountNumber}
                          onChange={handleBankDetailsChange}
                          className="w-full py-2 sm:py-2.5 px-3 rounded-lg bg-gray-800/60 text-white text-sm border border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#A365FF] focus:border-[#A365FF]"
                          placeholder="Enter account number"
                        />
                      </div>
                      
                      {/* Branch (optional) */}
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">Branch Name (optional)</label>
                        <input
                          type="text"
                          name="branch"
                          value={bankDetails.branch}
                          onChange={handleBankDetailsChange}
                          className="w-full py-2 sm:py-2.5 px-3 rounded-lg bg-gray-800/60 text-white text-sm border border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#A365FF] focus:border-[#A365FF]"
                          placeholder="Enter branch name"
                        />
                      </div>
                    </div>
                    
                    {/* Save Bank Info Checkbox */}
                    <div className="mt-3 flex items-center">
                      <input
                        type="checkbox"
                        id="saveBankInfo"
                        checked={savedBankInfo}
                        onChange={(e) => setSavedBankInfo(e.target.checked)}
                        className="h-4 w-4 bg-[#1D2229] border-gray-600 rounded text-purple-600 focus:ring-0 focus:ring-offset-0"
                      />
                      <label htmlFor="saveBankInfo" className="ml-2 md:ml-3 text-xs md:text-sm text-gray-300">
                        Save bank information for future withdrawals
                      </label>
                    </div>
                  </>
                ) : (
                  <>
                    <h4 className="text-white text-xs sm:text-sm font-medium mb-4">{paymentMethod} Account Details</h4>
                    <div>
                      <label className="block text-gray-400 text-xs mb-1">Mobile Number</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          className="w-full py-2 sm:py-2.5 pl-10 pr-3 rounded-lg bg-gray-800/60 text-white text-sm border border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#A365FF] focus:border-[#A365FF]"
                          placeholder="Enter mobile number"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-gray-400">Enter the {paymentMethod} account number where you would like to receive your payment</p>
                    </div>
                  </>
                )}
              </div>
              
              {/* Important Info */}
              <div className="bg-gray-900/50 rounded-lg p-3 sm:p-4 border border-gray-800">
                <h5 className="text-xs font-medium text-gray-300 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-1.5 text-[#A365FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Important Information
                </h5>
                <ul className="space-y-1 text-xs text-gray-400">
                  <li className="flex items-start">
                    <span className="mr-1">•</span>
                    <span>Processed within 3-5 business days</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-1">•</span>
                    <span>2% transaction fee may apply</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-1">•</span>
                    <span>Email notification sent when processed</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-4 sm:px-5 py-3 bg-gray-900/60 border-t border-gray-800 flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-2 sm:space-y-0">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors sm:w-auto w-full"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmWithdraw}
                disabled={withdrawLoading}
                className={`px-6 py-2 bg-[#A365FF] text-white rounded-lg transition-all sm:w-auto w-full ${
                  withdrawLoading
                    ? 'opacity-70 cursor-not-allowed' 
                    : 'hover:shadow-lg hover:shadow-purple-500/20'
                }`}
              >
                {withdrawLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Request Withdrawal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 