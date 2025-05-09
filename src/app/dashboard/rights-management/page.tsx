"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { Shield } from "@phosphor-icons/react";
import Toast from "@/components/Common/Toast";

export default function RightsManagementPage() {
  const [formData, setFormData] = useState({
    requestType: "whitelist", // Default to whitelist
    platform: "youtube", // Default to YouTube
    email: "",
    labelName: "",
    linkUrl: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get the API base URL from environment or use default
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000/api';
      console.log('Using API URL:', apiBaseUrl);
      
      // Call backend API endpoint to send email
      const response = await fetch(`${apiBaseUrl}/rights/send-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.message || 'Failed to send request');
      }
      
      // Show success message
      setToastMessage('Your rights management request has been sent successfully!');
      setToastType('success');
      setShowToast(true);
      
      // Reset form
      setFormData({
        requestType: "whitelist",
        platform: "youtube",
        email: "",
        labelName: "",
        linkUrl: ""
      });
    } catch (error) {
      console.error('Error sending request:', error);
      setToastMessage('Failed to send your request. Please try again.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-2 flex items-center">
            
            Rights Management Request
          </h2>
          <p className="text-gray-400">
            Submit a request for content whitelisting or claim release. We'll process your request and get back to you via email.
          </p>
        </div>

        <div className="bg-[#1A1E24] rounded-lg p-6 border border-gray-700 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Request Type */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Request Type</label>
              <select
                name="requestType"
                value={formData.requestType}
                onChange={handleInputChange}
                className="w-full p-3 bg-[#161A1F] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="whitelist">Whitelist</option>
                <option value="claim-release">Claim Release</option>
              </select>
            </div>
            
            {/* Platform */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Platform</label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleInputChange}
                className="w-full p-3 bg-[#161A1F] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="youtube">YouTube</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            {/* Email Address */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                className="w-full p-3 bg-[#161A1F] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            {/* Label Name */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Label Name</label>
              <input
                type="text"
                name="labelName"
                value={formData.labelName}
                onChange={handleInputChange}
                placeholder="Enter your label name"
                className="w-full p-3 bg-[#161A1F] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            {/* YouTube Channel/Facebook Video Link */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                {formData.platform === 'youtube' 
                  ? 'Channel Link' 
                  : formData.platform === 'facebook' 
                    ? 'Facebook Video Link'
                    : formData.platform === 'instagram'
                      ? 'Instagram Post Link'
                      : 'Content Link'
                }
              </label>
              <input
                type="url"
                name="linkUrl"
                value={formData.linkUrl}
                onChange={handleInputChange}
                placeholder={`Enter ${formData.platform} link`}
                className="w-full p-3 bg-[#161A1F] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full sm:w-auto bg-[#A365FF] hover:bg-[#8A50E0] text-white px-6 py-3 rounded-md transition-colors ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="bg-[#1A1E24] rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-medium text-white mb-4">About Rights Management</h3>
          <div className="space-y-4 text-gray-400 text-sm">
            <p>
              <strong className="text-white">Whitelist:</strong> Request to whitelist your content to prevent automated copyright claims.
            </p>
            <p>
              <strong className="text-white">Claim Release:</strong> Request to release a copyright claim on your content that you believe was wrongfully claimed.
            </p>
            <p>
              Our team will review your request and respond via email within 2-3 business days. Please ensure all information provided is accurate.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 