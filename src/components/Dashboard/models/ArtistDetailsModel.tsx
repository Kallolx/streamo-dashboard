"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

// Tab interfaces for the modal
type TabType = "details" | "performance" | "royalty" | "tracks";

// Define the artist data interface
interface Artist {
  id: number;
  name: string;
  imageSrc: string;
  bio: string;
  label: string;
  totalTracks: number;
  totalAlbums: number;
  type: string;
  tags: string[];
  platforms: string[];
}

interface ArtistDetailsModelProps {
  artist: Artist;
  isOpen: boolean;
  onClose: () => void;
}

export default function ArtistDetailsModel({
  artist,
  isOpen,
  onClose,
}: ArtistDetailsModelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("details");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedArtist, setEditedArtist] = useState<Artist>({ ...artist });
  
  // Determine singer image based on artist ID to ensure consistency
  // Use modulo 3 + 1 to get numbers 1, 2, or 3 based on artist ID
  const imageNumber = (artist.id % 3) + 1;
  const singerImage = `/images/singer/${imageNumber}.webp`;
  
  const defaultImage = "/images/singer/1.webp";

  // Generate random tags for the artist if not provided
  const possibleTags = [
    "USA",
    "UK",
    "Canada",
    "Australia",
    "Hip-Hop",
    "Alternative Rock",
    "Pop",
    "Electronic",
    "R&B",
    "Jazz",
  ];
  const randomTags =
    artist.tags || possibleTags.sort(() => 0.5 - Math.random()).slice(0, 3);

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
      // Reset edit mode and edited artist when modal opens
      setIsEditMode(false);
      setEditedArtist({ ...artist });
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown, artist]);

  // Handle edit info click
  const handleEditClick = () => {
    setIsEditMode(true);
  };

  // Handle save changes
  const handleSaveChanges = () => {
    console.log("Changes saved:", editedArtist);
    setIsEditMode(false);
  };

  // Handle cancel changes
  const handleCancelChanges = () => {
    setEditedArtist({ ...artist });
    setIsEditMode(false);
  };

  // Handle field change
  const handleFieldChange = (field: string, value: string | number) => {
    setEditedArtist({
      ...editedArtist,
      [field]: value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 backdrop-blur-sm" onClick={onClose}></div>

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
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="p-5">
          <div className="flex">
            {/* Artist image */}
            <div className="w-32 h-32 relative rounded-full overflow-hidden mr-6 flex-shrink-0 bg-gray-800">
              <Image
                src={singerImage}
                alt={artist.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Artist info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white truncate mb-2">
                {artist.name}
              </h2>

              {/* Tags row */}
              <div className="flex flex-wrap gap-2 mb-3">
                {randomTags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs bg-[#1D2229] rounded-full text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Platform icons */}
              <div className="flex space-x-3">
                {artist.platforms.includes("spotify") && (
                  <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center">
                    <img
                      src="/icons/sp.svg"
                      alt="Spotify"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {artist.platforms.includes("apple") && (
                  <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center">
                    <img
                      src="/icons/ap.svg"
                      alt="Apple Music"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {artist.platforms.includes("youtube") && (
                  <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center">
                    <img
                      src="/icons/yt.svg"
                      alt="YouTube Music"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {artist.platforms.includes("soundcloud") && (
                  <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center">
                    <img
                      src="/icons/sc.svg"
                      alt="SoundCloud"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-3 mt-auto px-5 pb-4">
          <button
            className={`flex items-center px-3 py-2 rounded-full ${
              activeTab === "details"
                ? "bg-[#A365FF] text-white"
                : "bg-[#1A1E24] text-gray-300 hover:text-white"
            } transition-colors`}
            onClick={() => setActiveTab("details")}
          >
            <span className="text-sm">Details</span>
          </button>
          <button
            className={`flex items-center px-3 py-2 rounded-full ${
              activeTab === "performance"
                ? "bg-[#A365FF] text-white"
                : "bg-[#1A1E24] text-gray-300 hover:text-white"
            } transition-colors`}
            onClick={() => setActiveTab("performance")}
          >
            <span className="text-sm">Performance Analytics</span>
          </button>
          <button
            className={`flex items-center px-3 py-2 rounded-full ${
              activeTab === "royalty"
                ? "bg-[#A365FF] text-white"
                : "bg-[#1A1E24] text-gray-300 hover:text-white"
            } transition-colors`}
            onClick={() => setActiveTab("royalty")}
          >
            <span className="text-sm">Royalty & Splits</span>
          </button>
          <button
            className={`flex items-center px-3 py-2 rounded-full ${
              activeTab === "tracks"
                ? "bg-[#A365FF] text-white"
                : "bg-[#1A1E24] text-gray-300 hover:text-white"
            } transition-colors`}
            onClick={() => setActiveTab("tracks")}
          >
            <span className="text-sm">Track & Release list</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto p-5 flex-grow">
          {activeTab === "details" && (
            <div className="space-y-4">
              {/* Biography section */}
              <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                <h3 className="text-gray-400 text-sm">Bio</h3>
                {isEditMode ? (
                  <textarea
                    value={editedArtist.bio}
                    onChange={(e) => handleFieldChange("bio", e.target.value)}
                    rows={4}
                    className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-3 py-2 text-white mt-2"
                  />
                ) : (
                  <p className="text-white text-base font-medium">
                    {artist.bio || "No biography available for this artist."}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Label section */}
                <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                  <h3 className="text-gray-400 text-sm">Label</h3>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={editedArtist.label}
                      onChange={(e) =>
                        handleFieldChange("label", e.target.value)
                      }
                      className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-3 py-2 text-white mt-2"
                    />
                  ) : (
                    <p className="text-white text-base font-medium">
                      {artist.label || "Independent"}
                    </p>
                  )}
                </div>

                {/* Total tracks section */}
                <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                  <h3 className="text-gray-400 text-sm">Total Tracks</h3>
                  {isEditMode ? (
                    <input
                      type="number"
                      value={editedArtist.totalTracks}
                      onChange={(e) =>
                        handleFieldChange(
                          "totalTracks",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-3 py-2 text-white mt-2"
                    />
                  ) : (
                    <p className="text-white text-base font-medium">
                      {artist.totalTracks || 0}
                    </p>
                  )}
                </div>

                {/* Total albums section */}
                <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                  <h3 className="text-gray-400 text-sm">Total Albums</h3>
                  {isEditMode ? (
                    <input
                      type="number"
                      value={editedArtist.totalAlbums}
                      onChange={(e) =>
                        handleFieldChange(
                          "totalAlbums",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-3 py-2 text-white mt-2"
                    />
                  ) : (
                    <p className="text-white text-base font-medium">
                      {artist.totalAlbums || 0}
                    </p>
                  )}
                </div>

                {/* Type section */}
                <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                  <h3 className="text-gray-400 text-sm">Type</h3>
                  {isEditMode ? (
                    <select
                      value={editedArtist.type}
                      onChange={(e) =>
                        handleFieldChange("type", e.target.value)
                      }
                      className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-3 py-2 text-white mt-2"
                    >
                      <option value="Solo Artist">Solo Artist</option>
                      <option value="Band">Band</option>
                      <option value="Duo">Duo</option>
                      <option value="Group">Group</option>
                    </select>
                  ) : (
                    <p className="text-white text-base font-medium">
                      {artist.type || "Solo Artist"}
                    </p>
                  )}
                </div>
              </div>

              {/* Edit/Save buttons */}
              <div className="mt-6">
                {isEditMode ? (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCancelChanges}
                      className="px-4 py-2 bg-gray-700 rounded-md text-white hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      className="px-4 py-2 bg-[#A365FF] rounded-md text-white hover:bg-purple-700 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEditClick}
                    className="px-4 py-2 bg-[#A365FF] rounded-md text-white hover:bg-purple-700 transition-colors"
                  >
                    Edit Info
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === "performance" && (
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
                        <span className="mt-1 text-xs text-gray-400">Jan</span>
                      </div>

                      {/* Feb */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-5 bg-[#DAB6FC] rounded-t-sm"
                          style={{ height: "60px" }}
                        ></div>
                        <span className="mt-1 text-xs text-gray-400">Feb</span>
                      </div>

                      {/* Mar */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-5 bg-[#DAB6FC] rounded-t-sm"
                          style={{ height: "180px" }}
                        ></div>
                        <span className="mt-1 text-xs text-gray-400">Mar</span>
                      </div>

                      {/* Apr */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-5 bg-[#DAB6FC] rounded-t-sm"
                          style={{ height: "80px" }}
                        ></div>
                        <span className="mt-1 text-xs text-gray-400">Apr</span>
                      </div>

                      {/* May */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-5 bg-[#DAB6FC] rounded-t-sm"
                          style={{ height: "55px" }}
                        ></div>
                        <span className="mt-1 text-xs text-gray-400">May</span>
                      </div>

                      {/* Jun */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-5 bg-[#DAB6FC] rounded-t-sm"
                          style={{ height: "140px" }}
                        ></div>
                        <span className="mt-1 text-xs text-gray-400">Jun</span>
                      </div>

                      {/* Jul */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-5 bg-[#DAB6FC] rounded-t-sm"
                          style={{ height: "95px" }}
                        ></div>
                        <span className="mt-1 text-xs text-gray-400">Jul</span>
                      </div>

                      {/* Aug */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-5 bg-[#DAB6FC] rounded-t-sm"
                          style={{ height: "110px" }}
                        ></div>
                        <span className="mt-1 text-xs text-gray-400">Aug</span>
                      </div>

                      {/* Sep */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-5 bg-[#DAB6FC] rounded-t-sm"
                          style={{ height: "125px" }}
                        ></div>
                        <span className="mt-1 text-xs text-gray-400">Sep</span>
                      </div>

                      {/* Oct */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-5 bg-[#DAB6FC] rounded-t-sm"
                          style={{ height: "90px" }}
                        ></div>
                        <span className="mt-1 text-xs text-gray-400">Oct</span>
                      </div>

                      {/* Nov */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-5 bg-[#DAB6FC] rounded-t-sm"
                          style={{ height: "70px" }}
                        ></div>
                        <span className="mt-1 text-xs text-gray-400">Nov</span>
                      </div>

                      {/* Dec */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-5 bg-[#DAB6FC] rounded-t-sm"
                          style={{ height: "200px" }}
                        ></div>
                        <span className="mt-1 text-xs text-gray-400">Dec</span>
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
                        <span className="mt-1 text-xs text-gray-400">Jan</span>
                      </div>

                      {/* Feb */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-5 bg-[#DAB6FC] rounded-t-sm"
                          style={{ height: "60px" }}
                        ></div>
                        <span className="mt-1 text-xs text-gray-400">Feb</span>
                      </div>

                      {/* Mar */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-5 bg-[#DAB6FC] rounded-t-sm"
                          style={{ height: "180px" }}
                        ></div>
                        <span className="mt-1 text-xs text-gray-400">Mar</span>
                      </div>

                      {/* Apr */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-5 bg-[#DAB6FC] rounded-t-sm"
                          style={{ height: "80px" }}
                        ></div>
                        <span className="mt-1 text-xs text-gray-400">Apr</span>
                      </div>

                      {/* May */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-5 bg-[#DAB6FC] rounded-t-sm"
                          style={{ height: "55px" }}
                        ></div>
                        <span className="mt-1 text-xs text-gray-400">May</span>
                      </div>

                      {/* Jun */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-5 bg-[#DAB6FC] rounded-t-sm"
                          style={{ height: "140px" }}
                        ></div>
                        <span className="mt-1 text-xs text-gray-400">Jun</span>
                      </div>

                      {/* Jul */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-5 bg-[#DAB6FC] rounded-t-sm"
                          style={{ height: "95px" }}
                        ></div>
                        <span className="mt-1 text-xs text-gray-400">Jul</span>
                      </div>

                      {/* Aug */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-5 bg-[#DAB6FC] rounded-t-sm"
                          style={{ height: "110px" }}
                        ></div>
                        <span className="mt-1 text-xs text-gray-400">Aug</span>
                      </div>

                      {/* Sep */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-5 bg-[#DAB6FC] rounded-t-sm"
                          style={{ height: "125px" }}
                        ></div>
                        <span className="mt-1 text-xs text-gray-400">Sep</span>
                      </div>

                      {/* Oct */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-5 bg-[#DAB6FC] rounded-t-sm"
                          style={{ height: "90px" }}
                        ></div>
                        <span className="mt-1 text-xs text-gray-400">Oct</span>
                      </div>

                      {/* Nov */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-5 bg-[#DAB6FC] rounded-t-sm"
                          style={{ height: "70px" }}
                        ></div>
                        <span className="mt-1 text-xs text-gray-400">Nov</span>
                      </div>

                      {/* Dec */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-5 bg-[#DAB6FC] rounded-t-sm"
                          style={{ height: "200px" }}
                        ></div>
                        <span className="mt-1 text-xs text-gray-400">Dec</span>
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
                      <div className="text-[#00C2FF] font-medium">Tidal 5%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "royalty" && (
            <div className="overflow-y-auto">
              {/* Table header */}
              <div className="grid grid-cols-12 bg-[#1E222B] p-4 text-sm text-gray-400 font-medium">
                <div className="col-span-6">Tracks/Releases</div>
                <div className="col-span-2">Split(%)</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Payout</div>
              </div>
              
              {/* Table rows */}
              <div className="divide-y divide-gray-800">
                {/* Row 1 */}
                <div className="grid grid-cols-12 p-4 items-center">
                  <div className="col-span-6 flex items-center space-x-3">
                    <div className="h-12 w-12 rounded bg-gray-800 overflow-hidden">
                      <img src="/images/music/1.png" alt="Track cover" className="h-full w-full object-cover" />
                    </div>
                    <span className="text-white">Midnight Drive</span>
                  </div>
                  <div className="col-span-2 text-white">20%</div>
                  <div className="col-span-2 text-white">Pending</div>
                  <div className="col-span-2 text-white">-</div>
                </div>
                
                {/* Row 2 */}
                <div className="grid grid-cols-12 p-4 items-center">
                  <div className="col-span-6 flex items-center space-x-3">
                    <div className="h-12 w-12 rounded bg-gray-800 overflow-hidden">
                      <img src="/images/music/2.png" alt="Track cover" className="h-full w-full object-cover" />
                    </div>
                    <span className="text-white">Midnight Drive</span>
                  </div>
                  <div className="col-span-2 text-white">20%</div>
                  <div className="col-span-2 text-[#6AE398]">Paid</div>
                  <div className="col-span-2 text-white">$1500</div>
                </div>
                
                {/* Row 3 */}
                <div className="grid grid-cols-12 p-4 items-center">
                  <div className="col-span-6 flex items-center space-x-3">
                    <div className="h-12 w-12 rounded bg-gray-800 overflow-hidden">
                      <img src="/images/music/3.png" alt="Track cover" className="h-full w-full object-cover" />
                    </div>
                    <span className="text-white">Midnight Drive</span>
                  </div>
                  <div className="col-span-2 text-white">20%</div>
                  <div className="col-span-2 text-white">Pending</div>
                  <div className="col-span-2 text-white">-</div>
                </div>
                
                {/* Row 4 */}
                <div className="grid grid-cols-12 p-4 items-center">
                  <div className="col-span-6 flex items-center space-x-3">
                    <div className="h-12 w-12 rounded bg-gray-800 overflow-hidden">
                      <img src="/images/music/4.png" alt="Track cover" className="h-full w-full object-cover" />
                    </div>
                    <span className="text-white">Midnight Drive</span>
                  </div>
                  <div className="col-span-2 text-white">20%</div>
                  <div className="col-span-2 text-[#6AE398]">Paid</div>
                  <div className="col-span-2 text-white">$1500</div>
                </div>
                
                {/* Row 5 */}
                <div className="grid grid-cols-12 p-4 items-center">
                  <div className="col-span-6 flex items-center space-x-3">
                    <div className="h-12 w-12 rounded bg-gray-800 overflow-hidden">
                      <img src="/images/music/5.png" alt="Track cover" className="h-full w-full object-cover" />
                    </div>
                    <span className="text-white">Midnight Drive</span>
                  </div>
                  <div className="col-span-2 text-white">20%</div>
                  <div className="col-span-2 text-[#6AE398]">Paid</div>
                  <div className="col-span-2 text-white">$1500</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "tracks" && (
            <div className="space-y-6">
              {/* Top Tracks Section */}
              <div>
                <h2 className="text-white text-lg font-semibold mb-3">Top Tracks</h2>
                
                {/* Table Header */}
                <div className="grid grid-cols-12 bg-[#1E222B] py-3 px-4 text-sm text-gray-400 font-medium rounded-t">
                  <div className="col-span-5 flex items-center">
                    Track Title <span className="ml-1">↓</span>
                  </div>
                  <div className="col-span-4 flex items-center">
                    Artist Name <span className="ml-1">↓</span>
                  </div>
                  <div className="col-span-3 text-right">Revenue Earned</div>
                </div>
                
                {/* Table Rows */}
                <div className="divide-y divide-gray-800 bg-[#171B21] rounded-b overflow-hidden">
                  {/* Track 1 */}
                  <div className="grid grid-cols-12 py-3 px-4 items-center">
                    <div className="col-span-5 flex items-center space-x-3">
                      <div className="h-10 w-10 rounded bg-gray-800 overflow-hidden flex-shrink-0">
                        <img src="/images/music/1.png" alt="Track cover" className="h-full w-full object-cover" />
                      </div>
                      <span className="text-white truncate">Midnight Drive</span>
                    </div>
                    <div className="col-span-4 text-white">Neon Pulse</div>
                    <div className="col-span-3 text-right text-white">$12.6k (5.1%)</div>
                  </div>
                  
                  {/* Track 2 */}
                  <div className="grid grid-cols-12 py-3 px-4 items-center">
                    <div className="col-span-5 flex items-center space-x-3">
                      <div className="h-10 w-10 rounded bg-gray-800 overflow-hidden flex-shrink-0">
                        <img src="/images/music/2.png" alt="Track cover" className="h-full w-full object-cover" />
                      </div>
                      <span className="text-white truncate">Midnight Drive</span>
                    </div>
                    <div className="col-span-4 text-white">Neon Pulse</div>
                    <div className="col-span-3 text-right text-white">$12.6k (5.1%)</div>
                  </div>
                  
                  {/* Track 3 */}
                  <div className="grid grid-cols-12 py-3 px-4 items-center">
                    <div className="col-span-5 flex items-center space-x-3">
                      <div className="h-10 w-10 rounded bg-gray-800 overflow-hidden flex-shrink-0">
                        <img src="/images/music/3.png" alt="Track cover" className="h-full w-full object-cover" />
                      </div>
                      <span className="text-white truncate">Midnight Drive</span>
                    </div>
                    <div className="col-span-4 text-white">Neon Pulse</div>
                    <div className="col-span-3 text-right text-white">$12.6k (5.1%)</div>
                  </div>
                </div>
              </div>
              
              {/* Top Releases Section */}
              <div>
                <h2 className="text-white text-lg font-semibold mb-3">Top Releases</h2>
                
                {/* Table Header */}
                <div className="grid grid-cols-12 bg-[#1E222B] py-3 px-4 text-sm text-gray-400 font-medium rounded-t">
                  <div className="col-span-9 flex items-center">
                    Releases Name <span className="ml-1">↓</span>
                  </div>
                  <div className="col-span-3 text-right">Revenue Earned</div>
                </div>
                
                {/* Table Rows */}
                <div className="divide-y divide-gray-800 bg-[#171B21] rounded-b overflow-hidden">
                  {/* Release 1 */}
                  <div className="grid grid-cols-12 py-3 px-4 items-center">
                    <div className="col-span-9 flex items-center space-x-3">
                      <div className="h-10 w-10 rounded bg-gray-800 overflow-hidden flex-shrink-0">
                        <img src="/images/music/1.png" alt="Release cover" className="h-full w-full object-cover" />
                      </div>
                      <span className="text-white truncate">Midnight Drive</span>
                    </div>
                    <div className="col-span-3 text-right text-white">$12.6k (5.1%)</div>
                  </div>
                  
                  {/* Release 2 */}
                  <div className="grid grid-cols-12 py-3 px-4 items-center">
                    <div className="col-span-9 flex items-center space-x-3">
                      <div className="h-10 w-10 rounded bg-gray-800 overflow-hidden flex-shrink-0">
                        <img src="/images/music/4.png" alt="Release cover" className="h-full w-full object-cover" />
                      </div>
                      <span className="text-white truncate">Midnight Drive</span>
                    </div>
                    <div className="col-span-3 text-right text-white">$12.6k (5.1%)</div>
                  </div>
                  
                  {/* Release 3 */}
                  <div className="grid grid-cols-12 py-3 px-4 items-center">
                    <div className="col-span-9 flex items-center space-x-3">
                      <div className="h-10 w-10 rounded bg-gray-800 overflow-hidden flex-shrink-0">
                        <img src="/images/music/1.png" alt="Release cover" className="h-full w-full object-cover" />
                      </div>
                      <span className="text-white truncate">Midnight Drive</span>
                    </div>
                    <div className="col-span-3 text-right text-white">$12.6k (5.1%)</div>
                  </div>
                </div>
              </div>
              
              {/* Edit button */}
              <div className="mt-4">
                <button className="px-4 py-2 bg-[#A365FF] rounded-md text-white hover:bg-purple-700 transition-colors">
                  Edit Info
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
