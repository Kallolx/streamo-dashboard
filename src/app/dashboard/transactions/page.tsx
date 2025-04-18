"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { PencilSimple, Trash } from "@phosphor-icons/react";
import TransactionDetailsModal from "@/components/Dashboard/models/TransactionDetailsModal";

// Define the transactions tabs
const transactionTabs = [
  {
    id: "transactionManagement",
    name: "Transactions Management",
  },
  {
    id: "uploadCSV",
    name: "Upload CSV",
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

// Mock data for transactions
const transactionsData = [
  {
    id: 1,
    track: "The Overview",
    artist: "Steven Wilson",
    isrc: "Verified",
    store: "YouTube",
    streams: 1255,
    revenue: "$12,233",
  },
  {
    id: 2,
    track: "The Overview",
    artist: "Linkin Park",
    isrc: "Verified",
    store: "Soundcloud",
    streams: 556,
    revenue: "$12,233",
  },
  {
    id: 3,
    track: "The Overview",
    artist: "Steven Wilson",
    isrc: "Verified",
    store: "Spotify",
    streams: 664,
    revenue: "$12,233",
  },
  {
    id: 4,
    track: "The Overview",
    artist: "Linkin Park",
    isrc: "Verified",
    store: "Apple Music",
    streams: 1255,
    revenue: "$12,233",
  },
  {
    id: 5,
    track: "The Overview",
    artist: "Steven Wilson",
    isrc: "Verified",
    store: "YouTube",
    streams: 556,
    revenue: "$12,233",
  },
  {
    id: 6,
    track: "The Overview",
    artist: "Linkin Park",
    isrc: "Verified",
    store: "Spotify",
    streams: 1255,
    revenue: "$12,233",
  },
  {
    id: 7,
    track: "The Overview",
    artist: "Steven Wilson",
    isrc: "Verified",
    store: "YouTube",
    streams: 664,
    revenue: "$12,233",
  },
  {
    id: 8,
    track: "The Overview",
    artist: "Linkin Park",
    isrc: "Verified",
    store: "Spotify",
    streams: 1255,
    revenue: "$12,233",
  },
  {
    id: 9,
    track: "The Overview",
    artist: "Steven Wilson",
    isrc: "Verified",
    store: "YouTube",
    streams: 664,
    revenue: "$12,233",
  },
  {
    id: 10,
    track: "The Overview",
    artist: "Linkin Park",
    isrc: "Verified",
    store: "Soundcloud",
    streams: 556,
    revenue: "$12,233",
  },
];

// Dollar icon component
const DollarIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8.00004 1.33334C4.31804 1.33334 1.33337 4.31801 1.33337 8.00001C1.33337 11.682 4.31804 14.6667 8.00004 14.6667C11.682 14.6667 14.6667 11.682 14.6667 8.00001C14.6667 4.31801 11.682 1.33334 8.00004 1.33334ZM8.66671 11.3333H7.33337V9.33334H8.66671V11.3333ZM9.74804 7.01467L9.18137 7.58934C8.73337 8.03867 8.66671 8.33334 8.66671 8.66667H7.33337V8.33334C7.33337 7.80001 7.52004 7.30867 7.96804 6.86067L8.75471 6.06801C8.97471 5.85334 9.10004 5.55734 9.10004 5.25334C9.10004 4.64134 8.60604 4.14001 8.00004 4.14001C7.39404 4.14001 6.90004 4.64134 6.90004 5.25334H5.56671C5.56671 3.90067 6.65404 2.80001 8.00004 2.80001C9.34604 2.80001 10.4334 3.90067 10.4334 5.25334C10.4334 5.92201 10.1814 6.53334 9.74804 7.01467Z"
      fill="#A365FF"
    />
  </svg>
);

export default function TransactionsPage() {
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

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Handle transaction selection
  const handleTransactionSelect = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Filter transactions based on search term
  const filteredTransactions = transactionsData.filter(
    transaction =>
      transaction.track.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.store.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
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

  return (
    <DashboardLayout
      title="Transactions"
      subtitle="Manage your earnings and transactions"
    >
      {/* Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto">
          {transactionTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-5 py-2 rounded-full whitespace-nowrap ${
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Balance */}
            <div className="bg-[#161A1F] p-6 rounded-lg">
              <div className="flex flex-col">
                <span className="text-gray-400 text-sm">Balance</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-white text-2xl font-bold">
                    $206,458
                  </span>
                  <div className="h-8 w-8 bg-gray-800 rounded-full flex items-center justify-center">
                    <DollarIcon />
                  </div>
                </div>
              </div>
            </div>

            {/* Last Transaction */}
            <div className="bg-[#161A1F] p-6 rounded-lg">
              <div className="flex flex-col">
                <span className="text-gray-400 text-sm">Last Transaction</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-white text-2xl font-bold">$20,666</span>
                  <div className="h-8 w-8 bg-gray-800 rounded-full flex items-center justify-center">
                    <DollarIcon />
                  </div>
                </div>
              </div>
            </div>

            {/* Last Statement */}
            <div className="bg-[#161A1F] p-6 rounded-lg">
              <div className="flex flex-col">
                <span className="text-gray-400 text-sm">Last Statement</span>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-white text-2xl font-bold">
                    $206,458
                  </span>
                  <div className="h-8 w-8 bg-gray-800 rounded-full flex items-center justify-center">
                    <DollarIcon />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Management title and search */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Transactions Management
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search"
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
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors whitespace-nowrap">
                Upload CSV
              </button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-[#161A1F] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-[#1A1E24]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Track/Release
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      User Name
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
                <tbody className="bg-[#161A1F] divide-y divide-gray-700">
                  {currentItems.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="hover:bg-[#1A1E24] cursor-pointer"
                      onClick={() => handleTransactionSelect(transaction)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-white">
                        {transaction.track}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-white">
                        {transaction.artist}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-white">
                        {transaction.isrc}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-white">
                        {transaction.store}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-white">
                        {transaction.streams}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-white">
                        {transaction.revenue}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-white">
                        <div
                          className="flex space-x-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button className="text-gray-400 hover:text-white transition-colors">
                            <PencilSimple size={20} />
                          </button>
                          <button className="text-red-500 hover:text-red-400 transition-colors">
                            <Trash size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
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
                    Showing{" "}
                    <span className="font-medium">{indexOfFirstItem + 1}</span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, filteredTransactions.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {filteredTransactions.length}
                    </span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-[#161A1F] text-sm font-medium ${
                        currentPage === 1
                          ? "text-gray-500 cursor-not-allowed"
                          : "text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
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
                      )
                    )}
                    <button
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-[#161A1F] text-sm font-medium ${
                        currentPage === totalPages
                          ? "text-gray-500 cursor-not-allowed"
                          : "text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "uploadCSV" && (
        <div className="bg-[#161A1F] p-8 rounded-lg">
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 flex flex-col items-center mb-8">
            <div className="w-16 h-16 mb-4 flex items-center justify-center">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M33 13H15C13.8954 13 13 13.8954 13 15V33C13 34.1046 13.8954 35 15 35H33C34.1046 35 35 34.1046 35 33V15C35 13.8954 34.1046 13 33 13Z"
                  stroke="#A365FF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M27 21L21 27"
                  stroke="#A365FF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 21L27 27"
                  stroke="#A365FF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-gray-300 mb-2">
              Browse or drag and drop CSV file
            </p>

            <button className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
              Upload
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

            {/* CSV Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-[#1A1E24]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      File Name ↑
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
                  {[
                    {
                      id: 1,
                      name: "Sample Report",
                      data: 215,
                      status: "Processing",
                      date: "31/12/2025",
                      time: "12:55",
                    },
                    {
                      id: 2,
                      name: "Sample Report",
                      data: 55,
                      status: "Completed",
                      date: "31/12/2025",
                      time: "12:55",
                    },
                    {
                      id: 3,
                      name: "Sample Report",
                      data: 69,
                      status: "Processing",
                      date: "31/12/2025",
                      time: "12:55",
                    },
                    {
                      id: 4,
                      name: "Sample Report",
                      data: 58,
                      status: "Completed",
                      date: "31/12/2025",
                      time: "12:55",
                    },
                    {
                      id: 5,
                      name: "Sample Report",
                      data: 215,
                      status: "Completed",
                      date: "31/12/2025",
                      time: "12:55",
                    },
                    {
                      id: 6,
                      name: "Sample Report",
                      data: 215,
                      status: "Processing",
                      date: "31/12/2025",
                      time: "12:55",
                    },
                    {
                      id: 7,
                      name: "Sample Report",
                      data: 58,
                      status: "Completed",
                      date: "31/12/2025",
                      time: "12:55",
                    },
                    {
                      id: 8,
                      name: "Sample Report",
                      data: 69,
                      status: "Processing",
                      date: "31/12/2025",
                      time: "12:55",
                    },
                    {
                      id: 9,
                      name: "Sample Report",
                      data: 58,
                      status: "Processing",
                      date: "31/12/2025",
                      time: "12:55",
                    },
                    {
                      id: 10,
                      name: "Sample Report",
                      data: 69,
                      status: "Completed",
                      date: "31/12/2025",
                      time: "12:55",
                    },
                  ].map((file, index) => (
                    <tr key={file.id} className="hover:bg-[#1A1E24]">
                      <td className="px-4 py-3 whitespace-nowrap text-white">
                        {file.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-white">
                        {file.data}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`${
                            file.status === "Processing"
                              ? "text-gray-300"
                              : "text-green-500"
                          }`}
                        >
                          {file.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-white">
                        {file.date}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-white">
                        {file.time}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="relative">
                          <button
                            onClick={(e) => toggleDropdown(file.id, e)}
                            id={`dropdown-button-${file.id}`}
                            className="text-white hover:text-gray-300 transition-colors focus:outline-none p-1"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          {activeDropdown === file.id && (
                            <div 
                              id={`dropdown-${file.id}`}
                              className="absolute right-0 mt-2 w-36 bg-[#1D2229] border border-gray-700 rounded-md shadow-lg z-50"
                            >
                              <div className="py-1">
                                <button
                                  className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // View file action
                                    setActiveDropdown(null);
                                  }}
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="mr-2"
                                  >
                                    <path
                                      d="M9 12H15"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    <path
                                      d="M12 9L12 15"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    <path
                                      d="M3 8V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V8"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    <path
                                      d="M8 21H16C17.1046 21 18 20.1046 18 19V12C18 10.8954 17.1046 10 16 10H8C6.89543 10 6 10.8954 6 12V19C6 20.1046 6.89543 21 8 21Z"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  View File
                                </button>
                                <button
                                  className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Export action
                                    setActiveDropdown(null);
                                  }}
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="mr-2"
                                  >
                                    <path
                                      d="M20 12V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V12"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    <path
                                      d="M9 14L12 17L15 14"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    <path
                                      d="M12 17V3"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  Export
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
              <div>Showing 1 to 10 of 200</div>
              <div className="flex items-center">
                <button className="w-8 h-8 bg-[#1A1E24] rounded-full flex items-center justify-center mr-2">
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
                <button className="w-8 h-8 bg-[#A365FF] text-white rounded-full flex items-center justify-center mr-2">
                  1
                </button>
                <button className="w-8 h-8 bg-[#1A1E24] rounded-full flex items-center justify-center mr-2">
                  2
                </button>
                <button className="w-8 h-8 bg-[#1A1E24] rounded-full flex items-center justify-center mr-2">
                  3
                </button>
                <button className="w-8 h-8 bg-[#1A1E24] rounded-full flex items-center justify-center mr-2">
                  4
                </button>
                <button className="w-8 h-8 bg-[#1A1E24] rounded-full flex items-center justify-center mr-2">
                  5
                </button>
                <button className="w-8 h-8 bg-[#1A1E24] rounded-full flex items-center justify-center">
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
              <button className="px-4 py-1 bg-[#1A1E24] rounded-md">
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="p-8 rounded-lg">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Revenue */}
            <div className="bg-[#1A1E24] p-5 rounded-lg">
              <div className="flex flex-col">
                <span className="text-gray-400 text-sm mb-2">
                  Total Revenue
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-white text-2xl font-bold">$12,480</span>
                  <div className="h-8 w-8 bg-[#232830] rounded-full flex items-center justify-center text-[#A365FF]">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Music */}
            <div className="bg-[#1A1E24] p-5 rounded-lg">
              <div className="flex flex-col">
                <span className="text-gray-400 text-sm mb-2">Total Music</span>
                <div className="flex items-center justify-between">
                  <span className="text-white text-2xl font-bold">6599</span>
                  <div className="h-8 w-8 bg-[#232830] rounded-full flex items-center justify-center text-[#A365FF]">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 18V5l12-2v13"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="6"
                        cy="18"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="18"
                        cy="16"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Videos */}
            <div className="bg-[#1A1E24] p-5 rounded-lg">
              <div className="flex flex-col">
                <span className="text-gray-400 text-sm mb-2">Total Videos</span>
                <div className="flex items-center justify-between">
                  <span className="text-white text-2xl font-bold">559</span>
                  <div className="h-8 w-8 bg-[#232830] rounded-full flex items-center justify-center text-[#A365FF]">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="2"
                        y="2"
                        width="20"
                        height="20"
                        rx="2.18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10 9l5 3-5 3V9z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Royalty */}
            <div className="bg-[#1A1E24] p-5 rounded-lg">
              <div className="flex flex-col">
                <span className="text-gray-400 text-sm mb-2">
                  Total Royalty
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-white text-2xl font-bold">5M</span>
                  <div className="h-8 w-8 bg-[#232830] rounded-full flex items-center justify-center text-[#A365FF]">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 13V8m4 2h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance Analytics */}
            <div className="p-5 rounded-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-medium">
                  Performance Analytics
                </h3>
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
                      {/* Chart line */}
                      <path
                        d="M0,260 C30,220 60,250 90,170 C120,120 150,250 180,250 C210,230 240,100 270,50 C300,20 330,60 360,120 C390,180 420,150 450,220 C480,260 510,220 540,120 C570,50 600,100 630,50 C660,80 690,150 720,130 C750,110 780,180 810,140 C840,100 870,250 900,200 C930,150 970,100 1000,70"
                        fill="none"
                        stroke="#A365FF"
                        strokeWidth="2"
                      />

                      {/* Fill gradient */}
                      <defs>
                        <linearGradient
                          id="gradient"
                          x1="0%"
                          y1="0%"
                          x2="0%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            stopColor="#A365FF"
                            stopOpacity="0.5"
                          />
                          <stop
                            offset="100%"
                            stopColor="#A365FF"
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>

                      {/* Fill area */}
                      <path
                        d="M0,260 C30,220 60,250 90,170 C120,120 150,250 180,250 C210,230 240,100 270,50 C300,20 330,60 360,120 C390,180 420,150 450,220 C480,260 510,220 540,120 C570,50 600,100 630,50 C660,80 690,150 720,130 C750,110 780,180 810,140 C840,100 870,250 900,200 C930,150 970,100 1000,70 L1000,300 L0,300 Z"
                        fill="url(#gradient)"
                      />
                    </svg>
                  </div>
                </div>

                {/* X-axis labels */}
                <div className="flex justify-between text-xs text-gray-400 mt-2 px-10">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Aug</span>
                  <span>Sep</span>
                  <span>Oct</span>
                </div>
              </div>
            </div>

            {/* Top Countries for Streaming */}
            <div className="p-5 rounded-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-medium">
                  Top Countries for Streaming
                </h3>
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
              <div className="space-y-5 bg-[#161A1F] p-5 rounded-lg">
                {/* USA */}
                <div>
                  <div className="flex justify-between text-white mb-1.5">
                    <span>USA</span>
                    <span>46%</span>
                  </div>
                  <div className="w-full bg-[#232830] h-2 rounded-full">
                    <div
                      className="bg-[#A365FF] h-2 rounded-full"
                      style={{ width: "46%" }}
                    ></div>
                  </div>
                </div>

                {/* Bangladesh */}
                <div>
                  <div className="flex justify-between text-white mb-1.5">
                    <span>Bangladesh</span>
                    <span>23%</span>
                  </div>
                  <div className="w-full bg-[#232830] h-2 rounded-full">
                    <div
                      className="bg-[#A365FF] h-2 rounded-full"
                      style={{ width: "23%" }}
                    ></div>
                  </div>
                </div>

                {/* UK */}
                <div>
                  <div className="flex justify-between text-white mb-1.5">
                    <span>UK</span>
                    <span>19%</span>
                  </div>
                  <div className="w-full bg-[#232830] h-2 rounded-full">
                    <div
                      className="bg-[#A365FF] h-2 rounded-full"
                      style={{ width: "19%" }}
                    ></div>
                  </div>
                </div>

                {/* Germany */}
                <div>
                  <div className="flex justify-between text-white mb-1.5">
                    <span>Germany</span>
                    <span>13%</span>
                  </div>
                  <div className="w-full bg-[#232830] h-2 rounded-full">
                    <div
                      className="bg-[#A365FF] h-2 rounded-full"
                      style={{ width: "13%" }}
                    ></div>
                  </div>
                </div>

                {/* India */}
                <div>
                  <div className="flex justify-between text-white mb-1.5">
                    <span>India</span>
                    <span>11%</span>
                  </div>
                  <div className="w-full bg-[#232830] h-2 rounded-full">
                    <div
                      className="bg-[#A365FF] h-2 rounded-full"
                      style={{ width: "11%" }}
                    ></div>
                  </div>
                </div>

                {/* Nepal */}
                <div>
                  <div className="flex justify-between text-white mb-1.5">
                    <span>Nepal</span>
                    <span>8%</span>
                  </div>
                  <div className="w-full bg-[#232830] h-2 rounded-full">
                    <div
                      className="bg-[#A365FF] h-2 rounded-full"
                      style={{ width: "8%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "revenue" && (
        <div className=" p-8 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-6">
            Revenue Overview
          </h2>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Revenue */}
            <div className="bg-[#1A1E24] p-5 rounded-lg">
              <div className="flex flex-col">
                <span className="text-gray-400 text-sm mb-2">Total Revenue</span>
                <div className="flex items-center justify-between">
                  <span className="text-white text-2xl font-bold">$12,480</span>
                  <div className="h-8 w-8 bg-[#232830] rounded-full flex items-center justify-center text-[#A365FF]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Music */}
            <div className="bg-[#1A1E24] p-5 rounded-lg">
              <div className="flex flex-col">
                <span className="text-gray-400 text-sm mb-2">Total Music</span>
                <div className="flex items-center justify-between">
                  <span className="text-white text-2xl font-bold">6599</span>
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

            {/* Total Videos */}
            <div className="bg-[#1A1E24] p-5 rounded-lg">
              <div className="flex flex-col">
                <span className="text-gray-400 text-sm mb-2">Total Videos</span>
                <div className="flex items-center justify-between">
                  <span className="text-white text-2xl font-bold">559</span>
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
                  <span className="text-white text-2xl font-bold">5M</span>
                  <div className="h-8 w-8 bg-[#232830] rounded-full flex items-center justify-center text-[#A365FF]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 13V8m4 2h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
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
              <div className="flex items-center justify-center p-4 rounded-md overflow-hidden">
                {/* Donut chart */}
                <div className="relative w-44 h-44">
                  {/* This is a simple representation of a pie chart using a conic gradient */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "conic-gradient(#8A85FF 0% 40%, #6AE398 40% 70%, #FFB963 70% 95%, #00C2FF 95% 100%)",
                      clipPath: "circle(50% at center)",
                    }}
                  >
                    {/* Center hollow */}
                    <div className="absolute inset-[25%] rounded-full bg-[#1A1E25]"></div>
                  </div>

                  {/* Percentages */}
                  <div className="absolute top-16 -right-30 text-md">
                    <div className="text-[#8A85FF] font-medium">
                      Spotify 40%
                    </div>
                  </div>

                  <div className="absolute bottom-2 -left-36 text-md">
                    <div className="text-[#6AE398] font-medium">
                      YouTube 30%
                    </div>
                  </div>

                  <div className="absolute top-16 -left-42 text-md">
                    <div className="text-[#FFB963] font-medium">
                      Apple Music 25%
                    </div>
                  </div>

                  <div className="absolute top-1 -right-32 text-md">
                    <div className="text-[#00C2FF] font-medium">
                      Soundcloud 5%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Growth Per Year Bar Chart */}
            <div className="p-4 rounded-md bg-[#161A1F]">
              <div className=" px-4 py-2 rounded-md mb-4">
                <h3 className="text-white font-medium">Revenue Growth Per Year</h3>
              </div>

              {/* Bar Chart */}
              <div className="h-72 p-4">
                <div className="flex h-full w-full justify-between items-end px-6">
                  {/* 2020 Bar */}
                  <div className="flex flex-col items-center justify-end h-full">
                    <div className="text-white text-xs mb-2">1k</div>
                    <div className="w-12 bg-[#A365FF] h-[10%] rounded-t-md relative">
                    </div>
                    <div className="text-gray-400 text-xs mt-2">2020</div>
                  </div>
                  
                  {/* 2021 Bar */}
                  <div className="flex flex-col items-center justify-end h-full">
                    <div className="text-white text-xs mb-2">3k</div>
                    <div className="w-12 bg-[#A365FF] h-[20%] rounded-t-md relative">
                    </div>
                    <div className="text-gray-400 text-xs mt-2">2021</div>
                  </div>
                  
                  {/* 2022 Bar */}
                  <div className="flex flex-col items-center justify-end h-full">
                    <div className="text-white text-xs mb-2">3k</div>
                    <div className="w-12 bg-[#A365FF] h-[30%] rounded-t-md relative">
                    </div>
                    <div className="text-gray-400 text-xs mt-2">2022</div>
                  </div>
                  
                  {/* 2023 Bar */}
                  <div className="flex flex-col items-center justify-end h-full">
                    <div className="text-white text-xs mb-2">6k</div>
                    <div className="w-12 bg-[#A365FF] h-[50%] rounded-t-md relative">
                    </div>
                    <div className="text-gray-400 text-xs mt-2">2023</div>
                  </div>
                  
                  {/* 2024 Bar */}
                  <div className="flex flex-col items-center justify-end h-full">
                    <div className="text-white text-xs mb-2">8k</div>
                    <div className="w-12 bg-[#A365FF] h-[65%] rounded-t-md relative">
                    </div>
                    <div className="text-gray-400 text-xs mt-2">2024</div>
                  </div>
                  
                  {/* 2025 Bar */}
                  <div className="flex flex-col items-center justify-end h-full">
                    <div className="text-white text-xs mb-2">10k</div>
                    <div className="w-12 bg-[#A365FF] h-[80%] rounded-t-md relative">
                    </div>
                    <div className="text-gray-400 text-xs mt-2">2025</div>
                  </div>
                </div>
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
    </DashboardLayout>
  );
}
