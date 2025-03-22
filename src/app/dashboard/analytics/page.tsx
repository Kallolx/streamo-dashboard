"use client";

import { useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import Link from "next/link";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "90days" | "1year">("30days");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  
  return (
    <DashboardLayout 
      title="Analytics" 
      subtitle="Track your music performance"
    >
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2 bg-[#161A1F] rounded-lg p-1">
          <button 
            className={`px-4 py-1.5 rounded-md text-sm font-medium ${timeRange === "7days" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}
            onClick={() => setTimeRange("7days")}
          >
            7 Days
          </button>
          <button 
            className={`px-4 py-1.5 rounded-md text-sm font-medium ${timeRange === "30days" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}
            onClick={() => setTimeRange("30days")}
          >
            30 Days
          </button>
          <button 
            className={`px-4 py-1.5 rounded-md text-sm font-medium ${timeRange === "90days" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}
            onClick={() => setTimeRange("90days")}
          >
            90 Days
          </button>
          <button 
            className={`px-4 py-1.5 rounded-md text-sm font-medium ${timeRange === "1year" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}
            onClick={() => setTimeRange("1year")}
          >
            1 Year
          </button>
        </div>
        
        <select 
          value={selectedPlatform}
          onChange={(e) => setSelectedPlatform(e.target.value)}
          className="bg-[#161A1F] border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
        >
          <option value="all">All Platforms</option>
          <option value="spotify">Spotify</option>
          <option value="apple">Apple Music</option>
          <option value="youtube">YouTube Music</option>
          <option value="amazon">Amazon Music</option>
          <option value="tiktok">TikTok</option>
        </select>
      </div>
      
      <div className="bg-[#161A1F] rounded-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl font-semibold">Performance Overview</h2>
          <button className="mt-3 sm:mt-0 text-sm font-medium text-purple-500 hover:text-purple-400 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Data
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-800 p-5 rounded-lg transition-all hover:translate-y-[-4px]">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium">Total Streams</h3>
              <div className="bg-green-500/20 text-green-500 text-xs font-medium px-2 py-1 rounded-md">+15%</div>
            </div>
            <p className="text-3xl font-bold">1.2M</p>
            <p className="text-sm text-gray-400 mt-2">Last 30 days</p>
          </div>
          
          <div className="bg-gray-800 p-5 rounded-lg transition-all hover:translate-y-[-4px]">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium">Average Listen Time</h3>
              <div className="bg-blue-500/20 text-blue-500 text-xs font-medium px-2 py-1 rounded-md">+3%</div>
            </div>
            <p className="text-3xl font-bold">3:24</p>
            <p className="text-sm text-gray-400 mt-2">Across all tracks</p>
          </div>
          
          <div className="bg-gray-800 p-5 rounded-lg transition-all hover:translate-y-[-4px]">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium">Audience Growth</h3>
              <div className="bg-purple-500/20 text-purple-500 text-xs font-medium px-2 py-1 rounded-md">+24%</div>
            </div>
            <p className="text-3xl font-bold">+24%</p>
            <p className="text-sm text-gray-400 mt-2">Year over year</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-5 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Listener Demographics</h3>
              <div className="flex gap-2">
                <button className="px-2 py-1 text-xs font-medium bg-gray-700 rounded-md hover:bg-gray-600">Age</button>
                <button className="px-2 py-1 text-xs font-medium bg-gray-700 rounded-md hover:bg-gray-600">Gender</button>
                <button className="px-2 py-1 text-xs font-medium bg-purple-600 rounded-md">Location</button>
              </div>
            </div>
            <div className="h-64 w-full flex items-center justify-center border border-gray-700 rounded-lg">
              <p className="text-gray-400">Demographics chart placeholder</p>
            </div>
          </div>
          
          <div className="bg-gray-800 p-5 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Top Performing Tracks</h3>
              <Link href="#" className="text-sm font-medium text-purple-500 hover:text-purple-400">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center justify-between p-3 border border-gray-700 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-700 rounded-md flex items-center justify-center mr-3">
                      <span className="text-sm font-bold">{i}</span>
                    </div>
                    <div>
                      <p className="font-medium">Track Title {i}</p>
                      <p className="text-xs text-gray-400">Release Title</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{(Math.random() * 500000).toFixed(0)} plays</p>
                    <p className="text-xs text-green-500">+{Math.floor(Math.random() * 30)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-[#161A1F] rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Platform Performance</h2>
          <div className="flex gap-2">
            <button className="px-2 py-1 text-xs font-medium bg-gray-800 rounded-md hover:bg-gray-700">Streams</button>
            <button className="px-2 py-1 text-xs font-medium bg-purple-600 rounded-md">Revenue</button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-3 font-medium text-gray-400">Platform</th>
                <th className="pb-3 font-medium text-gray-400">Streams</th>
                <th className="pb-3 font-medium text-gray-400">Revenue</th>
                <th className="pb-3 font-medium text-gray-400">Growth</th>
                <th className="pb-3 font-medium text-gray-400">Avg. Stream</th>
              </tr>
            </thead>
            <tbody>
              {[
                { platform: "Spotify", streams: "542,331", revenue: "$1,845.22", growth: "+12%", avgStream: "$0.0034" },
                { platform: "Apple Music", streams: "325,122", revenue: "$1,625.61", growth: "+8%", avgStream: "$0.0050" },
                { platform: "YouTube Music", streams: "287,441", revenue: "$861.42", growth: "+23%", avgStream: "$0.0030" },
                { platform: "Amazon Music", streams: "124,823", revenue: "$499.29", growth: "+5%", avgStream: "$0.0040" },
                { platform: "TikTok", streams: "98,553", revenue: "$246.38", growth: "+45%", avgStream: "$0.0025" }
              ].map((platform, index) => (
                <tr key={index} className="border-b border-gray-700 last:border-b-0">
                  <td className="py-4 font-medium">{platform.platform}</td>
                  <td className="py-4">{platform.streams}</td>
                  <td className="py-4">{platform.revenue}</td>
                  <td className="py-4 text-green-500">{platform.growth}</td>
                  <td className="py-4">{platform.avgStream}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
} 