"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

// Tab interfaces for the modal
type TabType = "details" | "performance";
type ActionType = "play" | "edit" | "copyright";

// Video status types
type VideoStatus = "processing" | "approved" | "rejected";

// Copyright check status
type CopyrightStatus = "checking" | "clear" | "found";

// For the performance chart
type StreamData = {
  day: number;
  streams: number;
};

// Props interface for the modal
interface VideoDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: {
    id: string;
    title: string;
    imageSrc: string;
    thumbnailSrc?: string;
    primaryArtist: string;
    featuredArtists?: string[];
    genre: string;
    subgenre?: string;
    contentRating: string;
    isrc?: string;
    upc?: string;
    duration: string;
    creationDate: string;
    label?: string;
  };
  initialAction?: ActionType;
  initialStatus?: VideoStatus;
  onApprove?: (videoId: string) => void;
  onReject?: (videoId: string) => void;
  onEdit?: (videoId: string) => void;
  onPlay?: (videoId: string) => void;
}

export default function VideoDetailsModal({
  isOpen,
  onClose,
  video,
  initialAction = "copyright",
  initialStatus = "processing",
  onApprove,
  onReject,
  onEdit,
  onPlay,
}: VideoDetailsModalProps) {
  // State variables
  const [currentTab, setCurrentTab] = useState<TabType>("details");
  const [currentAction, setCurrentAction] = useState<ActionType>(initialAction);
  const [videoStatus, setVideoStatus] = useState<VideoStatus>(initialStatus);
  const [copyrightStatus, setCopyrightStatus] =
    useState<CopyrightStatus>("checking");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedVideo, setEditedVideo] = useState({ ...video });

  // Default image fallback if video has no image
  const defaultImage = "/images/video/thumbnail.png";

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
      // Reset video status to initial status when modal opens
      setVideoStatus(initialStatus);
      // Reset edit mode and edited video
      setIsEditMode(false);
      setEditedVideo({ ...video });
    } else {
      // Reset video status when modal closes
      setVideoStatus(initialStatus);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown, currentAction, initialStatus, video]);

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
    setVideoStatus("approved");
    if (onApprove) onApprove(video.id);
    // Keep the modal open and don't change the UI state
  };

  // Handle rejection
  const handleReject = () => {
    setVideoStatus("rejected");
    if (onReject) onReject(video.id);
    // Keep the modal open and don't change the UI state
  };

  // Handle play button
  const handlePlay = () => {
    if (onPlay) onPlay(video.id);
  };

  // Handle edit button
  const handleEdit = () => {
    if (onEdit) onEdit(video.id);
    setIsEditMode(true);
  };

  // Add a save changes function
  const handleSaveChanges = () => {
    // In a real app, you would save the changes to the backend here
    // For now, we'll just log the changes and exit edit mode
    console.log("Changes saved:", editedVideo);
    setIsEditMode(false);
  };

  // Add a cancel changes function
  const handleCancelChanges = () => {
    setEditedVideo({ ...video });
    setIsEditMode(false);
  };

  // Add a field change handler
  const handleFieldChange = (field: string, value: string) => {
    setEditedVideo({
      ...editedVideo,
      [field]: value,
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
    creationDate: "25 March, 2025",
  };

  // Use default data if not provided
  const displayData = {
    primaryArtist: video.primaryArtist || defaultData.primaryArtist,
    featuredArtists: video.featuredArtists || defaultData.featuredArtists,
    genre: video.genre || defaultData.genre,
    contentRating: video.contentRating || defaultData.contentRating,
    upc: video.upc || defaultData.upc,
    label: video.label || defaultData.label,
    creationDate: video.creationDate || defaultData.creationDate,
    thumbnailSrc: video.thumbnailSrc || "",
    title: video.title || "Midnight Drive",
    duration: video.duration || "",
  };

  // Add a new handler to reset video status
  const handleResetStatus = () => {
    setVideoStatus("processing");
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
                src={video.imageSrc || defaultImage}
                alt={video.title || "Album artwork"}
                fill
                className="object-cover"
                onError={(e) => {
                  // Fall back to default image if the video image fails to load
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
                    {video.title || "Midnight Drive"}
                  </h2>
                  <span className="text-gray-400 text-sm">Video</span>
                </div>
                <div className="mt-1 text-sm text-gray-400">
                  {displayData.primaryArtist}
                </div>

                {/* Status Badge */}
                <div className="mt-1">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs rounded-full capitalize ${
                      videoStatus === "approved"
                        ? "bg-green-900 text-green-200"
                        : videoStatus === "rejected"
                        ? "bg-red-900 text-red-200"
                        : "bg-gray-800 text-gray-200"
                    }`}
                  >
                    {videoStatus}
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
        </div>

        {/* Content Area */}
        {currentAction === "copyright" && (
          <div className="flex flex-col flex-1 overflow-auto">
            {/* Tab Content */}
            <div className="px-5 pb-5 flex-1 overflow-y-auto ">
              {currentTab === "details" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Artist */}
                  <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                    <h3 className="text-gray-400 text-sm">Artist</h3>
                    <p className="text-white text-base font-medium">
                      {displayData.primaryArtist}
                    </p>
                  </div>

                  {/* Content Rating */}
                  <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                    <h3 className="text-gray-400 text-sm">Content Rating</h3>
                    <p className="text-white text-base font-medium">
                      {displayData.contentRating}
                    </p>
                  </div>

                  {/* Video ISRC */}
                  <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                    <h3 className="text-gray-400 text-sm">Video ISRC</h3>
                    <p className="text-white text-base font-medium">
                      {video.isrc || "Not Available"}
                    </p>
                  </div>

                  {/* Duration */}
                  <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                    <h3 className="text-gray-400 text-sm">Duration</h3>
                    <p className="text-white text-base font-medium">
                      {video.duration}
                    </p>
                  </div>

                  {/* Genre & Subgenre */}
                  <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                    <h3 className="text-gray-400 text-sm">Genre & Subgenre</h3>
                    <p className="text-white text-base font-medium">
                      {displayData.genre}
                      {video.subgenre ? ` / ${video.subgenre}` : ""}
                    </p>
                  </div>

                  {/* Type */}
                  <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                    <h3 className="text-gray-400 text-sm">Type</h3>
                    <p className="text-white text-base font-medium">Video</p>
                  </div>

                  {/* UPC */}
                  <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                    <h3 className="text-gray-400 text-sm">UPC</h3>
                    <p className="text-white text-base font-medium">
                      {video.upc || "Not Available"}
                    </p>
                  </div>

                  {/* Creation Date */}
                  <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                    <h3 className="text-gray-400 text-sm">Creation Date</h3>
                    <p className="text-white text-base font-medium">
                      {displayData.creationDate}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Stream Analytics */}
                  <div className=" p-4 rounded-md">
                    <div className="bg-[#1E222B] px-4 py-2 rounded-md flex justify-between items-center mb-4">
                      <h3 className="text-white font-medium">Views</h3>
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
              )}
            </div>

            {/* Action buttons - removed border-t */}
            <div className="flex p-4 space-x-4 justify-start">
              {videoStatus === "processing" ? (
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
          <div className="mt-4 bg-[#1A1E24] rounded-sm overflow-hidden">
            <div className="relative">
              {/* Video player container */}
              <div className="relative aspect-video bg-black">
                <img
                  src={displayData.thumbnailSrc || defaultImage}
                  alt={displayData.title}
                  className="w-full h-full object-cover"
                />

                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="bg-[#00C2FF] rounded-full p-4 shadow-lg transform transition-transform hover:scale-110">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>

                {/* Video controls overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white text-xs">0:00</span>
                    <div className="relative flex-1 h-1 bg-gray-600 rounded-full">
                      <div className="h-full w-[30%] bg-[#00C2FF] rounded-full"></div>
                      <div
                        className="absolute h-3 w-3 bg-white rounded-full top-1/2 transform -translate-y-1/2"
                        style={{ left: "30%" }}
                      ></div>
                    </div>
                    <span className="text-white text-xs">
                      {displayData.duration}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <button className="text-white hover:text-[#00C2FF]">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                        </svg>
                      </button>
                      <button className="text-white hover:text-[#00C2FF]">
                        <svg
                          className="w-8 h-8"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                      <button className="text-white hover:text-[#00C2FF]">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                        </svg>
                      </button>
                      <div className="flex items-center gap-2">
                        <button className="text-white hover:text-[#00C2FF]">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                          </svg>
                        </button>
                        <div className="w-16 h-1 bg-gray-600 rounded-full">
                          <div className="h-full w-[70%] bg-white rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="text-white hover:text-[#00C2FF]">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
                        </svg>
                      </button>
                      <button className="text-white hover:text-[#00C2FF]">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                        </svg>
                      </button>
                      <button className="text-white hover:text-[#00C2FF]">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Video information */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-white font-medium text-xl">
                  {displayData.title}
                </h3>
                <p className="text-gray-400">{displayData.primaryArtist}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="flex">
                    <span className="text-gray-400 w-24 text-sm">
                      Duration:
                    </span>
                    <span className="text-white text-sm">
                      {displayData.duration}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-400 w-24 text-sm">Format:</span>
                    <span className="text-white text-sm">MP4, H.264</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-400 w-24 text-sm">
                      Resolution:
                    </span>
                    <span className="text-white text-sm">1920x1080 (HD)</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-400 w-24 text-sm">
                      Frame Rate:
                    </span>
                    <span className="text-white text-sm">24 fps</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex">
                    <span className="text-gray-400 w-24 text-sm">Created:</span>
                    <span className="text-white text-sm">
                      {displayData.creationDate}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-400 w-24 text-sm">Genre:</span>
                    <span className="text-white text-sm">
                      {displayData.genre}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-400 w-24 text-sm">ISRC:</span>
                    <span className="text-white text-sm">
                      {video.isrc || "Not Available"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-400 w-24 text-sm">Rating:</span>
                    <span className="text-white text-sm">
                      {displayData.contentRating}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentAction === "edit" && (
          <div className="flex flex-col p-8 flex-1 overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium text-white">
                Edit Video Details
              </h3>
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
              {/* Artist */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm">Artist</label>
                <input
                  type="text"
                  value={editedVideo.primaryArtist || ""}
                  onChange={(e) =>
                    handleFieldChange("primaryArtist", e.target.value)
                  }
                  className="w-full bg-[#252A33] border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm">Title</label>
                <input
                  type="text"
                  value={editedVideo.title || ""}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  className="w-full bg-[#252A33] border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>

              {/* Content Rating */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm">Content Rating</label>
                <select
                  value={editedVideo.contentRating || ""}
                  onChange={(e) =>
                    handleFieldChange("contentRating", e.target.value)
                  }
                  className="w-full bg-[#252A33] border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="G">G</option>
                  <option value="PG">PG</option>
                  <option value="PG-13">PG-13</option>
                  <option value="R">R</option>
                </select>
              </div>

              {/* ISRC */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm">ISRC</label>
                <input
                  type="text"
                  value={editedVideo.isrc || ""}
                  onChange={(e) => handleFieldChange("isrc", e.target.value)}
                  className="w-full bg-[#252A33] border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>

              {/* Release Date */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm">Release Date</label>
                <input
                  type="text"
                  value={editedVideo.creationDate || ""}
                  onChange={(e) =>
                    handleFieldChange("creationDate", e.target.value)
                  }
                  className="w-full bg-[#252A33] border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>

              {/* Genre */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm">Genre</label>
                <input
                  type="text"
                  value={editedVideo.genre || ""}
                  onChange={(e) => handleFieldChange("genre", e.target.value)}
                  className="w-full bg-[#252A33] border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm">Duration</label>
                <input
                  type="text"
                  value={editedVideo.duration || ""}
                  onChange={(e) =>
                    handleFieldChange("duration", e.target.value)
                  }
                  className="w-full bg-[#252A33] border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
