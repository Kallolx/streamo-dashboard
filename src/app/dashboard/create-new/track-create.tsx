'use client';

import { useState, useRef, useEffect } from 'react';
import { getAllStores, Store } from '@/services/storeService';
import { createTrack } from '@/services/trackService';
import { useRouter } from 'next/navigation';
import { getUserData } from '@/services/authService';

// Toast component for notifications
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className={`fixed top-4 right-4 left-4 md:left-auto z-50 flex items-center p-3 md:p-4 rounded-md shadow-lg ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`}>
      <div className="flex-shrink-0 mr-2 md:mr-3">
        {type === 'success' ? (
          <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <div className="text-white text-sm md:text-base flex-1 pr-2">{message}</div>
      <button 
        onClick={onClose}
        className="text-white hover:text-gray-300 ml-1 md:ml-4"
      >
        <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default function TrackCreate() {
  const router = useRouter();
  
  // State for form data
  const [coverArt, setCoverArt] = useState<File | null>(null);
  const [coverArtPreview, setCoverArtPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Add video file state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  
  // Track list state
  const [tracks, setTracks] = useState([
    { id: 1, title: 'The Overview', artistName: 'Steven Wilson' },
    { id: 2, title: 'The Overview', artistName: 'Linkin Park' },
    { id: 3, title: 'The Overview', artistName: 'Steven Wilson' },
    { id: 4, title: 'The Overview', artistName: 'Linkin Park' },
    { id: 5, title: 'The Overview', artistName: 'Steven Wilson' }
  ]);
  
  // State for selected stores
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  // State for available stores from the API
  const [stores, setStores] = useState<Store[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);
  
  // Add form state
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [releaseType, setReleaseType] = useState('');
  const [format, setFormat] = useState('');
  const [genre, setGenre] = useState('');
  const [language, setLanguage] = useState('');
  const [label, setLabel] = useState('');
  const [recordingYear, setRecordingYear] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [isrc, setIsrc] = useState('');
  const [upc, setUpc] = useState('');
  const [type, setType] = useState('');
  const [version, setVersion] = useState('');
  const [contentRating, setContentRating] = useState('');
  const [lyrics, setLyrics] = useState('');
  
  // Contributors state
  const [copyrightHeader, setCopyrightHeader] = useState('');
  const [composer, setComposer] = useState('');
  const [musicProducer, setMusicProducer] = useState('');
  const [singer, setSinger] = useState('');
  const [featureArtist, setFeatureArtist] = useState('');
  const [lyricist, setLyricist] = useState('');
  const [publisher, setPublisher] = useState('');
  const [musicDirector, setMusicDirector] = useState('');
  
  // Pricing state
  const [pricing, setPricing] = useState('');
  
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Auto-fill label from user data on mount
  useEffect(() => {
    const userData = getUserData();
    if (userData && userData.name) {
      // Extract stage name from the full name (format: "Full Name (Stage Name)")
      const match = userData.name.match(/\((.*?)\)/);
      const stageName = match ? match[1] : "";
      setLabel(stageName);
    }
  }, []);
  
  // Fetch stores from API on component mount
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoadingStores(true);
        const response = await getAllStores({ status: 'Active' });
        if (response && response.success) {
          // Filter to only include video-compatible stores
          const videoStores = response.data.filter((store: Store) => !store.hasOwnProperty('videosOnly') || store.videosOnly);
          setStores(videoStores);
          console.log('Video stores loaded:', videoStores);
        } else {
          console.error('Invalid response format:', response);
          setStores([]);
        }
      } catch (error) {
        console.error('Error fetching stores:', error);
        setToast({
          show: true,
          message: "Failed to load distribution platforms",
          type: "error",
        });
        setStores([]);
      } finally {
        setLoadingStores(false);
      }
    };

    fetchStores();
  }, []);
  
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
      
      // Create video preview URL
      const videoURL = URL.createObjectURL(file);
      setVideoPreview(videoURL);
    }
  };
  
  // Function to play/pause video preview
  const toggleVideoPlay = () => {
    if (videoPlayerRef.current) {
      if (videoPlayerRef.current.paused) {
        videoPlayerRef.current.play();
      } else {
        videoPlayerRef.current.pause();
      }
    }
  };
  
  // Handle track deletion
  const handleDeleteTrack = (id: number) => {
    setTracks(tracks.filter(track => track.id !== id));
  };

  // Handle store selection
  const handleStoreSelection = (storeId: string) => {
    let newSelectedStores;
    if (selectedStores.includes(storeId)) {
      newSelectedStores = selectedStores.filter((s) => s !== storeId);
    } else {
      newSelectedStores = [...selectedStores, storeId];
    }
    
    // Set the state with the new array
    setSelectedStores(newSelectedStores);
    
    // Debug logging
    console.log(`Store ${storeId} ${selectedStores.includes(storeId) ? 'removed from' : 'added to'} selection.`);
    console.log('Current selectedStores:', newSelectedStores);
  };

  // Toast state
  const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Success messages
  const successMessages = [
    "Video created successfully!",
    "Video created and ready for distribution."
  ];

  // Error messages
  const errorMessages = [
    "Failed to add video. Please try again.",
    "Server error. Your video couldn't be added.",
  ];

  // Handle form submission
  const handleSubmit = async () => {
    try {
      console.log('Starting track submission...');
      
      // Validate required fields first
      if (!title || title.trim() === '') {
        setToast({
          show: true,
          message: "Please enter a title",
          type: "error"
        });
        return;
      }
      
      if (!artist || artist.trim() === '') {
        setToast({
          show: true,
          message: "Please enter an artist name",
          type: "error"
        });
        return;
      }
      
      // Validate files
      if (!coverArt) {
        setToast({
          show: true,
          message: "Cover art is required",
          type: "error"
        });
        return;
      }
      
      if (!videoFile) {
        setToast({
          show: true,
          message: "Video file is required",
          type: "error"
        });
        return;
      }
      
      if (selectedStores.length === 0) {
        setToast({
          show: true,
          message: "Please select at least one distribution platform",
          type: "error"
        });
        return;
      }

      // Create a simplified FormData object
      const formData = new FormData();
      
      // Add required fields first
      formData.append('title', title.trim());
      formData.append('artist', artist.trim());
      
      // Add files
      formData.append('coverArt', coverArt);
      formData.append('videoFile', videoFile);
      
      // Add other essential fields with defaults
      formData.append('releaseType', releaseType || 'single');
      formData.append('format', format || 'digital');
      
      // Only append non-empty fields to reduce request size
      if (genre) formData.append('genre', genre);
      if (language) formData.append('language', language);
      if (label) formData.append('label', label);
      if (recordingYear) formData.append('recordingYear', recordingYear);
      if (releaseDate) formData.append('releaseDate', releaseDate);
      if (isrc) formData.append('isrc', isrc);
      if (upc) formData.append('upc', upc);
      if (type) formData.append('type', type);
      if (version) formData.append('version', version);
      if (contentRating) formData.append('contentRating', contentRating);
      if (lyrics) formData.append('lyrics', lyrics);
      
      // Add only non-empty contributor fields
      if (copyrightHeader) formData.append('copyrightHeader', copyrightHeader);
      if (composer) formData.append('composer', composer);
      if (musicProducer) formData.append('musicProducer', musicProducer);
      if (singer) formData.append('singer', singer);
      if (featureArtist) formData.append('featuredArtist', featureArtist);
      if (lyricist) formData.append('lyricist', lyricist);
      if (publisher) formData.append('publisher', publisher);
      if (musicDirector) formData.append('musicDirector', musicDirector);
      
      // Add pricing if set
      if (pricing) formData.append('pricing', pricing);
      
      // Set status
      formData.append('status', 'submitted');
      
      // Add stores as separate entries
      selectedStores.forEach(store => {
        formData.append('stores', store);
      });
      
      setIsSubmitting(true);
      console.log('Sending form data to server...');
      
      const response = await createTrack(formData);
      console.log('Track created successfully:', response);
      
      setToast({
        show: true,
        message: "Video created successfully!",
        type: "success"
      });
      
      // Reset form
      setCoverArt(null);
      setCoverArtPreview(null);
      setVideoFile(null);
      setVideoFileName(null);
      
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
        setVideoPreview(null);
      }
      
      setSelectedStores([]);
      
      // Reset form fields
      setTitle('');
      setArtist('');
      setReleaseType('');
      setFormat('');
      setGenre('');
      setLanguage('');
      setRecordingYear('');
      setReleaseDate('');
      setIsrc('');
      setUpc('');
      setType('');
      setVersion('');
      setContentRating('');
      setLyrics('');
      setCopyrightHeader('');
      setComposer('');
      setMusicProducer('');
      setSinger('');
      setFeatureArtist('');
      setLyricist('');
      setPublisher('');
      setMusicDirector('');
      setPricing('');
      
      // Reset all form input elements
      const formElements = document.querySelectorAll('input:not([type="file"]), select, textarea');
      formElements.forEach((element: any) => {
        if (element.type === 'checkbox') {
          element.checked = false;
        } else {
          element.value = '';
        }
      });
      
      // Redirect to videos page
      setTimeout(() => {
        router.push('/dashboard/catalogue?tab=videos');
      }, 2000);
      
    } catch (error: any) {
      console.error('Error creating track:', error);
      
      // Extract error message for better user feedback
      let errorMessage = "Failed to create track. Please try again.";
      if (error.response?.data?.error) {
        errorMessage = typeof error.response.data.error === 'string' 
          ? error.response.data.error 
          : JSON.stringify(error.response.data.error);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setToast({
        show: true,
        message: errorMessage,
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close toast
  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  return (
    <div className="space-y-6 md:space-y-8 px-2 sm:px-0">
      {/* Upload Cover Art Section */}
      <div className="rounded-lg p-3 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4">Upload Cover Art</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Left side - Upload */}
          <div className="flex justify-center md:justify-start">
            <div 
              onClick={() => fileInputRef.current?.click()} 
              className="w-full max-w-[320px] md:max-w-[320px] h-[180px] md:h-[180px] bg-[#1D2229] border-2 border-dashed border-gray-600 rounded-md flex items-center justify-center overflow-hidden cursor-pointer hover:border-purple-500 transition-colors"
            >
              {coverArtPreview ? (
                <img 
                  src={coverArtPreview} 
                  alt="Cover art preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-3 md:p-4">
                  <svg className="w-10 h-10 md:w-12 md:h-12 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs text-gray-400">Click or drag to upload 1280x720 thumbnail</p>
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
          <div className="rounded-md mt-2 md:mt-0">
            <h3 className="text-base md:text-lg font-medium mb-2 md:mb-3">Tips</h3>
            <p className="text-xs md:text-sm text-gray-300 mb-2 md:mb-3">Please ensure your cover art is square, less than 10 MB and a minimum of 1400px wide (3000px width is recommended for best results).</p>
            <p className="text-xs md:text-sm text-gray-300 mb-1">Your cover art cannot contain:</p>
            <ul className="space-y-1 md:space-y-2 text-xs md:text-sm text-gray-300">
              <li className="flex items-start">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-red-500 mr-1 md:mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>Any text other than the release title and/or artist name.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-red-500 mr-1 md:mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>Web URLs, social media handles/icons, or contact information.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-red-500 mr-1 md:mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>Sexually explicit imagery.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-red-500 mr-1 md:mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>Third-party logos or trademarks without express written consent from the trademark holder.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload Video File Section */}
      <div className="rounded-lg p-3 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4">Upload Video File</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Left side - Upload */}
          <div className="flex justify-center md:justify-start">
            <div 
              onClick={() => videoInputRef.current?.click()} 
              className="w-full max-w-[250px] md:max-w-sm h-[150px] md:h-[180px] bg-[#1D2229] border-2 border-dashed border-gray-600 rounded-md flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors overflow-hidden"
            >
              {videoPreview ? (
                <div className="w-full h-full relative">
                  <video 
                    ref={videoPlayerRef}
                    src={videoPreview} 
                    className="w-full h-full object-contain"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVideoPlay();
                    }}
                    controls={false}
                  />
                  <div 
                    className="absolute inset-0 flex items-center justify-center hover:bg-black hover:bg-opacity-30 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVideoPlay();
                    }}
                  >
                    <div className="bg-black bg-opacity-50 rounded-full p-2">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 px-2 py-1 text-white text-xs">
                    {videoFileName}
                    <button 
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 text-white hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (videoPreview) {
                          URL.revokeObjectURL(videoPreview);
                        }
                        setVideoFile(null);
                        setVideoFileName(null);
                        setVideoPreview(null);
                      }}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : videoFileName ? (
                <div className="flex items-center px-3 md:px-4">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-purple-500 mr-2 md:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <div className="overflow-hidden">
                    <p className="text-xs md:text-sm text-white font-medium truncate max-w-[150px] md:max-w-[200px]">{videoFileName}</p>
                    <p className="text-xs text-gray-400">Click to replace</p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-3 md:p-4">
                  <svg className="w-10 h-10 md:w-14 md:h-14 text-gray-500 mx-auto mb-2 md:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs md:text-sm text-gray-400">Click to browse or drag and drop video file</p>
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
          <div className="mt-2 md:mt-0">
            <h3 className="text-base md:text-lg font-medium mb-2 md:mb-3">Video Tips</h3>
            <p className="text-xs md:text-sm text-gray-300 mb-2 md:mb-3">Please ensure your video file is in a high-quality format (MP4 preferred for streaming, MOV for editing).</p>
            <p className="text-xs md:text-sm text-gray-300 mb-1">Requirements:</p>
            <ul className="space-y-1 md:space-y-2 text-xs md:text-sm text-gray-300">
              <li className="flex items-start">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mr-1 md:mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>File size under 100MB</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mr-1 md:mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Accepted formats: MP4, MOV</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mr-1 md:mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Resolution: 1280×720 (HD) or higher</span>
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mr-1 md:mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Aspect ratio: 16:9 recommended</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add Metadata Section */}
      <div className="rounded-lg p-3 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4">Add Metadata</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
          {/* Left side */}
          <div className="space-y-3 md:space-y-4">
            <div>
              <input
                type="text"
                id="releaseTitle"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-3 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Video Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div>
              <input
                type="text"
                id="artist"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-3 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Artist Name"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
              />
            </div>
            
            <div>
              <input
                type="text"
                id="label"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-3 py-2 text-sm md:text-base text-white opacity-75 cursor-not-allowed"
                placeholder="Your label name will appear here"
                value={label}
                readOnly
              />
            </div>
            
            <div>
              <select
                id="recordingYear"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-3 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={recordingYear}
                onChange={(e) => setRecordingYear(e.target.value)}
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
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-3 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Release Date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
              />
            </div>
            
            <div>
              <select
                id="selectGenre"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-3 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
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
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-3 py-2 text-sm md:text-base text-white opacity-75 cursor-not-allowed focus:outline-none"
                placeholder="ISRC (assigned by admin)"
                value=""
                readOnly
                tabIndex={-1}
                aria-readonly="true"
              />
              <p className="text-xs text-gray-500 mt-1">This will be assigned by the admin after submission.</p>
            </div>
            
            <div>
              <select
                id="type"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-3 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={type}
                onChange={(e) => setType(e.target.value)}
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
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-3 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
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
          <div className="space-y-3 md:space-y-4 mt-3 md:mt-0">
            <div>
              <select
                id="releaseType"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-3 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={releaseType}
                onChange={(e) => setReleaseType(e.target.value)}
              >
                <option value="">Video</option>
              </select>
            </div>
            
            <div>
              <select
                id="format"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-3 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
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
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-3 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
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
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-3 py-2 text-sm md:text-base text-white opacity-75 cursor-not-allowed focus:outline-none"
                placeholder="UPC (assigned by admin)"
                value=""
                readOnly
                tabIndex={-1}
                aria-readonly="true"
              />
              <p className="text-xs text-gray-500 mt-1">This will be assigned by the admin after submission.</p>
            </div>
            
            <div>
              <select
                id="contentRating"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-3 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={contentRating}
                onChange={(e) => setContentRating(e.target.value)}
              >
                <option value="">Content Rating</option>
                <option value="clean">Clean</option>
                <option value="explicit">Explicit</option>
              </select>
            </div>
            
            <div>
              <textarea
                id="lyrics"
                rows={6}
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-3 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="Type Lyrics"
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      {/* Add Contributors Section */}
      <div className="rounded-lg p-3 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4">Add Contributors</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
          {/* Left side - 4 fields (removed remixer artist) */}
          <div className="space-y-3 md:space-y-4">
            <div>
              <input
                type="text"
                id="singer"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-3 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Artist"
                value={singer}
                onChange={(e) => setSinger(e.target.value)}
              />
            </div>
            
            <div>
              <input
                type="text"
                id="featureArtist"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-3 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Feature Artist"
                value={featureArtist}
                onChange={(e) => setFeatureArtist(e.target.value)}
              />
            </div>
            
            <div>
              <input
                type="text"
                id="composer"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-3 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Composer"
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
              />
            </div>
            
            <div>
              <input
                type="text"
                id="lyricist"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-3 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Lyricist"
                value={lyricist}
                onChange={(e) => setLyricist(e.target.value)}
              />
            </div>
          </div>
          
          {/* Right side - 4 fields */}
          <div className="space-y-3 md:space-y-4 mt-3 md:mt-0">
            <div>
              <input
                type="text"
                id="musicProducer"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-3 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Music Producer"
                value={musicProducer}
                onChange={(e) => setMusicProducer(e.target.value)}
              />
            </div>
            
            <div>
              <input
                type="text"
                id="publisher"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-3 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Publisher"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
              />
            </div>
            
            <div>
              <input
                type="text"
                id="musicDirector"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-3 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Music Director"
                value={musicDirector}
                onChange={(e) => setMusicDirector(e.target.value)}
              />
            </div>
            
            <div>
              <input
                type="text"
                id="copyrightHeader"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-3 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Copyright Header"
                value={copyrightHeader}
                onChange={(e) => setCopyrightHeader(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Select Store Section */}
      <div className="rounded-lg p-3 md:p-6 bg-[#161A1F]">
        <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4">Distribution Platforms</h2>
        <p className="text-xs md:text-sm text-gray-400 mb-3 md:mb-6">
          Select where you want your video to be available. You can choose multiple platforms.
        </p>

        {loadingStores ? (
          <div className="flex justify-center my-4 md:my-8">
            <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {/* Selected Platforms Summary */}
            {selectedStores.length > 0 && (
              <div className="mb-4 p-3 bg-[#1D2229] rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Selected Platforms: {selectedStores.length}</span>
                  <button 
                    onClick={() => setSelectedStores([])}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
            
            {/* Compact Grid View of Stores */}
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {/* Dynamic store rendering from API */}
              {stores.length > 0 ? (
                stores.map((store) => (
                  <div 
                    key={store._id}
                    onClick={() => handleStoreSelection(store._id || "")}
                    className={`relative rounded-md p-2 transition-all cursor-pointer ${
                      selectedStores.includes(store._id || "") 
                        ? "bg-purple-800 border border-purple-500 shadow-md" 
                        : "bg-[#1D2229] border border-[#2A2F36] hover:border-purple-400 hover:bg-[#24292F]"
                    }`}
                  >
                    {selectedStores.includes(store._id || "") && (
                      <div className="absolute -top-1 -right-1 bg-purple-500 rounded-full p-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-2">
                        {store.icon ? (
                          <img 
                            src={store.icon.startsWith('http') 
                              ? store.icon 
                              : `${process.env.NEXT_PUBLIC_API_URL 
                                  ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') 
                                  : window.location.origin}${store.icon.startsWith('/') ? '' : '/'}${store.icon}`
                            }
                            alt={store.name}
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              // Replace with first letter icon
                              const parent = target.parentElement;
                              if (parent) {
                                // Remove the image
                                parent.removeChild(target);
                                // Create letter placeholder
                                const letterDiv = document.createElement('div');
                                letterDiv.className = "w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center";
                                letterDiv.innerHTML = `<span class="text-xs text-white font-medium">${store.name.charAt(0)}</span>`;
                                // Add to parent
                                parent.appendChild(letterDiv);
                              }
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-medium">{store.name.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-300 truncate flex-1">{store.name}</span>
                    </div>
                  </div>
                ))
              ) : (
                // Fallback to YouTube if API returns empty
                <div className="col-span-full flex flex-col items-center py-6">
                  <div className="bg-gray-800 rounded-full p-3 mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm">No video platforms available right now.</p>
                  <p className="text-gray-500 text-xs mt-1">Please try again later or contact support.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Track Pricing Section */}
      <div className="rounded-lg p-3 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold mb-2">Track Pricing</h2>
        <p className="text-xs md:text-sm text-gray-400 mb-3 md:mb-4">How much would you like to charge for each video?</p>
        
        <div className="mb-3 md:mb-4">
          <select
            id="trackPricing"
            className="w-full md:w-1/2 bg-[#1D2229] border border-gray-700 rounded-md px-3 py-2 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={pricing}
            onChange={(e) => setPricing(e.target.value)}
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
      <div className="rounded-lg p-3 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4">Terms and Conditions</h2>
        
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5 mt-0.5">
              <input
                id="terms1"
                type="checkbox"
                className="h-4 w-4 bg-[#1D2229] border-gray-600 rounded text-purple-600 focus:ring-0 focus:ring-offset-0"
              />
            </div>
            <label htmlFor="terms1" className="ml-2 md:ml-3 text-xs md:text-sm text-gray-300">
              I confirm that I am the rightful owner or have obtained all necessary rights, licenses, and permissions to distribute the submitted content.
            </label>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5 mt-0.5">
              <input
                id="terms2"
                type="checkbox"
                className="h-4 w-4 bg-[#1D2229] border-gray-600 rounded text-purple-600 focus:ring-0 focus:ring-offset-0"
              />
            </div>
            <label htmlFor="terms2" className="ml-2 md:ml-3 text-xs md:text-sm text-gray-300">
              I agree to the platform's distribution terms, including content guidelines, usage policies, and the royalty payment structure.
            </label>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5 mt-0.5">
              <input
                id="terms3"
                type="checkbox"
                className="h-4 w-4 bg-[#1D2229] border-gray-600 rounded text-purple-600 focus:ring-0 focus:ring-offset-0"
              />
            </div>
            <label htmlFor="terms3" className="ml-2 md:ml-3 text-xs md:text-sm text-gray-300">
              I give my consent for the collection, storage, and processing of my personal and professional data in accordance with the platform's Privacy Policy.
            </label>
          </div>
        </div>
      </div>
      
      {/* Submit Button */}
      <div className="flex justify-between md:justify-end space-x-2 md:space-x-4 mt-4 md:mt-6">
        <button
          type="button"
          className="flex-1 md:flex-initial px-3 py-2 md:px-4 md:py-2 border border-gray-600 text-gray-400 text-sm md:text-base rounded-md hover:bg-gray-700 transition-colors"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 md:flex-initial px-3 py-2 md:px-4 md:py-2 bg-purple-600 text-white text-sm md:text-base rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <div className="w-3 h-3 md:w-4 md:h-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-1 md:mr-2"></div>
              <span>Creating...</span>
            </>
          ) : (
            "Create Video"
          )}
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