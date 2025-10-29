import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface ScheduledNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'job' | 'application' | 'event' | 'system' | 'message';
  scheduled_at: string;
  is_sent: boolean;
  sent_at?: string;
  related_id?: number;
  created_at: string;
}

export interface CreateScheduledNotificationData {
  user_id?: number;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  category?: 'job' | 'application' | 'event' | 'system' | 'message';
  scheduled_at: string;
  related_id?: number;
}

const getAuthHeaders = () => {
  const tokens = localStorage.getItem('authTokens');
  if (tokens) {
    const { accessToken } = JSON.parse(tokens);
    return { Authorization: `Bearer ${accessToken}` };
  }
  return {};
};

export const notificationSchedulerService = {
  scheduleNotification: async (data: CreateScheduledNotificationData): Promise<ScheduledNotification> => {
    const response = await axios.post(
      `${API_BASE_URL}/notifications/schedule`,
      data,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  getUserScheduledNotifications: async (): Promise<ScheduledNotification[]> => {
    const response = await axios.get(`${API_BASE_URL}/notifications/scheduled`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  updateScheduledNotification: async (
    id: number,
    updates: Partial<CreateScheduledNotificationData>
  ): Promise<ScheduledNotification> => {
    const response = await axios.put(
      `${API_BASE_URL}/notifications/scheduled/${id}`,
      updates,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  deleteScheduledNotification: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/notifications/scheduled/${id}`, {
      headers: getAuthHeaders()
    });
  },

  processScheduledNotifications: async (): Promise<{ message: string; sent_count: number }> => {
    const response = await axios.post(
      `${API_BASE_URL}/notifications/scheduled/process`,
      {},
      { headers: getAuthHeaders() }
    );
    return response.data;
  }
};

