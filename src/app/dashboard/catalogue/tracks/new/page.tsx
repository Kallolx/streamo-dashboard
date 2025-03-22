"use client";

import { useState, useRef } from 'react';
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useRouter } from 'next/navigation';

export default function NewTrackPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    contentRating: 'G',
    type: 'Single',
    isrc: '',
    version: '',
    lyrics: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/')) {
        setAudioFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/catalogue/tracks');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the form submission
    console.log('Form data submitted:', formData);
    console.log('Audio file:', audioFile);
    
    // Navigate back to the tracks page
    router.push('/dashboard/catalogue/tracks');
  };

  return (
    <DashboardLayout
      title="Create New Track"
      subtitle="Add a new track to your catalogue"
      parentTitle="Tracks"
      parentPath="/dashboard/catalogue/tracks"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Audio File Upload Section */}
        <div className="bg-[#161A1F] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Add Audio File</h2>
          
          <div 
            className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
              isDragging 
              ? 'border-purple-500 bg-[#1D2229]' 
              : audioFile 
                ? 'border-green-500 bg-[#1D2229]' 
                : 'border-gray-600 bg-[#161A1F]'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="space-y-1 text-center">
              <svg
                className={`mx-auto h-12 w-12 ${audioFile ? 'text-green-500' : 'text-gray-400'}`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {audioFile ? (
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
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                )}
              </svg>
              <div className="flex text-sm text-center text-gray-400">
                <div className="relative cursor-pointer font-medium text-purple-500 hover:text-purple-400">
                  <span onClick={handleBrowseClick}>Browse or drag and drop audio file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    ref={fileInputRef}
                    className="sr-only"
                    accept="audio/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
              {audioFile ? (
                <p className="text-sm text-gray-300">{audioFile.name}</p>
              ) : (
                <p className="text-xs text-gray-400">MP3, WAV, FLAC up to 50MB</p>
              )}
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            {audioFile && (
              <button
                type="button"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
                disabled={!audioFile}
              >
                Upload
              </button>
            )}
          </div>
        </div>

        {/* Track Details Section */}
        <div className="bg-[#161A1F] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Add Track Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter track title"
                />
              </div>

              <div>
                <label htmlFor="artist" className="block text-sm font-medium text-gray-300 mb-1">
                  Artist *
                </label>
                <input
                  type="text"
                  id="artist"
                  name="artist"
                  required
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
                  <option value="Single">Single</option>
                  <option value="Album Track">Album Track</option>
                  <option value="EP Track">EP Track</option>
                  <option value="Remix">Remix</option>
                  <option value="Live">Live</option>
                </select>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <div>
                <label htmlFor="version" className="block text-sm font-medium text-gray-300 mb-1">
                  Version
                </label>
                <input
                  type="text"
                  id="version"
                  name="version"
                  value={formData.version}
                  onChange={handleChange}
                  className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="E.g. Radio Edit, Extended Mix"
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
                  placeholder="Enter ISRC code if available"
                />
              </div>

              <div>
                <label htmlFor="lyrics" className="block text-sm font-medium text-gray-300 mb-1">
                  Type Lyrics
                </label>
                <textarea
                  id="lyrics"
                  name="lyrics"
                  rows={4}
                  value={formData.lyrics}
                  onChange={handleChange}
                  className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter track lyrics"
                ></textarea>
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