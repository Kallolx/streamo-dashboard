"use client";

import React, { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { MagnifyingGlass, Eye, Check, X, CalendarBlank, CaretDown, X as XIcon, Copy, Trash } from "@phosphor-icons/react";
import WithdrawDetailsModal from "@/components/Dashboard/models/WithdrawDetailsModal";
import { getAllWithdrawalRequests, getUserWithdrawalRequests, updateWithdrawalRequestStatus, deleteWithdrawalRequest } from "@/services/withdrawalService";
import { getUserData, getUserRole, hasRole } from "@/services/authService";
import { updateEarningsForWithdrawal } from "@/services/earningsManager";
import { format } from "date-fns";

// Define transaction status type
type StatusType = "completed" | "pending" | "rejected" | "approved";

// User interface
interface UserData {
  _id: string;
  id: string;
  name: string;
  email: string;
}

// Withdrawal request interface that maps to the database model
interface WithdrawRequest {
  id?: string;
  _id?: string;
  user: any; // Using any since the structure can vary
  userName?: string; // Extracted from user object if available
  amount: number;
  status: StatusType;
  paymentMethod: 'Bank' | 'BKash' | 'Nagad';
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
  createdAt: string;
  updatedAt: string;
  notes?: string;
  processedBy?: string;
  processedDate?: string;
}

interface WithdrawDetailsModalProps {
  request: WithdrawRequest;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete?: (id: string) => void;
}

export default function WithdrawRequestPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [withdrawRequestsData, setWithdrawRequestsData] = useState<WithdrawRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<WithdrawRequest | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [requestToReject, setRequestToReject] = useState<WithdrawRequest | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const itemsPerPage = 10;

  // Check user role and set states
  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);
    
    const userData = getUserData();
    if (userData && (userData.id || userData._id)) {
      setCurrentUserId(userData.id || userData._id);
    }
  }, []);

  // Check if user is admin or superadmin
  const isAdmin = (): boolean => {
    return hasRole(['admin', 'superadmin']);
  };

  // Fetch withdrawal requests from the API
  useEffect(() => {
    const fetchWithdrawalRequests = async () => {
      try {
        setIsLoading(true);
        
        // Use different endpoints based on user role
        const withdrawals = isAdmin() 
          ? await getAllWithdrawalRequests() 
          : await getUserWithdrawalRequests();
        
        // Transform data to match the format expected by the component
        const formattedWithdrawals = withdrawals.map(withdrawal => {
          // Extract user name from the user object if it's populated
          let userName = 'Unknown User';
          
          if (withdrawal.user) {
            if (typeof withdrawal.user === 'object' && withdrawal.user !== null) {
              // User is populated - extract from the populated object
              const userObj = withdrawal.user as any;
              if (userObj.name) {
                userName = userObj.name;
              } else if (userObj.email) {
                userName = userObj.email;
              } else if (userObj._id) {
                userName = `User ${userObj._id.toString()}`;
              }
            } else if (typeof withdrawal.user === 'string') {
              // For backward compatibility - the user is just an ID string
              userName = `User ID: ${withdrawal.user}`;
            }
          }
          
          console.log("User Object:", withdrawal.user, "Extracted Name:", userName);
          
          return {
            ...withdrawal,
            userName: userName
          };
        });
        
        setWithdrawRequestsData(formattedWithdrawals);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching withdrawal requests:", err);
        setError(err.message || "Failed to load withdrawal requests");
      } finally {
        setIsLoading(false);
      }
    };

    if (userRole !== null) {
      fetchWithdrawalRequests();
    }
  }, [userRole]);

  // Update status function
  const updateRequestStatus = async (id: string, newStatus: StatusType, notes?: string) => {
    try {
      // Only allow admin/superadmin to update status
      if (!isAdmin()) {
        setError("You don't have permission to perform this action");
        return;
      }
      
      await updateWithdrawalRequestStatus(id, newStatus, notes);
      
      // Update local state after successful API call
      setWithdrawRequestsData(
        withdrawRequestsData.map((request) => 
          (request.id === id || request._id === id) ? { 
            ...request, 
            status: newStatus,
            notes: notes || request.notes
          } : request
        )
      );

      // Notify dashboard to refresh earnings data when status changes to completed
      if (newStatus === 'completed' || newStatus === 'approved' || newStatus === 'rejected') {
        // Find the request to get the userId
        const request = withdrawRequestsData.find((req) => req.id === id || req._id === id);
        if (request && request.user) {
          // The user ID to notify about the status change
          const userId = typeof request.user === 'object' ? (request.user._id || request.user.id) : request.user;
          // Ensure amount is a number
          const amountValue = typeof request.amount === 'number' ? request.amount : parseFloat(String(request.amount));
          
          // Update the earnings manager to track this withdrawal status change
          updateEarningsForWithdrawal(id, amountValue, 
            newStatus === 'completed' || newStatus === 'approved' ? 'approve' : 
            newStatus === 'rejected' ? 'reject' : 'create',
            userId
          );
          
          // Set localStorage to trigger update in DashboardHome
          localStorage.setItem('withdrawalStatusChanged', JSON.stringify({
            userId,
            status: newStatus,
            amount: amountValue,
            id,
            timestamp: Date.now()
          }));
          
          // Add BroadcastChannel communication
          try {
            const bc = new BroadcastChannel('withdrawal_updates');
            bc.postMessage({
              userId,
              status: newStatus,
              amount: amountValue,
              id,
              timestamp: Date.now()
            });
            bc.close();
          } catch (err) {
            console.error('BroadcastChannel not supported', err);
            // Fallback already implemented with localStorage and custom event
          }
          
          // Dispatch custom event
          const event = new CustomEvent('withdrawalStatusChanged', { 
            detail: { 
              userId, 
              status: newStatus,
              amount: amountValue,
              id
            }
          });
          window.dispatchEvent(event);
          
          console.log(`Triggered withdrawal status update for user ${userId} with status ${newStatus} and amount ${amountValue}`);
        }
      }
    } catch (err) {
      console.error(`Error updating withdrawal status for ID ${id}:`, err);
      // Show error message to user
      setError("Failed to update withdrawal status. Please try again.");
    }
  };

  // Handle delete request
  const handleDeleteRequest = (request: WithdrawRequest) => {
    // Show delete confirmation modal
    setRequestToDelete(request);
    setShowDeleteModal(true);
  };

  // Confirm delete request
  const confirmDeleteRequest = async () => {
    if (!requestToDelete) return;
    
    try {
      setIsDeleting(true);
      const requestId = getRequestId(requestToDelete);
      
      // Only allow admin/superadmin to delete
      if (!isAdmin()) {
        setError("You don't have permission to perform this action");
        setIsDeleting(false);
        return;
      }
      
      await deleteWithdrawalRequest(requestId);
      
      // Update local state to remove the deleted request
      setWithdrawRequestsData(
        withdrawRequestsData.filter(
          (request) => getRequestId(request) !== requestId
        )
      );
      
      // Close the modal and reset state
      setShowDeleteModal(false);
      setRequestToDelete(null);
      setIsDeleting(false);
    } catch (err) {
      console.error("Error deleting withdrawal request:", err);
      setError("Failed to delete withdrawal request. Please try again.");
      setIsDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setRequestToDelete(null);
  };

  // Handle view request details
  const handleViewDetails = (request: WithdrawRequest) => {
    setSelectedRequest(request);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setSelectedRequest(null);
  };

  // Format date function
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (err) {
      return 'Invalid date';
    }
  };

  // Format amount function
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Extract user ID helper function
  const getUserId = (request: WithdrawRequest): string => {
    if (typeof request.user === 'object' && request.user !== null) {
      const userObj = request.user as any;
      if (userObj.id) {
        return userObj.id;
      } else if (userObj._id) {
        return typeof userObj._id === 'object' ? userObj._id.toString() : userObj._id;
      }
    } else if (typeof request.user === 'string') {
      return request.user;
    }
    return String(request.user || 'unknown');
  };

  // Get request ID helper function
  const getRequestId = (request: WithdrawRequest): string => {
    return (request.id || request._id || '').toString();
  };

  // Filter withdraw requests based on search term
  const filteredRequests = withdrawRequestsData.filter(
    (request) =>
      request.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.id && request.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (request._id && request._id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (request.paymentMethod && request.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Toggle filter modal
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Filter by status
  const filterByStatus = (status: StatusType | 'all') => {
    if (status === 'all') {
      // Reset filter
      return withdrawRequestsData;
    }
    
    return withdrawRequestsData.filter(request => request.status === status);
  };

  // Filter by payment method
  const filterByPaymentMethod = (method: 'Bank' | 'BKash' | 'Nagad' | 'all') => {
    if (method === 'all') {
      // Reset filter
      return withdrawRequestsData;
    }
    
    return withdrawRequestsData.filter(request => request.paymentMethod === method);
  };

  // Handle copying transaction ID
  const handleCopyTransactionId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Handle reject request
  const handleRejectRequest = (request: WithdrawRequest) => {
    // Show rejection modal
    setRequestToReject(request);
    setRejectionNote("");
    setShowRejectionModal(true);
  };

  // Confirm reject request
  const confirmRejectRequest = async () => {
    if (!requestToReject) return;
    
    try {
      setIsRejecting(true);
      const requestId = getRequestId(requestToReject);
      
      // Only allow admin/superadmin to reject
      if (!isAdmin()) {
        setError("You don't have permission to perform this action");
        setIsRejecting(false);
        return;
      }
      
      await updateRequestStatus(requestId, "rejected", rejectionNote);
      
      // Close the modal and reset state
      setShowRejectionModal(false);
      setRequestToReject(null);
      setRejectionNote("");
      setIsRejecting(false);
    } catch (err) {
      console.error("Error rejecting withdrawal request:", err);
      setError("Failed to reject withdrawal request. Please try again.");
      setIsRejecting(false);
    }
  };

  // Cancel rejection
  const cancelRejection = () => {
    setShowRejectionModal(false);
    setRequestToReject(null);
    setRejectionNote("");
  };

  return (
    <DashboardLayout title="Withdraw Request" subtitle={isAdmin() ? "Manage all withdrawal requests" : "View your withdrawal requests"}>
      <div className="relative">
        {/* Search Bar with Filter Button */}
        <div className="flex items-center mb-6">
          <div className="relative flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by user, ID, or payment method..."
                className="w-full py-2 px-4 pl-10 rounded-md bg-[#1D2229] text-gray-300 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlass 
                size={20}
                className="absolute left-3 top-2.5 text-gray-400" 
              />
            </div>
          </div>
          <button 
            className="p-2 bg-[#A365FF] rounded-md ml-2"
            onClick={toggleFilters}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 8.5V13.5C22 19 20 21 14.5 21H9.5C4 21 2 19 2 13.5V8.5C2 3 4 1 9.5 1H14.5C20 1 22 3 22 8.5Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 9.5H17" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 14.5H14" stroke="white" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="bg-[#161A1F] rounded-lg p-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="bg-[#161A1F] rounded-lg p-6 text-red-400">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-[#A365FF] text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Withdraw Requests Table */}
        {!isLoading && !error && (
          <div className="bg-[#161A1F] rounded-lg overflow-hidden">
            {withdrawRequestsData.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p>No withdrawal requests found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-[#1A1E24]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Mobile Number
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      {isAdmin() && (
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Action
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-[#161A1F] divide-y divide-gray-700">
                    {currentItems.map((request) => {
                      const requestId = getRequestId(request);
                      return (
                        <tr 
                          key={requestId} 
                          className="hover:bg-[#1A1E24] cursor-pointer"
                          onClick={() => handleViewDetails(request)}
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-white">
                            {request.userName}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-white">
                            {formatDate(request.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-white">
                            <div className="flex items-center space-x-1">
                              <div className="max-w-[120px] overflow-hidden text-ellipsis" title={requestId}>
                                {requestId.substring(0, 10)}...
                              </div>
                              <button
                                className={`text-gray-400 hover:text-white transition-colors p-1 rounded ${
                                  copiedId === requestId ? "text-green-400 bg-green-900/20" : ""
                                }`}
                                onClick={(e) => handleCopyTransactionId(e, requestId)}
                                title="Copy transaction ID"
                              >
                                {copiedId === requestId ? (
                                  <Check size={16} weight="bold" />
                                ) : (
                                  <Copy size={16} />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-white">
                            {formatAmount(request.amount)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-white">
                            {request.paymentMethod}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-white">
                            {request.mobileNumber || (request.paymentMethod === 'Bank' ? '-' : 'Not provided')}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              request.status === "completed" 
                                ? "bg-green-900/30 text-green-400" 
                                : request.status === "rejected"
                                ? "bg-red-900/30 text-red-400"
                                : "bg-gray-700/30 text-gray-300"
                            }`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </td>
                          {isAdmin() && (
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex justify-center space-x-2" onClick={(e) => e.stopPropagation()}>
                                {request.status === "pending" && (
                                  <>
                                    <button 
                                      className="text-green-400 hover:text-green-300 transition-colors"
                                      onClick={() => {
                                        if (requestId) {
                                          updateRequestStatus(requestId, "completed");
                                        }
                                      }}
                                    >
                                      <Check size={20} weight="bold" />
                                    </button>
                                    <button 
                                      className="text-red-400 hover:text-red-300 transition-colors"
                                      onClick={() => {
                                        if (requestId) {
                                          handleRejectRequest(request);
                                        }
                                      }}
                                    >
                                      <X size={20} weight="bold" />
                                    </button>
                                  </>
                                )}
                                <button 
                                  className="text-gray-400 hover:text-white transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDetails(request);
                                  }}
                                >
                                  <Eye size={20} />
                                </button>
                                <button 
                                  className="text-red-500 hover:text-red-400 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteRequest(request);
                                  }}
                                >
                                  <Trash size={20} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {withdrawRequestsData.length > 0 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-700">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md ${
                      currentPage === 1
                        ? "text-gray-500 cursor-not-allowed"
                        : "text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md ${
                      currentPage === totalPages
                        ? "text-gray-500 cursor-not-allowed"
                        : "text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-400">
                      Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastItem, filteredRequests.length)}
                      </span>{' '}
                      of <span className="font-medium">{filteredRequests.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-[#161A1F] text-sm font-medium ${
                          currentPage === 1
                            ? "text-gray-500 cursor-not-allowed"
                            : "text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            currentPage === page
                              ? "bg-purple-600 border-purple-500 text-white"
                              : "border-gray-700 bg-[#161A1F] text-gray-300 hover:bg-gray-700"
                          } text-sm font-medium`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-[#161A1F] text-sm font-medium ${
                          currentPage === totalPages
                            ? "text-gray-500 cursor-not-allowed"
                            : "text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
                <div className="hidden sm:flex items-center">
                  <select
                    className="ml-4 bg-[#1A1E25] border border-gray-700 text-gray-300 text-sm rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    defaultValue="10"
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filter Modal with Backdrop Blur */}
        {showFilters && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop with blur */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={toggleFilters}
            ></div>
            
            {/* Filter Modal */}
            <div className="relative w-full max-w-md bg-[#161A1F] rounded-lg shadow-lg overflow-hidden z-10">
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h3 className="text-lg font-medium text-white">Filters</h3>
                <button 
                  onClick={toggleFilters}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XIcon size={20} />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Date Range */}
                <div>
                  <p className="text-sm text-white mb-2">Choose Date Range</p>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Select Date Range"
                      className="w-full p-2 pl-4 pr-10 bg-[#1D2229] border border-gray-700 rounded text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      readOnly
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <CalendarBlank className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                {/* Payment Method */}
                <div>
                  <p className="text-sm text-white mb-2">Payment Method</p>
                  <div className="relative">
                    <select
                      className="w-full p-2 pl-4 pr-10 bg-[#1D2229] border border-gray-700 rounded text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 appearance-none"
                    >
                      <option value="all">All</option>
                      <option value="Bank">Bank</option>
                      <option value="BKash">BKash</option>
                      <option value="Nagad">Nagad</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <CaretDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                {/* Status */}
                <div>
                  <p className="text-sm text-white mb-2">Status</p>
                  <div className="relative">
                    <select
                      className="w-full p-2 pl-4 pr-10 bg-[#1D2229] border border-gray-700 rounded text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 appearance-none"
                    >
                      <option value="all">All</option>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <CaretDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center pt-4">
                  <button
                    className="px-8 py-2 bg-[#A365FF] text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Withdraw Details Modal */}
        {selectedRequest && (
          <WithdrawDetailsModal
            request={{
              id: getRequestId(selectedRequest),
              userName: selectedRequest.userName || `User ID: ${getUserId(selectedRequest)}`,
              userId: getUserId(selectedRequest),
              date: formatDate(selectedRequest.createdAt),
              transactionId: getRequestId(selectedRequest),
              amount: formatAmount(selectedRequest.amount),
              status: selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1) as "Completed" | "Pending" | "Rejected",
              paymentMethod: selectedRequest.paymentMethod,
              bankDetails: selectedRequest.bankDetails,
              mobileNumber: selectedRequest.mobileNumber,
              notes: selectedRequest.notes
            }}
            isOpen={!!selectedRequest}
            onClose={handleCloseModal}
            onApprove={(id) => {
              if (!isAdmin()) {
                setError("You don't have permission to perform this action");
                return;
              }
              
              const requestId = getRequestId(selectedRequest);
              if (requestId) {
                updateRequestStatus(requestId, "completed");
              }
              handleCloseModal();
            }}
            onReject={(id) => {
              if (!isAdmin()) {
                setError("You don't have permission to perform this action");
                return;
              }
              
              handleRejectRequest(selectedRequest);
              handleCloseModal();
            }}
            onDelete={() => {
              handleDeleteRequest(selectedRequest);
              handleCloseModal();
            }}
          />
        )}

        {/* Rejection Confirmation Modal */}
        {showRejectionModal && requestToReject && (
          <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-70 flex items-center justify-center p-4">
            <div className="bg-[#1A1E24] rounded-lg shadow-xl w-full max-w-md mx-auto">
              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h3 className="text-xl font-medium text-white">
                  Reject Withdrawal Request
                </h3>
                <button
                  onClick={cancelRejection}
                  className="text-gray-400 hover:text-white focus:outline-none"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-300 mb-4">
                  Please provide a reason for rejecting this withdrawal request.
                </p>
                
                <div className="mb-4">
                  <label htmlFor="rejection-note" className="block text-sm font-medium text-gray-400 mb-2">
                    Rejection Reason
                  </label>
                  <textarea
                    id="rejection-note"
                    rows={4}
                    className="w-full p-3 bg-[#161A1F] border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="Enter reason for rejection..."
                    value={rejectionNote}
                    onChange={(e) => setRejectionNote(e.target.value)}
                  ></textarea>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={cancelRejection}
                    className="px-4 py-2 bg-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRejectRequest}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                    disabled={isRejecting}
                  >
                    {isRejecting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <X size={20} className="mr-2" />
                        Reject
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && requestToDelete && (
          <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-70 flex items-center justify-center p-4">
            <div className="bg-[#1A1E24] rounded-lg shadow-xl w-full max-w-md mx-auto">
              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h3 className="text-xl font-medium text-white">
                  Delete Withdrawal Request
                </h3>
                <button
                  onClick={cancelDelete}
                  className="text-gray-400 hover:text-white focus:outline-none"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-300 mb-6">
                  Are you sure you want to delete this withdrawal request? This action cannot be undone.
                </p>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 bg-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteRequest}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash size={20} className="mr-2" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
