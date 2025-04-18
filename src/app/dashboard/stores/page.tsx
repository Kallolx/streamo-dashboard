"use client";

import React, { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { MagnifyingGlass, PencilSimple } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Access control
const checkAccess = () => {
  if (typeof window !== 'undefined') {
    const userRole = localStorage.getItem('userRole');
    return userRole === 'superadmin';
  }
  return false;
};

// Define store data interface
interface Store {
  id: number;
  name: string;
  icon: string;
  status: "Active" | "Inactive";
  videosOnly: boolean;
  color: string;
  url?: string;
  category?: string;
}

// Initial stores data
const initialStores: Store[] = [
  { id: 1, name: "YouTube", icon: "/icons/yt.svg", status: "Active", videosOnly: true, color: "#FF0000" },
  { id: 2, name: "Soundcloud", icon: "/icons/sc.svg", status: "Inactive", videosOnly: false, color: "#FF7700" },
  { id: 3, name: "Spotify", icon: "/icons/sp.svg", status: "Active", videosOnly: false, color: "#1DB954" },
  { id: 4, name: "Apple Music", icon: "/icons/ap.svg", status: "Inactive", videosOnly: false, color: "#FFFFFF" },
  { id: 5, name: "YouTube", icon: "/icons/yt.svg", status: "Active", videosOnly: true, color: "#FF0000" },
  { id: 6, name: "YouTube", icon: "/icons/yt.svg", status: "Active", videosOnly: false, color: "#FF0000" },
  { id: 7, name: "Soundcloud", icon: "/icons/sc.svg", status: "Inactive", videosOnly: true, color: "#FF7700" },
  { id: 8, name: "Soundcloud", icon: "/icons/sc.svg", status: "Active", videosOnly: false, color: "#FF7700" },
  { id: 9, name: "Spotify", icon: "/icons/sp.svg", status: "Inactive", videosOnly: false, color: "#1DB954" },
  { id: 10, name: "Spotify", icon: "/icons/sp.svg", status: "Active", videosOnly: true, color: "#1DB954" },
];

export default function StoresPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [stores, setStores] = useState<Store[]>(initialStores);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsPerPage = 10;

  // Check user access on component mount
  useEffect(() => {
    if (!checkAccess()) {
      router.push('/dashboard');
    }
  }, [router]);

  // Filter stores based on search term
  const filteredStores = stores.filter(
    (store) => store.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStores.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Handle edit store
  const handleEditStore = (store: Store, e?: React.MouseEvent) => {
    // If this was triggered by an event and the event has a stopPropagation method, call it
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    setEditingStore(store);
    setIsModalOpen(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStore(null);
    setUploadedLogo(null);
  };

  // Handle file upload click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle save store
  const handleSaveStore = () => {
    // Handle save logic here
    setIsModalOpen(false);
    setEditingStore(null);
  };

  return (
    <DashboardLayout title="Stores Management" subtitle="Manage distribution stores">
      <div className="relative">
        {/* Search Bar and Add Store Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-1/3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full py-2 px-4 pl-10 rounded-md bg-[#1D2229] text-gray-300 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlass 
                size={20}
                className="absolute left-3 top-2.5 text-gray-400" 
              />
            </div>
          </div>
          <Link href="/dashboard/stores/add-store">
            <button 
              className="px-4 py-2 bg-[#A365FF] text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Add Store
            </button>
          </Link>
        </div>

        {/* Stores Table */}
        <div className="bg-[#161A1F] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[#1A1E24]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Store
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Videos Only
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Color
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#161A1F] divide-y divide-gray-700">
                {currentItems.map((store) => (
                  <tr 
                    key={store.id} 
                    className="hover:bg-[#1A1E24] cursor-pointer"
                    onClick={() => handleEditStore(store)}
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 relative">
                          <img
                            src={store.icon}
                            alt={store.name}
                            className="rounded-full w-8 h-8"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{store.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`${
                        store.status === "Active" 
                          ? "text-green-400" 
                          : "text-red-400"
                      }`}>
                        {store.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-white">
                      {store.videosOnly ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="h-6 w-6 rounded-md mr-2"
                          style={{ backgroundColor: store.color }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <div onClick={(e) => e.stopPropagation()}>
                        <button 
                          className="text-gray-400 hover:text-white transition-colors"
                          onClick={(e) => handleEditStore(store, e)}
                        >
                          <PencilSimple size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-700">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredStores.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredStores.length}</span> results
                </p>
              </div>
              <div className="flex space-x-1">
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
                
                <select
                  className="ml-2 bg-[#1A1E25] border border-gray-700 text-gray-300 text-sm rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
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

        {/* Store Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center">
            {/* Backdrop with blur */}
            <div className="fixed inset-0 backdrop-blur-sm bg-black/50" onClick={handleCloseModal}></div>

            {/* Modal */}
            <div className="relative z-10 bg-[#111417] rounded-lg overflow-hidden shadow-xl max-w-md w-full max-h-[85vh] flex flex-col mt-16 transform transition-all">
              {/* Close button */}
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
                onClick={handleCloseModal}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Header */}
              <div className="p-5 border-b border-gray-700 flex items-center">
                {editingStore && (
                  <div className="h-8 w-8 mr-3">
                    <img 
                      src={editingStore.icon} 
                      alt={editingStore.name} 
                      className="rounded-full w-8 h-8"
                    />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-white">
                  {editingStore ? editingStore.name : "Add New Store"}
                </h3>
              </div>

              {/* Upload Logo Section */}
              <div className="px-5 pt-5">
                <p className="text-sm text-white mb-2">Upload Logo</p>
                <div 
                  className="border-2 border-dashed border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500"
                  onClick={handleUploadClick}
                >
                  {uploadedLogo ? (
                    <img
                      src={uploadedLogo}
                      alt="Logo preview"
                      className="w-32 h-32 object-contain"
                    />
                  ) : (
                    <>
                      <div className="bg-gray-700 rounded-lg p-3 mb-3">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2.67 18.95L7.6 15.64C8.39 15.11 9.53 15.17 10.24 15.78L10.57 16.07C11.35 16.74 12.61 16.74 13.39 16.07L17.55 12.5C18.33 11.83 19.59 11.83 20.37 12.5L22 13.9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <p className="text-sm text-gray-400 text-center">Browse or drag and drop image file</p>
                    </>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
              </div>

              {/* Details Section */}
              <div className="px-5 pt-5">
                <p className="text-sm text-white mb-2">Details</p>
                
                {/* Store Name */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Store Name"
                    className="w-full p-2 bg-[#1D2229] border border-gray-700 rounded text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    defaultValue={editingStore?.name || ""}
                  />
                </div>

                {/* Category Dropdown */}
                <div className="mb-4">
                  <div className="relative">
                    <select
                      className="w-full p-2 bg-[#1D2229] border border-gray-700 rounded text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 appearance-none"
                      defaultValue={editingStore?.category || ""}
                    >
                      <option value="" disabled>Category</option>
                      <option value="music">Music</option>
                      <option value="video">Video</option>
                      <option value="podcast">Podcast</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Status Dropdown */}
                <div className="mb-4">
                  <div className="relative">
                    <select
                      className="w-full p-2 bg-[#1D2229] border border-gray-700 rounded text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 appearance-none"
                      defaultValue={editingStore?.status || "Active"}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Store URL */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/"
                    className="w-full p-2 bg-[#1D2229] border border-gray-700 rounded text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    defaultValue={editingStore?.url || ""}
                  />
                </div>

                {/* Color Picker */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="#D9342B"
                    className="w-full p-2 bg-[#1D2229] border border-gray-700 rounded text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    defaultValue={editingStore?.color || ""}
                  />
                </div>
              </div>

              {/* Action button */}
              <div className="p-5 border-t border-gray-700">
                <button 
                  onClick={handleSaveStore}
                  className="w-full py-2 bg-[#A365FF] hover:bg-purple-700 text-white rounded-md transition-colors"
                >
                  {editingStore ? "Update" : "Add Store"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
