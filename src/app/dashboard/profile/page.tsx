"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import Image from "next/image";

type TabType = "basic" | "edit" | "password";

// Define tabs
const profileTabs = [
  { id: "basic", name: "Basic Info" },
  { id: "edit", name: "Edit Info" },
  { id: "password", name: "Change Password" }
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>("basic");

  // Handle tab change
  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
  };

  return (
    <DashboardLayout title="Profile" subtitle="View and edit your profile information">
      <div>
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start mb-6">
          {/* User Image */}
          <div className="relative mb-4 md:mb-0 md:mr-6">
            <div className="h-24 w-24 rounded-full overflow-hidden">
              <img 
                src="https://randomuser.me/api/portraits/men/1.jpg" 
                alt="User Avatar" 
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* User Info */}
          <div className="flex flex-col items-center md:items-start">
            <h1 className="text-2xl font-bold text-white mb-2">James Hook</h1>
            
            {/* Tags */}
            <div className="flex gap-3 mb-6">
              <span className="bg-purple-900 text-white px-3 py-1 rounded-md text-sm flex items-center">
                <span className="mr-1">★</span> Owner
              </span>
              <span className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm">StreamAudio</span>
              <span className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm">Admin</span>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto">
          {profileTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as TabType)}
              className={`px-5 py-2 rounded-full whitespace-nowrap ${
                activeTab === tab.id ? 'bg-[#A365FF] text-white' : 'bg-[#1A1E24] text-gray-300 hover:bg-[#252A33]'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "basic" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Personal Info */}
            <div className="bg-[#1A1E24] rounded-lg p-5 space-y-6">
              <div>
                <h3 className="text-gray-400 text-sm">Email</h3>
                <p className="text-white text-lg">example@gmail.com</p>
              </div>
              
              <div>
                <h3 className="text-gray-400 text-sm">Phone Number</h3>
                <p className="text-white text-lg">01855664499</p>
              </div>

              <div>
                <h3 className="text-gray-400 text-sm">Country</h3>
                <p className="text-white text-lg">Bangladesh</p>
              </div>

              <div>
                <h3 className="text-gray-400 text-sm">Member Since January, 2024</h3>
              </div>

              <button className="bg-[#A365FF] hover:bg-purple-700 text-white px-6 py-2 rounded-md transition-colors">
                See Verification Document
              </button>
            </div>
              
            {/* Right Column - Financial Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1A1E24] rounded-lg p-5">
                <h3 className="text-gray-400 text-sm">Balance</h3>
                <p className="text-white text-xl font-bold">$20,022</p>
              </div>
              
              <div className="bg-[#1A1E24] rounded-lg p-5">
                <h3 className="text-gray-400 text-sm">Withdraw Request</h3>
                <p className="text-white text-xl font-bold">None</p>
              </div>
              
              <div className="bg-[#1A1E24] rounded-lg p-5">
                <h3 className="text-gray-400 text-sm">Total Earning</h3>
                <p className="text-white text-xl font-bold">$206,458</p>
              </div>
              
              <div className="bg-[#1A1E24] rounded-lg p-5">
                <h3 className="text-gray-400 text-sm">Commission</h3>
                <p className="text-white text-xl font-bold">None</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "edit" && (
          <div className="rounded-lg p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-white text-md mb-3">Upload Avatar</h3>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 w-40 h-40 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 mb-4">
                  <div className="flex flex-col items-center justify-center h-full">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2.67 18.95L7.6 15.64C8.39 15.11 9.53 15.17 10.24 15.78L10.57 16.07C11.35 16.74 12.61 16.74 13.39 16.07L17.55 12.5C18.33 11.83 19.59 11.83 20.37 12.5L22 13.9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p className="text-xs text-gray-400 text-center mt-2">Browse or drag and drop image file</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-white text-md mb-4">Update Info</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="James Hook"
                    className="w-full p-3 bg-[#161A1F] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  
                  <div className="relative">
                    <select
                      className="w-full p-3 bg-[#161A1F] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                    >
                      <option value="Bangladesh">Bangladesh</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="Canada">Canada</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  
                  <input
                    type="text"
                    placeholder="01855664499"
                    className="w-full p-3 bg-[#161A1F] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  
                  <input
                    type="email"
                    placeholder="example@email.com"
                    className="w-full p-3 bg-[#161A1F] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <button className="bg-[#A365FF] hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors mt-4">
                Save
              </button>
            </div>
          </div>
        )}

        {activeTab === "password" && (
          <div className="bg-[#1A1E24] rounded-lg p-6">
            <div className="space-y-4">
              <h3 className="text-white text-md mb-4">Change Password</h3>
              
              <input
                type="password"
                placeholder="Enter Your Current Password"
                className="w-full p-3 bg-[#161A1F] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              
              <input
                type="password"
                placeholder="Enter Your New Password"
                className="w-full p-3 bg-[#161A1F] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              
              <input
                type="password"
                placeholder="Confirm Your New Password"
                className="w-full p-3 bg-[#161A1F] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              
              <button className="bg-[#A365FF] hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors mt-4">
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 