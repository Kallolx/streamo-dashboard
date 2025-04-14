'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { House, Books, ChartBar, SignOut, User, ArrowsDownUp, CurrencyDollar, ShoppingCart } from '@phosphor-icons/react';           


interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => {
    // Handle the root path case
    if (path === '/dashboard' && pathname === '/dashboard') {
      return true;
    }
    
    // For exact matches
    if (pathname === path) {
      return true;
    }
    
    // For sub-page matches (like /dashboard/catalogue/releases/new should match catalogue)
    if (path !== '/dashboard' && pathname?.startsWith(path)) {
      return true;
    }
    
    return false;
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
        <nav className="flex-1 pt-6 px-4 mt-4">
          {/* Dashboard Section */}
          {isOpen && <span className="text-xs font-medium text-blue-400 px-3 mb-1 block">DASHBOARD</span>}
          
          <Link
            href="/dashboard"
            className={`flex items-center p-3 rounded-lg transition-colors mb-2 ${
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

          {/* Others Section */}
          {isOpen && <span className="text-xs font-medium text-gray-400 px-3 mt-4 mb-1 block">OTHERS</span>}
          
          <div className="space-y-2">
            <Link
              href="/dashboard/catalogue"
              className={`flex items-center p-3 rounded-lg transition-colors ${
                isActive('/dashboard/catalogue')
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {isActive('/dashboard/catalogue') ? 
                <Books size={20} weight="fill" /> : 
                <Books size={20} />
              }
              {isOpen && <span className="ml-3">Catalogue</span>}
            </Link>

            <Link
              href="/dashboard/transactions"
              className={`flex items-center p-3 rounded-lg transition-colors ${
                isActive('/dashboard/transactions')
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {isActive('/dashboard/transactions') ? 
                <ArrowsDownUp size={20} weight="fill" /> : 
                <ArrowsDownUp size={20} />
              }
              {isOpen && <span className="ml-3">Transactions</span>}
            </Link>

            <Link
              href="/dashboard/royalties"
              className={`flex items-center p-3 rounded-lg transition-colors ${
                isActive('/dashboard/royalties')
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {isActive('/dashboard/royalties') ? 
                <CurrencyDollar size={20} weight="fill" /> : 
                <CurrencyDollar size={20} />
              }
              {isOpen && <span className="ml-3">Royalties</span>}
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

            <Link
              href="/dashboard/user-management"
              className={`flex items-center p-3 rounded-lg transition-colors ${
                isActive('/dashboard/user-management')
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {isActive('/dashboard/user-management') ? 
                <User size={20} weight="fill" /> : 
                <User size={20} />
              }
              {isOpen && <span className="ml-3">User Management</span>}
            </Link>

            <Link
              href="/dashboard/withdraw-request"
              className={`flex items-center p-3 rounded-lg transition-colors ${
                isActive('/dashboard/withdraw-request')
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {isActive('/dashboard/withdraw-request') ? 
                <CurrencyDollar size={20} weight="fill" /> : 
                <CurrencyDollar size={20} />
              }
              {isOpen && <span className="ml-3">Withdraw Request</span>}
            </Link>

            <Link
              href="/dashboard/distribution"
              className={`flex items-center p-3 rounded-lg transition-colors ${
                isActive('/dashboard/distribution')
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {isActive('/dashboard/distribution') ? 
                <ArrowsDownUp size={20} weight="fill" /> : 
                <ArrowsDownUp size={20} />
              }
              {isOpen && <span className="ml-3">Distribution</span>}
            </Link>

            <Link
              href="/dashboard/stores"
              className={`flex items-center p-3 rounded-lg transition-colors ${
                isActive('/dashboard/stores')
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {isActive('/dashboard/stores') ? 
                <ShoppingCart size={20} weight="fill" /> : 
                <ShoppingCart size={20} />
              }
              {isOpen && <span className="ml-3">Stores</span>}
            </Link>
          </div>
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