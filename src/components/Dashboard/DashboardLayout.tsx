'use client';

import { useState, ReactNode, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { restoreAdminCredentials } from '@/services/authService';
import { useRouter } from 'next/navigation';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  parentTitle?: string;
  parentPath?: string;
}

export default function DashboardLayout({ 
  children, 
  title,
  subtitle,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const router = useRouter();

  // Handle responsive layout - close sidebar on mobile by default
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Check on mount
    checkScreenSize();
    
    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    // Check if we're in impersonation mode
    const impersonatingFlag = localStorage.getItem('isImpersonating');
    setIsImpersonating(impersonatingFlag === 'true');
  }, []);
  
  const handleRestoreAdmin = () => {
    const restored = restoreAdminCredentials();
    if (restored) {
      // Remove impersonation flag
      localStorage.removeItem('isImpersonating');
      // Redirect to admin dashboard
      router.push('/dashboard/user-management');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#111417] text-white font-poppins overflow-hidden">
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Fixed Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isMobile={isMobile} />
      
      {/* Main Content - adjust left margin based on sidebar state */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          sidebarOpen && !isMobile ? 'lg:ml-64' : 'lg:ml-20'
        } w-full h-screen overflow-hidden`}
      >
        {/* Fixed Header */}
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          title={title}
        />
        
        {/* Only show the impersonation header when in impersonation mode */}
        {isImpersonating && (
          <div className="px-6 py-3 flex justify-end border-b border-gray-800">
            <button
              onClick={handleRestoreAdmin}
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors flex items-center self-start"
            >
              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Return to Admin
            </button>
          </div>
        )}
        
        {/* Scrollable Content Area */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto">
          {title && (
            <div className="mb-4 md:mb-6">
              <h1 className="text-xl md:text-2xl font-semibold">{title}</h1>
              {subtitle && <p className="text-gray-400 text-sm md:text-base">{subtitle}</p>}
            </div>
          )}
          
          {children}
        </main>
      </div>
    </div>
  );
} 