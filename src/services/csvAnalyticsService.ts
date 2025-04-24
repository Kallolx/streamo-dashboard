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
      totalStreams: 0
    };
  }
  
  // Get most recent transaction (assuming rows are sorted by date)
  const mostRecentRow = rows[0];
  
  // Calculate total revenue, streams and balance
  let totalRevenue = 0;
  let totalStreams = 0;
  let latestClosingBalance = 0;
  
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
  });
  
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
    totalStreams
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