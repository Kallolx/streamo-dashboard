'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface VideosTableProps {
  onVideoSelect?: (videoId: number) => void;
}

// Mock data for videos
const videosData = [
  { 
    id: 1, 
    title: 'Midnight Drive', 
    releaseId: 'TRK00123',
    artist: 'Neon Pulse', 
    label: 'Fiction Records',
    upc: '093624241126',
    videoIsrc: 'US-XYZ-23-00001',
    status: 'Released' 
  },
  { 
    id: 2, 
    title: 'Midnight Drive', 
    releaseId: 'TRK00123',
    artist: 'Neon Pulse', 
    label: 'Fiction Records',
    upc: '093624241126',
    videoIsrc: 'US-XYZ-23-00001',
    status: 'Released' 
  },
  { 
    id: 3, 
    title: 'Midnight Drive', 
    releaseId: 'TRK00123',
    artist: 'Neon Pulse', 
    label: 'Fiction Records',
    upc: '093624241126',
    videoIsrc: 'US-XYZ-23-00001',
    status: 'Released' 
  },
  { 
    id: 4, 
    title: 'Midnight Drive', 
    releaseId: 'TRK00123',
    artist: 'Neon Pulse', 
    label: 'Fiction Records',
    upc: '093624241126',
    videoIsrc: 'US-XYZ-23-00001',
    status: 'Released' 
  },
  { 
    id: 5, 
    title: 'Midnight Drive', 
    releaseId: 'TRK00123',
    artist: 'Neon Pulse', 
    label: 'Fiction Records',
    upc: '093624241126',
    videoIsrc: 'US-XYZ-23-00001',
    status: 'Released' 
  },
  { 
    id: 6, 
    title: 'Midnight Drive', 
    releaseId: 'TRK00123',
    artist: 'Neon Pulse', 
    label: 'Fiction Records',
    upc: '093624241126',
    videoIsrc: 'US-XYZ-23-00001',
    status: 'Released' 
  },
  { 
    id: 7, 
    title: 'Midnight Drive', 
    releaseId: 'TRK00123',
    artist: 'Neon Pulse', 
    label: 'Fiction Records',
    upc: '093624241126',
    videoIsrc: 'US-XYZ-23-00001',
    status: 'Released' 
  },
  { 
    id: 8, 
    title: 'Midnight Drive', 
    releaseId: 'TRK00123',
    artist: 'Neon Pulse', 
    label: 'Fiction Records',
    upc: '093624241126',
    videoIsrc: 'US-XYZ-23-00001',
    status: 'Released' 
  },
  { 
    id: 9, 
    title: 'Midnight Drive', 
    releaseId: 'TRK00123',
    artist: 'Neon Pulse', 
    label: 'Fiction Records',
    upc: '093624241126',
    videoIsrc: 'US-XYZ-23-00001',
    status: 'Released' 
  },
  { 
    id: 10, 
    title: 'Midnight Drive', 
    releaseId: 'TRK00123',
    artist: 'Neon Pulse', 
    label: 'Fiction Records',
    upc: '093624241126',
    videoIsrc: 'US-XYZ-23-00001',
    status: 'Released' 
  },
];

// Sort Icon Component
const SortIcon = ({ isActive = false, direction = 'asc' }) => (
  <svg 
    className={`w-4 h-4 ml-1 ${isActive ? 'text-purple-500' : 'text-gray-400'}`} 
    fill="currentColor" 
    viewBox="0 0 20 20" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {direction === 'asc' ? (
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
    ) : (
      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd"></path>
    )}
  </svg>
);

// Component for the table header cell with sorting functionality
interface TableHeaderProps {
  label: string;
  sortKey: string;
  currentSort: { key: string; direction: string };
  onSort: (key: string) => void;
}

const TableHeader = ({ label, sortKey, currentSort, onSort }: TableHeaderProps) => {
  const isActive = currentSort.key === sortKey;
  const direction = currentSort.direction;

  const handleClick = () => {
    onSort(sortKey);
  };

  return (
    <th 
      className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-center">
        {label}
        <SortIcon isActive={isActive} direction={isActive ? direction : 'asc'} />
      </div>
    </th>
  );
};

export default function VideosTable({ onVideoSelect }: VideosTableProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVideos, setSelectedVideos] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentSort, setCurrentSort] = useState({ key: 'title', direction: 'asc' });
  const itemsPerPage = 8;
  
  // Filter and sort videos
  const filteredData = videosData
    .filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.upc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.videoIsrc.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const key = currentSort.key as keyof typeof a;
      if (a[key] < b[key]) return currentSort.direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return currentSort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  
  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentVideos = filteredData.slice(startIndex, startIndex + itemsPerPage);
  
  // Handle sort
  const handleSort = (key: string) => {
    setCurrentSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // Handle Create New button click
  const handleCreateNew = () => {
    router.push('/dashboard/create-new?tab=videos');
  };

  // Handle checkbox changes
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedVideos([]);
    } else {
      const allVideoIds = currentVideos.map(video => video.id);
      setSelectedVideos(allVideoIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectVideo = (id: number) => {
    setSelectedVideos(prev => {
      if (prev.includes(id)) {
        return prev.filter(videoId => videoId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  // Handle row click
  const handleRowClick = (id: number, e: React.MouseEvent) => {
    // Prevent triggering if clicking on checkbox or link
    if ((e.target as HTMLElement).tagName === 'INPUT' || 
        (e.target as HTMLElement).tagName === 'A') {
      return;
    }
    
    if (onVideoSelect) {
      onVideoSelect(id);
    }
  };
  
  return (
    <div className="bg-[#161A1F] rounded-lg overflow-hidden">
      {/* Search and add bar */}
      <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-72">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-[#1D2229] text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-[#1D2229]"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <button 
          onClick={handleCreateNew}
          className="inline-flex cursor-pointer items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Create New
        </button>
      </div>
      
      {/* Table */}
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
              <TableHeader label="Title" sortKey="title" currentSort={currentSort} onSort={handleSort} />
              <TableHeader label="Release ID" sortKey="releaseId" currentSort={currentSort} onSort={handleSort} />
              <TableHeader label="Artist Name" sortKey="artist" currentSort={currentSort} onSort={handleSort} />
              <TableHeader label="Label" sortKey="label" currentSort={currentSort} onSort={handleSort} />
              <TableHeader label="UPC" sortKey="upc" currentSort={currentSort} onSort={handleSort} />
              <TableHeader label="Video ISRC" sortKey="videoIsrc" currentSort={currentSort} onSort={handleSort} />
              <TableHeader label="Creation date" sortKey="status" currentSort={currentSort} onSort={handleSort} />
            </tr>
          </thead>
          <tbody className="bg-[#161A1F] divide-y divide-gray-700">
            {currentVideos.map((video) => (
              <tr 
                key={video.id} 
                className="hover:bg-[#1A1E24] transition-colors cursor-pointer"
                onClick={(e) => handleRowClick(video.id, e)}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <input 
                      type="checkbox"
                      className="w-4 h-4 bg-[#1D2229] border-gray-600 rounded text-purple-600 focus:ring-0 focus:ring-offset-0"
                      checked={selectedVideos.includes(video.id)}
                      onChange={() => handleSelectVideo(video.id)}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Link 
                    href={`/dashboard/catalogue/videos/${video.id}`} 
                    className="text-white hover:text-purple-400"
                  >
                    {video.title}
                  </Link>
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">{video.releaseId}</td>
                <td className="px-4 py-3 whitespace-nowrap">{video.artist}</td>
                <td className="px-4 py-3 whitespace-nowrap">{video.label}</td>
                <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">{video.upc}</td>
                <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">{video.videoIsrc}</td>
                <td className="px-4 py-3 whitespace-nowrap">{video.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Empty state */}
      {filteredData.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No videos found. Try adjusting your search or create a new video.
        </div>
      )}
      
      {/* Pagination */}
      {filteredData.length > 0 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-700">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md ${
                currentPage === 1 ? 'text-gray-500' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md ${
                currentPage === totalPages ? 'text-gray-500' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-400">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(startIndex + itemsPerPage, filteredData.length)}
                </span>{' '}
                of <span className="font-medium">{filteredData.length}</span> videos
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-[#161A1F] text-sm font-medium text-gray-400 hover:bg-gray-700"
                >
                  <span className="sr-only">Previous</span>
                  &larr;
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium ${
                        currentPage === pageNumber
                          ? 'bg-purple-600 text-white'
                          : 'bg-[#161A1F] text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-[#161A1F] text-sm font-medium text-gray-400 hover:bg-gray-700"
                >
                  <span className="sr-only">Next</span>
                  &rarr;
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 