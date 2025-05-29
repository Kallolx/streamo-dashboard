"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { getAllStores, Store } from "@/services/storeService";

// Tab interfaces for the modal
type TabType = "details" | "play";

// Interface for the video data
interface Video {
  _id: string;
  title: string;
  artist: string;
  primaryArtist?: string;
  imageSrc?: string;
  genre: string;
  contentRating: string;

  releaseDate: string;
  status: string;
  stores?: string[];
  isrc?: string;
  upc?: string;
  label?: string;
  subgenre?: string;
  featuredArtist?: string;
  remixerArtist?: string;
  composer?: string;
  lyricist?: string;
  musicProducer?: string;
  publisher?: string;
  singer?: string;
  musicDirector?: string;
  copyrightHeader?: string;
  featuredArtists?: string[];
  releaseType?: string;
  format?: string;
  language?: string;
  recordingYear?: string;
  type?: string;
  version?: string;
  pricing?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  coverArt?: string;
  videoFile?: string;
  originalData?: Video;
  // New metadata fields
  publisherName?: string;
  publisherIPI?: string;
  lineProducer?: string;
  lineYear?: string;
  producer?: string;
  productionCompany?: string;
  previouslyReleased?: boolean;
  madeForKids?: boolean;
  contentIdYoutube?: boolean;
  visibilityYoutube?: boolean;
  exclusiveRights?: boolean;
  tags?: string[];
  publisherNames?: string[];
  description?: string;
}

// Props interface for the modal
interface VideoDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: Video;
  onApprove?: (videoId: string) => void;
  onReject?: (videoId: string) => void;
  onDelete?: (videoId: string) => void;
  userRole?: 'admin' | 'superadmin' | 'artist' | 'label';
}

export default function VideoDetailsModal({
  isOpen,
  onClose,
  video: initialVideo,
  onApprove,
  onReject,
  onDelete,
  userRole = 'artist'
}: VideoDetailsModalProps) {
  // State variables
  const [currentTab, setCurrentTab] = useState<TabType>("details");
  const [storeMap, setStoreMap] = useState<Record<string, Store>>({});
  const [storesLoading, setStoresLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [video, setVideo] = useState<Video>(initialVideo);
  
  // Default image fallback if video has no image
  const defaultImage = "/images/music/placeholder.png";

  // Debug logging to help diagnose issues
  useEffect(() => {
    if (isOpen) {
      console.log("Initial video data:", initialVideo);
      
      // Create a clean copy of initialVideo with properly formatted URLs
      const processedVideo = { ...initialVideo };
      
      // Process boolean fields to ensure they're proper booleans
      processedVideo.previouslyReleased = String(processedVideo.previouslyReleased) === "true";
      processedVideo.madeForKids = String(processedVideo.madeForKids) === "true";
      processedVideo.contentIdYoutube = String(processedVideo.contentIdYoutube) === "true";
      processedVideo.visibilityYoutube = String(processedVideo.visibilityYoutube) === "true";
      processedVideo.exclusiveRights = String(processedVideo.exclusiveRights) === "true";
      
      // For coverArt - Check if it's already an S3 URL
      if (processedVideo.coverArt && processedVideo.coverArt.includes('amazonaws.com')) {
        // If it's already an S3 URL but has localhost prefix, extract just the S3 part
        if (processedVideo.coverArt.includes('localhost') && processedVideo.coverArt.includes('https://')) {
          const s3Match = processedVideo.coverArt.match(/(https:\/\/.*amazonaws\.com\/.*)/);
          if (s3Match && s3Match[1]) {
            processedVideo.coverArt = s3Match[1];
            console.log('Cleaned coverArt URL:', processedVideo.coverArt);
          }
        }
      }
      
      // For videoFile - Check if it's already an S3 URL
      if (processedVideo.videoFile && processedVideo.videoFile.includes('amazonaws.com')) {
        // If it's already an S3 URL but has localhost prefix, extract just the S3 part
        if (processedVideo.videoFile.includes('localhost') && processedVideo.videoFile.includes('https://')) {
          const s3Match = processedVideo.videoFile.match(/(https:\/\/.*amazonaws\.com\/.*)/);
          if (s3Match && s3Match[1]) {
            processedVideo.videoFile = s3Match[1];
            console.log('Cleaned videoFile URL:', processedVideo.videoFile);
          }
        }
      }
      
      setVideo(processedVideo);
      
      // Add code to retrieve the full video data if necessary
      const fetchFullVideoData = async () => {
        try {
          console.log("Fetching complete video data for ID:", initialVideo._id);
          // Import the necessary service
          const { getTrackById } = await import('@/services/trackService');
          
          // Use a fixed endpoint if localhost is causing issues
          const response = await getTrackById(initialVideo._id);
          
          if (response.success && response.data) {
            console.log("Fetched complete video data:", response.data);
            
            // Process response data to ensure clean URLs
            const apiVideo = { ...response.data };
            
            // Process boolean fields to ensure they're proper booleans
            apiVideo.previouslyReleased = String(apiVideo.previouslyReleased) === "true";
            apiVideo.madeForKids = String(apiVideo.madeForKids) === "true";
            apiVideo.contentIdYoutube = String(apiVideo.contentIdYoutube) === "true";
            apiVideo.visibilityYoutube = String(apiVideo.visibilityYoutube) === "true";
            apiVideo.exclusiveRights = String(apiVideo.exclusiveRights) === "true";
            
            // Clean coverArt URL if present
            if (apiVideo.coverArt && apiVideo.coverArt.includes('amazonaws.com')) {
              if (apiVideo.coverArt.includes('localhost') && apiVideo.coverArt.includes('https://')) {
                const s3Match = apiVideo.coverArt.match(/(https:\/\/.*amazonaws\.com\/.*)/);
                if (s3Match && s3Match[1]) {
                  apiVideo.coverArt = s3Match[1];
                  console.log('Cleaned API coverArt URL:', apiVideo.coverArt);
                }
              }
            }
            
            // Clean videoFile URL if present
            if (apiVideo.videoFile && apiVideo.videoFile.includes('amazonaws.com')) {
              if (apiVideo.videoFile.includes('localhost') && apiVideo.videoFile.includes('https://')) {
                const s3Match = apiVideo.videoFile.match(/(https:\/\/.*amazonaws\.com\/.*)/);
                if (s3Match && s3Match[1]) {
                  apiVideo.videoFile = s3Match[1];
                  console.log('Cleaned API videoFile URL:', apiVideo.videoFile);
                }
              }
            }
            
            // Update video state with properly formatted data
            setVideo(apiVideo);
            
            // Ensure boolean fields are properly set
            if (apiVideo.previouslyReleased !== undefined) {
              console.log('Previous Release value:', apiVideo.previouslyReleased);
            }
            if (apiVideo.madeForKids !== undefined) {
              console.log('Made for Kids value:', apiVideo.madeForKids);
            }
            if (apiVideo.contentIdYoutube !== undefined) {
              console.log('Content ID YouTube value:', apiVideo.contentIdYoutube);
            }
            if (apiVideo.visibilityYoutube !== undefined) {
              console.log('Visibility YouTube value:', apiVideo.visibilityYoutube);
            }
            if (apiVideo.exclusiveRights !== undefined) {
              console.log('Exclusive Rights value:', apiVideo.exclusiveRights);
            }
            
            // Log the available URLs for debugging
            if (apiVideo.videoFile) {
              console.log("Video URL:", apiVideo.videoFile);
            } else {
              console.log("No video file in the response");
            }
            
            if (apiVideo.coverArt) {
              console.log("Cover Art URL:", apiVideo.coverArt);
            } else {
              console.log("No cover art in the response");
            }
          }
        } catch (error) {
          console.error("Error fetching complete video data:", error);
        }
      };
      
      if (initialVideo._id) {
        fetchFullVideoData();
      }
    }
  }, [isOpen, initialVideo]);

  // Fetch stores when modal opens
  useEffect(() => {
    if (isOpen && video.stores && video.stores.length > 0) {
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
  }, [isOpen, video.stores]);

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
    if (onApprove) onApprove(video._id);
  };

  // Handle rejection
  const handleReject = () => {
    if (onReject) onReject(video._id);
  };
  
  // Handle deletion
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
      if (onDelete) onDelete(video._id);
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

  // Format time in seconds to mm:ss
  const formatTime = (time: number): string => {
    if (isNaN(time)) return "00:00";
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Handle video time update
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    
    const newTime = videoRef.current.currentTime;
    const newDuration = videoRef.current.duration;
    
    setCurrentTime(newTime);
    setDuration(newDuration);
    setProgress((newTime / newDuration) * 100);
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

        {/* Header with video art and basic info */}
        <div className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row">
            {/* Left side - Video Thumbnail */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 relative rounded-md overflow-hidden mx-auto sm:mx-0 sm:mr-6 flex-shrink-0 bg-gray-800 mb-4 sm:mb-0">
              {video.coverArt ? (
                // Using direct image URL with no optimization or processing
                <img 
                  src={video.coverArt} 
                  alt={video.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("Image load error:", video.coverArt);
                    const imgElement = e.target as HTMLImageElement;
                    imgElement.style.display = 'none';
                    const parent = imgElement.parentElement;
                    if (parent) {
                      parent.innerHTML = `<svg 
                        class="w-full h-full p-8 text-gray-500" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg">
                        <path 
                          stroke-linecap="round" 
                          stroke-linejoin="round" 
                          stroke-width="1.5" 
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
                        />
                      </svg>`;
                    }
                  }}
                />
              ) : video.imageSrc ? (
                // Backup image source if coverArt not available
                <img 
                  src={video.imageSrc} 
                  alt={video.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("Image load error:", video.imageSrc);
                    const imgElement = e.target as HTMLImageElement;
                    imgElement.style.display = 'none';
                    const parent = imgElement.parentElement;
                    if (parent) {
                      parent.innerHTML = `<svg 
                        class="w-full h-full p-8 text-gray-500" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg">
                        <path 
                          stroke-linecap="round" 
                          stroke-linejoin="round" 
                          stroke-width="1.5" 
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
                        />
                      </svg>`;
                    }
                  }}
                />
              ) : (
                // Default icon if no image
                <div className="flex items-center justify-center w-full h-full">
                  <svg 
                    className="w-2/3 h-2/3 text-gray-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg">
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Right side - Title and Info */}
            <div className="flex-1 flex flex-col">
              {/* Title and ID */}
              <div className="mb-4 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-semibold text-white mr-2">
                    {video.title || "Untitled Video"}
                  </h2>
                  <span className="text-gray-400 text-sm">{video.releaseType || "Video"}</span>
                </div>
                <div className="mt-1 text-sm text-gray-400">
                  {video.artist || video.primaryArtist || "Unknown Artist"}
                </div>

                {/* Status Badge */}
                <div className="mt-2 mb-1">
                  <div
                    className={`flex items-center px-3 py-1.5 rounded-md text-sm ${
                      video.status === "approved"
                        ? "bg-green-900/50 text-green-200 border border-green-700"
                        : video.status === "rejected"
                        ? "bg-red-900/50 text-red-200 border border-red-700"
                        : video.status === "processing" || video.status === "submitted"
                        ? "bg-yellow-900/50 text-yellow-200 border border-yellow-700"
                        : "bg-gray-800/50 text-gray-200 border border-gray-700"
                    }`}
                  >
                    <span className="mr-1.5">
                      {video.status === "approved" ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                      ) : video.status === "rejected" ? (
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
                      {video.status === "approved" 
                        ? "Approved - Ready for distribution" 
                        : video.status === "rejected"
                        ? "Rejected - Please check with admin"
                        : video.status === "submitted" || video.status === "processing"
                        ? "Pending approval - Please wait for admin review"
                        : video.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Distribution Platforms */}
              {video.stores && video.stores.length > 0 && (
                <div className="mt-2 mb-4">
                  <h3 className="text-sm text-gray-400 mb-1">Distribution Platforms</h3>
                  <div className="flex flex-wrap gap-2">
                    {storesLoading ? (
                      <div className="text-xs text-gray-400">Loading stores...</div>
                    ) : (
                      video.stores.map(storeId => (
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
              currentTab === "play"
                ? "bg-[#A365FF] text-white"
                : "bg-[#1A1E24] text-gray-300"
            }`}
            onClick={() => setCurrentTab("play")}
          >
            Play
          </button>
        </div>

        {/* Content Area */}
        <div className="flex flex-col flex-1 overflow-auto">
          {/* Tab Content */}
          <div className="px-4 sm:px-5 pb-5 flex-1 overflow-y-auto">
            {currentTab === "details" ? (
              <div className="flex flex-col">
                {/* Metadata Section */}
                <div className="mb-6">
                  <h3 className="text-white text-md font-medium mb-4">Metadata</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Title */}
                    <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                      <h3 className="text-gray-400 text-xs sm:text-sm">Title</h3>
                      <p className="text-white text-sm sm:text-base font-medium truncate">
                        {video.title || "Untitled"}
                      </p>
                    </div>

                    {/* Artist */}
                    <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                      <h3 className="text-gray-400 text-xs sm:text-sm">Artist</h3>
                      <p className="text-white text-sm sm:text-base font-medium truncate">
                        {video.artist || video.primaryArtist || "Unknown Artist"}
                      </p>
                    </div>

                    {/* Featured Artists */}
                    {(video.featuredArtist || (video.featuredArtists && video.featuredArtists.length > 0)) && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Featured Artists</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {video.featuredArtist || video.featuredArtists?.join(', ')}
                        </p>
                      </div>
                    )}

                    {/* Genre */}
                    <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                      <h3 className="text-gray-400 text-xs sm:text-sm">Genre</h3>
                      <p className="text-white text-sm sm:text-base font-medium truncate">
                        {video.genre || "Unspecified"}
                      </p>
                    </div>

                    {/* Tags */}
                    {video.tags && video.tags.length > 0 && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Tags</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {video.tags.join(', ')}
                        </p>
                      </div>
                    )}

                    {/* Publisher Names */}
                    {video.publisherNames && video.publisherNames.length > 0 && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Publisher Names</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {video.publisherNames.join(', ')}
                        </p>
                      </div>
                    )}

                    {/* Subgenre */}
                    {video.subgenre && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Subgenre</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {video.subgenre}
                        </p>
                      </div>
                    )}

                    {/* Release Date */}
                    <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                      <h3 className="text-gray-400 text-xs sm:text-sm">Release Date</h3>
                      <p className="text-white text-sm sm:text-base font-medium truncate">
                        {formatDate(video.releaseDate)}
                      </p>
                    </div>
                                        
                    {/* Content Rating */}
                    <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                      <h3 className="text-gray-400 text-xs sm:text-sm">Content Rating</h3>
                      <p className="text-white text-sm sm:text-base font-medium truncate">
                        {video.contentRating || "Not specified"}
                      </p>
                    </div>
                    
                    {/* Label */}
                    {video.label && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Label</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {video.label}
                        </p>
                      </div>
                    )}
                    
                    {/* Release Type */}
                    {video.releaseType && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Release Type</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {video.releaseType}
                        </p>
                      </div>
                    )}
                    
                    {/* Format */}
                    {video.format && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Format</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {video.format}
                        </p>
                      </div>
                    )}
                    
                    {/* Language */}
                    {video.language && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Language</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {video.language}
                        </p>
                      </div>
                    )}

                    {/* Recording Year */}
                    {video.recordingYear && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Recording Year</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {video.recordingYear}
                        </p>
                      </div>
                    )}
                    
                    {/* ISRC */}
                    {video.isrc && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">ISRC</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {video.isrc}
                        </p>
                      </div>
                    )}

                    {/* UPC */}
                    {video.upc && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">UPC</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {video.upc}
                        </p>
                      </div>
                    )}

                    {/* Description */}
                    {video.description && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Description</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {video.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Additional Metadata Section */}
                <div className="mb-6">
                  <h3 className="text-white text-md font-medium mb-4">Additional Metadata</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Publisher */}
                    {video.publisher && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Publisher</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {video.publisher}
                        </p>
                      </div>
                    )}
                    
                    {/* Publisher Name */}
                    {video.publisherName && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Publisher Name</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {video.publisherName}
                        </p>
                      </div>
                    )}
                    
                    {/* Publisher IPI/CAE */}
                    {video.publisherIPI && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Publisher IPI/CAE</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {video.publisherIPI}
                        </p>
                      </div>
                    )}
                    
                    {/* Copyright Header */}
                    {video.copyrightHeader && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Copyright Header</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {video.copyrightHeader}
                        </p>
                      </div>
                    )}
                    
                    {/* Production Company */}
                    {video.productionCompany && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Production Company</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {video.productionCompany}
                        </p>
                      </div>
                    )}
                    
                    {/* Line Year */}
                    {video.lineYear && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Line Year</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {video.lineYear}
                        </p>
                      </div>
                    )}
                    
                    {/* Previously Released */}
                    {video.previouslyReleased !== undefined && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Previously Released</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {video.previouslyReleased ? "Yes" : "No"}
                        </p>
                      </div>
                    )}

                    {/* Made for Kids */}
                    {video.madeForKids !== undefined && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Made for Kids</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {video.madeForKids ? "Yes" : "No"}
                        </p>
                    </div>
                    )}

                    {/* Content ID on YouTube */}
                    {video.contentIdYoutube !== undefined && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Content ID on YouTube</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {video.contentIdYoutube ? "Yes" : "No"}
                        </p>
                      </div>
                    )}

                    {/* Visibility on YouTube */}
                    {video.visibilityYoutube !== undefined && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Visibility on YouTube</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {video.visibilityYoutube ? "Yes" : "No"}
                        </p>
                      </div>
                    )}
                    
                    {/* Exclusive Rights */}
                    {video.exclusiveRights !== undefined && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Exclusive Rights</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {video.exclusiveRights ? "Yes" : "No"}
                        </p>
                      </div>
                    )}
                    
                    {/* Created Date */}
                    {video.createdAt && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Created Date</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {formatDate(video.createdAt)}
                        </p>
                      </div>
                    )}
                    
                    {/* Updated Date */}
                    {video.updatedAt && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Last Updated</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {formatDate(video.updatedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contributors Section */}
                <div className="mb-6">
                  <h3 className="text-white text-md font-medium mb-4">Contributors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Singer */}
                    {video.singer && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Singer</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {video.singer}
                        </p>
                      </div>
                    )}
                    
                    {/* Composer */}
                    {video.composer && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Composer</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {video.composer}
                        </p>
                    </div>
                    )}
                    
                    {/* Lyricist */}
                    {video.lyricist && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Lyricist</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {video.lyricist}
                        </p>
                      </div>
                    )}
                    
                    {/* Music Producer */}
                    {video.musicProducer && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Music Producer</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {video.musicProducer}
                        </p>
                      </div>
                    )}
                    
                    {/* Music Director */}
                    {video.musicDirector && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Music Director</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {video.musicDirector}
                        </p>
                      </div>
                    )}
                    
                    {/* Producer */}
                    {video.producer && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Producer</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {video.producer}
                        </p>
                      </div>
                    )}
                    
                    {/* Line Producer */}
                    {video.lineProducer && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Line Producer</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {video.lineProducer}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : currentTab === "play" ? (
              <div className="bg-[#1A1E24] p-4 rounded-md">
                <h3 className="text-white text-md font-medium mb-6">Video Player</h3>
                
                {/* Video Player Section */}
                <div className="mb-6">
                  {video.videoFile ? (
                    <div className="relative aspect-video bg-black rounded-sm overflow-hidden">
                      <video 
                        ref={videoRef}
                        src={video.videoFile}
                        className="w-full h-full object-contain"
                        controls
                        poster={video.coverArt || video.imageSrc || ""}
                        onError={(e) => {
                          console.error("Video loading error for:", video.videoFile);
                          setVideoError("Failed to load video file");
                        }}
                        onTimeUpdate={handleTimeUpdate}
                      />
                      {videoError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                          <div className="text-red-400 text-center p-4">
                            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p>{videoError}</p>
                            <p className="text-sm mt-2">The video file might be unavailable or in an unsupported format.</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-3 absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                        <div className="flex justify-between items-center">
                          <div className="text-white text-sm font-medium">
                            {video.title} - {video.artist || video.primaryArtist || "Unknown Artist"}
                          </div>
                          <a 
                            href={video.videoFile}
                            download={`${video.title} - ${video.artist || video.primaryArtist || "Unknown Artist"}.mp4`}
                            className="flex items-center px-3 py-1.5 bg-[#1D2229] text-white rounded-full text-xs hover:bg-[#2A2F36] transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                            </svg>
                            Download Video
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                      <svg className="w-16 h-16 mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <p>No video file available</p>
                      {video._id && (
                        <button 
                          onClick={async () => {
                            try {
                              const { getTrackById } = await import('@/services/trackService');
                              const response = await getTrackById(video._id);
                              if (response.success && response.data) {
                                // Process any S3 URLs in the response
                                const refreshedVideo = { ...response.data };
                                
                                // Handle videoFile URL
                                if (refreshedVideo.videoFile && refreshedVideo.videoFile.includes('localhost') && refreshedVideo.videoFile.includes('amazonaws.com')) {
                                  const s3UrlMatch = refreshedVideo.videoFile.match(/(https:\/\/promisedis-files\.s3\..*?\.amazonaws\.com\/.*)/);
                                  if (s3UrlMatch && s3UrlMatch[1]) {
                                    console.log("Fixed refresh videoFile URL from:", refreshedVideo.videoFile);
                                    refreshedVideo.videoFile = s3UrlMatch[1];
                                    console.log("Fixed refresh videoFile URL to:", refreshedVideo.videoFile);
                                  }
                                }
                                
                                // Handle coverArt URL
                                if (refreshedVideo.coverArt && refreshedVideo.coverArt.includes('localhost') && refreshedVideo.coverArt.includes('amazonaws.com')) {
                                  const s3UrlMatch = refreshedVideo.coverArt.match(/(https:\/\/.*?\.amazonaws\.com\/.*)/);
                                  if (s3UrlMatch && s3UrlMatch[1]) {
                                    console.log("Fixed refresh coverArt URL from:", refreshedVideo.coverArt);
                                    refreshedVideo.coverArt = s3UrlMatch[1];
                                    console.log("Fixed refresh coverArt URL to:", refreshedVideo.coverArt);
                                  }
                                }
                                
                                // Set the updated video with cleaned URLs
                                setVideo(refreshedVideo);
                                
                                if (refreshedVideo.videoFile) {
                                  setVideoError(null);
                                } else {
                                  setVideoError("No video file found in the data");
                                }
                              } else {
                                setVideoError("No video file found in the data");
                              }
                            } catch (error) {
                              console.error("Error retrieving video data:", error);
                              setVideoError("Error retrieving video data");
                            }
                          }}
                          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm"
                        >
                          Refresh Data
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* Action buttons */}
          <div className="flex p-4 space-x-3 justify-center sm:justify-start flex-wrap gap-2">
            {/* Admin/SuperAdmin actions for processing/submitted videos */}
            {(userRole === 'admin' || userRole === 'superadmin') && 
             (video.status === "processing" || video.status === "submitted") && (
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
            
            {/* Distribution button - only for approved videos */}
            {video.status === 'approved' && (
              <button
                onClick={() => window.location.href = `/dashboard/distribution?videoId=${video._id}`}
                className="flex items-center justify-center px-3 sm:px-4 py-2 border border-blue-700 text-blue-500 rounded-md hover:bg-blue-900 hover:bg-opacity-30 transition-colors text-sm"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                    clipRule="evenodd"
                  />
                </svg>
                Send to Distribution
              </button>
            )}
            
            {/* Delete button for admin/superadmin */}
            {(userRole === 'admin' || userRole === 'superadmin') && (
              <button
                onClick={handleDelete}
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
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Delete
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