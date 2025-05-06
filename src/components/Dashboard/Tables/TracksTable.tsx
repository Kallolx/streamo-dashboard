'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAllTracks, Track } from '@/services/trackService';

interface TracksTableProps {
  onTrackSelect?: (trackId: string) => void;
  tracks?: any[];
}

// Component for the table header cell with sorting functionality
interface TableHeaderProps {
  label: string;
  sortKey: string;
  currentSort: { key: string; direction: string };
  onSort: (key: string) => void;
}

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

export default function VideosTable({ onTrackSelect, tracks = [] }: TracksTableProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentSort, setCurrentSort] = useState({ key: 'title', direction: 'asc' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 8;
  
  // Filter and sort tracks
  const filteredData = tracks
    .filter(item => 
      (item.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.artist?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item._id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.type?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.status?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const key = currentSort.key as keyof Track;
      const aValue = a[key] || '';
      const bValue = b[key] || '';
      
      if (aValue < bValue) return currentSort.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return currentSort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  
  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTracks = filteredData.slice(startIndex, startIndex + itemsPerPage);
  
  // Handle sort
  const handleSort = (key: string) => {
    setCurrentSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // Handle Create New button click
  const handleCreateNew = () => {
    router.push('/dashboard/create-new?tab=tracks');
  };

  // Handle checkbox changes
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTracks([]);
    } else {
      const allTrackIds = currentTracks.map(track => track._id || '').filter(id => id !== '');
      setSelectedTracks(allTrackIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectTrack = (id: string) => {
    setSelectedTracks(prev => {
      if (prev.includes(id)) {
        return prev.filter(trackId => trackId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Handle row click
  const handleRowClick = (id: string, e: React.MouseEvent) => {
    // Prevent triggering if clicking on checkbox or link
    if ((e.target as HTMLElement).tagName === 'INPUT' || 
        (e.target as HTMLElement).tagName === 'A') {
      return;
    }
    
    if (onTrackSelect) {
      onTrackSelect(id);
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
      <div className="overflow-x-auto overflow-y-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-[#1A1E24]">
            <tr>
              <th className="sticky left-0 z-10 bg-[#1A1E24] w-4 px-4 py-3">
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
              <TableHeader label="Artist" sortKey="artist" currentSort={currentSort} onSort={handleSort} />
              <TableHeader label="Type" sortKey="type" currentSort={currentSort} onSort={handleSort} />
              <TableHeader label="Video ID" sortKey="isrc" currentSort={currentSort} onSort={handleSort} />
              <TableHeader label="Status" sortKey="status" currentSort={currentSort} onSort={handleSort} />
              <TableHeader label="Date" sortKey="createdAt" currentSort={currentSort} onSort={handleSort} />
            </tr>
          </thead>
          <tbody className="bg-[#161A1F] divide-y divide-gray-700">
            {currentTracks.map((track, index) => (
              <tr 
                key={track._id || `track-${index}`} 
                className="hover:bg-[#1A1E24] transition-colors cursor-pointer"
                onClick={(e) => track._id ? handleRowClick(track._id, e) : undefined}
              >
                <td className="sticky left-0 z-10 bg-[#161A1F] hover:bg-[#1A1E24] px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <input 
                      type="checkbox"
                      className="w-4 h-4 bg-[#1D2229] border-gray-600 rounded text-purple-600 focus:ring-0 focus:ring-offset-0"
                      checked={track._id ? selectedTracks.includes(track._id) : false}
                      onChange={() => track._id ? handleSelectTrack(track._id) : undefined}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Link 
                    href={`/dashboard/catalogue/tracks/${track._id || ''}`} 
                    className="text-white hover:text-purple-400"
                  >
                    {track.title}
                  </Link>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{track.artist}</td>
                <td className="px-4 py-3 whitespace-nowrap">{track.type || 'Single'}</td>
                <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">{track.isrc || '-'}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`${
                    track.status === 'approved' ? 'text-green-400' :
                    track.status === 'rejected' ? 'text-red-400' :
                    'text-gray-400'
                  }`}>
                    {(track.status && track.status.charAt(0).toUpperCase() + track.status.slice(1)) || 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-400 text-sm">
                  {track.createdAt ? new Date(track.createdAt).toLocaleDateString() : '-'}
                </td>
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
              className="relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-[#1A1E24] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-[#1A1E24] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-400">
                Showing <span className="font-medium">{Math.min(startIndex + 1, filteredData.length)}</span> to <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> of{' '}
                <span className="font-medium">{filteredData.length}</span> results
              </p>
            </div>
            
            <div>
              <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-[#1A1E24] text-sm font-medium text-gray-300 hover:bg-[#252A33] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Page numbers */}
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === i + 1
                        ? 'z-10 bg-purple-600 border-purple-500 text-white'
                        : 'border-gray-700 bg-[#1A1E24] text-gray-300 hover:bg-[#252A33]'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-[#1A1E24] text-sm font-medium text-gray-300 hover:bg-[#252A33] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 