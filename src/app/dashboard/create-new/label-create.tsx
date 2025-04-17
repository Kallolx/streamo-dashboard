'use client';

import { useState, useRef, useEffect } from 'react';

// Toast component for notifications
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-md shadow-lg ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`}>
      <div className="flex-shrink-0 mr-3">
        {type === 'success' ? (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <div className="text-white">{message}</div>
      <button 
        onClick={onClose}
        className="ml-4 text-white hover:text-gray-300"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default function VideoCreate() {
  // State for form data
  const [coverArt, setCoverArt] = useState<File | null>(null);
  const [coverArtPreview, setCoverArtPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  

  
  // State for social links
  const [socialLinks, setSocialLinks] = useState({
    spotify: { url: '', linked: false },
    appleMusic: { url: '', linked: false },
    soundcloud: { url: '', linked: false },
    youtube: { url: '', linked: false }
  });
  
  // Handle cover art upload
  const handleCoverArtUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverArt(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverArtPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  


  // Toast state
  const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Success messages
  const successMessages = [
    "Artist added successfully!",
    "Artist added and ready for distribution."
  ];

  // Error messages
  const errorMessages = [
    "Failed to add artist. Please try again.",
    "Server error. Your artist couldn't be added.",
  ];

  // Handle social link updates
  const handleSocialLinkChange = (platform: string, value: string) => {
    setSocialLinks(prev => ({
      ...prev,
      [platform]: { ...prev[platform as keyof typeof prev], url: value }
    }));
  };
  
  // Handle social link button click
  const handleLinkProfile = (platform: string) => {
    if (socialLinks[platform as keyof typeof socialLinks].url.trim() !== '') {
      setSocialLinks(prev => ({
        ...prev,
        [platform]: { 
          ...prev[platform as keyof typeof prev], 
          linked: !prev[platform as keyof typeof prev].linked 
        }
      }));
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    // Randomly decide if it's a success or failure (70% success, 30% failure)
    const isSuccess = Math.random() > 0.3;
    
    // Get a random message based on the result
    const messages = isSuccess ? successMessages : errorMessages;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    // Show the toast
    setToast({
      show: true,
      message: randomMessage,
      type: isSuccess ? 'success' : 'error'
    });
  };

  // Close toast
  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  return (
    <div className="space-y-8">
      {/* Upload Cover Art Section */}
      <div className="rounded-lg">
        <h2 className="text-xl font-semibold mb-4 ">Upload Label Image</h2>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left side - Upload */}
          <div className="flex flex-col items-start">
            <div 
              onClick={() => fileInputRef.current?.click()} 
              className="w-full max-w-sm h-64 bg-[#1D2229] border-2 border-dashed border-gray-600 rounded-md flex items-center justify-center overflow-hidden cursor-pointer hover:border-purple-500 transition-colors"
            >
              {coverArtPreview ? (
                <img 
                  src={coverArtPreview} 
                  alt="Cover art preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-6">
                  <svg className="w-12 h-12 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-400">Click to browse or drag and drop image file</p>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*"
              onChange={handleCoverArtUpload}
              className="hidden"
            />
          </div>
          
          {/* Right side - Tips */}
          <div className="">
            <h3 className="text-lg font-medium mb-3">Tips</h3>
            <p className="text-sm text-gray-300 mb-3">Please ensure your cover art is square, less than 10 MB and a minimum of 1400px wide (3000px width is recommended for best results).</p>
            <p className="text-sm text-gray-300 mb-1">Your cover art cannot contain:</p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>Any text other than the release title and/or artist name.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>Web URLs, social media handles/icons, or contact information.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>Sexually explicit imagery.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>Third-party logos or trademarks without express written consent from the trademark holder.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add Artist Section */}
      <div className="rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Add Label Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left side - 5 fields */}
          <div className="space-y-4">
            <div>
              <input
                type="text"
                id="labelName"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Label Name"
              />
            </div>
            
            <div>
              <textarea
                id="labelDescription"
                className="w-full h-40 bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Label Description"
                rows={6}
              ></textarea>
            </div>                                            
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          className="px-4 py-2 border border-gray-600 text-gray-400 rounded-md hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          Create Label
        </button>
      </div>
      
      {/* Toast notification */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={closeToast} 
        />
      )}
    </div>
  );
} 