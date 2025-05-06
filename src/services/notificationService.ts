import api from './api';

export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  isRead: boolean;
  relatedTo: 'withdrawal' | 'release' | 'track' | 'general';
  relatedItemId?: string;
  relatedItemModel?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  success: boolean;
  count: number;
  unreadCount: number;
  data: Notification[];
}

/**
 * Get all notifications for the authenticated user
 */
export const getUserNotifications = async (): Promise<NotificationResponse> => {
  try {
    const response = await api.get('/notifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param id - Notification ID
 */
export const markNotificationAsRead = async (id: string): Promise<Notification> => {
  try {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data.data;
  } catch (error) {
    console.error(`Error marking notification as read:`, error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.put('/notifications/read-all');
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Delete a notification
 * @param id - Notification ID
 */
export const deleteNotification = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/notifications/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting notification:`, error);
    throw error;
  }
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete('/notifications/clear-all');
    return response.data;
  } catch (error) {
    console.error('Error clearing all notifications:', error);
    throw error;
  }
}; 