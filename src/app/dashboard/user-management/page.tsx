"use client";

import React, { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { X, PencilSimple, Trash, SignIn, Check, X as XIcon, Info } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import RoleGuard from "@/components/RoleGuard";
import { getUsers, createUser, deleteUser, updateUser, approveUser, rejectUser, getUserById } from "@/services/userService";
import { impersonateUser } from "@/services/authService";
import type { User as ApiUser, CreateUserData } from "@/services/userService";
import Toast from "@/components/Common/Toast";
import UserDetailsModal from "@/components/Dashboard/models/UserDetailsModal";

// User types for the table display
interface User {
  id: string | number;
  name: string;
  email: string;
  accountStatus: string;
  userStatus: string;
  split: string;
  userType: string;
  isApproved: boolean;
  createdAt?: string;
}

// User role types
type UserRole = "All" | "Super Admin" | "Admin" | "Label Owner" | "Artist";
// Edit modal tabs
type EditModalTab = "Basic Info" | "Role & Permissions" | "Status";

// User role tabs - sorted as per design
const roleTabs: UserRole[] = ["All", "Admin", "Super Admin", "Label Owner", "Artist"];
// Edit modal tabs
const editModalTabs: EditModalTab[] = ["Basic Info", "Role & Permissions", "Status"];

// Available roles for new users
const availableRoles = ["superadmin", "admin", "labelowner", "artist"];

// Interface for the form data with split field
interface UserCreateFormData {
  name: string;
  email: string;
  password: string;
  role: string;
  artistLabelName: string;
  split: string;  // Keep as string for form input handling
  isActive: boolean;
}

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
  const [newUserData, setNewUserData] = useState<UserCreateFormData>({
    name: "",
    email: "",
    password: "",
    role: "artist",
    artistLabelName: "",
    split: "0",
    isActive: true
  });
  const [createUserError, setCreateUserError] = useState("");
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Edit user modal states
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUserData, setEditUserData] = useState<{
    id: string, 
    name: string, 
    email: string, 
    role: string, 
    artistLabelName: string,
    split: string,
    isActive: boolean
  }>({
    id: "",
    name: "",
    email: "",
    role: "",
    artistLabelName: "",
    split: "0",
    isActive: true
  });
  const [editUserError, setEditUserError] = useState("");
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [activeEditTab, setActiveEditTab] = useState<EditModalTab>("Basic Info");
  const [selectedUserDetails, setSelectedUserDetails] = useState<User | null>(null);
  
  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [createdUserInfo, setCreatedUserInfo] = useState<User | null>(null);

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Impersonation modal state
  const [showImpersonateModal, setShowImpersonateModal] = useState(false);
  const [userToImpersonate, setUserToImpersonate] = useState<User | null>(null);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonateError, setImpersonateError] = useState<string | null>(null);

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
    visible: boolean;
  }>({
    message: '',
    type: 'success',
    visible: false
  });

  // Approval states
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);

  // User details modal state
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [selectedUserData, setSelectedUserData] = useState<ApiUser | null>(null);
  const [isLoadingUserDetails, setIsLoadingUserDetails] = useState(false);
  const [userDetailsError, setUserDetailsError] = useState<string | null>(null);

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
        const formattedUsers = apiUsers.map(user => {
          // Handle MongoDB's _id field
          const userId = user.id || (user as any)._id;
          
          return {
            id: userId,
            name: user.name || '',
            email: user.email || '',
            accountStatus: user.isActive ? "Active" : "Inactive",
            userStatus: "Verified",
            split: (user.split !== undefined ? user.split : 0) + "%",
            userType: user.role === "superadmin" 
              ? "Super Admin" 
              : user.role === "labelowner"
                ? "Label Owner"
                : capitalizeFirstLetter(user.role || ''),
            isApproved: user.isApproved,
            createdAt: user.createdAt ? user.createdAt.toString() : undefined
          };
        });
        
        console.log("User Management - Formatted users:", formattedUsers);
        
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

  // Utility function to extract real name (without the stage name in parentheses)
  const extractRealName = (fullName: string): string => {
    return fullName.split(' (')[0];
  };

  // Utility function to extract stage name from the full name
  const extractStageName = (fullName: string): string => {
    const match = fullName.match(/\((.*?)\)/);
    return match ? match[1] : '';
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
      // Convert split from string to number
      const splitNumber = parseInt(newUserData.split, 10);
      
      // Create user data with split as a number
      const userData = {
        name: newUserData.role === "artist" || newUserData.role === "labelowner"
          ? `${newUserData.name} (${newUserData.artistLabelName})`
          : newUserData.name,
        email: newUserData.email,
        password: newUserData.password,
        role: newUserData.role,
        split: isNaN(splitNumber) ? 0 : splitNumber,
        isActive: newUserData.isActive
      };
      
      // Create the user
      const response = await createUser(userData);
      
      console.log(`User created with split: ${userData.split}%`);
      
      // Show success toast
      setToast({
        message: "User created successfully",
        type: "success",
        visible: true
      });
      
      // Close the modal and reset form
      setShowNewUserModal(false);
      setNewUserData({
        name: "",
        email: "",
        password: "",
        role: "artist",
        artistLabelName: "",
        split: "0",
        isActive: true
      });
      
      // Fetch the users again by calling the useEffect
      // We can trigger this by using a state variable
      setIsLoading(true);
      
    } catch (error: any) {
      setCreateUserError(error.message || "An unexpected error occurred");
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Handle delete user confirmation
  const confirmDeleteUser = (user: User) => {
    console.log("User to delete:", user);
    setUserToDelete(user);
    setShowDeleteModal(true);
    setDeleteError(null);
  };

  // Handle actual user deletion
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    // Handle MongoDB ObjectId format or regular id
    let userId = '';
    if (userToDelete.id) {
      userId = typeof userToDelete.id === 'object' && (userToDelete.id as any)._id 
        ? (userToDelete.id as any)._id 
        : userToDelete.id.toString();
    } else if ((userToDelete as any)._id) {
      userId = (userToDelete as any)._id;
    }
    
    if (!userId) {
      setDeleteError("Cannot delete user: User ID is missing");
      return;
    }
    
    setIsDeletingUser(true);
    setDeleteError(null);
    
    try {
      // Call API to delete user
      await deleteUser(userId);
      
      // Remove user from the list
      setUsers(prevUsers => prevUsers.filter(user => {
        // Handle MongoDB ObjectId format or regular id for comparison
        const currentId = typeof user.id === 'object' && (user.id as any)._id 
          ? (user.id as any)._id 
          : user.id;
        const targetId = typeof userToDelete.id === 'object' && (userToDelete.id as any)._id 
          ? (userToDelete.id as any)._id 
          : userToDelete.id;
        
        return currentId !== targetId;
      }));
      
      // Close delete modal
      setShowDeleteModal(false);
      
      // Show success message
      setSuccessMessage(`User ${extractRealName(userToDelete.name)} has been deleted successfully!`);
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

  // Handle edit user form change
  const handleEditUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditUserData({
      ...editUserData,
      [name]: value
    });
  };

  // Open edit user modal with user data
  const openEditUserModal = (user: User) => {
    console.log("Opening edit modal for user:", user);
    
    if (!user || !user.id) {
      console.error("Cannot edit user - missing ID:", user);
      setEditUserError("Cannot edit user: User ID is missing");
      setShowEditUserModal(true);
      return;
    }
    
    const userId = typeof user.id === 'object' 
      ? (user.id as any)._id || '' 
      : user.id.toString();
      
    // Extract split value without the % sign
    const splitValue = user.split ? user.split.replace('%', '') : '0';
    
    // Extract real name and stage name
    const realName = extractRealName(user.name);
    const stageName = extractStageName(user.name);
      
    setEditUserData({
      id: userId,
      name: realName,
      email: user.email || '',
      role: user.userType === "Super Admin" 
        ? "superadmin" 
        : user.userType === "Label Owner" 
          ? "labelowner" 
          : (user.userType?.toLowerCase() || 'artist'),
      artistLabelName: stageName,
      split: splitValue,
      isActive: user.accountStatus === "Active"
    });
    
    console.log("Edit user data set:", {
      id: userId,
      name: realName,
      email: user.email,
      role: user.userType,
      artistLabelName: stageName,
      split: splitValue,
      isActive: user.accountStatus === "Active"
    });
    
    setEditUserError("");
    setShowEditUserModal(true);
  };

  // Handle edit user submit
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditUserError("");
    setIsEditingUser(true);

    try {
      // Validate form
      if (!editUserData.id) {
        throw new Error("User ID is missing");
      }
      
      if (!editUserData.name || !editUserData.email || !editUserData.role) {
        throw new Error("Name, email and role are required");
      }

      console.log("Updating user with ID:", editUserData.id);
      
      // Convert split from string to number
      const splitNumber = parseInt(editUserData.split, 10);
      
      // Combine name and artist/label name if applicable
      const combinedName = editUserData.role === "artist" || editUserData.role === "labelowner"
        ? editUserData.artistLabelName 
          ? `${editUserData.name} (${editUserData.artistLabelName})`
          : editUserData.name
        : editUserData.name;
      
      // Update user via API
      const updatedUser = await updateUser(editUserData.id, {
        name: combinedName,
        email: editUserData.email,
        role: editUserData.role,
        split: isNaN(splitNumber) ? 0 : splitNumber,
        isActive: editUserData.isActive
      });
      
      // Update the user in the local state
      setUsers(prevUsers => prevUsers.map(user => {
        // Handle MongoDB ObjectId format or regular id for comparison
        const currentId = typeof user.id === 'object' && (user.id as any)._id 
          ? (user.id as any)._id.toString() 
          : user.id ? user.id.toString() : '';
        
        return currentId === editUserData.id 
          ? {
              ...user,
              name: updatedUser.name,
              email: updatedUser.email,
              split: (updatedUser.split !== undefined ? updatedUser.split : 0) + "%",
              accountStatus: updatedUser.isActive ? "Active" : "Inactive",
              userType: updatedUser.role === "superadmin" 
                ? "Super Admin" 
                : updatedUser.role === "labelowner"
                  ? "Label Owner"
                  : capitalizeFirstLetter(updatedUser.role)
            } 
          : user;
      }));
      
      // Close the modal
      setShowEditUserModal(false);
      
      // Set success message and show success modal
      setSuccessMessage(`User ${extractRealName(updatedUser.name)} has been updated successfully!`);
      setCreatedUserInfo({
        id: updatedUser.id || (updatedUser as any)._id,
        name: updatedUser.name,
        email: updatedUser.email,
        accountStatus: updatedUser.isActive ? "Active" : "Inactive",
        userStatus: "Verified",
        split: (updatedUser.split !== undefined ? updatedUser.split : 0) + "%",
        userType: updatedUser.role === "superadmin" 
          ? "Super Admin" 
          : updatedUser.role === "labelowner"
            ? "Label Owner"
            : capitalizeFirstLetter(updatedUser.role),
        isApproved: updatedUser.isApproved || false
      });
      setShowSuccessModal(true);
    } catch (error: any) {
      setEditUserError(error.response?.data?.message || error.message || "Failed to update user");
    } finally {
      setIsEditingUser(false);
    }
  };

  // Utility function to check if a user is new (created within the last 72 hours)
  const isNewUser = (createdAt?: string): boolean => {
    if (!createdAt) return false;
    
    const creationDate = new Date(createdAt);
    const now = new Date();
    const diffInHours = (now.getTime() - creationDate.getTime()) / (1000 * 60 * 60);
    
    return diffInHours <= 72; // 72 hours = 3 days
  };

  // Handle impersonation confirmation
  const confirmImpersonateUser = (user: User, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent edit modal from opening
    console.log("User to impersonate:", user);
    setUserToImpersonate(user);
    setShowImpersonateModal(true);
    setImpersonateError(null);
  };

  // Handle actual user impersonation
  const handleImpersonateUser = async () => {
    if (!userToImpersonate) return;
    
    // Get user ID to impersonate
    let userId = '';
    if (userToImpersonate.id) {
      userId = typeof userToImpersonate.id === 'object' && (userToImpersonate.id as any)._id 
        ? (userToImpersonate.id as any)._id 
        : userToImpersonate.id.toString();
    } else if ((userToImpersonate as any)._id) {
      userId = (userToImpersonate as any)._id;
    }
    
    if (!userId) {
      setImpersonateError("Cannot login as user: User ID is missing");
      return;
    }
    
    setIsImpersonating(true);
    setImpersonateError(null);
    
    try {
      // Call impersonation API
      const success = await impersonateUser(userId);
      
      if (success) {
        // Redirect to dashboard as the impersonated user
        router.push('/dashboard');
      } else {
        throw new Error("Failed to login as selected user");
      }
    } catch (error: any) {
      setImpersonateError(error.response?.data?.message || error.message || "Failed to login as user");
      setIsImpersonating(false);
    }
  };

  // Cancel impersonation
  const cancelImpersonateUser = () => {
    setShowImpersonateModal(false);
    setUserToImpersonate(null);
    setImpersonateError(null);
  };

  // Handle user approval
  const handleApproveUser = async (user: User, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent edit modal from opening
    setIsApproving(true);
    setApprovalError(null);
    
    try {
      // Get user ID to approve
      let userId = '';
      if (user.id) {
        userId = typeof user.id === 'object' && (user.id as any)._id 
          ? (user.id as any)._id 
          : user.id.toString();
      } else if ((user as any)._id) {
        userId = (user as any)._id;
      }
      
      if (!userId) {
        setApprovalError("Cannot approve user: User ID is missing");
        return;
      }
      
      // Call approve API
      const updatedUser = await approveUser(userId);
      
      // Update user in the local state
      setUsers(prevUsers => prevUsers.map(u => 
        u.id.toString() === userId ? { ...u, isApproved: true } : u
      ));
      
      // Show success toast
      setToast({
        message: `User ${extractRealName(user.name)} has been approved`,
        type: "success",
        visible: true
      });
    } catch (error: any) {
      setApprovalError(error.response?.data?.message || error.message || "Failed to approve user");
      console.error("Error approving user:", error);
      
      // Show error toast
      setToast({
        message: `Failed to approve user: ${error.message}`,
        type: "error",
        visible: true
      });
    } finally {
      setIsApproving(false);
    }
  };
  
  // Handle user rejection
  const handleRejectUser = async (user: User, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent edit modal from opening
    setIsRejecting(true);
    setApprovalError(null);
    
    try {
      // Get user ID to reject
      let userId = '';
      if (user.id) {
        userId = typeof user.id === 'object' && (user.id as any)._id 
          ? (user.id as any)._id 
          : user.id.toString();
      } else if ((user as any)._id) {
        userId = (user as any)._id;
      }
      
      if (!userId) {
        setApprovalError("Cannot reject user: User ID is missing");
        return;
      }
      
      // Call reject API
      await rejectUser(userId);
      
      // Remove user from the local state
      setUsers(prevUsers => prevUsers.filter(u => u.id.toString() !== userId));
      
      // Show success toast
      setToast({
        message: `User ${extractRealName(user.name)} has been rejected`,
        type: "success",
        visible: true
      });
    } catch (error: any) {
      setApprovalError(error.response?.data?.message || error.message || "Failed to reject user");
      console.error("Error rejecting user:", error);
      
      // Show error toast
      setToast({
        message: `Failed to reject user: ${error.message}`,
        type: "error",
        visible: true
      });
    } finally {
      setIsRejecting(false);
    }
  };

  // Handle view user details
  const handleViewUserDetails = async (user: User, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent edit modal from opening
    
    // Get user ID 
    let userId = '';
    if (user.id) {
      userId = typeof user.id === 'object' && (user.id as any)._id 
        ? (user.id as any)._id 
        : user.id.toString();
    } else if ((user as any)._id) {
      userId = (user as any)._id;
    }
    
    if (!userId) {
      setToast({
        message: "Cannot view user details: User ID is missing",
        type: "error",
        visible: true
      });
      return;
    }
    
    setIsLoadingUserDetails(true);
    setUserDetailsError(null);
    
    try {
      // Fetch detailed user data
      const userData = await getUserById(userId);
      setSelectedUserData(userData);
      setShowUserDetailsModal(true);
    } catch (error: any) {
      console.error("Error fetching user details:", error);
      setUserDetailsError(error.message || "Failed to load user details");
      setToast({
        message: `Error loading user details: ${error.message || "Unknown error"}`,
        type: "error",
        visible: true
      });
    } finally {
      setIsLoadingUserDetails(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['superadmin', 'admin']} fallbackUrl="/dashboard">
      <DashboardLayout title="User Management" subtitle="Manage all users and their roles">
        <div>
          {/* Header with Add New User Button */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <div className="flex flex-wrap gap-2 overflow-x-auto">
              {roleTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-3 sm:px-5 py-2 rounded-full whitespace-nowrap text-sm ${
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
              className="px-4 py-2 bg-[#683BAB] text-white rounded-md hover:bg-[#7948C7] transition-colors flex-shrink-0 whitespace-nowrap text-sm sm:text-base"
            >
              <span className="hidden sm:inline">Add New User</span>
              <span className="sm:hidden">Add User</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-80 mb-6">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full py-2 px-4 pl-10 rounded-md bg-[#1D2229] text-gray-300 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
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
              <div className="py-10 px-4 text-center">
                <p className="text-gray-400 text-base sm:text-lg mb-4">No users found</p>
                <button 
                  className="mt-2 px-4 py-2 bg-purple-600 rounded-md text-white hover:bg-purple-700 transition-colors text-sm sm:text-base"
                  onClick={() => setShowNewUserModal(true)}
                >
                  Add New User
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-[#1A1E24]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-12">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        User Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Account Status
                      </th>
                      <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Approval Status
                      </th>
                      <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Split(%)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        User Type
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Login
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#161A1F] divide-y divide-gray-700">
                    {currentItems.map((user, index) => (
                      <tr 
                        key={user.id} 
                        className="hover:bg-[#1A1E24] cursor-pointer"
                        onClick={() => openEditUserModal(user)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-center text-gray-400 text-sm font-medium">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-white">
                          <div className="flex items-center">
                            <span className="truncate max-w-[100px] sm:max-w-none">{extractRealName(user.name)}</span>
                            {isNewUser(user.createdAt) && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-600 text-white">
                                New
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-white">
                          <div className="max-w-[120px] md:max-w-none truncate">
                            {user.email}
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap">
                          <span className={`${
                            user.accountStatus === "Active" 
                              ? "text-green-400" 
                              : "text-red-400"
                          }`}>
                            {user.accountStatus}
                          </span>
                        </td>
                        <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap">
                          {user.isApproved ? (
                            <span className="text-green-400">Approved</span>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className="text-amber-400">Pending</span>
                              <div className="flex space-x-1">
                                <button
                                  onClick={(e) => handleApproveUser(user, e)}
                                  className="h-5 w-5 rounded-full bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white flex items-center justify-center transition-colors"
                                  title="Approve user"
                                  disabled={isApproving}
                                >
                                  <Check size={12} weight="bold" />
                                </button>
                                <button
                                  onClick={(e) => handleRejectUser(user, e)}
                                  className="h-5 w-5 rounded-full bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white flex items-center justify-center transition-colors"
                                  title="Reject user"
                                  disabled={isRejecting}
                                >
                                  <XIcon size={12} weight="bold" />
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="hidden sm:table-cell px-4 py-3 whitespace-nowrap text-white">
                          {user.split}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-white">
                          <span className="truncate max-w-[100px] sm:max-w-none block">
                            {user.userType}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <div className="inline-flex items-center justify-center gap-2">
                            <button 
                              className="h-8 w-8 rounded-full flex items-center justify-center text-blue-400 hover:text-white hover:bg-blue-600 transition-all"
                              onClick={(e) => handleViewUserDetails(user, e)}
                              aria-label="View User Details"
                              title="View User Details"
                              disabled={isLoadingUserDetails}
                            >
                              <Info size={18} weight="bold" />
                            </button>
                            
                            <button 
                              className="h-8 w-8 rounded-full flex items-center justify-center text-purple-400 hover:text-white hover:bg-purple-600 transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditUserModal(user);
                              }}
                              aria-label="Edit User"
                              title="Edit User"
                            >
                              <PencilSimple size={18} weight="bold" />
                            </button>
                            
                            {/* Delete User button */}
                            <button 
                              className="h-8 w-8 rounded-full flex items-center justify-center text-red-400 hover:text-white hover:bg-red-600 transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDeleteUser(user);
                              }}
                              aria-label="Delete User"
                              title="Delete User"
                            >
                              <Trash size={18} weight="bold" />
                            </button>
                          </div>
                        </td>
                        
                        {/* Login as User button in separate column */}
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          {user.userType !== "Super Admin" && user.userType !== "Admin" && user.isApproved ? (
                            <button 
                              className="h-8 w-8 rounded-full flex items-center justify-center mx-auto text-blue-400 hover:text-white hover:bg-blue-600 transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmImpersonateUser(user, e);
                              }}
                              aria-label="Login as User"
                              title="Login as User"
                            >
                              <SignIn size={18} weight="bold" />
                            </button>
                          ) : (
                            <span className="text-gray-500 text-sm">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination - Only show if we have users */}
            {users.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-gray-700">
                <div className="text-sm text-gray-400 mb-4 sm:mb-0">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredUsers.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredUsers.length}</span> results
                </div>
                <div className="flex justify-center">
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
                    
                    {/* Only show a limited number of page numbers on small screens */}
                    {Array.from(
                      { length: Math.min(totalPages, window.innerWidth < 640 ? 3 : 5) }, 
                      (_, i) => i + 1
                    ).map((page) => (
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
            )}
          </div>
        </div>

        {/* Create New User Modal */}
        {showNewUserModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="fixed inset-0 backdrop-blur-sm bg-black/50" onClick={() => setShowNewUserModal(false)}></div>
            <div className="relative z-10 bg-[#111417] rounded-lg overflow-hidden shadow-xl max-w-md w-[95%] sm:w-full max-h-[90vh] flex flex-col transform transition-all">
              {/* Close button */}
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
                onClick={() => setShowNewUserModal(false)}
              >
                <X size={24} />
              </button>
              
              <div className="bg-[#161A1F] p-5 border-b border-gray-700 flex-shrink-0">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#683BAB] flex items-center justify-center mr-4">
                    <svg 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      className="w-6 h-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        d="M12 5V19M5 12H19" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">Create New User</h3>
                </div>
              </div>
              
              <form onSubmit={handleCreateUser} className="flex flex-col h-full overflow-hidden">
                <div className="p-6 space-y-4 overflow-y-auto flex-grow">
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
                      className="w-full px-4 py-2 bg-[#1D2229] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#683BAB]"
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
                      className="w-full px-4 py-2 bg-[#1D2229] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#683BAB]"
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
                      className="w-full px-4 py-2 bg-[#1D2229] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#683BAB]"
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
                      className="w-full px-4 py-2 bg-[#1D2229] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#683BAB]"
                      required
                    >
                      {availableRoles.map(role => (
                        <option key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Conditional Artist/Label Name field */}
                  {(newUserData.role === "artist" || newUserData.role === "labelowner") && (
                    <div>
                      <label htmlFor="artistLabelName" className="block text-sm font-medium text-gray-300 mb-2">
                        {newUserData.role === "artist" ? "Artist Name" : "Label Name"}
                      </label>
                      <input
                        type="text"
                        id="artistLabelName"
                        name="artistLabelName"
                        value={newUserData.artistLabelName}
                        onChange={handleNewUserChange}
                        className="w-full px-4 py-2 bg-[#1D2229] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#683BAB]"
                        placeholder={`Enter ${newUserData.role === "artist" ? "artist" : "label"} name`}
                        required
                      />
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="split" className="block text-sm font-medium text-gray-300 mb-2">
                      Revenue Split (%)
                    </label>
                    <input
                      type="number"
                      id="split"
                      name="split"
                      value={newUserData.split}
                      onChange={handleNewUserChange}
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 bg-[#1D2229] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#683BAB]"
                      placeholder="Enter split percentage (0-100)"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Set the revenue percentage this user will receive. Value must be between 0 and 100.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Account Status
                    </label>
                    <div className="flex items-center justify-between px-4 py-3 bg-[#1D2229] border border-gray-700 rounded-md">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${newUserData.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-white">{newUserData.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewUserData({...newUserData, isActive: !newUserData.isActive})}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full p-1 transition-colors duration-300 ${newUserData.isActive ? 'bg-purple-600' : 'bg-gray-600'}`}
                      >
                        <span 
                          className={`inline-block h-4 w-4 rounded-full bg-white transition-transform duration-300 ${newUserData.isActive ? 'translate-x-5' : 'translate-x-0'}`}
                        />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Toggle account status between active and inactive.
                    </p>
                  </div>
                  
                </div>
                
                <div className="px-6 py-4 border-t border-gray-700 flex justify-end flex-shrink-0 mt-auto">
                  <button
                    type="button"
                    onClick={() => setShowNewUserModal(false)}
                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors mr-2"
                    disabled={isCreatingUser}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#683BAB] text-white rounded-md hover:bg-[#7948C7] transition-colors flex items-center"
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
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="fixed inset-0 backdrop-blur-sm bg-black/50" onClick={() => setShowSuccessModal(false)}></div>
            <div className="relative z-10 bg-[#111417] rounded-lg overflow-hidden shadow-xl max-w-md w-[95%] sm:w-full max-h-[90vh] flex flex-col transform transition-all">
              {/* Close button */}
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
                onClick={() => setShowSuccessModal(false)}
              >
                <X size={24} />
              </button>
              
              {/* Success header */}
              <div className="bg-[#161A1F] p-5 border-b border-gray-700 flex-shrink-0">
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
              <div className="p-5 overflow-y-auto flex-grow">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1A1E24] p-4 rounded">
                    <div className="text-gray-400 text-sm mb-1">Name</div>
                    <div className="text-white font-medium truncate">
                      {extractRealName(createdUserInfo.name)}
                      {isNewUser(createdUserInfo.createdAt) && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-600 text-white">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-[#1A1E24] p-4 rounded">
                    <div className="text-gray-400 text-sm mb-1">Email</div>
                    <div className="text-white font-medium break-all text-sm">{createdUserInfo.email}</div>
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
              <div className="p-5 border-t border-gray-700 flex justify-end flex-shrink-0 mt-auto">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="px-4 py-2 bg-[#683BAB] text-white rounded-md hover:bg-[#7948C7] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && userToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="fixed inset-0 backdrop-blur-sm bg-black/50" onClick={cancelDeleteUser}></div>
            <div className="relative z-10 bg-[#111417] rounded-lg overflow-hidden shadow-xl max-w-md w-[95%] sm:w-full max-h-[90vh] flex flex-col transform transition-all">
              {/* Close button */}
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
                onClick={cancelDeleteUser}
              >
                <X size={24} />
              </button>
              
              {/* Header */}
              <div className="bg-[#161A1F] p-5 border-b border-gray-700 flex-shrink-0">
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
              <div className="p-5 overflow-y-auto flex-grow">
                {deleteError && (
                  <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded mb-4">
                    {deleteError}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-[#1A1E24] p-4 rounded">
                    <div className="text-gray-400 text-sm mb-1">Name</div>
                    <div className="text-white font-medium truncate">{extractRealName(userToDelete.name)}</div>
                  </div>
                  
                  <div className="bg-[#1A1E24] p-4 rounded">
                    <div className="text-gray-400 text-sm mb-1">Email</div>
                    <div className="text-white font-medium break-all text-sm">{userToDelete.email}</div>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="p-5 border-t border-gray-700 flex justify-end flex-shrink-0 mt-auto">
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

        {/* Edit User Modal */}
        {showEditUserModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="fixed inset-0 backdrop-blur-sm bg-black/50" onClick={() => setShowEditUserModal(false)}></div>
            <div className="relative z-10 bg-[#111417] rounded-lg overflow-hidden shadow-xl max-w-md w-[95%] sm:w-full max-h-[90vh] flex flex-col transform transition-all">
              {/* Close button */}
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
                onClick={() => setShowEditUserModal(false)}
              >
                <X size={24} />
              </button>
              
              <div className="bg-[#161A1F] p-5 border-b border-gray-700 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#683BAB] flex items-center justify-center mr-4">
                      <PencilSimple size={24} weight="bold" className="text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Edit User</h3>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleEditUser} className="flex flex-col h-full overflow-hidden">
                <div className="p-6 space-y-4 overflow-y-auto flex-grow">
                  {editUserError && (
                    <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded">
                      {editUserError}
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="edit-name"
                      name="name"
                      value={editUserData.name}
                      onChange={handleEditUserChange}
                      className="w-full px-4 py-2 bg-[#1D2229] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#683BAB]"
                      placeholder="Enter user's full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="edit-email"
                      name="email"
                      value={editUserData.email}
                      onChange={handleEditUserChange}
                      className="w-full px-4 py-2 bg-[#1D2229] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#683BAB]"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-role" className="block text-sm font-medium text-gray-300 mb-2">
                      User Role
                    </label>
                    <select
                      id="edit-role"
                      name="role"
                      value={editUserData.role}
                      onChange={handleEditUserChange}
                      className="w-full px-4 py-2 bg-[#1D2229] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#683BAB]"
                      required
                    >
                      {availableRoles.map(role => (
                        <option key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Conditional Artist/Label Name field for edit form */}
                  {(editUserData.role === "artist" || editUserData.role === "labelowner") && (
                    <div>
                      <label htmlFor="edit-artistLabelName" className="block text-sm font-medium text-gray-300 mb-2">
                        {editUserData.role === "artist" ? "Artist Name" : "Label Name"}
                      </label>
                      <input
                        type="text"
                        id="edit-artistLabelName"
                        name="artistLabelName"
                        value={editUserData.artistLabelName}
                        onChange={handleEditUserChange}
                        className="w-full px-4 py-2 bg-[#1D2229] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#683BAB]"
                        placeholder={`Enter ${editUserData.role === "artist" ? "artist" : "label"} name`}
                      />
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="edit-split" className="block text-sm font-medium text-gray-300 mb-2">
                      Revenue Split (%)
                    </label>
                    <input
                      type="number"
                      id="edit-split"
                      name="split"
                      value={editUserData.split}
                      onChange={handleEditUserChange}
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 bg-[#1D2229] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#683BAB]"
                      placeholder="Enter split percentage (0-100)"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Set the revenue percentage this user will receive. Value must be between 0 and 100.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Account Status
                    </label>
                    <div className="flex items-center justify-between px-4 py-3 bg-[#1D2229] border border-gray-700 rounded-md">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${editUserData.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-white">{editUserData.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditUserData({...editUserData, isActive: !editUserData.isActive})}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full p-1 transition-colors duration-300 ${editUserData.isActive ? 'bg-purple-600' : 'bg-gray-600'}`}
                      >
                        <span 
                          className={`inline-block h-4 w-4 rounded-full bg-white transition-transform duration-300 ${editUserData.isActive ? 'translate-x-5' : 'translate-x-0'}`}
                        />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Toggle account status between active and inactive.
                    </p>
                  </div>
                  
                </div>
                
                <div className="px-6 py-4 border-t border-gray-700 flex justify-end flex-shrink-0 mt-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditUserModal(false);
                      const user = users.find(u => {
                        const userId = typeof u.id === 'object' && (u.id as any)._id 
                          ? (u.id as any)._id.toString() 
                          : u.id ? u.id.toString() : '';
                        return userId === editUserData.id;
                      });
                      if (user) confirmDeleteUser(user);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors mr-2 flex items-center"
                    disabled={isEditingUser}
                  >
                    <Trash size={20} weight="bold" className="mr-2" />
                    Delete
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#683BAB] text-white rounded-md hover:bg-[#7948C7] transition-colors flex items-center"
                    disabled={isEditingUser}
                  >
                    {isEditingUser ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Impersonation Confirmation Modal */}
        {showImpersonateModal && userToImpersonate && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="fixed inset-0 backdrop-blur-sm bg-black/50" onClick={cancelImpersonateUser}></div>
            <div className="relative z-10 bg-[#111417] rounded-lg overflow-hidden shadow-xl max-w-md w-[95%] sm:w-full max-h-[90vh] flex flex-col transform transition-all">
              {/* Close button */}
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
                onClick={cancelImpersonateUser}
              >
                <X size={24} />
              </button>
              
              {/* Header */}
              <div className="bg-[#161A1F] p-5 border-b border-gray-700 flex-shrink-0">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-4">
                    <SignIn size={24} weight="bold" className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Login as User</h3>
                </div>
                <p className="text-gray-300 mt-2">
                  You are about to login as this user. This will log you out from your admin account.
                </p>
              </div>
              
              {/* User details */}
              <div className="p-5 overflow-y-auto flex-grow">
                {impersonateError && (
                  <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded mb-4">
                    {impersonateError}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-[#1A1E24] p-4 rounded">
                    <div className="text-gray-400 text-sm mb-1">Name</div>
                    <div className="text-white font-medium truncate">{extractRealName(userToImpersonate.name)}</div>
                  </div>
                  
                  <div className="bg-[#1A1E24] p-4 rounded">
                    <div className="text-gray-400 text-sm mb-1">Email</div>
                    <div className="text-white font-medium break-all text-sm">{userToImpersonate.email}</div>
                  </div>
                  
                  <div className="bg-[#1A1E24] p-4 rounded">
                    <div className="text-gray-400 text-sm mb-1">Role</div>
                    <div className="text-white font-medium">{userToImpersonate.userType}</div>
                  </div>
                  
                  <div className="bg-[#1A1E24] p-4 rounded">
                    <div className="text-gray-400 text-sm mb-1">Account Status</div>
                    <div className={`font-medium ${userToImpersonate.accountStatus === "Active" ? "text-green-400" : "text-red-400"}`}>
                      {userToImpersonate.accountStatus}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="p-5 border-t border-gray-700 flex justify-end flex-shrink-0 mt-auto">
                <button
                  onClick={cancelImpersonateUser}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors mr-2"
                  disabled={isImpersonating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleImpersonateUser}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  disabled={isImpersonating}
                >
                  {isImpersonating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Login as User"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast.visible && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, visible: false })}
          />
        )}

        {/* Add User Details Modal */}
        <UserDetailsModal 
          isOpen={showUserDetailsModal}
          onClose={() => setShowUserDetailsModal(false)}
          user={selectedUserData as any}
        />
      </DashboardLayout>
    </RoleGuard>
  );
}
