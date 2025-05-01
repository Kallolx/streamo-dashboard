"use client";

import { useState, useEffect } from "react";
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

  // Debug log the releases array
  useEffect(() => {
    console.log("Releases data received:", releases);
    console.log("Number of releases:", releases?.length || 0);
  }, [releases]);

  // Handle search form submission
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    // The search is already handled by the filteredReleases calculation
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
          {/* Format filter */}
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="bg-[#1D2229] border border-gray-700 text-white text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 p-2.5"
          >
            <option value="all">All Formats</option>
            {formats.map((format) => (
              <option key={format} value={format}>
                {format.charAt(0).toUpperCase() + format.slice(1)}
              </option>
            ))}
          </select>

          {/* Genre filter */}
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-[#1D2229] border border-gray-700 text-white text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 p-2.5"
          >
            <option value="all">All Genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre.charAt(0).toUpperCase() + genre.slice(1)}
              </option>
            ))}
          </select>
          
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
      
      {/* Table */}
      <div className="overflow-x-auto overflow-y-hidden rounded-lg">
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
              <TableHeader label="Genre" sortKey="genre" currentSort={currentSort} onSort={handleSort} />
              <TableHeader label="Format" sortKey="format" currentSort={currentSort} onSort={handleSort} />
              <TableHeader label="UPC" sortKey="upc" currentSort={currentSort} onSort={handleSort} />
              <TableHeader label="Release Date" sortKey="releaseDate" currentSort={currentSort} onSort={handleSort} />
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
              filteredReleases.map((release) => (
                <tr
                  key={release._id}
                  className="hover:bg-[#1A1E24] transition-colors cursor-pointer"
                  onClick={(e) => handleRowClick(release._id, e)}
                >
                  <td className="sticky left-0 z-10 bg-[#161A1F] hover:bg-[#1A1E24] px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <input 
                        type="checkbox"
                        className="w-4 h-4 bg-[#1D2229] border-gray-600 rounded text-purple-600 focus:ring-0 focus:ring-offset-0"
                        checked={selectedReleases.includes(release._id)}
                        onChange={() => handleSelectRelease(release._id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link 
                      href={`/dashboard/catalogue/releases/${release._id}`} 
                      className="text-white hover:text-purple-400"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="truncate max-w-[250px] inline-block">{release.title}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap truncate max-w-[150px]">{release.artist}</td>
                  <td className="px-4 py-3 whitespace-nowrap capitalize">{release.genre || "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap capitalize">{release.format || "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">{release.upc || "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(release.releaseDate)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`${
                      release.status === "approved" 
                        ? "text-green-400" 
                        : release.status === "rejected"
                        ? "text-red-400"
                        : "text-gray-400"
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

                      {/* Admin/SuperAdmin: Approve button */}
                      {(userRole === 'admin' || userRole === 'superadmin') && 
                        (release.status === 'processing' || release.status === 'submitted') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onReleaseSelect(release._id);
                            // This will open the modal where they can approve
                          }}
                          className="text-green-500 hover:text-green-400"
                          title="Approve Release"
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
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                        </button>
                      )}

                      {/* Admin/SuperAdmin: Reject button */}
                      {(userRole === 'admin' || userRole === 'superadmin') && 
                        (release.status === 'processing' || release.status === 'submitted') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onReleaseSelect(release._id);
                            // This will open the modal where they can reject
                          }}
                          className="text-red-500 hover:text-red-400"
                          title="Reject Release"
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
                              d="M6 18L18 6M6 6l12 12"
                            ></path>
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 