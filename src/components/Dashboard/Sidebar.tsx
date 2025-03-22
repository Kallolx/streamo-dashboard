'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { House, Books, CurrencyDollar, ChartBar, CaretDown, File, SignOut } from '@phosphor-icons/react';           


interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Always keep catalogue open
  const [catalogueOpen, setCatalogueOpen] = useState(true);
  
  // Ensure catalogue stays open
  useEffect(() => {
    if (!catalogueOpen) {
      setCatalogueOpen(true);
    }
  }, [catalogueOpen]);

  const catalogueItems = [
    { name: 'Releases', path: '/dashboard/catalogue/releases' },
    { name: 'Tracks', path: '/dashboard/catalogue/tracks' },
    { name: 'Videos', path: '/dashboard/catalogue/videos' },
    { name: 'Artists', path: '/dashboard/catalogue/artists' },
    { name: 'Labels', path: '/dashboard/catalogue/labels' },
  ];

  const isActive = (path: string) => {
    // Handle the root path case
    if (path === '/dashboard' && pathname === '/dashboard') {
      return true;
    }
    
    // For exact matches
    if (pathname === path) {
      return true;
    }
    
    // For sub-page matches (like /dashboard/catalogue/releases/new should match releases)
    if (path !== '/dashboard' && pathname?.startsWith(path + '/')) {
      return true;
    }
    
    return false;
  };

  const isActiveCatalogue = () => {
    return catalogueItems.some(item => pathname?.includes(item.path));
  };

  const handleLogout = () => {
    router.push('/auth/login');
  };

  return (
    <div
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } bg-[#161A1F] h-screen fixed transition-all duration-300 ease-in-out z-10`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-700">
          <div className={`transition-all duration-300 ${isOpen ? 'w-40' : 'w-10'}`}>
            <img 
              src="/images/logo.svg" 
              alt="Music Dashboard Logo" 
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 pt-6 px-4 space-y-2">
          <Link
            href="/dashboard"
            className={`flex items-center p-3 rounded-lg transition-colors ${
              isActive('/dashboard')
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            {isActive('/dashboard') ? 
              <House size={20} weight="fill" /> : 
              <House size={20} />
            }
            {isOpen && <span className="ml-3">Home</span>}
          </Link>

          <div>
            <button
              onClick={() => setCatalogueOpen(!catalogueOpen)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                isActiveCatalogue()
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center">
                {isActiveCatalogue() ? 
                  <Books size={20} weight="fill" /> : 
                  <Books size={20} />
                }
                {isOpen && <span className="ml-3">Catalogue</span>}
              </div>
              {isOpen && <CaretDown size={16} />}
            </button>

            {isOpen && (
              <div className="pl-10 mt-1 space-y-1">
                {catalogueItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`flex items-center py-2 px-3 rounded-md transition-colors ${
                      isActive(item.path)
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <File size={16} />
                    <span className="ml-2">{item.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/dashboard/finance"
            className={`flex items-center p-3 rounded-lg transition-colors ${
              isActive('/dashboard/finance')
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            {isActive('/dashboard/finance') ? 
              <CurrencyDollar size={20} weight="fill" /> : 
              <CurrencyDollar size={20} />
            }
            {isOpen && <span className="ml-3">Finance</span>}
          </Link>

          <Link
            href="/dashboard/analytics"
            className={`flex items-center p-3 rounded-lg transition-colors ${
              isActive('/dashboard/analytics')
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            {isActive('/dashboard/analytics') ? 
              <ChartBar size={20} weight="fill" /> : 
              <ChartBar size={20} />
            }
            {isOpen && <span className="ml-3">Analytics</span>}
          </Link>
        </nav>

        {/* Logout Button */}
        <div className="px-4 pb-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-3 rounded-lg transition-colors text-gray-300 hover:bg-gray-700"
          >
            <SignOut size={20} />
            {isOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
} 