"use client";

import { useState } from "react";
import { X } from "@phosphor-icons/react";
import Image from "next/image";

// Full user interface based on the data structure shown
interface DetailedUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  birthDate?: string;
  gender?: string;
  introduction?: string;
  country?: string;
  city?: string;
  phone?: string;
  address?: string;
  currentDistributor?: string;
  distributorNumber?: string;
  youtubeLink?: string;
  facebookLink?: string;
  tiktokLink?: string;
  instagramLink?: string;
  documentType?: string;
  documentId?: string;
  split: number;
  isApproved: boolean;
  role: string;
  profileImage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: DetailedUser | null;
}

export default function UserDetailsModal({
  isOpen,
  onClose,
  user
}: UserDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'personal' | 'social' | 'verification' | 'activity'>('personal');
  
  if (!isOpen || !user) return null;

  // Format date for better readability
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not available";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Capitalize first letter of a string
  const capitalize = (str?: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  
  // Get country name from country code
  const getCountryName = (countryCode?: string) => {
    if (!countryCode) return "Not specified";
    
    const countries: Record<string, string> = {
      "us": "United States",
      "gb": "United Kingdom",
      "ca": "Canada",
      "au": "Australia",
      "bd": "Bangladesh",
      "in": "India",
      // Add more countries as needed
    };
    
    return countries[countryCode.toLowerCase()] || countryCode;
  };
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 backdrop-blur-sm bg-black/50" onClick={onClose}></div>
      <div className="relative z-10 bg-[#111417] rounded-lg overflow-hidden shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col transform transition-all">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
          onClick={onClose}
        >
          <X size={24} />
        </button>
        
        {/* Header */}
        <div className="bg-[#161A1F] p-5 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white">{user.name}</h3>
              <p className="text-gray-400 text-sm mb-1">{user.email}</p>
              
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.isApproved ? "bg-green-900/50 text-green-200 border border-green-700" : "bg-yellow-900/50 text-yellow-200 border border-yellow-700"
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                  {user.isApproved ? "Approved" : "Pending Approval"}
                </span>
                
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.isActive ? "bg-green-900/50 text-green-200 border border-green-700" : "bg-red-900/50 text-red-200 border border-red-700"
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                  {user.isActive ? "Active" : "Inactive"}
                </span>
                
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/50 text-purple-200 border border-purple-700">
                  {capitalize(user.role)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-700 bg-[#161A1F] px-4">
          <button 
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'personal' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('personal')}
          >
            Personal Details
          </button>
          <button 
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'social' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('social')}
          >
            Social Media
          </button>
          <button 
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'verification' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('verification')}
          >
            Verification
          </button>
          <button 
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'activity' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('activity')}
          >
            Activity
          </button>
        </div>
        
        {/* Content Area */}
        <div className="p-5 overflow-y-auto flex-grow">
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#1A1E24] p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Basic Information</h4>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="text-sm text-white">{user.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-white">{user.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm text-white">{user.phone || "Not provided"}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Gender</p>
                    <p className="text-sm text-white">{capitalize(user.gender) || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Birth Date</p>
                    <p className="text-sm text-white">{user.birthDate || "Not provided"}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#1A1E24] p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Location & Contact</h4>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Country</p>
                    <p className="text-sm text-white">{getCountryName(user.country)}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">City</p>
                    <p className="text-sm text-white">{user.city || "Not provided"}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm text-white">{user.address || "Not provided"}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Revenue Split</p>
                    <p className="text-sm text-white">{user.split}%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#1A1E24] p-4 rounded-md md:col-span-2">
                <h4 className="text-sm font-medium text-gray-400 mb-3">About</h4>
                
                <div>
                  <p className="text-xs text-gray-500">Introduction</p>
                  <p className="text-sm text-white mt-1">{user.introduction || "No introduction provided."}</p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'social' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#1A1E24] p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Social Media Links</h4>
                
                <div className="space-y-4">
                  {user.youtubeLink && (
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </div>
                      <a 
                        href={user.youtubeLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 text-sm hover:underline break-all"
                      >
                        {user.youtubeLink}
                      </a>
                    </div>
                  )}
                  
                  {user.facebookLink && (
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </div>
                      <a 
                        href={user.facebookLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 text-sm hover:underline break-all"
                      >
                        {user.facebookLink}
                      </a>
                    </div>
                  )}
                  
                  {user.instagramLink && (
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </div>
                      <a 
                        href={user.instagramLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 text-sm hover:underline break-all"
                      >
                        {user.instagramLink}
                      </a>
                    </div>
                  )}
                  
                  {user.tiktokLink && (
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.525 0.0498047C13.834 0.0298047 15.134 0.0398047 16.434 0.0298047C16.514 1.55981 17.064 3.12981 18.184 4.20981C19.304 5.31981 20.884 5.82981 22.424 5.99981V9.99981C20.984 9.94981 19.534 9.64981 18.224 9.02981C17.654 8.76981 17.124 8.43981 16.604 8.09981C16.594 11.0198 16.614 13.9398 16.584 16.8498C16.504 18.2498 16.044 19.6398 15.234 20.7898C13.924 22.7098 11.654 23.9598 9.32396 23.9998C7.89396 24.0798 6.46396 23.6898 5.24396 22.9698C3.22396 21.7798 1.80396 19.5998 1.59396 17.2198C1.57396 16.7198 1.56396 16.2198 1.58396 15.7298C1.76396 13.8298 2.70396 12.0098 4.16396 10.7698C5.82396 9.32981 8.14396 8.63981 10.314 9.04981C10.334 10.5298 10.274 12.0098 10.274 13.4898C9.28396 13.1698 8.13396 13.2598 7.25396 13.8598C6.62396 14.2698 6.14396 14.8998 5.89396 15.6098C5.68396 16.1198 5.74396 16.6798 5.75396 17.2198C5.99396 18.8598 7.57396 20.2398 9.25396 20.0898C10.374 20.0798 11.444 19.4298 12.024 18.4798C12.214 18.1498 12.424 17.8098 12.434 17.4198C12.534 15.6298 12.494 13.8398 12.504 12.0598C12.514 8.02981 12.494 3.99981 12.524 0.0498047L12.525 0.0498047Z"/>
                        </svg>
                      </div>
                      <a 
                        href={user.tiktokLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 text-sm hover:underline break-all"
                      >
                        {user.tiktokLink}
                      </a>
                    </div>
                  )}
                  
                  {!user.youtubeLink && !user.facebookLink && !user.instagramLink && !user.tiktokLink && (
                    <p className="text-gray-400 text-sm">No social media links provided.</p>
                  )}
                </div>
              </div>
              
              <div className="bg-[#1A1E24] p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Distribution Information</h4>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Current Distributor</p>
                    <p className="text-sm text-white">{user.currentDistributor || "Not provided"}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Distributor Number</p>
                    <p className="text-sm text-white">{user.distributorNumber || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'verification' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#1A1E24] p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Identity Verification</h4>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Document Type</p>
                    <p className="text-sm text-white">{capitalize(user.documentType) || "Not provided"}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Document ID</p>
                    <p className="text-sm text-white">{user.documentId || "Not provided"}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Verification Status</p>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isApproved ? "bg-green-900/50 text-green-200 border border-green-700" : "bg-yellow-900/50 text-yellow-200 border border-yellow-700"
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                      {user.isApproved ? "Approved" : "Pending Approval"}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#1A1E24] p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Account Information</h4>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">User ID</p>
                    <p className="text-sm text-white font-mono">{user._id}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="text-sm text-white">{capitalize(user.role)}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Account Status</p>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive ? "bg-green-900/50 text-green-200 border border-green-700" : "bg-red-900/50 text-red-200 border border-red-700"
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                      {user.isActive ? "Active" : "Inactive"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'activity' && (
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-[#1A1E24] p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Account Timeline</h4>
                
                <div className="space-y-6">
                  <div className="relative pl-6 pb-6 border-l border-gray-700">
                    <div className="absolute left-0 top-0 w-2 h-2 -ml-1 rounded-full bg-green-500"></div>
                    <p className="text-xs text-gray-500">Account Created</p>
                    <p className="text-sm text-white">{formatDate(user.createdAt)}</p>
                  </div>
                  
                  {user.lastLogin && (
                    <div className="relative pl-6 pb-6 border-l border-gray-700">
                      <div className="absolute left-0 top-0 w-2 h-2 -ml-1 rounded-full bg-blue-500"></div>
                      <p className="text-xs text-gray-500">Last Login</p>
                      <p className="text-sm text-white">{formatDate(user.lastLogin)}</p>
                    </div>
                  )}
                  
                  <div className="relative pl-6">
                    <div className="absolute left-0 top-0 w-2 h-2 -ml-1 rounded-full bg-purple-500"></div>
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="text-sm text-white">{formatDate(user.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer with close button */}
        <div className="p-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 