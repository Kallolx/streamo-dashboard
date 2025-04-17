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
  
  // Add video file state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // Track list state
  const [tracks, setTracks] = useState([
    { id: 1, title: 'The Overview', artistName: 'Steven Wilson' },
    { id: 2, title: 'The Overview', artistName: 'Linkin Park' },
    { id: 3, title: 'The Overview', artistName: 'Steven Wilson' },
    { id: 4, title: 'The Overview', artistName: 'Linkin Park' },
    { id: 5, title: 'The Overview', artistName: 'Steven Wilson' }
  ]);
  
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
  
  // Handle video file upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      setVideoFileName(file.name);
    }
  };
  
  // Handle track deletion
  const handleDeleteTrack = (id: number) => {
    setTracks(tracks.filter(track => track.id !== id));
  };

  // State for selected stores
  const [selectedStores, setSelectedStores] = useState<string[]>([]);

  // Handle store selection
  const handleStoreSelection = (store: string) => {
    if (selectedStores.includes(store)) {
      setSelectedStores(selectedStores.filter(s => s !== store));
    } else {
      setSelectedStores([...selectedStores, store]);
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
    "Release created successfully!",
    "Release created and ready for distribution."
  ];

  // Error messages
  const errorMessages = [
    "Failed to create release. Please try again.",
    "Server error. Your release couldn't be processed.",
  ];

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
        <h2 className="text-xl font-semibold mb-4 ">Upload Cover Art</h2>
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

      {/* Upload Video File Section */}
      <div className="rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Upload Video File</h2>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left side - Upload */}
          <div className="flex flex-col items-start">
            <div 
              onClick={() => videoInputRef.current?.click()} 
              className="w-full max-w-sm h-64 bg-[#1D2229] border-2 border-dashed border-gray-600 rounded-md flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors"
            >
              {videoFileName ? (
                <div className="flex items-center px-4">
                  <svg className="w-8 h-8 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-white font-medium">{videoFileName}</p>
                    <p className="text-xs text-gray-400">Click to replace</p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6">
                  <svg className="w-10 h-10 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-400">Click to browse or drag and drop video file</p>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={videoInputRef}
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
            />
          </div>
          
          {/* Right side - Tips */}
          <div className="">
            <h3 className="text-lg font-medium mb-3">Video Tips</h3>
            <p className="text-sm text-gray-300 mb-3">Please ensure your video file is in a high-quality format (MP4, MOV or AVI preferred).</p>
            <p className="text-sm text-gray-300 mb-1">Requirements:</p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>File size under 2GB</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Accepted formats: MP4, MOV, AVI, WebM</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Recommended resolution: 1080p or higher</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add Metadata Section */}
      <div className="rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Add Metadata</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left side */}
          <div className="space-y-4">
            <div>
              <input
                type="text"
                id="releaseTitle"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Release Title"
              />
            </div>
            
            <div>
              <input
                type="text"
                id="label"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Label"
              />
            </div>
            
            <div>
              <select
                id="recordingYear"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Recording Year</option>
                {[...Array(30)].map((_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>
            
            <div>
              <input
                type="date"
                id="releaseDate"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Release Date"
              />
            </div>
            
            <div>
              <select
                id="selectGenre"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Genre</option>
                <option value="pop">Pop</option>
                <option value="rock">Rock</option>
                <option value="hiphop">Hip Hop</option>
                <option value="electronic">Electronic</option>
                <option value="rnb">R&B</option>
                <option value="jazz">Jazz</option>
                <option value="classical">Classical</option>
              </select>
            </div>
            
            <div>
              <input
                type="text"
                id="isrc"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="ISRC"
              />
            </div>
            
            <div>
              <select
                id="type"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Type</option>
                <option value="original">Original</option>
                <option value="remix">Remix</option>
                <option value="cover">Cover</option>
                <option value="live">Live</option>
              </select>
            </div>
            
            <div>
              <select
                id="version"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Version</option>
                <option value="original">Original</option>
                <option value="extended">Extended</option>
                <option value="radio">Radio Edit</option>
                <option value="acoustic">Acoustic</option>
                <option value="instrumental">Instrumental</option>
              </select>
            </div>
          </div>
          
          {/* Right side */}
          <div className="space-y-4">
            <div>
              <select
                id="releaseType"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Release Type</option>
                <option value="single">Single</option>
                <option value="album">Album</option>
                <option value="ep">EP</option>
              </select>
            </div>
            
            <div>
              <select
                id="format"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Format</option>
                <option value="digital">Digital</option>
                <option value="cd">CD</option>
                <option value="vinyl">Vinyl</option>
                <option value="cassette">Cassette</option>
              </select>
            </div>
            
            <div>
              <select
                id="selectLanguage"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Language</option>
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
                <option value="japanese">Japanese</option>
                <option value="korean">Korean</option>
                <option value="chinese">Chinese</option>
              </select>
            </div>
            
            <div>
              <input
                type="text"
                id="upc"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="UPC"
              />
            </div>
            
            <div>
              <select
                id="contentRating"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Content Rating</option>
                <option value="clean">Clean</option>
                <option value="explicit">Explicit</option>
                <option value="instrumental">Instrumental</option>
              </select>
            </div>
            
            <div>
              <textarea
                id="lyrics"
                rows={6}
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="Type Lyrics"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      {/* Add Contributors Section */}
      <div className="rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Add Contributors</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left side - 5 fields */}
          <div className="space-y-4">
            <div>
              <input
                type="text"
                id="copyrightHeader"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Copyright Header (optional)"
              />
            </div>
            
            <div>
              <input
                type="text"
                id="remixerArtist"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Remixer Artist (optional)"
              />
            </div>
            
            <div>
              <input
                type="text"
                id="composer"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Composer (optional)"
              />
            </div>
            
            <div>
              <input
                type="text"
                id="musicProducer"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Music Producer (optional)"
              />
            </div>
            
            <div>
              <input
                type="text"
                id="singer"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Singer (optional)"
              />
            </div>
            
            
          </div>
          
          {/* Right side - 4 fields */}
          <div className="space-y-4">
          <div>
              <input
                type="text"
                id="featureArtist"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Feature Artist (optional)"
              />
            </div>
            <div>
              <input
                type="text"
                id="lyricist"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Lyricist (optional)"
              />
            </div>
            
            <div>
              <input
                type="text"
                id="publisher"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Publisher (optional)"
              />
            </div>
            
            <div>
              <input
                type="text"
                id="musicDirector"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Music Director (optional)"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Select Store Section */}
      <div className="rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Select Stores</h2>
        <p className="text-gray-400 mb-4">Choose the platforms where you want to distribute your release.</p>
        
        <div className="flex flex-wrap gap-4">
          {/* Spotify */}
          <div className="group">
            <label className={`flex flex-col items-center bg-[#1D2229] hover:bg-[#2a313b] border ${selectedStores.includes('spotify') ? 'border-purple-500 ring-2 ring-purple-500/50' : 'border-gray-700'} rounded-lg p-4 cursor-pointer transition-all`}>
              <input 
                type="checkbox" 
                className="absolute opacity-0" 
                checked={selectedStores.includes('spotify')}
                onChange={() => handleStoreSelection('spotify')}
              />
              <img src="/icons/sp.svg" alt="Spotify" className="w-12 h-12 mb-2" />
              <span className={`${selectedStores.includes('spotify') ? 'text-purple-400' : 'text-white group-hover:text-purple-300'} transition-colors`}>Spotify</span>
            </label>
          </div>
          
          {/* Apple Music */}
          <div className="group">
            <label className={`flex flex-col items-center bg-[#1D2229] hover:bg-[#2a313b] border ${selectedStores.includes('apple') ? 'border-purple-500 ring-2 ring-purple-500/50' : 'border-gray-700'} rounded-lg p-4 cursor-pointer transition-all`}>
              <input 
                type="checkbox" 
                className="absolute opacity-0"
                checked={selectedStores.includes('apple')}
                onChange={() => handleStoreSelection('apple')}
              />
              <img src="/icons/ap.svg" alt="Apple Music" className="w-12 h-12 mb-2" />
              <span className={`${selectedStores.includes('apple') ? 'text-purple-400' : 'text-white group-hover:text-purple-300'} transition-colors`}>Apple Music</span>
            </label>
          </div>
          
          {/* YouTube Music */}
          <div className="group">
            <label className={`flex flex-col items-center bg-[#1D2229] hover:bg-[#2a313b] border ${selectedStores.includes('youtube') ? 'border-purple-500 ring-2 ring-purple-500/50' : 'border-gray-700'} rounded-lg p-4 cursor-pointer transition-all`}>
              <input 
                type="checkbox" 
                className="absolute opacity-0"
                checked={selectedStores.includes('youtube')}
                onChange={() => handleStoreSelection('youtube')}
              />
              <img src="/icons/yt.svg" alt="YouTube Music" className="w-12 h-12 mb-2" />
              <span className={`${selectedStores.includes('youtube') ? 'text-purple-400' : 'text-white group-hover:text-purple-300'} transition-colors`}>YouTube Music</span>
            </label>
          </div>
          
          {/* SoundCloud */}
          <div className="group">
            <label className={`flex flex-col items-center bg-[#1D2229] hover:bg-[#2a313b] border ${selectedStores.includes('soundcloud') ? 'border-purple-500 ring-2 ring-purple-500/50' : 'border-gray-700'} rounded-lg p-4 cursor-pointer transition-all`}>
              <input 
                type="checkbox" 
                className="absolute opacity-0"
                checked={selectedStores.includes('soundcloud')}
                onChange={() => handleStoreSelection('soundcloud')}
              />
              <img src="/icons/sc.svg" alt="SoundCloud" className="w-12 h-12 mb-2" />
              <span className={`${selectedStores.includes('soundcloud') ? 'text-purple-400' : 'text-white group-hover:text-purple-300'} transition-colors`}>SoundCloud</span>
            </label>
          </div>
        </div>
      </div>

      {/* Track Pricing Section */}
      <div className="rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">Track Pricing</h2>
        <p className="text-gray-400 mb-4">How much would you like to charge for each track?</p>
        
        <div className="mb-4">
          <select
            id="trackPricing"
            className="w-full md:w-1/2 bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select pricing</option>
            <option value="free">Free</option>
            <option value="0.99">$0.99</option>
            <option value="1.29">$1.29</option>
            <option value="1.99">$1.99</option>
            <option value="2.99">$2.99</option>
            <option value="custom">Custom price</option>
          </select>
        </div>
      </div>

      {/* Terms and Conditions Section */}
      <div className="rounded-lg p-6">
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
              I confirm that I own or have licensed the necessary rights to distribute this content.
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
              I agree to the platform's distribution terms and understand the royalty payment structure.
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
              I consent to the processing of my personal information according to the Privacy Policy.
            </label>
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
          Create Release
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