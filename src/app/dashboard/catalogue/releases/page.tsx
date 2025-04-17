"use client";

import { useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import ReleasesTable from "@/components/Dashboard/Tables/ReleasesTable";
import TrackDetailsModal from "@/components/Dashboard/models/ReleaseDetailsModal";

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

export default function ReleasesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(sampleTracks[0]);

  // Handle track selection
  const handleTrackSelect = (trackId: number) => {
    // In a real application, you would fetch the track data here
    // For now, we'll select a track based on the trackId
    const trackIndex = trackId % sampleTracks.length;
    setSelectedTrack(sampleTracks[trackIndex]);
    setIsModalOpen(true);
  };

  // Pass the track selection handler to the ReleasesTable
  return (
    <DashboardLayout 
      title="Releases" 
      subtitle="Manage your music releases"
    >
      <ReleasesTable onTrackSelect={handleTrackSelect} />
      
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