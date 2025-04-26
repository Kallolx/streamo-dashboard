"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { PencilSimple, Info } from "@phosphor-icons/react";
import RoyaltyDetailsModal from "@/components/Dashboard/models/RoyaltyDetailsModal";
import { extractRoyaltyData, RoyaltyData } from "@/services/csvAnalyticsService";
import { getCsvUploads } from "@/services/csvService";
import api from "@/services/api";

export default function RoyaltiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRoyalty, setSelectedRoyalty] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [royaltiesData, setRoyaltiesData] = useState<RoyaltyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Load CSV data on component mount
  useEffect(() => {
    const loadRoyaltyData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get the latest CSV upload
        const response = await getCsvUploads(1, 1, "-createdAt");
        
        if (response.uploads && response.uploads.length > 0) {
          const latestCsvId = response.uploads[0].id;
          
          // Get the CSV content
          const contentResponse = await api.get(`/csv/${latestCsvId}/content`);
          const csvContent = contentResponse.data.content;
          
          // Process the CSV data
          const royaltyData = extractRoyaltyData(csvContent);
          setRoyaltiesData(royaltyData);
        } else {
          // If no CSV uploaded, use demo data (provided in the CSV format)
          const demoData = `Statement Period,Transaction Month,Label,Artist,Parent Asset Title/Name,Child Asset Title/Name,Parent Asset Identifier,Child Asset Identifier,Release Catalog ID,Track Catalog ID,Format,Parent Asset ID,Child Asset ID,Account ID,Contract ID,Payee ID,Service,Channel,Territory,Quantity,Gross Revenue in USD,Mechanical Royalties Deducted,Contract Rate %,Net Revenue in USD,Your Share %,Amount Due in USD,Opening Balance in USD,Closing Balance in USD
2025-03,2024-12,Kishor Aive Official,Kishor Aive,Papi,Papi,,QZN882424335,,,Track,10844312,10844313,592185,792544,648298,Facebook Rights Manager,Claimed UGC,Saudi Arabia,5,0.0005730963,0,80,0.000458477,100,0.000458477,0.3649,1.035411153
2025-03,2024-05,Kishor Aive Official,Kishor Aive,Ami Morar Pore,Ami Morar Pore,,QZN882424490,,,Track,10844228,10844229,592185,792544,648298,Facebook Rights Manager,Claimed UGC,Singapore,1,0.000004186,0,80,0.0000033488,100,0.0000033488,,
2025-03,2024-12,Kishor Aive Official,Kishor Aive,Mukher Mayay Poira,Mukher Mayay Poira,,QZN882424492,,,Track,10844290,10844291,592185,792544,648298,Facebook Rights Manager,Claimed UGC,Bangladesh,13,0.0000200185,0,80,0.0000160148,100,0.0000160148,,
2025-03,2024-12,Kishor Aive Official,Kishor Aive,Diba Nishi Puri,Diba Nishi Puri,,QZN882424338,,,Track,10844357,10844358,592185,792544,648298,Facebook Audio Library,Digital Licensing,Bangladesh,263,0.0000058719,0,80,0.0000046975,100,0.0000046975,,
2025-03,2024-12,Kishor Aive Official,Dukhi Shahin,Beiman Priya,Beiman Priya,,QZN882424328,,,Track,10844251,10844252,592185,792544,648298,Facebook Audio Library,Digital Licensing,Cyprus,2,0.0000029166,0,80,0.0000023333,100,0.0000023333,,
2025-03,2024-12,Kishor Aive Official,Kishor Aive,Ruper Pori,Ruper Pori,,QZN882424329,,,Track,10844381,10844382,592185,792544,648298,Facebook Audio Library,Digital Licensing,Lebanon,1,0.0000002404,0,80,0.0000001923,100,0.0000001923,,
2025-03,2024-12,Kishor Aive Official,Kishor Aive,Bukeri Pajore,Bukeri Pajore,7316479320963,QZN882424368,,,Track,10844370,10844371,592185,792544,648298,Amazon Music Unlimited,Subscription Streaming,United Kingdom,1,0.0115615359,0,80,0.0092492287,100,0.0092492287,,
2025-03,2024-12,Kishor Aive Official,Dukhi Shahin,Adhek Bacha Adhek Mora,Adhek Bacha Adhek Mora,,QZN882424495,,,Track,10844236,10844237,592185,792544,648298,Facebook Audio Library,Digital Licensing,Iraq,1,0.0000002581,0,80,0.0000002065,100,0.0000002065,,
2025-03,2024-12,Kishor Aive Official,Dukhi Shahin,Beiman Priya,Beiman Priya,,QZN882424328,,,Track,10844251,10844252,592185,792544,648298,Facebook Audio Library,Digital Licensing,India,409,0.0000679647,0,80,0.0000543718,100,0.0000543718,,
2025-03,2024-12,Kishor Aive Official,Dukhi Shahin,Beiman,Beiman,,QZN882424489,,,Track,10844191,10844192,592185,792544,648298,Facebook Audio Library,Digital Licensing,Malaysia,64,0.0001257884,0,80,0.0001006307,100,0.0001006307,,
2025-03,2024-05,Kishor Aive Official,Kishor Aive,Ami Morar Pore,Ami Morar Pore,,QZN882424490,,,Track,10844228,10844229,592185,792544,648298,Facebook Rights Manager,Claimed UGC,United Arab Emirates,3,0.0000019205,0,80,0.0000015364,100,0.0000015364,,`;
          
          const royaltyData = extractRoyaltyData(demoData);
          setRoyaltiesData(royaltyData);
        }
      } catch (error) {
        console.error("Error loading royalty data:", error);
        setError("Failed to load royalty data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRoyaltyData();
  }, []);

  // Filter royalties based on search term
  const filteredRoyalties = royaltiesData.filter(
    royalty =>
      royalty.track.toLowerCase().includes(searchTerm.toLowerCase()) ||
      royalty.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      royalty.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRoyalties.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRoyalties.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Open modal with selected royalty
  const handleOpenModal = (royalty: any) => {
    setSelectedRoyalty(royalty);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRoyalty(null);
  };

  // Sort icons component
  const SortIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 13.3334V2.66675" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.33337 7.33341L8.00004 2.66675L12.6667 7.33341" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <DashboardLayout title="Royalty" subtitle="Manage all track royalties">
      <div className="mb-6">
        {/* Search Bar */}
        <div className="relative w-full md:w-80 mb-6">
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

        {/* Royalties Table */}
        <div className="bg-[#161A1F] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="text-red-500 mb-4">
                  <Info size={48} weight="light" />
                </div>
                <p className="text-gray-300 mb-2">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : filteredRoyalties.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <p className="text-gray-300 mb-2">No royalty data found</p>
                {searchTerm && (
                  <p className="text-gray-400">Try adjusting your search criteria</p>
                )}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-[#1A1E24]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <span>Track/Release</span>
                        <SortIcon />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <span>Artist Name</span>
                        <SortIcon />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Label
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Total Revenue
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Label's Split
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Artist's Split
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#161A1F] divide-y divide-gray-700">
                  {currentItems.map((royalty) => (
                    <tr 
                      key={royalty.id} 
                      className="hover:bg-[#1A1E24] cursor-pointer"
                      onClick={() => handleOpenModal(royalty)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-white">
                        {royalty.track}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-white">
                        {royalty.artist}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-white">
                        {royalty.label}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-white">
                        {royalty.revenue}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-white">
                        {royalty.labelSplit}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-white">
                        {royalty.artistSplit}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                        <button 
                          className="text-gray-400 hover:text-white transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(royalty);
                          }}
                        >
                          <PencilSimple size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination - Only show when there's data and we're not loading */}
          {!isLoading && !error && filteredRoyalties.length > 0 && (
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
                      {Math.min(indexOfLastItem, filteredRoyalties.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredRoyalties.length}</span> results
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
                    
                    {(() => {
                      // Calculate which page numbers to display
                      let startPage = Math.max(1, currentPage - 2);
                      let endPage = Math.min(totalPages, startPage + 4);
                      
                      // Adjust if at the end of the range
                      if (endPage - startPage < 4 && startPage > 1) {
                        startPage = Math.max(1, endPage - 4);
                      }
                      
                      const pages = [];
                      
                      // Add first page and ellipsis if needed
                      if (startPage > 1) {
                        pages.push(
                          <button
                            key={1}
                            onClick={() => handlePageChange(1)}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-700 bg-[#161A1F] text-gray-300 hover:bg-gray-700 text-sm font-medium"
                          >
                            1
                          </button>
                        );
                        
                        if (startPage > 2) {
                          pages.push(
                            <span key="start-ellipsis" className="relative inline-flex items-center px-3 py-2 text-gray-400 text-sm">
                              ...
                            </span>
                          );
                        }
                      }
                      
                      // Add the page numbers
                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => handlePageChange(i)}
                            className={`relative inline-flex items-center px-4 py-2 border ${
                              currentPage === i
                                ? "bg-purple-600 border-purple-500 text-white"
                                : "border-gray-700 bg-[#161A1F] text-gray-300 hover:bg-gray-700"
                            } text-sm font-medium`}
                          >
                            {i}
                          </button>
                        );
                      }
                      
                      // Add last page and ellipsis if needed
                      if (endPage < totalPages) {
                        if (endPage < totalPages - 1) {
                          pages.push(
                            <span key="end-ellipsis" className="relative inline-flex items-center px-3 py-2 text-gray-400 text-sm">
                              ...
                            </span>
                          );
                        }
                        
                        pages.push(
                          <button
                            key={totalPages}
                            onClick={() => handlePageChange(totalPages)}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-700 bg-[#161A1F] text-gray-300 hover:bg-gray-700 text-sm font-medium"
                          >
                            {totalPages}
                          </button>
                        );
                      }
                      
                      return pages;
                    })()}
                    
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
              <div className="hidden sm:flex items-center">
                <select
                  className="ml-4 bg-[#1A1E25] border border-gray-700 text-gray-300 text-sm rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Royalty Details Modal */}
      {selectedRoyalty && (
        <RoyaltyDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          royalty={{
            ...selectedRoyalty,
            // Add any additional data needed for the modal
            streams: selectedRoyalty.streams || 0,
            territories: selectedRoyalty.territories || [],
            services: selectedRoyalty.services || []
          }}
        />
      )}
    </DashboardLayout>
  );
}
