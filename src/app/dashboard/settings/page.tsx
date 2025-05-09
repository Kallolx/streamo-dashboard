"use client";

import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { Gear, Upload, Images, PaintBucket, Globe, Bell } from "@phosphor-icons/react";
import Toast from "@/components/Common/Toast";
import { useLogo } from "@/contexts/LogoContext";
import { uploadLogo, getSettings, updateSettings } from "@/services/settingsService";

export default function SettingsPage() {
  const [userData, setUserData] = useState<any>(null);
  const [logo, setLogo] = useState<string>("/images/logo.png");
  const [siteName, setSiteName] = useState<string>("Music Dashboard");
  const [primaryColor, setPrimaryColor] = useState<string>("#A365FF");
  const [newLogo, setNewLogo] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setLogo: setGlobalLogo } = useLogo();

  // Check if user has superadmin role
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userDataString = localStorage.getItem('userData');
      if (userDataString) {
        const user = JSON.parse(userDataString);
        setUserData(user);
        
        // Redirect if not superadmin
        if (user.role !== 'superadmin') {
          window.location.href = '/dashboard';
        }
      } else {
        window.location.href = '/auth/login';
      }
    }
  }, []);

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getSettings();
        setLogo(settings.logo);
        setSiteName(settings.siteName);
        setPrimaryColor(settings.primaryColor);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.match('image.*')) {
        setToastMessage('Please select an image file (JPEG, PNG, SVG)');
        setToastType('error');
        setShowToast(true);
        return;
      }
      
      // Check file size (max 1MB)
      if (file.size > 1024 * 1024) {
        setToastMessage('Logo must be less than 1MB in size');
        setToastType('error');
        setShowToast(true);
        return;
      }
      
      setNewLogo(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle logo update
  const handleUpdateLogo = async () => {
    if (!newLogo || !previewLogo) return;
    
    setIsUploading(true);
    
    try {
      // Get the file from state
      console.log('Uploading logo file:', newLogo);
      
      // Upload logo to server
      const response = await uploadLogo(newLogo);
      console.log('Upload response:', response);
      
      // Update state with new logo URL
      const backendUrl = process.env.NODE_ENV === 'production' 
        ? 'https://streamo-backend.onrender.com' 
        : 'http://localhost:5000';
      
      const fullLogoUrl = `${backendUrl}${response.logo}`;
      console.log('New logo URL:', fullLogoUrl);
      
      // Update local state
      setLogo(fullLogoUrl);
      
      // Update global logo context
      setGlobalLogo(fullLogoUrl);
      
      // Reset file input and preview
      setPreviewLogo(null);
      setNewLogo(null);
      
      // Show success message
      setToastMessage('Logo updated successfully');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error uploading logo:', error);
      setToastMessage('Error uploading logo. Please try again.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle cancel logo update
  const handleCancelUpdate = () => {
    setPreviewLogo(null);
    setNewLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle general settings save
  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Update settings on server
      const response = await updateSettings({
        siteName,
        primaryColor
      });
      
      // Show success message
      setToastMessage('Settings saved successfully');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error saving settings:', error);
      setToastMessage('Error saving settings. Please try again.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Show Toast notifications */}
      {showToast && (
        <Toast 
          message={toastMessage} 
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}      
      <div className="">
        {/* Logo Settings Section */}
        <div className="bg-[#1A1E24] rounded-lg p-6 border border-gray-700 mb-8">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <Gear size={22} className="mr-3 text-[#A365FF]" />
              Dashboard Appearance
            </h3>
          </div>
          
          <p className="text-gray-400 mb-6 text-sm leading-relaxed">
            Customize the appearance of the dashboard. These changes will affect all users of the system.
          </p>
          
          {/* Logo Settings */}
          <div className="mb-8">
            <h4 className="text-white font-medium mb-4">Dashboard Logo</h4>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 bg-[#161A1F] rounded-lg border border-gray-700">
              <div className="bg-[#111319] border border-gray-700 rounded-lg p-4 flex items-center justify-center w-40 h-20">
                <img 
                  src={previewLogo || logo} 
                  alt="Dashboard Logo" 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-3">
                  Upload a new logo for the dashboard. For best results, use a PNG or SVG file with transparency.
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/svg+xml"
                    className="hidden"
                  />
                  
                  {!previewLogo ? (
                    <button
                      onClick={handleUploadClick}
                      className="bg-[#A365FF] hover:bg-[#8A50E0] text-white px-4 py-2 rounded-md transition-colors text-sm flex items-center"
                    >
                      <Upload size={16} className="mr-2" />
                      Upload New Logo
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleUpdateLogo}
                        disabled={isUploading}
                        className={`bg-[#A365FF] hover:bg-[#8A50E0] text-white px-4 py-2 rounded-md transition-colors text-sm flex items-center ${
                          isUploading ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {isUploading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Images size={16} className="mr-2" />
                            Save New Logo
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={handleCancelUpdate}
                        disabled={isUploading}
                        className="bg-transparent border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-4 py-2 rounded-md transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Theme Settings */}
          <div>
            <h4 className="text-white font-medium mb-4">Theme Settings</h4>
            
            <div className="p-4 bg-[#161A1F] rounded-lg border border-gray-700">
              <div className="flex flex-col space-y-4">
                {/* Site Name */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Dashboard Name
                  </label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full p-3 bg-[#111319] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#A365FF]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This name will appear in the browser tab and throughout the dashboard.
                  </p>
                </div>
                
                {/* Primary Color */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-32 p-2 bg-[#111319] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#A365FF]"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This color will be used for buttons, links, and other accent elements.
                  </p>
                </div>
                
                {/* Save Button */}
                <div className="pt-4 mt-4 border-t border-gray-700">
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className={`bg-[#A365FF] hover:bg-[#8A50E0] text-white px-6 py-3 rounded-md transition-colors flex items-center ${
                      isSaving ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving Changes...
                      </>
                    ) : (
                      'Save All Changes'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
