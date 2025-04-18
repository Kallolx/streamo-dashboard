"use client";

import React, { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { DotsThree } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

// User role types
type UserRole = "All" | "Super Admin" | "Admin" | "Label Owner" | "Artist";

// User status types
type UserStatus = "Active" | "Inactive";

// User account status
type AccountStatus = "Verified" | "Unverified" | "Pending";

// Mock data for users
const usersData = [
  { id: 1, name: "Steven Wilson", email: "example@email.com", accountStatus: "Active", userStatus: "Verified", split: "20%", userType: "Admin" },
  { id: 2, name: "Linkin Park", email: "example@email.com", accountStatus: "Inactive", userStatus: "Verified", split: "20%", userType: "Artist" },
  { id: 3, name: "Steven Wilson", email: "example@email.com", accountStatus: "Active", userStatus: "Verified", split: "20%", userType: "Label Owner" },
  { id: 4, name: "Linkin Park", email: "example@email.com", accountStatus: "Inactive", userStatus: "Verified", split: "20%", userType: "Artist" },
  { id: 5, name: "Steven Wilson", email: "example@email.com", accountStatus: "Inactive", userStatus: "Verified", split: "20%", userType: "Label Owner" },
  { id: 6, name: "Linkin Park", email: "example@email.com", accountStatus: "Inactive", userStatus: "Verified", split: "20%", userType: "Artist" },
  { id: 7, name: "Steven Wilson", email: "example@email.com", accountStatus: "Active", userStatus: "Verified", split: "20%", userType: "Label Owner" },
  { id: 8, name: "Linkin Park", email: "example@email.com", accountStatus: "Active", userStatus: "Verified", split: "20%", userType: "Label Owner" },
  { id: 9, name: "Steven Wilson", email: "example@email.com", accountStatus: "Active", userStatus: "Verified", split: "20%", userType: "Artist" },
  { id: 10, name: "Linkin Park", email: "example@email.com", accountStatus: "Active", userStatus: "Verified", split: "20%", userType: "Artist" },
];

// User role tabs
const roleTabs: UserRole[] = ["All", "Super Admin", "Admin", "Label Owner", "Artist"];

// Access control
const checkAccess = () => {
  if (typeof window !== 'undefined') {
    const userRole = localStorage.getItem('userRole');
    return userRole === 'superadmin';
  }
  return false;
};

export default function UserManagementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<UserRole>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 10;

  // Check user access on component mount
  useEffect(() => {
    if (!checkAccess()) {
      router.push('/dashboard');
    }
  }, [router]);

  // Handle tab change
  const handleTabChange = (tab: UserRole) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Toggle action menu
  const toggleActionMenu = (userId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === userId ? null : userId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter users based on active tab and search term
  const filteredUsers = usersData.filter(
    (user) =>
      (activeTab === "All" || user.userType === activeTab) &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <DashboardLayout title="User Management" subtitle="Manage all users and their roles">
      <div>
        {/* Role Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto">
            {roleTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-5 py-2 rounded-full whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-[#A365FF] text-white"
                    : "bg-[#1A1E24] text-gray-300 hover:bg-[#252A33]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80 mb-6">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full py-2 px-4 pl-10 rounded-md bg-[#1D2229] text-gray-300 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute left-3 top-2.5 text-gray-400"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 21L16.65 16.65"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Users Table */}
        <div className="bg-[#161A1F] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-[#1A1E24]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    User Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Account Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    User Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Split(%)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    User Type
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#161A1F] divide-y divide-gray-700">
                {currentItems.map((user) => (
                  <tr 
                    key={user.id} 
                    className="hover:bg-[#1A1E24] cursor-pointer"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-white">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-white">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`${
                        user.accountStatus === "Active" 
                          ? "text-green-400" 
                          : "text-red-400"
                      }`}>
                        {user.accountStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-white">
                      {user.userStatus}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-white">
                      {user.split}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-white">
                      {user.userType}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center relative">
                      <button 
                        className="text-gray-400 hover:text-white transition-colors"
                        onClick={(e) => toggleActionMenu(user.id, e)}
                      >
                        <DotsThree size={24} weight="bold" />
                      </button>
                      
                      {/* Action Dropdown Menu */}
                      {openMenuId === user.id && (
                        <div 
                          ref={menuRef}
                          className="absolute right-0 mt-2 w-48 bg-[#161A1F] border border-[#232830] rounded-md shadow-lg z-10"
                        >
                          <button className="block w-full text-left px-4 py-2 text-sm text-purple-400 hover:bg-[#232830] transition-colors">
                            User Profile
                          </button>
                          <button className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#232830] transition-colors">
                            User Dashboard
                          </button>
                          <button className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#232830] transition-colors">
                            Edit User
                          </button>
                          <button className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#232830] transition-colors">
                            Releases
                          </button>
                          <button className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#232830] transition-colors">
                            Analytics
                          </button>
                          <button className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#232830] transition-colors">
                            Royalties
                          </button>
                          <button className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#232830] transition-colors">
                            Transactions
                          </button>
                          <button className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[#232830] transition-colors">
                            Delete User
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-700">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? "text-gray-500 cursor-not-allowed"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md ${
                  currentPage === totalPages
                    ? "text-gray-500 cursor-not-allowed"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredUsers.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredUsers.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-[#161A1F] text-sm font-medium ${
                      currentPage === 1
                        ? "text-gray-500 cursor-not-allowed"
                        : "text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        currentPage === page
                          ? "bg-purple-600 border-purple-500 text-white"
                          : "border-gray-700 bg-[#161A1F] text-gray-300 hover:bg-gray-700"
                      } text-sm font-medium`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-[#161A1F] text-sm font-medium ${
                      currentPage === totalPages
                        ? "text-gray-500 cursor-not-allowed"
                        : "text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
            <div className="hidden sm:flex items-center">
              <select
                className="ml-4 bg-[#1A1E25] border border-gray-700 text-gray-300 text-sm rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                defaultValue="10"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
