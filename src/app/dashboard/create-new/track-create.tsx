'use client';

import { useState, useRef, useEffect } from 'react';
import { getAllStores, Store } from '@/services/storeService';
import { createTrack } from '@/services/trackService';
import { useRouter } from 'next/navigation';

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

export default function TrackCreate() {
  const router = useRouter();
  
  // State for form data
  const [coverArt, setCoverArt] = useState<File | null>(null);
  const [coverArtPreview, setCoverArtPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Add audio file state
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  
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
  
  // Fetch stores from API on component mount
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoadingStores(true);
        const response = await getAllStores({ status: 'Active' });
        if (response && response.success) {
          setStores(response.data);
          console.log('Stores loaded:', response.data);
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
  
  // Handle audio file upload
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      setAudioFileName(file.name);
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
    "Track created successfully!",
    "Track created and ready for distribution."
  ];

  // Error messages
  const errorMessages = [
    "Failed to add track. Please try again.",
    "Server error. Your track couldn't be added.",
  ];

  // Handle form submission
  const handleSubmit = async () => {
    // Create FormData object for file uploads
    const formData = new FormData();
    
    // Add files
    if (coverArt) {
      formData.append('coverArt', coverArt);
    } else {
      setToast({
        show: true,
        message: "Cover art is required",
        type: "error"
      });
      return;
    }
    
    if (audioFile) {
      formData.append('audioFile', audioFile);
    } else {
      setToast({
        show: true,
        message: "Audio file is required",
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
    
    // Add basic track info - we'll handle title as required
    // but will auto-generate artist if missing to avoid validation errors
    if (!title) {
      setToast({
        show: true,
        message: "Please enter a track title",
        type: "error"
      });
      return;
    }
    formData.append('title', title);
    
    // For artist field, use a default if not provided
    const artistValue = artist || 'Unknown Artist';
    formData.append('artist', artistValue);
    
    // Add other track data
    formData.append('releaseType', releaseType);
    formData.append('format', format);
    formData.append('genre', genre);
    formData.append('language', language);
    formData.append('label', label);
    formData.append('recordingYear', recordingYear);
    formData.append('releaseDate', releaseDate);
    formData.append('isrc', isrc);
    formData.append('upc', upc);
    formData.append('type', type);
    formData.append('version', version);
    formData.append('contentRating', contentRating);
    formData.append('lyrics', lyrics);
    
    // Add contributors
    formData.append('copyrightHeader', copyrightHeader);
    formData.append('composer', composer);
    formData.append('musicProducer', musicProducer);
    formData.append('singer', singer);
    formData.append('featuredArtist', featureArtist);
    formData.append('lyricist', lyricist);
    formData.append('publisher', publisher);
    formData.append('musicDirector', musicDirector);
    
    // Add pricing
    formData.append('pricing', pricing);
    
    // Set the initial status to "submitted" instead of default "draft"
    formData.append('status', 'submitted');
    
    // Add stores as an array
    selectedStores.forEach(store => {
      formData.append('stores', store);
    });
    
    try {
      setIsSubmitting(true);
      const response = await createTrack(formData);
      
      setToast({
        show: true,
        message: "Track created successfully!",
        type: "success"
      });
      
      // Clear the form data
      setCoverArt(null);
      setCoverArtPreview(null);
      setAudioFile(null);
      setAudioFileName(null);
      setSelectedStores([]);
      
      // Reset form fields
      setTitle('');
      setArtist('');
      setReleaseType('');
      setFormat('');
      setGenre('');
      setLanguage('');
      setLabel('');
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
      
      // Redirect to the dedicated tracks page
      setTimeout(() => {
        router.push('/dashboard/catalogue?tab=tracks');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating track:', error);
      setToast({
        show: true,
        message: "Failed to create track. Please try again.",
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
    <div className="space-y-8">
      {/* Upload Cover Art Section */}
      <div className="rounded-lg">
        <h2 className="text-xl font-semibold mb-4 ">Upload Cover Art</h2>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left side - Upload */}
          <div className="flex flex-col items-start">
            <div 
              onClick={() => fileInputRef.current?.click()} 
              className="w-full max-w-sm h-100 bg-[#1D2229] border-2 border-dashed border-gray-600 rounded-md flex items-center justify-center overflow-hidden cursor-pointer hover:border-purple-500 transition-colors"
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
          <div className="rounded-md">
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

      {/* Upload Audio File Section */}
      <div className="rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Upload Audio File</h2>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left side - Upload */}
          <div className="flex flex-col items-start">
            <div 
              onClick={() => audioInputRef.current?.click()} 
              className="w-full max-w-sm h-28 bg-[#1D2229] border-2 border-dashed border-gray-600 rounded-md flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors"
            >
              {audioFileName ? (
                <div className="flex items-center px-4">
                  <svg className="w-8 h-8 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  <div>
                    <p className="text-sm text-white font-medium">{audioFileName}</p>
                    <p className="text-xs text-gray-400">Click to replace</p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6">
                  <svg className="w-10 h-10 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  <p className="text-sm text-gray-400">Click to browse or drag and drop audio file</p>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={audioInputRef}
              accept="audio/*"
              onChange={handleAudioUpload}
              className="hidden"
            />
          </div>
          
          {/* Right side - Tips */}
          <div className="">
            <h3 className="text-lg font-medium mb-3">Audio Tips</h3>
            <p className="text-sm text-gray-300 mb-3">Please ensure your audio file is in a high-quality format (WAV or FLAC preferred for masters, MP3 at least 320kbps).</p>
            <p className="text-sm text-gray-300 mb-1">Requirements:</p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>File size under 100MB</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Accepted formats: WAV, FLAC, MP3, AAC, AIFF</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No silence at beginning or end</span>
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
                placeholder="Track Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div>
              <input
                type="text"
                id="artist"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Artist Name"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
              />
            </div>
            
            <div>
              <input
                type="text"
                id="label"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
            
            <div>
              <select
                id="recordingYear"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Release Date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
              />
            </div>
            
            <div>
              <select
                id="selectGenre"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="ISRC"
                value={isrc}
                onChange={(e) => setIsrc(e.target.value)}
              />
            </div>
            
            <div>
              <select
                id="type"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
          <div className="space-y-4">
            <div>
              <select
                id="releaseType"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={releaseType}
                onChange={(e) => setReleaseType(e.target.value)}
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
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="UPC"
                value={upc}
                onChange={(e) => setUpc(e.target.value)}
              />
            </div>
            
            <div>
              <select
                id="contentRating"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={contentRating}
                onChange={(e) => setContentRating(e.target.value)}
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
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      {/* Add Contributors Section */}
      <div className="rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Add Contributors</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left side - 4 fields (removed remixer artist) */}
          <div className="space-y-4">
            <div>
              <input
                type="text"
                id="copyrightHeader"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Copyright Header"
                value={copyrightHeader}
                onChange={(e) => setCopyrightHeader(e.target.value)}
              />
            </div>
            
            <div>
              <input
                type="text"
                id="composer"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Composer"
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
              />
            </div>
            
            <div>
              <input
                type="text"
                id="musicProducer"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Music Producer"
                value={musicProducer}
                onChange={(e) => setMusicProducer(e.target.value)}
              />
            </div>
            
            <div>
              <input
                type="text"
                id="singer"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Singer"
                value={singer}
                onChange={(e) => setSinger(e.target.value)}
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
                placeholder="Feature Artist"
                value={featureArtist}
                onChange={(e) => setFeatureArtist(e.target.value)}
              />
            </div>
            <div>
              <input
                type="text"
                id="lyricist"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Lyricist"
                value={lyricist}
                onChange={(e) => setLyricist(e.target.value)}
              />
            </div>
            
            <div>
              <input
                type="text"
                id="publisher"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Publisher"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
              />
            </div>
            
            <div>
              <input
                type="text"
                id="musicDirector"
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Music Director"
                value={musicDirector}
                onChange={(e) => setMusicDirector(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Select Store Section */}
      <div className="rounded-lg p-6 bg-[#161A1F]">
        <h2 className="text-xl font-semibold mb-4">Distribution Platforms</h2>
        <p className="text-gray-400 mb-6">
          Select where you want your music to be available. You can choose multiple platforms.
        </p>

        {loadingStores ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* Dynamic store rendering from API */}
            {stores.length > 0 ? (
              stores.map((store) => (
                <div 
                  key={store._id}
                  onClick={() => handleStoreSelection(store._id || "")}
                  className={`relative rounded-xl p-3 transition-all cursor-pointer ${
                    selectedStores.includes(store._id || "") 
                      ? "bg-purple-800 border-2 border-purple-500 shadow-lg transform scale-[1.02]" 
                      : "bg-[#1D2229] border-2 border-[#2A2F36] hover:border-purple-400 hover:bg-[#24292F]"
                  }`}
                >
                  {selectedStores.includes(store._id || "") && (
                    <div className="absolute -top-2 -right-2 bg-purple-500 rounded-full p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div>
                    {store.icon && (
                      <div 
                        className="w-12 h-12 mb-2 rounded bg-cover bg-center"
                        style={{ 
                          backgroundImage: `url(${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${store.icon})` 
                        }}
                      />
                    )}
                    <span className="text-center text-gray-300 font-medium">{store.name}</span>
                  </div>
                </div>
              ))
            ) : (
              // Fallback to hardcoded platforms if API fails or returns empty
              <div className="col-span-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <div 
                  onClick={() => handleStoreSelection("spotify")}
                  className={`relative rounded-xl p-3 transition-all cursor-pointer ${
                    selectedStores.includes("spotify") 
                      ? "bg-purple-800 border-2 border-purple-500 shadow-lg transform scale-[1.02]" 
                      : "bg-[#1D2229] border-2 border-[#2A2F36] hover:border-purple-400 hover:bg-[#24292F]"
                  }`}
                >
                  {selectedStores.includes("spotify") && (
                    <div className="absolute -top-2 -right-2 bg-purple-500 rounded-full p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="flex flex-col items-center">
                    <img src="/icons/sp.svg" alt="Spotify" className="w-12 h-12 mb-2" />
                    <span className="text-center text-gray-300 font-medium">Spotify</span>
                  </div>
                </div>
                
                <div 
                  onClick={() => handleStoreSelection("apple")}
                  className={`relative rounded-xl p-3 transition-all cursor-pointer ${
                    selectedStores.includes("apple") 
                      ? "bg-purple-800 border-2 border-purple-500 shadow-lg transform scale-[1.02]" 
                      : "bg-[#1D2229] border-2 border-[#2A2F36] hover:border-purple-400 hover:bg-[#24292F]"
                  }`}
                >
                  {selectedStores.includes("apple") && (
                    <div className="absolute -top-2 -right-2 bg-purple-500 rounded-full p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="flex flex-col items-center">
                    <img src="/icons/ap.svg" alt="Apple Music" className="w-12 h-12 mb-2" />
                    <span className="text-center text-gray-300 font-medium">Apple Music</span>
                  </div>
                </div>
                
                <div 
                  onClick={() => handleStoreSelection("youtube")}
                  className={`relative rounded-xl p-3 transition-all cursor-pointer ${
                    selectedStores.includes("youtube") 
                      ? "bg-purple-800 border-2 border-purple-500 shadow-lg transform scale-[1.02]" 
                      : "bg-[#1D2229] border-2 border-[#2A2F36] hover:border-purple-400 hover:bg-[#24292F]"
                  }`}
                >
                  {selectedStores.includes("youtube") && (
                    <div className="absolute -top-2 -right-2 bg-purple-500 rounded-full p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="flex flex-col items-center">
                    <img src="/icons/yt.svg" alt="YouTube Music" className="w-12 h-12 mb-2" />
                    <span className="text-center text-gray-300 font-medium">YouTube Music</span>
                  </div>
                </div>
                
                <div 
                  onClick={() => handleStoreSelection("soundcloud")}
                  className={`relative rounded-xl p-3 transition-all cursor-pointer ${
                    selectedStores.includes("soundcloud") 
                      ? "bg-purple-800 border-2 border-purple-500 shadow-lg transform scale-[1.02]" 
                      : "bg-[#1D2229] border-2 border-[#2A2F36] hover:border-purple-400 hover:bg-[#24292F]"
                  }`}
                >
                  {selectedStores.includes("soundcloud") && (
                    <div className="absolute -top-2 -right-2 bg-purple-500 rounded-full p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="flex flex-col items-center">
                    <img src="/icons/sc.svg" alt="SoundCloud" className="w-12 h-12 mb-2" />
                    <span className="text-center text-gray-300 font-medium">SoundCloud</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Selected platforms summary */}
        {selectedStores.length > 0 && (
          <div className="mt-6 bg-[#1A1D24] border border-[#2A2F36] rounded-lg p-4">
            <div className="flex items-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-medium text-gray-300">Selected platforms ({selectedStores.length})</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedStores.map(storeId => {
                // Try to find store name if it's an ID
                const store = stores.find(s => s._id === storeId);
                const storeName = store?.name || storeId;
                const storeColor = store?.color || '#6b46c1';
                
                return (
                  <div 
                    key={storeId}
                    className="px-2 py-1 rounded-full text-xs flex items-center"
                    style={{ backgroundColor: storeColor + '33', color: storeColor }}
                  >
                    {storeName}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStoreSelection(storeId);
                      }}
                      className="ml-1 rounded-full hover:bg-white hover:bg-opacity-20 p-0.5"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Track Pricing Section */}
      <div className="rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">Track Pricing</h2>
        <p className="text-gray-400 mb-4">How much would you like to charge for each track?</p>
        
        <div className="mb-4">
          <select
            id="trackPricing"
            className="w-full md:w-1/2 bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
              <span>Creating...</span>
            </>
          ) : (
            "Create Track"
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