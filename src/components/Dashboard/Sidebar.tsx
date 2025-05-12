'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { House, Books, ChartBar, SignOut, User, ArrowsDownUp, CurrencyDollar, ShoppingCart, Files, UserPlus, Shield, Gear } from '@phosphor-icons/react';           
import { useLogo } from '@/contexts/LogoContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isMobile?: boolean;
}

export default function Sidebar({ isOpen, setIsOpen, isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const { logo } = useLogo();
  const [logoError, setLogoError] = useState(false);

  // Get user role from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('userRole');
      setUserRole(role);
    }
  }, []);

  // Reset logo error state when logo changes
  useEffect(() => {
    setLogoError(false);
  }, [logo]);

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
    // Clear user role from localStorage
    localStorage.removeItem('userRole');
    router.push('/auth/login');
  };

  // Close sidebar on link click if on mobile
  const handleLinkClick = (href: string) => {
    if (isMobile) {
      setIsOpen(false);
    }
    // For mobile, manually push the router to the new page
    if (isMobile && href !== pathname) {
      router.push(href);
    }
  };

  // Handle logo loading error
  const handleLogoError = () => {
    console.error('Error loading logo image:', logo);
    setLogoError(true);
  };

  // Determine what to display for the logo
  const renderLogo = () => {
    // Always use local logo if the URL contains amazonaws.com (S3)
    if (logo.includes('amazonaws.com') || logoError) {
      return (
        <img 
          src="/logo.png" 
          alt="Music Dashboard Logo" 
          className="w-full h-auto"
        />
      );
    }
    
    // Use img tag with crossOrigin for all images
    return (
      <img 
        src={logo} 
        alt="Music Dashboard Logo" 
        className="w-full h-auto"
        crossOrigin="anonymous"
        onError={handleLogoError}
      />
    );
  };

  // Check if a menu item should be visible based on user role
  const isMenuItemVisible = (item: string) => {
    if (!userRole) return false; // If no role is set, hide restricted items
    
    if (userRole === 'superadmin') return true; // Superadmin can see everything
    
    if (userRole === 'admin') return true;
   
    
    // For specific roles, show or hide items
    if (item === 'invite-user') {
      return userRole === 'labelowner' || userRole === 'superadmin';
    }
    
    // Only superadmin can see settings
    if (item === 'settings') {
      return userRole === 'superadmin';
    }
    
    // For artist and label owners, hide specific items
    if (item === 'user-management' || item === 'stores' || item === 'distribution') {
      return false;
    }
    
    return true;
  };

  return (
    <div
      className={`${
        isOpen ? 'w-64 translate-x-0' : 'w-20 lg:translate-x-0 -translate-x-full'
      } bg-[#161A1F] h-screen fixed left-0 top-0 transition-all duration-300 ease-in-out z-30 overflow-y-auto`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16">
          <div className={`transition-all duration-300 mt-6 ${isOpen ? 'w-30' : 'w-10'}`}>
            {renderLogo()}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 pt-6 px-4 mt-4">
          {/* Dashboard Section */}
          <Link
            href="/dashboard"
            className={`flex items-center p-3 rounded-lg transition-colors mb-2 ${
              isActive('/dashboard')
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => handleLinkClick('/dashboard')}
          >
            {isActive('/dashboard') ? 
              <House size={20} weight="fill" /> : 
              <House size={20} />
            }
            {isOpen && <span className="ml-3 whitespace-nowrap text-sm">Dashboard</span>}
          </Link>

          {/* Others Section */}         
          <div className="space-y-2">
            <Link
              href="/dashboard/catalogue"
              className={`flex items-center p-3 rounded-lg transition-colors ${
                isActive('/dashboard/catalogue')
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => handleLinkClick('/dashboard/catalogue')}
            >
              {isActive('/dashboard/catalogue') ? 
                <Books size={20} weight="fill" /> : 
                <Books size={20} />
              }
              {isOpen && <span className="ml-3 whitespace-nowrap text-sm">Catalogue</span>}
            </Link>

            <Link
              href="/dashboard/transactions"
              className={`flex items-center p-3 rounded-lg transition-colors ${
                isActive('/dashboard/transactions')
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => handleLinkClick('/dashboard/transactions')}
            >
              {isActive('/dashboard/transactions') ? 
                <ArrowsDownUp size={20} weight="fill" /> : 
                <ArrowsDownUp size={20} />
              }
              {isOpen && <span className="ml-3 whitespace-nowrap text-sm">Transactions</span>}
            </Link>

            <Link
              href="/dashboard/royalties"
              className={`flex items-center p-3 rounded-lg transition-colors ${
                isActive('/dashboard/royalties')
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => handleLinkClick('/dashboard/royalties')}
            >
              {isActive('/dashboard/royalties') ? 
                <CurrencyDollar size={20} weight="fill" /> : 
                <CurrencyDollar size={20} />
              }
              {isOpen && <span className="ml-3 whitespace-nowrap text-sm">Royalties</span>}
            </Link>

            <Link
              href="/dashboard/statements"
              className={`flex items-center p-3 rounded-lg transition-colors ${
                isActive('/dashboard/statements')
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => handleLinkClick('/dashboard/statements')}
            >
              {isActive('/dashboard/statements') ? 
                <Files size={20} weight="fill" /> : 
                <Files size={20} />
              }
              {isOpen && <span className="ml-3 whitespace-nowrap text-sm">Statements</span>}
            </Link>

            <Link
              href="/dashboard/analytics"
              className={`flex items-center p-3 rounded-lg transition-colors ${
                isActive('/dashboard/analytics')
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => handleLinkClick('/dashboard/analytics')}
            >
              {isActive('/dashboard/analytics') ? 
                <ChartBar size={20} weight="fill" /> : 
                <ChartBar size={20} />
              }
              {isOpen && <span className="ml-3 whitespace-nowrap text-sm">Analytics</span>}
            </Link>

            {isMenuItemVisible('user-management') && (
              <Link
                href="/dashboard/user-management"
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isActive('/dashboard/user-management')
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => handleLinkClick('/dashboard/user-management')}
              >
                {isActive('/dashboard/user-management') ? 
                  <User size={20} weight="fill" /> : 
                  <User size={20} />
                }
                {isOpen && <span className="ml-3 whitespace-nowrap text-sm">Manage Users</span>}
              </Link>
            )}

            {isMenuItemVisible('invite-user') && (
              <Link
                href="/dashboard/invite-user"
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isActive('/dashboard/invite-user')
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => handleLinkClick('/dashboard/invite-user')}
              >
                {isActive('/dashboard/invite-user') ? 
                  <UserPlus size={20} weight="fill" /> : 
                  <UserPlus size={20} />
                }
                {isOpen && <span className="ml-3 whitespace-nowrap text-sm">Invite Users</span>}
              </Link>
            )}           
            <Link
              href="/dashboard/withdraw-request"
              className={`flex items-center p-3 rounded-lg transition-colors ${
                isActive('/dashboard/withdraw-request')
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => handleLinkClick('/dashboard/withdraw-request')}
            >
              {isActive('/dashboard/withdraw-request') ? 
                <CurrencyDollar size={20} weight="fill" /> : 
                <CurrencyDollar size={20} />
              }
              {isOpen && <span className="ml-3 whitespace-nowrap text-sm">Payout Request</span>}
            </Link>

            {isMenuItemVisible('distribution') && (
              <Link
                href="/dashboard/distribution"
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isActive('/dashboard/distribution')
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => handleLinkClick('/dashboard/distribution')}
              >
                {isActive('/dashboard/distribution') ? 
                  <ArrowsDownUp size={20} weight="fill" /> : 
                  <ArrowsDownUp size={20} />
                }
                {isOpen && <span className="ml-3 whitespace-nowrap text-sm">Distribution</span>}
              </Link>
            )}

            {isMenuItemVisible('stores') && (
              <Link
                href="/dashboard/stores"
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isActive('/dashboard/stores')
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => handleLinkClick('/dashboard/stores')}
              >
                {isActive('/dashboard/stores') ? 
                  <ShoppingCart size={20} weight="fill" /> : 
                  <ShoppingCart size={20} />
                }
                {isOpen && <span className="ml-3 whitespace-nowrap text-sm">Partner Platforms</span>}
              </Link>
            )}
             <Link
              href="/dashboard/rights-management"
              className={`flex items-center p-3 rounded-lg transition-colors ${
                isActive('/dashboard/rights-management')
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => handleLinkClick('/dashboard/rights-management')}
            >
              {isActive('/dashboard/rights-management') ? 
                <Shield size={20} weight="fill" /> : 
                <Shield size={20} />
              }
              {isOpen && <span className="ml-3 whitespace-nowrap text-sm">Rights Management</span>}
            </Link>

          </div>
        </nav>

        {/* Logout Button */}
        <div className="px-4 pb-6 flex items-center justify-between">
          {isMenuItemVisible('settings') && (
            <Link
              href="/dashboard/settings"
              className="flex items-center p-3 rounded-lg transition-colors text-gray-300 hover:bg-gray-700"
              onClick={() => handleLinkClick('/dashboard/settings')}
            >
              <Gear size={20} />
              {isOpen && <span className="ml-3 whitespace-nowrap text-sm">Settings</span>}
            </Link>
          )}
          <button
            onClick={() => {
              if (isMobile) {
                setIsOpen(false);
              }
              handleLogout();
            }}
            className="flex items-center p-3 rounded-lg transition-colors text-gray-300 hover:bg-gray-700"
          >
            <SignOut size={20} />
            {isOpen && <span className="ml-3 whitespace-nowrap text-sm">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
} 