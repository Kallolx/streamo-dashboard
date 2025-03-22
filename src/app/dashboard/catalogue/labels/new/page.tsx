'use client';

import { useState, useRef } from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import { useRouter } from 'next/navigation';

export default function NewLabelPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [labelImage, setLabelImage] = useState<File | null>(null);
  const [labelImagePreview, setLabelImagePreview] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Handle image upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLabelImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLabelImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ formData, labelImage });
    router.push('/dashboard/catalogue/labels');
  };

  // Handle discard button
  const handleDiscard = () => {
    router.push('/dashboard/catalogue/labels');
  };

  return (
    <DashboardLayout
      title="Create New Label"
      subtitle="Add a new label to your catalogue"
      parentTitle="Labels"
      parentPath="/dashboard/catalogue/labels"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Upload Label Image Section */}
        <div className="bg-[#161A1F] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Label's Image</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side - Upload */}
            <div className="flex flex-col items-center">
              <div className="w-full max-w-sm aspect-square bg-[#1D2229] border border-gray-700 rounded-md flex items-center justify-center overflow-hidden mb-4">
                {labelImagePreview ? (
                  <img 
                    src={labelImagePreview} 
                    alt="Label preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6">
                    <svg className="w-16 h-16 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-400">Browse or drag and drop image file</p>
                  </div>
                )}
              </div>
              <label className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md cursor-pointer transition-colors">
                Upload
                <input 
                  type="file" 
                  id="labelImage"
                  name="labelImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  ref={fileInputRef}
                />
              </label>
            </div>
            
            {/* Right side - Tips */}
            <div className="bg-[#1A1E24] p-4 rounded-lg">
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

        {/* Label Details Section */}
        <div className="bg-[#161A1F] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Add Label Details</h2>
          
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Label Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Label Name"
                required
              />
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Description"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleDiscard}
            className="px-4 py-2 border border-gray-600 text-gray-400 rounded-md hover:bg-gray-700 transition-colors"
          >
            Discard
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Create New
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
} 