'use client';

import { useState } from 'react';

// Icons
const PlayIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
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
  // Demo data
  const recentTracks = [
    { id: 1, title: 'Fade to Black', artist: 'Metallica', duration: '6:57', plays: 12543 },
    { id: 2, title: 'Nothing Else Matters', artist: 'Metallica', duration: '6:28', plays: 15732 },
    { id: 3, title: 'Master of Puppets', artist: 'Metallica', duration: '8:35', plays: 10981 },
  ];

  return (
    <div className="space-y-6">
      {/* Quick stats section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#161A1F] p-6 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Tracks</p>
              <h3 className="text-2xl font-semibold mt-1 text-white">248</h3>
              <p className="text-green-500 text-sm mt-2">+12% from last month</p>
            </div>
            <MusicIcon />
          </div>
        </div>
        
        <div className="bg-[#161A1F] p-6 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Plays</p>
              <h3 className="text-2xl font-semibold mt-1 text-white">1.2M</h3>
              <p className="text-green-500 text-sm mt-2">+8% from last month</p>
            </div>
            <ChartIcon />
          </div>
        </div>
        
        <div className="bg-[#161A1F] p-6 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm">Revenue</p>
              <h3 className="text-2xl font-semibold mt-1 text-white">$5,240</h3>
              <p className="text-green-500 text-sm mt-2">+15% from last month</p>
            </div>
            <WalletIcon />
          </div>
        </div>
      </div>
      
      {/* Recent tracks section */}
      <div className="bg-[#161A1F] p-6 rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Recent Tracks</h3>
          <button className="text-purple-500 text-sm hover:text-purple-400">View All</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Duration</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Plays</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {recentTracks.map(track => (
                <tr key={track.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded bg-gray-700 flex items-center justify-center mr-3">
                        <PlayIcon />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{track.title}</div>
                        <div className="text-sm text-gray-400">{track.artist}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{track.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{track.plays.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-purple-500 hover:text-purple-400">Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Upcoming releases & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#161A1F] p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-6">Upcoming Releases</h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 rounded-lg bg-gray-800">
              <div className="w-14 h-14 rounded bg-gray-700 flex items-center justify-center mr-4">
                <span className="text-white font-bold">EP</span>
              </div>
              <div>
                <p className="text-white font-medium">New EP: "Acoustic Sessions"</p>
                <p className="text-gray-400 text-sm">Release Date: Aug 15, 2023</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 rounded-lg bg-gray-800">
              <div className="w-14 h-14 rounded bg-gray-700 flex items-center justify-center mr-4">
                <span className="text-white font-bold">LP</span>
              </div>
              <div>
                <p className="text-white font-medium">Full Album: "Midnight Dreams"</p>
                <p className="text-gray-400 text-sm">Release Date: Oct 22, 2023</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-[#161A1F] p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-6">Recent Analytics</h3>
          <div className="h-48 flex items-center justify-center border border-gray-700 rounded-lg">
            <p className="text-gray-400">Analytics visualization placeholder</p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-gray-400 text-sm">Listeners</p>
              <p className="text-white font-semibold">42.5k</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Average Time</p>
              <p className="text-white font-semibold">3:24</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Completion Rate</p>
              <p className="text-white font-semibold">68%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 