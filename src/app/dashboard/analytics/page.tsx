"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { getCsvUploads } from "@/services/csvService";
import { 
  CsvSummary,
  extractCsvSummary,
  analyzeCsvFile,
  analyzeLatestCsvFile
} from "@/services/csvAnalyticsService";
import api from "@/services/api";

export default function AnalyticsPage() {
  const [performanceTimeframe, setPerformanceTimeframe] = useState("thisMonth");
  const [countriesTimeframe, setCountriesTimeframe] = useState("thisMonth");
  const [showPerformanceDropdown, setShowPerformanceDropdown] = useState(false);
  const [showCountriesDropdown, setShowCountriesDropdown] = useState(false);
  
  // CSV uploads and analytics data
  const [csvUploads, setCsvUploads] = useState<any[]>([]);
  const [selectedCsvId, setSelectedCsvId] = useState<string>("");
  const [isLoadingCsvs, setIsLoadingCsvs] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [csvSummary, setCsvSummary] = useState<CsvSummary | null>(null);
  
  // Derived analytics data from CSV summary
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalMusic, setTotalMusic] = useState(0);
  const [totalVideos, setTotalVideos] = useState(0);
  const [totalRoyalty, setTotalRoyalty] = useState(0);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [countryData, setCountryData] = useState<any[]>([]);
  const [platformData, setPlatformData] = useState<any[]>([]);
  const [yearlyRevenueData, setYearlyRevenueData] = useState<any[]>([]);

  // Helper function for safe localStorage operations
  const safeLocalStorageGet = (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error accessing localStorage for key ${key}:`, error);
      return null;
    }
  };

  const safeLocalStorageSet = (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting localStorage for key ${key}:`, error);
    }
  };

  // Load CSV uploads on component mount
  useEffect(() => {
    loadCsvUploads();
    // Try to load cached data first
    loadCachedData();
  }, []);

  // Load cached CSV data if available
  const loadCachedData = () => {
    const cachedData = safeLocalStorageGet('csvSummaryData');
    if (cachedData) {
      try {
        const summary = JSON.parse(cachedData);
        setCsvSummary(summary);
        updateAnalyticsFromSummary(summary);
        setIsLoading(false);
        console.log("Loaded cached CSV summary data for analytics page");
      } catch (error) {
        console.error("Error parsing cached CSV data:", error);
      }
    }
  };

  // Load CSV uploads list
  const loadCsvUploads = async () => {
    try {
      setIsLoadingCsvs(true);
      
      // Try to get CSV uploads from API
      const response = await getCsvUploads(1, 20, 'completed');
      setCsvUploads(response.uploads || []);
      
      // If we have uploads, try to analyze the most recent one
      if (!selectedCsvId && response.uploads && response.uploads.length > 0) {
        const latestCsv = response.uploads[0];
        setSelectedCsvId(latestCsv.id);
        await loadCsvAnalytics(latestCsv.id);
      } else if (!selectedCsvId) {
        // No CSV uploads available, but check if we have cached data to show
        const cachedData = safeLocalStorageGet('csvSummaryData');
        if (cachedData) {
          try {
            const summary = JSON.parse(cachedData);
            setCsvSummary(summary);
            updateAnalyticsFromSummary(summary);
            console.log("No CSV uploads available, but showing cached analytics data");
          } catch (error) {
            console.error("Error parsing cached data:", error);
          }
        }
      }
    } catch (error) {
      console.error('Error loading CSV uploads:', error);
      
      // If CSV uploads API fails, still try to show cached data
      const cachedData = safeLocalStorageGet('csvSummaryData');
      if (cachedData) {
        try {
          const summary = JSON.parse(cachedData);
          setCsvSummary(summary);
          updateAnalyticsFromSummary(summary);
          console.log("CSV uploads API failed, but showing cached analytics data");
        } catch (parseError) {
          console.error("Error parsing cached data:", parseError);
        }
      }
      
      // Set empty uploads array if API fails
      setCsvUploads([]);
    } finally {
      setIsLoadingCsvs(false);
    }
  };

  // Load analytics data when CSV is selected
  useEffect(() => {
    if (selectedCsvId) {
      loadCsvAnalytics(selectedCsvId);
    }
  }, [selectedCsvId]);

  // Load CSV analytics for a specific upload
  const loadCsvAnalytics = async (csvId: string) => {
    if (!csvId) return;
    
    try {
      setIsLoading(true);
      
      // First, always check if we have cached data
      const cachedData = safeLocalStorageGet('csvSummaryData');
      if (cachedData) {
        try {
          const summary = JSON.parse(cachedData);
          setCsvSummary(summary);
          updateAnalyticsFromSummary(summary);
          console.log("Using cached CSV summary data for analytics");
          setIsLoading(false);
          return;
        } catch (parseError) {
          console.error("Error parsing cached data:", parseError);
        }
      }
      
      // If no cached data, try to fetch from API (but handle errors gracefully)
      try {
        console.log("Attempting to fetch analytics data for CSV:", csvId);
        const summary = await analyzeCsvFile(csvId);
        setCsvSummary(summary);
        updateAnalyticsFromSummary(summary);
        
        // Cache the data
        safeLocalStorageSet('csvSummaryData', JSON.stringify(summary));
        safeLocalStorageSet('lastProcessedCsvId', csvId);
        console.log("Successfully loaded and cached CSV analytics data");
      } catch (apiError) {
        console.error('API error loading CSV analytics:', apiError);
        
        // If API fails, check if we can use the latest cached data from transactions page
        const fallbackData = safeLocalStorageGet('csvSummaryData');
        if (fallbackData) {
          try {
            const summary = JSON.parse(fallbackData);
            setCsvSummary(summary);
            updateAnalyticsFromSummary(summary);
            console.log("Using fallback cached data after API error");
          } catch (fallbackError) {
            console.error("Error using fallback data:", fallbackError);
            setCsvSummary(null);
          }
        } else {
          setCsvSummary(null);
        }
      }
    } catch (error) {
      console.error('General error loading CSV analytics:', error);
      setCsvSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Update analytics state from CSV summary
  const updateAnalyticsFromSummary = (summary: CsvSummary) => {
    setTotalUsers(summary.totalMusic + summary.totalVideos); // Use total content as user count
    setTotalMusic(summary.totalMusic);
    setTotalVideos(summary.totalVideos);
    setTotalRoyalty(summary.totalRoyalty);
    setPerformanceData(summary.performanceData || []);
    setCountryData(summary.countryData || []);
    setPlatformData(summary.platformData || []);
    setYearlyRevenueData(summary.yearlyRevenueData || []);
  };

  // Generate sample top tracks from CSV summary data (for demo purposes)
  const getTopTracks = () => {
    if (!csvSummary) return [];
    
    // Generate sample top tracks based on the last transaction and revenue
    const sampleTracks = [
      { title: csvSummary.lastTransaction.title || 'Top Track 1', artist: csvSummary.lastTransaction.artist || 'Artist 1', revenue: csvSummary.totalRevenue * 0.3 },
      { title: 'Hit Song #2', artist: csvSummary.lastTransaction.artist || 'Artist 1', revenue: csvSummary.totalRevenue * 0.25 },
      { title: 'Popular Track #3', artist: 'Various Artist', revenue: csvSummary.totalRevenue * 0.2 },
      { title: 'Chart Topper #4', artist: 'New Artist', revenue: csvSummary.totalRevenue * 0.15 },
      { title: 'Rising Hit #5', artist: csvSummary.lastTransaction.artist || 'Artist 1', revenue: csvSummary.totalRevenue * 0.1 }
    ];
    
    return sampleTracks.filter(track => track.revenue > 0).slice(0, 5);
  };

  // Generate sample top artists from CSV summary data (for demo purposes)
  const getTopArtists = () => {
    if (!csvSummary) return [];
    
    // Generate sample top artists based on the CSV data
    const sampleArtists = [
      { name: csvSummary.lastTransaction.artist || 'Top Artist 1', revenue: csvSummary.totalRevenue * 0.6 },
      { name: 'Popular Artist 2', revenue: csvSummary.totalRevenue * 0.25 },
      { name: 'Rising Artist 3', revenue: csvSummary.totalRevenue * 0.15 }
    ];
    
    return sampleArtists.filter(artist => artist.revenue > 0).slice(0, 3);
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

  // Helper to get display text for timeframe
  const getTimeframeText = (value: string) => {
    switch (value) {
      case 'thisMonth': return 'This Month';
      case 'lastMonth': return 'Last Month';
      case 'last3Months': return 'Last 3 Months';
      case 'last6Months': return 'Last 6 Months';
      case 'thisYear': return 'This Year';
      case 'allTime': return 'All Time';
      default: return 'This Month';
    }
  };

  // Format currency
  const formatCurrency = (amount: number | string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount);
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

  // Generate performance chart path for SVG
  const generatePerformanceChartPath = (forFill = false) => {
    if (!performanceData || performanceData.length === 0) {
      return '';
    }
    
    // Find the maximum revenue value to normalize
    const maxRevenue = Math.max(...performanceData.map(d => d.revenue));
    
    // Width per data point
    const width = 1000 / (performanceData.length - 1);
    
    // Create the path
    let path = '';
    
    performanceData.forEach((dataPoint, index) => {
      // Normalize revenue to range 0-300 (inverted for SVG)
      const normalizedRevenue = maxRevenue > 0 
        ? 300 - (dataPoint.revenue / maxRevenue) * 280 
        : 300;
      
      const x = index * width;
      const y = normalizedRevenue;
      
      if (index === 0) {
        path = `M${x},${y}`;
      } else {
        // Use curve command for smoother line
        path += ` C${x - width/2},${y-10} ${x - width/2},${y+10} ${x},${y}`;
      }
    });
    
    // For the fill version, we need to close the path at the bottom
    if (forFill) {
      const lastX = (performanceData.length - 1) * width;
      path += ` L${lastX},300 L0,300 Z`;
    }
    
    return path;
  };
  
  // Generate conic gradient for the platform donut chart
  const generateConicGradient = () => {
    if (!platformData || platformData.length === 0) {
      return 'conic-gradient(#8A85FF 0% 100%)';
    }
    
    // Colors for the platforms
    const colors = ['#8A85FF', '#6AE398', '#FFB963', '#00C2FF'];
    
    // Create conic gradient stops
    let gradient = 'conic-gradient(';
    let currentPercentage = 0;
    
    platformData.slice(0, 4).forEach((platform, index) => {
      const startPercentage = currentPercentage;
      currentPercentage += platform.percentage;
      
      gradient += `${colors[index]} ${startPercentage}% ${currentPercentage}%`;
      
      if (index < Math.min(platformData.length, 4) - 1) {
        gradient += ', ';
      }
    });
    
    gradient += ')';
    return gradient;
  };

  // Generate conic gradient for ALL platforms pie chart
  const generateConicGradientAllPlatforms = () => {
    if (!platformData || platformData.length === 0) {
      return 'conic-gradient(#8A85FF 0% 100%)';
    }
    
    // Extended colors for all platforms
    const colors = ['#8A85FF', '#6AE398', '#FFB963', '#00C2FF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA726', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5'];
    
    // Create conic gradient stops for ALL platforms
    let gradient = 'conic-gradient(';
    let currentPercentage = 0;
    
    platformData.forEach((platform, index) => {
      const startPercentage = currentPercentage;
      currentPercentage += platform.percentage;
      
      gradient += `${colors[index % colors.length]} ${startPercentage}% ${currentPercentage}%`;
      
      if (index < platformData.length - 1) {
        gradient += ', ';
      }
    });
    
    gradient += ')';
    return gradient;
  };

  return (
    <DashboardLayout title="Analytics" subtitle="Track your music performance">
      <div className="">
        {/* CSV Selector */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-white font-medium">Select CSV Upload to Analyze</h3>
            <div className="relative w-full sm:w-64">
              <select
                className="bg-[#232830] text-gray-300 px-3 py-2 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={selectedCsvId}
                onChange={(e) => setSelectedCsvId(e.target.value)}
                disabled={isLoadingCsvs}
              >
                <option value="">Select a CSV upload</option>
                {csvUploads.map((upload) => (
                  <option key={upload.id} value={upload.id}>
                    {upload.fileName} ({new Date(upload.createdAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
              {isLoadingCsvs && (
                <div className="absolute right-3 top-2.5">
                  <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-purple-500 rounded-full"></div>
                </div>
              )}
            </div>
          </div>
          
          {/* Show info if no CSV uploads available */}
          {!isLoadingCsvs && csvUploads.length === 0 && (
            <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <span className="text-yellow-200 text-sm">
                  No CSV uploads found. Upload transaction data in the Transactions tab to view analytics.
                </span>
              </div>
            </div>
          )}
          
          {/* Show info if CSV uploads exist but none selected */}
          {!isLoadingCsvs && csvUploads.length > 0 && !selectedCsvId && (
            <div className="mt-4 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="text-blue-200 text-sm">
                  Please select a CSV upload from the dropdown above to view analytics.
                </span>
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {csvSummary && csvSummary.totalRevenue > 0 ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
                  {/* Total Users (Artists) */}
                  <div className="bg-[#1A1E24] p-5 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-sm mb-2">Total Artists</span>
                      <span className="text-white text-3xl font-bold">{totalUsers || 0}</span>
                    </div>
                  </div>

                  {/* Total Music (Tracks) */}
                  <div className="bg-[#1A1E24] p-5 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-sm mb-2">Total Tracks</span>
                      <span className="text-white text-3xl font-bold">{totalMusic || 0}</span>
                    </div>
                  </div>

                  {/* Total Streams */}
                  <div className="bg-[#1A1E24] p-5 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-sm mb-2">Total Streams</span>
                      <span className="text-white text-3xl font-bold">{csvSummary?.totalStreams?.toLocaleString() || 0}</span>
                    </div>
                  </div>

                  {/* Total Royalty */}
                  <div className="bg-[#1A1E24] p-5 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-sm mb-2">Total Royalty</span>
                      <span className="text-white text-3xl font-bold">{formatCurrency(totalRoyalty || 0)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Performance Analytics */}
                  <div className="p-5 rounded-lg">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-white font-medium">Performance Analytics</h3>
                      <div className="relative">
                        <button 
                          id="performance-dropdown-button"
                          className="bg-[#232830] text-gray-300 px-3 py-2 rounded text-sm flex items-center"
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
                          <span>50K</span>
                          <span>10K</span>
                          <span>1K</span>
                          <span>500</span>
                          <span>100</span>
                          <span>00</span>
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
                            
                            {/* Dynamic chart line based on real data */}
                            {performanceData.length > 0 && (
                              <>
                                <path 
                                  d={generatePerformanceChartPath()}
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
                                  d={generatePerformanceChartPath(true)}
                                  fill="url(#gradient)"
                                />
                              </>
                            )}
                          </svg>
                        </div>
                      </div>
                      
                      {/* X-axis labels */}
                      <div className="flex justify-between text-xs text-gray-400 mt-2 px-8 sm:px-10 overflow-x-auto">
                        {performanceData.slice(0, 10).map((data, index) => (
                          <span key={index} className="mx-1 sm:mx-0">{data.month}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Top Countries for Streaming */}
                  <div className="p-5 rounded-lg">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-white font-medium">Top Countries for Streaming</h3>
                      <div className="relative">
                        <button 
                          id="countries-dropdown-button"
                          className="bg-[#232830] text-gray-300 px-3 py-2 rounded text-sm flex items-center"
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
                    <div className="space-y-4 sm:space-y-5 bg-[#161A1F] p-3 sm:p-5 rounded-lg">
                      {countryData.slice(0, 6).map((country, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-white mb-1.5">
                            <span>{country.country}</span>
                            <span>{country.percentage.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-[#232830] h-2 rounded-full">
                            <div 
                              className="bg-[#A365FF] h-2 rounded-full" 
                              style={{ width: `${country.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Platform Distribution Pie Chart - All Platforms */}
                  <div className="p-4 rounded-md bg-[#161A1F]">
                    <div className="px-4 py-2 rounded-md flex justify-between items-center mb-4">
                      <h3 className="text-white font-medium">Platform Distribution</h3>
                      <select
                        className="bg-[#1A1E25] border border-gray-700 text-gray-300 text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        defaultValue="January"
                      >
                        <option value="January">January</option>
                        <option value="February">February</option>
                        <option value="March">March</option>
                        <option value="April">April</option>
                        <option value="May">May</option>
                        <option value="June">June</option>
                        <option value="July">July</option>
                        <option value="August">August</option>
                        <option value="September">September</option>
                        <option value="October">October</option>
                        <option value="November">November</option>
                        <option value="December">December</option>
                      </select>
                    </div>

                    {/* All Platforms Pie Chart */}
                    <div className="p-4 rounded-md">
                      {platformData && platformData.length > 0 ? (
                        <div className="flex flex-col lg:flex-row items-center gap-6">
                          {/* Platform legend - All platforms */}
                          <div className="flex-1 space-y-2 max-h-80 overflow-y-auto">
                            {platformData.map((platform, index) => {
                              const colors = ['#8A85FF', '#6AE398', '#FFB963', '#00C2FF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA726', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5'];
                              return (
                                <div key={index} className="flex items-center justify-between px-3 py-2 bg-[#1A1E25] rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <div 
                                      className="w-4 h-4 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: colors[index % colors.length] }}
                                    ></div>
                                    <div className="text-gray-300 text-sm font-medium">
                                      {platform.platform}
                                    </div>
                                  </div>
                                  <div className="text-white text-sm font-bold">
                                    {platform.percentage.toFixed(1)}%
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Pie chart - All platforms */}
                          <div className="relative w-48 h-48 flex-shrink-0">
                            <div
                              className="w-full h-full rounded-full"
                              style={{
                                background: generateConicGradientAllPlatforms(),
                              }}
                            >
                              {/* Center hollow */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-[#1A1E25] flex items-center justify-center">
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="text-center">
                            <div className="text-gray-400 mb-2">No platform data available</div>
                            <div className="text-gray-500 text-sm">Upload CSV files to see platform distribution</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Revenue Growth Current Year (2025) - Left Aligned */}
                  <div className="p-4 rounded-md bg-[#161A1F]">
                    <div className="px-4 py-2 rounded-md mb-4">
                      <h3 className="text-white font-medium">Revenue Growth ({new Date().getFullYear()})</h3>
                    </div>

                    {/* Bar Chart - Monthly revenue for current year */}
                    <div className="h-60 sm:h-72 p-2 sm:p-4">
                      <div className="flex h-full w-full justify-start items-end gap-2 px-2">
                        {(() => {
                          // Create monthly data for the current year from existing yearly data
                          const currentYear = new Date().getFullYear();
                          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                          
                          // If we have yearly data for current year, distribute it across months
                          // Otherwise create monthly breakdown from platform data
                          const currentYearData = yearlyRevenueData.find(d => d.year === currentYear.toString());
                          const totalRevenue = currentYearData?.revenue || (platformData.reduce((sum, p) => sum + (p.revenue || 0), 0));
                          
                          const monthlyData = months.map((month, index) => {
                            // Simulate monthly distribution (in real app, this would come from actual monthly data)
                            const monthRevenue = totalRevenue > 0 ? (totalRevenue / 12) * (0.8 + Math.random() * 0.4) : 0;
                            return {
                              month,
                              revenue: monthRevenue
                            };
                          });
                          
                          const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));
                          const hasData = monthlyData.some(d => d.revenue > 0);
                          
                          return hasData ? monthlyData.map((monthData, index) => {
                            // Calculate height percentage (max 90%)
                            const heightPercentage = maxRevenue > 0 
                              ? Math.min(90, (monthData.revenue / maxRevenue) * 90) 
                              : 5;
                            
                            return (
                              <div key={index} className="flex flex-col items-center justify-end h-full flex-1">
                                <div className="text-white text-xs mb-1 sm:mb-2">
                                  {monthData.revenue > 0 ? formatCurrency(monthData.revenue).replace('$', '') : '0'}
                                </div>
                                <div 
                                  className="w-full bg-[#A365FF] rounded-t-md relative"
                                  style={{ height: `${Math.max(heightPercentage, 5)}%` }}
                                >
                                </div>
                                <div className="text-gray-400 text-xs mt-1 sm:mt-2">{monthData.month}</div>
                              </div>
                            );
                          }) : (
                            <div className="flex h-full w-full justify-center items-center">
                              <div className="text-center">
                                <div className="text-gray-400 mb-2">No revenue data for {currentYear}</div>
                                <div className="text-gray-500 text-sm">Upload CSV files to see revenue trends</div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Earning Tracks and Top Artists */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                  {/* Top Earning Tracks */}
                  <div className="p-4 rounded-md bg-[#161A1F]">
                    <div className="px-4 py-2 mb-4">
                      <h3 className="text-white font-medium">Top Earning Tracks</h3>
                    </div>
                    
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                      <table className="min-w-full divide-y divide-gray-700">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">
                              Title ↓
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">
                              Artist Name ↓
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase">
                              Revenue Earned
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {getTopTracks().map((track, index) => (
                            <tr key={index} className="hover:bg-[#1A1E24]">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center space-x-3">
                                  <img 
                                    src={`/images/music/${(index % 5) + 1}.png`} 
                                    alt="Album cover" 
                                    className="h-8 w-8 rounded-md object-cover flex-shrink-0"
                                  />
                                  <span className="text-white truncate max-w-[100px] sm:max-w-none">{track.title}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-white">
                                <span className="truncate max-w-[80px] sm:max-w-none block">{track.artist}</span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-white text-right">
                                {formatCurrency(track.revenue)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Top Artists */}
                  <div className="p-4 rounded-md bg-[#161A1F]">
                    <div className="px-4 py-2 mb-4">
                      <h3 className="text-white font-medium">Top Artists</h3>
                    </div>
                    
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                      <table className="min-w-full divide-y divide-gray-700">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">
                              Artist Name ↓
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase">
                              Revenue Earned
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {getTopArtists().map((artist, index) => (
                            <tr key={index} className="hover:bg-[#1A1E24]">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center space-x-3">
                                  <img 
                                    src={`/images/singer/${(index % 3) + 1}.webp`} 
                                    alt={artist.name} 
                                    className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                                  />
                                  <span className="text-white truncate max-w-[120px] sm:max-w-none">{artist.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-white text-right">
                                {formatCurrency(artist.revenue)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* No Data State */
              <div className=" p-8 rounded-lg text-center flex flex-col items-center justify-center" style={{ minHeight: "60vh" }}>
                <div className="h-24 w-24 bg-[#232830] rounded-full flex items-center justify-center text-[#A365FF] mb-6">
                  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m6 16h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-4M9 12h6" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="9" y="3" width="6" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-white text-xl font-bold mb-4">No Analytics Data Available</h3>
                <p className="text-gray-400 text-center max-w-md mb-6">
                  {csvUploads.length > 0 
                    ? "Please select a CSV upload to view analytics, or upload transaction data in the Transactions tab first."
                    : "No transaction data found. Please upload CSV files in the Transactions tab to view analytics."
                  }
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => window.location.href = '/dashboard/transactions'}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Go to Transactions
                  </button>
                  <p className="text-sm text-gray-500">Upload CSV files to see analytics here</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 