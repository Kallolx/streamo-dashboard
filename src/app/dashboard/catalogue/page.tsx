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

// Example track data for the modal
const sampleTracks = [
  {
    id: "TRK00123",
    title: "Midnight Drive",
    imageSrc: "/images/music/1.png",
    primaryArtist: "Neon Pulse",
    genre: "Alternative Rock",
    contentRating: "PG",
    isrc: "US-XYZ-23-00001",
    duration: "3:41",
    releaseDate: "25 March, 2025",
  },
  {
    id: "TRK00124",
    title: "Urban Echoes",
    imageSrc: "/images/music/2.png",
    primaryArtist: "Cyber Waves",
    genre: "Electronic",
    contentRating: "PG",
    isrc: "US-XYZ-23-00002",
    duration: "4:15",
    releaseDate: "18 April, 2025",
  },
  {
    id: "TRK00125",
    title: "Neon Dreams",
    imageSrc: "/images/music/3.png",
    primaryArtist: "Future Sound",
    genre: "Synthwave",
    contentRating: "PG",
    isrc: "US-XYZ-23-00003",
    duration: "3:58",
    releaseDate: "2 May, 2025",
  },
  {
    id: "TRK00126",
    title: "Electric Sky",
    imageSrc: "/images/music/4.png",
    primaryArtist: "Digital Horizon",
    genre: "EDM",
    contentRating: "PG",
    isrc: "US-XYZ-23-00004",
    duration: "4:32",
    releaseDate: "15 June, 2025",
  },
  {
    id: "TRK00127",
    title: "Midnight Rhythm",
    imageSrc: "/images/music/5.png",
    primaryArtist: "Beat Masters",
    genre: "Hip-Hop",
    contentRating: "PG",
    isrc: "US-XYZ-23-00005",
    duration: "3:22",
    releaseDate: "30 July, 2025",
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

export default function CataloguePage() {
  // Modal states for each type
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(sampleTracks[0]);
  const [selectedArtist, setSelectedArtist] = useState(sampleArtists[0]);
  const [activeTab, setActiveTab] = useState('Releases');
  const router = useRouter();
  const pathname = usePathname();

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
  const handleReleaseSelect = (releaseId: number) => {
    const trackIndex = releaseId % sampleTracks.length;
    setSelectedItem(sampleTracks[trackIndex]);
    setIsReleaseModalOpen(true);
  };

  // Handle track selection
  const handleTrackSelect = (trackId: number) => {
    const trackIndex = trackId % sampleTracks.length;
    setSelectedItem(sampleTracks[trackIndex]);
    setIsTrackModalOpen(true);
  };

  // Handle video selection
  const handleVideoSelect = (videoId: number) => {
    const videoIndex = videoId % sampleTracks.length;
    setSelectedItem(sampleTracks[videoIndex]);
    setIsVideoModalOpen(true);
  };

  // Handle artist selection
  const handleArtistSelect = (artistId: number) => {
    const artistIndex = artistId % sampleArtists.length;
    setSelectedArtist(sampleArtists[artistIndex]);
    setIsArtistModalOpen(true);
  };

  return (
    <DashboardLayout>
      {/* Tabs Navigation - styled like TrackDetailsModal */}
      <div className="flex flex-wrap gap-2 px-5 py-2 mb-4 overflow-x-auto">
        {catalogueTabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => handleTabChange(tab.name)}
            className={`px-5 py-2 rounded-full whitespace-nowrap ${
              activeTab === tab.name ? 'bg-[#A365FF] text-white' : 'bg-[#1A1E24] text-gray-300 hover:bg-[#252A33]'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Title and Description */}
      <div className="px-5 mb-6">
        <h1 className="text-2xl font-bold text-white">{currentTab.title}</h1>
        <p className="text-gray-400">{currentTab.description}</p>
      </div>

      {/* Tab Content */}
      <div className="bg-[#161A1F] rounded-lg p-0 sm:p-4">
        {activeTab === 'Releases' && (
          <ReleasesTable onTrackSelect={handleReleaseSelect} />
        )}
        
        {activeTab === 'Tracks' && (
          <TracksTable onTrackSelect={handleTrackSelect} />
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
      <ReleaseDetailsModal
        isOpen={isReleaseModalOpen}
        onClose={() => setIsReleaseModalOpen(false)}
        track={selectedItem}
        initialStatus="processing"
        onApprove={(trackId) => {
          console.log(`Release ${trackId} approved`);
        }}
        onReject={(trackId) => {
          console.log(`Release ${trackId} rejected`);
        }}
      />

      {/* Track Details Modal */}
      <TrackDetailsModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        track={selectedItem}
        initialStatus="processing"
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
          id: selectedItem.id,
          title: selectedItem.title,
          imageSrc: selectedItem.imageSrc,
          primaryArtist: selectedItem.primaryArtist,
          genre: selectedItem.genre,
          contentRating: selectedItem.contentRating,
          isrc: selectedItem.isrc,
          duration: selectedItem.duration,
          creationDate: selectedItem.releaseDate
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