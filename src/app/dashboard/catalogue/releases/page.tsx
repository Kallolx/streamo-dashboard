"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import ReleasesTable from "@/components/Dashboard/Tables/ReleasesTable";
import ReleaseDetailsModal from "@/components/Dashboard/models/ReleaseDetailsModal";
import api from '@/services/api';

// Interface for release data
interface Release {
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
  createdAt: string;
  updatedAt: string;
  tracks: any[];
  status: string;
  stores: string[];
  userId?: string;
  // Additional fields that might be used in the modal
  contentRating?: string;
  isrc?: string;
  label?: string;
  featuredArtist?: string;
  composer?: string;
  lyricist?: string;
  musicProducer?: string;
  publisher?: string;
  singer?: string;
}

export default function ReleasesPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<'admin' | 'superadmin' | 'artist' | 'label'>('artist');
  const [userId, setUserId] = useState<string>("");

  // Get user role and ID from localStorage
  useEffect(() => {
    // Get user role and ID from localStorage
    const role = localStorage.getItem('userRole');
    const id = localStorage.getItem('userId');
    
    if (role === 'admin' || role === 'superadmin' || role === 'artist' || role === 'label') {
      setUserRole(role as 'admin' | 'superadmin' | 'artist' | 'label');
    }
    
    if (id) {
      setUserId(id);
    }
  }, []);

  // Fetch releases data
  useEffect(() => {
    const fetchReleases = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          router.push('/login');
          return;
        }
        
        const response = await api.get('/releases');
        
        console.log("API Response:", response.data);
        
        if (response.data.success) {
          if (Array.isArray(response.data.data)) {
            console.log("Number of releases loaded:", response.data.data.length);
            setReleases(response.data.data);
          } else {
            console.error("API response data is not an array:", response.data.data);
            setError("Invalid data format received from server");
            setReleases([]);
          }
        } else {
          console.error("API returned failure:", response.data);
          setError("Failed to load releases");
          setReleases([]);
        }
      } catch (error) {
        console.error("Error fetching releases:", error);
        setError("Failed to load releases");
        setReleases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReleases();
  }, [router]);

  // Handle release selection
  const handleReleaseSelect = (releaseId: string) => {
    const release = releases.find(r => r._id === releaseId);
    
    if (release) {
      setSelectedRelease(release);
      setIsModalOpen(true);
    }
  };

  // Handle status change (approve, reject)
  const handleStatusChange = async (releaseId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }
      
      const response = await api.patch(
        `/releases/${releaseId}/status`, 
        { status: newStatus }
      );
      
      if (response.data.success) {
        // Update the release in the local state
        setReleases(releases.map(release => 
          release._id === releaseId 
            ? { ...release, status: newStatus } 
            : release
        ));
        
        // Update modal state if open
        if (selectedRelease && selectedRelease._id === releaseId) {
          setSelectedRelease({ ...selectedRelease, status: newStatus });
        }
      }
    } catch (error) {
      console.error(`Error changing release status to ${newStatus}:`, error);
    }
  };

  // Handle release deletion
  const handleDeleteRelease = async (releaseId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }
      
      const response = await api.delete(`/releases/${releaseId}`);
      
      if (response.data.success) {
        // Remove the release from the local state
        setReleases(releases.filter(release => release._id !== releaseId));
        
        // Close modal if open
        if (selectedRelease && selectedRelease._id === releaseId) {
          setIsModalOpen(false);
          setSelectedRelease(null);
        }
      }
    } catch (error) {
      console.error("Error deleting release:", error);
    }
  };

  return (
    <DashboardLayout 
      title="Releases" 
      subtitle="Manage your music releases"
    >
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-900 bg-opacity-20 border border-red-800 text-red-300 px-4 py-3 rounded relative">
          {error}
        </div>
      ) : (
        <ReleasesTable 
          releases={releases} 
          onReleaseSelect={handleReleaseSelect}
          userRole={userRole}
          userId={userId} 
        />
      )}
      
      {selectedRelease && (
        <ReleaseDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          release={selectedRelease}
          onApprove={(releaseId) => handleStatusChange(releaseId, 'approved')}
          onReject={(releaseId) => handleStatusChange(releaseId, 'rejected')}
          onDelete={handleDeleteRelease}
          userRole={userRole}
        />
      )}
    </DashboardLayout>
  );
} 