"use client";

import { useState, useRef, useEffect } from "react";
import { createRelease, createReleaseWithoutFile } from "@/services/releaseService";
import { getAllStores, Store } from "@/services/storeService";
import axios from "axios"; // Import axios directly

// Toast component for notifications
const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-md shadow-lg ${
        type === "success" ? "bg-green-600" : "bg-red-600"
      }`}
    >
      <div className="flex-shrink-0 mr-3">
        {type === "success" ? (
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
      <div className="text-white">{message}</div>
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-300">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

export default function ReleaseCreate() {
  // State for form data
  const [coverArt, setCoverArt] = useState<File | null>(null);
  const [coverArtPreview, setCoverArtPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Define track type
  interface Track {
    id?: number;
    title: string;
    artistName: string;
    duration?: string;
    isrc?: string;
    version?: string;
    contentRating?: string;
    lyrics?: string;
  }

  // Track list state
  const [tracks, setTracks] = useState<Track[]>([]);
  
  // Track modal state
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track>({
    title: "",
    artistName: "",
    duration: "",
    isrc: "",
    version: "original",
    contentRating: "",
    lyrics: ""
  });
  
  // Add or edit track
  const handleAddOrEditTrack = () => {
    if (!currentTrack.title || !currentTrack.artistName) {
      setToast({
        show: true,
        message: "Track title and artist name are required",
        type: "error",
      });
      return;
    }
    
    if (currentTrack.id) {
      // Edit existing track
      setTracks(
        tracks.map(track => 
          track.id === currentTrack.id ? { ...track, ...currentTrack } : track
        )
      );
    } else {
      // Add new track
      const newId = Math.max(0, ...tracks.map(t => t.id || 0)) + 1;
      setTracks([...tracks, { ...currentTrack, id: newId }]);
    }
    
    // Close modal and reset form
    setShowTrackModal(false);
    resetTrackForm();
  };
  
  // Reset track form
  const resetTrackForm = () => {
    setCurrentTrack({
      title: "",
      artistName: "",
      duration: "",
      isrc: "",
      version: "original",
      contentRating: "",
      lyrics: ""
    });
  };
  
  // Edit track
  const handleEditTrack = (id: number) => {
    const track = tracks.find(t => t.id === id);
    if (track) {
      setCurrentTrack({
        id: track.id,
        title: track.title,
        artistName: track.artistName,
        duration: track.duration || "",
        isrc: track.isrc || "",
        version: track.version || "original",
        contentRating: track.contentRating || "",
        lyrics: track.lyrics || ""
      });
      setShowTrackModal(true);
    }
  };

  // Handle cover art upload
  const handleCoverArtUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverArt(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverArtPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle track deletion
  const handleDeleteTrack = (id: number) => {
    setTracks(tracks.filter((track) => track.id !== id));
  };

  // State for selected stores
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  // State for available stores from the API
  const [stores, setStores] = useState<Store[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);
  // State to track if tracks are confirmed
  const [tracksConfirmed, setTracksConfirmed] = useState(false);

  // Fetch stores from API on component mount
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoadingStores(true);
        const response = await getAllStores({ status: 'Active' });
        if (response && response.data) {
          setStores(response.data);
        } else {
          console.error('Invalid response format:', response);
          setStores([]);
        }
      } catch (error) {
        console.error('Error fetching stores:', error);
        setToast({
          show: true,
          message: "Failed to load distribution platforms",
          type: "error",
        });
        setStores([]);
      } finally {
        setLoadingStores(false);
      }
    };

    fetchStores();
  }, []);

  // Handle store selection
  const handleStoreSelection = (store: string) => {
    let newSelectedStores;
    if (selectedStores.includes(store)) {
      newSelectedStores = selectedStores.filter((s) => s !== store);
    } else {
      newSelectedStores = [...selectedStores, store];
    }
    
    // Set the state with the new array
    setSelectedStores(newSelectedStores);
    
    // Debug logging
    console.log(`Store ${store} ${selectedStores.includes(store) ? 'removed from' : 'added to'} selection.`);
    console.log('Current selectedStores:', newSelectedStores);
  };

  // Confirm tracks for submission
  const confirmTracks = () => {
    if (tracks.length === 0) {
      setToast({
        show: true,
        message: "Please add at least one track before confirming",
        type: "error",
      });
      return;
    }
    
    setTracksConfirmed(true);
    setToast({
      show: true,
      message: "Tracks confirmed for submission",
      type: "success",
    });
  };

  // Toast state
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  // Success messages
  const successMessages = [
    "Release created successfully!",
    "Release created and ready for distribution.",
  ];

  // Error messages
  const errorMessages = [
    "Failed to create release. Please try again.",
    "Server error. Your release couldn't be processed.",
  ];

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // No longer require coverArt
      // if (!coverArt) {
      //   setToast({
      //     show: true,
      //     message: "Please upload a cover art image",
      //     type: "error",
      //   });
      //   return;
      // }
      
      // Get values directly from form elements with EXACT keys matching MongoDB schema
      const title = (document.getElementById('releaseTitle') as HTMLInputElement)?.value || "Untitled Release";
      const artist = (document.getElementById('artistName') as HTMLInputElement)?.value || 
                    (document.getElementById('featureArtist') as HTMLInputElement)?.value || 
                    "Unknown Artist";
      const genre = (document.getElementById('selectGenre') as HTMLSelectElement)?.value || "pop";
      const format = (document.getElementById('format') as HTMLSelectElement)?.value || "digital";
      const releaseType = (document.getElementById('releaseType') as HTMLSelectElement)?.value || "single";

      // Check if tracks are confirmed before proceeding
      if (!tracksConfirmed && tracks.length > 0) {
        setToast({
          show: true,
          message: "Please click 'Done' to confirm your tracks first",
          type: "error",
        });
        return;
      }

      // Debug logging for stores selection
      console.log("DEBUG - Selected stores before submission:", selectedStores);
      
      // Create a data object with all fields
      const releaseData = {
        // Basic info
        title: title,
        artist: artist,
        genre: genre,
        format: format,
        releaseType: releaseType,
        
        // Metadata
        language: (document.getElementById('selectLanguage') as HTMLSelectElement)?.value || "",
        upc: (document.getElementById('upc') as HTMLInputElement)?.value || "",
        releaseDate: (document.getElementById('releaseDate') as HTMLInputElement)?.value || new Date().toISOString().split('T')[0],
        
        // Stores selection - ensure it's explicitly an array
        stores: Array.isArray(selectedStores) ? [...selectedStores] : [],
        
        // Contributors
        featuredArtist: (document.getElementById('featureArtist') as HTMLInputElement)?.value || "",
        composer: (document.getElementById('composer') as HTMLInputElement)?.value || "",
        lyricist: (document.getElementById('lyricist') as HTMLInputElement)?.value || "",
        musicProducer: (document.getElementById('musicProducer') as HTMLInputElement)?.value || "",
        publisher: (document.getElementById('publisher') as HTMLInputElement)?.value || "",
        singer: (document.getElementById('singer') as HTMLInputElement)?.value || "",
        musicDirector: (document.getElementById('musicDirector') as HTMLInputElement)?.value || "",
        copyrightHeader: (document.getElementById('copyrightHeader') as HTMLInputElement)?.value || "",
        
        // Pricing
        pricing: (document.getElementById('trackPricing') as HTMLSelectElement)?.value || "free",
        
        // Track data with complete information
        tracks: tracks.map(track => ({
          title: track.title || "Untitled Track",
          artistName: track.artistName || "Unknown Artist",
          duration: track.duration || "",
          isrc: track.isrc || "",
          version: track.version || "original",
          contentRating: track.contentRating || "",
          lyrics: track.lyrics || ""
        })),
      };

      console.log('Release data being submitted:', releaseData);
      
      // Use the JSON-only method to create the release
      const response = await createReleaseWithoutFile(releaseData);

      console.log("Success response:", response);
      console.log("Stores in response:", response.data.stores);
      console.log("Cover art path:", response.data.coverArt);
      
      // Show success message
      setToast({
        show: true,
        message: `Release created successfully with cover art: ${response.data.coverArt}`,
        type: "success",
      });
      
      // Clear the form data
      setCoverArt(null);
      setCoverArtPreview(null);
      setTracks([]);
      setSelectedStores([]);
      setTracksConfirmed(false);
      
      // Reset form fields
      const formElements = document.querySelectorAll('input:not([type="file"]), select');
      formElements.forEach((element: any) => {
        if (element.type === 'checkbox') {
          element.checked = false;
        } else {
          element.value = '';
        }
      });
      
      // Redirect to the releases page after a short delay
      setTimeout(() => {
        window.location.href = '/dashboard/catalogue';
      }, 1500);
    } catch (error: any) {
      console.error("Error details:", error);
      
      let message = "Failed to save release. ";
      
      // Try to extract specific error details
      if (error.response?.data) {
        console.error("Server response data:", error.response.data);
        
        if (error.response.data.error) {
          if (typeof error.response.data.error === 'string') {
            message += error.response.data.error;
          } else if (Array.isArray(error.response.data.error)) {
            message += error.response.data.error.join(', ');
          }
        }
        
        if (error.response.status === 401) {
          message = "Authentication error. Please log in first.";
        }
      }

      setToast({
        show: true,
        message,
        type: "error",
      });
    }
  };

  // Close toast
  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  return (
    <div className="space-y-8">
      {/* Upload Cover Art Section */}
      <div className="rounded-lg">
        <h2 className="text-xl font-semibold mb-4 ">Upload Cover Art</h2>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left side - Upload */}
          <div className="">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-sm h-100 bg-[#1D2229] border-2 border-dashed border-gray-600 rounded-md flex items-center justify-center overflow-hidden cursor-pointer hover:border-purple-500 transition-colors"
            >
              {coverArtPreview ? (
                <img
                  src={coverArtPreview}
                  alt="Cover art preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-6">
                  <svg
                    className="w-12 h-12 text-gray-500 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm text-gray-400">
                    Click to browse or drag and drop image file
                  </p>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleCoverArtUpload}
              className="hidden"
            />
          </div>

          {/* Right side - Tips */}
          <div className="rounded-md">
            <h3 className="text-lg font-medium mb-3">Tips</h3>
            <p className="text-sm text-gray-300 mb-3">
              Please ensure your cover art is square, less than 10 MB and a
              minimum of 1400px wide (3000px width is recommended for best
              results).
            </p>
            <p className="text-sm text-gray-300 mb-1">
              Your cover art cannot contain:
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5"
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
                <span>
                  Any text other than the release title and/or artist name.
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5"
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
                <span>
                  Web URLs, social media handles/icons, or contact information.
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5"
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
                <span>Sexually explicit imagery.</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5"
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
                <span>
                  Third-party logos or trademarks without express written
                  consent from the trademark holder.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload or Add Tracks Section */}
      <div className="bg-[#161A1F] rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Upload or Add Tracks</h2>

        <div className="mb-4">
          <select 
            className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            defaultValue="add"
          >
            <option value="add">Add Existing or Upload New Tracks</option>
            <option value="existing">Add Existing Tracks</option>
            <option value="upload">Upload New Tracks</option>
          </select>
        </div>

        {/* Add Track Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => {
              resetTrackForm();
              setShowTrackModal(true);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Add New Track
          </button>
        </div>

        {/* Track List */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700 mb-4">
            <thead className="bg-[#1D2229]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Artist Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#1A1E24] divide-y divide-gray-700">
              {tracks.map((track) => (
                <tr key={track.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    {track.title}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    {track.artistName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    {track.duration || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right space-x-2">
                    <button
                      onClick={() => track.id && handleEditTrack(track.id)}
                      className="text-blue-500 hover:text-blue-400"
                    >
                      <svg
                        className="w-5 h-5 inline-block"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        ></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => track.id && handleDeleteTrack(track.id)}
                      className="text-red-500 hover:text-red-400 ml-3"
                    >
                      <svg
                        className="w-5 h-5 inline-block"
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
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Track Confirmation Status */}
        <div className="mb-4 flex items-center">
          {tracksConfirmed ? (
            <div className="flex items-center text-green-500">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span>Tracks confirmed</span>
            </div>
          ) : (
            <div className="flex items-center text-yellow-500">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <span>Please click "Done" to confirm tracks for submission</span>
            </div>
          )}
        </div>

        {/* Done Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={confirmTracks}
            className={`${tracksConfirmed 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-purple-600 hover:bg-purple-700'
            } text-white px-4 py-2 rounded-md transition-colors`}
          >
            {tracksConfirmed ? 'Tracks Confirmed' : 'Done'}
          </button>
        </div>
      </div>

      {/* Add Metadata Section */}
      <div className="rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">A Metadata</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left side - 5 fields */}
          <div className="space-y-4">
            <div>
              <input
                type="text"
                id="releaseTitle"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Release Title"
              />
            </div>

            <div>
              <input
                type="text"
                id="label"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Label"
              />
            </div>

            <div>
              <select
                id="recordingYear"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Recording Year</option>
                {[...Array(30)].map((_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <input
                type="date"
                id="releaseDate"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Release Date"
              />
            </div>

            <div>
              <select
                id="selectGenre"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Genre</option>
                <option value="pop">Pop</option>
                <option value="rock">Rock</option>
                <option value="hiphop">Hip Hop</option>
                <option value="electronic">Electronic</option>
                <option value="rnb">R&B</option>
                <option value="jazz">Jazz</option>
                <option value="classical">Classical</option>
              </select>
            </div>
          </div>

          {/* Right side - 4 fields */}
          <div className="space-y-4">
            <div>
              <select
                id="releaseType"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Release Type</option>
                <option value="single">Single</option>
                <option value="album">Album</option>
                <option value="ep">EP</option>
              </select>
            </div>

            <div>
              <select
                id="format"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Format</option>
                <option value="digital">Digital</option>
                <option value="cd">CD</option>
                <option value="vinyl">Vinyl</option>
                <option value="cassette">Cassette</option>
              </select>
            </div>

            <div>
              <select
                id="selectLanguage"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Language</option>
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
                <option value="japanese">Japanese</option>
                <option value="korean">Korean</option>
                <option value="chinese">Chinese</option>
              </select>
            </div>

            <div>
              <input
                type="text"
                id="upc"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="UPC"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Contributors Section */}
      <div className="rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Add Contributors</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left side - 5 fields */}
          <div className="space-y-4">
            <div>
              <input
                type="text"
                id="copyrightHeader"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Copyright Header"
              />
            </div>

            <div>
              <input
                type="text"
                id="composer"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Composer"
              />
            </div>
            <div>
              <input
                type="text"
                id="musicProducer"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Music Producer"
              />
            </div>

            <div>
              <input
                type="text"
                id="singer"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Singer"
              />
            </div>
          </div>

          {/* Right side - 4 fields */}
          <div className="space-y-4">
            <div>
              <input
                type="text"
                id="featureArtist"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Feature Artist"
              />
            </div>
            <div>
              <input
                type="text"
                id="lyricist"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Lyricist"
              />
            </div>

            <div>
              <input
                type="text"
                id="publisher"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Publisher"
              />
            </div>

            <div>
              <input
                type="text"
                id="musicDirector"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Music Director"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Distribution Platforms Section */}
      <div className="rounded-lg p-6 bg-[#161A1F]">
        <h2 className="text-xl font-semibold mb-4">Distribution Platforms</h2>
        <p className="text-gray-400 mb-6">
          Select where you want your music to be available. You can choose multiple platforms.
        </p>

        {loadingStores ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* Dynamic store rendering from API */}
            {stores.length > 0 ? (
              stores.map((store) => (
                <div 
                  key={store._id}
                  onClick={() => handleStoreSelection(store._id || "")}
                  className={`relative rounded-xl p-3 transition-all cursor-pointer ${
                    selectedStores.includes(store._id || "") 
                      ? "bg-purple-800 border-2 border-purple-500 shadow-lg transform scale-[1.02]" 
                      : "bg-[#1D2229] border-2 border-[#2A2F36] hover:border-purple-400 hover:bg-[#24292F]"
                  }`}
                >
                  {selectedStores.includes(store._id || "") && (
                    <div className="absolute -top-2 -right-2 bg-purple-500 rounded-full p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="flex flex-col items-center">
                    {store.icon && (
                      <div 
                        className="w-12 h-12 mb-2 rounded bg-cover bg-center"
                        style={{ 
                          backgroundImage: `url(${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${store.icon})` 
                        }}
                      />
                    )}
                    <span className="text-center text-gray-300 font-medium">{store.name}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-400">
                No distribution platforms available. Please check back later.
              </div>
            )}
            
            {/* Fallback to hardcoded platforms if API fails or returns empty */}
            {stores.length === 0 && !loadingStores && (
              <>
                <div 
                  onClick={() => handleStoreSelection("spotify")}
                  className={`relative rounded-xl p-3 transition-all cursor-pointer ${
                    selectedStores.includes("spotify") 
                      ? "bg-purple-800 border-2 border-purple-500 shadow-lg transform scale-[1.02]" 
                      : "bg-[#1D2229] border-2 border-[#2A2F36] hover:border-purple-400 hover:bg-[#24292F]"
                  }`}
                >
                  {selectedStores.includes("spotify") && (
                    <div className="absolute -top-2 -right-2 bg-purple-500 rounded-full p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="flex flex-col items-center">
                    <img src="/icons/sp.svg" alt="Spotify" className="w-12 h-12 mb-2" />
                    <span className="text-center text-gray-300 font-medium">Spotify</span>
                  </div>
                </div>
                
                <div 
                  onClick={() => handleStoreSelection("apple")}
                  className={`relative rounded-xl p-3 transition-all cursor-pointer ${
                    selectedStores.includes("apple") 
                      ? "bg-purple-800 border-2 border-purple-500 shadow-lg transform scale-[1.02]" 
                      : "bg-[#1D2229] border-2 border-[#2A2F36] hover:border-purple-400 hover:bg-[#24292F]"
                  }`}
                >
                  {selectedStores.includes("apple") && (
                    <div className="absolute -top-2 -right-2 bg-purple-500 rounded-full p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="flex flex-col items-center">
                    <img src="/icons/ap.svg" alt="Apple Music" className="w-12 h-12 mb-2" />
                    <span className="text-center text-gray-300 font-medium">Apple Music</span>
                  </div>
                </div>
                
                <div 
                  onClick={() => handleStoreSelection("youtube")}
                  className={`relative rounded-xl p-3 transition-all cursor-pointer ${
                    selectedStores.includes("youtube") 
                      ? "bg-purple-800 border-2 border-purple-500 shadow-lg transform scale-[1.02]" 
                      : "bg-[#1D2229] border-2 border-[#2A2F36] hover:border-purple-400 hover:bg-[#24292F]"
                  }`}
                >
                  {selectedStores.includes("youtube") && (
                    <div className="absolute -top-2 -right-2 bg-purple-500 rounded-full p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="flex flex-col items-center">
                    <img src="/icons/yt.svg" alt="YouTube Music" className="w-12 h-12 mb-2" />
                    <span className="text-center text-gray-300 font-medium">YouTube Music</span>
                  </div>
                </div>
                
                <div 
                  onClick={() => handleStoreSelection("soundcloud")}
                  className={`relative rounded-xl p-3 transition-all cursor-pointer ${
                    selectedStores.includes("soundcloud") 
                      ? "bg-purple-800 border-2 border-purple-500 shadow-lg transform scale-[1.02]" 
                      : "bg-[#1D2229] border-2 border-[#2A2F36] hover:border-purple-400 hover:bg-[#24292F]"
                  }`}
                >
                  {selectedStores.includes("soundcloud") && (
                    <div className="absolute -top-2 -right-2 bg-purple-500 rounded-full p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="flex flex-col items-center">
                    <img src="/icons/sc.svg" alt="SoundCloud" className="w-12 h-12 mb-2" />
                    <span className="text-center text-gray-300 font-medium">SoundCloud</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        
        {/* Selected platforms summary */}
        {selectedStores.length > 0 && (
          <div className="mt-6 bg-[#1A1D24] border border-[#2A2F36] rounded-lg p-4">
            <div className="flex items-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-medium text-gray-300">Selected platforms ({selectedStores.length})</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedStores.map(storeId => {
                // Try to find store name if it's an ID
                const store = stores.find(s => s._id === storeId);
                const storeName = store?.name || storeId;
                const storeColor = store?.color || '#6b46c1'; // Default purple if no color
                
                return (
                  <div 
                    key={storeId} 
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm"
                    style={{ backgroundColor: `${storeColor}30` }} // Using color with 30% opacity
                  >
                    {store?.icon && (
                      <div 
                        className="w-4 h-4 mr-2 rounded-full bg-cover bg-center"
                        style={{ 
                          backgroundImage: `url(${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${store.icon})` 
                        }}
                      />
                    )}
                    <span className="text-white">{storeName}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card selection
                        handleStoreSelection(storeId);
                      }}
                      className="ml-2 text-gray-300 hover:text-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Track Pricing Section */}
      <div className="rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">Track Pricing</h2>
        <p className="text-gray-400 mb-4">
          How much would you like to charge for each track?
        </p>

        <div className="mb-4">
          <select
            id="trackPricing"
            className="w-full md:w-1/2 bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select pricing</option>
            <option value="free">Free</option>
            <option value="0.99">$0.99</option>
            <option value="1.29">$1.29</option>
            <option value="1.99">$1.99</option>
            <option value="2.99">$2.99</option>
            <option value="custom">Custom price</option>
          </select>
        </div>
      </div>

      {/* Terms and Conditions Section */}
      <div className="rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Terms and Conditions</h2>

        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms1"
                type="checkbox"
                className="h-4 w-4 bg-[#1D2229] border-gray-600 rounded text-purple-600 focus:ring-0 focus:ring-offset-0"
              />
            </div>
            <label htmlFor="terms1" className="ml-3 text-sm text-gray-300">
              I confirm that I own or have licensed the necessary rights to
              distribute this content.
            </label>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms2"
                type="checkbox"
                className="h-4 w-4 bg-[#1D2229] border-gray-600 rounded text-purple-600 focus:ring-0 focus:ring-offset-0"
              />
            </div>
            <label htmlFor="terms2" className="ml-3 text-sm text-gray-300">
              I agree to the platform's distribution terms and understand the
              royalty payment structure.
            </label>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms3"
                type="checkbox"
                className="h-4 w-4 bg-[#1D2229] border-gray-600 rounded text-purple-600 focus:ring-0 focus:ring-offset-0"
              />
            </div>
            <label htmlFor="terms3" className="ml-3 text-sm text-gray-300">
              I consent to the processing of my personal information according
              to the Privacy Policy.
            </label>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          className="px-4 py-2 border border-gray-600 text-gray-400 rounded-md hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          Create Release
        </button>
      </div>

      {/* Toast notification */}
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}

      {/* Track Modal */}
      {showTrackModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black opacity-75" onClick={() => setShowTrackModal(false)}></div>
            <div className="relative bg-[#1D2229] rounded-lg w-full max-w-2xl p-6 z-10">
              <h3 className="text-xl font-semibold mb-4">
                {currentTrack.id ? 'Edit Track' : 'Add New Track'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Track Title */}
                <div>
                  <label htmlFor="trackTitle" className="block text-sm font-medium text-gray-400 mb-1">
                    Track Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="trackTitle"
                    value={currentTrack.title}
                    onChange={(e) => setCurrentTrack({...currentTrack, title: e.target.value})}
                    className="w-full bg-[#161A1F] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter track title"
                    required
                  />
                </div>
                
                {/* Artist Name */}
                <div>
                  <label htmlFor="trackArtist" className="block text-sm font-medium text-gray-400 mb-1">
                    Artist Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="trackArtist"
                    value={currentTrack.artistName}
                    onChange={(e) => setCurrentTrack({...currentTrack, artistName: e.target.value})}
                    className="w-full bg-[#161A1F] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter artist name"
                    required
                  />
                </div>
                
                {/* Duration */}
                <div>
                  <label htmlFor="trackDuration" className="block text-sm font-medium text-gray-400 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    id="trackDuration"
                    value={currentTrack.duration}
                    onChange={(e) => setCurrentTrack({...currentTrack, duration: e.target.value})}
                    className="w-full bg-[#161A1F] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g. 3:45"
                  />
                </div>
                
                {/* ISRC */}
                <div>
                  <label htmlFor="trackIsrc" className="block text-sm font-medium text-gray-400 mb-1">
                    ISRC
                  </label>
                  <input
                    type="text"
                    id="trackIsrc"
                    value={currentTrack.isrc}
                    onChange={(e) => setCurrentTrack({...currentTrack, isrc: e.target.value})}
                    className="w-full bg-[#161A1F] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g. USXXX2000000"
                  />
                </div>
                
                {/* Version */}
                <div>
                  <label htmlFor="trackVersion" className="block text-sm font-medium text-gray-400 mb-1">
                    Version
                  </label>
                  <select
                    id="trackVersion"
                    value={currentTrack.version}
                    onChange={(e) => setCurrentTrack({...currentTrack, version: e.target.value})}
                    className="w-full bg-[#161A1F] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="original">Original</option>
                    <option value="remix">Remix</option>
                    <option value="acoustic">Acoustic</option>
                    <option value="live">Live</option>
                    <option value="instrumental">Instrumental</option>
                    <option value="radio edit">Radio Edit</option>
                  </select>
                </div>
                
                {/* Content Rating */}
                <div>
                  <label htmlFor="trackContentRating" className="block text-sm font-medium text-gray-400 mb-1">
                    Content Rating
                  </label>
                  <select
                    id="trackContentRating"
                    value={currentTrack.contentRating}
                    onChange={(e) => setCurrentTrack({...currentTrack, contentRating: e.target.value})}
                    className="w-full bg-[#161A1F] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select...</option>
                    <option value="clean">Clean</option>
                    <option value="explicit">Explicit</option>
                  </select>
                </div>
              </div>
              
              {/* Lyrics */}
              <div className="mb-6">
                <label htmlFor="trackLyrics" className="block text-sm font-medium text-gray-400 mb-1">
                  Lyrics
                </label>
                <textarea
                  id="trackLyrics"
                  value={currentTrack.lyrics}
                  onChange={(e) => setCurrentTrack({...currentTrack, lyrics: e.target.value})}
                  rows={5}
                  className="w-full bg-[#161A1F] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter track lyrics"
                ></textarea>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowTrackModal(false)}
                  className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddOrEditTrack}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  {currentTrack.id ? 'Update Track' : 'Add Track'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}