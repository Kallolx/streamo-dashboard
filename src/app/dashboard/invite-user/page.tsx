"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { Copy, UserPlus } from "@phosphor-icons/react";
import { createInvitation, getInvitedUsers, isInvitationExpired, deleteInvitation } from "@/services/invitationService";
import Toast from "@/components/Common/Toast";

export default function InviteUserPage() {
  const [userData, setUserData] = useState<any>(null);
  const [inviteLink, setInviteLink] = useState<string>("");
  const [inviteCode, setInviteCode] = useState<string>("");
  const [invitedUsers, setInvitedUsers] = useState<any[]>([]);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLoadingInvites, setIsLoadingInvites] = useState(false);
  const [expirationTime, setExpirationTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [currentInvitation, setCurrentInvitation] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Get user data on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userDataString = localStorage.getItem('userData');
      if (userDataString) {
        const user = JSON.parse(userDataString);
        setUserData(user);
      }
    }
  }, []);

  // Fetch invited users when component mounts
  useEffect(() => {
    if (userData && (userData.role === 'labelowner' || userData.role === 'admin' || userData.role === 'superadmin')) {
      fetchInvitedUsers();
    }
  }, [userData]);

  // Generate invitation link
  const generateInviteLink = async () => {
    // Check if user is a label owner
    if (userData && userData.role !== 'labelowner') {
      setToastMessage('Only Label Owners can create invitation links.');
      setToastType('error');
      setShowToast(true);
      return;
    }
    
    try {
      setIsGeneratingLink(true);
      // Call the API to create an invitation with expiration
      const invitation = await createInvitation();
      const link = `${window.location.origin}/auth/signup?referral=${invitation.code}`;
      
      // Store the full invitation object, not just the code
      setCurrentInvitation(invitation);
      setInviteLink(link);
      setInviteCode(invitation.code);
      
      // Set expiration time from the server response
      if (invitation.expiresAt) {
        setExpirationTime(new Date(invitation.expiresAt));
      }
    } catch (error) {
      console.error('Error generating invite link:', error);
      setToastMessage('Failed to generate invitation link. Please try again.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  // Copy invitation link to clipboard
  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  // Fetch invited users
  const fetchInvitedUsers = async () => {
    try {
      setIsLoadingInvites(true);
      // Call the real API to get invited users
      const users = await getInvitedUsers();
      setInvitedUsers(users);
    } catch (error) {
      console.error('Error fetching invited users:', error);
      // Show error toast
      setToastMessage('Unable to load invited users. Please try again later.');
      setToastType('error');
      setShowToast(true);
      // Set empty array to prevent UI from breaking
      setInvitedUsers([]);
    } finally {
      setIsLoadingInvites(false);
    }
  };
  
  // Keep track of invitation expiration
  useEffect(() => {
    if (!expirationTime || !currentInvitation) return;

    // Set initial time immediately to prevent delay in display
    const updateTimeLeft = () => {
      const now = new Date();
      const diff = expirationTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft("Expired");
        
        // Auto-delete the invitation from database when it expires
        if (currentInvitation && currentInvitation.id) {
          deleteInvitation(currentInvitation.id)
            .then(() => {
              console.log('Expired invitation deleted from database');
            })
            .catch(error => {
              console.error('Failed to delete expired invitation:', error);
            });
        }
        
        return true; // Return true when expired
      }
      
      // Format as MM:SS for 5-minute expiration
      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      return false; // Not expired
    };
    
    // Update time immediately
    const isExpired = updateTimeLeft();
    if (isExpired) return;
    
    // Update every second
    const interval = setInterval(() => {
      const isExpired = updateTimeLeft();
      if (isExpired) {
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [expirationTime, currentInvitation]);

  // Check if current invitation is expired
  useEffect(() => {
    if (currentInvitation && isInvitationExpired(currentInvitation)) {
      setTimeLeft("Expired");
      
      // Also delete the invitation if it's expired (for cases when returning to the page)
      if (currentInvitation.id) {
        deleteInvitation(currentInvitation.id)
          .then(() => {
            console.log('Expired invitation deleted from database on check');
          })
          .catch(error => {
            console.error('Failed to delete expired invitation on check:', error);
          });
      }
    }
  }, [currentInvitation]);

  return (
    <DashboardLayout title="" subtitle="">
      {/* Show Toast notifications */}
      {showToast && (
        <Toast 
          message={toastMessage} 
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
      
      <div className="p-4 sm:p-6">
       <div className="bg-[#1A1E24] rounded-lg p-6 border border-gray-700 mb-8">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <UserPlus size={22} className="mr-3 text-[#A365FF]" />
              Artist Invitations
            </h3>
          </div>
          
          <p className="text-gray-400 mb-5 text-sm leading-relaxed">
            Generate an invitation link that will be active for 5 minutes. When artists register using this link, they'll be automatically connected to your label.
          </p>
          
          <div className="mb-6 space-y-4">
            {!inviteLink || timeLeft === "Expired" ? (
              <button
                onClick={generateInviteLink}
                disabled={isGeneratingLink}
                className={`w-full sm:w-auto bg-[#A365FF] hover:bg-[#8A50E0] text-white px-6 py-3 rounded-md transition-colors flex items-center justify-center ${
                  isGeneratingLink ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isGeneratingLink ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} className="mr-2" />
                    {timeLeft === "Expired" ? "Generate New Invitation Link" : "Generate Invitation Link"}
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-4">
                <div className={`${timeLeft === "Expired" ? "bg-red-900/20 border-red-800/30" : "bg-[#161A1F] border-gray-700"} p-4 rounded-md border`}>
                  <div className="flex items-center mb-3">
                    <div className={`h-9 w-9 rounded-full ${timeLeft === "Expired" ? "bg-red-900/30" : "bg-purple-900/30"} flex items-center justify-center mr-3`}>
                      <UserPlus size={18} className={timeLeft === "Expired" ? "text-red-400" : "text-[#A365FF]"} />
                    </div>
                    <span className="text-white font-medium">Invitation Link</span>
                  </div>
                  
                  {timeLeft !== "Expired" && (
                    <div className="relative">
                      <input
                        type="text"
                        value={inviteLink}
                        readOnly
                        className="w-full p-3 pr-28 bg-[#161A1F]/60 border border-gray-700/50 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#A365FF] text-sm"
                      />
                      <button
                        onClick={copyInviteLink}
                        className={`absolute right-1 top-1 ${isCopied ? 'bg-green-600' : 'bg-[#A365FF]'} hover:opacity-90 text-white px-4 py-2 rounded-md transition-colors text-sm flex items-center`}
                      >
                        {isCopied ? (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={16} className="mr-1" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    {timeLeft === "Expired" 
                      ? "This invitation has expired. Please generate a new one." 
                      : "This link will be active for 5 minutes."}
                  </p>
                  <button
                    onClick={generateInviteLink}
                    className="text-[#A365FF] hover:text-purple-400 text-sm flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Generate New
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-[#1A1E24] rounded-lg p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-semibold text-white">Invited Artists</h3>
            <button 
              onClick={fetchInvitedUsers} 
              className="text-sm text-[#A365FF] hover:text-purple-400 flex items-center"
              disabled={isLoadingInvites}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
          
          {isLoadingInvites ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#A365FF]"></div>
            </div>
          ) : invitedUsers.length > 0 ? (
            <div className="bg-[#161A1F] rounded-lg overflow-hidden border border-gray-700">
              <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-[#1D2229] sticky top-0">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                        Email
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {invitedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-[#1A1E24]">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-purple-900/30 flex items-center justify-center mr-3 flex-shrink-0">
                              <span className="text-[#A365FF] text-xs font-medium">
                                {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                            <span>{user.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400 hidden sm:table-cell">
                          {user.email}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400 hidden md:table-cell">
                          {new Date(user.joinedAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-[#161A1F] rounded-lg p-8 border border-gray-700 text-center">
              <div className="w-16 h-16 mx-auto bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
                <UserPlus size={24} className="text-[#A365FF]" />
              </div>
              <h5 className="text-white font-medium mb-2">No artists joined yet</h5>
              <p className="text-gray-400 text-sm">
                Share your invitation link with artists to invite them to your label
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 