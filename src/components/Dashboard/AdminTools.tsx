import React, { useState, useEffect } from 'react';
import { updateTransactionUserLinks } from '@/services/adminService';
import { isAdmin } from '@/services/authService';
import Toast from '@/components/Common/Toast';

// Define the Result interface
interface Result {
  name: string;
  role: string;
  isrcCount: number;
  transactionsUpdated: number;
}

// Enhanced AdminTools component with more features
const AdminTools = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{ results: Result[] } | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });
  const [statistics, setStatistics] = useState({
    totalTransactions: 0,
    totalUsers: 0,
    totalMatched: 0,
    totalUnmatched: 0
  });

  // Load last update time from localStorage on component mount
  useEffect(() => {
    const lastUpdate = localStorage.getItem('lastTransactionLinkUpdate');
    if (lastUpdate) {
      setLastUpdateTime(lastUpdate);
    }
  }, []);

  // Only admins should have access to this component
  if (!isAdmin()) {
    return null;
  }

  const handleUpdateTransactionLinks = async () => {
    setIsProcessing(true);
    setResults(null);

    try {
      const response = await updateTransactionUserLinks();
      setResults(response);
      
      // Calculate stats
      const totalUpdated = response.results.reduce((sum, result) => sum + result.transactionsUpdated, 0);
      const totalUsers = response.results.length;
      const usersWithIsrc = response.results.filter(r => r.isrcCount > 0).length;
      
      // Update statistics
      setStatistics({
        totalTransactions: totalUpdated,
        totalUsers,
        totalMatched: totalUpdated,
        totalUnmatched: response.results.filter(r => r.isrcCount > 0 && r.transactionsUpdated === 0).length
      });
      
      // Save last update time to localStorage
      const now = new Date().toISOString();
      localStorage.setItem('lastTransactionLinkUpdate', now);
      setLastUpdateTime(now);
      
      setToast({
        show: true,
        message: `Successfully updated ${totalUpdated} transactions for ${usersWithIsrc} users`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating transaction links:', error);
      setToast({
        show: true,
        message: 'Failed to update transaction links',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gradient-to-r from-[#161A1F] to-[#161F28] rounded-lg p-6 mb-6 shadow-lg border border-gray-800">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2 md:mb-0 flex items-center">
          <svg 
            className="w-5 h-5 mr-2 text-purple-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
            />
          </svg>
          Admin Tools
        </h2>
        
        {lastUpdateTime && (
          <div className="text-gray-400 text-sm flex items-center">
            <svg className="w-4 h-4 mr-1.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Last update: {formatDate(lastUpdateTime)}
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <div className="border-b border-gray-700 pb-3 mb-4">
          <h3 className="text-white font-medium mb-2 flex items-center">
            <svg className="w-4 h-4 mr-1.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Transaction User Links
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            This tool links transactions to users based on ISRC codes to calculate earnings properly.
            Run this after uploading new CSV files to update user earnings.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1D2229] p-4 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-xs">Total Users</span>
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="text-white text-lg font-semibold">{statistics.totalUsers}</div>
          </div>
          
          <div className="bg-[#1D2229] p-4 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-xs">Total Transactions Updated</span>
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="text-white text-lg font-semibold">{statistics.totalTransactions}</div>
          </div>
          
          <div className="bg-[#1D2229] p-4 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-xs">Matched</span>
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-white text-lg font-semibold">{statistics.totalMatched}</div>
          </div>
          
          <div className="bg-[#1D2229] p-4 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-xs">Unmatched</span>
              <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="text-white text-lg font-semibold">{statistics.totalUnmatched}</div>
          </div>
        </div>
        
        <button
          onClick={handleUpdateTransactionLinks}
          disabled={isProcessing}
          className={`px-6 py-2.5 rounded-lg ${
            isProcessing
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-[#A365FF] hover:bg-purple-700'
          } text-white transition-colors shadow-md flex items-center justify-center w-full sm:w-auto`}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Update Transaction Links
            </>
          )}
        </button>
      </div>
      
      {results && (
        <div className="mt-6">
          <h4 className="text-white font-medium mb-3 flex items-center">
            <svg className="w-4 h-4 mr-1.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Results
          </h4>
          <div className="bg-[#1A1E25] rounded-lg p-4 max-h-60 overflow-auto">
            <table className="w-full border-collapse min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="py-2 px-4 text-left text-gray-400 text-xs font-medium">User</th>
                  <th className="py-2 px-4 text-left text-gray-400 text-xs font-medium">Role</th>
                  <th className="py-2 px-4 text-left text-gray-400 text-xs font-medium">ISRC Count</th>
                  <th className="py-2 px-4 text-left text-gray-400 text-xs font-medium">Transactions Updated</th>
                  <th className="py-2 px-4 text-left text-gray-400 text-xs font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {results.results.map((result: Result, index: number) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-800/20' : ''}>
                    <td className="py-2 px-4 text-white text-sm">{result.name}</td>
                    <td className="py-2 px-4 text-gray-300 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        result.role === 'admin' || result.role === 'superadmin'
                          ? 'bg-purple-900/40 text-purple-300'
                          : result.role === 'labelowner'
                          ? 'bg-blue-900/40 text-blue-300'
                          : 'bg-green-900/40 text-green-300'
                      }`}>
                        {result.role}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-gray-300 text-sm">{result.isrcCount}</td>
                    <td className="py-2 px-4 text-gray-300 text-sm">{result.transactionsUpdated}</td>
                    <td className="py-2 px-4 text-gray-300 text-sm">
                      {result.isrcCount > 0 ? (
                        result.transactionsUpdated > 0 ? (
                          <span className="flex items-center text-green-400">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Updated
                          </span>
                        ) : (
                          <span className="flex items-center text-yellow-400">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            No Matches
                          </span>
                        )
                      ) : (
                        <span className="flex items-center text-gray-400">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          No ISRCs
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </div>
  );
};

export default AdminTools; 