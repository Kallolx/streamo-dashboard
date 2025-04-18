"use client";

import React, { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { MagnifyingGlass, Eye, Check, X, CaretDown } from "@phosphor-icons/react";
import DistributionDetailsModal from "@/components/Dashboard/models/DistributionDetailsModal";

// Define distribution status type
type StatusType = "Approved" | "Pending" | "Rejected" | "Completed";

// Mock data for distribution requests with type
interface DistributionRequest {
  id: number;
  userName: string;
  trackRelease: string;
  artist: string;
  label: string;
  status: StatusType;
}

// Initial mock data
const initialDistributionData: DistributionRequest[] = [
  { id: 1, userName: "Steven Wilson", trackRelease: "The Overview", artist: "Steven Wilson", label: "Fiction Records", status: "Approved" },
  { id: 2, userName: "Linkin Park", trackRelease: "The Overview", artist: "Steven Wilson", label: "Fiction Records", status: "Pending" },
  { id: 3, userName: "Steven Wilson", trackRelease: "The Overview", artist: "Steven Wilson", label: "Fiction Records", status: "Rejected" },
  { id: 4, userName: "Linkin Park", trackRelease: "The Overview", artist: "Steven Wilson", label: "Fiction Records", status: "Pending" },
  { id: 5, userName: "Steven Wilson", trackRelease: "The Overview", artist: "Steven Wilson", label: "Fiction Records", status: "Pending" },
  { id: 6, userName: "Linkin Park", trackRelease: "The Overview", artist: "Steven Wilson", label: "Fiction Records", status: "Completed" },
  { id: 7, userName: "Steven Wilson", trackRelease: "The Overview", artist: "Steven Wilson", label: "Fiction Records", status: "Pending" },
  { id: 8, userName: "Linkin Park", trackRelease: "The Overview", artist: "Steven Wilson", label: "Fiction Records", status: "Pending" },
  { id: 9, userName: "Steven Wilson", trackRelease: "The Overview", artist: "Steven Wilson", label: "Fiction Records", status: "Pending" },
  { id: 10, userName: "Steven Wilson", trackRelease: "The Overview", artist: "Steven Wilson", label: "Fiction Records", status: "Pending" },
];

export default function DistributionPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [distributionData, setDistributionData] = useState<DistributionRequest[]>(initialDistributionData);
  const [selectedRequest, setSelectedRequest] = useState<DistributionRequest | null>(null);
  const itemsPerPage = 10;

  // Update status function
  const updateDistributionStatus = (id: number, newStatus: StatusType) => {
    setDistributionData(
      distributionData.map((request) => 
        request.id === id ? { ...request, status: newStatus } : request
      )
    );
  };

  // Handle view request details
  const handleViewDetails = (request: DistributionRequest) => {
    setSelectedRequest(request);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setSelectedRequest(null);
  };

  // Filter distribution requests based on search term
  const filteredRequests = distributionData.filter(
    (request) =>
      request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.trackRelease.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Toggle filter modal
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <DashboardLayout title="Distribution" subtitle="Manage all distribution requests">
      <div className="relative">
        {/* Search Bar with Filter Button */}
        <div className="flex items-center mb-6">
          <div className="relative flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full py-2 px-4 pl-10 rounded-md bg-[#1D2229] text-gray-300 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlass 
                size={20}
                className="absolute left-3 top-2.5 text-gray-400" 
              />
            </div>
          </div>
          <button 
            className="p-2 bg-[#A365FF] rounded-md ml-2"
            onClick={toggleFilters}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 8.5V13.5C22 19 20 21 14.5 21H9.5C4 21 2 19 2 13.5V8.5C2 3 4 1 9.5 1H14.5C20 1 22 3 22 8.5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 9.5H17" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 14.5H14" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Distribution Requests Table */}
        <div className="bg-[#161A1F] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[#1A1E24]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    User Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Track/Release
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Artist
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Label
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#161A1F] divide-y divide-gray-700">
                {currentItems.map((request) => (
                  <tr 
                    key={request.id} 
                    className="hover:bg-[#1A1E24] cursor-pointer"
                    onClick={() => handleViewDetails(request)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-white">
                      {request.userName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-white">
                      {request.trackRelease}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-white">
                      {request.artist}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-white">
                      {request.label}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`${
                        request.status === "Approved" 
                          ? "text-green-400" 
                          : request.status === "Rejected"
                          ? "text-red-400"
                          : request.status === "Completed"
                          ? "text-green-400"
                          : "text-gray-400"
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex justify-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        {request.status === "Pending" && (
                          <>
                            <button 
                              className="text-green-400 hover:text-green-300 transition-colors"
                              onClick={() => updateDistributionStatus(request.id, "Approved")}
                            >
                              <Check size={20} weight="bold" />
                            </button>
                            <button 
                              className="text-red-400 hover:text-red-300 transition-colors"
                              onClick={() => updateDistributionStatus(request.id, "Rejected")}
                            >
                              <X size={20} weight="bold" />
                            </button>
                          </>
                        )}
                        <button 
                          className="text-gray-400 hover:text-white transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(request);
                          }}
                        >
                          <Eye size={20} />
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
                    {Math.min(indexOfLastItem, filteredRequests.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredRequests.length}</span> results
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
            <div className="hidden sm:flex items-center">
              <select
                className="ml-4 bg-[#1A1E25] border border-gray-700 text-gray-300 text-sm rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                defaultValue="10"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Modal with Backdrop Blur */}
        {showFilters && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop with blur */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={toggleFilters}
            ></div>
            
            {/* Filter Modal */}
            <div className="relative w-full max-w-md bg-[#161A1F] rounded-lg shadow-lg overflow-hidden z-10">
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h3 className="text-lg font-medium text-white">Filters</h3>
                <button 
                  onClick={toggleFilters}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-4 space-y-4">                
                {/* Status */}
                <div>
                  <p className="text-sm text-white mb-2">Status</p>
                  <div className="relative">
                    <select
                      className="w-full p-2 pl-4 pr-10 bg-[#1D2229] border border-gray-700 rounded text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 appearance-none"
                    >
                      <option value="all">All</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                      <option value="completed">Completed</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <CaretDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                {/* Label */}
                <div>
                  <p className="text-sm text-white mb-2">Label</p>
                  <div className="relative">
                    <select
                      className="w-full p-2 pl-4 pr-10 bg-[#1D2229] border border-gray-700 rounded text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 appearance-none"
                    >
                      <option value="all">All Labels</option>
                      <option value="fiction">Fiction Records</option>
                      <option value="universal">Universal Music</option>
                      <option value="sony">Sony Music</option>
                      <option value="warner">Warner Records</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <CaretDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                {/* Artist */}
                <div>
                  <p className="text-sm text-white mb-2">Artist</p>
                  <div className="relative">
                    <select
                      className="w-full p-2 pl-4 pr-10 bg-[#1D2229] border border-gray-700 rounded text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 appearance-none"
                    >
                      <option value="all">All Artists</option>
                      <option value="steven">Steven Wilson</option>
                      <option value="linkin">Linkin Park</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <CaretDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center pt-4">
                  <button
                    className="px-8 py-2 bg-[#A365FF] text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Distribution Details Modal */}
        {selectedRequest && (
          <DistributionDetailsModal
            request={selectedRequest}
            isOpen={!!selectedRequest}
            onClose={handleCloseModal}
            onApprove={(id) => {
              updateDistributionStatus(id, "Approved");
              handleCloseModal();
            }}
            onReject={(id) => {
              updateDistributionStatus(id, "Rejected");
              handleCloseModal();
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
