'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Mock data for artists
const artistsData = [
  { 
    id: 1, 
    name: 'Neon Pulse',
    artistId: 'AR00123'
  },
  { 
    id: 2, 
    name: 'Luna Waves',
    artistId: 'AR00456'
  },
  { 
    id: 3, 
    name: 'Atlas Rogue',
    artistId: 'AR00789'
  },
  { 
    id: 4, 
    name: 'Neon Pulse',
    artistId: 'AR00123'
  },
  { 
    id: 5, 
    name: 'Luna Waves',
    artistId: 'AR00456'
  },
  { 
    id: 6, 
    name: 'Midnight Drive',
    artistId: 'AR00123'
  },
  { 
    id: 7, 
    name: 'Atlas Rogue',
    artistId: 'AR00789'
  },
  { 
    id: 8, 
    name: 'Luna Waves',
    artistId: 'AR00456'
  },
  { 
    id: 9, 
    name: 'Midnight Drive',
    artistId: 'AR00123'
  },
  { 
    id: 10, 
    name: 'Atlas Rogue',
    artistId: 'AR00789'
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

export default function ArtistsTable() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArtists, setSelectedArtists] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentSort, setCurrentSort] = useState({ key: 'name', direction: 'asc' });
  const itemsPerPage = 8;
  
  // Filter and sort artists
  const filteredData = artistsData
    .filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.artistId.toLowerCase().includes(searchTerm.toLowerCase())
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
  const currentArtists = filteredData.slice(startIndex, startIndex + itemsPerPage);
  
  // Handle sort
  const handleSort = (key: string) => {
    setCurrentSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // Handle Create New button click
  const handleCreateNew = () => {
    router.push('/dashboard/catalogue/artists/new');
  };

  // Handle checkbox changes
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedArtists([]);
    } else {
      const allArtistIds = currentArtists.map(artist => artist.id);
      setSelectedArtists(allArtistIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectArtist = (id: number) => {
    setSelectedArtists(prev => {
      if (prev.includes(id)) {
        return prev.filter(artistId => artistId !== id);
      } else {
        return [...prev, id];
      }
    });
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
              <TableHeader label="Artist Name" sortKey="name" currentSort={currentSort} onSort={handleSort} />
              <TableHeader label="Artist ID" sortKey="artistId" currentSort={currentSort} onSort={handleSort} />
            </tr>
          </thead>
          <tbody className="bg-[#161A1F] divide-y divide-gray-700">
            {currentArtists.map((artist) => (
              <tr 
                key={artist.id} 
                className="hover:bg-[#1A1E24] transition-colors cursor-pointer"
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <input 
                      type="checkbox"
                      className="w-4 h-4 bg-[#1D2229] border-gray-600 rounded text-purple-600 focus:ring-0 focus:ring-offset-0"
                      checked={selectedArtists.includes(artist.id)}
                      onChange={() => handleSelectArtist(artist.id)}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Link 
                    href={`/dashboard/catalogue/artists/${artist.id}`} 
                    className="text-white hover:text-purple-400"
                  >
                    {artist.name}
                  </Link>
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">
                  {artist.artistId}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Empty state */}
      {filteredData.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No artists found. Try adjusting your search or create a new artist.
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
                of <span className="font-medium">{filteredData.length}</span> artists
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