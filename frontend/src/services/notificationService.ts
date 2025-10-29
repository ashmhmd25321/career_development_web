import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'job' | 'application' | 'event' | 'system' | 'message';
  is_read: boolean;
  related_id?: number;
  created_at: string;
  read_at?: string;
}

const getAuthHeaders = () => {
  const tokens = localStorage.getItem('authTokens');
  if (tokens) {
    const { accessToken } = JSON.parse(tokens);
    return { Authorization: `Bearer ${accessToken}` };
  }
  return {};
};

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await axios.get(`${API_BASE_URL}/notifications`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await axios.get(`${API_BASE_URL}/notifications/unread-count`, {
      headers: getAuthHeaders()
    });
    return response.data.count;
  },

  markAsRead: async (notificationId: number): Promise<void> => {
    await axios.put(`${API_BASE_URL}/notifications/${notificationId}/read`, {}, {
      headers: getAuthHeaders()
    });
  },

  markAllAsRead: async (): Promise<void> => {
    await axios.put(`${API_BASE_URL}/notifications/all/read`, {}, {
      headers: getAuthHeaders()
    });
  },

  deleteNotification: async (notificationId: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/notifications/${notificationId}`, {
      headers: getAuthHeaders()
    });
  },

  deleteAllNotifications: async (): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/notifications`, {
      headers: getAuthHeaders()
    });
  }
};

