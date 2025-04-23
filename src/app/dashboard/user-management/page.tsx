"use client";

import React, { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { X, PencilSimple, Trash } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import RoleGuard from "@/components/RoleGuard";
import { getUsers, createUser, deleteUser, updateUser } from "@/services/userService";
import type { User as ApiUser, CreateUserData } from "@/services/userService";

// User types for the table display
interface User {
  id: string | number;
  name: string;
  email: string;
  accountStatus: string;
  userStatus: string;
  split: string;
  userType: string;
}

// User role types
type UserRole = "All" | "Super Admin" | "Admin" | "Label Owner" | "Artist";

// User role tabs - sorted as per design
const roleTabs: UserRole[] = ["All", "Admin", "Super Admin", "Label Owner", "Artist"];

// Available roles for new users
const availableRoles = ["superadmin", "admin", "labelowner", "artist"];

export default function UserManagementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<UserRole>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // New user modal states
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState<CreateUserData>({
    name: "",
    email: "",
    password: "",
    role: "admin"
  });
  const [createUserError, setCreateUserError] = useState("");
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [createdUserInfo, setCreatedUserInfo] = useState<User | null>(null);

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch real users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // First check if we have a token
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');
        
        if (!token) {
          console.log("User Management - No token found, redirecting to login");
          router.push('/auth/login');
          return;
        }
        
        // Normal API flow
        setIsLoading(true);
        console.log("User Management - Fetching users with token");
        
        // Fetch users from API
        const apiUsers = await getUsers();
        console.log("User Management - Fetched users:", apiUsers);
        
        // Transform API users to the format needed for display
        const formattedUsers = apiUsers.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          accountStatus: user.isActive ? "Active" : "Inactive",
          userStatus: "Verified",
          split: "0%",
          userType: user.role === "superadmin" 
            ? "Super Admin" 
            : user.role === "labelowner"
              ? "Label Owner"
              : capitalizeFirstLetter(user.role)
        }));
        
        setUsers(formattedUsers);
        setApiError(null);
      } catch (error: any) {
        console.error("Error fetching users:", error);
        
        // Check if this is an authentication error
        if (error.response?.status === 401) {
          console.log("User Management - Unauthorized, redirecting to login");
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userData');
          router.push('/auth/login');
        } else {
          setApiError(error.response?.data?.message || error.message || "Failed to fetch users");
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, [router]);

  // Utility function to capitalize first letter
  const capitalizeFirstLetter = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Handle tab change
  const handleTabChange = (tab: UserRole) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Handle create user form change
  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUserData({
      ...newUserData,
      [name]: value
    });
  };

  // Handle create user submit
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateUserError("");
    setIsCreatingUser(true);

    try {
      // Validate form
      if (!newUserData.name || !newUserData.email || !newUserData.password || !newUserData.role) {
        throw new Error("All fields are required");
      }

      // Create user via API
      console.log("Create User - Creating real user:", { ...newUserData, password: '••••••' });
      const createdUser = await createUser(newUserData);
      
      // Add the new user to the local state
      const newUser: User = {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        accountStatus: "Active",
        userStatus: "Verified",
        split: "0%",
        userType: createdUser.role === "superadmin" 
          ? "Super Admin" 
          : createdUser.role === "labelowner"
            ? "Label Owner"
            : capitalizeFirstLetter(createdUser.role)
      };
      
      // Add the new user to the list
      setUsers(prevUsers => [...prevUsers, newUser]);
      
      // Close the modal and reset form
      setShowNewUserModal(false);
      
      // Set success message and show success modal
      setSuccessMessage(`User ${newUserData.name} has been created successfully!`);
      setCreatedUserInfo(newUser);
      setShowSuccessModal(true);
      
      // Reset form data
      setNewUserData({
        name: "",
        email: "",
        password: "",
        role: "admin"
      });
    } catch (error: any) {
      setCreateUserError(error.response?.data?.message || error.message || "Failed to create user");
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Handle delete user confirmation
  const confirmDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
    setDeleteError(null);
  };

  // Handle actual user deletion
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setIsDeletingUser(true);
    setDeleteError(null);
    
    try {
      // Call API to delete user
      await deleteUser(userToDelete.id.toString());
      
      // Remove user from the list
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete.id));
      
      // Close delete modal
      setShowDeleteModal(false);
      
      // Show success message
      setSuccessMessage(`User ${userToDelete.name} has been deleted successfully!`);
      setCreatedUserInfo(userToDelete);
      setShowSuccessModal(true);
    } catch (error: any) {
      setDeleteError(error.response?.data?.message || error.message || "Failed to delete user");
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Cancel deletion
  const cancelDeleteUser = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
    setDeleteError(null);
  };

  // Filter users based on active tab and search term
  const filteredUsers = users.filter(
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
    <RoleGuard allowedRoles={['superadmin', 'admin']} fallbackUrl="/dashboard">
      <DashboardLayout title="User Management" subtitle="Manage all users and their roles">
        <div>
          {/* Header with Add New User Button */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex flex-wrap gap-2 overflow-x-auto">
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
            
            <button
              onClick={() => setShowNewUserModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Add New User
            </button>
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

          {/* API Error Message */}
          {apiError && (
            <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded mb-6">
              <div className="flex">
                <div className="py-1">
                  <svg className="fill-current h-6 w-6 text-red-300 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-bold">Error</p>
                  <p className="text-sm">{apiError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="bg-[#161A1F] rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <svg className="animate-spin h-10 w-10 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : users.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-gray-400 text-lg">No users found</p>
                <button 
                  className="mt-4 px-4 py-2 bg-purple-600 rounded-md text-white hover:bg-purple-700 transition-colors"
                  onClick={() => setShowNewUserModal(true)}
                >
                  Add New User
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto" style={{ minHeight: "550px" }}>
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
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center space-x-3">
                            <button 
                              className="text-purple-400 hover:text-purple-300 transition-colors"
                              onClick={() => setShowNewUserModal(true)}
                              aria-label="Edit User"
                            >
                              <PencilSimple size={20} weight="bold" />
                            </button>
                            <button 
                              className="text-red-500 hover:text-red-400 transition-colors"
                              onClick={() => confirmDeleteUser(user)}
                              aria-label="Delete User"
                            >
                              <Trash size={20} weight="bold" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination - Only show if we have users */}
            {users.length > 0 && (
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
            )}
          </div>
        </div>

        {/* Create New User Modal */}
        {showNewUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-[#161A1F] rounded-lg shadow-lg w-full max-w-md">
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
                <h3 className="text-xl font-semibold text-white">Create New User</h3>
                <button 
                  onClick={() => setShowNewUserModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCreateUser}>
                <div className="p-6 space-y-4">
                  {createUserError && (
                    <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded">
                      {createUserError}
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={newUserData.name}
                      onChange={handleNewUserChange}
                      className="w-full px-4 py-2 bg-[#1D2229] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter user's full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={newUserData.email}
                      onChange={handleNewUserChange}
                      className="w-full px-4 py-2 bg-[#1D2229] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={newUserData.password}
                      onChange={handleNewUserChange}
                      className="w-full px-4 py-2 bg-[#1D2229] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Create a password"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
                      User Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={newUserData.role}
                      onChange={handleNewUserChange}
                      className="w-full px-4 py-2 bg-[#1D2229] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      {availableRoles.map(role => (
                        <option key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="px-6 py-4 border-t border-gray-700 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowNewUserModal(false)}
                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
                    disabled={isCreatingUser}
                  >
                    {isCreatingUser ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      "Create User"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Success Modal */}
        {showSuccessModal && createdUserInfo && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="fixed inset-0 backdrop-blur-sm bg-black/50" onClick={() => setShowSuccessModal(false)}></div>
            <div className="relative z-10 bg-[#111417] rounded-lg overflow-hidden shadow-xl max-w-md w-full transform transition-all">
              {/* Close button */}
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
                onClick={() => setShowSuccessModal(false)}
              >
                <X size={24} />
              </button>
              
              {/* Success header */}
              <div className="bg-[#161A1F] p-5 border-b border-gray-700">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center mr-4">
                    <svg 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      className="w-6 h-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        d="M4 12.6111L8.92308 17.5L20 6.5" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">Success!</h3>
                </div>
                <p className="text-gray-300 mt-2">{successMessage}</p>
              </div>
              
              {/* User details */}
              <div className="p-5 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1A1E24] p-4 rounded">
                    <div className="text-gray-400 text-sm mb-1">Name</div>
                    <div className="text-white font-medium">{createdUserInfo.name}</div>
                  </div>
                  
                  <div className="bg-[#1A1E24] p-4 rounded">
                    <div className="text-gray-400 text-sm mb-1">Email</div>
                    <div className="text-white font-medium">{createdUserInfo.email}</div>
                  </div>
                  
                  <div className="bg-[#1A1E24] p-4 rounded">
                    <div className="text-gray-400 text-sm mb-1">Role</div>
                    <div className="text-white font-medium">{createdUserInfo.userType}</div>
                  </div>
                  
                  <div className="bg-[#1A1E24] p-4 rounded">
                    <div className="text-gray-400 text-sm mb-1">Status</div>
                    <div className="text-green-400 font-medium">{createdUserInfo.accountStatus}</div>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="p-5 border-t border-gray-700 flex justify-end">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && userToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="fixed inset-0 backdrop-blur-sm bg-black/50" onClick={cancelDeleteUser}></div>
            <div className="relative z-10 bg-[#111417] rounded-lg overflow-hidden shadow-xl max-w-md w-full transform transition-all">
              {/* Close button */}
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
                onClick={cancelDeleteUser}
              >
                <X size={24} />
              </button>
              
              {/* Header */}
              <div className="bg-[#161A1F] p-5 border-b border-gray-700">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center mr-4">
                    <svg 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      className="w-6 h-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        d="M6 6L18 18M6 18L18 6" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">Delete User</h3>
                </div>
                <p className="text-gray-300 mt-2">
                  Are you sure you want to delete this user? This action cannot be undone.
                </p>
              </div>
              
              {/* User details */}
              <div className="p-5">
                {deleteError && (
                  <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded mb-4">
                    {deleteError}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-[#1A1E24] p-4 rounded">
                    <div className="text-gray-400 text-sm mb-1">Name</div>
                    <div className="text-white font-medium">{userToDelete.name}</div>
                  </div>
                  
                  <div className="bg-[#1A1E24] p-4 rounded">
                    <div className="text-gray-400 text-sm mb-1">Email</div>
                    <div className="text-white font-medium">{userToDelete.email}</div>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="p-5 border-t border-gray-700 flex justify-end">
                <button
                  onClick={cancelDeleteUser}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors mr-2"
                  disabled={isDeletingUser}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                  disabled={isDeletingUser}
                >
                  {isDeletingUser ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    "Delete User"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </RoleGuard>
  );
}
