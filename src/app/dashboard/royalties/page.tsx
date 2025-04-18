"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { PencilSimple } from "@phosphor-icons/react";
import RoyaltyDetailsModal from "@/components/Dashboard/models/RoyaltyDetailsModal";

// Mock data for royalties
const royaltiesData = [
  { id: 1, track: "The Overview", artist: "Steven Wilson", label: "Fiction Records", revenue: "$3,500", labelSplit: "50%", artistSplit: "50%", imageSrc: "/images/music/1.png" },
  { id: 2, track: "The Overview", artist: "Linkin Park", label: "Fiction Records", revenue: "$3,500", labelSplit: "50%", artistSplit: "50%", imageSrc: "/images/music/2.png" },
  { id: 3, track: "The Overview", artist: "Steven Wilson", label: "Fiction Records", revenue: "$3,500", labelSplit: "50%", artistSplit: "50%", imageSrc: "/images/music/3.png" },
  { id: 4, track: "The Overview", artist: "Linkin Park", label: "Fiction Records", revenue: "$3,500", labelSplit: "50%", artistSplit: "50%", imageSrc: "/images/music/4.png" },
  { id: 5, track: "The Overview", artist: "Steven Wilson", label: "Fiction Records", revenue: "$3,500", labelSplit: "50%", artistSplit: "50%", imageSrc: "/images/music/5.png" },
  { id: 6, track: "The Overview", artist: "Linkin Park", label: "Fiction Records", revenue: "$3,500", labelSplit: "50%", artistSplit: "50%", imageSrc: "/images/music/1.png" },
  { id: 7, track: "The Overview", artist: "Steven Wilson", label: "Fiction Records", revenue: "$3,500", labelSplit: "50%", artistSplit: "50%", imageSrc: "/images/music/2.png" },
  { id: 8, track: "The Overview", artist: "Linkin Park", label: "Fiction Records", revenue: "$3,500", labelSplit: "50%", artistSplit: "50%", imageSrc: "/images/music/3.png" },
  { id: 9, track: "The Overview", artist: "Steven Wilson", label: "Fiction Records", revenue: "$3,500", labelSplit: "50%", artistSplit: "50%", imageSrc: "/images/music/4.png" },
  { id: 10, track: "The Overview", artist: "Linkin Park", label: "Fiction Records", revenue: "$3,500", labelSplit: "50%", artistSplit: "50%", imageSrc: "/images/music/5.png" },
];

export default function RoyaltiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRoyalty, setSelectedRoyalty] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 10;

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
      </div>

      {/* Royalty Details Modal */}
      {selectedRoyalty && (
        <RoyaltyDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          royalty={selectedRoyalty}
        />
      )}
    </DashboardLayout>
  );
}
