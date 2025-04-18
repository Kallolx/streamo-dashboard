"use client";

import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import Link from "next/link";

// Toast component for notifications
const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-md shadow-lg ${
        type === "success" ? "bg-green-600" : "bg-red-600"
      }`}
    >
      <div className="flex-shrink-0 mr-3">
        {type === "success" ? (
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
      <div className="text-white">{message}</div>
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-300">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

export default function AddStorePage() {
  // State for form data
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [storeTitle, setStoreTitle] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("Active");
  const [storeLink, setStoreLink] = useState("");
  const [colorCode, setColorCode] = useState("");
  const [videosOnly, setVideosOnly] = useState(false);

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogo(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle logo upload click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

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

  // Success messages
  const successMessages = [
    "Store created successfully!",
    "Store added to your distribution channels.",
  ];

  // Error messages
  const errorMessages = [
    "Failed to create store. Please try again.",
    "Server error. Your store couldn't be processed.",
  ];

  // Handle form submission
  const handleSubmit = () => {
    // Validate form
    if (!storeTitle) {
      setToast({
        show: true,
        message: "Please enter a store title",
        type: "error",
      });
      return;
    }

    // Randomly decide if it's a success or failure (70% success, 30% failure)
    const isSuccess = Math.random() > 0.3;

    // Get a random message based on the result
    const messages = isSuccess ? successMessages : errorMessages;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    // Show the toast
    setToast({
      show: true,
      message: randomMessage,
      type: isSuccess ? "success" : "error",
    });
  };

  // Close toast
  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  return (
    <DashboardLayout title="Add Store" subtitle="Add a new distribution store">
      <div className="space-y-8">
        {/* Upload Logo Section */}
        <div className="rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Upload Logo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side - Upload */}
            <div className="flex flex-col items-start">
              <div
                onClick={handleUploadClick}
                className="w-full max-w-sm h-64 bg-[#1D2229] border-2 border-dashed border-gray-600 rounded-md flex items-center justify-center overflow-hidden cursor-pointer hover:border-purple-500 transition-colors"
              >
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6">
                    <svg
                      className="w-12 h-12 text-gray-500 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm text-gray-400">
                      Click to browse or drag and drop image file
                    </p>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />

            </div>

            {/* Right side - Tips */}
            <div>
              <h3 className="text-lg font-medium mb-3">Tips</h3>
              <p className="text-sm text-gray-300 mb-3">
                Please ensure your store logo is square, less than 10 MB and a minimum of 500px wide (1000px width is recommended for best results).
              </p>
              <p className="text-sm text-gray-300 mb-1">
                Your store logo cannot contain:
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    Any text other than the store name
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    Web URLs, social media handles/icons, or contact information
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Sexually explicit imagery</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    Third-party logos or trademarks without express written consent from the trademark holder
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

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
        <div className="bg-[#161A1F] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Terms and Conditions</h2>

          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms1"
                  type="checkbox"
                  className="h-4 w-4 bg-[#1D2229] border-gray-600 rounded text-purple-600 focus:ring-0 focus:ring-offset-0"
                />
              </div>
              <label htmlFor="terms1" className="ml-3 text-sm text-gray-300">
                I confirm that I have the necessary rights to add this store to the distribution platform.
              </label>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms2"
                  type="checkbox"
                  className="h-4 w-4 bg-[#1D2229] border-gray-600 rounded text-purple-600 focus:ring-0 focus:ring-offset-0"
                />
              </div>
              <label htmlFor="terms2" className="ml-3 text-sm text-gray-300">
                I agree to the platform's distribution terms and understand the store's terms of use.
              </label>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms3"
                  type="checkbox"
                  className="h-4 w-4 bg-[#1D2229] border-gray-600 rounded text-purple-600 focus:ring-0 focus:ring-offset-0"
                />
              </div>
              <label htmlFor="terms3" className="ml-3 text-sm text-gray-300">
                I consent to the processing of my store information according to the Privacy Policy.
              </label>
            </div>
          </div>
        </div>

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
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Create Store
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