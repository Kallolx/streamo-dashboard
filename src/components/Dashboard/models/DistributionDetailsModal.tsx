"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { updateReleaseISRC } from "@/services/releaseService";
import { updateTrackISRC } from "@/services/trackService";
import { getAllStores, Store } from "@/services/storeService";

// Define the distribution request data interface
interface DistributionRequest {
  id: string;
  userName: string;
  trackRelease: string;
  artist: string;
  label: string;
  status: "Approved" | "Pending" | "Rejected" | "Completed" | "approved" | "pending" | "rejected" | "completed" | "submitted" | "processing";
  itemType?: 'track' | 'release';
  originalData?: any;
  isrc?: string;
  upc?: string;
}

interface DistributionDetailsModalProps {
  request: DistributionRequest;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

// Collapsible section component
function CollapsibleSection({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-4">
      <button
        className="w-full flex justify-between items-center py-2 px-2 bg-[#181C22] rounded-t text-left text-white font-semibold focus:outline-none"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <svg className={`w-4 h-4 ml-2 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && <div className="bg-[#1A1E24] rounded-b p-4">{children}</div>}
    </div>
  );
}

export default function DistributionDetailsModal({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: DistributionDetailsModalProps) {
  const [isrc, setIsrc] = useState(request.isrc || request.originalData?.isrc || '');
  const [upc, setUpc] = useState(request.upc || request.originalData?.upc || '');
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });
  const [tracks, setTracks] = useState(request.originalData?.tracks || []);
  const [storeMap, setStoreMap] = useState<Record<string, Store>>({});
  const [storesLoading, setStoresLoading] = useState(true);

  // Determine profile image based on user name to ensure consistency
  const profileImage = request.userName === "Steven Wilson" 
    ? "/images/singer/1.webp"
    : "/images/singer/2.webp";

  // Determine track image based on track name for consistency
  const trackImage = "/images/music/1.png";

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
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // Fetch stores data to get proper names
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setStoresLoading(true);
        const response = await getAllStores();
        if (response.success && response.data) {
          // Create a map of store IDs to store objects for quick lookup
          const storesById: Record<string, Store> = {};
          response.data.forEach((store: Store) => {
            if (store._id) {
              storesById[store._id] = store;
            }
          });
          setStoreMap(storesById);
        }
      } catch (error) {
        console.error('Error fetching stores:', error);
      } finally {
        setStoresLoading(false);
      }
    };
    
    fetchStores();
  }, []);

  // Helper function to get store name from ID
  const getStoreName = (storeId: string) => {
    if (storeMap[storeId] && storeMap[storeId].name) {
      return storeMap[storeId].name;
    }
    return storeId; // Fallback to ID if name not found
  };

  if (!isOpen) return null;

  // Handle ISRC/UPC update
  const handleUpdate = async () => {
    try {
      if (request.itemType === 'track') {
        // For video tracks, we have a single ISRC and UPC
        await updateTrackISRC(request.id, isrc, upc);
        setIsEditing(false);
        setToast({
          show: true,
          message: 'ISRC/UPC updated successfully',
          type: 'success'
        });
        // Update local state
        request.originalData.isrc = isrc;
        request.originalData.upc = upc;
      } else {
        // For releases, we have multiple tracks with ISRCs and a single UPC
        await updateReleaseISRC(request.id, tracks, upc);
        setIsEditing(false);
        setToast({
          show: true,
          message: 'ISRC/UPC updated successfully',
          type: 'success'
        });
        // Update local state with new values
        request.originalData.tracks = tracks;
        request.originalData.upc = upc;
      }
    } catch (error) {
      setToast({
        show: true,
        message: 'Failed to update ISRC/UPC',
        type: 'error'
      });
    }
  };

  // Handle approve with ISRC/UPC validation
  const handleApprove = () => {
    // For tracks, check the single ISRC
    if (request.itemType === 'track') {
      if (!isrc) {
        setToast({
          show: true,
          message: 'Please add ISRC before approving this video',
          type: 'error'
        });
        return;
      }
    } 
    // For releases, check if tracks have ISRCs
    else {
      // Check if any track is missing ISRC
      const missingIsrc = tracks.some((track: { isrc?: string }) => !track.isrc);
      if (missingIsrc) {
        setToast({
          show: true,
          message: 'Please add ISRC for all tracks before approving',
          type: 'error'
        });
        return;
      }
    }
    
    onApprove(request.id);
    onClose();
  };

  // Handle reject click
  const handleReject = () => {
    onReject(request.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      {/* Modal container */}
      <div className="relative bg-[#111417] rounded-lg shadow-xl w-full max-w-2xl mx-2 flex flex-col max-h-[95vh] overflow-hidden">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-[#111417] border-b border-gray-800 px-4 py-3 flex items-center gap-4">
          <div className="w-14 h-14 relative rounded overflow-hidden flex-shrink-0 bg-gray-800">
            <Image
              src={request.originalData?.coverArt || "/images/default-cover.png"}
              alt={request.userName}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white truncate">{request.trackRelease}</h2>
            <p className="text-gray-400 text-sm truncate">{request.artist}</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {request.originalData?.genre && (
                <span className="px-2 py-0.5 text-xs bg-[#1D2229] rounded-full text-gray-300">{request.originalData.genre}</span>
              )}
              {request.originalData?.language && (
                <span className="px-2 py-0.5 text-xs bg-[#1D2229] rounded-full text-gray-300">{request.originalData.language}</span>
              )}
              {request.originalData?.releaseType && (
                <span className="px-2 py-0.5 text-xs bg-[#1D2229] rounded-full text-gray-300">{request.originalData.releaseType}</span>
              )}
            </div>
          </div>
          <button
            className="ml-2 text-gray-400 hover:text-white"
            onClick={onClose}
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
          <CollapsibleSection title={request.itemType === 'track' ? "Video Metadata" : "Release Metadata"} defaultOpen={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><span className="text-gray-400 text-xs">Title</span><div className="text-white font-medium">{request.trackRelease}</div></div>
              <div><span className="text-gray-400 text-xs">Singer</span><div className="text-white font-medium">{request.originalData?.singer || request.artist}</div></div>
              <div><span className="text-gray-400 text-xs">Label</span><div className="text-white font-medium">{request.label}</div></div>
              <div><span className="text-gray-400 text-xs">Status</span><div className={`font-medium ${request.status.toLowerCase().includes('approved') ? 'text-green-400' : request.status.toLowerCase().includes('rejected') ? 'text-red-400' : 'text-yellow-400'}`}>{request.status}</div></div>
              <div><span className="text-gray-400 text-xs">Release Type</span><div className="text-white">{request.originalData?.releaseType || '-'}</div></div>
              <div><span className="text-gray-400 text-xs">Format</span><div className="text-white">{request.originalData?.format || '-'}</div></div>
              <div><span className="text-gray-400 text-xs">Genre</span><div className="text-white">{request.originalData?.genre || '-'}</div></div>
              <div><span className="text-gray-400 text-xs">Language</span><div className="text-white">{request.originalData?.language || '-'}</div></div>
              <div><span className="text-gray-400 text-xs">Release Date</span><div className="text-white">{request.originalData?.releaseDate || '-'}</div></div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Contributors">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><span className="text-gray-400 text-xs">Feature Artist</span><div className="text-white">{request.originalData?.artist || request.originalData?.featuredArtist || '-'}</div></div>
              <div><span className="text-gray-400 text-xs">Composer</span><div className="text-white">{request.originalData?.composer || '-'}</div></div>
              <div><span className="text-gray-400 text-xs">Lyricist</span><div className="text-white">{request.originalData?.lyricist || '-'}</div></div>
              <div><span className="text-gray-400 text-xs">Music Producer</span><div className="text-white">{request.originalData?.musicProducer || '-'}</div></div>
              <div><span className="text-gray-400 text-xs">Publisher</span><div className="text-white">{request.originalData?.publisher || '-'}</div></div>
              <div><span className="text-gray-400 text-xs">Music Director</span><div className="text-white">{request.originalData?.musicDirector || '-'}</div></div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="ISRC & UPC Management">
            <div className="mb-2 text-xs text-gray-400">
              {request.itemType === 'track' 
                ? "Edit ISRC and UPC for the video." 
                : "Edit ISRC for each track and the release UPC."} 
              <span className='italic text-gray-500'>(ISRC is a unique code for each track/video.)</span>
            </div>
            <div className="rounded-lg bg-[#181C22] border border-gray-700 shadow-sm p-4">
              {request.itemType === 'track' ? (
                // Single ISRC field for tracks/videos
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">ISRC</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={isrc}
                        onChange={e => setIsrc(e.target.value)}
                        className="w-full bg-[#23272F] border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm transition-all duration-150 hover:border-purple-400 focus:border-purple-500"
                        placeholder="Enter ISRC"
                      />
                    ) : (
                      <span className="text-white text-base">{isrc || <span className='italic text-gray-500'>No ISRC</span>}</span>
                    )}
                  </div>
                </div>
              ) : (
                // Table of tracks for releases
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full text-sm text-left">
                    <thead>
                      <tr className="text-gray-400">
                        <th className="py-1 pr-4">Title</th>
                        <th className="py-1 pr-4">Artist</th>
                        <th className="py-1">ISRC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tracks.map((track: any, idx: number) => (
                        <tr key={track._id || idx} className="border-b border-gray-800 last:border-0">
                          <td className="py-1 pr-4 text-white max-w-[120px] truncate">{track.title}</td>
                          <td className="py-1 pr-4 text-white max-w-[120px] truncate">{track.artistName}</td>
                          <td className="py-1">
                            {isEditing ? (
                              <input
                                type="text"
                                value={track.isrc || ''}
                                onChange={e => {
                                  const newTracks = [...tracks];
                                  newTracks[idx] = { ...newTracks[idx], isrc: e.target.value };
                                  setTracks(newTracks);
                                }}
                                className="w-32 bg-[#23272F] border border-gray-600 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm transition-all duration-150 hover:border-purple-400 focus:border-purple-500"
                                placeholder="Enter ISRC"
                              />
                            ) : (
                              <span className="text-gray-200">{track.isrc || <span className='italic text-gray-500'>No ISRC</span>}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-2">
                <label className="block text-gray-400 text-sm mb-1">UPC</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={upc}
                    onChange={e => setUpc(e.target.value)}
                    className="w-full bg-[#23272F] border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm transition-all duration-150 hover:border-purple-400 focus:border-purple-500"
                    placeholder="Enter UPC"
                  />
                ) : (
                  <span className="text-white text-base">{upc || <span className='italic text-gray-500'>No UPC</span>}</span>
                )}
              </div>
              
              {/* Edit/Save buttons */}
              <div className="mt-4 flex justify-end">
                {isEditing ? (
                  <button
                    onClick={handleUpdate}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow-sm transition-colors"
                  >
                    Save Changes
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded shadow-sm transition-colors"
                  >
                    Edit ISRC/UPC
                  </button>
                )}
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title={`Distribution Platforms (${request.originalData?.stores?.length || 0})`}>
            {storesLoading ? (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-gray-600 border-t-purple-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Store count summary */}
                <div className="flex items-center justify-between">
                  <p className="text-gray-300 text-xs">
                    {request.originalData?.stores?.length 
                      ? `${request.originalData.stores.length} platform${request.originalData.stores.length !== 1 ? 's' : ''} selected` 
                      : 'No platforms selected'}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {request.originalData?.stores?.map((storeId: string) => {
                    const store = storeMap[storeId];
                    return (
                      <div 
                        key={storeId} 
                        className="px-3 py-2 bg-[#1D2229] rounded-md text-xs text-white flex items-center gap-2 border border-gray-700"
                      >
                        {store?.icon ? (
                          <img 
                            src={store.icon}
                            alt=""
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                              // Hide failed images
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-[10px]">{getStoreName(storeId).charAt(0)}</span>
                          </div>
                        )}
                        <span>{getStoreName(storeId)}</span>
                      </div>
                    );
                  })}
                  {(!request.originalData?.stores || request.originalData.stores.length === 0) && (
                    <p className="text-gray-400 text-sm">No distribution platforms selected</p>
                  )}
                </div>
              </div>
            )}
          </CollapsibleSection>
        </div>

        {/* Sticky action bar */}
        <div className="sticky bottom-0 z-10 bg-[#111417] border-t border-gray-800 px-4 py-3 flex flex-col sm:flex-row gap-2 sm:gap-4 justify-end items-stretch">
          <div className="flex-1 flex gap-2">
            {/* Only show approve/reject buttons if status is pending/processing/submitted */}
            {(request.status.toLowerCase() === "pending" || 
              request.status.toLowerCase() === "processing" || 
              request.status.toLowerCase() === "submitted") ? (
              <>
                <button
                  onClick={handleApprove}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-base font-semibold transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => onReject(request.id)}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-base font-semibold transition-colors"
                >
                  Reject
                </button>
              </>
            ) : (
              <div className="flex-1 flex items-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                  request.status.toLowerCase().includes('approved') 
                    ? 'bg-green-900/50 text-green-200 border border-green-700'
                    : request.status.toLowerCase().includes('rejected')
                    ? 'bg-red-900/50 text-red-200 border border-red-700'
                    : 'bg-gray-800 text-gray-300 border border-gray-700'
                }`}>
                  Status: {request.status}
                </span>
              </div>
            )}
            
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-700 text-gray-400 rounded-md hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Toast notification */}
        {toast.show && (
          <div className={`fixed bottom-4 right-4 z-50 flex items-center p-4 rounded-md shadow-lg ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            <div className="text-white">{toast.message}</div>
            <button onClick={() => setToast({ ...toast, show: false })} className="ml-4 text-white hover:text-gray-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 