"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "@phosphor-icons/react";
import Image from "next/image";

// Props interface for the modal
export interface RoyaltyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  royalty: {
    id?: number;
    track: string;
    artist: string;
    label: string;
    revenue: string;
    labelSplit: string;
    artistSplit: string;
    imageSrc?: string;
    isrc?: string;
    trackId?: string;
    territories?: string[];
    services?: string[];
    streams?: number;
  };
  onEdit?: (royaltyId: number | string) => void;
  onUpdate?: (royaltyData: any) => void;
}

export default function RoyaltyDetailsModal({
  isOpen,
  onClose,
  royalty,
  onEdit,
  onUpdate
}: RoyaltyDetailsModalProps) {
  // State variables
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedRoyalty, setEditedRoyalty] = useState({ ...royalty });
  const [activeTab, setActiveTab] = useState('royalty'); // 'royalty' or 'analytics'

  // Default image fallback if transaction has no image
  const defaultImage = "/images/music/1.png";

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
      // Reset edit mode and edited royalty
      setIsEditMode(false);
      setEditedRoyalty({ ...royalty });
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown, royalty]);

  // Handle edit button
  const handleEdit = () => {
    if (onEdit && royalty.id) onEdit(royalty.id);
    setIsEditMode(true);
  };

  // Handle save changes
  const handleSaveChanges = () => {
    // In a real app, you would save the changes to the backend here
    if (onUpdate) {
      onUpdate(editedRoyalty);
    }
    console.log("Changes saved:", editedRoyalty);
    setIsEditMode(false);
  };

  // Cancel changes
  const handleCancelChanges = () => {
    setEditedRoyalty({ ...royalty });
    setIsEditMode(false);
  };

  // Handle field change 
  const handleFieldChange = (field: string, value: string | number) => {
    setEditedRoyalty({
      ...editedRoyalty,
      [field]: value
    });
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  // Check if analytics data exists
  const hasAnalyticsData = royalty.territories?.length || royalty.services?.length || royalty.streams;

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
          <X size={24} />
        </button>

        {/* Header with album art and track info */}
        <div className="p-5">
          <div className="flex">
            {/* Left side - Album Art */}
            <div className="w-40 h-40 relative rounded-md overflow-hidden mr-6 flex-shrink-0 bg-gray-800">
              <Image
                src={royalty.imageSrc || defaultImage}
                alt={royalty.track || "Album artwork"}
                fill
                className="object-cover"
                onError={(e) => {
                  // Fall back to default image if the track image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = defaultImage;
                }}
              />
            </div>

            {/* Right side - Title and Info */}
            <div>
              {/* Title and ID */}
              <div className="mb-4">
                <div className="flex items-center">
                  <h2 className="text-2xl font-semibold text-white mr-2">
                    {royalty.track || "Midnight Drive"}
                  </h2>
                  <span className="text-gray-400 text-sm">{royalty.trackId || "TRK00123"}</span>
                </div>
                
                <div className="mt-1 text-sm">
                  <span className="text-gray-400">Artist: </span>
                  <span className="text-white bg-[#232830] px-3 py-1 rounded-full inline-block">{royalty.artist || "Steven Wilson"}</span>
                </div>
                
                <div className="mt-2 text-sm">
                  <span className="text-gray-400">Label: </span>
                  <span className="text-white bg-[#232830] px-3 py-1 rounded-full inline-block">{royalty.label || "Fiction Records"}</span>
                </div>

                {royalty.streams !== undefined && (
                  <div className="mt-2 text-sm">
                    <span className="text-gray-400">Streams: </span>
                    <span className="text-white bg-[#232830] px-3 py-1 rounded-full inline-block">{royalty.streams.toLocaleString()}</span>
                  </div>
                )}

                <div className="mt-2 text-sm">
                  <span className="text-gray-400">Revenue: </span>
                  <span className="text-white bg-[#232830] px-3 py-1 rounded-full inline-block">{royalty.revenue}</span>
                </div>
              </div>

              {/* Edit Button */}
              <div>
                {!isEditMode ? (
                  <button
                    className="flex items-center px-3 py-2 rounded-full bg-[#A365FF] text-white transition-colors"
                    onClick={handleEdit}
                  >
                    <svg
                      className="w-5 h-5 mr-2 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    <span className="text-sm">Edit</span>
                  </button>
                ) : (
                  <div className="text-gray-400 text-sm italic">Editing mode</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab title for navigation */}
        <div className="flex px-5 py-2 border-b border-gray-800">
          <span 
            className={`px-4 py-2 mr-2 rounded-full text-sm cursor-pointer ${activeTab === 'royalty' ? 'bg-[#A365FF] text-white' : 'bg-[#232830] text-gray-300'}`}
            onClick={() => setActiveTab('royalty')}
          >
            Royalty Split
          </span>
          {hasAnalyticsData && (
            <span 
              className={`px-4 py-2 rounded-full text-sm cursor-pointer ${activeTab === 'analytics' ? 'bg-[#A365FF] text-white' : 'bg-[#232830] text-gray-300'}`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </span>
          )}
        </div>

        {/* Content Area */}
        <div className="p-5 flex-grow overflow-y-auto">
          {activeTab === 'royalty' ? (
            <>
              {/* Label's Split */}
              <div className="mb-6">
                <h3 className="text-white mb-2">Label's Split</h3>
                {isEditMode ? (
                  <div className="flex items-center mb-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={parseInt(editedRoyalty.labelSplit) || 50}
                      onChange={(e) => {
                        const labelValue = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                        handleFieldChange('labelSplit', `${labelValue}%`);
                        handleFieldChange('artistSplit', `${100 - labelValue}%`);
                      }}
                      className="w-20 bg-[#232830] text-white py-1 px-2 rounded border border-gray-700 mr-2"
                    />
                    <span className="text-gray-400">%</span>
                  </div>
                ) : null}
                <div className="h-12 relative bg-[#1A1E24] rounded-lg overflow-hidden">
                  <div 
                    className="h-full bg-[#A365FF] flex items-center px-4"
                    style={{ width: editedRoyalty.labelSplit || royalty.labelSplit }}
                  >
                    <span className="text-white">{editedRoyalty.labelSplit || royalty.labelSplit}</span>
                  </div>
                </div>
              </div>

              {/* Artist's Split */}
              <div className="mb-6">
                <h3 className="text-white mb-2">Artist's Split</h3>
                {isEditMode ? (
                  <div className="flex items-center mb-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={parseInt(editedRoyalty.artistSplit) || 50}
                      onChange={(e) => {
                        const artistValue = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                        handleFieldChange('artistSplit', `${artistValue}%`);
                        handleFieldChange('labelSplit', `${100 - artistValue}%`);
                      }}
                      className="w-20 bg-[#232830] text-white py-1 px-2 rounded border border-gray-700 mr-2"
                    />
                    <span className="text-gray-400">%</span>
                  </div>
                ) : null}
                <div className="h-12 relative bg-[#1A1E24] rounded-lg overflow-hidden">
                  <div 
                    className="h-full bg-[#A365FF] flex items-center px-4"
                    style={{ width: editedRoyalty.artistSplit || royalty.artistSplit }}
                  >
                    <span className="text-white">{editedRoyalty.artistSplit || royalty.artistSplit}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons for Edit mode */}
              {isEditMode && (
                <div className="flex mt-6 space-x-4 justify-end">
                  <button
                    onClick={handleCancelChanges}
                    className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    className="px-4 py-2 bg-[#A365FF] text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Update
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Analytics Tab Content */}
              {/* Territories Section */}
              {royalty.territories && royalty.territories.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-white mb-3">Territories</h3>
                  <div className="flex flex-wrap gap-2">
                    {royalty.territories.map((territory, index) => (
                      territory && territory !== 'Unknown' && (
                        <span 
                          key={index} 
                          className="bg-[#232830] text-gray-300 px-3 py-1 rounded-full text-sm"
                        >
                          {territory}
                        </span>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Services Section */}
              {royalty.services && royalty.services.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-white mb-3">Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {royalty.services.map((service, index) => (
                      service && service !== 'Unknown' && (
                        <span 
                          key={index} 
                          className="bg-[#232830] text-gray-300 px-3 py-1 rounded-full text-sm"
                        >
                          {service}
                        </span>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Analytics Info */}
              <div className="mb-6">
                <h3 className="text-white mb-3">Performance</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1A1E24] p-4 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Total Streams</div>
                    <div className="text-white text-xl font-bold">{royalty.streams?.toLocaleString() || '0'}</div>
                  </div>
                  <div className="bg-[#1A1E24] p-4 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Total Revenue</div>
                    <div className="text-white text-xl font-bold">{royalty.revenue || '$0'}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 
