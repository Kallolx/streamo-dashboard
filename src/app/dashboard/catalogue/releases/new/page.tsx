"use client";

import { useState } from 'react';
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useRouter } from 'next/navigation';

export default function NewReleasePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    label: '',
    recordingYear: '',
    releaseDate: '',
    genre: '',
    releaseType: 'Album',
    format: 'Digital',
    language: 'English',
    upc: '',
    coverArt: null as File | null,
  });

  // Mock data for tracks
  const [tracks, setTracks] = useState([
    { id: 1, title: 'Fade to Black', artist: 'Metallica' },
    { id: 2, title: 'Master of Puppets', artist: 'Metallica' },
    { id: 3, title: 'Enter Sandman', artist: 'Metallica' },
    { id: 4, title: 'Nothing Else Matters', artist: 'Metallica' },
    { id: 5, title: 'The Unforgiven', artist: 'Metallica' },
    { id: 6, title: 'One', artist: 'Metallica' },
  ]);

  const [selectedTrackOption, setSelectedTrackOption] = useState('existing');
  const [selectedTracks, setSelectedTracks] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        coverArt: e.target.files[0],
      });
    }
  };

  const handleTrackOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTrackOption(e.target.value);
  };

  const handleDeleteTrack = (id: number) => {
    setTracks(tracks.filter(track => track.id !== id));
    setSelectedTracks(selectedTracks.filter(trackId => trackId !== id));
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTracks([]);
    } else {
      const allTrackIds = tracks.map(track => track.id);
      setSelectedTracks(allTrackIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectTrack = (id: number) => {
    setSelectedTracks(prev => {
      if (prev.includes(id)) {
        return prev.filter(trackId => trackId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleCancel = () => {
    router.push('/dashboard/catalogue/releases');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the form submission
    console.log('Form data submitted:', formData);
    console.log('Tracks:', tracks);
    
    // Navigate back to the releases page
    router.push('/dashboard/catalogue/releases');
  };

  return (
    <DashboardLayout
      title="Add New Release"
      subtitle="Create a new music release"
      parentTitle="Catalogue"
      parentPath="/dashboard/catalogue"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Upload Cover Art Section */}
        <div className="bg-[#161A1F] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Cover Art</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side - Upload */}
            <div className="flex flex-col items-center">
              <div className="w-full max-w-sm aspect-video bg-[#1D2229] border border-gray-700 rounded-md flex items-center justify-center overflow-hidden mb-4">
                {formData.coverArt ? (
                  <img 
                    src={URL.createObjectURL(formData.coverArt)} 
                    alt="Cover preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <label className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md cursor-pointer transition-colors">
                Upload
                <input 
                  type="file" 
                  id="coverArt"
                  name="coverArt"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-400 mt-2">Recommended size: 1920x1080 pixels</p>
            </div>
            
            {/* Right side - Tips */}
            <div className="bg-[#1A1E24] p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Cover Art Guidelines</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>No additional text other than release title and artist name</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>No web URLs, social media handles/icons, or contact information</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>No explicit or offensive imagery</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>High resolution (minimum 1400x1400 pixels)</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>JPG or PNG format only</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Maximum file size: 10MB</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Add Tracks Section */}
        <div className="bg-[#161A1F] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Add Tracks</h2>
          
          <div className="mb-4">
            <select
              value={selectedTrackOption}
              onChange={handleTrackOptionChange}
              className="bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="existing">Add Existing Tracks</option>
              <option value="upload">Upload New Tracks</option>
            </select>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-[#1A1E24]">
                <tr>
                  <th className="w-4 px-4 py-3">
                    <div className="flex items-center">
                      <input 
                        type="checkbox"
                        className="w-4 h-4 bg-[#1D2229] border-gray-600 rounded text-purple-600 focus:ring-0 focus:ring-offset-0"
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer">
                      <span>Title</span>
                      <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer">
                      <span>Artist Name</span>
                      <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-[#161A1F] divide-y divide-gray-700">
                {tracks.map((track) => (
                  <tr key={track.id} className="hover:bg-[#1A1E24]">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <input 
                          type="checkbox"
                          className="w-4 h-4 bg-[#1D2229] border-gray-600 rounded text-purple-600 focus:ring-0 focus:ring-offset-0"
                          checked={selectedTracks.includes(track.id)}
                          onChange={() => handleSelectTrack(track.id)}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {track.title}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{track.artist}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteTrack(track.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {tracks.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No tracks added yet. Use the dropdown above to add tracks.
            </div>
          )}
        </div>

        {/* Release Details Section */}
        <div className="bg-[#161A1F] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Release Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                  Release Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter release title"
                />
              </div>

              <div>
                <label htmlFor="label" className="block text-sm font-medium text-gray-300 mb-1">
                  Label
                </label>
                <input
                  type="text"
                  id="label"
                  name="label"
                  value={formData.label}
                  onChange={handleChange}
                  className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter label name"
                />
              </div>

              <div>
                <label htmlFor="recordingYear" className="block text-sm font-medium text-gray-300 mb-1">
                  Recording Year *
                </label>
                <input
                  type="number"
                  id="recordingYear"
                  name="recordingYear"
                  required
                  min="1900"
                  max="2099"
                  value={formData.recordingYear}
                  onChange={handleChange}
                  className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="YYYY"
                />
              </div>

              <div>
                <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-300 mb-1">
                  Release Date *
                </label>
                <input
                  type="date"
                  id="releaseDate"
                  name="releaseDate"
                  required
                  value={formData.releaseDate}
                  onChange={handleChange}
                  className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label htmlFor="genre" className="block text-sm font-medium text-gray-300 mb-1">
                  Genre *
                </label>
                <select
                  id="genre"
                  name="genre"
                  required
                  value={formData.genre}
                  onChange={handleChange}
                  className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Genre</option>
                  <option value="Rock">Rock</option>
                  <option value="Pop">Pop</option>
                  <option value="Hip-Hop">Hip-Hop</option>
                  <option value="Electronic">Electronic</option>
                  <option value="Jazz">Jazz</option>
                  <option value="Classical">Classical</option>
                  <option value="R&B">R&B</option>
                  <option value="Country">Country</option>
                  <option value="Metal">Metal</option>
                  <option value="Folk">Folk</option>
                </select>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <div>
                <label htmlFor="releaseType" className="block text-sm font-medium text-gray-300 mb-1">
                  Release Type *
                </label>
                <select
                  id="releaseType"
                  name="releaseType"
                  required
                  value={formData.releaseType}
                  onChange={handleChange}
                  className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Album">Album</option>
                  <option value="Single">Single</option>
                  <option value="EP">EP</option>
                  <option value="Compilation">Compilation</option>
                  <option value="Live">Live</option>
                </select>
              </div>

              <div>
                <label htmlFor="format" className="block text-sm font-medium text-gray-300 mb-1">
                  Format *
                </label>
                <select
                  id="format"
                  name="format"
                  required
                  value={formData.format}
                  onChange={handleChange}
                  className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Digital">Digital</option>
                  <option value="CD">CD</option>
                  <option value="Vinyl">Vinyl</option>
                  <option value="Cassette">Cassette</option>
                  <option value="Enhanced CD">Enhanced CD</option>
                </select>
              </div>

              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-1">
                  Language *
                </label>
                <select
                  id="language"
                  name="language"
                  required
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Italian">Italian</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Korean">Korean</option>
                  <option value="Mandarin">Mandarin</option>
                  <option value="Portuguese">Portuguese</option>
                  <option value="Russian">Russian</option>
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
                  placeholder="Enter UPC"
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
            Create Release
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
} 