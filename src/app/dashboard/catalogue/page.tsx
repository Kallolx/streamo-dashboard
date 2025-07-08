"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import ReleasesTable from "@/components/Dashboard/Tables/ReleasesTable";
import ReleaseDetailsModal from "@/components/Dashboard/models/ReleaseDetailsModal";
import VideoDetailsModal from "@/components/Dashboard/models/VideoDetailsModal";
import TracksTable from "@/components/Dashboard/Tables/TracksTable";
import api from "@/services/api";

// Example video data for the modal
const sampleVideos = [
  {
    _id: "VID00123",
    title: "Midnight Drive",
    imageSrc: "/images/music/1.png",
    primaryArtist: "Neon Pulse",
    artist: "Neon Pulse",
    genre: "Alternative Rock",
    contentRating: "PG",
    isrc: "US-XYZ-23-00001",
    duration: "3:41",
    releaseDate: "25 March, 2025",
    status: "approved",
    createdAt: "2023-01-15T10:30:00Z",
    updatedAt: "2023-01-15T10:30:00Z",
  },
  {
    _id: "VID00124",
    title: "Urban Echoes",
    imageSrc: "/images/music/2.png",
    primaryArtist: "Cyber Waves",
    artist: "Cyber Waves",
    genre: "Electronic",
    contentRating: "PG",
    isrc: "US-XYZ-23-00002",
    duration: "4:15",
    releaseDate: "18 April, 2025",
    status: "approved",
    createdAt: "2023-02-20T14:45:00Z",
    updatedAt: "2023-02-20T14:45:00Z",
  },
  {
    _id: "VID00125",
    title: "Neon Dreams",
    imageSrc: "/images/music/3.png",
    primaryArtist: "Future Sound",
    artist: "Future Sound",
    genre: "Synthwave",
    contentRating: "PG",
    isrc: "US-XYZ-23-00003",
    duration: "3:58",
    releaseDate: "2 May, 2025",
    status: "submitted",
    createdAt: "2023-03-10T09:15:00Z",
    updatedAt: "2023-03-10T09:15:00Z",
  },
  {
    _id: "VID00126",
    title: "Electric Sky",
    imageSrc: "/images/music/4.png",
    primaryArtist: "Digital Horizon",
    artist: "Digital Horizon",
    genre: "EDM",
    contentRating: "PG",
    isrc: "US-XYZ-23-00004",
    duration: "4:32",
    releaseDate: "15 June, 2025",
    status: "submitted",
    createdAt: "2023-04-05T16:20:00Z",
    updatedAt: "2023-04-05T16:20:00Z",
  },
  {
    _id: "VID00127",
    title: "Midnight Rhythm",
    imageSrc: "/images/music/5.png",
    primaryArtist: "Beat Masters",
    artist: "Beat Masters",
    genre: "Hip-Hop",
    contentRating: "PG",
    isrc: "US-XYZ-23-00005",
    duration: "3:22",
    releaseDate: "30 July, 2025",
    status: "approved",
    createdAt: "2023-05-12T11:40:00Z",
    updatedAt: "2023-05-12T11:40:00Z",
  },
];

// Define the catalogue tabs
const catalogueTabs = [
  {
    name: "Releases",
    title: "Releases",
    description: "Manage your music releases and albums",
  },
  {
    name: "Videos",
    title: "Videos",
    description: "Manage your music videos and visual content",
  },
];

// Define interfaces for different item types
interface VideoItem {
  _id: string;
  title: string;
  imageSrc: string;
  primaryArtist: string;
  artist: string;
  genre: string;
  contentRating: string;
  isrc: string;
  duration: string;
  releaseDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  videoFile?: string;
  coverArt?: string;
}

// Match the Release interface used in the modal
interface ReleaseItem {
  _id: string;
  title: string;
  artist: string;
  coverArt: string;
  releaseType: string;
  genre: string;
  format: string;
  upc: string;
  duration: string;
  releaseDate: string;
  status: string;
  tracks: any[];
  stores: string[];
  createdAt: string;
  updatedAt: string;
}

export default function CataloguePage() {
  // Modal states for each type
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem>(
    sampleVideos[0]
  );
  const [selectedRelease, setSelectedRelease] = useState<ReleaseItem | null>(
    null
  );
  const [releases, setReleases] = useState<ReleaseItem[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("Releases");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      if (activeTab === "Releases" || activeTab === "Videos") {
        setLoading(true);
        setError("");
        try {
          if (activeTab === "Releases") {
            const response = await api.get("/releases");

            if (response.data.success) {
              setReleases(response.data.data);
            } else {
              setError("Failed to fetch releases");
            }
          } else if (activeTab === "Videos") {
            const response = await api.get("/tracks");

            if (response.data.success) {
              setVideos(response.data.data);
            } else {
              setError("Failed to fetch videos");
            }
          }
        } catch (err) {
          console.error(`Error fetching ${activeTab.toLowerCase()}:`, err);
          setError(`Error fetching ${activeTab.toLowerCase()}`);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [activeTab]);

  // Get current tab data
  const currentTab =
    catalogueTabs.find((tab) => tab.name === activeTab) || catalogueTabs[0];

  // Handle tab selection
  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
    // Close any open modals when changing tabs
    setIsReleaseModalOpen(false);
    setIsVideoModalOpen(false);
  };

  // Handle release selection
  const handleReleaseSelect = (releaseId: string) => {
    const release = releases.find((r) => r._id === releaseId);
    if (release) {
      setSelectedRelease(release);
      setIsReleaseModalOpen(true);
    }
  };

  // Handle video selection
  const handleVideoSelect = (videoId: string) => {
    // Try to find the video in the fetched data
    const apiVideo = videos.find((v) => v._id === videoId);

    if (apiVideo) {
      // Map API video data to the format expected by the VideoDetailsModal
      setSelectedVideo({
        ...apiVideo,
        title: apiVideo.title || "Untitled Video",
        imageSrc: apiVideo.coverArt || "/images/music/1.png",
        coverArt: apiVideo.coverArt,
        videoFile: apiVideo.videoFile,
        primaryArtist: apiVideo.artist || "Unknown Artist",
        artist: apiVideo.artist || "Unknown Artist",
        genre: apiVideo.genre || "Not Specified",
        contentRating: apiVideo.contentRating || "Not Rated",
        isrc: apiVideo.isrc || "Not Available",
        duration: apiVideo.duration || "0:00",
        releaseDate: apiVideo.releaseDate
          ? new Date(apiVideo.releaseDate).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "Not Available",
        status: apiVideo.status || "Not Available",
        createdAt: apiVideo.createdAt || "Not Available",
        updatedAt: apiVideo.updatedAt || "Not Available",
      });
    } else {
      // Fallback to sample data if video not found
      const sampleIndex = Math.abs(videoId.charCodeAt(0) % sampleVideos.length);
      setSelectedVideo({
        ...sampleVideos[sampleIndex],
        _id: videoId,
        artist: sampleVideos[sampleIndex].primaryArtist,
        status: "Not Available",
        createdAt: "Not Available",
        updatedAt: "Not Available",
      });
    }

    setIsVideoModalOpen(true);
  };

  // Handle release approve
  const handleReleaseApprove = async (releaseId: string) => {
    try {
      await api.patch(`/releases/${releaseId}/status`, { status: "approved" });

      // Update the local state
      setReleases((prevReleases) =>
        prevReleases.map((release) =>
          release._id === releaseId
            ? { ...release, status: "approved" }
            : release
        )
      );

      setIsReleaseModalOpen(false);
    } catch (err) {
      console.error("Error approving release:", err);
    }
  };

  // Handle release reject
  const handleReleaseReject = async (releaseId: string) => {
    try {
      await api.patch(`/releases/${releaseId}/status`, { status: "rejected" });

      // Update the local state
      setReleases((prevReleases) =>
        prevReleases.map((release) =>
          release._id === releaseId
            ? { ...release, status: "rejected" }
            : release
        )
      );

      setIsReleaseModalOpen(false);
    } catch (err) {
      console.error("Error rejecting release:", err);
    }
  };

  // Handle release delete
  const handleReleaseDelete = async (releaseId: string) => {
    try {
      await api.delete(`/releases/${releaseId}`);

      // Update the local state by removing the deleted release
      setReleases((prevReleases) =>
        prevReleases.filter((release) => release._id !== releaseId)
      );

      setIsReleaseModalOpen(false);
    } catch (err) {
      console.error("Error deleting release:", err);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen p-6">
        {/* Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto">
            {catalogueTabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => handleTabChange(tab.name)}
                className={`px-5 py-2 rounded-full whitespace-nowrap ${
                  activeTab === tab.name
                    ? "bg-[#A365FF] text-white"
                    : "bg-[#1A1E24] text-gray-300 hover:bg-[#252A33]"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{currentTab.title}</h1>
              <p className="text-gray-400">{currentTab.description}</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-[#1A1E24] rounded-lg">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : error ? (
            <p className="text-red-400 text-center">{error}</p>
          ) : (
            <>
              {activeTab === "Releases" && (
                <ReleasesTable
                  releases={releases}
                  onReleaseSelect={handleReleaseSelect}
                />
              )}

              {activeTab === "Videos" && (
                <TracksTable
                  onTrackSelect={handleVideoSelect}
                  tracks={videos}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Release Details Modal */}
      {selectedRelease && (
        <ReleaseDetailsModal
          isOpen={isReleaseModalOpen}
          onClose={() => setIsReleaseModalOpen(false)}
          release={selectedRelease}
          onApprove={handleReleaseApprove}
          onReject={handleReleaseReject}
          onDelete={handleReleaseDelete}
        />
      )}

      {/* Track Details Modal */}
      <VideoDetailsModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        video={selectedVideo}
        onApprove={(videoId) => {
          console.log(`Video ${videoId} approved`);
          setIsVideoModalOpen(false);
        }}
        onReject={(videoId) => {
          console.log(`Video ${videoId} rejected`);
          setIsVideoModalOpen(false);
        }}
      />
    </DashboardLayout>
  );
}
