"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

// Define the withdraw request data interface
interface WithdrawRequest {
  id: number;
  userName: string;
  date: string;
  transactionId: string;
  amount: string;
  status: "Completed" | "Pending" | "Rejected";
}

interface WithdrawDetailsModalProps {
  request: WithdrawRequest;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

export default function WithdrawDetailsModal({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: WithdrawDetailsModalProps) {
  // Determine profile image based on user name to ensure consistency
  const profileImage = request.userName === "Steven Wilson" 
    ? "/images/singer/1.webp"
    : "/images/singer/2.webp";

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

  if (!isOpen) return null;

  // Handle approve click
  const handleApprove = () => {
    onApprove(request.id);
    onClose();
  };

  // Handle reject click
  const handleReject = () => {
    onReject(request.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center">
      {/* Backdrop with blur */}
      <div className="fixed inset-0 backdrop-blur-sm bg-black/50" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative z-10 bg-[#111417] rounded-lg overflow-hidden shadow-xl max-w-md w-full max-h-[85vh] flex flex-col mt-16 transform transition-all">
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
        <div className="p-5 border-b border-gray-700">
          <div className="flex items-center">
            {/* User image */}
            <div className="w-20 h-20 relative rounded-full overflow-hidden mr-6 flex-shrink-0 bg-gray-800">
              <Image
                src={profileImage}
                alt={request.userName}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* User info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white truncate mb-2">
                {request.userName}
              </h2>

              {/* Genre/Style Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-3 py-1 text-xs bg-[#1D2229] rounded-full text-gray-300">
                  USA
                </span>
                <span className="px-3 py-1 text-xs bg-[#1D2229] rounded-full text-gray-300">
                  Hip-Hop
                </span>
                <span className="px-3 py-1 text-xs bg-[#1D2229] rounded-full text-gray-300">
                  Alternative Rock
                </span>
              </div>

              {/* Platform icons */}
              <div className="flex space-x-3">
                <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center">
                  <img
                    src="/icons/sp.svg"
                    alt="Spotify"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center">
                  <img
                    src="/icons/yt.svg"
                    alt="YouTube Music"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center">
                  <img
                    src="/icons/ap.svg"
                    alt="Apple Music"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center">
                  <img
                    src="/icons/sc.svg"
                    alt="SoundCloud"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details section */}
        <button className="bg-[#A365FF] text-white px-4 py-2 rounded-full mx-5 mt-5 mb-2">
          Details
        </button>

        {/* Withdraw Request Details */}
        <div className="p-5 overflow-y-auto flex-grow">
          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div className="bg-[#1A1E24] p-4 rounded">
              <div className="text-gray-400 text-sm mb-1">Date</div>
              <div className="text-white font-medium">{request.date}</div>
            </div>

            {/* Transaction ID */}
            <div className="bg-[#1A1E24] p-4 rounded">
              <div className="text-gray-400 text-sm mb-1">Transaction ID</div>
              <div className="text-white font-medium">{request.transactionId}</div>
            </div>

            {/* Amount */}
            <div className="bg-[#1A1E24] p-4 rounded">
              <div className="text-gray-400 text-sm mb-1">Amount</div>
              <div className="text-white font-medium">{request.amount}</div>
            </div>

            {/* Status */}
            <div className="bg-[#1A1E24] p-4 rounded">
              <div className="text-gray-400 text-sm mb-1">Status</div>
              <div className={`font-medium ${
                request.status === "Completed" 
                  ? "text-green-400" 
                  : request.status === "Rejected"
                  ? "text-red-400"
                  : "text-gray-400"
              }`}>
                {request.status}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {request.status === "Pending" && (
          <div className="p-5 border-t border-gray-700 flex space-x-4">
            <button 
              onClick={handleApprove}
              className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center justify-center"
            >
              <svg 
                className="w-5 h-5 mr-2" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M4 12.6111L8.92308 17.5L20 6.5" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              Approve
            </button>
            <button 
              onClick={handleReject}
              className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex items-center justify-center"
            >
              <svg 
                className="w-5 h-5 mr-2" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M6 6L18 18M6 18L18 6" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                />
              </svg>
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 