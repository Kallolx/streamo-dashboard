"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "@phosphor-icons/react";
import Image from "next/image";

// Tab interfaces for the modal
type TabType = "details";
type ActionType = "edit" | "download" | "delete";

// Transaction status types
type TransactionStatus = "pending" | "completed" | "failed";

// Props interface for the modal
export interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: {
    id?: number;
    track: string;
    artist: string;
    isrc: string;
    store: string;
    streams: number;
    revenue: string;
    album?: string;
    label?: string;
    country?: string;
    user?: string;
    date?: string;
    imageSrc?: string;
  };
  initialAction?: ActionType;
  initialStatus?: TransactionStatus;
  onEdit?: (transactionId: number | string) => void;
  onDownload?: (transactionId: number | string) => void;
  onDelete?: (transactionId: number | string) => void;
}

export default function TransactionDetailsModal({
  isOpen,
  onClose,
  transaction,
  initialAction = "edit",
  initialStatus = "completed",
  onEdit,
  onDownload,
  onDelete
}: TransactionDetailsModalProps) {
  // State variables
  const [currentTab, setCurrentTab] = useState<TabType>("details");
  const [currentAction, setCurrentAction] = useState<ActionType>(initialAction);
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>(initialStatus);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTransaction, setEditedTransaction] = useState({ ...transaction });
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Default image fallback if transaction has no image
  const defaultImage = "/images/music/3.png";

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
      // Reset edit mode and edited transaction
      setIsEditMode(false);
      setEditedTransaction({ ...transaction });
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown, transaction]);

  // Handle edit button
  const handleEdit = () => {
    if (onEdit && transaction.id) onEdit(transaction.id);
    setIsEditMode(true);
    setCurrentAction("edit");
  };

  // Handle download button
  const handleDownload = () => {
    setShowDownloadConfirm(true);
  };

  // Confirm download action
  const confirmDownload = () => {
    if (onDownload && transaction.id) onDownload(transaction.id);
    setCurrentAction("download");
    setShowDownloadConfirm(false);
  };

  // Cancel download action
  const cancelDownload = () => {
    setShowDownloadConfirm(false);
  };

  // Handle delete button
  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  // Confirm delete action
  const confirmDelete = () => {
    if (onDelete && transaction.id) onDelete(transaction.id);
    setCurrentAction("delete");
    setShowDeleteConfirm(false);
  };

  // Cancel delete action
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Add a save changes function
  const handleSaveChanges = () => {
    // In a real app, you would save the changes to the backend here
    // For now, we'll just log the changes and exit edit mode
    console.log("Changes saved:", editedTransaction);
    setIsEditMode(false);
  };

  // Add a cancel changes function
  const handleCancelChanges = () => {
    setEditedTransaction({ ...transaction });
    setIsEditMode(false);
  };

  // Add a field change handler
  const handleFieldChange = (field: string, value: string | number) => {
    setEditedTransaction({
      ...editedTransaction,
      [field]: value
    });
  };

  // Switch action type
  const switchAction = (action: ActionType) => {
    setCurrentAction(action);
  };

  // Sample data for demo
  const defaultData = {
    label: "Fiction Records",
    country: "Bangladesh",
    date: "2025-12-31"
  };

  // Use default data if not provided
  const displayData = {
    label: transaction.label || defaultData.label,
    country: transaction.country || defaultData.country,
    date: transaction.date || defaultData.date,
  };

  // If modal is not open, don't render anything
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
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header with album art and actions */}
        <div className="p-5">
          <div className="flex">
            {/* Left side - Album Art */}
            <div className="w-40 h-40 relative rounded-md overflow-hidden mr-6 flex-shrink-0 bg-gray-800">
              <Image
                src={transaction.imageSrc || defaultImage}
                alt={transaction.track || "Album artwork"}
                fill
                className="object-cover"
                onError={(e) => {
                  // Fall back to default image if the track image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = defaultImage;
                }}
              />
            </div>

            {/* Right side - Title and Actions */}
            <div className="flex-1 flex flex-col">
              {/* Title and ID */}
              <div className="mb-4">
                <div className="flex items-center">
                  <h2 className="text-2xl font-semibold text-white mr-2">
                    {transaction.track || "Midnight Drive"}
                  </h2>
                  <span className="text-gray-400 text-sm">TRK00123</span>
                </div>
                <div className="mt-1 text-sm">
                  <span className="text-gray-400">Artist: </span>
                  <span className="text-white">{transaction.artist}</span>
                </div>
                <div className="mt-1 text-sm">
                  <span className="text-gray-400">Label: </span>
                  <span className="text-white">{displayData.label}</span>
                </div>

                {/* Status Badge */}
                <div className="mt-1">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs rounded-full capitalize ${
                      transactionStatus === "completed"
                        ? "bg-green-900 text-green-200"
                        : transactionStatus === "failed"
                        ? "bg-red-900 text-red-200"
                        : "bg-gray-800 text-gray-200"
                    }`}
                  >
                    {transactionStatus}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 mt-auto">
                <button
                  className={`flex items-center px-3 py-2 rounded-full ${
                    currentAction === "edit" ? "bg-[#A365FF]" : "bg-[#1A1E24]"
                  } transition-colors`}
                  onClick={() => switchAction("edit")}
                >
                  <svg
                    className={`w-5 h-5 mr-2 ${
                      currentAction === "edit" ? "text-white" : "text-[#A365FF]"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  <span
                    className={`text-sm ${
                      currentAction === "edit" ? "text-white" : "text-gray-200"
                    }`}
                  >
                    Edit
                  </span>
                </button>

                <button
                  className={`flex items-center px-3 py-2 rounded-full ${
                    currentAction === "download" ? "bg-[#A365FF]" : "bg-[#1A1E24]"
                  } transition-colors`}
                  onClick={handleDownload}
                >
                  <svg
                    className={`w-5 h-5 mr-2 ${
                      currentAction === "download" ? "text-white" : "text-[#A365FF]"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span
                    className={`text-sm ${
                      currentAction === "download" ? "text-white" : "text-gray-200"
                    }`}
                  >
                    Download
                  </span>
                </button>

                <button
                  className={`flex items-center px-3 py-2 rounded-full ${
                    currentAction === "delete"
                      ? "bg-[#A365FF]"
                      : "bg-[#1A1E24]"
                  } transition-colors`}
                  onClick={handleDelete}
                >
                  <svg
                    className={`w-5 h-5 mr-2 ${
                      currentAction === "delete"
                        ? "text-white"
                        : "text-[#A365FF]"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span
                    className={`text-sm ${
                      currentAction === "delete"
                        ? "text-white"
                        : "text-gray-200"
                    }`}
                  >
                    Delete
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for navigation */}
        <div className="flex px-5 py-2 space-x-2 mb-2">
          <button
            className="px-5 py-2 rounded-full bg-[#A365FF] text-white"
          >
            Details
          </button>
        </div>

        {/* Content Area */}
        <div className="flex flex-col flex-1 overflow-auto">
          {/* Tab Content */}
          <div className="px-5 pb-5 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Country */}
              <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                <h3 className="text-gray-400 text-sm">Country</h3>
                {isEditMode ? (
                  <select 
                    className="w-full bg-[#252A33] text-white py-1 px-2 rounded borde"
                    value={editedTransaction.country || displayData.country}
                    onChange={(e) => handleFieldChange('country', e.target.value)}
                  >
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                ) : (
                  <p className="text-white text-base font-medium">
                    {displayData.country}
                  </p>
                )}
              </div>

              {/* Store */}
              <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                <h3 className="text-gray-400 text-sm">Store</h3>
                {isEditMode ? (
                  <select 
                    className="w-full bg-[#252A33] text-white py-1 px-2 rounded border border-gray-700"
                    value={editedTransaction.store}
                    onChange={(e) => handleFieldChange('store', e.target.value)}
                  >
                    <option value={transaction.store}>{transaction.store}</option>
                    <option value="Spotify">Spotify</option>
                    <option value="Apple Music">Apple Music</option>
                    <option value="Soundcloud">Soundcloud</option>
                    <option value="YouTube">YouTube</option>
                  </select>
                ) : (
                  <p className="text-white text-base font-medium">
                    {transaction.store}
                  </p>
                )}
              </div>

              {/* User */}
              <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                <h3 className="text-gray-400 text-sm">User</h3>
                {isEditMode ? (
                  <select 
                    className="w-full bg-[#252A33] text-white py-1 px-2 rounded border border-gray-700"
                    value={editedTransaction.user || transaction.artist}
                    onChange={(e) => handleFieldChange('user', e.target.value)}
                  >
                    <option value={transaction.artist}>{transaction.artist}</option>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                  </select>
                ) : (
                  <p className="text-white text-base font-medium">
                    {transaction.user || transaction.artist}
                  </p>
                )}
              </div>

              {/* ISRC */}
              <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                <h3 className="text-gray-400 text-sm">ISRC</h3>
                <p className="text-white text-base font-medium">
                  {transaction.isrc || "2QSW40413BB84"}
                </p>
              </div>

              {/* Track/Release */}
              <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                <h3 className="text-gray-400 text-sm">Track/Release</h3>
                {isEditMode ? (
                  <input 
                    type="text" 
                    className="w-full bg-[#252A33] text-white py-1 px-2 rounded border border-gray-700"
                    value={editedTransaction.track}
                    onChange={(e) => handleFieldChange('track', e.target.value)}
                  />
                ) : (
                  <p className="text-white text-base font-medium">
                    {transaction.track}
                  </p>
                )}
              </div>

              {/* Artist's Name */}
              <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                <h3 className="text-gray-400 text-sm">Artist's Name</h3>
                {isEditMode ? (
                  <input 
                    type="text" 
                    className="w-full bg-[#252A33] text-white py-1 px-2 rounded border border-gray-700"
                    value={editedTransaction.artist}
                    onChange={(e) => handleFieldChange('artist', e.target.value)}
                  />
                ) : (
                  <p className="text-white text-base font-medium">
                    {transaction.artist}
                  </p>
                )}
              </div>

              {/* Streams */}
              <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                <h3 className="text-gray-400 text-sm">Streams</h3>
                {isEditMode ? (
                  <input 
                    type="number" 
                    className="w-full bg-[#252A33] text-white py-1 px-2 rounded border border-gray-700"
                    value={editedTransaction.streams}
                    onChange={(e) => handleFieldChange('streams', e.target.value)}
                  />
                ) : (
                  <p className="text-white text-base font-medium">
                    {transaction.streams}
                  </p>
                )}
              </div>

              {/* Net Revenue */}
              <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                <h3 className="text-gray-400 text-sm">Net Revenue</h3>
                {isEditMode ? (
                  <input 
                    type="text" 
                    className="w-full bg-[#252A33] text-white py-1 px-2 rounded border border-gray-700"
                    value={editedTransaction.revenue}
                    onChange={(e) => handleFieldChange('revenue', e.target.value)}
                  />
                ) : (
                  <p className="text-white text-base font-medium">
                    {transaction.revenue}
                  </p>
                )}
              </div>

              {/* Date */}
              <div className="space-y-1 bg-[#1A1E24] p-3 rounded-sm">
                <h3 className="text-gray-400 text-sm">Date</h3>
                {isEditMode ? (
                  <input 
                    type="date" 
                    className="w-full bg-[#252A33] text-white py-1 px-2 rounded border border-gray-700"
                    value={editedTransaction.date || displayData.date}
                    onChange={(e) => handleFieldChange('date', e.target.value)}
                  />
                ) : (
                  <p className="text-white text-base font-medium">
                    {displayData.date}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons for Edit mode */}
          {isEditMode && (
            <div className="flex p-4 space-x-4 justify-end border-t border-gray-800">
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
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Download Confirmation Popup */}
      {showDownloadConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={cancelDownload}></div>
          <div className="relative z-10 bg-[#1A1E24] p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Confirm Download</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to download this transaction?</p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={cancelDownload}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                No
              </button>
              <button 
                onClick={confirmDownload}
                className="px-4 py-2 bg-[#A365FF] text-white rounded hover:bg-purple-700 transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={cancelDelete}></div>
          <div className="relative z-10 bg-[#1A1E24] p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to delete this transaction? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                No
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 