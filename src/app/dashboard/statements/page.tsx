"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { getStatementHistory, RoyaltyStatement, downloadStatement } from '@/services/royaltyService';
import { CloudArrowDown } from "@phosphor-icons/react";

export default function StatementsPage() {
  const [statements, setStatements] = useState<RoyaltyStatement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Helper function to ensure values are never null/undefined when displayed
  const displayValue = (value: any, defaultValue: string = 'N/A') => {
    return value || defaultValue;
  };

  useEffect(() => {
    const loadStatements = async () => {
      try {
        setIsLoading(true);
        const data = await getStatementHistory();
        // Ensure all statements have values, never null
        const validData = data.map(statement => ({
          ...statement,
          id: statement.id || `st-${Math.random().toString(36).substring(2, 9)}`,
          period: statement.period || 'Unknown Period',
          amount: statement.amount || '$0',
          status: statement.status || 'pending',
          date: statement.date || new Date().toISOString()
        }));
        setStatements(validData);
      } catch (error) {
        console.error('Error loading statements:', error);
        setStatements([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadStatements();
  }, []);

  // Filter statements based on search term
  const filteredStatements = statements.filter(
    statement =>
      statement.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
      statement.amount.toLowerCase().includes(searchTerm.toLowerCase()) ||
      statement.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStatements.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStatements.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Handle statement download
  const handleDownload = async (statementId: string) => {
    try {
      const blob = await downloadStatement(statementId);
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `statement-${statementId}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading statement:', error);
      alert('Failed to download statement. Please try again later.');
    }
  };

  return (
    <DashboardLayout title="Statement History" subtitle="View and download your statements">
      <div className="mb-6">
        {/* Search Bar */}
        <div className="relative w-full md:w-80 mb-6">
          <input
            type="text"
            placeholder="Search statements"
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
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {/* Statement summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#161A1F] p-6 rounded-lg">
                <h3 className="text-gray-400 text-sm mb-2">Total Statements</h3>
                <p className="text-white text-2xl font-bold">{statements.length || 0}</p>
              </div>
              
              <div className="bg-[#161A1F] p-6 rounded-lg">
                <h3 className="text-gray-400 text-sm mb-2">Pending Statements</h3>
                <p className="text-white text-2xl font-bold">
                  {statements.filter(s => s.status === 'pending').length || 0}
                </p>
              </div>
              
              <div className="bg-[#161A1F] p-6 rounded-lg">
                <h3 className="text-gray-400 text-sm mb-2">Latest Statement</h3>
                <p className="text-white text-2xl font-bold">
                  {statements.length > 0 ? displayValue(statements[0].period) : 'N/A'}
                </p>
              </div>
            </div>
            
            {/* Statements Table */}
            <div className="bg-[#161A1F] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-[#1A1E24]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Statement Period
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#161A1F] divide-y divide-gray-700">
                    {currentItems.length > 0 ? (
                      currentItems.map((statement) => (
                        <tr key={statement.id} className="hover:bg-[#1A1E24]">
                          <td className="px-4 py-3 whitespace-nowrap text-white">{displayValue(statement.period)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-white">{displayValue(statement.amount, '$0')}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              statement.status === 'paid' ? 'bg-green-900 text-green-200' : 'bg-yellow-900 text-yellow-200'
                            }`}>
                              {statement.status ? statement.status.charAt(0).toUpperCase() + statement.status.slice(1) : 'Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-white">
                            {statement.date ? new Date(statement.date).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            {statement.downloadUrl && statement.status === 'paid' && (
                              <button 
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                onClick={() => handleDownload(statement.id)}
                              >
                                <CloudArrowDown size={20} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                          No statements found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 flex items-center justify-between border-t border-gray-700">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md ${
                        currentPage === 1
                          ? "text-gray-500 cursor-not-allowed"
                          : "text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md ${
                        currentPage === totalPages
                          ? "text-gray-500 cursor-not-allowed"
                          : "text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-400">
                        Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(indexOfLastItem, filteredStatements.length)}
                        </span>{' '}
                        of <span className="font-medium">{filteredStatements.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-[#161A1F] text-sm font-medium ${
                            currentPage === 1
                              ? "text-gray-500 cursor-not-allowed"
                              : "text-gray-300 hover:bg-gray-700"
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border ${
                              currentPage === page
                                ? "bg-purple-600 border-purple-500 text-white"
                                : "border-gray-700 bg-[#161A1F] text-gray-300 hover:bg-gray-700"
                            } text-sm font-medium`}
                          >
                            {page}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-[#161A1F] text-sm font-medium ${
                            currentPage === totalPages
                              ? "text-gray-500 cursor-not-allowed"
                              : "text-gray-300 hover:bg-gray-700"
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 