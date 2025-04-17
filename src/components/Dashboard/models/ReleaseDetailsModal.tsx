"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

// Tab interfaces for the modal
type TabType = "details" | "performance" | "track-list";
type ActionType = "play" | "edit" | "copyright";

// Track status types
type TrackStatus = "processing" | "approved" | "rejected";

// Copyright check status
type CopyrightStatus = "checking" | "clear" | "found";

// For the performance chart
type StreamData = {
  day: number;
  streams: number;
};

// Props interface for the modal
interface TrackDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: {
    id: string;
    title: string;
    imageSrc: string;
    primaryArtist: string;
    featuredArtists?: string[];
    genre: string;
    subgenre?: string;
    contentRating: string;
    isrc?: string;
    upc?: string;
    duration: string;
    releaseDate: string;
    label?: string;
    lyrics?: string;
  };
  initialAction?: ActionType;
  initialStatus?: TrackStatus;
  onApprove?: (trackId: string) => void;
  onReject?: (trackId: string) => void;
  onEdit?: (trackId: string) => void;
  onPlay?: (trackId: string) => void;
}

export default function TrackDetailsModal({
  isOpen,
  onClose,
  track,
  initialAction = "copyright",
  initialStatus = "processing",
  onApprove,
  onReject,
  onEdit,
  onPlay,
}: TrackDetailsModalProps) {
  // State variables
  const [currentTab, setCurrentTab] = useState<TabType>("details");
  const [currentAction, setCurrentAction] = useState<ActionType>(initialAction);
  const [trackStatus, setTrackStatus] = useState<TrackStatus>(initialStatus);
  const [copyrightStatus, setCopyrightStatus] =
    useState<CopyrightStatus>("checking");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTrack, setEditedTrack] = useState({ ...track });

  // Default image fallback if track has no image
  const defaultImage = "/images/music/3.png";

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
      // Simulate copyright check when the modal opens and copyright action is selected
      if (currentAction === "copyright") {
        simulateCopyrightCheck();
      }
      // Reset track status to initial status when modal opens
      setTrackStatus(initialStatus);
      // Reset edit mode and edited track
      setIsEditMode(false);
      setEditedTrack({ ...track });
    } else {
      // Reset track status when modal closes
      setTrackStatus(initialStatus);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown, currentAction, initialStatus, track]);

  // Simulate copyright check
  const simulateCopyrightCheck = () => {
    setCopyrightStatus("checking");
    // Mock API call with timeout
    setTimeout(() => {
      // Randomly decide if copyright is found or clear
      setCopyrightStatus(Math.random() > 0.3 ? "clear" : "found");
    }, 2500);
  };

  // Handle approval
  const handleApprove = () => {
    setTrackStatus("approved");
    if (onApprove) onApprove(track.id);
    // Keep the modal open and don't change the UI state
  };

  // Handle rejection
  const handleReject = () => {
    setTrackStatus("rejected");
    if (onReject) onReject(track.id);
    // Keep the modal open and don't change the UI state
  };

  // Handle play button
  const handlePlay = () => {
    if (onPlay) onPlay(track.id);
  };

  // Handle edit button
  const handleEdit = () => {
    if (onEdit) onEdit(track.id);
    setIsEditMode(true);
  };

  // Add a save changes function
  const handleSaveChanges = () => {
    // In a real app, you would save the changes to the backend here
    // For now, we'll just log the changes and exit edit mode
    console.log("Changes saved:", editedTrack);
    setIsEditMode(false);
  };

  // Add a cancel changes function
  const handleCancelChanges = () => {
    setEditedTrack({ ...track });
    setIsEditMode(false);
  };

  // Add a field change handler
  const handleFieldChange = (field: string, value: string) => {
    setEditedTrack({
      ...editedTrack,
      [field]: value
    });
  };

  // Switch action type
  const switchAction = (action: ActionType) => {
    setCurrentAction(action);
    if (action === "copyright") {
      simulateCopyrightCheck();
    }
  };

  // Sample data for demo
  const defaultData = {
    primaryArtist: "Neon Pulse",
    featuredArtists: [],
    genre: "Alternative Rock",
    contentRating: "PG",
    upc: "093624241126",
    label: "Independent",
    releaseDate: "25 March, 2025",
  };

  // Use default data if not provided
  const displayData = {
    primaryArtist: track.primaryArtist || defaultData.primaryArtist,
    featuredArtists: track.featuredArtists || defaultData.featuredArtists,
    genre: track.genre || defaultData.genre,
    contentRating: track.contentRating || defaultData.contentRating,
    upc: track.upc || defaultData.upc,
    label: track.label || defaultData.label,
    releaseDate: track.releaseDate || defaultData.releaseDate,
  };

  // Add a new handler to reset track status
  const handleResetStatus = () => {
    setTrackStatus("processing");
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 backdrop-blur-sm " onClick={onClose}></div>

      {/* Modal */}
      <div className="relative z-10 bg-[#111417] rounded-lg overflow-hidden shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col mt-16 transform transition-all">
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

        {/* Header with album art and actions */}
        <div className="p-5">
          <div className="flex">
            {/* Left side - Album Art */}
            <div className="w-40 h-40 relative rounded-md overflow-hidden mr-6 flex-shrink-0 bg-gray-800">
              <Image
                src={track.imageSrc || defaultImage}
                alt={track.title || "Album artwork"}
                fill
                className="object-cover"
                onError={(e) => {
                  // Fall back to default image if the track image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = defaultImage;
                }}
              />
            </div>

            {/* Right side - Title and Actions */}
            <div className="flex-1 flex flex-col">
              {/* Title and ID */}
              <div className="mb-4">
                <div className="flex items-center">
                  <h2 className="text-2xl font-semibold text-white mr-2">
                    {track.title || "Midnight Drive"}
                  </h2>
                  <span className="text-gray-400 text-sm">Album</span>
                </div>
                <div className="mt-1 text-sm text-gray-400">
                  {displayData.primaryArtist}
                </div>

                {/* Status Badge */}
                <div className="mt-1">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs rounded-full capitalize ${
                      trackStatus === "approved"
                        ? "bg-green-900 text-green-200"
                        : trackStatus === "rejected"
                        ? "bg-red-900 text-red-200"
                        : "bg-gray-800 text-gray-200"
                    }`}
                  >
                    {trackStatus}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 mt-auto">
                <button
                  className={`flex items-center px-3 py-2 rounded-full ${
                    currentAction === "play" ? "bg-[#A365FF]" : "bg-[#1A1E24]"
                  } transition-colors`}
                  onClick={() => switchAction("play")}
                >
                  <svg
                    className={`w-5 h-5 mr-2 ${
                      currentAction === "play" ? "text-white" : "text-[#A365FF]"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span
                    className={`text-sm ${
                      currentAction === "play" ? "text-white" : "text-gray-200"
                    }`}
                  >
                    Play
                  </span>
                </button>

                <button
                  className={`flex items-center px-3 py-2 rounded-full ${
                    currentAction === "edit" ? "bg-[#A365FF]" : "bg-[#1A1E24]"
                  } transition-colors`}
                  onClick={() => switchAction("edit")}
                >
                  <svg
                    className={`w-5 h-5 mr-2 ${
                      currentAction === "edit" ? "text-white" : "text-[#A365FF]"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  <span
                    className={`text-sm ${
                      currentAction === "edit" ? "text-white" : "text-gray-200"
                    }`}
                  >
                    Edit
                  </span>
                </button>

                <button
                  className={`flex items-center px-3 py-2 rounded-full ${
                    currentAction === "copyright"
                      ? "bg-[#A365FF]"
                      : "bg-[#1A1E24]"
                  } transition-colors`}
                  onClick={() => switchAction("copyright")}
                >
                  <svg
                    className={`w-5 h-5 mr-2 ${
                      currentAction === "copyright"
                        ? "text-white"
                        : "text-[#A365FF]"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span
                    className={`text-sm ${
                      currentAction === "copyright"
                        ? "text-white"
                        : "text-gray-200"
                    }`}
                  >
                    Check Copyright
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Status - Bottom right */}
        {currentAction === "copyright" && (
          <div className="absolute bottom-5 right-5 z-10 px-3 py-2 bg-[#1A1E24] rounded-md max-w-[200px]">
            {copyrightStatus === "checking" && (
              <p className="text-yellow-400 flex items-center gap-2 text-sm">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Checking copyright...
              </p>
            )}
            {copyrightStatus === "clear" && (
              <p className="text-green-500 font-medium text-sm">
                No Copyright Found
              </p>
            )}
            {copyrightStatus === "found" && (
              <p className="text-red-500 font-medium text-sm">
                Copyright Found
              </p>
            )}
          </div>
        )}

        {/* Tabs for navigation */}
        <div className="flex px-5 py-2 space-x-2 mb-2">
          <button
            className={`px-5 py-2 rounded-full ${
              currentTab === "details"
                ? "bg-[#A365FF] text-white"
                : "bg-[#1A1E24] text-gray-300"
            }`}
            onClick={() => setCurrentTab("details")}
          >
            Details
          </button>
          {/* Only show Performance tab when copyright is clear (not when checking or found) */}
          {copyrightStatus === "clear" && (
            <button
              className={`px-5 py-2 rounded-full ${
                currentTab === "performance"
                  ? "bg-[#A365FF] text-white"
                  : "bg-[#1A1E24] text-gray-300"
              }`}
              onClick={() => setCurrentTab("performance")}
            >
              Performance
            </button>
          )}
          <button
            className={`px-5 py-2 rounded-full ${
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
        {currentAction === "copyright" && (
          <div className="flex flex-col flex-1 overflow-auto">
            {/* Tab Content */}
            <div className="px-5 pb-5 flex-1 overflow-y-auto ">
              {currentTab === "details" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Primary Artist */}
                  <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                    <h3 className="text-gray-400 text-sm">Primary Artist</h3>
                    <p className="text-white text-base font-medium">
                      {displayData.primaryArtist}
                    </p>
                  </div>

                  {/* Featured Artists */}
                  <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                    <h3 className="text-gray-400 text-sm">Featured Artists</h3>
                    <p className="text-white text-base font-medium">
                      {displayData.featuredArtists &&
                      displayData.featuredArtists.length > 0
                        ? displayData.featuredArtists.join(", ")
                        : "None"}
                    </p>
                  </div>

                  {/* Genre & Subgenre */}
                  <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                    <h3 className="text-gray-400 text-sm">Genre & Subgenre</h3>
                    <p className="text-white text-base font-medium">
                      {displayData.genre}
                    </p>
                  </div>

                  {/* Content Rating */}
                  <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                    <h3 className="text-gray-400 text-sm">Content Rating</h3>
                    <p className="text-white text-base font-medium">
                      {displayData.contentRating}
                    </p>
                  </div>

                  {/* Label */}
                  <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                    <h3 className="text-gray-400 text-sm">Label</h3>
                    <p className="text-white text-base font-medium">
                      {displayData.label}
                    </p>
                  </div>

                  {/* UPC */}
                  <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                    <h3 className="text-gray-400 text-sm">UPC</h3>
                    <p className="text-white text-base font-medium">
                      {displayData.upc}
                    </p>
                  </div>

                  {/* Release date */}
                  <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                    <h3 className="text-gray-400 text-sm">Release date</h3>
                    <p className="text-white text-base font-medium">
                      {displayData.releaseDate}
                    </p>
                  </div>
                </div>
              ) : currentTab === "performance" && copyrightStatus === "clear" ? (
                <div className="space-y-4">
                  {/* Stream Analytics */}
                  <div className=" p-4 rounded-md">
                    <div className="bg-[#1E222B] px-4 py-2 rounded-md flex justify-between items-center mb-4">
                      <h3 className="text-white font-medium">Streams</h3>
                      <select
                        className="bg-[#1A1E25] border border-gray-700 text-gray-300 text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        defaultValue="2023"
                      >
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                        <option value="2021">2021</option>
                        <option value="2020">2020</option>
                      </select>
                    </div>

                    {/* Chart container with transparent background */}
                    <div className="h-64 relative flex bg-transparent">
                      {/* Y-axis labels */}
                      <div className="flex flex-col justify-between text-right pr-2 text-xs text-gray-400 h-full">
                        <span>50K</span>
                        <span>10K</span>
                        <span>1K</span>
                        <span>500</span>
                        <span>100</span>
                        <span>00</span>
                      </div>

                      {/* Chart Area */}
                      <div className="flex-1 flex items-end">
                        <div className="w-full flex justify-around items-end px-2">
                          {/* Jan */}
                          <div className="flex flex-col items-center">
                            <div
                              className="w-5 bg-[#DAB6FC] rounded-t-sm"
                              style={{ height: "40px" }}
                            ></div>
                            <span className="mt-1 text-xs text-gray-400">
                              Jan
                            </span>
                          </div>

                          {/* Feb */}
                          <div className="flex flex-col items-center">
                            <div
                              className="w-5 bg-[#DAB6FC] rounded-t-sm"
                              style={{ height: "60px" }}
                            ></div>
                            <span className="mt-1 text-xs text-gray-400">
                              Feb
                            </span>
                          </div>

                          {/* Mar */}
                          <div className="flex flex-col items-center">
                            <div
                              className="w-5 bg-[#DAB6FC] rounded-t-sm"
                              style={{ height: "180px" }}
                            ></div>
                            <span className="mt-1 text-xs text-gray-400">
                              Mar
                            </span>
                          </div>

                          {/* Apr */}
                          <div className="flex flex-col items-center">
                            <div
                              className="w-5 bg-[#DAB6FC] rounded-t-sm"
                              style={{ height: "80px" }}
                            ></div>
                            <span className="mt-1 text-xs text-gray-400">
                              Apr
                            </span>
                          </div>

                          {/* May */}
                          <div className="flex flex-col items-center">
                            <div
                              className="w-5 bg-[#DAB6FC] rounded-t-sm"
                              style={{ height: "55px" }}
                            ></div>
                            <span className="mt-1 text-xs text-gray-400">
                              May
                            </span>
                          </div>

                          {/* Jun */}
                          <div className="flex flex-col items-center">
                            <div
                              className="w-5 bg-[#DAB6FC] rounded-t-sm"
                              style={{ height: "140px" }}
                            ></div>
                            <span className="mt-1 text-xs text-gray-400">
                              Jun
                            </span>
                          </div>

                          {/* Jul */}
                          <div className="flex flex-col items-center">
                            <div
                              className="w-5 bg-[#DAB6FC] rounded-t-sm"
                              style={{ height: "95px" }}
                            ></div>
                            <span className="mt-1 text-xs text-gray-400">
                              Jul
                            </span>
                          </div>

                          {/* Aug */}
                          <div className="flex flex-col items-center">
                            <div
                              className="w-5 bg-[#DAB6FC] rounded-t-sm"
                              style={{ height: "110px" }}
                            ></div>
                            <span className="mt-1 text-xs text-gray-400">
                              Aug
                            </span>
                          </div>

                          {/* Sep */}
                          <div className="flex flex-col items-center">
                            <div
                              className="w-5 bg-[#DAB6FC] rounded-t-sm"
                              style={{ height: "125px" }}
                            ></div>
                            <span className="mt-1 text-xs text-gray-400">
                              Sep
                            </span>
                          </div>

                          {/* Oct */}
                          <div className="flex flex-col items-center">
                            <div
                              className="w-5 bg-[#DAB6FC] rounded-t-sm"
                              style={{ height: "90px" }}
                            ></div>
                            <span className="mt-1 text-xs text-gray-400">
                              Oct
                            </span>
                          </div>

                          {/* Nov */}
                          <div className="flex flex-col items-center">
                            <div
                              className="w-5 bg-[#DAB6FC] rounded-t-sm"
                              style={{ height: "70px" }}
                            ></div>
                            <span className="mt-1 text-xs text-gray-400">
                              Nov
                            </span>
                          </div>

                          {/* Dec */}
                          <div className="flex flex-col items-center">
                            <div
                              className="w-5 bg-[#DAB6FC] rounded-t-sm"
                              style={{ height: "200px" }}
                            ></div>
                            <span className="mt-1 text-xs text-gray-400">
                              Dec
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Platform Distribution Pie Chart */}
                  <div className="p-4 rounded-md">
                    <div className="bg-[#1E222B] px-4 py-2 rounded-md flex justify-between items-center mb-4">
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
                    <div className="flex items-center justify-center p-4 rounded-md">
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

                        {/* Only percentages */}
                        <div className="absolute top-16 -right-30 text-md">
                          <div className="text-[#8A85FF] font-medium">
                            Spotify 40%
                          </div>
                        </div>

                        <div className="absolute bottom-2 -left-36 text-md">
                          <div className="text-[#6AE398] font-medium">
                            Soundcloud 30%
                          </div>
                        </div>

                        <div className="absolute top-16 -left-42 text-md">
                          <div className="text-[#FFB963] font-medium">
                            Apple Music 25%
                          </div>
                        </div>

                        <div className="absolute top-1 -left-16 text-md">
                          <div className="text-[#00C2FF] font-medium">
                            Tidal 5%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Analytics */}
                  <div className=" p-4 rounded-md">
                    <div className="bg-[#1E222B] px-4 py-2 rounded-md flex justify-between items-center mb-4">
                      <h3 className="text-white font-medium">Revenue</h3>
                      <select
                        className="bg-[#1A1E25] border border-gray-700 text-gray-300 text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        defaultValue="2023"
                      >
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                        <option value="2021">2021</option>
                        <option value="2020">2020</option>
                      </select>
                    </div>

                    {/* Chart container with transparent background */}
                    <div className="h-64 relative flex bg-transparent">
                      {/* Y-axis labels */}
                      <div className="flex flex-col justify-between text-right pr-2 text-xs text-gray-400 h-full">
                        <span>50K</span>
                        <span>10K</span>
                        <span>1K</span>
                        <span>500</span>
                        <span>100</span>
                        <span>00</span>
                      </div>

                      {/* Chart Area */}
                      <div className="flex-1 flex items-end">
                        <div className="w-full flex justify-around items-end px-2">
                          {/* Jan */}
                          <div className="flex flex-col items-center">
                            <div
                              className="w-5 bg-[#DAB6FC] rounded-t-sm"
                              style={{ height: "40px" }}
                            ></div>
                            <span className="mt-1 text-xs text-gray-400">
                              Jan
                            </span>
                          </div>

                          {/* Feb */}
                          <div className="flex flex-col items-center">
                            <div
                              className="w-5 bg-[#DAB6FC] rounded-t-sm"
                              style={{ height: "60px" }}
                            ></div>
                            <span className="mt-1 text-xs text-gray-400">
                              Feb
                            </span>
                          </div>

                          {/* Mar */}
                          <div className="flex flex-col items-center">
                            <div
                              className="w-5 bg-[#DAB6FC] rounded-t-sm"
                              style={{ height: "180px" }}
                            ></div>
                            <span className="mt-1 text-xs text-gray-400">
                              Mar
                            </span>
                          </div>

                          {/* Apr */}
                          <div className="flex flex-col items-center">
                            <div
                              className="w-5 bg-[#DAB6FC] rounded-t-sm"
                              style={{ height: "80px" }}
                            ></div>
                            <span className="mt-1 text-xs text-gray-400">
                              Apr
                            </span>
                          </div>

                          {/* May */}
                          <div className="flex flex-col items-center">
                            <div
                              className="w-5 bg-[#DAB6FC] rounded-t-sm"
                              style={{ height: "55px" }}
                            ></div>
                            <span className="mt-1 text-xs text-gray-400">
                              May
                            </span>
                          </div>

                          {/* Jun */}
                          <div className="flex flex-col items-center">
                            <div
                              className="w-5 bg-[#DAB6FC] rounded-t-sm"
                              style={{ height: "140px" }}
                            ></div>
                            <span className="mt-1 text-xs text-gray-400">
                              Jun
                            </span>
                          </div>

                          {/* Jul */}
                          <div className="flex flex-col items-center">
                            <div
                              className="w-5 bg-[#DAB6FC] rounded-t-sm"
                              style={{ height: "95px" }}
                            ></div>
                            <span className="mt-1 text-xs text-gray-400">
                              Jul
                            </span>
                          </div>

                          {/* Aug */}
                          <div className="flex flex-col items-center">
                            <div
                              className="w-5 bg-[#DAB6FC] rounded-t-sm"
                              style={{ height: "110px" }}
                            ></div>
                            <span className="mt-1 text-xs text-gray-400">
                              Aug
                            </span>
                          </div>

                          {/* Sep */}
                          <div className="flex flex-col items-center">
                            <div
                              className="w-5 bg-[#DAB6FC] rounded-t-sm"
                              style={{ height: "125px" }}
                            ></div>
                            <span className="mt-1 text-xs text-gray-400">
                              Sep
                            </span>
                          </div>

                          {/* Oct */}
                          <div className="flex flex-col items-center">
                            <div
                              className="w-5 bg-[#DAB6FC] rounded-t-sm"
                              style={{ height: "90px" }}
                            ></div>
                            <span className="mt-1 text-xs text-gray-400">
                              Oct
                            </span>
                          </div>

                          {/* Nov */}
                          <div className="flex flex-col items-center">
                            <div
                              className="w-5 bg-[#DAB6FC] rounded-t-sm"
                              style={{ height: "70px" }}
                            ></div>
                            <span className="mt-1 text-xs text-gray-400">
                              Nov
                            </span>
                          </div>

                          {/* Dec */}
                          <div className="flex flex-col items-center">
                            <div
                              className="w-5 bg-[#DAB6FC] rounded-t-sm"
                              style={{ height: "200px" }}
                            ></div>
                            <span className="mt-1 text-xs text-gray-400">
                              Dec
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#1A1E24] p-4 rounded-sm">
                  {/* Track list table with headers */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="pb-2 pr-6">
                            <div className="flex items-center text-sm text-indigo-400">
                              Title 
                              <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"></path>
                              </svg>
                            </div>
                          </th>
                          <th className="pb-2">
                            <div className="flex items-center text-sm text-indigo-400">
                              Artist Name 
                              <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"></path>
                              </svg>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-800">
                          <td className="py-3 text-white">The Overview</td>
                          <td className="py-3 text-white">Steven Wilson</td>
                        </tr>
                        <tr className="border-b border-gray-800">
                          <td className="py-3 text-white">The Overview</td>
                          <td className="py-3 text-white">Linkin Park</td>
                        </tr>
                        <tr className="border-b border-gray-800">
                          <td className="py-3 text-white">The Overview</td>
                          <td className="py-3 text-white">Steven Wilson</td>
                        </tr>
                        <tr className="border-b border-gray-800">
                          <td className="py-3 text-white">The Overview</td>
                          <td className="py-3 text-white">Linkin Park</td>
                        </tr>
                        <tr className="border-b border-gray-800">
                          <td className="py-3 text-white">The Overview</td>
                          <td className="py-3 text-white">Steven Wilson</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons - removed border-t */}
            <div className="flex p-4 space-x-4 justify-start">
              {trackStatus === "processing" ? (
                <>
                  <button
                    onClick={handleReject}
                    className="flex items-center justify-center px-4 py-2 border border-red-700 text-red-500 rounded-md hover:bg-red-900 hover:bg-opacity-30 transition-colors"
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
                    className="flex items-center justify-center px-4 py-2 border border-green-700 text-green-500 rounded-md hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                    disabled={
                      copyrightStatus === "checking" ||
                      copyrightStatus === "found"
                    }
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
              ) : (
                <button
                  onClick={handleResetStatus}
                  className="flex items-center justify-center px-4 py-2 border border-gray-700 text-gray-300 rounded-md hover:bg-gray-800 hover:bg-opacity-50 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Remove
                </button>
              )}
            </div>
          </div>
        )}

        {currentAction === "play" && (
          <div className="flex flex-col p-6 flex-1 overflow-auto">
            <div className="bg-[#1A1E24] rounded-lg p-5">
              <div className="flex items-center mb-6">
                <button className="w-14 h-14 flex items-center justify-center rounded-full bg-[#A365FF] text-white mr-4">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="flex-1">
                  <h3 className="text-white font-medium">{track.title}</h3>
                  <p className="text-gray-400 text-sm">{track.primaryArtist}</p>
                </div>
                <div className="text-gray-400 text-sm">
                  {track.duration}
                </div>
              </div>

              {/* Audio progress bar */}
              <div className="mb-4">
                <div className="h-16 relative mb-2">
                  {/* Waveform visualization */}
                  <div className="absolute inset-0 flex items-center justify-between">
                    {Array.from({ length: 100 }).map((_, i) => {
                      // Generate random height for each bar to simulate a waveform
                      const height = 20 + Math.random() * 60;
                      // Make the "played" part of the waveform a different color
                      const isPlayed = i < 30;
                      return (
                        <div 
                          key={i} 
                          className={`w-0.5 rounded-full ${isPlayed ? 'bg-[#A365FF]' : 'bg-gray-600'}`}
                          style={{ height: `${height}%` }}
                        ></div>
                      );
                    })}
                  </div>
                  
                  {/* Current playhead */}
                  <div className="absolute top-0 bottom-0 left-[30%] w-0.5 bg-white"></div>
                  
                  {/* Current time marker */}
                  <div className="absolute top-0 left-[30%] -ml-4 -mt-6 bg-[#252A33] px-2 py-1 rounded text-xs text-white">
                    1:14
                  </div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-400">
                  <span>0:00</span>
                  <span>{track.duration || "3:45"}</span>
                </div>
              </div>

              {/* Audio controls */}
              <div className="flex items-center justify-center space-x-6">
                <button className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8z" />
                    <path d="M12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                  </svg>
                </button>
                <button className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="w-12 h-12 flex items-center justify-center rounded-full bg-[#A365FF] text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16a1 1 0 11-2 0V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019a1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Volume control */}
              <div className="flex items-center mt-6">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071a1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243a1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828a1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
                <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
                  <div className="bg-[#A365FF] h-full rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>
            
            {/* Album tracklist */}
            <div className="mt-6 bg-[#1A1E24] p-4 rounded-lg">
              <h4 className="text-gray-400 text-sm mb-4">Album Tracklist</h4>
              <div className="space-y-2">
                {/* Track 1 - Currently playing */}
                <div className="flex items-center p-2 bg-[#252A33] rounded-md">
                  <div className="mr-3 text-[#A365FF]">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{track.title}</p>
                    <p className="text-gray-400 text-xs">{track.primaryArtist}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {track.duration || "3:45"}
                  </div>
                </div>
                
                {/* Track 2 */}
                <div className="flex items-center p-2 hover:bg-[#252A33] rounded-md">
                  <div className="mr-3 text-gray-500">
                    <span className="text-sm">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-200 text-sm">Electric Dreams</p>
                    <p className="text-gray-400 text-xs">{track.primaryArtist}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    4:12
                  </div>
                </div>
                
                {/* Track 3 */}
                <div className="flex items-center p-2 hover:bg-[#252A33] rounded-md">
                  <div className="mr-3 text-gray-500">
                    <span className="text-sm">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-200 text-sm">Stellar Journey</p>
                    <p className="text-gray-400 text-xs">{track.primaryArtist}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    3:55
                  </div>
                </div>
                
                {/* Track 4 */}
                <div className="flex items-center p-2 hover:bg-[#252A33] rounded-md">
                  <div className="mr-3 text-gray-500">
                    <span className="text-sm">4</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-200 text-sm">Digital Sunset</p>
                    <p className="text-gray-400 text-xs">{track.primaryArtist}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    5:20
                  </div>
                </div>
                
                {/* Track 5 */}
                <div className="flex items-center p-2 hover:bg-[#252A33] rounded-md">
                  <div className="mr-3 text-gray-500">
                    <span className="text-sm">5</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-200 text-sm">Futuristic Beats</p>
                    <p className="text-gray-400 text-xs">{track.primaryArtist}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    4:33
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentAction === "edit" && (
          <div className="flex flex-col p-8 flex-1 overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium text-white">Edit Release Details</h3>
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelChanges}
                  className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-2 bg-[#A365FF] text-white rounded-md hover:bg-opacity-90 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Album Title */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm">Album Title</label>
                <input
                  type="text"
                  value={editedTrack.title || ""}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  className="w-full bg-[#252A33] border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>

              {/* Primary Artist */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm">Primary Artist</label>
                <input
                  type="text"
                  value={editedTrack.primaryArtist || ""}
                  onChange={(e) => handleFieldChange("primaryArtist", e.target.value)}
                  className="w-full bg-[#252A33] border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>

              {/* Featured Artists */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm">Featured Artists</label>
                <input
                  type="text"
                  value={editedTrack.featuredArtists ? editedTrack.featuredArtists.join(", ") : ""}
                  onChange={(e) => handleFieldChange("featuredArtists", e.target.value)}
                  placeholder="Separate artists with commas"
                  className="w-full bg-[#252A33] border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>

              {/* Content Rating */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm">Content Rating</label>
                <select
                  value={editedTrack.contentRating || ""}
                  onChange={(e) => handleFieldChange("contentRating", e.target.value)}
                  className="w-full bg-[#252A33] border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="G">G</option>
                  <option value="PG">PG</option>
                  <option value="PG-13">PG-13</option>
                  <option value="R">R</option>
                </select>
              </div>

              {/* Label */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm">Label</label>
                <input
                  type="text"
                  value={editedTrack.label || ""}
                  onChange={(e) => handleFieldChange("label", e.target.value)}
                  className="w-full bg-[#252A33] border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>

              {/* UPC */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm">UPC</label>
                <input
                  type="text"
                  value={editedTrack.upc || ""}
                  onChange={(e) => handleFieldChange("upc", e.target.value)}
                  className="w-full bg-[#252A33] border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>

              {/* Genre & Subgenre */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm">Genre & Subgenre</label>
                <input
                  type="text"
                  value={editedTrack.genre || ""}
                  onChange={(e) => handleFieldChange("genre", e.target.value)}
                  className="w-full bg-[#252A33] border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>

              {/* Release Date */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm">Release Date</label>
                <input
                  type="text"
                  value={editedTrack.releaseDate || ""}
                  onChange={(e) => handleFieldChange("releaseDate", e.target.value)}
                  className="w-full bg-[#252A33] border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
              
              {/* Cover Art */}
              <div className="space-y-2 col-span-2">
                <label className="text-gray-400 text-sm">Cover Art</label>
                <div className="flex items-center">
                  <div className="w-24 h-24 relative rounded-md overflow-hidden bg-gray-800 mr-4">
                    <Image
                      src={editedTrack.imageSrc || defaultImage}
                      alt={editedTrack.title || "Album artwork"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button className="px-4 py-2 bg-[#252A33] border border-gray-700 text-gray-300 rounded-md hover:bg-gray-700 transition-colors">
                    Upload New Image
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
