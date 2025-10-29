import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface NotificationTemplate {
  id: number;
  name: string;
  title_template: string;
  message_template: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'job' | 'application' | 'event' | 'system' | 'message';
  variables?: string;
  description?: string;
  created_by?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateData {
  name: string;
  title_template: string;
  message_template: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  category?: 'job' | 'application' | 'event' | 'system' | 'message';
  variables?: string[];
  description?: string;
}

export interface UpdateTemplateData {
  name?: string;
  title_template?: string;
  message_template?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  category?: 'job' | 'application' | 'event' | 'system' | 'message';
  variables?: string[];
  description?: string;
  is_active?: boolean;
}

const getAuthHeaders = () => {
  const tokens = localStorage.getItem('authTokens');
  if (tokens) {
    const { accessToken } = JSON.parse(tokens);
    return { Authorization: `Bearer ${accessToken}` };
  }
  return {};
};

export const notificationTemplateService = {
  getAllTemplates: async (activeOnly: boolean = false): Promise<NotificationTemplate[]> => {
    const response = await axios.get(`${API_BASE_URL}/notifications/templates`, {
      headers: getAuthHeaders(),
      params: { active: activeOnly }
    });
    return response.data;
  },

  getTemplateById: async (id: number): Promise<NotificationTemplate> => {
    const response = await axios.get(`${API_BASE_URL}/notifications/templates/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  createTemplate: async (data: CreateTemplateData): Promise<NotificationTemplate> => {
    const response = await axios.post(
      `${API_BASE_URL}/notifications/templates`,
      data,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  updateTemplate: async (id: number, data: UpdateTemplateData): Promise<NotificationTemplate> => {
    const response = await axios.put(
      `${API_BASE_URL}/notifications/templates/${id}`,
      data,
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  deleteTemplate: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/notifications/templates/${id}`, {
      headers: getAuthHeaders()
    });
  },

  previewTemplate: async (id: number, variables: Record<string, any>): Promise<{ title: string; message: string }> => {
    const response = await axios.post(
      `${API_BASE_URL}/notifications/templates/${id}/preview`,
      { variables },
      { headers: getAuthHeaders() }
    );
    return response.data;
  },

  useTemplateToSend: async (
    id: number,
    userId?: number,
    variables?: Record<string, any>,
    relatedId?: number
  ): Promise<void> => {
    await axios.post(
      `${API_BASE_URL}/notifications/templates/${id}/send`,
      { user_id: userId, variables, related_id: relatedId },
      { headers: getAuthHeaders() }
    );
  },

  getAvailableVariables: async (category: string): Promise<{ variables: string[] }> => {
    const response = await axios.get(`${API_BASE_URL}/notifications/templates/variables`, {
      headers: getAuthHeaders(),
      params: { category }
    });
    return response.data;
  }
};

