"use client";

import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import Image from "next/image";
import { getUserData } from "@/services/authService";
import { getCurrentUser, updateCurrentUser, changePassword } from "@/services/userService";
import Toast from "@/components/Common/Toast";

// Remove custom toast animation
type TabType = "basic" | "edit" | "password";

// Define tabs
const profileTabs = [
  { id: "basic", name: "Basic Info" },
  { id: "edit", name: "Edit Info" },
  { id: "password", name: "Change Password" }
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>("basic");
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state for edit tab
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: '',
    country: '',
    city: '',
    address: '',
    currentDistributor: '',
    distributorNumber: '',
    introduction: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Password state for password change tab
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    general: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // First set data from localStorage for quick rendering
        const localUserData = getUserData();
        console.log('User data from localStorage:', localUserData);
        if (localUserData) {
          setUserData(localUserData);
          // Initialize form data with local storage data
          initializeFormData(localUserData);
        }
        
        // Then fetch complete user data from API
        console.log('Fetching user data from API...');
        const apiUserData = await getCurrentUser();
        console.log('User data from API:', apiUserData);
        if (apiUserData) {
          setUserData(apiUserData);
          // Initialize form data with API data
          initializeFormData(apiUserData);
          
          // Also update localStorage with latest data
          localStorage.setItem('userData', JSON.stringify(apiUserData));
          console.log('Updated localStorage with API data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  // Initialize form data with user data
  const initializeFormData = (user: any) => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      birthDate: user?.birthDate || '',
      gender: user?.gender || '',
      country: user?.country || '',
      city: user?.city || '',
      address: user?.address || '',
      currentDistributor: user?.currentDistributor || '',
      distributorNumber: user?.distributorNumber || '',
      introduction: user?.introduction || ''
    });
  };

  // Handle tab change
  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    // Reset toast status
    setShowToast(false);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset status
    setShowToast(false);
    setIsSubmitting(true);
    
    try {
      // Create a copy of formData excluding name and email (which can't be changed)
      const { name, email, ...updateData } = formData;
      
      // Update user profile with just the fields that can be changed
      const updatedUser = await updateCurrentUser(updateData);
      
      // Update local state
      setUserData(updatedUser);
      
      // Update localStorage
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      
      // Show success message
      setToastMessage('Profile updated successfully!');
      setToastType('success');
      setShowToast(true);
      
      // Switch to basic info tab after successful update
      setTimeout(() => {
        setActiveTab('basic');
      }, 2000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setToastMessage(error.message || 'Failed to update profile. Please try again.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password input changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when typing
    if (passwordErrors[name as keyof typeof passwordErrors]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field: 'currentPassword' | 'newPassword' | 'confirmPassword') => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Validate password form
  const validatePasswordForm = () => {
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      general: ''
    };
    let isValid = true;

    if (!passwordData.currentPassword.trim()) {
      errors.currentPassword = 'Current password is required';
      isValid = false;
    }

    if (!passwordData.newPassword.trim()) {
      errors.newPassword = 'New password is required';
      isValid = false;
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (!passwordData.confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your new password';
      isValid = false;
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setPasswordErrors(errors);
    return isValid;
  };

  // Handle password form submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form inputs
    if (!validatePasswordForm()) {
      return;
    }
    
    setIsChangingPassword(true);
    setPasswordErrors({ currentPassword: '', newPassword: '', confirmPassword: '', general: '' });
    
    try {
      // Call API to change password
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Show success message
      setToastMessage('Password changed successfully!');
      setToastType('success');
      setShowToast(true);
      
      // Refresh user data to get updated lastPasswordChanged field
      const updatedUser = await getCurrentUser();
      setUserData(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      
      // Switch to basic info tab after successful update
      setTimeout(() => {
        setActiveTab('basic');
      }, 2000);
    } catch (error: any) {
      console.error('Error changing password:', error);
      
      // Handle specific API errors
      if (error.response && error.response.status === 401) {
        setPasswordErrors(prev => ({
          ...prev,
          currentPassword: 'Current password is incorrect. Please try again.'
        }));
        
        // Focus on the current password field
        const currentPasswordField = document.querySelector('input[name="currentPassword"]') as HTMLInputElement;
        if (currentPasswordField) {
          currentPasswordField.focus();
        }
      } else {
        setPasswordErrors(prev => ({
          ...prev,
          general: error.message || 'Failed to change password. Please try again.'
        }));
        
        setToastMessage(error.message || 'Failed to change password. Please try again.');
        setToastType('error');
        setShowToast(true);
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Format date function
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Compact date format for tags
  const formatCompactDate = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  // Function to get the correct role text to display
  const getRoleDisplay = (role: string) => {
    switch(role) {
      case 'superadmin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'labelowner':
        return 'Label Owner';
      case 'artist':
        return 'Artist';
      default:
        return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Profile" subtitle="Loading profile information...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Profile" subtitle="View and edit your profile information">
      {/* Show Toast notifications */}
      {showToast && (
        <Toast 
          message={toastMessage} 
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
      
      <div className="px-4 sm:px-0">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-6">
          {/* User Image */}
          <div className="relative">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden">
              <img 
                src={userData?.profileImage || "/placeholder.png"} 
                alt={userData?.name ? `${userData.name}'s Avatar` : 'User Avatar'}
                className="h-full w-full object-cover"
                onError={(e) => {
                  // Fallback image in case profile image fails to load
                  (e.target as HTMLImageElement).src = "/placeholder.png";
                }}
              />
            </div>
          </div>

          {/* User Info */}
          <div className="flex flex-col items-center md:items-start">
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">{userData?.name || 'User'}</h1>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center md:justify-start mb-4 sm:mb-6">
              <span className="bg-purple-900 text-white px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm flex items-center">
                <span className="mr-1">★</span> {getRoleDisplay(userData?.role || '')}
              </span>
              {userData?.lastPasswordChanged && (
                <span className="bg-gray-800 text-gray-300 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="hidden xs:inline">Password changed:</span> {formatCompactDate(userData.lastPasswordChanged)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-1">
          {profileTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as TabType)}
              className={`px-3 sm:px-5 py-2 rounded-full whitespace-nowrap text-sm ${
                activeTab === tab.id ? 'bg-[#A365FF] text-white' : 'bg-[#1A1E24] text-gray-300 hover:bg-[#252A33]'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "basic" && (
          <div className="bg-[#161A1F] rounded-lg p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Basic Information</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <div className="mb-4">
                  <h4 className="text-sm text-gray-400 mb-1">Full Name</h4>
                  <p className="text-white">{userData?.name || 'Not provided'}</p>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm text-gray-400 mb-1">Email Address</h4>
                  <p className="text-white">{userData?.email || 'Not provided'}</p>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm text-gray-400 mb-1">Birth Date</h4>
                  <p className="text-white">{userData?.birthDate || 'Not provided'}</p>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm text-gray-400 mb-1">Gender</h4>
                  <p className="text-white">{userData?.gender || 'Not provided'}</p>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm text-gray-400 mb-1">Phone Number</h4>
                  <p className="text-white">{userData?.phone || 'Not provided'}</p>
                </div>
              </div>
              
              <div>
                <div className="mb-4">
                  <h4 className="text-sm text-gray-400 mb-1">Country</h4>
                  <p className="text-white">{userData?.country || 'Not provided'}</p>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm text-gray-400 mb-1">City</h4>
                  <p className="text-white">{userData?.city || 'Not provided'}</p>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm text-gray-400 mb-1">Address</h4>
                  <p className="text-white">{userData?.address || 'Not provided'}</p>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm text-gray-400 mb-1">Current Distributor</h4>
                  <p className="text-white">{userData?.currentDistributor || 'Not provided'}</p>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm text-gray-400 mb-1">Number of Distributors</h4>
                  <p className="text-white">{userData?.distributorNumber || 'Not provided'}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4">Introduction</h3>
              <p className="text-white bg-[#1D2229] p-4 rounded-md">
                {userData?.introduction || 'No introduction provided.'}
              </p>
            </div>
          </div>
        )}

        {activeTab === "edit" && (
          <div className="rounded-lg p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-white text-md mb-3 sm:mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      readOnly
                      className="w-full p-3 bg-[#232830] border border-gray-700 rounded-md text-gray-400 cursor-not-allowed"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Name cannot be changed</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      readOnly
                      className="w-full p-3 bg-[#232830] border border-gray-700 rounded-md text-gray-400 cursor-not-allowed"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Email address cannot be changed</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Birth Date</label>
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-[#161A1F] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-[#161A1F] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Your phone number"
                      className="w-full p-3 bg-[#161A1F] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-white text-md mb-4">Location Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Country</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-[#161A1F] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                    >
                      <option value="">Select Country</option>
                      <option value="Bangladesh">Bangladesh</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="India">India</option>
                      <option value="Japan">Japan</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Italy">Italy</option>
                      <option value="Brazil">Brazil</option>
                      <option value="Mexico">Mexico</option>
                      <option value="China">China</option>
                      <option value="Russia">Russia</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Your city"
                      className="w-full p-3 bg-[#161A1F] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-400 mb-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Your address"
                      className="w-full p-3 bg-[#161A1F] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-white text-md mb-4">Distribution Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Current Distributor</label>
                    <input
                      type="text"
                      name="currentDistributor"
                      value={formData.currentDistributor}
                      onChange={handleInputChange}
                      placeholder="Your current distributor"
                      className="w-full p-3 bg-[#161A1F] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Number of Distributors</label>
                    <input
                      type="text"
                      name="distributorNumber"
                      value={formData.distributorNumber}
                      onChange={handleInputChange}
                      placeholder="Number of distributors"
                      className="w-full p-3 bg-[#161A1F] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Introduction</label>
                <textarea
                  name="introduction"
                  value={formData.introduction}
                  onChange={handleInputChange}
                  placeholder="Write a brief introduction about yourself"
                  className="w-full p-3 bg-[#161A1F] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px]"
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className={`w-full sm:w-auto bg-[#A365FF] hover:bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md transition-colors ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {activeTab === "password" && (
          <div className="bg-[#1A1E24] rounded-lg p-4 sm:p-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-3 sm:space-y-4">
              <h3 className="text-white text-md mb-3 sm:mb-4">Change Password</h3>
              
              {/* General error message */}
              {passwordErrors.general && (
                <div className="bg-red-900/30 border border-red-800 p-4 rounded-md text-red-300 text-sm flex items-center">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{passwordErrors.general}</span>
                </div>
              )}
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={passwordVisibility.currentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter your current password"
                    className={`w-full p-3 bg-[#161A1F] border ${passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-700'} rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('currentPassword')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  >
                    {passwordVisibility.currentPassword ? (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={passwordVisibility.newPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter your new password"
                    className={`w-full p-3 bg-[#161A1F] border ${passwordErrors.newPassword ? 'border-red-500' : 'border-gray-700'} rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('newPassword')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  >
                    {passwordVisibility.newPassword ? (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {passwordErrors.newPassword}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters</p>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={passwordVisibility.confirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm your new password"
                    className={`w-full p-3 bg-[#161A1F] border ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-700'} rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  >
                    {passwordVisibility.confirmPassword ? (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {passwordErrors.confirmPassword}
                  </p>
                )}
              </div>
              
              <button 
                type="submit"
                disabled={isChangingPassword}
                className={`w-full sm:w-auto bg-[#A365FF] hover:bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md transition-colors mt-3 sm:mt-4 ${
                  isChangingPassword ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isChangingPassword ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 