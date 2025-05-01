"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import ReleasesTable from "@/components/Dashboard/Tables/ReleasesTable";
import ReleaseDetailsModal from "@/components/Dashboard/models/ReleaseDetailsModal";
import TrackDetailsModal from "@/components/Dashboard/models/TrackDetailsModal";
import VideoDetailsModal from "@/components/Dashboard/models/VideoDetailsModel";
import ArtistDetailsModel from "@/components/Dashboard/models/ArtistDetailsModel";
import TracksTable from "@/components/Dashboard/Tables/TracksTable";
import VideosTable from "@/components/Dashboard/Tables/VideosTable";
import ArtistsTable from "@/components/Dashboard/Tables/ArtistsTable";
import LabelsTable from "@/components/Dashboard/Tables/LabelsTable";
import api from '@/services/api';

// Example track data for the modal
const sampleTracks = [
  {
    _id: "TRK00123",
    title: "Midnight Drive",
    imageSrc: "/images/music/1.png",
    primaryArtist: "Neon Pulse",
    genre: "Alternative Rock",
    contentRating: "PG",
    isrc: "US-XYZ-23-00001",
    duration: "3:41",
    releaseDate: "25 March, 2025",
    status: "approved",
    createdAt: "2023-01-15T10:30:00Z",
    updatedAt: "2023-01-15T10:30:00Z"
  },
  {
    _id: "TRK00124",
    title: "Urban Echoes",
    imageSrc: "/images/music/2.png",
    primaryArtist: "Cyber Waves",
    genre: "Electronic",
    contentRating: "PG",
    isrc: "US-XYZ-23-00002",
    duration: "4:15",
    releaseDate: "18 April, 2025",
    status: "approved",
    createdAt: "2023-02-20T14:45:00Z",
    updatedAt: "2023-02-20T14:45:00Z"
  },
  {
    _id: "TRK00125",
    title: "Neon Dreams",
    imageSrc: "/images/music/3.png",
    primaryArtist: "Future Sound",
    genre: "Synthwave",
    contentRating: "PG",
    isrc: "US-XYZ-23-00003",
    duration: "3:58",
    releaseDate: "2 May, 2025",
    status: "submitted",
    createdAt: "2023-03-10T09:15:00Z",
    updatedAt: "2023-03-10T09:15:00Z"
  },
  {
    _id: "TRK00126",
    title: "Electric Sky",
    imageSrc: "/images/music/4.png",
    primaryArtist: "Digital Horizon",
    genre: "EDM",
    contentRating: "PG",
    isrc: "US-XYZ-23-00004",
    duration: "4:32",
    releaseDate: "15 June, 2025",
    status: "submitted",
    createdAt: "2023-04-05T16:20:00Z",
    updatedAt: "2023-04-05T16:20:00Z"
  },
  {
    _id: "TRK00127",
    title: "Midnight Rhythm",
    imageSrc: "/images/music/5.png",
    primaryArtist: "Beat Masters",
    genre: "Hip-Hop",
    contentRating: "PG",
    isrc: "US-XYZ-23-00005",
    duration: "3:22",
    releaseDate: "30 July, 2025",
    status: "approved",
    createdAt: "2023-05-12T11:40:00Z",
    updatedAt: "2023-05-12T11:40:00Z"
  }
];

// Sample artist data
const sampleArtists = [
  {
    id: 1,
    name: "Future Sound",
    imageSrc: "/images/music/3.png",
    bio: "Future Sound is an electronic music producer known for innovative soundscapes and cutting-edge production techniques. With a unique blend of synthwave and modern electronic elements, Future Sound has established a distinctive presence in the electronic music scene.",
    label: "Electronic Dreams",
    totalTracks: 28,
    totalAlbums: 3,
    type: "Solo Artist",
    tags: ["USA", "Electronic", "Synthwave"],
    platforms: ["spotify", "apple", "youtube", "soundcloud"]
  },
  {
    id: 2,
    name: "Neon Pulse",
    imageSrc: "/images/music/1.png",
    bio: "Neon Pulse is an alternative rock band from Los Angeles, known for their energetic performances and nostalgic sound that blends 80s synth elements with modern rock.",
    label: "Retrowave Records",
    totalTracks: 42,
    totalAlbums: 4,
    type: "Band",
    tags: ["USA", "Alternative Rock", "Synth-Rock"],
    platforms: ["spotify", "apple", "soundcloud"]
  },
  {
    id: 3,
    name: "Beat Masters",
    imageSrc: "/images/music/5.png",
    bio: "Beat Masters is a hip-hop production team that has worked with some of the biggest names in the industry. Their distinctive style combines classic boom bap with contemporary trap elements.",
    label: "Urban Legends",
    totalTracks: 56,
    totalAlbums: 2,
    type: "Duo",
    tags: ["UK", "Hip-Hop", "Trap"],
    platforms: ["spotify", "youtube", "soundcloud"]
  }
];

// Define the catalogue tabs
const catalogueTabs = [
  { 
    name: 'Releases', 
    title: 'Releases', 
    description: 'Manage your music releases and albums' 
  },
  { 
    name: 'Tracks', 
    title: 'Tracks', 
    description: 'View and edit individual song details' 
  },
  {
    name: 'Videos', 
    title: 'Videos', 
    description: 'Manage your music videos and visual content'
  },
  { 
    name: 'Artists', 
    title: 'Artists', 
    description: 'Manage artists and collaborators'
  },
  { 
    name: 'Labels', 
    title: 'Labels', 
    description: 'View and edit record label information'
  },
];

// Define interfaces for different item types
interface TrackItem {
  _id: string;
  title: string;
  imageSrc: string;
  primaryArtist: string;
  genre: string;
  contentRating: string;
  isrc: string;
  duration: string;
  releaseDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
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
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<TrackItem>(sampleTracks[0]);
  const [selectedRelease, setSelectedRelease] = useState<ReleaseItem | null>(null);
  const [selectedArtist, setSelectedArtist] = useState(sampleArtists[0]);
  const [releases, setReleases] = useState<ReleaseItem[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('Releases');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      if (activeTab === 'Releases' || activeTab === 'Tracks') {
        setLoading(true);
        setError('');
        try {
          if (activeTab === 'Releases') {
            const response = await api.get('/releases');
            
            if (response.data.success) {
              setReleases(response.data.data);
            } else {
              setError('Failed to fetch releases');
            }
          } else if (activeTab === 'Tracks') {
            const response = await api.get('/tracks');
            
            if (response.data.success) {
              setTracks(response.data.data);
            } else {
              setError('Failed to fetch tracks');
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
  const currentTab = catalogueTabs.find(tab => tab.name === activeTab) || catalogueTabs[0];

  // Handle tab selection
  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
    // Close any open modals when changing tabs
    setIsReleaseModalOpen(false);
    setIsTrackModalOpen(false);
    setIsVideoModalOpen(false);
    setIsArtistModalOpen(false);
  };

  // Handle release selection
  const handleReleaseSelect = (releaseId: string) => {
    const release = releases.find(r => r._id === releaseId);
    if (release) {
      setSelectedRelease(release);
      setIsReleaseModalOpen(true);
    }
  };

  // Handle track selection
  const handleTrackSelect = (trackId: string) => {
    // Try to find the track in the fetched data
    const apiTrack = tracks.find(t => t._id === trackId);
    
    if (apiTrack) {
      // Map API track data to the format expected by the TrackDetailsModal
      setSelectedTrack({
        _id: apiTrack._id,
        title: apiTrack.title || 'Untitled Track',
        imageSrc: apiTrack.coverArt ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${apiTrack.coverArt}` : '/images/music/1.png',
        primaryArtist: apiTrack.artist || 'Unknown Artist',
        genre: apiTrack.genre || 'Not Specified',
        contentRating: apiTrack.contentRating || 'Not Rated',
        isrc: apiTrack.isrc || 'Not Available',
        duration: apiTrack.duration || '0:00',
        releaseDate: apiTrack.releaseDate ? new Date(apiTrack.releaseDate).toLocaleDateString('en-US', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        }) : 'Not Available',
        status: apiTrack.status || 'Not Available',
        createdAt: apiTrack.createdAt || 'Not Available',
        updatedAt: apiTrack.updatedAt || 'Not Available'
      });
    } else {
      // Fallback to sample data if track not found
      const sampleIndex = Math.abs(trackId.charCodeAt(0) % sampleTracks.length);
      setSelectedTrack({
        ...sampleTracks[sampleIndex],
        _id: trackId,
        status: 'Not Available',
        createdAt: 'Not Available',
        updatedAt: 'Not Available'
      });
    }
    
    setIsTrackModalOpen(true);
  };

  // Handle video selection
  const handleVideoSelect = (videoId: number) => {
    const videoIndex = videoId % sampleTracks.length;
    setSelectedTrack(sampleTracks[videoIndex]);
    setIsVideoModalOpen(true);
  };

  // Handle artist selection
  const handleArtistSelect = (artistId: number) => {
    const artistIndex = artistId % sampleArtists.length;
    setSelectedArtist(sampleArtists[artistIndex]);
    setIsArtistModalOpen(true);
  };

  // Handle release approval
  const handleReleaseApprove = async (releaseId: string) => {
    try {
      await api.patch(`/releases/${releaseId}/status`, 
        { status: 'approved' }
      );
      
      // Update the local state
      setReleases(prevReleases => 
        prevReleases.map(release => 
          release._id === releaseId 
            ? {...release, status: 'approved'} 
            : release
        )
      );
      
      setIsReleaseModalOpen(false);
    } catch (err) {
      console.error('Error approving release:', err);
    }
  };

  // Handle release rejection
  const handleReleaseReject = async (releaseId: string) => {
    try {
      await api.patch(`/releases/${releaseId}/status`, 
        { status: 'rejected' }
      );
      
      // Update the local state
      setReleases(prevReleases => 
        prevReleases.map(release => 
          release._id === releaseId 
            ? {...release, status: 'rejected'} 
            : release
        )
      );
      
      setIsReleaseModalOpen(false);
    } catch (err) {
      console.error('Error rejecting release:', err);
    }
  };

  // Handle release deletion
  const handleReleaseDelete = async (releaseId: string) => {
    try {
      await api.delete(`/releases/${releaseId}`);
      
      // Update the local state by removing the deleted release
      setReleases(prevReleases => 
        prevReleases.filter(release => release._id !== releaseId)
      );
      
      setIsReleaseModalOpen(false);
    } catch (err) {
      console.error('Error deleting release:', err);
    }
  };

  return (
    <DashboardLayout>
      {/* Responsive Tab Navigation - scrollable on mobile */}
      <div className="px-3 md:px-5 mb-4 overflow-x-auto">
        <div className="flex flex-nowrap gap-2 pb-1 min-w-full">
          {catalogueTabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => handleTabChange(tab.name)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm flex-shrink-0 ${
                activeTab === tab.name ? 'bg-[#A365FF] text-white' : 'bg-[#1A1E24] text-gray-300 hover:bg-[#252A33]'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Title and Description */}
      <div className="px-4 md:px-5 mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-white">{currentTab.title}</h1>
        <p className="text-sm md:text-base text-gray-400">{currentTab.description}</p>
      </div>

      {/* Tab Content */}
      <div className="bg-[#161A1F] rounded-lg p-0 sm:p-4">
        {activeTab === 'Releases' && (
          <>
            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                <p className="mt-2 text-gray-400">Loading releases...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-400">{error}</p>
                <button 
                  className="mt-2 px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
                  onClick={() => {
                    setActiveTab(''); 
                    setTimeout(() => setActiveTab('Releases'), 10);
                  }}
                >
                  Retry
                </button>
              </div>
            ) : (
              <ReleasesTable 
                releases={releases} 
                onReleaseSelect={handleReleaseSelect} 
              />
            )}
          </>
        )}
        
        {activeTab === 'Tracks' && (
          <>
            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                <p className="mt-2 text-gray-400">Loading tracks...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-400">{error}</p>
                <button 
                  className="mt-2 px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
                  onClick={() => {
                    setActiveTab(''); 
                    setTimeout(() => setActiveTab('Tracks'), 10);
                  }}
                >
                  Retry
                </button>
              </div>
            ) : (
              <TracksTable 
                onTrackSelect={handleTrackSelect} 
                tracks={tracks}
              />
            )}
          </>
        )}
        
        {activeTab === 'Videos' && (
          <VideosTable onVideoSelect={handleVideoSelect} />
        )}
        
        {activeTab === 'Artists' && (
          <ArtistsTable onArtistSelect={handleArtistSelect} />
        )}
        
        {activeTab === 'Labels' && (
          <LabelsTable />
        )}
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
      <TrackDetailsModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        track={selectedTrack}
        onApprove={(trackId) => {
          console.log(`Track ${trackId} approved`);
        }}
        onReject={(trackId) => {
          console.log(`Track ${trackId} rejected`);
        }}
      />
      
      {/* Video Details Modal */}
      <VideoDetailsModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        video={{
          id: selectedTrack._id,
          title: selectedTrack.title,
          imageSrc: selectedTrack.imageSrc,
          primaryArtist: selectedTrack.primaryArtist,
          genre: selectedTrack.genre,
          contentRating: selectedTrack.contentRating,
          isrc: selectedTrack.isrc,
          duration: selectedTrack.duration,
          creationDate: selectedTrack.releaseDate
        }}
        initialStatus="processing"
        onApprove={(videoId) => {
          console.log(`Video ${videoId} approved`);
        }}
        onReject={(videoId) => {
          console.log(`Video ${videoId} rejected`);
        }}
      />

      {/* Artist Details Modal */}
      <ArtistDetailsModel
        isOpen={isArtistModalOpen}
        onClose={() => setIsArtistModalOpen(false)}
        artist={selectedArtist}
      />
    </DashboardLayout>
  );
} 