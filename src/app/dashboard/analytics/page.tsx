"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";

export default function AnalyticsPage() {
  const [performanceTimeframe, setPerformanceTimeframe] = useState("thisMonth");
  const [countriesTimeframe, setCountriesTimeframe] = useState("thisMonth");
  const [showPerformanceDropdown, setShowPerformanceDropdown] = useState(false);
  const [showCountriesDropdown, setShowCountriesDropdown] = useState(false);

  // Toggle dropdown visibility
  const togglePerformanceDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPerformanceDropdown(!showPerformanceDropdown);
    setShowCountriesDropdown(false);
  };

  const toggleCountriesDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCountriesDropdown(!showCountriesDropdown);
    setShowPerformanceDropdown(false);
  };

  // Handle timeframe selection
  const selectTimeframe = (dropdown: 'performance' | 'countries', value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (dropdown === 'performance') {
      setPerformanceTimeframe(value);
      setShowPerformanceDropdown(false);
    } else {
      setCountriesTimeframe(value);
      setShowCountriesDropdown(false);
    }
  };

  // Close dropdown when clicking outside for performance and countries
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Performance dropdown
      const performanceButton = document.getElementById('performance-dropdown-button');
      const performanceDropdown = document.getElementById('performance-dropdown');
      
      if (performanceButton && performanceDropdown) {
        if (!performanceButton.contains(e.target as Node) && 
            !performanceDropdown.contains(e.target as Node)) {
          setShowPerformanceDropdown(false);
        }
      }
      
      // Countries dropdown
      const countriesButton = document.getElementById('countries-dropdown-button');
      const countriesDropdown = document.getElementById('countries-dropdown');
      
      if (countriesButton && countriesDropdown) {
        if (!countriesButton.contains(e.target as Node) && 
            !countriesDropdown.contains(e.target as Node)) {
          setShowCountriesDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to get display text for timeframe
  const getTimeframeText = (value: string) => {
    switch (value) {
      case 'thisMonth': return 'This Month';
      case 'lastMonth': return 'Last Month';
      case 'last3Months': return 'Last 3 Months';
      case 'last6Months': return 'Last 6 Months';
      case 'thisYear': return 'This Year';
      case 'allTime': return 'All Time';
      default: return 'This Month';
    }
  };

  return (
    <DashboardLayout title="Analytics" subtitle="Track your music performance">
      <div className="p-8 rounded-lg">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-[#1A1E24] p-5 rounded-lg">
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm mb-2">Total Users</span>
              <div className="flex items-center justify-between">
                <span className="text-white text-2xl font-bold">339</span>
                <div className="h-8 w-8 bg-[#232830] rounded-full flex items-center justify-center text-[#A365FF]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Total Music */}
          <div className="bg-[#1A1E24] p-5 rounded-lg">
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm mb-2">Total Music</span>
              <div className="flex items-center justify-between">
                <span className="text-white text-2xl font-bold">6599</span>
                <div className="h-8 w-8 bg-[#232830] rounded-full flex items-center justify-center text-[#A365FF]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Total Videos */}
          <div className="bg-[#1A1E24] p-5 rounded-lg">
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm mb-2">Total Videos</span>
              <div className="flex items-center justify-between">
                <span className="text-white text-2xl font-bold">559</span>
                <div className="h-8 w-8 bg-[#232830] rounded-full flex items-center justify-center text-[#A365FF]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="20" height="20" rx="2.18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 9l5 3-5 3V9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Total Royalty */}
          <div className="bg-[#1A1E24] p-5 rounded-lg">
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm mb-2">Total Royalty</span>
              <div className="flex items-center justify-between">
                <span className="text-white text-2xl font-bold">$12,480</span>
                <div className="h-8 w-8 bg-[#232830] rounded-full flex items-center justify-center text-[#A365FF]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Performance Analytics */}
          <div className="p-5 rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-medium">Performance Analytics</h3>
              <div className="relative">
                <button 
                  id="performance-dropdown-button"
                  className="bg-[#232830] text-gray-300 px-3 py-1.5 rounded text-sm flex items-center"
                  onClick={togglePerformanceDropdown}
                >
                  <span>{getTimeframeText(performanceTimeframe)}</span>
                  <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                
                {showPerformanceDropdown && (
                  <div 
                    id="performance-dropdown"
                    className="absolute right-0 mt-1 w-40 bg-[#232830] rounded-md shadow-lg z-50"
                  >
                    <div className="py-1">
                      {['thisMonth', 'lastMonth', 'last3Months', 'last6Months', 'thisYear', 'allTime'].map((value) => (
                        <button 
                          key={value}
                          className={`block px-4 py-2 text-sm w-full text-left ${
                            performanceTimeframe === value ? 'text-[#A365FF]' : 'text-gray-300 hover:bg-[#1A1E24]'
                          }`}
                          onClick={(e) => selectTimeframe('performance', value, e)}
                        >
                          {getTimeframeText(value)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chart */}
            <div className="h-90 rounded-lg p-4">
              <div className="relative h-full">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 py-2">
                  <span>50K</span>
                  <span>10K</span>
                  <span>1K</span>
                  <span>500</span>
                  <span>100</span>
                  <span>00</span>
                </div>
                
                {/* Chart area with horizontal grid lines */}
                <div className="absolute left-10 right-0 top-0 bottom-0">
                  {/* Horizontal grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    <div className="border-t border-[#2A303A]"></div>
                    <div className="border-t border-[#2A303A]"></div>
                    <div className="border-t border-[#2A303A]"></div>
                    <div className="border-t border-[#2A303A]"></div>
                    <div className="border-t border-[#2A303A]"></div>
                    <div className="border-t border-[#2A303A]"></div>
                  </div>
                  
                  {/* SVG for the chart */}
                  <svg 
                    viewBox="0 0 1000 300"
                    className="w-full h-full"
                    preserveAspectRatio="none"
                  >
                    {/* Horizontal grid lines */}
                    <line x1="0" y1="0" x2="1000" y2="0" stroke="#2A303A" strokeWidth="1" />
                    <line x1="0" y1="60" x2="1000" y2="60" stroke="#2A303A" strokeWidth="1" />
                    <line x1="0" y1="120" x2="1000" y2="120" stroke="#2A303A" strokeWidth="1" />
                    <line x1="0" y1="180" x2="1000" y2="180" stroke="#2A303A" strokeWidth="1" />
                    <line x1="0" y1="240" x2="1000" y2="240" stroke="#2A303A" strokeWidth="1" />
                    <line x1="0" y1="300" x2="1000" y2="300" stroke="#2A303A" strokeWidth="1" />
                    
                    {/* Chart line */}
                    <path 
                      d="M0,260 C30,220 60,250 90,170 C120,120 150,250 180,250 C210,230 240,100 270,50 C300,20 330,60 360,120 C390,180 420,150 450,220 C480,260 510,220 540,120 C570,50 600,100 630,50 C660,80 690,150 720,130 C750,110 780,180 810,140 C840,100 870,250 900,200 C930,150 970,100 1000,70"
                      fill="none"
                      stroke="#A365FF"
                      strokeWidth="2"
                    />
                    
                    {/* Fill gradient */}
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#A365FF" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#A365FF" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Fill area */}
                    <path 
                      d="M0,260 C30,220 60,250 90,170 C120,120 150,250 180,250 C210,230 240,100 270,50 C300,20 330,60 360,120 C390,180 420,150 450,220 C480,260 510,220 540,120 C570,50 600,100 630,50 C660,80 690,150 720,130 C750,110 780,180 810,140 C840,100 870,250 900,200 C930,150 970,100 1000,70 L1000,300 L0,300 Z"
                      fill="url(#gradient)"
                    />
                  </svg>
                </div>
              </div>
              
              {/* X-axis labels */}
              <div className="flex justify-between text-xs text-gray-400 mt-2 px-10">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
              </div>
            </div>
          </div>

          {/* Top Countries for Streaming */}
          <div className="p-5 rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-medium">Top Countries for Streaming</h3>
              <div className="relative">
                <button 
                  id="countries-dropdown-button"
                  className="bg-[#232830] text-gray-300 px-3 py-1.5 rounded text-sm flex items-center"
                  onClick={toggleCountriesDropdown}
                >
                  <span>{getTimeframeText(countriesTimeframe)}</span>
                  <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                
                {showCountriesDropdown && (
                  <div 
                    id="countries-dropdown"
                    className="absolute right-0 mt-1 w-40 bg-[#232830] rounded-md shadow-lg z-50"
                  >
                    <div className="py-1">
                      {['thisMonth', 'lastMonth', 'last3Months', 'last6Months', 'thisYear', 'allTime'].map((value) => (
                        <button 
                          key={value}
                          className={`block px-4 py-2 text-sm w-full text-left ${
                            countriesTimeframe === value ? 'text-[#A365FF]' : 'text-gray-300 hover:bg-[#1A1E24]'
                          }`}
                          onClick={(e) => selectTimeframe('countries', value, e)}
                        >
                          {getTimeframeText(value)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Countries list */}
            <div className="space-y-5 bg-[#161A1F] p-5 rounded-lg">
              {/* USA */}
              <div>
                <div className="flex justify-between text-white mb-1.5">
                  <span>USA</span>
                  <span>46%</span>
                </div>
                <div className="w-full bg-[#232830] h-2 rounded-full">
                  <div className="bg-[#A365FF] h-2 rounded-full" style={{ width: '46%' }}></div>
                </div>
              </div>

              {/* Bangladesh */}
              <div>
                <div className="flex justify-between text-white mb-1.5">
                  <span>Bangladesh</span>
                  <span>23%</span>
                </div>
                <div className="w-full bg-[#232830] h-2 rounded-full">
                  <div className="bg-[#A365FF] h-2 rounded-full" style={{ width: '23%' }}></div>
                </div>
              </div>

              {/* UK */}
              <div>
                <div className="flex justify-between text-white mb-1.5">
                  <span>UK</span>
                  <span>19%</span>
                </div>
                <div className="w-full bg-[#232830] h-2 rounded-full">
                  <div className="bg-[#A365FF] h-2 rounded-full" style={{ width: '19%' }}></div>
                </div>
              </div>

              {/* Germany */}
              <div>
                <div className="flex justify-between text-white mb-1.5">
                  <span>Germany</span>
                  <span>13%</span>
                </div>
                <div className="w-full bg-[#232830] h-2 rounded-full">
                  <div className="bg-[#A365FF] h-2 rounded-full" style={{ width: '13%' }}></div>
                </div>
              </div>

              {/* India */}
              <div>
                <div className="flex justify-between text-white mb-1.5">
                  <span>India</span>
                  <span>11%</span>
                </div>
                <div className="w-full bg-[#232830] h-2 rounded-full">
                  <div className="bg-[#A365FF] h-2 rounded-full" style={{ width: '11%' }}></div>
                </div>
              </div>

              {/* Nepal */}
              <div>
                <div className="flex justify-between text-white mb-1.5">
                  <span>Nepal</span>
                  <span>8%</span>
                </div>
                <div className="w-full bg-[#232830] h-2 rounded-full">
                  <div className="bg-[#A365FF] h-2 rounded-full" style={{ width: '8%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Platform Pie Chart */}
          <div className="p-4 rounded-md bg-[#161A1F]">
            <div className="px-4 py-2 rounded-md flex justify-between items-center mb-4">
              <h3 className="text-white font-medium">Top Platform</h3>
              <select
                className="bg-[#1A1E25] border border-gray-700 text-gray-300 text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                defaultValue="January"
              >
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
            </div>

            {/* Pie Chart */}
            <div className="flex items-center justify-center p-4 rounded-md overflow-hidden">
              {/* Donut chart */}
              <div className="relative w-44 h-44">
                {/* This is a simple representation of a pie chart using a conic gradient */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "conic-gradient(#8A85FF 0% 40%, #6AE398 40% 70%, #FFB963 70% 95%, #00C2FF 95% 100%)",
                    clipPath: "circle(50% at center)",
                  }}
                >
                  {/* Center hollow */}
                  <div className="absolute inset-[25%] rounded-full bg-[#1A1E25]"></div>
                </div>

                {/* Percentages */}
                <div className="absolute top-16 -right-30 text-md">
                  <div className="text-[#8A85FF] font-medium">
                    Spotify 40%
                  </div>
                </div>

                <div className="absolute bottom-2 -left-36 text-md">
                  <div className="text-[#6AE398] font-medium">
                    YouTube 30%
                  </div>
                </div>

                <div className="absolute top-16 -left-42 text-md">
                  <div className="text-[#FFB963] font-medium">
                    Apple Music 25%
                  </div>
                </div>

                <div className="absolute top-1 -right-32 text-md">
                  <div className="text-[#00C2FF] font-medium">
                    Soundcloud 5%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Growth Per Year Bar Chart */}
          <div className="p-4 rounded-md bg-[#161A1F]">
            <div className="px-4 py-2 rounded-md mb-4">
              <h3 className="text-white font-medium">Revenue Growth Per Year</h3>
            </div>

            {/* Bar Chart */}
            <div className="h-72 p-4">
              <div className="flex h-full w-full justify-between items-end px-6">
                {/* 2020 Bar */}
                <div className="flex flex-col items-center justify-end h-full">
                  <div className="text-white text-xs mb-2">1k</div>
                  <div className="w-12 bg-[#A365FF] h-[10%] rounded-t-md relative">
                  </div>
                  <div className="text-gray-400 text-xs mt-2">2020</div>
                </div>
                
                {/* 2021 Bar */}
                <div className="flex flex-col items-center justify-end h-full">
                  <div className="text-white text-xs mb-2">3k</div>
                  <div className="w-12 bg-[#A365FF] h-[20%] rounded-t-md relative">
                  </div>
                  <div className="text-gray-400 text-xs mt-2">2021</div>
                </div>
                
                {/* 2022 Bar */}
                <div className="flex flex-col items-center justify-end h-full">
                  <div className="text-white text-xs mb-2">3k</div>
                  <div className="w-12 bg-[#A365FF] h-[30%] rounded-t-md relative">
                  </div>
                  <div className="text-gray-400 text-xs mt-2">2022</div>
                </div>
                
                {/* 2023 Bar */}
                <div className="flex flex-col items-center justify-end h-full">
                  <div className="text-white text-xs mb-2">6k</div>
                  <div className="w-12 bg-[#A365FF] h-[50%] rounded-t-md relative">
                  </div>
                  <div className="text-gray-400 text-xs mt-2">2023</div>
                </div>
                
                {/* 2024 Bar */}
                <div className="flex flex-col items-center justify-end h-full">
                  <div className="text-white text-xs mb-2">8k</div>
                  <div className="w-12 bg-[#A365FF] h-[65%] rounded-t-md relative">
                  </div>
                  <div className="text-gray-400 text-xs mt-2">2024</div>
                </div>
                
                {/* 2025 Bar */}
                <div className="flex flex-col items-center justify-end h-full">
                  <div className="text-white text-xs mb-2">10k</div>
                  <div className="w-12 bg-[#A365FF] h-[80%] rounded-t-md relative">
                  </div>
                  <div className="text-gray-400 text-xs mt-2">2025</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Earning Tracks and Top Artists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Top Earning Tracks */}
          <div className="p-4 rounded-md bg-[#161A1F]">
            <div className="px-4 py-2 mb-4">
              <h3 className="text-white font-medium">Top Earning Tracks</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">
                      Title ↓
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">
                      Artist Name ↓
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase">
                      Revenue Earned
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {[...Array(10)].map((_, index) => (
                    <tr key={index} className="hover:bg-[#1A1E24]">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={`/images/music/${(index % 5) + 1}.png`} 
                            alt="Album cover" 
                            className="h-8 w-8 rounded-md object-cover flex-shrink-0"
                          />
                          <span className="text-white">Midnight Drive</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-white">
                        Neon Pulse
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-white text-right">
                        $12.6k (5.1%)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Artists */}
          <div className="p-4 rounded-md bg-[#161A1F]">
            <div className="px-4 py-2 mb-4">
              <h3 className="text-white font-medium">Top Artists</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">
                      Artist Name ↓
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase">
                      Revenue Earned
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {[
                    "Bessie Cooper",
                    "Jenny Wilson",
                    "Albert Flores",
                    "Darlene Robertson",
                    "Jane Cooper",
                    "Marvin McKinney",
                    "Esther Howard",
                    "Jerome Bell",
                    "Savannah Nguyen",
                    "Theresa Webb"
                  ].map((artist, index) => (
                    <tr key={index} className="hover:bg-[#1A1E24]">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={`/images/singer/${(index % 3) + 1}.webp`} 
                            alt={artist} 
                            className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                          />
                          <span className="text-white">{artist}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-white text-right">
                        $12.6k (5.1%)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 