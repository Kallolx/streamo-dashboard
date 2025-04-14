"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import ReleasesTable from "@/components/Dashboard/ReleasesTable";
import TrackDetailsModal from "@/components/Dashboard/TrackDetailsModal";
import TracksTable from "@/components/Dashboard/TracksTable";
import VideosTable from "@/components/Dashboard/VideosTable";
import ArtistsTable from "@/components/Dashboard/ArtistsTable";
import LabelsTable from "@/components/Dashboard/LabelsTable";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(sampleTracks[0]);
  const [activeTab, setActiveTab] = useState('Releases');
  const router = useRouter();
  const pathname = usePathname();

  // Get current tab data
  const currentTab = catalogueTabs.find(tab => tab.name === activeTab) || catalogueTabs[0];

  // Handle tab selection
  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
  };

  // Handle track selection
  const handleTrackSelect = (trackId: number) => {
    const trackIndex = trackId % sampleTracks.length;
    setSelectedTrack(sampleTracks[trackIndex]);
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout>
      {/* Tabs Navigation - styled like TrackDetailsModal */}
      <div className="flex px-5 py-2 space-x-2 mb-4">
        {catalogueTabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => handleTabChange(tab.name)}
            className={`px-5 py-2 rounded-full ${
              activeTab === tab.name ? 'bg-[#A365FF] text-white' : 'bg-[#1A1E24] text-gray-300'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Title and Description */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{currentTab.title}</h1>
        <p className="text-gray-400">{currentTab.description}</p>
      </div>

      {/* Tab Content */}
      <div className="bg-[#161A1F] rounded-lg p-4">
        {activeTab === 'Releases' && (
          <ReleasesTable onTrackSelect={handleTrackSelect} />
        )}
        
        {activeTab === 'Tracks' && (
          <TracksTable onTrackSelect={handleTrackSelect} />
        )}
        
        {activeTab === 'Videos' && (
          <VideosTable />
        )}
        
        {activeTab === 'Artists' && (
          <ArtistsTable />
        )}
        
        {activeTab === 'Labels' && (
          <LabelsTable />
        )}
      </div>
      
      <TrackDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        track={selectedTrack}
        initialStatus="processing"
        onApprove={(trackId) => {
          console.log(`Track ${trackId} approved`);
        }}
        onReject={(trackId) => {
          console.log(`Track ${trackId} rejected`);
        }}
      />
    </DashboardLayout>
  );
} 