"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { getAllStores, Store } from "@/services/storeService";

// Tab interface for the modal
type TabType = "details" | "track-list";

// Interface for the release data
interface Release {
  _id: string;
  title: string;
  artist: string;
  coverArt: string;
  releaseType: string;
  genre: string;
  releaseDate: string;
  status: string;
  tracks: any[];
  stores: string[];
  language?: string;
  upc?: string;
  featuredArtist?: string;
  composer?: string;
  lyricist?: string;
  musicProducer?: string;
  publisher?: string;
  singer?: string;
  musicDirector?: string;
  copyrightHeader?: string;
  pricing?: string;
  createdAt: string;
  updatedAt: string;
}

// Props interface for the modal
interface ReleaseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  release: Release;
  onApprove: (releaseId: string) => void;
  onReject: (releaseId: string) => void;
  onDelete: (releaseId: string) => void;
  userRole?: 'admin' | 'superadmin' | 'artist' | 'label';
}

export default function ReleaseDetailsModal({
  isOpen,
  onClose,
  release,
  onApprove,
  onReject,
  onDelete,
  userRole = 'artist'
}: ReleaseDetailsModalProps) {
  // State variables
  const [currentTab, setCurrentTab] = useState<TabType>("details");
  const [storeMap, setStoreMap] = useState<Record<string, Store>>({});
  const [storesLoading, setStoresLoading] = useState(true);
  
  // Default image fallback if release has no cover art
  const defaultImage = "/images/music/placeholder.png";

  // Fetch stores when modal opens
  useEffect(() => {
    if (isOpen && release.stores.length > 0) {
      const fetchStores = async () => {
        try {
          setStoresLoading(true);
          const response = await getAllStores();
          if (response.success && response.data) {
            // Create a map of store IDs to store objects for quick lookup
            const storesById: Record<string, Store> = {};
            response.data.forEach((store: Store) => {
              if (store._id) {
                storesById[store._id] = store;
              }
            });
            setStoreMap(storesById);
          }
        } catch (error) {
          console.error('Error fetching stores:', error);
        } finally {
          setStoresLoading(false);
        }
      };
      
      fetchStores();
    }
  }, [isOpen, release.stores]);

  // Handle close with Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  // Add event listener for keyboard events
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // Helper function to get store name from ID
  const getStoreName = (storeId: string) => {
    if (storeMap[storeId]) {
      return storeMap[storeId].name;
    }
    return storeId; // Fallback to ID if name not found
  };

  // Handle approval
  const handleApprove = () => {
    onApprove(release._id);
  };

  // Handle rejection
  const handleReject = () => {
    onReject(release._id);
  };
  
  // Handle deletion
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this release? This action cannot be undone.")) {
      onDelete(release._id);
    }
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative z-10 bg-[#111417] rounded-lg overflow-hidden shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col mt-16 transform transition-all mx-4 sm:mx-auto">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
          onClick={onClose}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header with album art and basic info */}
        <div className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row">
            {/* Left side - Album Art */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 relative rounded-md overflow-hidden mx-auto sm:mx-0 sm:mr-6 flex-shrink-0 bg-gray-800 mb-4 sm:mb-0">
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-center p-2">
                <svg 
                  className="w-16 h-16 text-gray-600 mb-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1} 
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" 
                  />
                </svg>
                <span className="text-xs text-gray-400">Album Artwork</span>
              </div>
            </div>

            {/* Right side - Title and Info */}
            <div className="flex-1 flex flex-col">
              {/* Title and ID */}
              <div className="mb-4 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-semibold text-white mr-2">
                    {release.title || "Untitled Release"}
                  </h2>
                  <span className="text-gray-400 text-sm">{release.releaseType}</span>
                </div>
                <div className="mt-1 text-sm text-gray-400">
                  {release.artist}
                </div>

                {/* Status Badge */}
                <div className="mt-2 mb-1">
                  <div
                    className={`flex items-center px-3 py-1.5 rounded-md text-sm ${
                      release.status === "approved"
                        ? "bg-green-900/50 text-green-200 border border-green-700"
                        : release.status === "rejected"
                        ? "bg-red-900/50 text-red-200 border border-red-700"
                        : release.status === "processing" || release.status === "submitted"
                        ? "bg-yellow-900/50 text-yellow-200 border border-yellow-700"
                        : "bg-gray-800/50 text-gray-200 border border-gray-700"
                    }`}
                  >
                    <span className="mr-1.5">
                      {release.status === "approved" ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                      ) : release.status === "rejected" ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                        </svg>
                      )}
                    </span>
                    <span className="capitalize font-medium">
                      {release.status === "approved" 
                        ? "Approved - Ready for distribution" 
                        : release.status === "rejected"
                        ? "Rejected - Please check with admin"
                        : release.status === "submitted" || release.status === "processing"
                        ? "Pending approval - Please wait for admin review"
                        : release.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Distribution Platforms */}
              {release.stores && release.stores.length > 0 && (
                <div className="mt-2 mb-4">
                  <h3 className="text-sm text-gray-400 mb-1">Distribution Platforms</h3>
                  <div className="flex flex-wrap gap-2">
                    {storesLoading ? (
                      <div className="text-xs text-gray-400">Loading stores...</div>
                    ) : (
                      release.stores.map(storeId => (
                        <span key={storeId} className="inline-flex items-center px-2 py-1 bg-[#1D2229] rounded-md text-xs text-white">
                          {getStoreName(storeId)}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs for navigation */}
        <div className="flex px-4 sm:px-5 py-2 gap-2 mb-2">
          <button
            className={`px-3 sm:px-5 py-2 rounded-full text-sm ${
              currentTab === "details"
                ? "bg-[#A365FF] text-white"
                : "bg-[#1A1E24] text-gray-300"
            }`}
            onClick={() => setCurrentTab("details")}
          >
            Details
          </button>
          <button
            className={`px-3 sm:px-5 py-2 rounded-full text-sm ${
              currentTab === "track-list"
                ? "bg-[#A365FF] text-white"
                : "bg-[#1A1E24] text-gray-300"
            }`}
            onClick={() => setCurrentTab("track-list")}
          >
            Track list
          </button>
        </div>

        {/* Content Area */}
        <div className="flex flex-col flex-1 overflow-auto">
          {/* Tab Content */}
          <div className="px-4 sm:px-5 pb-5 flex-1 overflow-y-auto">
            {currentTab === "details" ? (
              <div className="flex flex-col">
                {/* All Metadata Section */}
                <div className="mb-4">
                  <h3 className="text-white text-md font-medium mb-4">Release Metadata</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Artist */}
                    <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                      <h3 className="text-gray-400 text-xs sm:text-sm">Artist</h3>
                      <p className="text-white text-sm sm:text-base font-medium truncate">
                        {release.artist || "Unknown Artist"}
                      </p>
                    </div>

                    {/* Featured Artist */}
                    {release.featuredArtist && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Featured Artist</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {release.featuredArtist}
                        </p>
                      </div>
                    )}

                    {/* Genre */}
                    <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                      <h3 className="text-gray-400 text-xs sm:text-sm">Genre</h3>
                      <p className="text-white text-sm sm:text-base font-medium truncate">
                        {release.genre || "Unspecified"}
                      </p>
                    </div>

                    {/* Language */}
                    {release.language && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Language</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {release.language}
                        </p>
                      </div>
                    )}

                    {/* UPC */}
                    {release.upc && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">UPC</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {release.upc}
                        </p>
                      </div>
                    )}

                    {/* Release Date */}
                    <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                      <h3 className="text-gray-400 text-xs sm:text-sm">Release Date</h3>
                      <p className="text-white text-sm sm:text-base font-medium truncate">
                        {formatDate(release.releaseDate)}
                      </p>
                    </div>
                    
                    {/* Composer */}
                    {release.composer && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Composer</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {release.composer}
                        </p>
                      </div>
                    )}
                    
                    {/* Lyricist */}
                    {release.lyricist && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Lyricist</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {release.lyricist}
                        </p>
                      </div>
                    )}
                    
                    {/* Music Producer */}
                    {release.musicProducer && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Music Producer</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {release.musicProducer}
                        </p>
                      </div>
                    )}
                    
                    {/* Publisher */}
                    {release.publisher && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Publisher</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {release.publisher}
                        </p>
                      </div>
                    )}
                    
                    {/* Singer */}
                    {release.singer && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Singer</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {release.singer}
                        </p>
                      </div>
                    )}
                    
                    {/* Music Director */}
                    {release.musicDirector && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Music Director</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {release.musicDirector}
                        </p>
                      </div>
                    )}
                    
                    {/* Pricing */}
                    {release.pricing && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Pricing</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {release.pricing}
                        </p>
                      </div>
                    )}
                    
                    {/* Created Date */}
                    <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                      <h3 className="text-gray-400 text-xs sm:text-sm">Created</h3>
                      <p className="text-white text-sm sm:text-base font-medium truncate">
                        {formatDate(release.createdAt)}
                      </p>
                    </div>
                    
                    {/* Last Updated */}
                    <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                      <h3 className="text-gray-400 text-xs sm:text-sm">Last Updated</h3>
                      <p className="text-white text-sm sm:text-base font-medium truncate">
                        {formatDate(release.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#1A1E24] p-3 sm:p-4 rounded-sm">
                {/* Track list table with headers */}
                {release.tracks && release.tracks.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="pb-2 pr-6">
                            <div className="text-xs sm:text-sm text-indigo-400">
                              Title
                            </div>
                          </th>
                          <th className="pb-2">
                            <div className="text-xs sm:text-sm text-indigo-400">
                              Artist Name
                            </div>
                          </th>
                          <th className="pb-2">
                            <div className="text-xs sm:text-sm text-indigo-400">
                              Duration
                            </div>
                          </th>
                          <th className="pb-2">
                            <div className="text-xs sm:text-sm text-indigo-400">
                              Status
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {release.tracks.map((track, index) => (
                          <tr key={index} className="border-b border-gray-800">
                            <td className="py-2 sm:py-3 text-white text-xs sm:text-sm">
                              {track.title}
                            </td>
                            <td className="py-2 sm:py-3 text-white text-xs sm:text-sm">
                              {track.artistName}
                            </td>
                            <td className="py-2 sm:py-3 text-white text-xs sm:text-sm">
                              {track.duration || "-"}
                            </td>
                            <td className="py-2 sm:py-3">
                              <span className={`text-xs sm:text-sm ${
                                release.status === 'approved' ? 'text-green-400' :
                                release.status === 'rejected' ? 'text-red-400' :
                                release.status === 'processing' ? 'text-blue-400' :
                                'text-yellow-400'
                              }`}>
                                {release.status.charAt(0).toUpperCase() + release.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    No tracks found for this release.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex p-4 space-x-3 justify-center sm:justify-start flex-wrap">
            {/* Admin/SuperAdmin actions for processing/submitted releases */}
            {(userRole === 'admin' || userRole === 'superadmin') && 
             (release.status === "processing" || release.status === "submitted") && (
              <>
                <button
                  onClick={handleReject}
                  className="flex items-center justify-center px-3 sm:px-4 py-2 border border-red-700 text-red-500 rounded-md hover:bg-red-900 hover:bg-opacity-30 transition-colors text-sm"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Reject
                </button>

                <button
                  onClick={handleApprove}
                  className="flex items-center justify-center px-3 sm:px-4 py-2 border border-green-700 text-green-500 rounded-md hover:bg-green-900 hover:bg-opacity-30 transition-colors text-sm"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Approve
                </button>
              </>
            )}
            
            {/* Distribution button - only for submitted releases */}
            {release.status === 'submitted' && (
              <button
                onClick={() => window.location.href = `/dashboard/distribution?releaseId=${release._id}`}
                className="flex items-center justify-center px-3 sm:px-4 py-2 bg-[#A365FF] text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
                    clipRule="evenodd"
                  />
                </svg>
                Manage Releases
              </button>
            )}
            
            {/* Close button for all users */}
            <button
              onClick={onClose}
              className="flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-700 text-gray-400 rounded-md hover:bg-gray-800 transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
