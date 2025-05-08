'use client';

import { useState, useRef, useEffect } from 'react';
import { globalSearch, SearchResult } from '@/services/searchService';
import Link from 'next/link';

// Search icon component
const SearchIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// Loading spinner component
const LoadingSpinner = () => (
  <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// Video icon component for track results
const VideoIcon = () => (
  <div className="w-10 h-10 rounded-md flex items-center justify-center bg-purple-800">
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  </div>
);

// CD/Album icon component for release results
const ReleaseIcon = () => (
  <div className="w-10 h-10 rounded-md flex items-center justify-center bg-green-800">
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  </div>
);

// Default image for search results
const DefaultImage = ({ type }: { type: string }) => {
  switch (type) {
    case 'track':
      return <VideoIcon />;
    case 'release':
      return <ReleaseIcon />;
    case 'user':
      return (
        <img
          src="/placeholder.png"
          alt="User"
          className="w-10 h-10 rounded-md object-cover"
          onError={(e) => {
            // Fallback if placeholder image fails to load
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              const defaultImg = document.createElement('div');
              defaultImg.className = 'w-10 h-10 rounded-md flex items-center justify-center bg-teal-800';
              
              const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
              icon.setAttribute("class", "w-5 h-5 text-white");
              icon.setAttribute("fill", "none");
              icon.setAttribute("stroke", "currentColor");
              icon.setAttribute("viewBox", "0 0 24 24");
              icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>';
              
              defaultImg.appendChild(icon);
              parent.appendChild(defaultImg);
            }
          }}
        />
      );
    case 'artist':
      return (
        <div className="w-10 h-10 rounded-md flex items-center justify-center bg-blue-800">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      );
    case 'label':
      return (
        <div className="w-10 h-10 rounded-md flex items-center justify-center bg-yellow-800">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 rounded-md flex items-center justify-center bg-gray-800">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      );
  }
};

// Format type for display
const formatType = (type: string) => {
  switch (type) {
    case 'track':
      return 'Video';
    case 'artist':
      return 'Artist';
    case 'release':
      return 'Release';
    case 'label':
      return 'Label';
    case 'user':
      return 'User';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

interface SearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  liveSearch?: boolean;
}

export default function Search({ 
  placeholder = "Search...", 
  onSearch, 
  className = "",
  liveSearch = true
}: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Live search effect
  useEffect(() => {
    if (liveSearch && query.trim().length >= 2) {
      // Clear any existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Set loading state immediately
      setIsLoading(true);
      
      // Debounce the search to avoid making too many requests
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query);
      }, 300);
    } else if (query.trim().length === 0) {
      // Clear results when query is empty
      setResults([]);
      setIsDropdownOpen(false);
      setHasSearched(false);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, liveSearch]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setError(null);
    setHasSearched(true);
    
    try {
      const response = await globalSearch(searchQuery);
      setResults(response.results);
      setIsDropdownOpen(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setError('Failed to fetch search results. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    await performSearch(query);

    if (onSearch) {
      onSearch(query);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    if (!liveSearch) {
      // When not using live search, clear any existing results
      // but don't run a new search - wait for form submission
      if (newQuery.trim() === '') {
        setResults([]);
        setIsDropdownOpen(false);
        setHasSearched(false);
      }
    }
  };

  // Get URL for search result item based on type
  const getItemUrl = (item: SearchResult) => {
    // Handle MongoDB-style IDs if present in the data object
    const getId = () => {
      if (item.data?._id?.$oid) {
        return item.data._id.$oid;
      }
      return item.id;
    };
    
    const id = getId();
    
    switch (item.type) {
      case 'track':
        // Redirect to catalogue page with tracks tab
        return `/dashboard/catalogue?tab=Videos`;
      case 'artist':
        return `/dashboard/catalogue/artists/${id}`;
      case 'release':
        // Redirect to catalogue page with releases tab
        return `/dashboard/catalogue?tab=Releases`;
      case 'label':
        return `/dashboard/catalogue/labels/${id}`;
      case 'user':
        // For users, go to the user management detail page
        return `/dashboard/user-management/${id}`;
      default:
        return '#';
    }
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? <LoadingSpinner /> : <SearchIcon />}
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-gray-800 text-gray-300 placeholder-gray-400 focus:outline-none focus:bg-gray-700 focus:border-purple-500 focus:text-white"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0 || (hasSearched && results.length === 0) || error) {
              setIsDropdownOpen(true);
            }
          }}
        />
      </form>

      {/* Search Results Dropdown */}
      {isDropdownOpen && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-96 overflow-y-auto">
          {/* Error state */}
          {error && (
            <div className="px-4 py-8 text-center">
              <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2 text-sm text-red-400">{error}</p>
              <button 
                className="mt-3 px-4 py-2 bg-gray-700 rounded-md text-sm text-white hover:bg-gray-600 transition-colors"
                onClick={() => {
                  setError(null);
                  setIsDropdownOpen(false);
                }}
              >
                Try Again
              </button>
            </div>
          )}
          
          {/* No results state */}
          {!error && hasSearched && results.length === 0 && !isLoading && (
            <div className="px-4 py-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="mt-2 text-sm text-gray-400">No results found for "{query}"</p>
              <p className="text-xs text-gray-500 mt-1">Try a different search term</p>
            </div>
          )}
          
          {/* Loading state with minimum query length message */}
          {isLoading && query.length < 2 && liveSearch && (
            <div className="px-4 py-4 text-center">
              <p className="text-sm text-gray-400">Enter at least 2 characters to search</p>
            </div>
          )}
          
          {/* Results list */}
          {!error && results.length > 0 && (
            <ul className="py-1">
              {results.map((result) => (
                <li key={`${result.type}-${result.id}`}>
                  <Link 
                    href={getItemUrl(result)} 
                    className="flex items-center px-4 py-2 hover:bg-gray-700 transition-colors duration-150 ease-in-out"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    {result.type === 'track' ? (
                      <VideoIcon />
                    ) : result.type === 'release' ? (
                      <ReleaseIcon />
                    ) : result.type === 'user' ? (
                      <img 
                        src="/placeholder.png" 
                        alt={result.title} 
                        className="w-10 h-10 rounded-md object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const defaultImg = document.createElement('div');
                            defaultImg.className = 'w-10 h-10 rounded-md flex items-center justify-center bg-teal-800';
                            
                            const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                            icon.setAttribute("class", "w-5 h-5 text-white");
                            icon.setAttribute("fill", "none");
                            icon.setAttribute("stroke", "currentColor");
                            icon.setAttribute("viewBox", "0 0 24 24");
                            icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>';
                            
                            defaultImg.appendChild(icon);
                            parent.appendChild(defaultImg);
                          }
                        }}
                      />
                    ) : result.image ? (
                      <img 
                        src={result.image} 
                        alt={result.title} 
                        className="w-10 h-10 rounded-md object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.appendChild(DefaultImage({ type: result.type }).props.children);
                          }
                        }}
                      />
                    ) : (
                      <DefaultImage type={result.type} />
                    )}

                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{result.title}</p>
                      {result.subtitle && (
                        <p className="text-xs text-gray-400 truncate">{result.subtitle}</p>
                      )}
                    </div>
                    
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-300">
                      {formatType(result.type)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          
          {/* See all results button */}
          {!error && results.length > 9 && (
            <div className="py-2 px-4 border-t border-gray-700">
              <button 
                className="w-full text-center text-sm text-purple-400 hover:text-purple-300"
                onClick={() => {
                  setIsDropdownOpen(false);
                  if (onSearch) onSearch(query);
                }}
              >
                See all results
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}