'use client';

import { useState, ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
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

  return (
    <div className="flex min-h-screen bg-[#111417] text-white font-poppins">
      {/* Fixed Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Main Content - adjust left margin based on sidebar state */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          title={title}
        />
        
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">{title}</h1>
            {subtitle && <p className="text-gray-400">{subtitle}</p>}
          </div>
          
          {children}
        </main>
      </div>
    </div>
  );
} 