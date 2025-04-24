'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Search from './Search';
import Link from 'next/link';
import { getUserData, logout } from '@/services/authService';

// Icons
const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const BellIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-4 h-4 mx-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  title?: string;
  parentTitle?: string | null;
  parentPath?: string | null;
}

export default function Header({ 
  sidebarOpen, 
  setSidebarOpen,
  title: propTitle,
  parentTitle,
  parentPath
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userData, setUserData] = useState<any>(null);

  // Fetch user data on component mount
  useEffect(() => {
    const user = getUserData();
    if (user) {
      setUserData(user);
    }
  }, []);

  // Get page title based on current path when no title is provided
  const getPageTitle = () => {
    if (propTitle) return propTitle;
    
    if (pathname === '/dashboard') return 'Home';
    if (pathname === '/dashboard/finance') return 'Finance';
    if (pathname === '/dashboard/analytics') return 'Analytics';
    
    // Handle Catalogue sub-sections
    if (pathname?.includes('/dashboard/catalogue')) {
      if (pathname === '/dashboard/catalogue') return 'Catalogue';
      if (pathname === '/dashboard/catalogue/releases') return 'Releases';
      if (pathname?.includes('/dashboard/catalogue/releases/new')) return 'Add New Release';
      if (pathname === '/dashboard/catalogue/tracks') return 'Tracks';
      if (pathname?.includes('/dashboard/catalogue/tracks/new')) return 'Add New Track';
      if (pathname === '/dashboard/catalogue/videos') return 'Videos';
      if (pathname?.includes('/dashboard/catalogue/videos/new')) return 'Add New Video';
      if (pathname === '/dashboard/catalogue/artists') return 'Artists';
      if (pathname?.includes('/dashboard/catalogue/artists/new')) return 'Add New Artist';
      if (pathname === '/dashboard/catalogue/labels') return 'Labels';
      if (pathname?.includes('/dashboard/catalogue/labels/new')) return 'Add New Label';
      return 'Catalogue'; // Default for catalogue section
    }
    
    return 'Dashboard'; // Default
  };

  // Get parent title based on current path when no parent is provided
  const getParentTitle = () => {
    if (parentTitle) return parentTitle;
    
    if (pathname?.includes('/dashboard/catalogue/releases')) return 'Catalogue';
    if (pathname?.includes('/dashboard/catalogue/tracks')) return 'Catalogue';
    if (pathname?.includes('/dashboard/catalogue/videos')) return 'Catalogue';
    if (pathname?.includes('/dashboard/catalogue/contributions')) return 'Catalogue';
    if (pathname?.includes('/dashboard/catalogue/artists')) return 'Catalogue';
    if (pathname?.includes('/dashboard/catalogue/labels')) return 'Catalogue';
    
    return null;
  };

  // Get parent path based on current path when no parent path is provided
  const getParentPath = () => {
    if (parentPath) return parentPath;
    
    if (pathname?.includes('/dashboard/catalogue/releases')) return '/dashboard/catalogue';
    if (pathname?.includes('/dashboard/catalogue/tracks')) return '/dashboard/catalogue';
    if (pathname?.includes('/dashboard/catalogue/videos')) return '/dashboard/catalogue';
    if (pathname?.includes('/dashboard/catalogue/contributions')) return '/dashboard/catalogue';
    if (pathname?.includes('/dashboard/catalogue/artists')) return '/dashboard/catalogue';
    if (pathname?.includes('/dashboard/catalogue/labels')) return '/dashboard/catalogue';
    
    return null;
  };

  const displayTitle = getPageTitle();
  const displayParentTitle = getParentTitle();
  const displayParentPath = getParentPath();

  const handleSearch = (query: string) => {
    // In a real app, you would search with the query
    console.log('Searching for:', query);
  };

  const handleLogout = () => {
    // Perform logout using the authService
    logout();
    router.push('/auth/login');
  };

  // Function to get the correct role text to display
  const getRoleDisplay = (role: string) => {
    switch(role) {
      case 'superadmin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'labelowner':
        return 'Label Owner';
      case 'artist':
        return 'Artist';
      default:
        return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User';
    }
  };

  return (
    <header className="bg-[#161A1F] border-b border-gray-700 sticky top-0 z-10">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side */}
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-300 hover:text-white focus:outline-none"
            aria-label="Toggle sidebar"
          >
            <MenuIcon />
          </button>
          
          <div className="ml-4 flex items-center">
            {displayParentTitle && displayParentPath ? (
              <>
                <Link 
                  href={displayParentPath} 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {displayParentTitle}
                </Link>
                <ChevronRightIcon />
              </>
            ) : null}
            <h2 className="text-xl font-semibold text-white">{displayTitle}</h2>
          </div>
        </div>

        {/* Center - Search bar */}
        <div className="flex-1 max-w-xl px-4">
          <Search 
            placeholder="Search for tracks, artists, releases..." 
            onSearch={handleSearch} 
          />
        </div>

        {/* Right side - User info */}
        <div className="flex items-center">
          <button className="mr-4 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none">
            <BellIcon />
          </button>
          
          <div className="flex items-center">
            <Link href="/dashboard/profile" className="flex items-center">
              <div className="relative">
                <img
                  className="h-9 w-9 rounded-full border-2 border-gray-700"
                  src={userData?.profileImage || "/placeholder.png"} 
                  alt="User avatar"
                  onError={(e) => {
                    // Fallback image in case profile image fails to load
                    (e.target as HTMLImageElement).src = "/placeholder.png";
                  }}
                />
                <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-400 border-2 border-gray-800"></span>
              </div>
              
              <div className="ml-3 hidden md:block">
                <p className="text-sm font-medium text-white">{userData?.name || 'User'}</p>
                <p className="text-xs text-gray-400">{userData ? getRoleDisplay(userData.role) : 'Guest'}</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
} 