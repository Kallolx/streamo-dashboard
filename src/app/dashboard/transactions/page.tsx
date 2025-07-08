"use client";
import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { 
  PencilSimple, 
  Trash, 
  Upload, 
  FileArrowUp, 
  X, 
  Info, 
  CaretLeft as ChevronLeft, 
  CaretRight as ChevronRight,
  MagnifyingGlass as SearchIcon,
} from "@phosphor-icons/react";
import TransactionDetailsModal from "@/components/Dashboard/models/TransactionDetailsModal";
import { getUserRole, isAuthenticated } from "@/services/authService";
import { uploadCsv, getCsvUploads, deleteCsvUpload, getCsvStatus, CsvUpload } from "@/services/csvService";
import { getTransactions, deleteTransaction, Transaction, processTransactionsToAnalytics } from "@/services/transactionService";
import { useRouter } from "next/navigation";


// Define the transactions tabs
const transactionTabs = [
  {
    id: "transactionManagement",
    name: "Transactions Management",
  },
  {
    id: "uploadCSV",
    name: "Upload CSV",
    roles: ["admin", "superadmin"], // Only admin and superadmin can see this tab
  },
  {
    id: "analytics",
    name: "Analytics",
  },
  {
    id: "revenue",
    name: "Revenue",
  },
];


export default function TransactionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("transactionManagement");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 10;
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [performanceTimeframe, setPerformanceTimeframe] = useState("thisMonth");
  const [countriesTimeframe, setCountriesTimeframe] = useState("thisMonth");
  const [showPerformanceDropdown, setShowPerformanceDropdown] = useState(false);
  const [showCountriesDropdown, setShowCountriesDropdown] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [csvUploads, setCsvUploads] = useState<CsvUpload[]>([]);
  const [csvSearchTerm, setCsvSearchTerm] = useState("");
  const [isLoadingUploads, setIsLoadingUploads] = useState(false);
  const [csvPage, setCsvPage] = useState(1);
  const [csvTotalPages, setCsvTotalPages] = useState(1);
  
  // Real-time processing states
  const [processingCsvIds, setProcessingCsvIds] = useState<Set<string>>(new Set());
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [selectedCsvError, setSelectedCsvError] = useState<string | null>(null);
  const [selectedCsvId, setSelectedCsvId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showCsvDeleteModal, setShowCsvDeleteModal] = useState(false);
  const [csvToDelete, setCsvToDelete] = useState<string | null>(null);
  const [isCsvDeleting, setIsCsvDeleting] = useState(false);
  const [isSelectingAll, setIsSelectingAll] = useState(false);
  const [showSelectAllOption, setShowSelectAllOption] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setTableHeight] = useState('600px');
  const [csvSummary, setCsvSummary] = useState<any>(null);
  const [isLoadingCsvSummary, setIsLoadingCsvSummary] = useState(false);

  // Check authentication on component mount and initial load
  useEffect(() => {
    // Skip during SSR
    if (typeof window === 'undefined') return;
    
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsUserAuthenticated(authenticated);
      
      if (!authenticated) {
        // Redirect to login if not authenticated
        router.push('/auth/login');
        return;
      }
      
      // If authenticated, get user role and load data
      const role = getUserRole();
      setUserRole(role);
      
      // Load transactions if authenticated - initial load
      setIsInitialLoading(true);
      loadTransactions(false);
      
      // Load CSV summary data for cards
      loadCsvSummaryData();
    };
    
    checkAuth();
  }, [router]);

  // Safe localStorage functions to handle SSR and environments where localStorage isn't available
  const safeLocalStorageGet = (key: string): string | null => {
    if (typeof window === 'undefined') {
      return null; // Return null during SSR
    }
    
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return null;
    }
  };
  
  const safeLocalStorageSet = (key: string, value: string): boolean => {
    if (typeof window === 'undefined') {
      return false; // Can't set during SSR
    }
    
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
      return false;
    }
  };
  
  const safeLocalStorageRemove = (key: string): boolean => {
    if (typeof window === 'undefined') {
      return false; // Can't remove during SSR
    }
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
      return false;
    }
  };

  // Load CSV summary data for transaction cards
  const loadCsvSummaryData = async () => {
    // Declare cachedData outside the try block so it's available in the catch block
    let cachedData: string | null = null;
    
    try {
      setIsLoadingCsvSummary(true);
      console.log("Loading CSV summary data...");
      
      // First check if we have cached data in localStorage
      cachedData = safeLocalStorageGet('csvSummaryData');
      
      if (cachedData) {
        try {
          console.log("Found cached CSV summary data in localStorage");
          const parsedData = JSON.parse(cachedData);
          setCsvSummary(parsedData);
          console.log("Using cached CSV summary data:", parsedData);
          
          // Set loading to false since we have data to display
          setIsLoadingCsvSummary(false);
          
          // Continue execution to check for new uploads
          console.log("Will still check for newer CSV uploads in the background");
        } catch (parseError) {
          console.error("Error parsing cached CSV data:", parseError);
          // Continue with fetching fresh data
        }
      }
      
      // Fetch transaction data directly from MongoDB to calculate summary
      setTimeout(async () => {
        try {
          console.log("Fetching transaction data from MongoDB to calculate summary...");
          
          // Get all transactions to calculate summary data
          const transactionsResponse = await getTransactions(1, 1000, {}); // Get a large number to include all transactions
          
          if (transactionsResponse && transactionsResponse.data && transactionsResponse.data.length > 0) {
            console.log(`Found ${transactionsResponse.data.length} transactions in database`);
            
            // Process transactions into analytics format using the new function
            const transactions = transactionsResponse.data;
            const analyticsData = processTransactionsToAnalytics(transactions);
            
            console.log("Analytics data calculated:", analyticsData);
            
            // Update the summary data
            setCsvSummary(analyticsData);
            
            // Update localStorage cache with current timestamp
            safeLocalStorageSet('csvSummaryData', JSON.stringify(analyticsData));
            safeLocalStorageSet('lastProcessedCsvId', 'database-calculated');
            safeLocalStorageSet('lastProcessedCsvTimestamp', Date.now().toString());
            
            console.log("Analytics data updated from database transactions");
          } else {
            console.log("No transactions found in database");
            // If no transactions, reset to default
            resetCsvSummary();
          }
        } catch (error) {
          console.error("Error fetching transactions for summary:", error);
          // If we don't have cached data, reset to default
          if (!cachedData) {
            resetCsvSummary();
          }
        } finally {
          setIsLoadingCsvSummary(false);
        }
      }, 500); // Give a delay to not block initial UI rendering
      
    } catch (error) {
      console.error('Error in main CSV loading process:', error);
      // Only reset if we don't have cached data
      if (!cachedData) {
        resetCsvSummary();
      }
      setIsLoadingCsvSummary(false);
    }
  };
  
  // Reset CSV summary to default values (0)
  const resetCsvSummary = () => {
    const defaultSummary = {
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
    
    setCsvSummary(defaultSummary);
    
    // Also clear the cached data in localStorage
    safeLocalStorageRemove('csvSummaryData');
    console.log("CSV summary data reset and cache cleared");
  };

  // Update when page changes via state, not by direct call to loadTransactions
  useEffect(() => {
    if (isUserAuthenticated && activeTab === 'transactionManagement' && !isPaginationLoading) {
      // We don't call loadTransactions here if it was already triggered by handlePageChange
      setCurrentPage(currentPage);
    }
  }, [currentPage, isUserAuthenticated, activeTab, isPaginationLoading]);

  // Measure and set table height
  useEffect(() => {
    const updateTableHeight = () => {
      if (tableRef.current) {
        const windowHeight = window.innerHeight;
        // Adjust table height based on viewport, accounting for other elements
        const estimatedHeaderAndPaginationHeight = 350; // Adjust based on your layout
        const availableHeight = windowHeight - estimatedHeaderAndPaginationHeight;
        setTableHeight(`${Math.max(400, availableHeight)}px`);
      }
    };

    // Set initial height
    updateTableHeight();
    
    // Update height on window resize
    window.addEventListener('resize', updateTableHeight);
    return () => window.removeEventListener('resize', updateTableHeight);
  }, []);

  // Load transactions when page changes
  useEffect(() => {
    if (isUserAuthenticated && activeTab === 'transactionManagement') {
      loadTransactions();
    }
  }, [currentPage, isUserAuthenticated, activeTab]);

  // Load CSV uploads when the tab is set to uploadCSV
  useEffect(() => {
    if (activeTab === 'uploadCSV' && isUserAuthenticated) {
      loadCsvUploads();
    } else if (activeTab !== 'uploadCSV') {
      // Stop polling when not on upload tab to save resources
      stopPolling();
      setProcessingCsvIds(new Set());
    }
  }, [activeTab, csvPage, isUserAuthenticated]);

  // Load transactions from API
  const loadTransactions = async (isPageChange = false) => {
    if (!isUserAuthenticated) return;
    
    try {
      // Set the appropriate loading state based on whether this is initial load or pagination
      if (isPageChange) {
        setIsPaginationLoading(true);
      } else {
        setIsLoadingTransactions(true);
      }
      
      // We don't clear selections here anymore to maintain selections across page changes
      
      const response = await getTransactions(currentPage, itemsPerPage, {
        ...(searchTerm ? { artist: searchTerm } : {})
      });
      
      setTransactions(response.data || []);
      setTotalTransactions(response.pagination.total);
      setTotalPages(response.pagination.pages);
      
      // Update isAllSelected state based on if all transactions on this page are selected
      const currentPageIds = response.data.map(t => t._id || t.id).filter(Boolean);
      const allOnPageSelected = currentPageIds.every(id => selectedTransactions.has(id));
      setIsAllSelected(allOnPageSelected);
      
      // Clear loading states
      setIsLoadingTransactions(false);
      setIsPaginationLoading(false);
      setIsInitialLoading(false);
    } catch (err) {
      console.error('Error loading transactions:', err);
      setIsLoadingTransactions(false);
      setIsPaginationLoading(false);
      setIsInitialLoading(false);
    }
  };

  // Search transactions
  useEffect(() => {
    if (activeTab === 'transactionManagement' && isUserAuthenticated) {
      // Use a debounce to avoid too many API calls while typing
      const timer = setTimeout(() => {
        // Reset to first page when searching
        setCurrentPage(1);
        
        // Clear selections only when search term changes
        if (searchTerm) {
          setSelectedTransactions(new Set());
          setIsAllSelected(false);
        }
        
        // Show loading indicator for search
        setIsLoadingTransactions(true);
        loadTransactions(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  // Load CSV uploads from API
  const loadCsvUploads = async () => {
    if (!isUserAuthenticated) return;
    
    try {
      setIsLoadingUploads(true);
      const response = await getCsvUploads(csvPage, 10);
      setCsvUploads(response.uploads);
      setCsvTotalPages(response.pagination.pages);
      
      // Check for processing CSVs and start polling if needed
      const processing = response.uploads.filter(upload => upload.status === 'processing');
      if (processing.length > 0) {
        const processingIds = new Set(processing.map(upload => upload.id));
        setProcessingCsvIds(processingIds);
        startPolling();
      } else {
        // Stop polling if no processing uploads
        stopPolling();
        setProcessingCsvIds(new Set());
      }
      
      setIsLoadingUploads(false);
    } catch (error) {
      console.error('Error loading CSV uploads:', error);
      setIsLoadingUploads(false);
    }
  };

  // Start polling for CSV processing updates
  const startPolling = () => {
    if (pollingInterval) return; // Already polling
    
    const interval = setInterval(async () => {
      try {
        const response = await getCsvUploads(csvPage, 10);
        const uploads = response.uploads;
        
        // Update the CSV uploads with fresh data
        setCsvUploads(uploads);
        
        // Check which CSVs are still processing
        const stillProcessing = uploads.filter(upload => upload.status === 'processing');
        const stillProcessingIds = new Set(stillProcessing.map(upload => upload.id));
        
        if (stillProcessing.length === 0) {
          // No more processing, stop polling
          stopPolling();
          setProcessingCsvIds(new Set());
          
          // Refresh other data since processing is complete
          await loadCsvSummaryData();
          if (activeTab === 'transactionManagement') {
            await loadTransactions();
          }
        } else {
          setProcessingCsvIds(stillProcessingIds);
        }
      } catch (error) {
        console.error('Error polling CSV status:', error);
      }
    }, 2000); // Poll every 2 seconds
    
    setPollingInterval(interval);
  };

  // Stop polling
  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  // Handle file selection and upload
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Enhance the existing file upload function to also analyze data
  const handleFileUpload = async (file: File) => {
    if (!file) {
      setUploadError("Please select a CSV file to upload");
      return;
    }

    // Verify file is a CSV
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError("Please upload a CSV file");
      return;
    }

    // Check file size - warn if very large (> 5MB)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 5) {
      console.log(`Large CSV file detected (${fileSizeMB.toFixed(2)}MB). Processing may take longer.`);
      setUploadSuccess(`Large file detected (${fileSizeMB.toFixed(2)}MB). Processing may take longer...`);
    }

    setIsUploading(true);
    setUploadError(null);
    
    // Display processing message
    setUploadSuccess(`Processing CSV file: ${file.name}...`);
    console.log(`Starting to process CSV file: ${file.name}, size: ${fileSizeMB.toFixed(2)}MB`);

    try {
      // Upload CSV file to server for processing
      console.log("Uploading CSV to server for processing...");
      setUploadSuccess(`Uploading CSV file: ${file.name}...`);
      
      const uploadResponse = await uploadCsv(file);
      console.log("CSV uploaded successfully to server");
      setUploadSuccess(`File ${file.name} uploaded successfully! Processing in progress...`);
      
      // Immediately reload CSV uploads to get the new upload entry
      await loadCsvUploads();
      
      // Start polling for updates (loadCsvUploads will handle this)
      console.log("Real-time processing updates enabled");
      
      setIsUploading(false);
      
      // Clear success message after a while, the real-time updates will show progress
      setTimeout(() => {
        setUploadSuccess(null);
      }, 3000);
      
    } catch (uploadError) {
      console.error('Error uploading CSV to server:', uploadError);
      setUploadError(`Failed to upload ${file.name}. Please check your connection and try again.`);
      setIsUploading(false);
    }
  };
  
  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Handle CSV delete with confirmation modal
  const handleDeleteCsv = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click handler
    
    setCsvToDelete(id);
    setShowCsvDeleteModal(true);
  };

  // Confirm CSV delete
  const confirmCsvDelete = async () => {
    if (!csvToDelete) return;
    
    try {
      setIsCsvDeleting(true);
      console.log("Deleting CSV with ID:", csvToDelete);
      
      await deleteCsvUpload(csvToDelete);
      console.log("CSV deleted successfully");
      
      // Remove the deleted CSV from the list
      const updatedUploads = csvUploads.filter(csv => csv.id !== csvToDelete);
      setCsvUploads(updatedUploads);
      
      // Check if this was the last CSV
      if (updatedUploads.length === 0) {
        console.log("No CSV uploads remain, resetting summary data");
        // This was the last CSV, reset summary values and clear localStorage
        resetCsvSummary();
      } else {
        console.log("Other CSV uploads remain, analyzing the most recent one");
        // There are other CSVs, analyze the next most recent one
        loadCsvSummaryData();
        // Note: loadCsvSummaryData will update localStorage with the new data
      }
      
      setShowCsvDeleteModal(false);
      setCsvToDelete(null);
    } catch (error) {
      console.error('Error deleting CSV:', error);
      alert('Failed to delete CSV. Please try again.');
    } finally {
      setIsCsvDeleting(false);
    }
  };

  // Cancel CSV delete
  const cancelCsvDelete = () => {
    setShowCsvDeleteModal(false);
    setCsvToDelete(null);
  };

  // Handle CSV search
  const filteredCsvUploads = csvSearchTerm
    ? csvUploads.filter(upload => 
        upload.fileName.toLowerCase().includes(csvSearchTerm.toLowerCase()) ||
        upload.status.toLowerCase().includes(csvSearchTerm.toLowerCase()))
    : csvUploads;

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Filter visible tabs based on user role
  const visibleTabs = transactionTabs.filter(tab => {
    // If tab has roles specified, check if the user has the required role
    if (tab.roles) {
      return userRole && tab.roles.includes(userRole);
    }
    // Otherwise, show the tab to everyone
    return true;
  });

  // Handle transaction selection
  const handleTransactionSelect = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // When we call loadTransactions manually, specify that it's a page change
    loadTransactions(true);
    
    // Scroll back to top of table when page changes
    if (tableRef.current) {
      tableRef.current.scrollTop = 0;
    }
  };

  // Handle dropdown toggle
  const toggleDropdown = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  // Toggle dropdown visibility
  const togglePerformanceDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPerformanceDropdown(!showPerformanceDropdown);
    setShowCountriesDropdown(false);
  };

  const toggleCountriesDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCountriesDropdown(!showCountriesDropdown);
    setShowPerformanceDropdown(false);
  };

  // Handle timeframe selection
  const selectTimeframe = (dropdown: 'performance' | 'countries', value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (dropdown === 'performance') {
      setPerformanceTimeframe(value);
      setShowPerformanceDropdown(false);
    } else {
      setCountriesTimeframe(value);
      setShowCountriesDropdown(false);
    }
  };

  // Close dropdown when clicking outside for performance and countries
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Performance dropdown
      const performanceButton = document.getElementById('performance-dropdown-button');
      const performanceDropdown = document.getElementById('performance-dropdown');
      
      if (performanceButton && performanceDropdown) {
        if (!performanceButton.contains(e.target as Node) && 
            !performanceDropdown.contains(e.target as Node)) {
          setShowPerformanceDropdown(false);
        }
      }
      
      // Countries dropdown
      const countriesButton = document.getElementById('countries-dropdown-button');
      const countriesDropdown = document.getElementById('countries-dropdown');
      
      if (countriesButton && countriesDropdown) {
        if (!countriesButton.contains(e.target as Node) && 
            !countriesDropdown.contains(e.target as Node)) {
          setShowCountriesDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown when clicking outside for action menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activeDropdown !== null) {
        const dropdown = document.getElementById(`dropdown-${activeDropdown}`);
        const button = document.getElementById(`dropdown-button-${activeDropdown}`);
        
        if (dropdown && button) {
          if (!dropdown.contains(e.target as Node) && !button.contains(e.target as Node)) {
            setActiveDropdown(null);
          }
        } else {
          setActiveDropdown(null);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  // Helper to get display text for timeframe
  const getTimeframeText = (value: string) => {
    const timeframeLabels: Record<string, string> = {
      'thisMonth': 'This Month',
      'lastMonth': 'Last Month',
      'last3Months': 'Last 3 Months',
      'last6Months': 'Last 6 Months',
      'thisYear': 'This Year',
      'allTime': 'All Time'
    };
    
    return timeframeLabels[value] || value;
  };

  // Generate SVG path for performance chart
  const getPerformanceChartPath = (data: {month: string; revenue: number; streams: number}[], metric: 'revenue' | 'streams'): string => {
    if (!data || data.length === 0) {
      return '';
    }

    // Find the maximum value to scale the chart
    const maxValue = Math.max(...data.map(item => item[metric]));
    
    // Create scaled points for the chart (x, y coordinates)
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1 || 1)) * 1000; // Scale x from 0 to 1000
      
      // Scale y from 0 to 300 (inverted, as SVG y increases downward)
      // Add 20px padding at the top and bottom
      const normalizedValue = item[metric] / (maxValue || 1);
      const y = 280 - (normalizedValue * 260) + 20;
      
      return { x, y };
    });
    
    // Generate the SVG path
    if (points.length === 1) {
      // If only one point, create a horizontal line
      const p = points[0];
      return `M0,${p.y} L1000,${p.y}`;
    }
    
    // Create a smooth curve through the points
    let path = `M${points[0].x},${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      
      // Control points for the curve
      const cp1x = current.x + (next.x - current.x) / 3;
      const cp1y = current.y;
      const cp2x = next.x - (next.x - current.x) / 3;
      const cp2y = next.y;
      
      path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
    }
    
    return path;
  };

  // Generate conic gradient for pie chart from platform data
  const generateConicGradient = (platforms: {platform: string; percentage: number}[]): string => {
    if (!platforms || platforms.length === 0) {
      return "conic-gradient(#8A85FF 0% 100%)";
    }

    // Colors for the gradient
    const colors = ['#8A85FF', '#6AE398', '#FFB963', '#00C2FF'];
    
    // Build the gradient string
    let gradientString = "conic-gradient(";
    let startPercentage = 0;
    
    platforms.forEach((platform, index) => {
      const endPercentage = startPercentage + platform.percentage;
      gradientString += `${colors[index % colors.length]} ${startPercentage}% ${endPercentage}%`;
      
      if (index < platforms.length - 1) {
        gradientString += ", ";
      }
      
      startPercentage = endPercentage;
    });
    
    gradientString += ")";
    return gradientString;
  };

  // Generate dynamic Y-axis labels based on data
  const generateYAxisLabels = (maxValue: number): string[] => {
    if (maxValue === 0) return ['0', '0', '0', '0', '0', '0'];
    
    const formatValue = (value: number): string => {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}K`;
      } else {
        return value.toString();
      }
    };
    
    return [
      formatValue(maxValue),
      formatValue(Math.round(maxValue * 0.8)),
      formatValue(Math.round(maxValue * 0.6)),
      formatValue(Math.round(maxValue * 0.4)),
      formatValue(Math.round(maxValue * 0.2)),
      '0'
    ];
  };

  // Handle viewing CSV errors
  const handleViewErrors = async (id: string) => {
    try {
      const response = await getCsvStatus(id);
      setSelectedCsvError(response.upload.errorMessage || "No detailed error information available.");
      setSelectedCsvId(id);
      setShowErrorModal(true);
    } catch (error) {
      console.error('Error fetching CSV status:', error);
    }
  };

  // Close error modal
  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setSelectedCsvError(null);
    setSelectedCsvId(null);
  };

  // Format currency with proper formatting
  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount)) return '$0.00';
    
    // Format with commas for thousands and proper decimal places
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount);
  };

  // Handle transaction delete
  const handleDeleteTransaction = async (transaction: Transaction, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click handler
    
    // Try to use the available ID (_id from MongoDB, or id from the frontend)
    const transactionId = transaction._id || transaction.id;
    
    // Check if id is undefined or empty
    if (!transactionId) {
      alert('Cannot delete this transaction. Invalid transaction ID.');
      return;
    }
    
    // Show confirmation modal instead of window.confirm
    setTransactionToDelete(transaction);
    setShowDeleteModal(true);
  };

  // Confirm single transaction delete
  const confirmSingleDelete = async () => {
    if (!transactionToDelete) return;
    
    const transactionId = transactionToDelete._id || transactionToDelete.id;
    
    try {
      setIsDeleting(true);
      await deleteTransaction(transactionId);
      // Reload transactions to refresh the list
      await loadTransactions();
      setIsDeleting(false);
      // Close modal
      setShowDeleteModal(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setIsDeleting(false);
      alert('Failed to delete transaction. Please try again.');
    }
  };

  // Cancel single transaction delete
  const cancelSingleDelete = () => {
    setShowDeleteModal(false);
    setTransactionToDelete(null);
  };

  // Toggle selection of a transaction
  const toggleTransactionSelection = (transactionId: string) => {
    const newSelection = new Set(selectedTransactions);
    if (newSelection.has(transactionId)) {
      newSelection.delete(transactionId);
    } else {
      newSelection.add(transactionId);
    }
    
    setSelectedTransactions(newSelection);
    // Update all selected state
    setIsAllSelected(newSelection.size === transactions.length);
  };

  // Toggle selection of all transactions
  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setIsAllSelected(isChecked);
    
    // Get IDs from current page
    const currentPageIds = transactions.map(t => t._id || t.id).filter(Boolean);
    
    if (isChecked) {
      // Select all on this page
      const newSelection = new Set(selectedTransactions);
      currentPageIds.forEach(id => newSelection.add(id));
      setSelectedTransactions(newSelection);
      
      // If all pages combined have more items than current selection, show option to select all
      if (totalTransactions > currentPageIds.length && !showSelectAllOption) {
        setShowSelectAllOption(true);
      }
    } else {
      // Deselect all on this page
      const newSelection = new Set(selectedTransactions);
      currentPageIds.forEach(id => newSelection.delete(id));
      setSelectedTransactions(newSelection);
      setShowSelectAllOption(false);
    }
  };
  
  // Select all transactions across all pages
  const selectAllPages = async () => {
    setIsSelectingAll(true);
    
    try {
      // We'll fetch and select transactions page by page
      const allIds = new Set(selectedTransactions);
      const originalPage = currentPage;
      
      for (let page = 1; page <= totalPages; page++) {
        // Skip current page as we already have it
        if (page === originalPage) continue;
        
        const response = await getTransactions(page, itemsPerPage, {
          ...(searchTerm ? { artist: searchTerm } : {})
        });
        
        // Add all IDs from this page
        const pageIds = response.data.map(t => t._id || t.id).filter(Boolean);
        pageIds.forEach(id => allIds.add(id));
      }
      
      setSelectedTransactions(allIds);
      setIsAllSelected(true);
      setShowSelectAllOption(false);
      setIsSelectingAll(false);
    } catch (err) {
      console.error('Error selecting all transactions:', err);
      setIsSelectingAll(false);
    }
  };
  
  // Cancel select all option
  const cancelSelectAll = () => {
    setShowSelectAllOption(false);
  };

  // Handle bulk delete of selected transactions
  const handleBulkDelete = async () => {
    if (selectedTransactions.size === 0) {
      alert('Please select at least one transaction to delete.');
      return;
    }
    
    // Show confirmation modal
    setShowBulkDeleteModal(true);
  };

  // Confirm bulk delete
  const confirmBulkDelete = async () => {
    try {
      setIsBulkDeleting(true);
      
      // Convert Set to Array for easier processing
      const idsToDelete = Array.from(selectedTransactions);
      
      // For larger datasets, we'll send the IDs in batches to the backend
      // This is more efficient than making individual API calls
      const batchSize = 100; // Adjust based on your API's capabilities
      
      for (let i = 0; i < idsToDelete.length; i += batchSize) {
        const batch = idsToDelete.slice(i, i + batchSize);
        
        // Call a hypothetical bulk delete endpoint - you would need to implement this
        // This would be more efficient for larger datasets
        // For now, we'll delete them one by one as a fallback
        try {
          // You would replace this with a bulk delete API call:
          // await api.post('/transactions/bulk-delete', { ids: batch });
          
          // Fallback to individual deletions if bulk endpoint doesn't exist
          for (const id of batch) {
            await deleteTransaction(id);
          }
        } catch (error) {
          console.error(`Error deleting batch of transactions:`, error);
          // Continue with other batches even if one fails
        }
      }
      
      // Clear selection and reload transactions
      setSelectedTransactions(new Set());
      setIsAllSelected(false);
      await loadTransactions();
      
      setIsBulkDeleting(false);
      setShowBulkDeleteModal(false);
    } catch (error) {
      console.error('Error bulk deleting transactions:', error);
      setIsBulkDeleting(false);
      alert('Failed to delete some transactions. Please try again.');
    }
  };

  // Cancel bulk delete
  const cancelBulkDelete = () => {
    setShowBulkDeleteModal(false);
  };

  const handleAnalysisComplete = (summary: any) => {
    setCsvSummary(summary);
    setIsLoadingCsvSummary(false);
  };

  // Load CSV summary data when the tab changes to transaction management
  useEffect(() => {
    if (activeTab === 'transactionManagement' && isUserAuthenticated) {
      console.log('Tab changed to transaction management, refreshing CSV data');
      loadCsvSummaryData();
    }
  }, [activeTab, isUserAuthenticated]);

  // Manual refresh function for summary data
  const refreshSummaryData = async () => {
    console.log("Manual refresh of summary data triggered");
    setIsLoadingCsvSummary(true);
    try {
      // Clear cached data first to force fresh fetch
      safeLocalStorageRemove('csvSummaryData');
      safeLocalStorageRemove('lastProcessedCsvId');
      safeLocalStorageRemove('lastProcessedCsvTimestamp');
      console.log("Cleared cached data, fetching fresh summary...");
      
      await loadCsvSummaryData();
      console.log("Manual refresh completed successfully");
    } catch (error) {
      console.error("Manual refresh failed:", error);
    }
  };

  return (
    <DashboardLayout
      title="Transactions"
      subtitle="Manage your earnings and transactions"
    >
      {/* Tabs */}
      <div className="mb-6 md:mb-8">
        <div className="flex overflow-x-auto no-scrollbar pb-2">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-3 sm:px-5 py-2 rounded-full whitespace-nowrap mr-2 text-sm ${
                activeTab === tab.id
                  ? "bg-[#A365FF] text-white"
                  : "bg-[#1A1E24] text-gray-300 hover:bg-[#252A33]"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "transactionManagement" && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Balance */}
            <div className="bg-[#161A1F] p-4 md:p-6 rounded-lg">
              <div className="flex flex-col">
                <span className="text-gray-400 text-base">Balance</span>
                <div className="mt-2">
                  {isLoadingCsvSummary ? (
                    <div className="animate-pulse h-10 bg-gray-700 rounded w-32"></div>
                  ) : (
                    <span className="text-white text-4xl font-extrabold">
                      {formatCurrency(csvSummary?.totalBalance || 0)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Last Transaction */}
            <div className="bg-[#161A1F] p-4 md:p-6 rounded-lg">
              <div className="flex flex-col">
                <span className="text-gray-400 text-base">Last Transaction</span>
                <div className="mt-2">
                  {isLoadingCsvSummary ? (
                    <div className="animate-pulse h-10 bg-gray-700 rounded w-32"></div>
                  ) : (
                    <span className="text-white text-4xl font-extrabold">
                      {formatCurrency(csvSummary?.lastTransaction?.amount || 0)}
                    </span>
                  )}
                </div>
                {!isLoadingCsvSummary && csvSummary?.lastTransaction?.artist && (
                  <div className="mt-2 text-sm text-gray-400 truncate">
                    {csvSummary.lastTransaction.artist} - {csvSummary.lastTransaction.title}
                  </div>
                )}
              </div>
            </div>

            {/* Last Statement */}
            <div className="bg-[#161A1F] p-6 rounded-lg">
              <div className="flex flex-col">
                <span className="text-gray-400 text-base">Last Statement</span>
                <div className="mt-2">
                  {isLoadingCsvSummary ? (
                    <div className="animate-pulse h-10 bg-gray-700 rounded w-32"></div>
                  ) : (
                    <span className="text-white text-4xl font-extrabold">
                      {formatCurrency(csvSummary?.totalRevenue || 0)}
                    </span>
                  )}
                </div>
                {!isLoadingCsvSummary && csvSummary?.lastStatementPeriod && (
                  <div className="mt-2 text-sm text-gray-400">
                    Period: {csvSummary.lastStatementPeriod}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transactions Management title and search */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                Transactions Management
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search by artist, track or store"
                  className="w-full py-2 px-4 pl-10 rounded-md bg-[#1D2229] text-gray-300 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg
                  className="absolute left-3 top-2.5 text-gray-400"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21 21L16.65 16.65"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="flex gap-2">
                {selectedTransactions.size > 0 && userRole && ["admin", "superadmin"].includes(userRole) && (
                  <button 
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors whitespace-nowrap flex items-center"
                    onClick={handleBulkDelete}
                    disabled={isBulkDeleting}
                  >
                    {isBulkDeleting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash size={20} className="mr-2" />
                        Delete Selected ({selectedTransactions.size})
                      </>
                    )}
                  </button>
                )}
                {userRole && ["admin", "superadmin"].includes(userRole) && (
                  <button 
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors whitespace-nowrap flex items-center"
                    onClick={() => handleTabChange("uploadCSV")}
                  >
                    <FileArrowUp size={20} className="mr-2" />
                    Upload CSV
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-[#161A1F] rounded-lg overflow-hidden">
            {/* Select All Notification */}
            {showSelectAllOption && (
              <div className="bg-[#232830] p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <Info size={20} className="text-blue-400 mr-2" />
                  <span className="text-gray-300">
                    <span className="font-bold">{selectedTransactions.size}</span> transactions selected on this page. 
                    Select all <span className="font-bold">{totalTransactions}</span> transactions across all pages?
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                    onClick={selectAllPages}
                    disabled={isSelectingAll}
                  >
                    {isSelectingAll ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Selecting...
                      </>
                    ) : 'Select All'}
                  </button>
                  <button 
                    className="px-3 py-1 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
                    onClick={cancelSelectAll}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {/* Table Container with fixed height */}
            <div 
              ref={tableRef}
              className="overflow-auto relative" 
              style={{ maxHeight: tableHeight }}
            >
              {isInitialLoading ? (
                <div className="flex justify-center items-center py-20">
                  <svg className="animate-spin h-10 w-10 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <p>No transactions found</p>
                  {userRole && ["admin", "superadmin"].includes(userRole) && (
                    <button 
                      className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                      onClick={() => handleTabChange("uploadCSV")}
                    >
                      Upload CSV to add transactions
                    </button>
                  )}
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-[#1A1E24] sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 w-10">
                        <div className="flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            className="rounded bg-[#232830] border-gray-600 text-purple-600 focus:ring-purple-500"
                            checked={isAllSelected}
                            onChange={toggleSelectAll}
                          />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Track/Release
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Artist
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        ISRC
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Store
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Streams
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Net Revenue
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`bg-[#161A1F] divide-y divide-gray-700 ${isPaginationLoading ? 'opacity-50' : ''}`}>
                    {transactions.map((transaction) => (
                      <tr
                        key={transaction.id || transaction._id}
                        className="hover:bg-[#1A1E24] cursor-pointer"
                        onClick={() => handleTransactionSelect(transaction)}
                      >
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center">
                            <input 
                              type="checkbox" 
                              className="rounded bg-[#232830] border-gray-600 text-purple-600 focus:ring-purple-500"
                              checked={selectedTransactions.has(transaction._id || transaction.id || '')}
                              onChange={() => toggleTransactionSelection(transaction._id || transaction.id || '')}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-white">
                          {transaction.title || 'Unknown'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-white">
                          {transaction.artist || 'Unknown'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-white">
                          {transaction.isrc || 'N/A'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-white">
                          {transaction.serviceType || 'Unknown'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-white">
                          {transaction.quantity || 0}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-white">
                          {formatCurrency(transaction.revenueUSD || transaction.revenue || 0)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-white">
                          <div
                            className="flex space-x-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {userRole && ["admin", "superadmin"].includes(userRole) && (
                              <>
                                <button className="text-gray-400 hover:text-white transition-colors">
                                  <PencilSimple size={20} />
                                </button>
                                <button 
                                  className="text-red-500 hover:text-red-400 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTransaction(transaction, e);
                                  }}
                                  disabled={isDeleting}
                                >
                                  <Trash size={20} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              
              {/* Pagination Loading Indicator Overlay */}
              {isPaginationLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                  <div className="p-4 rounded-full bg-black bg-opacity-50">
                    <svg className="animate-spin h-8 w-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination */}
            {transactions.length > 0 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-700 bg-[#1A1E24] sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-400">
                      Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, totalTransactions)}
                      </span>{' '}
                      of <span className="font-medium">{totalTransactions}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1 || isPaginationLoading}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-[#1A1E24] text-sm font-medium ${
                          currentPage === 1 || isPaginationLoading ? 'text-gray-500 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft size={18} weight="bold" />
                      </button>
                      
                      {/* Pagination Numbers */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          // Show first and last page always
                          if (page === 1 || page === totalPages) return true;
                          // Show pages around current page
                          if (Math.abs(page - currentPage) <= 1) return true;
                          // Show ellipsis placeholders (represented by the page number)
                          if (page === currentPage - 2 && currentPage > 3) return true;
                          if (page === currentPage + 2 && currentPage < totalPages - 2) return true;
                          return false;
                        })
                        .map((page, index, array) => {
                          // Determine if we need to show ellipsis
                          const showEllipsis = index > 0 && page > array[index - 1] + 1;
                          
                          return (
                            <React.Fragment key={page}>
                              {showEllipsis && (
                                <span className="relative inline-flex items-center px-4 py-2 border border-gray-700 bg-[#1A1E24] text-sm font-medium text-gray-500">
                                  ...
                                </span>
                              )}
                              <button
                                onClick={() => handlePageChange(page)}
                                disabled={isPaginationLoading}
                                className={`relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium ${
                                  currentPage === page
                                    ? 'z-10 bg-purple-600 border-purple-500 text-white'
                                    : 'bg-[#1A1E24] text-gray-400 hover:bg-gray-700'
                                } ${isPaginationLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          );
                        })}
                      
                      <button
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages || isPaginationLoading}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-[#1A1E24] text-sm font-medium ${
                          currentPage === totalPages || isPaginationLoading ? 'text-gray-500 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight size={18} weight="bold" />
                      </button>
                    </nav>
                  </div>
                </div>
                
                {/* Mobile pagination controls */}
                <div className="flex items-center justify-between w-full sm:hidden">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || isPaginationLoading}
                    className={`relative inline-flex items-center px-3 py-2 rounded-md border border-gray-700 bg-[#1A1E24] text-sm font-medium ${
                      currentPage === 1 || isPaginationLoading ? 'text-gray-500 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <ChevronLeft size={18} weight="bold" className="mr-1" />
                    Previous
                  </button>
                  
                  <span className="text-sm text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || isPaginationLoading}
                    className={`relative inline-flex items-center px-3 py-2 rounded-md border border-gray-700 bg-[#1A1E24] text-sm font-medium ${
                      currentPage === totalPages || isPaginationLoading ? 'text-gray-500 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    Next
                    <ChevronRight size={18} weight="bold" className="ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 gap-6">
          {/* Summary Cards */}
          <div className="col-span-1 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Balance */}
            <div className="bg-[#161A1F] p-6 rounded-lg">
              <div className="flex flex-col">
                <span className="text-gray-400 text-base">Balance</span>
                <div className="mt-2">
                  {isLoadingCsvSummary ? (
                    <div className="animate-pulse h-10 bg-gray-700 rounded w-32"></div>
                  ) : (
                    <span className="text-white text-4xl font-extrabold">
                      {formatCurrency(csvSummary?.totalBalance || 0)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Total Streams */}
            <div className="bg-[#161A1F] p-6 rounded-lg">
              <div className="flex flex-col">
                <span className="text-gray-400 text-base">Total Streams</span>
                <div className="mt-2">
                  {isLoadingCsvSummary ? (
                    <div className="animate-pulse h-10 bg-gray-700 rounded w-32"></div>
                  ) : (
                    <span className="text-white text-4xl font-extrabold">
                      {csvSummary?.totalStreams?.toLocaleString() || 0}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-[#161A1F] p-6 rounded-lg">
              <div className="flex flex-col">
                <span className="text-gray-400 text-base">Total Revenue</span>
                <div className="mt-2">
                  {isLoadingCsvSummary ? (
                    <div className="animate-pulse h-10 bg-gray-700 rounded w-32"></div>
                  ) : (
                    <span className="text-white text-4xl font-extrabold">
                      {formatCurrency(csvSummary?.totalRevenue || 0)}
                    </span>
                  )}
                </div>
                {!isLoadingCsvSummary && csvSummary?.lastStatementPeriod && (
                  <div className="mt-2 text-sm text-gray-400">
                    Period: {csvSummary.lastStatementPeriod}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance Analytics */}
            <div className="p-5 bg-[#161A1F] rounded-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-medium">Performance Analytics</h3>
                <div className="relative">
                  <button 
                    id="performance-dropdown-button"
                    className="bg-[#232830] text-gray-300 px-3 py-1.5 rounded text-sm flex items-center"
                    onClick={togglePerformanceDropdown}
                  >
                    <span>{getTimeframeText(performanceTimeframe)}</span>
                    <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                  {showPerformanceDropdown && (
                    <div 
                      id="performance-dropdown"
                      className="absolute right-0 mt-1 w-40 bg-[#232830] rounded-md shadow-lg z-50"
                    >
                      <div className="py-1">
                        {['thisMonth', 'lastMonth', 'last3Months', 'last6Months', 'thisYear', 'allTime'].map((value) => (
                          <button 
                            key={value}
                            className={`block px-4 py-2 text-sm w-full text-left ${
                              performanceTimeframe === value ? 'text-[#A365FF]' : 'text-gray-300 hover:bg-[#1A1E24]'
                            }`}
                            onClick={(e) => selectTimeframe('performance', value, e)}
                          >
                            {getTimeframeText(value)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chart */}
              <div className="h-90 rounded-lg p-4">
                <div className="relative h-full">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 py-2">
                    {!isLoadingCsvSummary && csvSummary?.performanceData && csvSummary.performanceData.length > 0 ? (
                      (() => {
                        const maxValue = Math.max(...csvSummary.performanceData.map((item: any) => item.revenue || 0));
                        const labels = generateYAxisLabels(maxValue);
                        return labels.map((label, index) => (
                          <span key={index}>{label}</span>
                        ));
                      })()
                    ) : (
                      <>
                        <span>50K</span>
                        <span>10K</span>
                        <span>1K</span>
                        <span>500</span>
                        <span>100</span>
                        <span>0</span>
                      </>
                    )}
                  </div>
                  
                  {/* Chart area with horizontal grid lines */}
                  <div className="absolute left-10 right-0 top-0 bottom-0">
                    {/* Horizontal grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between">
                      <div className="border-t border-[#2A303A]"></div>
                      <div className="border-t border-[#2A303A]"></div>
                      <div className="border-t border-[#2A303A]"></div>
                      <div className="border-t border-[#2A303A]"></div>
                      <div className="border-t border-[#2A303A]"></div>
                      <div className="border-t border-[#2A303A]"></div>
                    </div>
                    
                    {/* SVG for the chart */}
                    <svg 
                      viewBox="0 0 1000 300"
                      className="w-full h-full"
                      preserveAspectRatio="none"
                    >
                      {/* Horizontal grid lines */}
                      <line x1="0" y1="0" x2="1000" y2="0" stroke="#2A303A" strokeWidth="1" />
                      <line x1="0" y1="60" x2="1000" y2="60" stroke="#2A303A" strokeWidth="1" />
                      <line x1="0" y1="120" x2="1000" y2="120" stroke="#2A303A" strokeWidth="1" />
                      <line x1="0" y1="180" x2="1000" y2="180" stroke="#2A303A" strokeWidth="1" />
                      <line x1="0" y1="240" x2="1000" y2="240" stroke="#2A303A" strokeWidth="1" />
                      <line x1="0" y1="300" x2="1000" y2="300" stroke="#2A303A" strokeWidth="1" />
                      
                      {/* Chart line - Real data */}
                      {!isLoadingCsvSummary && csvSummary?.performanceData && csvSummary.performanceData.length > 0 ? (
                        <>
                          <path 
                            d={getPerformanceChartPath(csvSummary.performanceData, 'revenue')}
                            fill="none"
                            stroke="#A365FF"
                            strokeWidth="2"
                          />
                          
                          {/* Fill gradient */}
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#A365FF" stopOpacity="0.5" />
                              <stop offset="100%" stopColor="#A365FF" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          
                          {/* Fill area */}
                          <path 
                            d={`${getPerformanceChartPath(csvSummary.performanceData, 'revenue')} L${1000 * (csvSummary.performanceData.length > 0 ? 1 : 0)},300 L0,300 Z`}
                            fill="url(#gradient)"
                          />
                        </>
                      ) : (
                        <>
                          {/* No data message */}
                          <rect x="0" y="0" width="1000" height="300" fill="transparent" />
                          <text x="500" y="150" textAnchor="middle" fill="#6B7280" fontSize="14" fontFamily="Arial, sans-serif">
                            No performance data available
                          </text>
                          <text x="500" y="170" textAnchor="middle" fill="#6B7280" fontSize="12" fontFamily="Arial, sans-serif">
                            Upload CSV files to see analytics
                          </text>
                        </>
                      )}
                    </svg>
                  </div>
                </div>
                
                {/* X-axis labels */}
                <div className="flex justify-between text-xs text-gray-400 mt-2 px-10">
                  {!isLoadingCsvSummary && csvSummary?.performanceData && csvSummary.performanceData.length > 0 ? (
                    csvSummary.performanceData.map((data: {month: string; revenue: number; streams: number}, index: number) => (
                      <span key={index}>{data.month.split(' ')[0]}</span>
                    ))
                  ) : (
                    <div className="w-full text-center">
                      <span>Upload CSV to view monthly data</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Top Countries for Streaming */}
            <div className="p-5 bg-[#161A1F] rounded-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-medium">Top Countries for Streaming</h3>
                <div className="relative">
                  <button 
                    id="countries-dropdown-button"
                    className="bg-[#232830] text-gray-300 px-3 py-1.5 rounded text-sm flex items-center"
                    onClick={toggleCountriesDropdown}
                  >
                    <span>{getTimeframeText(countriesTimeframe)}</span>
                    <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                  {showCountriesDropdown && (
                    <div 
                      id="countries-dropdown"
                      className="absolute right-0 mt-1 w-40 bg-[#232830] rounded-md shadow-lg z-50"
                    >
                      <div className="py-1">
                        {['thisMonth', 'lastMonth', 'last3Months', 'last6Months', 'thisYear', 'allTime'].map((value) => (
                          <button 
                            key={value}
                            className={`block px-4 py-2 text-sm w-full text-left ${
                              countriesTimeframe === value ? 'text-[#A365FF]' : 'text-gray-300 hover:bg-[#1A1E24]'
                            }`}
                            onClick={(e) => selectTimeframe('countries', value, e)}
                          >
                            {getTimeframeText(value)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Countries list */}
              <div className="space-y-5 bg-[#1A1E24] p-5 rounded-lg">
                {isLoadingCsvSummary ? (
                  // Loading skeleton
                  [...Array(6)].map((_, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-white mb-1.5">
                        <div className="animate-pulse h-4 bg-gray-700 rounded w-24"></div>
                        <div className="animate-pulse h-4 bg-gray-700 rounded w-8"></div>
                      </div>
                      <div className="w-full bg-[#232830] h-2 rounded-full">
                        <div className="animate-pulse bg-gray-700 h-2 rounded-full" style={{ width: '50%' }}></div>
                      </div>
                    </div>
                  ))
                ) : csvSummary?.countryData && csvSummary.countryData.length > 0 ? (
                  // Real country data
                  csvSummary.countryData.map((country: {country: string; percentage: number}, index: number) => (
                    <div key={index}>
                      <div className="flex justify-between text-white mb-1.5">
                        <span>{country.country}</span>
                        <span>{country.percentage}%</span>
                      </div>
                      <div className="w-full bg-[#232830] h-2 rounded-full">
                        <div className="bg-[#A365FF] h-2 rounded-full" style={{ width: `${country.percentage}%` }}></div>
                      </div>
                    </div>
                  ))
                ) : (
                  // No data available message
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">No country data available</div>
                    <div className="text-gray-500 text-sm">Upload CSV files to see top streaming countries</div>
                  </div>
                )}
              </div>
            </div>
          </div>


        </div>
      )}

      {activeTab === "uploadCSV" && userRole && ["admin", "superadmin"].includes(userRole) && (
        <div className="bg-[#161A1F] p-8 rounded-lg">
          {/* File Upload Section */}
          <div 
            className="border-2 border-dashed border-gray-600 rounded-lg p-8 flex flex-col items-center mb-8"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="w-16 h-16 mb-4 flex items-center justify-center">
              <Upload size={48} weight="thin" className="text-[#A365FF]" />
            </div>
            
            <p className="text-gray-300 mb-2">
              Browse or drag and drop CSV file
            </p>
            
            {uploadError && (
              <div className="text-red-500 mb-2 text-center">
                {uploadError}
              </div>
            )}
            
            {uploadSuccess && (
              <div className="text-green-500 mb-2 text-center">
                {uploadSuccess}
              </div>
            )}

            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileSelect}
              ref={fileInputRef}
              disabled={isUploading}
            />

            <button 
              className={`mt-4 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <FileArrowUp size={20} className="mr-2" />
                  Upload
                </>
              )}
            </button>
          </div>

          {/* CSV List Section */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">CSV List</h2>



            {/* Search Box */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search"
                className="w-full sm:w-64 py-2 px-4 pl-10 rounded-md bg-[#1D2229] text-gray-300 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={csvSearchTerm}
                onChange={(e) => setCsvSearchTerm(e.target.value)}
              />
              <svg
                className="absolute left-3 top-2.5 text-gray-400"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 21L16.65 16.65"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Loading State */}
            {isLoadingUploads && (
              <div className="flex justify-center py-10">
                <svg className="animate-spin h-10 w-10 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}

            {/* Empty State */}
            {!isLoadingUploads && filteredCsvUploads.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-400">No CSV uploads found</p>
              </div>
            )}

            {/* CSV Table */}
            {!isLoadingUploads && filteredCsvUploads.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-[#1A1E24]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        File Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Data Imported
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#161A1F] divide-y divide-gray-700">
                    {filteredCsvUploads.map((upload) => {
                      const isProcessing = processingCsvIds.has(upload.id);
                      return (
                        <tr key={upload.id} className={`hover:bg-[#1A1E24] ${isProcessing ? 'bg-[#1A1E24] border-l-2 border-green-500' : ''}`}>
                          <td className="px-4 py-3 whitespace-nowrap text-white">
                            <div className="flex items-center">
                              {upload.fileName}
                              {isProcessing && (
                                <div className="ml-2 flex items-center">
                                  <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-green-500 rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-white">
                            <div className="flex items-center">
                              <span className={isProcessing ? 'animate-pulse text-green-300' : ''}>
                                {upload.processedRows || 0}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              {isProcessing ? (
                                <div className="flex items-center">
                                  <div className="flex space-x-1">
                                    <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                  </div>
                                </div>
                              ) : (
                                <span
                                  className={`${
                                    upload.status === "completed"
                                      ? "text-green-500"
                                      : upload.status === "failed"
                                      ? "text-red-500"
                                      : upload.status === "completed_with_errors"
                                      ? "text-orange-500"
                                      : "text-gray-300"
                                  }`}
                                >
                                  {upload.status.charAt(0).toUpperCase() + upload.status.slice(1).replace(/_/g, ' ')}
                                  {(upload.status === "completed_with_errors" || upload.status === "failed") && (
                                    <button 
                                      className="ml-2 text-blue-400 hover:text-blue-300 focus:outline-none"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewErrors(upload.id);
                                      }}
                                      title="View errors"
                                    >
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                  )}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-white">
                            {formatDate(upload.createdAt)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-white">
                            {formatTime(upload.createdAt)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                className="text-red-500 hover:text-red-400 transition-colors"
                                onClick={(e) => handleDeleteCsv(upload.id, e)}
                                title="Delete CSV"
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!isLoadingUploads && csvTotalPages > 1 && (
              <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
                <div>Showing {((csvPage - 1) * 10) + 1} to {Math.min(csvPage * 10, filteredCsvUploads.length)} of {filteredCsvUploads.length}</div>
                <div className="flex items-center">
                  <button 
                    className="w-8 h-8 bg-[#1A1E24] rounded-full flex items-center justify-center mr-2"
                    onClick={() => setCsvPage(Math.max(1, csvPage - 1))}
                    disabled={csvPage === 1}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15 18L9 12L15 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  {Array.from({ length: Math.min(5, csvTotalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button 
                        key={pageNum}
                        className={`w-8 h-8 ${csvPage === pageNum ? 'bg-[#A365FF] text-white' : 'bg-[#1A1E24]'} rounded-full flex items-center justify-center mr-2`}
                        onClick={() => setCsvPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button 
                    className="w-8 h-8 bg-[#1A1E24] rounded-full flex items-center justify-center"
                    onClick={() => setCsvPage(Math.min(csvTotalPages, csvPage + 1))}
                    disabled={csvPage === csvTotalPages}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 6L15 12L9 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
                <button 
                  className="px-4 py-1 bg-[#1A1E24] rounded-md"
                  onClick={() => setCsvPage(Math.min(csvTotalPages, csvPage + 1))}
                  disabled={csvPage === csvTotalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "revenue" && (
        <div className="rounded-lg">          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Revenue */}
            <div className="bg-[#1A1E24] p-5 rounded-lg">
              <div className="flex flex-col">
                <span className="text-gray-400 text-base mb-2">Total Revenue</span>
                {isLoadingCsvSummary ? (
                  <div className="animate-pulse h-10 bg-gray-700 rounded w-32"></div>
                ) : (
                  <span className="text-white text-4xl font-extrabold">{formatCurrency(csvSummary?.totalRevenue || 0)}</span>
                )}
              </div>
            </div>

            {/* Total Music */}
            <div className="bg-[#1A1E24] p-4 rounded-lg shadow">
              <div className="flex flex-col">
                <span className="text-gray-400 text-base mb-2">Total Music</span>
                <span className="text-white text-4xl font-extrabold">{csvSummary?.totalMusic?.toLocaleString() || 0}</span>
              </div>
            </div>

            {/* Total Royalty */}
            <div className="bg-[#1A1E24] p-4 rounded-lg shadow">
              <div className="flex flex-col">
                <span className="text-gray-400 text-base mb-2">Total Royalty</span>
                <span className="text-white text-4xl font-extrabold">${csvSummary?.totalRoyalty?.toLocaleString() || 0}</span>
              </div>
            </div>

            {/* Total Videos */}
            <div className="bg-[#1A1E24] p-5 rounded-lg">
              <div className="flex flex-col">
                <span className="text-gray-400 text-base mb-2">Total Videos</span>
                {isLoadingCsvSummary ? (
                  <div className="animate-pulse h-10 bg-gray-700 rounded w-32"></div>
                ) : (
                  <span className="text-white text-4xl font-extrabold">{csvSummary?.totalVideos?.toLocaleString() || 0}</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Platform Pie Chart */}
            <div className="p-4 rounded-md bg-[#161A1F]">
              <div className=" px-4 py-2 rounded-md flex justify-between items-center mb-4">
                <h3 className="text-white font-medium">Top Platform</h3>
                <select
                  className="bg-[#1A1E25] border border-gray-700 text-gray-300 text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  defaultValue="allTime"
                >
                  <option value="allTime">All Time</option>
                  <option value="thisYear">This Year</option>
                  <option value="lastMonth">Last Month</option>
                </select>
              </div>

              {/* Pie Chart */}
              <div className="p-4 rounded-md">
                {isLoadingCsvSummary ? (
                  <div className="flex items-center justify-center">
                    <div className="w-32 h-32 flex items-center justify-center">
                      <div className="animate-pulse h-24 w-24 bg-gray-700 rounded-full"></div>
                    </div>
                  </div>
                ) : csvSummary?.platformData && csvSummary.platformData.length > 0 ? (
                  <div className="flex flex-row items-center justify-between space-x-8">
                    {/* Legend/texts left */}
                    <div className="flex-1 w-1/2 space-y-3 max-w-xs">
                      {csvSummary.platformData.map((platform: {platform: string; percentage: number}, index: number) => {
                        const colors = ['#8A85FF', '#6AE398', '#FFB963', '#00C2FF'];
                        return (
                          <div key={index} className="flex items-center justify-between px-3 py-2 bg-[#1A1E25] rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-4 h-4 rounded-full flex-shrink-0"
                                style={{ backgroundColor: colors[index] }}
                              ></div>
                              <div className="text-gray-300 text-sm font-medium">
                                {platform.platform}
                              </div>
                            </div>
                            <div className="text-white text-sm font-bold">
                              {platform.percentage}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Pie right */}
                    <div className="relative w-60 h-60 flex-shrink-0">
                      <div
                        className="w-full h-full rounded-full"
                        style={{
                          background: generateConicGradient(csvSummary.platformData),
                        }}
                      >
                        {/* Center hollow */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-20 h-20 rounded-full bg-[#1A1E25] flex items-center justify-center">
              
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // No data available message
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="text-center">
                      <div className="text-gray-400 mb-2">No platform data available</div>
                      <div className="text-gray-500 text-sm">Upload CSV files to see platform distribution</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Revenue Growth Per Year Bar Chart */}
            <div className="p-4 rounded-md bg-[#161A1F]">
              <div className=" px-4 py-2 rounded-md mb-4">
                <h3 className="text-white font-medium">Revenue Growth Per Year</h3>
              </div>

              {/* Bar Chart */}
              <div className="h-72 p-4">
                {isLoadingCsvSummary ? (
                  <div className="flex h-full w-full justify-between items-end px-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex flex-col items-center justify-end h-full">
                        <div className="animate-pulse h-4 bg-gray-700 rounded w-8 mb-2"></div>
                        <div className="w-12 animate-pulse bg-gray-700 h-[30%] rounded-t-md"></div>
                        <div className="animate-pulse h-4 bg-gray-700 rounded w-8 mt-2"></div>
                      </div>
                    ))}
                  </div>
                ) : csvSummary?.yearlyRevenueData && csvSummary.yearlyRevenueData.length > 0 ? (
                  <div className="flex h-full w-full justify-between items-end px-6">
                    {/* Find the max revenue for scaling */}
                    {(() => {
                      const maxRevenue = Math.max(...csvSummary.yearlyRevenueData.map((d: {year: string; revenue: number}) => d.revenue));
                      
                      return csvSummary.yearlyRevenueData.map((yearData: {year: string; revenue: number}, index: number) => {
                        // Calculate height percentage based on revenue
                        const heightPercentage = maxRevenue > 0 ? (yearData.revenue / maxRevenue) * 80 : 0;
                        
                        return (
                          <div key={index} className="flex flex-col items-center justify-end h-full">
                            <div className="text-white text-xs mb-2">
                              {formatCurrency(yearData.revenue).replace('$', '')}
                            </div>
                            <div className="w-12 bg-[#A365FF] rounded-t-md relative" style={{ height: `${heightPercentage}%` }}>
                            </div>
                            <div className="text-gray-400 text-xs mt-2">{yearData.year}</div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <div className="flex h-full w-full justify-center items-center px-6">
                    <div className="text-center">
                      <div className="text-gray-400 mb-2">No yearly revenue data available</div>
                      <div className="text-gray-500 text-sm">Upload CSV files to see revenue growth trends</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          transaction={selectedTransaction}
        />
      )}

      {/* CSV Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div className="bg-[#1A1E24] rounded-lg shadow-xl w-full max-w-2xl mx-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-xl font-medium text-white">
                Error Details
              </h3>
              <button
                onClick={handleCloseErrorModal}
                className="text-gray-400 hover:text-white focus:outline-none"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-[#161A1F] p-4 rounded-md max-h-96 overflow-y-auto">
                <pre className="text-red-400 whitespace-pre-wrap break-words text-sm">
                  {selectedCsvError?.split('\n').map((line, i) => (
                    <div key={`error-line-${i}`} className="mb-2">{line}</div>
                  ))}
                </pre>
              </div>
              <div className="mt-6 flex justify-between">
                <p className="text-gray-400 text-sm">
                  These errors prevented some rows from being processed correctly. The successfully processed rows have still been imported.
                </p>
                <button
                  onClick={handleCloseErrorModal}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && transactionToDelete && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div className="bg-[#1A1E24] rounded-lg shadow-xl w-full max-w-md mx-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-xl font-medium text-white">
                Delete Transaction
              </h3>
              <button
                onClick={cancelSingleDelete}
                className="text-gray-400 hover:text-white focus:outline-none"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this transaction? This action cannot be undone.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={confirmSingleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors mr-2 flex items-center"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : 'Delete'}
                </button>
                <button
                  onClick={cancelSingleDelete}
                  className="px-4 py-2 bg-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div className="bg-[#1A1E24] rounded-lg shadow-xl w-full max-w-md mx-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-xl font-medium text-white">
                Delete Selected Transactions
              </h3>
              <button
                onClick={cancelBulkDelete}
                className="text-gray-400 hover:text-white focus:outline-none"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete <span className="font-bold">{selectedTransactions.size}</span> selected transactions? This action cannot be undone.
              </p>
              
              <div className="flex justify-end">
                <button
                  onClick={confirmBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors mr-2 flex items-center"
                  disabled={isBulkDeleting}
                >
                  {isBulkDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : 'Delete All'}
                </button>
                <button
                  onClick={cancelBulkDelete}
                  className="px-4 py-2 bg-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV Delete Confirmation Modal */}
      {showCsvDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div className="bg-[#1A1E24] rounded-lg shadow-xl w-full max-w-md mx-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-xl font-medium text-white">
                Delete CSV
              </h3>
              <button
                onClick={cancelCsvDelete}
                className="text-gray-400 hover:text-white focus:outline-none"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this CSV file? This action cannot be undone.
              </p>
              
              <div className="flex justify-end">
                <button
                  onClick={confirmCsvDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors mr-2 flex items-center"
                  disabled={isCsvDeleting}
                >
                  {isCsvDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : 'Delete'}
                </button>
                <button
                  onClick={cancelCsvDelete}
                  className="px-4 py-2 bg-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}