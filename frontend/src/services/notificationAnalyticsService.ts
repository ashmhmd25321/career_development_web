import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface NotificationAnalytics {
  totalNotifications: number;
  readCount: number;
  unreadCount: number;
  readRate: number;
  unreadRate: number;
  notificationsByCategory: Array<{ category: string; count: number; readCount: number }>;
  notificationsByType: Array<{ type: string; count: number; readCount: number }>;
  notificationTrends: Array<{ date: string; sent: number; read: number }>;
  averageTimeToRead: number | null;
  mostEngagedUsers?: Array<{
    user_id: number;
    user_name: string;
    notification_count: number;
    read_count: number;
    read_rate: number;
  }>;
  deliveryMethodStats?: {
    email_enabled_count: number;
    push_enabled_count: number;
    in_app_enabled_count: number;
  };
}

const getAuthHeaders = () => {
  const tokens = localStorage.getItem('authTokens');
  if (tokens) {
    const { accessToken } = JSON.parse(tokens);
    return { Authorization: `Bearer ${accessToken}` };
  }
  return {};
};

export const notificationAnalyticsService = {
  getOverallAnalytics: async (): Promise<NotificationAnalytics> => {
    const response = await axios.get(`${API_BASE_URL}/notifications/analytics`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  getUserAnalytics: async (): Promise<NotificationAnalytics> => {
    const response = await axios.get(`${API_BASE_URL}/notifications/analytics/user`, {
      headers: getAuthHeaders()
    });
    return response.data;
  }
};

