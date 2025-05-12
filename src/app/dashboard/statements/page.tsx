"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { getStatementHistory, RoyaltyStatement, downloadStatement, getCsvUploads, getTransactionsForCsv, generateStatementSummaryFromTransactions, generateStatementCSV, StatementSummary, CsvUpload, Transaction, getEarningsData, EarningsData } from '@/services/royaltyService';
import { CloudArrowDown, FileArrowDown, FileText, ChartBar, Table } from "@phosphor-icons/react";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function StatementsPage() {
  const [statements, setStatements] = useState<RoyaltyStatement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [csvUploads, setCsvUploads] = useState<CsvUpload[]>([]);
  const [selectedCsvId, setSelectedCsvId] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statementSummary, setStatementSummary] = useState<StatementSummary | null>(null);
  const [isLoadingCsv, setIsLoadingCsv] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentYear] = useState<number>(new Date().getFullYear());
  const [earningsData, setEarningsData] = useState<EarningsData>({
    totalEarnings: '$0',
    lastStatement: '$0',
    pendingPayments: '$0',
    statementHistory: []
  });
  const itemsPerPage = 10;

  // Helper function to ensure values are never null/undefined when displayed
  const displayValue = (value: any, defaultValue: string = '0') => {
    return value || defaultValue;
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Load statement history
        const data = await getStatementHistory();
        const validData = data.map(statement => ({
          ...statement,
          id: statement.id || `st-${Math.random().toString(36).substring(2, 9)}`,
          period: statement.period || 'Unknown Period',
          amount: statement.amount || '$0',
          status: statement.status || 'pending',
          date: statement.date || new Date().toISOString()
        }));
        setStatements(validData);
        
        // Load earnings data
        const earnings = await getEarningsData();
        setEarningsData(earnings);
        
        // Load CSV uploads
        setIsLoadingCsv(true);
        const csvData = await getCsvUploads();
        setCsvUploads(csvData);
        setIsLoadingCsv(false);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setStatements([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load transactions when a month is selected
  useEffect(() => {
    const loadTransactions = async () => {
      if (!selectedMonth) {
        setTransactions([]);
        setStatementSummary(null);
        return;
      }
      
      try {
        setIsLoadingTransactions(true);
        // In a real implementation, you would fetch transactions for the selected month
        // Here we're reusing the existing function but should be replaced with month-specific API
        const transactionData = await getTransactionsForCsv(selectedMonth);
        setTransactions(transactionData);
      } catch (error) {
        console.error('Error loading transactions:', error);
        setTransactions([]);
      } finally {
        setIsLoadingTransactions(false);
      }
    };

    loadTransactions();
  }, [selectedMonth]);

  // Filter statements based on search term
  const filteredStatements = statements.filter(
    statement =>
      statement.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
      statement.amount.toLowerCase().includes(searchTerm.toLowerCase()) ||
      statement.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination for statement history
  const totalPages = Math.ceil(filteredStatements.length / itemsPerPage);
  const paginatedStatements = filteredStatements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle statement download
  const handleDownload = async (statementId: string) => {
    try {
      // Find the statement details
      const statement = statements.find(s => s.id === statementId);
      if (!statement) {
        throw new Error('Statement not found');
      }

      // Create a new PDF
      const pdf = new jsPDF();
      
      // Add header
      pdf.setFontSize(20);
      pdf.setTextColor(82, 0, 255); // Purple header
      pdf.text('Statement Report', 105, 15, { align: 'center' });
      
      // Add statement details
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Statement ID: ${statement.id}`, 14, 30);
      pdf.text(`Period: ${statement.period}`, 14, 40);
      pdf.text(`Amount: ${statement.amount}`, 14, 50);
      pdf.text(`Status: ${statement.status}`, 14, 60);
      pdf.text(`Date: ${new Date(statement.date).toLocaleDateString()}`, 14, 70);
      
      // Add information about transactions
      pdf.setFontSize(16);
      pdf.text('Statement Details', 14, 90);
      
      pdf.setFontSize(10);
      pdf.text('This statement contains a summary of your earnings for the specified period.', 14, 100);
      pdf.text('For detailed transaction information, please contact support.', 14, 110);
      
      // Add footer
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Generated on ' + new Date().toLocaleString(), 14, 280);
      pdf.text('Page 1 of 1', 180, 280, { align: 'right' });
      
      // Save the PDF
      pdf.save(`statement-${statement.id}.pdf`);
    } catch (error) {
      console.error('Error generating statement PDF:', error);
      alert('Failed to generate statement PDF. Please try again later.');
    }
  };

  // Generate statement summary from transactions
  const handleGenerateStatement = () => {
    if (!selectedMonth || transactions.length === 0) return;
    
    setIsGenerating(true);
    
    try {
      // Generate summary with month name
      const summary = generateStatementSummaryFromTransactions(transactions);
      
      // Add the selected month as the period
      const month = selectedMonth.charAt(0).toUpperCase() + selectedMonth.slice(1);
      const year = new Date().getFullYear();
      summary.period = `${month} ${year}`;
      
      setStatementSummary(summary);
    } catch (error) {
      console.error('Error generating statement summary:', error);
      alert('Failed to generate statement summary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle summary download
  const handleDownloadSummary = () => {
    if (!statementSummary) return;
    
    try {
      // Create a new PDF document
      const pdf = new jsPDF();
      
      // Add title
      pdf.setFontSize(20);
      pdf.setTextColor(82, 0, 255); // Purple header
      pdf.text(`Statement Summary - ${statementSummary.period}`, 105, 15, { align: 'center' });
      
      // Add overall summary
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Overall Summary', 14, 30);
      
      // Add summary data
      pdf.setFontSize(12);
      pdf.text(`Total Tracks: ${statementSummary.totalTracks || 0}`, 14, 40);
      pdf.text(`Total Streams: ${(statementSummary.totalStreams || 0).toLocaleString()}`, 14, 50);
      pdf.text(`Total Revenue: ${formatCurrency(statementSummary.totalRevenue || 0)}`, 14, 60);
      
      // Add platform breakdown
      pdf.setFontSize(16);
      pdf.text('Platform Breakdown', 14, 80);
      
      // Create table data for platforms
      const platformTableData = statementSummary.platformBreakdown.map(platform => [
        platform.platform,
        platform.streams.toLocaleString(),
        formatCurrency(platform.revenue),
        `${platform.percentage.toFixed(2)}%`
      ]);
      
      // Add platform table
      autoTable(pdf, {
        startY: 85,
        head: [['Platform', 'Streams', 'Revenue', 'Percentage']],
        body: platformTableData,
        theme: 'grid',
        headStyles: { fillColor: [82, 0, 255], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [240, 240, 250] }
      });
      
      // Add artist breakdown
      pdf.setFontSize(16);
      const platformTableEndY = (pdf as any).lastAutoTable.finalY + 15;
      pdf.text('Artist Summary', 14, platformTableEndY);
      
      // Create table data for artists
      const artistTableData = statementSummary.artists.map(artist => [
        artist.name,
        artist.tracks.toString(),
        artist.streams.toLocaleString(),
        formatCurrency(artist.revenue)
      ]);
      
      // Add artist table
      autoTable(pdf, {
        startY: platformTableEndY + 5,
        head: [['Artist', 'Tracks', 'Streams', 'Revenue']],
        body: artistTableData,
        theme: 'grid',
        headStyles: { fillColor: [82, 0, 255], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [240, 240, 250] }
      });
      
      // Add footer
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Generated on ' + new Date().toLocaleString(), 14, 280);
      pdf.text('Page 1 of 1', 180, 280, { align: 'right' });
      
      // Save the PDF
      pdf.save(`statement-summary-${statementSummary.period.replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again later.');
    }
  };

  return (
    <DashboardLayout title="Statement History" subtitle="View and generate statements from your transaction data">
      <div className="mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side: Statement Generator */}
          <div className="lg:col-span-2">
            <div className="bg-[#161A1F] p-6 rounded-lg mb-6">
              <h2 className="text-white text-xl font-bold mb-4 flex items-center">
                <FileText size={24} className="mr-2 text-purple-500" />
                Monthly Statement Generator
              </h2>
              <p className="text-gray-400 mb-6">
                Select a month to generate and view your monthly earnings statement
              </p>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <div className="relative flex-grow">
                  <select
                    className="w-full py-2 px-4 bg-[#1D2229] text-gray-300 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    disabled={isLoadingTransactions}
                  >
                    <option value="">Select a month ({currentYear})</option>
                    <option value="january">January {currentYear}</option>
                    <option value="february">February {currentYear}</option>
                    <option value="march">March {currentYear}</option>
                    <option value="april">April {currentYear}</option>
                    <option value="may">May {currentYear}</option>
                    <option value="june">June {currentYear}</option>
                    <option value="july">July {currentYear}</option>
                    <option value="august">August {currentYear}</option>
                    <option value="september">September {currentYear}</option>
                    <option value="october">October {currentYear}</option>
                    <option value="november">November {currentYear}</option>
                    <option value="december">December {currentYear}</option>
                  </select>
                  {isLoadingTransactions && (
                    <div className="absolute right-3 top-2.5">
                      <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-purple-500 rounded-full"></div>
                    </div>
                  )}
                </div>
                
                <button
                  className="px-6 py-2.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors whitespace-nowrap flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleGenerateStatement}
                  disabled={!selectedMonth || isLoadingTransactions || isGenerating}
                >
                  {isGenerating || isLoadingTransactions ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full mr-2"></div>
                      {isLoadingTransactions ? 'Loading...' : 'Generating...'}
                    </>
                  ) : (
                    <>
                      <ChartBar size={20} className="mr-2" />
                      Generate Statement
                    </>
                  )}
                </button>
              </div>
              
              {transactions.length > 0 && (
                <div className="p-4 bg-[#1D2229] rounded-lg">
                  <p className="text-gray-300">
                    <span className="font-bold">{transactions.length}</span> transactions loaded
                  </p>
                </div>
              )}
            </div>
            
            {/* CSV Summary Cards - always show with zeros before CSV selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-[#161A1F] p-6 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">Total Tracks</span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-white text-2xl font-bold">
                      {transactions.length > 0 
                        ? new Set(transactions.map(t => t.title).filter(Boolean)).size || '0'
                        : '0'}
                    </span>
                    <div className="h-8 w-8 bg-gray-800 rounded-full flex items-center justify-center">
                      <FileText size={16} className="text-purple-500" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#161A1F] p-6 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">Total Streams</span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-white text-2xl font-bold">
                      {transactions.length > 0
                        ? transactions.reduce((sum, t) => sum + (t.quantity || 0), 0).toLocaleString() || '0'
                        : '0'}
                    </span>
                    <div className="h-8 w-8 bg-gray-800 rounded-full flex items-center justify-center">
                      <ChartBar size={16} className="text-purple-500" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#161A1F] p-6 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">Total Revenue</span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-white text-2xl font-bold">
                      {transactions.length > 0
                        ? formatCurrency(transactions.reduce((sum, t) => sum + (t.revenueUSD || 0), 0))
                        : formatCurrency(0)}
                    </span>
                    <div className="h-8 w-8 bg-gray-800 rounded-full flex items-center justify-center">
                      <CloudArrowDown size={16} className="text-purple-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side: Generated Summary (if available) */}
          <div className="lg:col-span-1">
            {statementSummary && (
              <div className="bg-[#161A1F] p-5 rounded-lg h-full">
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-white font-bold flex items-center">
                    <ChartBar size={20} className="mr-2 text-purple-500" />
                    Statement Summary
                  </h3>
                  <button
                    className="px-4 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center text-sm"
                    onClick={handleDownloadSummary}
                  >
                    <FileArrowDown size={16} className="mr-2" />
                    Download PDF
                  </button>
                </div>
                
                <div className="text-gray-300 text-sm mb-3">
                  Period: <span className="text-white">{statementSummary.period}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-[#1D2229] p-3 rounded">
                    <div className="text-xs text-gray-400 mb-1">Tracks</div>
                    <div className="text-white font-bold">{statementSummary.totalTracks || '0'}</div>
                  </div>
                  <div className="bg-[#1D2229] p-3 rounded">
                    <div className="text-xs text-gray-400 mb-1">Streams</div>
                    <div className="text-white font-bold">{(statementSummary.totalStreams || 0).toLocaleString()}</div>
                  </div>
                  <div className="bg-[#1D2229] p-3 rounded">
                    <div className="text-xs text-gray-400 mb-1">Revenue</div>
                    <div className="text-white font-bold">{formatCurrency(statementSummary.totalRevenue || 0)}</div>
                  </div>
                </div>
                
                <div className="mb-3 mt-5">
                  <h4 className="text-white text-sm font-bold mb-2">Top Platforms</h4>
                  {statementSummary.platformBreakdown.slice(0, 3).map((platform, index) => (
                    <div key={index} className="flex justify-between items-center mb-2 text-sm">
                      <div className="text-gray-300">{platform.platform}</div>
                      <div className="text-white">{formatCurrency(platform.revenue || 0)}</div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-5">
                  <h4 className="text-white text-sm font-bold mb-2">Top Artists</h4>
                  {statementSummary.artists.slice(0, 3).map((artist, index) => (
                    <div key={index} className="flex justify-between items-center mb-2 text-sm">
                      <div className="text-gray-300">{artist.name}</div>
                      <div className="text-white">{formatCurrency(artist.revenue || 0)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Skeleton UI - always show when no summary data */}
            {!statementSummary && !isGenerating && (
              <div className="bg-[#161A1F] p-5 rounded-lg h-full">
                <div className="mb-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-5 w-5 rounded-full bg-purple-500 mr-2"></div>
                    <div className="h-5 w-32 bg-[#1D2229] rounded animate-pulse"></div>
                  </div>
                  <div className="h-9 w-24 bg-gray-700 rounded animate-pulse"></div>
                </div>
                
                <div className="h-5 w-48 bg-[#1D2229] rounded animate-pulse mb-3"></div>
                
                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="bg-[#1D2229] p-3 rounded">
                    <div className="h-3 w-12 bg-gray-700 mb-2 rounded animate-pulse"></div>
                    <div className="h-6 w-10 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="bg-[#1D2229] p-3 rounded">
                    <div className="h-3 w-12 bg-gray-700 mb-2 rounded animate-pulse"></div>
                    <div className="h-6 w-16 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="bg-[#1D2229] p-3 rounded">
                    <div className="h-3 w-12 bg-gray-700 mb-2 rounded animate-pulse"></div>
                    <div className="h-6 w-20 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 mt-8 mb-4">
                  <div className="h-5 w-28 bg-[#1D2229] rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-[#1D2229] rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-[#1D2229] rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-[#1D2229] rounded animate-pulse"></div>
                </div>
                
                <div className="flex flex-col gap-2 mt-8">
                  <div className="h-5 w-24 bg-[#1D2229] rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-[#1D2229] rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-[#1D2229] rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-[#1D2229] rounded animate-pulse"></div>
                </div>
              </div>
            )}
            
            {/* Loading state during generation */}
            {isGenerating && (
              <div className="bg-[#161A1F] p-5 rounded-lg h-full flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                <p className="text-white">Generating Statement...</p>
                <p className="text-gray-400 text-sm mt-2">This may take a few moments</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Statement history section has been removed */}
      </div>
    </DashboardLayout>
  );
}