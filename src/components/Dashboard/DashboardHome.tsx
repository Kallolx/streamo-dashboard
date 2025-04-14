'use client';

import { useState } from 'react';
import Image from 'next/image';

// Icons
const PlayIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
  </svg>
);

const DollarIcon = () => (
  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
  </svg>
);

const WalletIcon = () => (
  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const MusicIcon = () => (
  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
  </svg>
);

export default function DashboardHome() {
  const latestReleases = [
    { id: 1, title: 'Pain By Ryan Jones', imagePath: '/images/music/1.png', type: 'Single' },
    { id: 2, title: 'Pain By Ryan Jones', imagePath: '/images/music/2.png', type: 'Single' },
    { id: 3, title: 'Pain By Ryan Jones', imagePath: '/images/music/3.png', type: 'Single' },
    { id: 4, title: 'Pain By Ryan Jones', imagePath: '/images/music/4.png', type: 'Single' },
    { id: 5, title: 'Pain By Ryan Jones', imagePath: '/images/music/5.png', type: 'Single' },
  ];

  return (
    <div className="space-y-6">
      {/* User header section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Hi, James</h1>
        <div className="flex gap-3">
          <span className="bg-purple-900 text-white px-3 py-1 rounded-md text-sm flex items-center">
            <span className="mr-1">★</span> Owner
          </span>
          <span className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm">StreamAudio</span>
          <span className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm">Admin</span>
        </div>
      </div>

      {/* Earnings and Statements section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#161A1F] p-6 rounded-lg">
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm">Total Earnings</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-white text-2xl font-bold">$206k</span>
              <div className="h-8 w-8 bg-gray-800 rounded-full flex items-center justify-center">
                <DollarIcon />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-[#161A1F] p-6 rounded-lg">
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm">Last Statement</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-white text-2xl font-bold">$12.5k</span>
              <div className="h-8 w-8 bg-gray-800 rounded-full flex items-center justify-center">
                <DocumentIcon />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Latest releases section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Latest release</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {latestReleases.map((release) => (
            <div key={release.id} className="bg-[#161A1F] rounded-lg overflow-hidden">
              <div className="relative aspect-square">
                <img
                  src={release.imagePath}
                  alt={release.title}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="p-3">
                <h3 className="text-white text-sm font-medium">{release.title}</h3>
                <p className="text-gray-400 text-xs">{release.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 