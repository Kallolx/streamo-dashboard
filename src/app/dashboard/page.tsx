"use client";

import { useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DashboardHome from "@/components/Dashboard/DashboardHome";
import AdminTools from '@/components/Dashboard/AdminTools';
import { isAdmin } from '@/services/authService';

// Chevron icons for expand/collapse
const ChevronDownIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

export default function Dashboard() {
  // State to control visibility of admin tools
  const [showAdminTools, setShowAdminTools] = useState(false);
  
  return (
    <DashboardLayout>
      {isAdmin() && (
        <div className="mb-6 sm:mb-8">
          <div 
            className="flex justify-between items-center mb-3 sm:mb-4 cursor-pointer bg-[#161A1F] p-4 rounded-lg"
            onClick={() => setShowAdminTools(!showAdminTools)}
          >
            <div className="flex items-center">
              <svg 
                className="w-5 h-5 mr-2 text-purple-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                />
              </svg>
              <h2 className="text-lg font-bold text-white">Admin Tools</h2>
              <span className="ml-2 px-2 py-0.5 bg-purple-900 text-white text-xs rounded-md">Admin Only</span>
            </div>
            <button className="text-gray-400 hover:text-white transition-colors">
              {showAdminTools ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </button>
          </div>
          
          {/* Collapsible Admin Tools content */}
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
            showAdminTools ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <AdminTools />
          </div>
        </div>
      )}
      <DashboardHome />
    </DashboardLayout>
  );
} 