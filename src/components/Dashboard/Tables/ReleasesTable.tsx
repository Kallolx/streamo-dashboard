"use client";

import { useState, useEffect, useRef } from "react";
import { FormEvent } from "react";
import Link from "next/link";

// Track interface
interface Track {
  title: string;
  artistName: string;
  duration?: string;
  isrc?: string;
  version?: string;
  contentRating?: string;
  lyrics?: string;
}

// Interface for the release data
interface Release {
  _id: string;
  title: string;
  artist: string;
  coverArt: string;
  releaseType: string;
  genre: string;
  format: string;
  upc: string;
  duration: string;
  releaseDate: string;
  createdAt: string;
  updatedAt: string;
  tracks?: Track[];
  status: string;
  stores: string[];
  userId?: string;
}

// Props interface for the table
interface ReleasesTableProps {
  releases: Release[];
  onReleaseSelect: (releaseId: string) => void;
  userRole?: 'admin' | 'superadmin' | 'artist' | 'label';
  userId?: string;
}

// Table header component
interface TableHeaderProps {
  label: string;
  sortKey?: string;
  currentSort?: { key: string; direction: 'asc' | 'desc' };
  onSort?: (key: string) => void;
}

const TableHeader = ({ label, sortKey, currentSort, onSort }: TableHeaderProps) => {
  const isSorted = sortKey && currentSort?.key === sortKey;
  
  return (
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
      <div className="flex items-center">
        {sortKey && onSort ? (
          <button
            className="group flex items-center"
            onClick={() => onSort(sortKey)}
          >
            {label}
            <span className="ml-1">
              {isSorted && currentSort?.direction === 'asc' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : isSorted && currentSort?.direction === 'desc' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              )}
            </span>
          </button>
        ) : (
          label
        )}
      </div>
    </th>
  );
};

export default function ReleasesTable({ 
  releases, 
  onReleaseSelect, 
  userRole = 'artist', 
  userId
}: ReleasesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedFormat, setSelectedFormat] = useState("all");
  const [selectedReleases, setSelectedReleases] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentSort, setCurrentSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({ 
    key: 'createdAt', 
    direction: 'desc' 
  });
  
  // Filter dropdown state
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Debug log the releases array
  useEffect(() => {
    console.log("Releases data received:", releases);
    console.log("Number of releases:", releases?.length || 0);
  }, [releases]);

  // Handle search form submission
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    // The search is already handled by the filteredReleases calculation
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle sort
  const handleSort = (key: string) => {
    setCurrentSort(prevSort => ({
      key,
      direction: prevSort.key === key && prevSort.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle release selection
  const handleSelectRelease = (releaseId: string) => {
    setSelectedReleases(prev => 
      prev.includes(releaseId) 
        ? prev.filter(id => id !== releaseId) 
        : [...prev, releaseId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedReleases([]);
    } else {
      setSelectedReleases(filteredReleases.map(release => release._id));
    }
    setSelectAll(!selectAll);
  };

  // Handle row click with checkbox exclusion
  const handleRowClick = (releaseId: string, e: React.MouseEvent) => {
    // Prevent row click if clicking on checkbox
    if ((e.target as HTMLElement).closest('input[type="checkbox"]')) {
      return;
    }
    onReleaseSelect(releaseId);
  };

  // Filter and sort releases based on search term, format, genre, and current sort
  const filteredReleases = releases
    .filter((release) => {
      // Filter by search term
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        release.title.toLowerCase().includes(searchLower) ||
        release.artist.toLowerCase().includes(searchLower);
        
      // Filter by format
      const matchesFormat =
        selectedFormat === "all" || release.format === selectedFormat;
        
      // Filter by genre
      const matchesGenre =
        selectedGenre === "all" || release.genre === selectedGenre;
        
      return matchesSearch && matchesFormat && matchesGenre;
    })
    .sort((a, b) => {
      // Sort by the current sort key and direction
      const key = currentSort.key as keyof Release;
      const direction = currentSort.direction === 'asc' ? 1 : -1;
      
      if (key === 'releaseDate' || key === 'createdAt' || key === 'updatedAt') {
        return direction * (new Date(a[key]).getTime() - new Date(b[key]).getTime());
      }
      
      // For string fields
      if (typeof a[key] === 'string' && typeof b[key] === 'string') {
        return direction * a[key].localeCompare(b[key]);
      }
      
      return 0;
    });

  // Pagination calculation
  const totalPages = Math.ceil(filteredReleases.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentReleases = filteredReleases.slice(indexOfFirstRow, indexOfLastRow);

  // Page navigation handlers
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Effect to update selectAll state when selectedReleases changes
  useEffect(() => {
    if (filteredReleases.length > 0 && selectedReleases.length === filteredReleases.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedReleases, filteredReleases]);

  // Get unique genres from releases
  const genres = Array.isArray(releases) ? [...new Set(releases.map(release => release.genre))] : [];
  
  // Get unique formats from releases
  const formats = Array.isArray(releases) ? [...new Set(releases.map(release => release.format))] : [];

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const maxPageButtons = 5; // Max number of page buttons to show
    
    if (totalPages <= maxPageButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    let startPage = Math.max(currentPage - Math.floor(maxPageButtons / 2), 1);
    const endPage = Math.min(startPage + maxPageButtons - 1, totalPages);
    
    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(endPage - maxPageButtons + 1, 1);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  // Default image fallback if release has no cover art
  const defaultImage = "";

  // Handle outside click for filter dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Generate CSV data
  const generateCSV = () => {
    // CSV header row
    const header = ['Title', 'Artist', 'ISRC', 'Version', 'Content Rating', 'Status', 'Release Date'];
    
    // Map filtered releases to CSV rows
    const rows = filteredReleases.map(release => {
      const track = Array.isArray(release.tracks) && release.tracks.length > 0 ? release.tracks[0] : null;
      return [
        track?.title || '',
        track?.artistName || release.artist || '',
        track?.isrc || '',
        track?.version || '',
        track?.contentRating || '',
        release.status,
        release.releaseDate
      ];
    });
    
    // Combine header and rows
    const csvContent = [
      header.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    return csvContent;
  };
  
  // Handle CSV download
  const handleDownloadCSV = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `releases_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#161A1F] rounded-lg pt-6 pb-8 px-4 sm:px-6 h-full flex flex-col">
      {/* Header controls in a single row */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="w-full sm:flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              type="search"
              className="block w-full p-2.5 pl-10 text-sm text-white border border-gray-700 rounded-lg bg-[#1D2229] focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Search releases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          {/* Filter dropdown button */}
          <div ref={filterDropdownRef} className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="bg-[#1D2229] border border-gray-700 text-white text-sm rounded-lg hover:bg-[#252A32] focus:outline-none focus:ring-1 focus:ring-purple-500 p-2.5 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
              </svg>
              Filters
              {(selectedFormat !== 'all' || selectedGenre !== 'all') && (
                <span className="ml-1.5 flex h-2 w-2 rounded-full bg-purple-500"></span>
              )}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showFilterDropdown ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}></path>
              </svg>
            </button>
            
            {/* Filter dropdown */}
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-[#1D2229] border border-gray-700 rounded-lg shadow-lg z-20 p-4 space-y-3">
                {/* Format filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Format</label>
                  <select
                    value={selectedFormat}
                    onChange={(e) => {
                      setSelectedFormat(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-[#161A1F] border border-gray-700 text-white text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 p-2 w-full"
                  >
                    <option value="all">All Formats</option>
                    {formats.map((format) => (
                      <option key={format} value={format}>
                        {format.charAt(0).toUpperCase() + format.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Genre filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Genre</label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => {
                      setSelectedGenre(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-[#161A1F] border border-gray-700 text-white text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 p-2 w-full"
                  >
                    <option value="all">All Genres</option>
                    {genres.map((genre) => (
                      <option key={genre} value={genre}>
                        {genre.charAt(0).toUpperCase() + genre.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
          
          {/* CSV Download button */}
          <button
            onClick={handleDownloadCSV}
            className="bg-[#1D2229] border border-gray-700 text-white text-sm rounded-lg hover:bg-[#252A32] focus:outline-none focus:ring-1 focus:ring-purple-500 p-2.5 flex items-center"
            title="Download as CSV"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Export CSV
          </button>
          
          {/* Create New button */}
          <a 
            href="/dashboard/create-new?tab=releases" 
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-md transition-colors flex items-center whitespace-nowrap"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Create New
          </a>
        </div>
      </div>
      
      {/* Selected releases count bubble */}
      {selectedReleases.length > 0 && (
        <div className="mb-3 bg-purple-600/20 border border-purple-600/30 rounded-md py-1.5 px-3 text-sm text-purple-300 inline-flex items-center">
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          {selectedReleases.length} {selectedReleases.length === 1 ? 'release' : 'releases'} selected
        </div>
      )}
      
      {/* Table */}
      <div className="overflow-x-auto overflow-y-hidden rounded-lg flex-grow">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-[#1A1E24]">
            <tr>
              {/* Select column with radio buttons */}
              <th className="sticky left-0 z-10 bg-[#1A1E24] w-10 px-2 py-3">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded bg-gray-800 border-gray-600 text-purple-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                  </div>
                </div>
              </th>
              
              <th className="sticky left-10 z-10 bg-[#1A1E24] w-16 px-2 py-3">
                <div className="flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Art</span>
                </div>
              </th>
              <TableHeader label="Track Title" />
              <TableHeader label="Track Artist" />
              <TableHeader label="ISRC" />
              <TableHeader label="Version" />
              <TableHeader label="Content Rating" />
              <TableHeader label="Status" sortKey="status" currentSort={currentSort} onSort={handleSort} />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#161A1F] divide-y divide-gray-700">
            {!Array.isArray(releases) || releases.length === 0 ? (
              <tr className="bg-[#161A1F] border-b border-gray-700">
                <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                  No releases found. Create your first release!
                </td>
              </tr>
            ) : !Array.isArray(filteredReleases) || filteredReleases.length === 0 ? (
              <tr className="bg-[#161A1F] border-b border-gray-700">
                <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                  {searchTerm || selectedFormat !== "all" || selectedGenre !== "all"
                    ? "No releases match your search criteria."
                    : "No releases found. Create your first release!"}
                </td>
              </tr>
            ) : (
              currentReleases.map((release) => {
                const track = Array.isArray(release.tracks) && release.tracks.length > 0 ? release.tracks[0] : null;
                return (
                  <tr
                    key={release._id}
                    className="hover:bg-[#1A1E24] transition-colors cursor-pointer"
                    onClick={(e) => handleRowClick(release._id, e)}
                  >
                    {/* Radio button cell */}
                    <td className="sticky left-0 z-10 bg-[#161A1F] hover:bg-[#1A1E24] px-2 py-3 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={selectedReleases.includes(release._id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectRelease(release._id);
                          }}
                          className="h-4 w-4 rounded bg-gray-800 border-gray-600 text-purple-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                      </div>
                    </td>
                    
                    {/* Cover art - increased size */}
                    <td className="sticky left-10 z-10 bg-[#161A1F] hover:bg-[#1A1E24] px-2 py-3 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-800 flex items-center justify-center">
                          {release.coverArt ? (
                            <img
                              src={release.coverArt}
                              alt={release.title}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<svg 
                                    class="w-6 h-6 text-gray-500" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24" 
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path 
                                      stroke-linecap="round" 
                                      stroke-linejoin="round" 
                                      stroke-width="1.5" 
                                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" 
                                    />
                                  </svg>`;
                                }
                              }}
                            />
                          ) : (
                            <svg 
                              className="w-6 h-6 text-gray-500" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={1.5} 
                                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" 
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap">{track?.title || '-'}</td>
                    
                    {/* Artist name with truncation */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="max-w-[150px] truncate" title={track?.artistName || '-'}>
                        {track?.artistName || '-'}
                      </div>
                    </td>
                    
                    <td className="px-4 py-3 whitespace-nowrap">{track?.isrc || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{track?.version || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{track?.contentRating || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`${
                        release.status === 'approved' ? 'text-green-400' :
                        release.status === 'rejected' ? 'text-red-400' :
                        release.status === 'processing' ? 'text-blue-400' :
                        'text-yellow-400'
                      }`}>
                        {release.status.charAt(0).toUpperCase() + release.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {/* View button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onReleaseSelect(release._id);
                          }}
                          className="text-blue-500 hover:text-blue-400"
                          title="View Details"
                        >
                          <svg 
                            className="w-5 h-5" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth="2" 
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            ></path>
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth="2" 
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            ></path>
                          </svg>
                        </button>
                        {/* Admin/SuperAdmin: Approve/Reject buttons (if needed) */}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination UI */}
      {filteredReleases.length > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between">
          <div className="text-gray-400 text-sm mb-4 sm:mb-0">
            Showing {indexOfFirstRow + 1}-{Math.min(indexOfLastRow, filteredReleases.length)} of {filteredReleases.length} releases
          </div>
          <div className="flex items-center space-x-2">
            {/* Previous page button */}
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-[#1D2229] text-gray-300 hover:bg-[#252A32]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Page numbers */}
            {getPageNumbers().map(pageNumber => (
              <button
                key={pageNumber}
                onClick={() => goToPage(pageNumber)}
                className={`w-8 h-8 flex items-center justify-center rounded-md ${
                  currentPage === pageNumber
                    ? 'bg-purple-600 text-white'
                    : 'bg-[#1D2229] text-gray-300 hover:bg-[#252A32]'
                }`}
              >
                {pageNumber}
              </button>
            ))}
            
            {/* Next page button */}
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-[#1D2229] text-gray-300 hover:bg-[#252A32]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 