"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import Toast from "@/components/Common/Toast";
import { useRouter } from "next/navigation";
import { createStore } from "@/services/storeService";

// Terms component
const Terms = () => (
  <div className="bg-[#161A1F] rounded-lg p-6">
    <h2 className="text-xl font-semibold mb-4">Terms and Conditions</h2>
    <div className="text-sm text-gray-300 space-y-4">
      <p>
        By adding a store, you agree to the following terms and conditions:
      </p>
      <ol className="list-decimal pl-5 space-y-2">
        <li>You confirm that you have the rights to use the store's name and logo.</li>
        <li>You understand that this store will be available to all users of the platform.</li>
        <li>You agree to maintain accurate information about the store.</li>
      </ol>
    </div>
  </div>
);

export default function AddStorePage() {
  // State for form data
  const [storeTitle, setStoreTitle] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("Active");
  const [storeLink, setStoreLink] = useState("");
  const [colorCode, setColorCode] = useState("");
  const [videosOnly, setVideosOnly] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for store logo
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  // Toast state
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  // Close toast
  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  // Form validation
  const validateForm = () => {
    if (!storeTitle) {
      setToast({
        show: true,
        message: "Please enter a store title",
        type: "error",
      });
      return false;
    }

    if (!category) {
      setToast({
        show: true,
        message: "Please select a category",
        type: "error",
      });
      return false;
    }

    if (!colorCode) {
      setToast({
        show: true,
        message: "Please provide a color code",
        type: "error",
      });
      return false;
    }

    return true;
  };

  // Handle file upload click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Create FormData object to send
      const formData = new FormData();
      formData.append("name", storeTitle);
      formData.append("category", category);
      formData.append("status", status);
      formData.append("url", storeLink);
      formData.append("color", colorCode);
      formData.append("videosOnly", String(videosOnly));
      
      // Add store icon if one was uploaded
      if (fileInputRef.current?.files && fileInputRef.current.files[0]) {
        formData.append("icon", fileInputRef.current.files[0]);
      }

      // Call the API to create the store
      const response = await createStore(formData);

      // Show success message
      setToast({
        show: true,
        message: "Store created successfully!",
        type: "success",
      });

      // Redirect to stores page after 2 seconds
      setTimeout(() => {
        router.push("/dashboard/stores");
      }, 2000);
    } catch (error: any) {
      console.error("Error creating store:", error);
      
      let errorMessage = "Failed to create store. Please try again.";
      
      // Extract error message from response if available
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = Array.isArray(error.response.data.error)
          ? error.response.data.error.join(', ')
          : error.response.data.error;
      }
      
      setToast({
        show: true,
        message: errorMessage,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Add Store" subtitle="Add a new distribution store">
      <div className="space-y-8">
        {/* Store Details Section */}
        <div className="bg-[#161A1F] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Store Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  id="storeTitle"
                  className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Store Title"
                  value={storeTitle}
                  onChange={(e) => setStoreTitle(e.target.value)}
                />
              </div>

              <div>
                <select
                  id="category"
                  className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="" disabled>Category</option>
                  <option value="music">Music</option>
                  <option value="video">Video</option>
                  <option value="podcast">Podcast</option>
                </select>
              </div>

              <div>
                <select
                  id="status"
                  className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              
              {/* Store Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Store Logo
                </label>
                <div 
                  className="border-2 border-dashed border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500"
                  onClick={handleUploadClick}
                >
                  {uploadedLogo ? (
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full overflow-hidden mb-3">
                        <img
                          src={uploadedLogo}
                          alt="Logo preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-sm text-gray-400">Click to change</p>
                    </div>
                  ) : (
                    <>
                      {storeTitle ? (
                        <div className="w-20 h-20 mb-3 flex items-center justify-center text-white font-semibold rounded-full"
                          style={{ 
                            backgroundColor: colorCode || "#333333", 
                            fontSize: "30px"
                          }}
                        >
                          {storeTitle.charAt(0).toUpperCase()}
                        </div>
                      ) : (
                        <div className="bg-gray-700 rounded-lg p-3 mb-3">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2.67 18.95L7.6 15.64C8.39 15.11 9.53 15.17 10.24 15.78L10.57 16.07C11.35 16.74 12.61 16.74 13.39 16.07L17.55 12.5C18.33 11.83 19.59 11.83 20.37 12.5L22 13.9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                      <p className="text-sm text-gray-400 text-center">Upload store logo</p>
                      <p className="text-xs text-gray-500 text-center mt-1">Upload a square image for best results</p>
                    </>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  id="storeLink"
                  className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter Store Link"
                  value={storeLink}
                  onChange={(e) => setStoreLink(e.target.value)}
                />
              </div>

              <div>
                <input
                  type="text"
                  id="colorCode"
                  className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Color code (e.g. #FF0000)"
                  value={colorCode}
                  onChange={(e) => setColorCode(e.target.value)}
                />
              </div>

              <div className="flex items-center h-10">
                <input
                  id="videosOnly"
                  type="checkbox"
                  className="h-4 w-4 bg-[#1D2229] border-gray-600 rounded text-purple-600 focus:ring-0 focus:ring-offset-0"
                  checked={videosOnly}
                  onChange={(e) => setVideosOnly(e.target.checked)}
                />
                <label htmlFor="videosOnly" className="ml-3 text-white">
                  Videos Only
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Conditions Section */}
        <Terms />

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Link href="/dashboard/stores">
            <button
              type="button"
              className="px-6 py-2 border border-gray-600 text-gray-400 rounded-md hover:bg-gray-700 transition-colors"
            >
              Discard
            </button>
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2 bg-purple-600 text-white rounded-md transition-colors ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-purple-700"
            }`}
          >
            {isSubmitting ? "Creating..." : "Create Store"}
          </button>
        </div>

        {/* Toast notification */}
        {toast.show && (
          <Toast message={toast.message} type={toast.type} onClose={closeToast} />
        )}
      </div>
    </DashboardLayout>
  );
} 