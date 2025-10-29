import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface NotificationPreferences {
  id: number;
  user_id: number;
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  job_notifications: boolean;
  application_notifications: boolean;
  event_notifications: boolean;
  system_notifications: boolean;
  message_notifications: boolean;
  info_notifications: boolean;
  success_notifications: boolean;
  warning_notifications: boolean;
  error_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdatePreferencesData {
  email_enabled?: boolean;
  push_enabled?: boolean;
  in_app_enabled?: boolean;
  job_notifications?: boolean;
  application_notifications?: boolean;
  event_notifications?: boolean;
  system_notifications?: boolean;
  message_notifications?: boolean;
  info_notifications?: boolean;
  success_notifications?: boolean;
  warning_notifications?: boolean;
  error_notifications?: boolean;
}

const getAuthHeaders = () => {
  const tokens = localStorage.getItem('authTokens');
  if (tokens) {
    const { accessToken } = JSON.parse(tokens);
    return { Authorization: `Bearer ${accessToken}` };
  }
  return {};
};

export const notificationPreferencesService = {
  getPreferences: async (): Promise<NotificationPreferences> => {
    const response = await axios.get(`${API_BASE_URL}/notifications/preferences`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  updatePreferences: async (preferences: UpdatePreferencesData): Promise<NotificationPreferences> => {
    const response = await axios.put(
      `${API_BASE_URL}/notifications/preferences`,
      preferences,
      { headers: getAuthHeaders() }
    );
    return response.data;
  }
};

