"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

// Define the label data interface
interface Label {
  id: number;
  name: string;
  imageSrc: string;
  bio: string;
  totalTracks: number;
  totalAlbums: number;
}

interface LabelDetailsModelProps {
  label: Label;
  isOpen: boolean;
  onClose: () => void;
}

export default function LabelDetailsModel({
  label,
  isOpen,
  onClose,
}: LabelDetailsModelProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedLabel, setEditedLabel] = useState<Label>({ ...label });
  
  // Determine image based on label ID to ensure consistency
  const imageNumber = (label.id % 3) + 1;
  const labelImage = `/images/singer/${imageNumber}.webp`;
  
  const defaultImage = "/images/singer/1.webp";

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
      // Reset edit mode and edited label when modal opens
      setIsEditMode(false);
      setEditedLabel({ ...label });
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown, label]);

  // Handle edit info click
  const handleEditClick = () => {
    setIsEditMode(true);
  };

  // Handle save changes
  const handleSaveChanges = () => {
    console.log("Changes saved:", editedLabel);
    setIsEditMode(false);
  };

  // Handle cancel changes
  const handleCancelChanges = () => {
    setEditedLabel({ ...label });
    setIsEditMode(false);
  };

  // Handle field change
  const handleFieldChange = (field: string, value: string | number) => {
    setEditedLabel({
      ...editedLabel,
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
            {/* Label image */}
            <div className="w-32 h-32 relative rounded-full overflow-hidden mr-6 flex-shrink-0 bg-gray-800">
              <Image
                src={labelImage}
                alt={label.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Label info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white truncate mb-2">
                {label.name}
              </h2>

              {/* Tags row - Only USA */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-3 py-1 text-xs bg-[#1D2229] rounded-full text-gray-300">
                  USA
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 flex-grow">
          <div className="space-y-4">
            {/* Biography section */}
            <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
              <h3 className="text-gray-400 text-sm">Bio</h3>
              {isEditMode ? (
                <textarea
                  value={editedLabel.bio}
                  onChange={(e) => handleFieldChange("bio", e.target.value)}
                  rows={4}
                  className="w-full border rounded-md px-3 py-2 text-white mt-2"
                />
              ) : (
                <p className="text-white text-base font-medium">
                  {label.bio || "No biography available for this label."}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Total tracks section */}
              <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                <h3 className="text-gray-400 text-sm">Total Tracks</h3>
                {isEditMode ? (
                  <input
                    type="number"
                    value={editedLabel.totalTracks}
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
                    {label.totalTracks || 0}
                  </p>
                )}
              </div>

              {/* Total albums section */}
              <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                <h3 className="text-gray-400 text-sm">Total Albums</h3>
                {isEditMode ? (
                  <input
                    type="number"
                    value={editedLabel.totalAlbums}
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
                    {label.totalAlbums || 0}
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
        </div>
      </div>
    </div>
  );
}
