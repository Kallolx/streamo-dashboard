"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { hasRole } from "@/services/authService";
import { Copy, Check } from "@phosphor-icons/react";
import { updateEarningsForWithdrawal } from "@/services/earningsManager";

// Define the withdraw request data interface
interface WithdrawRequest {
  id: string;
  userName: string;
  userId?: string;
  date: string;
  transactionId: string;
  amount: string;
  status: "Completed" | "Pending" | "Rejected";
  paymentMethod?: 'Bank' | 'BKash' | 'Nagad';
  bankDetails?: {
    country?: string;
    routingNumber?: string;
    bankName: string;
    accountName: string;
    swiftCode: string;
    accountNumber: string;
    branch?: string;
  };
  mobileNumber?: string;
  notes?: string;
}

interface WithdrawDetailsModalProps {
  request: WithdrawRequest;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function WithdrawDetailsModal({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onDelete,
}: WithdrawDetailsModalProps) {
  // State for copy operation
  const [copied, setCopied] = useState(false);
  
  // Determine if user is admin or superadmin
  const isAdmin = hasRole(['admin', 'superadmin']);

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
    try {
      // Get amount as a number
      const amountValue = parseFloat(request.amount.replace(/[$,]/g, '')) || 0;
      
      // Get userId from request or use a fallback
      const userId = request.userId || 'unknown';
      
      // Update earnings via the earnings manager with specific userId
      updateEarningsForWithdrawal(request.id, amountValue, 'approve', userId);
      
      // 1. Trigger the custom event to update dashboard data
      const event = new CustomEvent('withdrawalStatusChanged', {
        detail: { 
          status: 'completed',
          amount: amountValue,
          id: request.id,
          userId,
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(event);
      
      // 2. Update localStorage to ensure cross-page communication
      localStorage.setItem('withdrawalStatusChanged', JSON.stringify({
        status: 'completed',
        amount: amountValue,
        id: request.id,
        userId,
        timestamp: Date.now()
      }));
      
      // 3. Broadcast to other browser tabs/windows using BroadcastChannel
      try {
        const bc = new BroadcastChannel('withdrawal_updates');
        bc.postMessage({
          status: 'completed',
          amount: amountValue,
          id: request.id,
          userId,
          timestamp: Date.now()
        });
        bc.close();
      } catch (err) {
        console.error('BroadcastChannel not supported', err);
        // Fallback already implemented with localStorage
      }
      
      console.log(`Withdrawal approved: ID ${request.id}, Amount ${request.amount}, User ${userId}`);
      
      // Call the parent component's approve function
      onApprove(request.id);
      onClose();
    } catch (error) {
      console.error('Error in handleApprove:', error);
      // Still call the approval function even if there's an error in the notification
      onApprove(request.id);
      onClose();
    }
  };

  // Handle reject click
  const handleReject = () => {
    try {
      // Get amount as a number
      const amountValue = parseFloat(request.amount.replace(/[$,]/g, '')) || 0;
      
      // Get userId from request or use a fallback
      const userId = request.userId || 'unknown';
      
      console.log(`Rejecting withdrawal: ID ${request.id}, Amount ${amountValue}, User ${userId}`);
      
      // Update earnings via the earnings manager with specific userId
      updateEarningsForWithdrawal(request.id, amountValue, 'reject', userId);
      
      // 1. Trigger event to restore balance if rejected
      const event = new CustomEvent('withdrawalStatusChanged', {
        detail: { 
          status: 'rejected',
          amount: amountValue,
          id: request.id,
          userId,
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(event);
      
      // 2. Update localStorage to ensure cross-page communication
      localStorage.setItem('withdrawalStatusChanged', JSON.stringify({
        status: 'rejected',
        amount: amountValue,
        id: request.id,
        userId,
        timestamp: Date.now()
      }));
      
      // 3. Broadcast to other browser tabs/windows using BroadcastChannel
      try {
        const bc = new BroadcastChannel('withdrawal_updates');
        bc.postMessage({
          status: 'rejected',
          amount: amountValue,
          id: request.id,
          userId,
          timestamp: Date.now()
        });
        bc.close();
      } catch (err) {
        console.error('BroadcastChannel not supported', err);
        // Fallback already implemented with localStorage
      }
      
      console.log(`Withdrawal rejected: ID ${request.id}, Amount ${amountValue}, User ${userId}`);
      
      onReject(request.id);
      onClose();
    } catch (error) {
      console.error('Error in handleReject:', error);
      // Still call the reject function even if there's an error in the notification
      onReject(request.id);
      onClose();
    }
  };
  
  // Handle delete click
  const handleDelete = () => {
    onDelete(request.id);
    onClose();
  };
  
  // Handle copy transaction ID
  const handleCopyTransactionId = () => {
    navigator.clipboard.writeText(request.transactionId);
    setCopied(true);
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
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

              {/* Status Tag */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`px-3 py-1 text-xs rounded-full ${
                  request.status === "Completed" 
                    ? "bg-green-900/30 text-green-400" 
                    : request.status === "Rejected"
                    ? "bg-red-900/30 text-red-400"
                    : "bg-gray-700/30 text-gray-300"
                }`}>
                  {request.status}
                </span>
                <span className="px-3 py-1 text-xs bg-[#1D2229] rounded-full text-gray-300">
                  {request.paymentMethod || 'Unknown Method'}
                </span>
              </div>

              {/* Amount */}
              <div className="text-xl font-semibold text-white">
                {request.amount}
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
              <div className="text-white font-medium flex items-center space-x-2">
                <div className="truncate max-w-[120px]" title={request.transactionId}>
                  {request.transactionId}
                </div>
                <button
                  onClick={handleCopyTransactionId}
                  className={`text-gray-400 hover:text-white p-1 rounded transition-all ${
                    copied ? "text-green-400 bg-green-900/20" : ""
                  }`}
                  title="Copy transaction ID"
                >
                  {copied ? <Check size={16} weight="bold" /> : <Copy size={16} />}
                </button>
              </div>
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
            
            {/* Payment Method */}
            <div className="bg-[#1A1E24] p-4 rounded col-span-2">
              <div className="text-gray-400 text-sm mb-1">Payment Method</div>
              <div className="text-white font-medium">{request.paymentMethod || 'Not specified'}</div>
            </div>
            
            {/* Bank Details (if available) */}
            {request.paymentMethod === 'Bank' && request.bankDetails && (
              <div className="bg-[#1A1E24] p-4 rounded col-span-2">
                <div className="text-gray-400 text-sm mb-2">Bank Details</div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="text-white">
                    <span className="text-gray-400 text-xs">Country:</span> {request.bankDetails.country || 'Bangladesh'}
                  </div>
                  <div className="text-white">
                    <span className="text-gray-400 text-xs">Bank Name:</span> {request.bankDetails.bankName}
                  </div>
                  <div className="text-white">
                    <span className="text-gray-400 text-xs">Account Name:</span> {request.bankDetails.accountName}
                  </div>
                  <div className="text-white">
                    <span className="text-gray-400 text-xs">Account Number:</span> {request.bankDetails.accountNumber}
                  </div>
                  {request.bankDetails.routingNumber && (
                    <div className="text-white">
                      <span className="text-gray-400 text-xs">Routing Number:</span> {request.bankDetails.routingNumber}
                    </div>
                  )}
                  {request.bankDetails.swiftCode && (
                    <div className="text-white">
                      <span className="text-gray-400 text-xs">Swift Code:</span> {request.bankDetails.swiftCode}
                    </div>
                  )}
                  {request.bankDetails.branch && (
                    <div className="text-white">
                      <span className="text-gray-400 text-xs">Branch:</span> {request.bankDetails.branch}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Mobile Number (if available) */}
            {request.paymentMethod && ['BKash', 'Nagad'].includes(request.paymentMethod) && request.mobileNumber && (
              <div className="bg-[#1A1E24] p-4 rounded col-span-2">
                <div className="text-gray-400 text-sm mb-2">{request.paymentMethod} Details</div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="text-white">
                    <span className="text-gray-400 text-xs">Mobile Number:</span> {request.mobileNumber}
                  </div>
                </div>
              </div>
            )}

            {/* Rejection Notes (if status is Rejected and notes exist) */}
            {request.status === "Rejected" && request.notes && (
              <div className="bg-[#1A1E24] p-4 rounded col-span-2 border border-red-800/30">
                <div className="text-red-400 text-sm mb-2">Rejection Reason</div>
                <div className="text-white text-sm">
                  {request.notes}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons - only visible to admins and when status is pending */}
        {isAdmin && request.status === "Pending" && (
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

        {/* Delete button - always visible to admins */}
        {isAdmin && (
          <div className={`p-5 ${request.status === "Pending" ? "" : "border-t border-gray-700"}`}>
            <button 
              onClick={handleDelete}
              className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors flex items-center justify-center"
            >
              <svg 
                className="w-5 h-5 mr-2" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M4 7H20M10 11V17M14 11V17M5 7L6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19L19 7M15 7V4C15 3.45 14.55 3 14 3H10C9.45 3 9 3.45 9 4V7" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 