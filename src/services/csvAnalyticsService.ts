import api from './api';

export interface CsvSummary {
  totalBalance: number;
  lastTransaction: {
    artist: string;
    title: string;
    service: string;
    territory: string;
    date: string;
    amount: number;
  };
  lastStatementPeriod: string;
  totalRevenue: number;
  totalStreams: number;
  performanceData: {
    month: string;
    revenue: number;
    streams: number;
  }[];
  countryData: {
    country: string;
    percentage: number;
  }[];
  platformData: {
    platform: string;
    percentage: number;
  }[];
  yearlyRevenueData: {
    year: string;
    revenue: number;
  }[];
  totalMusic: number;
  totalVideos: number;
  totalRoyalty: number;
}

// Royalty data interface for the royalties page
export interface RoyaltyData {
  id: number;
  track: string;
  artist: string;
  label: string;
  revenue: string;
  labelSplit: string;
  artistSplit: string;
  imageSrc: string;
  territories?: string[];
  services?: string[];
  streams?: number;
}

/**
 * Parse a CSV string into an array of row objects
 * @param csvContent The raw CSV content as a string
 * @returns An array of objects where each object represents a row with column headers as keys
 */
export const parseCSV = (csvContent: string): any[] => {
  // Split by new line and filter out empty lines
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length === 0) {
    return [];
  }
  
  // Extract headers (first row)
  const headers = lines[0].split(',').map(header => header.trim());
  
  // Process data rows
  const results = [];
  for (let i = 1; i < lines.length; i++) {
    // Handle commas within quoted fields
    const values: string[] = [];
    let currentValue = '';
    let inQuotes = false;
    
    for (let char of lines[i]) {
      if (char === '"' && (currentValue === '' || currentValue.endsWith(','))) {
        inQuotes = true;
        currentValue += char;
      } else if (char === '"' && inQuotes) {
        inQuotes = false;
        currentValue += char;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Add the last value
    if (currentValue) {
      values.push(currentValue.trim());
    }
    
    // Create an object mapping headers to values
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length && j < values.length; j++) {
      row[headers[j]] = values[j];
    }
    
    results.push(row);
  }
  
  return results;
};

/**
 * Extract royalty data from CSV content for the royalties page
 * @param csvContent The raw CSV content as a string
 * @returns An array of royalty data objects formatted for the UI
 */
export const extractRoyaltyData = (csvContent: string): RoyaltyData[] => {
  const rows = parseCSV(csvContent);
  
  if (rows.length === 0) {
    return [];
  }
  
  // Group by unique track+artist combinations to combine revenue
  const trackMap = new Map();
  
  rows.forEach(row => {
    const trackKey = `${row['Child Asset Title/Name']}_${row['Artist']}`;
    const revenue = parseFloat(row['Amount Due in USD'] || '0');
    const contractRate = parseFloat(row['Contract Rate %'] || '0');
    const yourShare = parseFloat(row['Your Share %'] || '0');
    const territory = row['Territory'] || '';
    const service = row['Service'] || '';
    const quantity = parseInt(row['Quantity'] || '0', 10);
    
    if (!trackMap.has(trackKey)) {
      trackMap.set(trackKey, {
        track: row['Child Asset Title/Name'],
        artist: row['Artist'],
        label: row['Label'],
        revenue: revenue,
        contractRate: contractRate,
        yourShare: yourShare,
        territories: new Set([territory]),
        services: new Set([service]),
        streams: quantity
      });
    } else {
      // Update existing entry
      const existing = trackMap.get(trackKey);
      existing.revenue += revenue;
      existing.streams += quantity;
      existing.territories.add(territory);
      existing.services.add(service);
    }
  });
  
  // Convert to array format needed for table
  return Array.from(trackMap.values()).map((item, index) => ({
    id: index + 1,
    track: item.track,
    artist: item.artist,
    label: item.label,
    revenue: `$${item.revenue.toFixed(2)}`,
    labelSplit: `${100 - item.contractRate}%`,
    artistSplit: `${item.contractRate}%`,
    imageSrc: `/images/music/${(index % 5) + 1}.png`,  // Cycling through available images
    territories: Array.from(item.territories),
    services: Array.from(item.services),
    streams: item.streams
  }));
};

/**
 * Extract dashboard summary data from CSV content
 * @param csvContent The raw CSV content as a string
 * @returns Summary data for dashboard cards
 */
export const extractCsvSummary = (csvContent: string): CsvSummary => {
  const rows = parseCSV(csvContent);
  
  if (rows.length === 0) {
    return {
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
  }
  
  // Get most recent transaction (assuming rows are sorted by date)
  const mostRecentRow = rows[0];
  
  // Calculate total revenue, streams and balance
  let totalRevenue = 0;
  let totalStreams = 0;
  let latestClosingBalance = 0;
  
  // For performance data tracking - monthly aggregation
  const monthlyData: Record<string, { revenue: number, streams: number }> = {};
  
  // For country data tracking
  const countryData: Record<string, number> = {};
  let totalCountryStreams = 0;
  
  // For platform data tracking
  const platformData: Record<string, number> = {};
  let totalPlatformStreams = 0;
  
  // For yearly revenue data tracking
  const yearlyData: Record<string, number> = {};
  
  // For content type counting
  let musicCount = 0;
  let videoCount = 0;
  let royaltySum = 0;
  
  rows.forEach(row => {
    // Add up total revenue (Amount Due in USD)
    const revenue = parseFloat(row['Amount Due in USD'] || '0');
    if (!isNaN(revenue)) {
      totalRevenue += revenue;
    }
    
    // Add up total streams (Quantity)
    const streams = parseInt(row['Quantity'] || '0');
    if (!isNaN(streams)) {
      totalStreams += streams;
    }
    
    // Get latest closing balance (Closing Balance in USD)
    const balance = parseFloat(row['Closing Balance in USD'] || '0');
    if (!isNaN(balance) && balance > latestClosingBalance) {
      latestClosingBalance = balance;
    }
    
    // Extract month for performance data
    const transactionDate = row['Transaction Month'] || row['Date'] || '';
    let month = 'Unknown';
    let year = 'Unknown';
    
    if (transactionDate) {
      // Try to extract month in format: MM/YYYY or YYYY-MM or similar
      const dateMatches = transactionDate.match(/(\d{1,2})[\/\-](\d{4})|(\d{4})[\/\-](\d{1,2})/);
      if (dateMatches) {
        // Handle both MM/YYYY and YYYY-MM formats
        const monthNum = dateMatches[1] || dateMatches[4];
        year = dateMatches[2] || dateMatches[3];
        
        // Convert month number to abbreviation
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthIndex = parseInt(monthNum) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          month = `${monthNames[monthIndex]} ${year}`;
        }
      }
    }
    
    // Aggregate monthly revenue and streams
    if (!monthlyData[month]) {
      monthlyData[month] = { revenue: 0, streams: 0 };
    }
    monthlyData[month].revenue += revenue;
    monthlyData[month].streams += streams;
    
    // Aggregate yearly revenue
    if (year !== 'Unknown') {
      if (!yearlyData[year]) {
        yearlyData[year] = 0;
      }
      yearlyData[year] += revenue;
    }
    
    // Aggregate country data
    const territory = row['Territory'] || row['Country'] || 'Unknown';
    if (territory !== 'Unknown' && streams > 0) {
      if (!countryData[territory]) {
        countryData[territory] = 0;
      }
      countryData[territory] += streams;
      totalCountryStreams += streams;
    }
    
    // Aggregate platform data
    const platform = row['Service'] || row['Platform'] || 'Unknown';
    if (platform !== 'Unknown' && streams > 0) {
      if (!platformData[platform]) {
        platformData[platform] = 0;
      }
      platformData[platform] += streams;
      totalPlatformStreams += streams;
    }
    
    // Count content type
    const assetType = row['Asset Type'] || row['Content Type'] || '';
    if (assetType.toLowerCase().includes('audio') || assetType.toLowerCase().includes('music')) {
      musicCount++;
    } else if (assetType.toLowerCase().includes('video')) {
      videoCount++;
    }
    
    // Sum up royalties
    const royalty = parseFloat(row['Royalty'] || row['Royalty Amount'] || '0');
    if (!isNaN(royalty)) {
      royaltySum += royalty;
    }
  });
  
  // Convert monthly data to sorted array
  const performanceData = Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      revenue: data.revenue,
      streams: data.streams
    }))
    .sort((a, b) => {
      // Sort by month, assuming format "MMM YYYY"
      const [aMonth, aYear] = a.month.split(' ');
      const [bMonth, bYear] = b.month.split(' ');
      
      if (aYear !== bYear) {
        return parseInt(aYear) - parseInt(bYear);
      }
      
      // Define the month order with explicit type for keys
      const monthOrder: Record<string, number> = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      
      // Safely access month indices with fallbacks
      const aMonthIndex = monthOrder[aMonth] ?? 0;
      const bMonthIndex = monthOrder[bMonth] ?? 0;
      
      return aMonthIndex - bMonthIndex;
    });
  
  // Convert country data to sorted array with percentages
  let countryDataArray = Object.entries(countryData)
    .map(([country, streams]) => ({
      country,
      streams,
      percentage: totalCountryStreams > 0 ? Math.round((streams / totalCountryStreams) * 100) : 0
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 6) // Get top 6 countries
    .map(({ country, percentage }) => ({
      country,
      percentage
    }));
  
  // Convert platform data to sorted array with percentages
  let platformDataArray = Object.entries(platformData)
    .map(([platform, streams]) => ({
      platform,
      streams,
      percentage: totalPlatformStreams > 0 ? Math.round((streams / totalPlatformStreams) * 100) : 0
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 4) // Get top 4 platforms
    .map(({ platform, percentage }) => ({
      platform,
      percentage
    }));
    
  // Convert yearly data to sorted array
  let yearlyRevenueDataArray = Object.entries(yearlyData)
    .map(([year, revenue]) => ({
      year,
      revenue
    }))
    .sort((a, b) => parseInt(a.year) - parseInt(b.year));
  
  // Extract the latest statement period
  const lastStatementPeriod = mostRecentRow['Statement Period'] || 'N/A';
  
  return {
    totalBalance: latestClosingBalance,
    lastTransaction: {
      artist: mostRecentRow['Artist'] || 'N/A',
      title: mostRecentRow['Child Asset Title/Name'] || 'N/A',
      service: mostRecentRow['Service'] || 'N/A',
      territory: mostRecentRow['Territory'] || 'N/A',
      date: mostRecentRow['Transaction Month'] || 'N/A',
      amount: parseFloat(mostRecentRow['Amount Due in USD'] || '0')
    },
    lastStatementPeriod,
    totalRevenue,
    totalStreams,
    performanceData,
    countryData: countryDataArray,
    platformData: platformDataArray,
    yearlyRevenueData: yearlyRevenueDataArray,
    totalMusic: musicCount,
    totalVideos: videoCount,
    totalRoyalty: royaltySum
  };
};

/**
 * Read and analyze a CSV file uploaded to the server
 * @param fileId The ID of the uploaded CSV file
 * @returns Summary data from the CSV file
 */
export const analyzeCsvFile = async (fileId: string): Promise<CsvSummary> => {
  try {
    const response = await api.get(`/csv/${fileId}/content`);
    const csvContent = response.data.content;
    
    return extractCsvSummary(csvContent);
  } catch (error) {
    console.error('Error analyzing CSV file:', error);
    throw error;
  }
};

/**
 * Analyze the most recent uploaded CSV file
 * @returns Summary data from the most recent CSV file
 */
export const analyzeLatestCsvFile = async (): Promise<CsvSummary> => {
  try {
    // Get the list of CSV uploads
    const response = await api.get('/csv?limit=1&sort=-createdAt');
    
    if (response.data.uploads && response.data.uploads.length > 0) {
      const latestCsvId = response.data.uploads[0].id;
      return await analyzeCsvFile(latestCsvId);
    }
    
    throw new Error('No CSV files found');
  } catch (error) {
    console.error('Error analyzing latest CSV file:', error);
    throw error;
  }
};

/**
 * Analyze a local CSV file that hasn't been uploaded to the server yet
 * @param file The CSV file object from file input or drag-and-drop
 * @returns A promise that resolves to the CSV summary
 */
export const analyzeLocalCsvFile = (file: File): Promise<CsvSummary> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (event.target && typeof event.target.result === 'string') {
          const csvContent = event.target.result;
          const summary = extractCsvSummary(csvContent);
          resolve(summary);
        } else {
          reject(new Error('Failed to read CSV file'));
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
}; 