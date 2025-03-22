"use client";

import { useState, useRef } from 'react';
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useRouter } from 'next/navigation';

export default function NewVideoPage() {
  const router = useRouter();
  const coverArtRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [coverArt, setCoverArt] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    artist: '',
    contentRating: '',
    type: '',
    version: '',
    upc: '',
    isrc: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Cover Art handling
  const handleCoverDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCover(true);
  };

  const handleCoverDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCover(false);
  };

  const handleCoverDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingCover) {
      setIsDraggingCover(true);
    }
  };

  const handleCoverDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCover(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setCoverArt(file);
      }
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCoverArt(e.target.files[0]);
    }
  };

  const handleCoverBrowseClick = () => {
    if (coverArtRef.current) {
      coverArtRef.current.click();
    }
  };

  // Video File handling
  const handleVideoDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingVideo(true);
  };

  const handleVideoDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingVideo(false);
  };

  const handleVideoDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingVideo) {
      setIsDraggingVideo(true);
    }
  };

  const handleVideoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingVideo(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
      }
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleVideoBrowseClick = () => {
    if (videoFileRef.current) {
      videoFileRef.current.click();
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/catalogue/videos');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the form submission
    console.log('Form data submitted:', formData);
    console.log('Cover art:', coverArt);
    console.log('Video file:', videoFile);
    
    // Navigate back to the videos page
    router.push('/dashboard/catalogue/videos');
  };

  return (
    <DashboardLayout
      title="Create New Video"
      subtitle="Add a new video to your catalogue"
      parentTitle="Videos"
      parentPath="/dashboard/catalogue/videos"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Upload Cover Art Section */}
        <div className="bg-[#161A1F] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Cover Art</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side - Upload area */}
            <div 
              className={`border-2 border-dashed rounded-md ${
                isDraggingCover 
                ? 'border-purple-500 bg-[#1D2229]' 
                : coverArt 
                  ? 'border-green-500 bg-[#1D2229]' 
                  : 'border-gray-700 bg-[#161A1F]'
              } flex items-center justify-center h-56`}
              onDragEnter={handleCoverDragEnter}
              onDragLeave={handleCoverDragLeave}
              onDragOver={handleCoverDragOver}
              onDrop={handleCoverDrop}
            >
              <div className="space-y-1 text-center">
                {coverArt ? (
                  <div className="relative">
                    <img 
                      src={URL.createObjectURL(coverArt)} 
                      alt="Cover Preview" 
                      className="mx-auto h-32 w-32 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => setCoverArt(null)}
                      className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 text-white"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-center">
                      <div className="relative cursor-pointer font-medium text-purple-500 hover:text-purple-400">
                        <span onClick={handleCoverBrowseClick}>Browse or drag and drop image file</span>
                        <input
                          id="cover-upload"
                          name="cover-upload"
                          type="file"
                          ref={coverArtRef}
                          className="sr-only"
                          accept="image/*"
                          onChange={handleCoverChange}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Right side - Guidelines */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Tips</p>
                <p className="text-xs text-gray-500">Use PNG or JPG files less than 10 MB and a minimum of 1400px wide (3000x3000 resolution is recommended for best results).</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Your cover art cannot contain:</p>
                <ul className="mt-2 space-y-2 text-xs text-gray-500">
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>Any text other than the release title and/or artist name</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>Web URLs, social media handles/icons, or contact information</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>Sexually explicit imagery</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>Third-party logos or trademarks without express written consent from the trademark holder</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Upload
            </button>
          </div>
        </div>

        {/* Add Video File Section */}
        <div className="bg-[#161A1F] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Add Video File</h2>
          
          <div 
            className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
              isDraggingVideo 
              ? 'border-purple-500 bg-[#1D2229]' 
              : videoFile 
                ? 'border-green-500 bg-[#1D2229]' 
                : 'border-gray-700 bg-[#161A1F]'
            }`}
            onDragEnter={handleVideoDragEnter}
            onDragLeave={handleVideoDragLeave}
            onDragOver={handleVideoDragOver}
            onDrop={handleVideoDrop}
          >
            <div className="space-y-1 text-center">
              <svg
                className={`mx-auto h-12 w-12 ${videoFile ? 'text-green-500' : 'text-gray-400'}`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {videoFile ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                )}
              </svg>
              <div className="flex text-sm text-center justify-center">
                <div className="relative cursor-pointer font-medium text-purple-500 hover:text-purple-400">
                  <span onClick={handleVideoBrowseClick}>Browse or drag and drop video file</span>
                  <input
                    id="video-upload"
                    name="video-upload"
                    type="file"
                    ref={videoFileRef}
                    className="sr-only"
                    accept="video/*"
                    onChange={handleVideoChange}
                  />
                </div>
              </div>
              {videoFile ? (
                <p className="text-sm text-gray-300">{videoFile.name}</p>
              ) : (
                <p className="text-xs text-gray-400">MP4, MOV, AVI up to 1GB</p>
              )}
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            {videoFile && (
              <button
                type="button"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Upload
              </button>
            )}
          </div>
        </div>

        {/* Add Video Details Section */}
        <div className="bg-[#161A1F] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Add Video Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter full video name"
                />
              </div>

              <div>
                <label htmlFor="artist" className="block text-sm font-medium text-gray-300 mb-1">
                  Artist
                </label>
                <input
                  type="text"
                  id="artist"
                  name="artist"
                  value={formData.artist}
                  onChange={handleChange}
                  className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter artist name"
                />
              </div>

              <div>
                <label htmlFor="contentRating" className="block text-sm font-medium text-gray-300 mb-1">
                  Content Rating
                </label>
                <select
                  id="contentRating"
                  name="contentRating"
                  value={formData.contentRating}
                  onChange={handleChange}
                  className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a rating</option>
                  <option value="G">G</option>
                  <option value="PG">PG</option>
                  <option value="PG-13">PG-13</option>
                  <option value="R">R</option>
                </select>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a type</option>
                  <option value="Official Music Video">Official Music Video</option>
                  <option value="Lyric Video">Lyric Video</option>
                  <option value="Visualizer">Visualizer</option>
                  <option value="Live Performance">Live Performance</option>
                  <option value="Behind the Scenes">Behind the Scenes</option>
                </select>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <div>
                <label htmlFor="version" className="block text-sm font-medium text-gray-300 mb-1">
                  Version
                </label>
                <select
                  id="version"
                  name="version"
                  value={formData.version}
                  onChange={handleChange}
                  className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a version</option>
                  <option value="Official Video">Official Video</option>
                  <option value="Extended Version">Extended Version</option>
                  <option value="Director's Cut">Director's Cut</option>
                  <option value="Alternative Version">Alternative Version</option>
                </select>
              </div>

              <div>
                <label htmlFor="upc" className="block text-sm font-medium text-gray-300 mb-1">
                  UPC
                </label>
                <input
                  type="text"
                  id="upc"
                  name="upc"
                  value={formData.upc}
                  onChange={handleChange}
                  className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter UPC code"
                />
              </div>

              <div>
                <label htmlFor="isrc" className="block text-sm font-medium text-gray-300 mb-1">
                  ISRC
                </label>
                <input
                  type="text"
                  id="isrc"
                  name="isrc"
                  value={formData.isrc}
                  onChange={handleChange}
                  className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter ISRC code"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-[#2D3748] hover:bg-[#3A4756] text-white px-6 py-3 rounded-md transition-colors"
          >
            Discard
          </button>
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md transition-colors"
          >
            Create New
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
} 