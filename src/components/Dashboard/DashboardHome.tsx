'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getUserData } from '@/services/authService';
import { getEarningsData, EarningsData } from '@/services/royaltyService';
import { getLatestReleases } from '@/services/dashboardService';
import axios from 'axios';
import api from '@/services/api';

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
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [earningsData, setEarningsData] = useState<EarningsData>({
    totalEarnings: '$0',
    lastStatement: '$0',
    pendingPayments: '$0',
    statementHistory: []
  });
  const [releases, setReleases] = useState<any[]>([]);

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
        
        // Fetch earnings data
        const earnings = await getEarningsData();
        // Ensure no null values in earnings data
        setEarningsData({
          totalEarnings: earnings.totalEarnings || '$0',
          lastStatement: earnings.lastStatement || '$0',
          pendingPayments: earnings.pendingPayments || '$0',
          statementHistory: Array.isArray(earnings.statementHistory) ? earnings.statementHistory : []
        });
        
        // Fetch latest releases
        const latestReleases = await getLatestReleases(5);
        // Ensure latestReleases is an array
        if (Array.isArray(latestReleases)) {
          setReleases(latestReleases);
        } else {
          console.error('Latest releases is not an array:', latestReleases);
          setReleases([]);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setReleases([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User header section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Hi, {userData?.name || 'User'}
        </h1>
        <div className="flex gap-3 flex-wrap">
          <span className="bg-purple-900 text-white px-3 py-1 rounded-md text-sm flex items-center">
            <span className="mr-1">★</span> {getRoleBadgeText(userData?.role || '')}
          </span>
          <span className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm">StreamAudio</span>
          {userData?.role === 'superadmin' && (
            <span className="bg-red-800 text-white px-3 py-1 rounded-md text-sm">Super User</span>
          )}
          {userData?.lastLogin && (
            <span className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm">
              Last Login: {new Date(userData.lastLogin).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Earnings and Statements section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#161A1F] p-6 rounded-lg">
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm">Total Earnings</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-white text-2xl font-bold">{displayValue(earningsData.totalEarnings)}</span>
              <div className="h-8 w-8 bg-gray-800 rounded-full flex items-center justify-center">
                <DollarIcon />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-[#161A1F] p-6 rounded-lg">
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm">Last Statement</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-white text-2xl font-bold">{displayValue(earningsData.lastStatement)}</span>
              <div className="h-8 w-8 bg-gray-800 rounded-full flex items-center justify-center">
                <DocumentIcon />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-[#161A1F] p-6 rounded-lg">
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm">Pending Payments</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-white text-2xl font-bold">{displayValue(earningsData.pendingPayments)}</span>
              <div className="h-8 w-8 bg-gray-800 rounded-full flex items-center justify-center">
                <DollarIcon />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Latest releases section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Latest Release</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.isArray(releases) && releases.length > 0 ? (
            releases.map((release) => (
              <div key={release.id} className="bg-[#161A1F] rounded-lg overflow-hidden">
                <div className="relative aspect-square">
                  <img
                    src={release.imagePath || '/images/music/placeholder.png'}
                    alt={release.title || 'Release'}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-white text-sm font-medium">{release.title || 'Untitled'}</h3>
                  <p className="text-gray-400 text-xs">{release.type || 'Single'}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-5 p-4 text-center text-gray-400">
              No releases found
            </div>
          )}
        </div>
      </div>

      {/* Recent Statements section */}
      {earningsData.statementHistory && earningsData.statementHistory.length > 0 ? (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Recent Statements</h2>
          <div className="bg-[#161A1F] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-[#1A1E24]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Period</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-[#161A1F] divide-y divide-gray-700">
                  {earningsData.statementHistory.slice(0, 3).map((statement) => (
                    <tr key={statement.id} className="hover:bg-[#1A1E24]">
                      <td className="px-4 py-3 whitespace-nowrap text-white">{statement.period || 'N/A'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-white">{statement.amount || '$0'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          statement.status === 'paid' ? 'bg-green-900 text-green-200' : 'bg-yellow-900 text-yellow-200'
                        }`}>
                          {statement.status ? (statement.status.charAt(0).toUpperCase() + statement.status.slice(1)) : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-white">
                        {statement.date ? new Date(statement.date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        {statement.downloadUrl && statement.status === 'paid' && (
                          <button className="px-3 py-1 rounded text-sm bg-[#232830] text-blue-400 hover:bg-[#292F38]">
                            Download
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Recent Statements</h2>
          <div className="bg-[#161A1F] p-8 rounded-lg text-center text-gray-400">
            No statements found
          </div>
        </div>
      )}

      {/* Show admin-specific content */}
      {(userData?.role === 'admin' || userData?.role === 'superadmin') && (
        <div className="bg-[#161A1F] p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4">Administrative Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-[#1A1E24] hover:bg-[#252A33] p-4 rounded-lg text-left">
              <h3 className="text-white font-medium mb-1">User Management</h3>
              <p className="text-gray-400 text-sm">Manage all platform users</p>
            </button>
            <button className="bg-[#1A1E24] hover:bg-[#252A33] p-4 rounded-lg text-left">
              <h3 className="text-white font-medium mb-1">Release Management</h3>
              <p className="text-gray-400 text-sm">Review and approve releases</p>
            </button>
            <button className="bg-[#1A1E24] hover:bg-[#252A33] p-4 rounded-lg text-left">
              <h3 className="text-white font-medium mb-1">System Settings</h3>
              <p className="text-gray-400 text-sm">Configure platform settings</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 