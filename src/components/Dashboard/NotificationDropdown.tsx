"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification, 
  clearAllNotifications,
  Notification
} from '@/services/notificationService';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch notifications on component mount and when dropdown is opened
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Periodically check for new notifications (every minute)
  useEffect(() => {
    const intervalId = setInterval(fetchUnreadCount, 60000);
    fetchUnreadCount(); // Initial fetch

    return () => clearInterval(intervalId);
  }, []);

  // Fetch only the unread count (for performance)
  const fetchUnreadCount = async () => {
    try {
      const response = await getUserNotifications();
      setUnreadCount(response.unreadCount);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  // Fetch all notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserNotifications();
      setNotifications(response.data);
      setUnreadCount(response.unreadCount);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Mark a notification as read
  const handleMarkAsRead = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await markNotificationAsRead(id);
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => 
          notif._id === id ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Delete a notification
  const handleDeleteNotification = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications(prevNotifications => 
        prevNotifications.filter(notif => notif._id !== id)
      );
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n._id === id);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Clear all notifications
  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Error clearing all notifications:', err);
    }
  };

  // Toggle dropdown open/closed
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Format date to "X time ago" format
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (err) {
      return 'Unknown time';
    }
  };

  // Get icon color based on notification type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-blue-500';
    }
  };

  // Get icon based on notification type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon with Badge */}
      <button 
        onClick={toggleDropdown}
        className="relative text-gray-400 hover:text-white transition-colors p-2 rounded-full focus:outline-none"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Notification Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-red-600 text-white text-xs font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-[#161A1F] rounded-lg shadow-lg overflow-hidden z-50 border border-gray-700">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium text-white">Notifications</h3>
            {notifications.length > 0 && (
              <div className="flex space-x-2">
                <button 
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Mark all as read
                </button>
                <button 
                  onClick={handleClearAll}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
          
          {/* Body */}
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="p-4 text-center">
                <div className="animate-spin mx-auto h-6 w-6 border-t-2 border-b-2 border-purple-500 rounded-full"></div>
                <p className="mt-2 text-sm text-gray-400">Loading notifications...</p>
              </div>
            )}
            
            {error && !loading && (
              <div className="p-4 text-center text-red-400">
                <p>{error}</p>
                <button 
                  onClick={fetchNotifications}
                  className="mt-2 px-3 py-1 bg-[#1D2229] rounded-md text-xs text-white hover:bg-gray-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {!loading && !error && notifications.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 mb-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p>No notifications yet</p>
              </div>
            )}
            
            {!loading && !error && notifications.length > 0 && (
              <div>
                {notifications.map((notification) => (
                  <div 
                    key={notification._id} 
                    className={`p-4 border-b border-gray-700 hover:bg-[#1D2229] transition-colors ${
                      !notification.isRead ? 'bg-[#1A1E24]/60' : ''
                    }`}
                  >
                    <div className="flex">
                      <div className="mr-3 flex-shrink-0 mt-1">
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <p className={`font-medium text-sm ${!notification.isRead ? 'text-white' : 'text-gray-300'}`}>
                            {notification.title}
                          </p>
                          <div className="flex">
                            {!notification.isRead && (
                              <button
                                onClick={(e) => handleMarkAsRead(notification._id, e)}
                                className="ml-1 text-gray-400 hover:text-white transition-colors"
                                title="Mark as read"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDeleteNotification(notification._id, e)}
                              className="ml-1 text-gray-400 hover:text-red-400 transition-colors"
                              title="Delete notification"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{notification.message}</p>
                        <p className="text-gray-500 text-xs mt-2">{formatDate(notification.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer - View All Link */}
          <div className="px-4 py-3 border-t border-gray-700 text-center">
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 