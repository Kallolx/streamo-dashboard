'use client';

import { useState, useRef } from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import { useRouter } from 'next/navigation';

export default function NewArtistPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    socialLinks: {
      spotify: '',
      appleMusic: '',
      soundcloud: '',
      youtube: ''
    }
  });

  // Handle image upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
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

  // Handle social links changes
  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value
      }
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ formData, profileImage });
    router.push('/dashboard/catalogue/artists');
  };

  // Handle discard button
  const handleDiscard = () => {
    router.push('/dashboard/catalogue/artists');
  };

  return (
    <DashboardLayout
      title="Create New Artist"
      subtitle="Add a new artist to your catalogue"
      parentTitle="Artists"
      parentPath="/dashboard/catalogue/artists"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Upload Artist Image Section */}
        <div className="bg-[#161A1F] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Artist's Image</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side - Upload */}
            <div className="flex flex-col items-center">
              <div className="w-full max-w-sm aspect-square bg-[#1D2229] border border-gray-700 rounded-md flex items-center justify-center overflow-hidden mb-4">
                {profileImagePreview ? (
                  <img 
                    src={profileImagePreview} 
                    alt="Artist preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6">
                    <svg className="w-16 h-16 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-sm text-gray-400">Browse or drag and drop image file</p>
                  </div>
                )}
              </div>
              <label className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md cursor-pointer transition-colors">
                Upload
                <input 
                  type="file" 
                  id="profileImage"
                  name="profileImage"
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

        {/* Artist Details Section */}
        <div className="bg-[#161A1F] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Add Artist Details</h2>
          
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Full Name"
                required
              />
            </div>
            
            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">
                Add Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full bg-[#1D2229] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Add Bio"
              />
            </div>
          </div>
        </div>

        {/* Profile Links Section */}
        <div className="bg-[#161A1F] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Add Profile Links</h2>
          
          <div className="space-y-4">
            {/* Spotify */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                <span>Spotify</span>
              </div>
              <button 
                type="button"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md cursor-pointer transition-colors"
                onClick={() => {
                  // Open a form to add Spotify link
                }}
              >
                Link Your Profile
              </button>
            </div>

            {/* Apple Music */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.997 6.124c0-.738-.065-1.47-.24-2.19-.317-1.31-1.062-2.31-2.18-3.043C21.003.517 20.373.285 19.7.164c-.517-.093-1.038-.135-1.564-.15-.04-.003-.083-.01-.124-.013H5.988c-.152.01-.303.017-.455.026C4.786.07 4.043.15 3.34.428 2.004.958 1.02 1.88.475 3.208c-.192.466-.34.943-.408 1.44-.087.645-.108 1.298-.065 1.95.004.096.008.192.01.288v12.228c-.01.15-.016.3-.023.448-.13.574-.04 1.15.166 1.7.31.82.87 1.484 1.563 1.977.723.517 1.52.806 2.376.896.16.017.32.022.48.036h13.032c.36-.033.72-.047 1.078-.102.806-.117 1.568-.363 2.226-.865.83-.63 1.396-1.453 1.65-2.492.057-.23.095-.47.134-.7.021-.13.035-.26.052-.39.073-.572.055-12.68.054-13.198z"/>
                  <path d="M12.252 17.976c-.594.974-1.355 1.793-2.368 2.342-.22.12-.435.21-.65.302-.334.142-.587.073-.738-.263-.128-.283-.137-.587-.012-.873.08-.182.194-.338.32-.484.558-.64 1.11-1.283 1.642-1.94.68-.836 1.328-1.695 1.89-2.61.186-.306.49-.487.845-.417.29.058.515.252.662.51.214.387.33.797.34 1.225.003.418-.083.82-.24 1.208zM15.76 5.204c-.243.538-.433 1.098-.563 1.675-.13.576-.16 1.152-.097 1.737.093.863.327 1.674.826 2.397.16.23.337.447.505.677.146.203.138.4-.03.583-.168.183-.315.388-.473.582-.195.24-.433.294-.685.137-.196-.122-.36-.284-.527-.437-.486-.443-.943-.91-1.38-1.387-.368-.407-.7-.85-.908-1.353-.137-.328-.196-.67-.207-1.028-.033-1.13.316-2.16.883-3.115.398-.67.9-1.24 1.484-1.735.262-.223.653-.172.84.108.062.093.126.183.168.284.24.58.142 1.168-.018 1.753-.08.295-.196.58-.318.875zM8.785 17.037c-.695.48-1.39.96-2.088 1.436-.378.258-.76.498-1.169.687-.37.172-.663.132-.938-.144-.37-.369-.608-.81-.59-1.345.018-.562.238-1.028.574-1.455.748-.95 1.53-1.87 2.287-2.808.263-.324.552-.626.813-.948.134-.166.267-.173.410-.01.225.257.454.51.68.766.29.332.552.685.702 1.092.071.193.118.393.147.598.031.22-.03.428-.214.573-.146.116-.296.232-.443.35-.467.375-.934.75-1.4 1.126-.015.013-.035.022-.053.033.172.031.185.03.282.05z" fill="#fff"/>
                </svg>
                <span>Apple Music</span>
              </div>
              <button 
                type="button"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md cursor-pointer transition-colors"
                onClick={() => {
                  // Open a form to add Apple Music link
                }}
              >
                Link Your Profile
              </button>
            </div>

            {/* Soundcloud */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c0-.057-.045-.1-.09-.1m-.899.828c-.06 0-.091.037-.104.094L0 14.479l.165 1.308c0 .055.045.094.09.094s.089-.045.104-.104l.21-1.319-.21-1.334c0-.061-.044-.102-.09-.102m1.83-1.229c-.061 0-.12.045-.12.104l-.21 2.563.225 2.458c0 .06.045.12.119.12.061 0 .105-.061.121-.12l.254-2.474-.254-2.548c-.016-.06-.061-.12-.121-.12m.945-.089c-.075 0-.135.06-.15.135l-.193 2.64.21 2.544c.016.077.075.138.149.138.075 0 .135-.061.15-.15l.24-2.532-.24-2.623c0-.075-.06-.135-.135-.135l-.031-.017zm1.155.36c-.005-.09-.075-.149-.159-.149-.09 0-.158.06-.164.149l-.217 2.43.2 2.563c0 .09.075.157.159.157.074 0 .148-.068.148-.158l.227-2.563-.227-2.444.033.015zm.809-1.709c-.101 0-.18.09-.18.181l-.21 3.957.187 2.563c0 .09.08.164.18.164.094 0 .174-.09.18-.18l.209-2.563-.209-3.972c-.008-.104-.088-.18-.18-.18m.959-.914c-.105 0-.195.09-.203.194l-.18 4.872.165 2.548c0 .12.09.209.195.209.104 0 .194-.089.21-.209l.193-2.548-.192-4.856c-.016-.12-.105-.21-.21-.21m.989-.449c-.121 0-.211.089-.225.209l-.165 5.275.165 2.52c.014.119.104.225.225.225.119 0 .225-.105.225-.225l.195-2.52-.196-5.275c0-.12-.105-.225-.225-.225m1.245.045c0-.135-.105-.24-.24-.24-.119 0-.24.105-.24.24l-.149 5.441.149 2.503c.016.135.121.24.256.24s.24-.105.24-.24l.164-2.503-.164-5.456-.016.015zm.749-.134c-.135 0-.255.119-.255.254l-.15 5.322.15 2.473c0 .15.12.255.255.255s.255-.12.255-.27l.15-2.474-.15-5.307c0-.148-.12-.27-.271-.27m1.005.166c-.164 0-.284.135-.284.285l-.103 5.143.135 2.474c0 .149.119.277.284.277.149 0 .271-.12.284-.285l.121-2.443-.135-5.112c-.012-.164-.135-.285-.285-.285m1.184-.945c-.045-.029-.105-.044-.165-.044s-.119.015-.165.044c-.09.054-.149.15-.149.255v.061l-.104 6.048.115 2.449v.008c.008.06.03.135.074.18.058.061.142.104.234.104.08 0 .158-.044.209-.09.058-.06.091-.135.091-.225l.015-.24.117-2.203-.135-6.086c0-.104-.061-.193-.135-.239l-.002-.022zm1.006-.547c-.045-.045-.09-.061-.15-.061-.074 0-.149.016-.209.061-.075.061-.119.15-.119.24v.029l-.137 6.609.076 1.215.061 1.185c0 .164.148.3.33.3.181 0 .33-.15.33-.3l.15-2.4-.15-6.609c0-.12-.074-.221-.165-.27m8.934 3.777c-.405 0-.795.086-1.139.232-.24-2.654-2.46-4.736-5.188-4.736-.659 0-1.305.135-1.889.359-.225.09-.27.18-.285.359v9.368c.016.18.15.33.33.345h8.185C22.681 17.218 24 15.914 24 14.28s-1.319-2.952-2.938-2.952"></path>
                </svg>
                <span>Soundcloud</span>
              </div>
              <button 
                type="button"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md cursor-pointer transition-colors"
                onClick={() => {
                  // Open a form to add Soundcloud link
                }}
              >
                Link Your Profile
              </button>
            </div>

            {/* Youtube */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-3 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span>Youtube</span>
              </div>
              <button 
                type="button"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md cursor-pointer transition-colors"
                onClick={() => {
                  // Open a form to add Youtube link
                }}
              >
                Link Your Profile
              </button>
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