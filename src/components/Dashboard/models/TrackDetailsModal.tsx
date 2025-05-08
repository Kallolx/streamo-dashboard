"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { getAllStores, Store } from "@/services/storeService";

// Tab interfaces for the modal
type TabType = "details" | "lyrics" | "play";

// Interface for the track data
interface Track {
  _id: string;
  title: string;
  artist: string;
  primaryArtist?: string;
  imageSrc?: string;
  genre: string;
  contentRating: string;
  duration?: string;
  releaseDate: string;
  status: string;
  stores?: string[];
  isrc?: string;
  upc?: string;
  label?: string;
  lyrics?: string;
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
  audioFile?: string;
  videoFile?: string;
}

// Props interface for the modal
interface TrackDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track;
  onApprove?: (trackId: string) => void;
  onReject?: (trackId: string) => void;
  onDelete?: (trackId: string) => void;
  userRole?: 'admin' | 'superadmin' | 'artist' | 'label';
}

export default function TrackDetailsModal({
  isOpen,
  onClose,
  track,
  onApprove,
  onReject,
  onDelete,
  userRole = 'artist'
}: TrackDetailsModalProps) {
  // State variables
  const [currentTab, setCurrentTab] = useState<TabType>("details");
  const [storeMap, setStoreMap] = useState<Record<string, Store>>({});
  const [storesLoading, setStoresLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  // Default image fallback if track has no image
  const defaultImage = "/images/music/placeholder.png";

  // Fetch stores when modal opens
  useEffect(() => {
    if (isOpen && track.stores && track.stores.length > 0) {
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
  }, [isOpen, track.stores]);

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
    if (onApprove) onApprove(track._id);
  };

  // Handle rejection
  const handleReject = () => {
    if (onReject) onReject(track._id);
  };
  
  // Handle deletion
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this track? This action cannot be undone.")) {
      if (onDelete) onDelete(track._id);
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
  
  // Handle play/pause toggle for audio
  const toggleAudioPlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Handle progress bar click to seek
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const seekTime = percent * duration;
    
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
    setProgress(percent * 100);
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

        {/* Header with track art and basic info */}
        <div className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row">
            {/* Left side - Track Art */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 relative rounded-md overflow-hidden mx-auto sm:mx-0 sm:mr-6 flex-shrink-0 bg-gray-800 mb-4 sm:mb-0">
              {track.coverArt ? (
                <Image 
                  src={track.coverArt.startsWith('http') ? track.coverArt : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${track.coverArt}` || defaultImage}
                  alt={track.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.src = defaultImage;
                  }}
                />
              ) : (
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
                  <span className="text-xs text-gray-400">Track Artwork</span>
                </div>
              )}
            </div>

            {/* Right side - Title and Info */}
            <div className="flex-1 flex flex-col">
              {/* Title and ID */}
              <div className="mb-4 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-semibold text-white mr-2">
                    {track.title || "Untitled Track"}
                  </h2>
                  <span className="text-gray-400 text-sm">{track.releaseType || "Track"}</span>
                </div>
                <div className="mt-1 text-sm text-gray-400">
                  {track.artist || track.primaryArtist || "Unknown Artist"}
                </div>

                {/* Status Badge */}
                <div className="mt-2 mb-1">
                  <div
                    className={`flex items-center px-3 py-1.5 rounded-md text-sm ${
                      track.status === "approved"
                        ? "bg-green-900/50 text-green-200 border border-green-700"
                        : track.status === "rejected"
                        ? "bg-red-900/50 text-red-200 border border-red-700"
                        : track.status === "processing" || track.status === "submitted"
                        ? "bg-yellow-900/50 text-yellow-200 border border-yellow-700"
                        : "bg-gray-800/50 text-gray-200 border border-gray-700"
                    }`}
                  >
                    <span className="mr-1.5">
                      {track.status === "approved" ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                      ) : track.status === "rejected" ? (
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
                      {track.status === "approved" 
                        ? "Approved - Ready for distribution" 
                        : track.status === "rejected"
                        ? "Rejected - Please check with admin"
                        : track.status === "submitted" || track.status === "processing"
                        ? "Pending approval - Please wait for admin review"
                        : track.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Distribution Platforms */}
              {track.stores && track.stores.length > 0 && (
                <div className="mt-2 mb-4">
                  <h3 className="text-sm text-gray-400 mb-1">Distribution Platforms</h3>
                  <div className="flex flex-wrap gap-2">
                    {storesLoading ? (
                      <div className="text-xs text-gray-400">Loading stores...</div>
                    ) : (
                      track.stores.map(storeId => (
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
          <button
            className={`px-3 sm:px-5 py-2 rounded-full text-sm ${
              currentTab === "lyrics"
                ? "bg-[#A365FF] text-white"
                : "bg-[#1A1E24] text-gray-300"
            }`}
            onClick={() => setCurrentTab("lyrics")}
          >
            Lyrics
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
                  <h3 className="text-white text-md font-medium mb-4">Track Metadata</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Artist */}
                    <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                      <h3 className="text-gray-400 text-xs sm:text-sm">Artist</h3>
                      <p className="text-white text-sm sm:text-base font-medium truncate">
                        {track.artist || track.primaryArtist || "Unknown Artist"}
                      </p>
                    </div>

                    {/* Featured Artists */}
                    {(track.featuredArtist || (track.featuredArtists && track.featuredArtists.length > 0)) && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Featured Artists</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {track.featuredArtist || track.featuredArtists?.join(', ')}
                        </p>
                      </div>
                    )}

                    {/* Genre */}
                    <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                      <h3 className="text-gray-400 text-xs sm:text-sm">Genre</h3>
                      <p className="text-white text-sm sm:text-base font-medium truncate">
                        {track.genre || "Unspecified"}
                      </p>
                    </div>

                    {/* Subgenre */}
                    {track.subgenre && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Subgenre</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {track.subgenre}
                        </p>
                      </div>
                    )}

                    {/* ISRC */}
                    {track.isrc && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">ISRC</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {track.isrc}
                        </p>
                      </div>
                    )}

                    {/* UPC */}
                    {track.upc && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">UPC</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {track.upc}
                        </p>
                      </div>
                    )}

                    {/* Release Date */}
                    <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                      <h3 className="text-gray-400 text-xs sm:text-sm">Release Date</h3>
                      <p className="text-white text-sm sm:text-base font-medium truncate">
                        {formatDate(track.releaseDate)}
                      </p>
                    </div>
                    
                    {/* Duration */}
                    <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                      <h3 className="text-gray-400 text-xs sm:text-sm">Duration</h3>
                      <p className="text-white text-sm sm:text-base font-medium truncate">
                        {track.duration}
                      </p>
                    </div>
                    
                    {/* Content Rating */}
                    <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                      <h3 className="text-gray-400 text-xs sm:text-sm">Content Rating</h3>
                      <p className="text-white text-sm sm:text-base font-medium truncate">
                        {track.contentRating}
                      </p>
                    </div>
                    
                    {/* Label */}
                    {track.label && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Label</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {track.label}
                        </p>
                      </div>
                    )}
                    
                    {/* Created Date */}
                    {track.createdAt && (
                      <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                        <h3 className="text-gray-400 text-xs sm:text-sm">Created</h3>
                        <p className="text-white text-sm sm:text-base font-medium truncate">
                          {formatDate(track.createdAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : currentTab === "play" ? (
              <div className="bg-[#1A1E24] p-4 rounded-md">
                <h3 className="text-white text-md font-medium mb-6">Media Player</h3>
                
                {/* Video Player */}
                {track.videoFile && (
                  <div className="mb-6">
                    <h4 className="text-gray-300 text-sm mb-2">Video</h4>
                    <div className="relative aspect-video bg-black rounded-sm overflow-hidden">
                      <video 
                        ref={videoRef}
                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${track.videoFile}`}
                        className="w-full h-full object-contain"
                        controls
                        poster={track.coverArt ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${track.coverArt}` : undefined}
                      />
                    </div>
                    <div className="mt-2 flex justify-end">
                      <a 
                        href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${track.videoFile}`}
                        download={`${track.title} - ${track.artist}.mp4`}
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
                )}
                
                {/* Audio Player */}
                {track.audioFile && (
                  <div>
                    <h4 className="text-gray-300 text-sm mb-2">Audio</h4>
                    <div className="bg-[#161A1F] p-4 rounded-md shadow-md">
                      {/* Hidden native audio element */}
                      <audio 
                        ref={audioRef}
                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${track.audioFile}`}
                        className="hidden"
                        onTimeUpdate={() => {
                          if (audioRef.current) {
                            setCurrentTime(audioRef.current.currentTime);
                            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
                          }
                        }}
                        onLoadedMetadata={() => {
                          if (audioRef.current) {
                            setDuration(audioRef.current.duration);
                          }
                        }}
                        onEnded={() => {
                          setIsPlaying(false);
                        }}
                      />
                      
                      {/* Custom audio player UI */}
                      <div className="flex flex-col">
                        {/* Player controls */}
                        <div className="flex items-center mb-2">
                          {/* Play/Pause button */}
                          <button 
                            onClick={toggleAudioPlay}
                            className="w-10 h-10 flex items-center justify-center bg-[#A365FF] hover:bg-purple-700 text-white rounded-full transition-colors focus:outline-none mr-3"
                          >
                            {isPlaying ? (
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                          
                          {/* Time display */}
                          <div className="text-xs text-gray-400 w-16">
                            {formatTime(currentTime)}
                          </div>
                          
                          {/* Progress bar */}
                          <div 
                            className="flex-1 bg-[#2D3139] rounded-full h-2 mx-2 cursor-pointer overflow-hidden"
                            onClick={handleSeek}
                          >
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          
                          {/* Duration */}
                          <div className="text-xs text-gray-400 w-16 text-right">
                            {formatTime(duration)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex justify-between items-center">
                        <div className="text-white text-sm font-medium">
                          {track.title}
                        </div>
                        <a 
                          href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${track.audioFile}`}
                          download={`${track.title} - ${track.artist}.mp3`}
                          className="flex items-center px-3 py-1.5 bg-[#1D2229] text-white rounded-full text-xs hover:bg-[#2A2F36] transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                          </svg>
                          Download Audio
                        </a>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* If no media available */}
                {!track.videoFile && !track.audioFile && (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <svg className="w-16 h-16 mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p>No media files available for this track</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#1A1E24] p-4 rounded-sm">
                <h3 className="text-white font-medium mb-3">Song Lyrics</h3>
                <div className="text-gray-300 whitespace-pre-line">
                  {track.lyrics || `No lyrics available for this track.`}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex p-4 space-x-3 justify-center sm:justify-start flex-wrap gap-2">
            {/* Admin/SuperAdmin actions for processing/submitted releases */}
            {(userRole === 'admin' || userRole === 'superadmin') && 
             (track.status === "processing" || track.status === "submitted") && (
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
            
            {/* Distribution button - only for approved tracks */}
            {track.status === 'approved' && (
              <button
                onClick={() => window.location.href = `/dashboard/distribution?trackId=${track._id}`}
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
