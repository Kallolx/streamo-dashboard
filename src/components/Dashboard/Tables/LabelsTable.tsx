'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LabelDetailsModel from '../models/LabelDetailsModel';

// Mock data for labels with expanded information
const mockLabels = [
  { 
    id: 1, 
    name: 'Universal Music Group', 
    labelId: 'L00123', 
    creationDate: '31/01/2025',
    imageSrc: '/images/singer/1.webp',
    bio: 'Universal Music Group (UMG) is an American global music corporation. UMG\'s global corporate headquarters are located in Hilversum, Netherlands and its operational headquarters are located in Santa Monica, California.',
    totalTracks: 245,
    totalAlbums: 34
  },
  { 
    id: 2, 
    name: 'Sony Music Entertainment', 
    labelId: 'L00124', 
    creationDate: '15/02/2025',
    imageSrc: '/images/singer/2.webp',
    bio: 'Sony Music Entertainment (SME) is an American multinational music company owned by Sony Group Corporation and is the second-largest of the "Big Three" record companies, after Universal Music Group and followed by Warner Music Group.',
    totalTracks: 187,
    totalAlbums: 28
  },
  { 
    id: 3, 
    name: 'Warner Music Group', 
    labelId: 'L00125', 
    creationDate: '22/03/2025',
    imageSrc: '/images/singer/3.webp',
    bio: 'Warner Music Group is an American multinational entertainment and record label conglomerate headquartered in New York City. It is one of the "Big Three" recording companies and the third-largest in the global music industry.',
    totalTracks: 156,
    totalAlbums: 22
  },
  { 
    id: 4, 
    name: 'Interscope Records', 
    labelId: 'L00126', 
    creationDate: '10/04/2025',
    imageSrc: '/images/singer/1.webp',
    bio: 'Interscope Records is an American record label owned by Universal Music Group through its Interscope Geffen A&M imprint. Founded in 1990, it is based in Santa Monica, California.',
    totalTracks: 122,
    totalAlbums: 18
  },
  { 
    id: 5, 
    name: 'Republic Records', 
    labelId: 'L00127', 
    creationDate: '05/05/2025',
    imageSrc: '/images/singer/2.webp',
    bio: 'Republic Records is an American record label owned by Universal Music Group (UMG). It was founded by Avery Lipman and Monte Lipman as an independent label in 1995, and was acquired by UMG in 2000.',
    totalTracks: 98,
    totalAlbums: 15
  },
  { 
    id: 6, 
    name: 'Atlantic Records', 
    labelId: 'L00128', 
    creationDate: '18/06/2025',
    imageSrc: '/images/singer/3.webp',
    bio: 'Atlantic Records is an American record label founded in October 1947 by Ahmet Ertegun and Herb Abramson. Over its first 20 years of operation, Atlantic earned a reputation as one of the most important American labels, specializing in jazz, R&B, and soul by Aretha Franklin, Ray Charles, Wilson Pickett, Sam and Dave, Ruth Brown and Otis Redding.',
    totalTracks: 215,
    totalAlbums: 32
  },
  { 
    id: 7, 
    name: 'Columbia Records', 
    labelId: 'L00129', 
    creationDate: '29/07/2025',
    imageSrc: '/images/singer/1.webp',
    bio: 'Columbia Records is an American record label owned by Sony Music Entertainment, a subsidiary of Sony Corporation of America, the North American division of the Japanese conglomerate Sony. It was founded in 1889, evolving from the American Graphophone Company, the successor to the Volta Graphophone Company.',
    totalTracks: 245,
    totalAlbums: 34
  },
  { 
    id: 8, 
    name: 'Def Jam Recordings', 
    labelId: 'L00130', 
    creationDate: '12/08/2025',
    imageSrc: '/images/singer/2.webp',
    bio: 'Def Jam Recordings is an American multinational record label owned by Universal Music Group. It focuses predominantly on hip hop, pop and urban music, owned by Universal Music Group.',
    totalTracks: 178,
    totalAlbums: 25
  },
  { 
    id: 9, 
    name: 'Capitol Records', 
    labelId: 'L00131', 
    creationDate: '24/09/2025',
    imageSrc: '/images/singer/3.webp',
    bio: 'Capitol Records is an American record label owned by Universal Music Group through its Capitol Music Group imprint. It was founded as the first West Coast-based record label in the United States in 1942 by Johnny Mercer, Buddy DeSylva, and Glenn E. Wallichs.',
    totalTracks: 156,
    totalAlbums: 23
  },
  { 
    id: 10, 
    name: 'XL Recordings', 
    labelId: 'L00132', 
    creationDate: '03/10/2025',
    imageSrc: '/images/singer/1.webp',
    bio: 'XL Recordings is a British independent record label founded in 1989 by Tim Palmer and Nick Halkes. It was originally a subsidiary of Beggars Banquet Records.',
    totalTracks: 86,
    totalAlbums: 12
  },
];

// Sorting icon component
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

// Table header component
interface TableHeaderProps {
  label: string;
  sortKey: string;
  currentSort: {
    key: string;
    direction: 'asc' | 'desc';
  };
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

export default function LabelsTable() {
  const router = useRouter();
  const [labels, setLabels] = useState(mockLabels);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentSort, setCurrentSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
  
  // State for label details modal
  const [selectedLabel, setSelectedLabel] = useState<typeof mockLabels[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Items per page
  const itemsPerPage = 8;

  // Filter and sort labels
  const filteredLabels = labels
    .filter(label => 
      label.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      label.labelId.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const key = currentSort.key as keyof typeof a;
      if (a[key] < b[key]) return currentSort.direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return currentSort.direction === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredLabels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLabels = filteredLabels.slice(startIndex, startIndex + itemsPerPage);

  // Handle sort
  const handleSort = (key: string) => {
    setCurrentSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedLabels([]);
    } else {
      const allLabelIds = currentLabels.map(label => label.id);
      setSelectedLabels(allLabelIds);
    }
    setSelectAll(!selectAll);
  };

  // Handle select label
  const handleSelectLabel = (id: number) => {
    setSelectedLabels(prev => {
      if (prev.includes(id)) {
        return prev.filter(labelId => labelId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Handle creating a new label
  const handleCreateNew = () => {
    router.push('/dashboard/create-new?tab=labels');
  };

  // Open label details modal
  const openLabelDetails = (label: typeof mockLabels[0]) => {
    setSelectedLabel(label);
    setIsModalOpen(true);
  };

  // Close label details modal
  const closeLabelDetails = () => {
    setIsModalOpen(false);
  };

  // Handle row click to view label details
  const handleRowClick = (label: typeof mockLabels[0], e: React.MouseEvent) => {
    // Prevent triggering if clicking on a checkbox
    if ((e.target as HTMLElement).tagName === 'INPUT' || 
        (e.target as HTMLElement).closest('input[type="checkbox"]')) {
      return;
    }
    
    openLabelDetails(label);
  };

  return (
    <>
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
                <TableHeader
                  label="Label Title"
                  sortKey="name"
                  currentSort={currentSort}
                  onSort={handleSort}
                />
                <TableHeader
                  label="Label ID"
                  sortKey="labelId"
                  currentSort={currentSort}
                  onSort={handleSort}
                />
                <TableHeader
                  label="Creation Date"
                  sortKey="creationDate"
                  currentSort={currentSort}
                  onSort={handleSort}
                />
              </tr>
            </thead>
            <tbody className="bg-[#161A1F] divide-y divide-gray-700">
              {currentLabels.map((label) => (
                <tr 
                  key={label.id} 
                  className="hover:bg-[#1A1E24] transition-colors cursor-pointer"
                  onClick={(e) => handleRowClick(label, e)}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <input 
                        type="checkbox"
                        className="w-4 h-4 bg-[#1D2229] border-gray-600 rounded text-purple-600 focus:ring-0 focus:ring-offset-0"
                        checked={selectedLabels.includes(label.id)}
                        onChange={() => handleSelectLabel(label.id)}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-white">
                    {label.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{label.labelId}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{label.creationDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filteredLabels.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No labels found. Try adjusting your search or create a new label.
          </div>
        )}

        {/* Pagination */}
        {filteredLabels.length > 0 && (
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
                    {Math.min(startIndex + itemsPerPage, filteredLabels.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredLabels.length}</span> labels
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-[#161A1F] text-sm font-medium ${
                      currentPage === 1 ? 'text-gray-500' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      aria-current={currentPage === page ? 'page' : undefined}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        currentPage === page
                          ? 'z-10 bg-purple-600 border-purple-500 text-white'
                          : 'border-gray-700 bg-[#161A1F] text-gray-300 hover:bg-gray-700'
                      } text-sm font-medium`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-[#161A1F] text-sm font-medium ${
                      currentPage === totalPages ? 'text-gray-500' : 'text-gray-300 hover:bg-gray-700'
                    }`}
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

      {/* Label Details Modal */}
      {selectedLabel && (
        <LabelDetailsModel
          label={selectedLabel}
          isOpen={isModalOpen}
          onClose={closeLabelDetails}
        />
      )}
    </>
  );
} 