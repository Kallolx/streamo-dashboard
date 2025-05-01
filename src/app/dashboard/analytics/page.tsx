"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { 
  getCsvUploads, 
  getTransactionsForCsv, 
  CsvUpload,
  Transaction
} from "@/services/royaltyService";
import { extractCsvSummary } from "@/services/csvAnalyticsService";

export default function AnalyticsPage() {
  const [performanceTimeframe, setPerformanceTimeframe] = useState("thisMonth");
  const [countriesTimeframe, setCountriesTimeframe] = useState("thisMonth");
  const [showPerformanceDropdown, setShowPerformanceDropdown] = useState(false);
  const [showCountriesDropdown, setShowCountriesDropdown] = useState(false);
  
  // New state variables for CSV data
  const [csvUploads, setCsvUploads] = useState<CsvUpload[]>([]);
  const [selectedCsvId, setSelectedCsvId] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingCsv, setIsLoadingCsv] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Analytics data
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalMusic, setTotalMusic] = useState(0);
  const [totalVideos, setTotalVideos] = useState(0);
  const [totalRoyalty, setTotalRoyalty] = useState(0);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [countryData, setCountryData] = useState<any[]>([]);
  const [platformData, setPlatformData] = useState<any[]>([]);
  const [yearlyRevenueData, setYearlyRevenueData] = useState<any[]>([]);
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [topArtists, setTopArtists] = useState<any[]>([]);

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

  // Load CSV uploads on component mount
  useEffect(() => {
    const loadCsvUploads = async () => {
      try {
        setIsLoadingCsv(true);
        const uploads = await getCsvUploads();
        setCsvUploads(uploads);
        
        // Auto-select the first CSV if available
        if (uploads.length > 0) {
          setSelectedCsvId(uploads[0].id);
        }
      } catch (error) {
        console.error('Error loading CSV uploads:', error);
      } finally {
        setIsLoadingCsv(false);
      }
    };

    loadCsvUploads();
  }, []);

  // Load transactions when a CSV is selected
  useEffect(() => {
    if (!selectedCsvId) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }
    
    const loadTransactionsAndAnalytics = async () => {
      try {
        setIsLoading(true);
        setIsLoadingTransactions(true);
        
        // Fetch transactions for the selected CSV
        const transactionData = await getTransactionsForCsv(selectedCsvId);
        setTransactions(transactionData);
        
        // Process analytics data
        processAnalyticsData(transactionData);
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setIsLoadingTransactions(false);
        setIsLoading(false);
      }
    };

    loadTransactionsAndAnalytics();
  }, [selectedCsvId]);

  // Process transactions into analytics data
  const processAnalyticsData = (transactions: Transaction[]) => {
    if (!transactions || transactions.length === 0) {
      return;
    }
    
    // Process total stats
    let uniqueTracks = new Set<string>();
    let uniqueArtists = new Set<string>();
    let totalStreams = 0;
    let totalRevenue = 0;
    
    // Map for platforms, countries, artists, tracks
    const platformMap = new Map<string, {streams: number, revenue: number}>();
    const countryMap = new Map<string, {streams: number, revenue: number}>();
    const artistMap = new Map<string, {streams: number, revenue: number, tracks: Set<string>}>();
    const trackMap = new Map<string, {artist: string, streams: number, revenue: number}>();
    
    // Process each transaction
    transactions.forEach(transaction => {
      const { title, artist, serviceType, territory, quantity, revenueUSD } = transaction;
      
      // Count unique tracks and artists
      if (title) uniqueTracks.add(title);
      if (artist) uniqueArtists.add(artist);
      
      // Sum up streams and revenue
      totalStreams += quantity || 0;
      totalRevenue += revenueUSD || 0;
      
      // Process platform data
      const platform = serviceType || 'Unknown';
      if (!platformMap.has(platform)) {
        platformMap.set(platform, {streams: 0, revenue: 0});
      }
      const platformData = platformMap.get(platform)!;
      platformData.streams += quantity || 0;
      platformData.revenue += revenueUSD || 0;
      
      // Process country data
      const country = territory || 'Unknown';
      if (!countryMap.has(country)) {
        countryMap.set(country, {streams: 0, revenue: 0});
      }
      const countryData = countryMap.get(country)!;
      countryData.streams += quantity || 0;
      countryData.revenue += revenueUSD || 0;
      
      // Process artist data
      const artistName = artist || 'Unknown';
      if (!artistMap.has(artistName)) {
        artistMap.set(artistName, {streams: 0, revenue: 0, tracks: new Set()});
      }
      const artistData = artistMap.get(artistName)!;
      artistData.streams += quantity || 0;
      artistData.revenue += revenueUSD || 0;
      if (title) artistData.tracks.add(title);
      
      // Process track data
      const trackName = title || 'Unknown';
      if (!trackMap.has(trackName)) {
        trackMap.set(trackName, {artist: artist || 'Unknown', streams: 0, revenue: 0});
      }
      const trackData = trackMap.get(trackName)!;
      trackData.streams += quantity || 0;
      trackData.revenue += revenueUSD || 0;
    });
    
    // Set analytics values
    setTotalUsers(uniqueArtists.size);
    setTotalMusic(uniqueTracks.size);
    setTotalVideos(Math.round(uniqueTracks.size * 0.1)); // Estimate videos as 10% of tracks
    setTotalRoyalty(totalRevenue);
    
    // Process performance data (using months)
    const monthsData = createMonthlyPerformanceData(transactions);
    setPerformanceData(monthsData);
    
    // Process country data
    const countries = Array.from(countryMap.entries()).map(([country, data]) => ({
      country,
      percentage: totalStreams > 0 ? (data.streams / totalStreams) * 100 : 0,
      streams: data.streams,
      revenue: data.revenue
    })).sort((a, b) => b.percentage - a.percentage);
    setCountryData(countries);
    
    // Process platform data
    const platforms = Array.from(platformMap.entries()).map(([platform, data]) => ({
      platform,
      percentage: totalStreams > 0 ? (data.streams / totalStreams) * 100 : 0,
      streams: data.streams,
      revenue: data.revenue
    })).sort((a, b) => b.percentage - a.percentage);
    setPlatformData(platforms);
    
    // Create yearly revenue data
    const yearData = createYearlyRevenueData(transactions);
    setYearlyRevenueData(yearData);
    
    // Process top tracks
    const topTracks = Array.from(trackMap.entries()).map(([title, data]) => ({
      title,
      artist: data.artist,
      streams: data.streams,
      revenue: data.revenue
    })).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    setTopTracks(topTracks);
    
    // Process top artists
    const topArtists = Array.from(artistMap.entries()).map(([name, data]) => ({
      name,
      tracks: data.tracks.size,
      streams: data.streams,
      revenue: data.revenue
    })).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    setTopArtists(topArtists);
  };
  
  // Create monthly performance data
  const createMonthlyPerformanceData = (transactions: Transaction[]) => {
    const monthMap = new Map<string, {revenue: number, streams: number}>();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize all months with 0
    months.forEach(month => {
      monthMap.set(month, {revenue: 0, streams: 0});
    });
    
    // Process each transaction
    transactions.forEach(transaction => {
      const date = new Date(transaction.transactionDate);
      if (!isNaN(date.getTime())) {
        const month = months[date.getMonth()];
        const data = monthMap.get(month)!;
        data.revenue += transaction.revenueUSD || 0;
        data.streams += transaction.quantity || 0;
      }
    });
    
    // Convert to array format
    return months.map(month => ({
      month,
      revenue: monthMap.get(month)!.revenue,
      streams: monthMap.get(month)!.streams
    }));
  };
  
  // Create yearly revenue data
  const createYearlyRevenueData = (transactions: Transaction[]) => {
    const yearMap = new Map<string, number>();
    const currentYear = new Date().getFullYear();
    
    // Initialize years from 2020 to current year + 1
    for (let year = 2020; year <= currentYear + 1; year++) {
      yearMap.set(year.toString(), 0);
    }
    
    // Process each transaction
    transactions.forEach(transaction => {
      const date = new Date(transaction.transactionDate);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear().toString();
        if (yearMap.has(year)) {
          yearMap.set(year, (yearMap.get(year) || 0) + (transaction.revenueUSD || 0));
        }
      }
    });
    
    // Convert to array format
    return Array.from(yearMap.entries()).map(([year, revenue]) => ({
      year,
      revenue
    }));
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

  return (
    <DashboardLayout title="Analytics" subtitle="Track your music performance">
      <div className="p-4 sm:p-8 rounded-lg">
        {/* CSV Selector */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-white font-medium">Select CSV to Analyze</h3>
            <div className="relative w-full sm:w-64">
              <select
                className="bg-[#232830] text-gray-300 px-3 py-2 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={selectedCsvId}
                onChange={(e) => setSelectedCsvId(e.target.value)}
                disabled={isLoadingCsv || isLoadingTransactions}
              >
                <option value="">Select a CSV file</option>
                {csvUploads.map((upload) => (
                  <option key={upload.id} value={upload.id}>
                    {upload.fileName} ({new Date(upload.createdAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
              {isLoadingCsv && (
                <div className="absolute right-3 top-2.5">
                  <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-purple-500 rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {/* Total Users (Artists) */}
              <div className="bg-[#1A1E24] p-5 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm mb-2">Total Artists</span>
                  <div className="flex items-center justify-between">
                    <span className="text-white text-2xl font-bold">{totalUsers || 0}</span>
                    <div className="h-8 w-8 bg-[#232830] rounded-full flex items-center justify-center text-[#A365FF]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Music (Tracks) */}
              <div className="bg-[#1A1E24] p-5 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm mb-2">Total Tracks</span>
                  <div className="flex items-center justify-between">
                    <span className="text-white text-2xl font-bold">{totalMusic || 0}</span>
                    <div className="h-8 w-8 bg-[#232830] rounded-full flex items-center justify-center text-[#A365FF]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Streams */}
              <div className="bg-[#1A1E24] p-5 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm mb-2">Total Streams</span>
                  <div className="flex items-center justify-between">
                    <span className="text-white text-2xl font-bold">{transactions.reduce((sum, t) => sum + (t.quantity || 0), 0).toLocaleString()}</span>
                    <div className="h-8 w-8 bg-[#232830] rounded-full flex items-center justify-center text-[#A365FF]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="2" width="20" height="20" rx="2.18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 9l5 3-5 3V9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Royalty */}
              <div className="bg-[#1A1E24] p-5 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm mb-2">Total Royalty</span>
                  <div className="flex items-center justify-between">
                    <span className="text-white text-2xl font-bold">{formatCurrency(totalRoyalty || 0)}</span>
                    <div className="h-8 w-8 bg-[#232830] rounded-full flex items-center justify-center text-[#A365FF]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
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
              {/* Top Platform Pie Chart */}
              <div className="p-4 rounded-md bg-[#161A1F]">
                <div className="px-4 py-2 rounded-md flex justify-between items-center mb-4">
                  <h3 className="text-white font-medium">Top Platform</h3>
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

                {/* Pie Chart */}
                <div className="flex items-center justify-center p-2 sm:p-4 rounded-md overflow-hidden">
                  <div className="flex items-center justify-center w-full">
                    {/* Left column labels */}
                    <div className="flex flex-col space-y-3 pr-2 sm:pr-4 text-right w-1/3">
                      {platformData.slice(0, 2).map((platform, index) => {
                        const colors = ['#8A85FF', '#6AE398'];
                        
                        return (
                          <div key={index} className="flex items-center justify-end">
                            <span className="text-white text-xs sm:text-sm mr-2">{platform.platform} <span className="font-medium">{platform.percentage.toFixed(0)}%</span></span>
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: colors[index] }}
                            ></div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Donut chart */}
                    <div className="relative w-32 h-32 sm:w-44 sm:h-44 mx-1 sm:mx-2">
                      {/* Dynamic conic gradient from real platform data */}
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: generateConicGradient(),
                          clipPath: "circle(50% at center)",
                        }}
                      >
                        {/* Center hollow */}
                        <div className="absolute inset-[25%] rounded-full bg-[#1A1E25]"></div>
                      </div>
                    </div>
                    
                    {/* Right column labels */}
                    <div className="flex flex-col space-y-3 pl-2 sm:pl-4 w-1/3">
                      {platformData.slice(2, 4).map((platform, index) => {
                        const colors = ['#FFB963', '#00C2FF'];
                        
                        return (
                          <div key={index} className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: colors[index] }}
                            ></div>
                            <span className="text-white text-xs sm:text-sm"><span className="font-medium">{platform.percentage.toFixed(0)}%</span> {platform.platform}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Growth Per Year Bar Chart */}
              <div className="p-4 rounded-md bg-[#161A1F]">
                <div className="px-4 py-2 rounded-md mb-4">
                  <h3 className="text-white font-medium">Revenue Growth Per Year</h3>
                </div>

                {/* Bar Chart */}
                <div className="h-60 sm:h-72 p-2 sm:p-4">
                  <div className="flex h-full w-full justify-between items-end px-2 sm:px-6">
                    {yearlyRevenueData.slice(0, 6).map((yearData, index) => {
                      // Calculate height percentage (max 90%)
                      const maxRevenue = Math.max(...yearlyRevenueData.map(d => d.revenue));
                      const heightPercentage = maxRevenue > 0 
                        ? Math.min(90, (yearData.revenue / maxRevenue) * 90) 
                        : 0;
                      
                      return (
                        <div key={index} className="flex flex-col items-center justify-end h-full">
                          <div className="text-white text-xs mb-1 sm:mb-2">
                            {formatCurrency(yearData.revenue).replace('$', '')}
                          </div>
                          <div 
                            className="w-6 sm:w-12 bg-[#A365FF] rounded-t-md relative"
                            style={{ height: `${heightPercentage || 5}%` }}
                          >
                          </div>
                          <div className="text-gray-400 text-xs mt-1 sm:mt-2">{yearData.year}</div>
                        </div>
                      );
                    })}
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
                      {topTracks.map((track, index) => (
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
                      {topArtists.map((artist, index) => (
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
        )}
      </div>
    </DashboardLayout>
  );
} 