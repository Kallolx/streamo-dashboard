"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { MagnifyingGlass, Eye, Check, X, CaretDown } from "@phosphor-icons/react";
import DistributionDetailsModal from "@/components/Dashboard/models/DistributionDetailsModal";
import { getAllTracks, updateTrackStatus, Track, deleteTrack } from "@/services/trackService";
import { getAllReleases, updateReleaseStatus, Release, deleteRelease } from "@/services/releaseService";

// Toast component for notifications
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-md shadow-lg ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`}>
      <div className="flex-shrink-0 mr-3">
        {type === 'success' ? (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <div className="text-white">{message}</div>
      <button 
        onClick={onClose}
        className="ml-4 text-white hover:text-gray-300"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

// Extended interfaces to include properties we need that might not be in the original interfaces
interface ExtendedTrack extends Track {
  _id?: string;
  createdBy?: {
    name?: string;
    email?: string;
  };
}

interface ExtendedRelease extends Release {
  _id?: string;
  label?: string;
  createdBy?: {
    name?: string;
    email?: string;
  };
}

// Define distribution item types
type ItemType = 'track' | 'release';
type StatusType = "approved" | "pending" | "rejected" | "completed" | "submitted" | "processing";

// Interface for a unified distribution item
interface DistributionItem {
  id: string;
  itemType: ItemType;
  title: string;
  artist: string;
  label?: string;
  status: StatusType;
  createdAt?: string;
  userName?: string;
  originalData: any; // Store the original track/release data
}

// Interface for the distribution modal request
interface DistributionRequestForModal {
  id: string;
  userName: string;
  trackRelease: string;
  artist: string;
  label: string;
  status: string;
  itemType?: ItemType;
  originalData?: any;
  isrc?: string;
}

export default function DistributionPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [distributionData, setDistributionData] = useState<DistributionItem[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<DistributionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [artists, setArtists] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedLabel, setSelectedLabel] = useState("all");
  const [selectedArtist, setSelectedArtist] = useState("all");
  const [showApprovedItems, setShowApprovedItems] = useState(false);
  const itemsPerPage = 10;
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DistributionItem | null>(null);
  
  // Toast state
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  // Close toast
  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  // Fetch distribution data (tracks and releases)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch tracks and releases in parallel
        const [tracksResponse, releasesResponse] = await Promise.all([
          getAllTracks(),
          getAllReleases()
        ]);
        
        const tracks = tracksResponse.data || [];
        const releases = releasesResponse.data || [];
        
        // Convert tracks to DistributionItem format
        const trackItems: DistributionItem[] = tracks.map((track: ExtendedTrack) => ({
          id: track._id || '',
          itemType: 'track',
          title: track.title,
          artist: track.singer || track.artist,
          label: track.label || 'Unknown',
          status: track.status as StatusType || 'pending',
          createdAt: track.createdAt,
          userName: track.createdBy?.name || 'Unknown User',
          originalData: track
        }));
        
        // Convert releases to DistributionItem format
        const releaseItems: DistributionItem[] = releases.map((release: ExtendedRelease) => ({
          id: release._id || '',
          itemType: 'release',
          title: release.title,
          artist: release.singer || release.artist,
          label: release.label || 'Unknown',
          status: release.status as StatusType || 'pending',
          createdAt: release.createdAt,
          userName: release.createdBy?.name || 'Unknown User',
          originalData: release
        }));
        
        // Combine and set the distribution data
        const combinedData = [...trackItems, ...releaseItems];
        
        // Sort by creation date (newest first)
        combinedData.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA; // Descending order (newest first)
        });
        
        setDistributionData(combinedData);
        
        // Extract unique labels and artists for filters
        const allLabels = combinedData
          .map(item => item.label)
          .filter((label, index, self) => 
            label && self.indexOf(label) === index
          ) as string[];
        
        const allArtists = combinedData
          .map(item => item.artist)
          .filter((artist, index, self) => 
            artist && self.indexOf(artist) === index
          );
        
        setLabels(allLabels);
        setArtists(allArtists);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching distribution data:", err);
        setError("Failed to load distribution data. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Update status function
  const updateDistributionStatus = async (id: string, itemType: ItemType, newStatus: StatusType) => {
    try {
      // Call the appropriate service based on item type
      if (itemType === 'track') {
        await updateTrackStatus(id, newStatus);
      } else {
        await updateReleaseStatus(id, newStatus);
      }
      
      // Update local state after successful API call
      setDistributionData(prevData =>
        prevData.map(item => 
          item.id === id ? { ...item, status: newStatus } : item
        )
      );
      
      // Show success toast
      const statusText = newStatus === 'approved' ? 'approved' : 
                        newStatus === 'rejected' ? 'rejected' : newStatus;
      setToast({
        show: true,
        message: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} successfully ${statusText}.`,
        type: "success",
      });
      
    } catch (err) {
      console.error(`Error updating ${itemType} status:`, err);
      
      // Show error toast
      setToast({
        show: true,
        message: `Failed to update ${itemType} status. Please try again.`,
        type: "error",
      });
    }
  };

  // Handle view request details
  const handleViewDetails = (request: DistributionItem) => {
    setSelectedRequest(request);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setSelectedRequest(null);
  };

  // Apply all filters
  const applyFilters = () => {
    // This will close the filter modal
    setShowFilters(false);
  };

  // Filter distribution requests based on search term and selected filters
  const filteredRequests = distributionData.filter(
    (item) => {
      // Search filter
      const matchesSearch = 
        (item.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (item.artist?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (item.userName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (item.label?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = 
        selectedStatus === "all" || 
        (selectedStatus === "pending" && (item.status === "pending" || item.status === "submitted" || item.status === "processing")) ||
        item.status === selectedStatus;
      
      // Label filter
      const matchesLabel = 
        selectedLabel === "all" || 
        item.label === selectedLabel;
      
      // Artist filter
      const matchesArtist = 
        selectedArtist === "all" || 
        item.artist === selectedArtist;
      
      // Hide approved items filter
      const matchesApprovedFilter = 
        showApprovedItems || 
        item.status !== "approved";
      
      return matchesSearch && matchesStatus && matchesLabel && matchesArtist && matchesApprovedFilter;
    }
  );

  // Get status display name
  const getStatusDisplay = (status: StatusType): string => {
    if (status === "submitted" || status === "processing") {
      return "Pending";
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

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

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  // Delete distribution item
  const deleteDistributionItem = async (id: string, itemType: ItemType) => {
    try {
      // Call the appropriate service based on item type
      if (itemType === 'track') {
        await deleteTrack(id);
      } else {
        await deleteRelease(id);
      }
      
      // Update local state after successful API call
      setDistributionData(prevData => prevData.filter(item => item.id !== id));
      
      // Close delete confirmation modal
      setShowDeleteConfirmModal(false);
      setItemToDelete(null);
      
      // Show success message in toast
      setToast({
        show: true,
        message: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} successfully deleted.`,
        type: "success",
      });
      
    } catch (err) {
      console.error(`Error deleting ${itemType}:`, err);
      
      // Show error message in toast
      setToast({
        show: true,
        message: `Failed to delete ${itemType}. Please try again.`,
        type: "error",
      });
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (item: DistributionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete(item);
    setShowDeleteConfirmModal(true);
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setItemToDelete(null);
  };

  // Handle approve button click
  const handleApprove = (item: DistributionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    updateDistributionStatus(item.id, item.itemType, "approved");
  };
  
  // Handle reject button click
  const handleReject = (item: DistributionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    updateDistributionStatus(item.id, item.itemType, "rejected");
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
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-gray-400">
                {error}
              </div>
            ) : (
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
                      Type
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
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                        No distribution items found
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((item) => (
                      <tr 
                        key={`${item.itemType}-${item.id}`} 
                        className="hover:bg-[#1A1E24] cursor-pointer"
                        onClick={() => handleViewDetails(item)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-white">
                          {item.userName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-white">
                          {item.title}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-white">
                          {item.artist}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-white">
                          {item.label || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-white capitalize">
                          {item.itemType === 'track' ? 'Video' : item.itemType}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`${
                            item.status === "approved" || item.status === "completed"
                              ? "text-green-400" 
                              : item.status === "rejected"
                              ? "text-red-400"
                              : "text-gray-400"
                          }`}>
                            {getStatusDisplay(item.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex justify-center space-x-2" onClick={(e) => e.stopPropagation()}>
                            {(item.status === "pending" || item.status === "submitted" || item.status === "processing") && (
                              <>
                                <button 
                                  className="text-green-400 hover:text-green-300 transition-colors"
                                  onClick={(e) => handleApprove(item, e)}
                                >
                                  <Check size={20} weight="bold" />
                                </button>
                                <button 
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                  onClick={(e) => handleReject(item, e)}
                                >
                                  <X size={20} weight="bold" />
                                </button>
                              </>
                            )}
                            <button 
                              className="text-gray-400 hover:text-white transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(item);
                              }}
                            >
                              <Eye size={20} />
                            </button>
                            <button 
                              className="text-red-400 hover:text-red-300 transition-colors"
                              onClick={(e) => handleDeleteClick(item, e)}
                              title="Delete"
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 5.98C17.67 5.65 14.32 5.48 10.98 5.48C9 5.48 7.02 5.58 5.04 5.78L3 5.98" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M8.5 4.97L8.72 3.66C8.88 2.71 9 2 10.69 2H13.31C15 2 15.13 2.75 15.28 3.67L15.5 4.97" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M18.85 9.14L18.2 19.21C18.09 20.78 18 22 15.21 22H8.79C6 22 5.91 20.78 5.8 19.21L5.15 9.14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M10.33 16.5H13.66" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M9.5 12.5H14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && !error && filteredRequests.length > 0 && (
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
          )}
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
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
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
                
                {/* Show Approved Items Toggle */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showApprovedItems"
                    checked={showApprovedItems}
                    onChange={() => setShowApprovedItems(!showApprovedItems)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-700"
                  />
                  <label htmlFor="showApprovedItems" className="ml-2 block text-sm text-white">
                    Show approved items
                  </label>
                </div>
                
                {/* Label */}
                <div>
                  <p className="text-sm text-white mb-2">Label</p>
                  <div className="relative">
                    <select
                      className="w-full p-2 pl-4 pr-10 bg-[#1D2229] border border-gray-700 rounded text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 appearance-none"
                      value={selectedLabel}
                      onChange={(e) => setSelectedLabel(e.target.value)}
                    >
                      <option value="all">All Labels</option>
                      {labels.map((label) => (
                        <option key={label} value={label}>
                          {label}
                        </option>
                      ))}
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
                      value={selectedArtist}
                      onChange={(e) => setSelectedArtist(e.target.value)}
                    >
                      <option value="all">All Artists</option>
                      {artists.map((artist) => (
                        <option key={artist} value={artist}>
                          {artist}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <CaretDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center pt-4">
                  <button
                    className="px-8 py-2 bg-[#A365FF] text-white rounded-md hover:bg-purple-700 transition-colors"
                    onClick={applyFilters}
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
            request={{
              id: selectedRequest.id,
              userName: selectedRequest.userName || '',
              trackRelease: selectedRequest.title,
              artist: selectedRequest.artist,
              label: selectedRequest.label || '',
              status: getStatusDisplay(selectedRequest.status) as "Approved" | "Pending" | "Rejected" | "Completed",
              itemType: selectedRequest.itemType,
              originalData: selectedRequest.originalData,
              isrc: selectedRequest.originalData?.isrc || ''
            }}
            isOpen={!!selectedRequest}
            onClose={handleCloseModal}
            onApprove={(id) => {
              updateDistributionStatus(id, selectedRequest.itemType, "approved");
              handleCloseModal();
            }}
            onReject={(id) => {
              updateDistributionStatus(id, selectedRequest.itemType, "rejected");
              handleCloseModal();
            }}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmModal && itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop with blur */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={cancelDelete}
            ></div>
            
            {/* Confirmation Modal */}
            <div className="relative w-full max-w-md bg-[#161A1F] rounded-lg shadow-lg overflow-hidden z-10">
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h3 className="text-lg font-medium text-white">Confirm Delete</h3>
                <button 
                  onClick={cancelDelete}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6">
                <p className="text-white">
                  Are you sure you want to delete the {itemToDelete.itemType} <span className="font-semibold">{itemToDelete.title}</span>?
                </p>
                <p className="text-red-400 mt-2 text-sm">
                  This action cannot be undone.
                </p>
                
                <div className="flex justify-end mt-6 space-x-3">
                  <button
                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                    onClick={cancelDelete}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    onClick={() => deleteDistributionItem(itemToDelete.id, itemToDelete.itemType)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast notification */}
        {toast.show && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={closeToast} 
          />
        )}
      </div>
    </DashboardLayout>
  );
}
