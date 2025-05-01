'use client';

import { useState, ReactNode, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

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