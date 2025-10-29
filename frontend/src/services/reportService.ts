import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use((config) => {
  const authTokens = localStorage.getItem('authTokens');
  if (authTokens) {
    try {
      const tokens = JSON.parse(authTokens);
      if (tokens.accessToken) {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      }
    } catch (error) {
      console.error('Error parsing auth tokens:', error);
    }
  }
  return config;
});

export interface ReportConfig {
  filters?: Record<string, any>;
  fields?: string[];
  timeRange?: '7d' | '30d' | '90d' | '1y';
  includeCharts?: boolean;
  grouping?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}

export interface Report {
  id: number;
  user_id: number;
  report_type: string;
  report_name: string;
  description: string | null;
  report_config: ReportConfig;
  format: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  file_path: string | null;
  file_size: number | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateReportData {
  reportType: 'user_analytics' | 'job_analytics' | 'application_analytics' | 'engagement_analytics' | 'custom';
  reportName: string;
  description?: string;
  reportConfig: ReportConfig;
  format: 'csv' | 'pdf' | 'excel' | 'json';
  expiresAt?: string;
}

export interface ScheduledReport {
  id: number;
  user_id: number;
  report_template_id: number | null;
  report_name: string;
  report_type: string;
  report_config: ReportConfig;
  schedule_type: 'daily' | 'weekly' | 'monthly' | 'custom';
  schedule_config: any;
  format: string;
  recipients: string[] | null;
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateScheduledReportData {
  reportTemplateId?: number;
  reportName: string;
  reportType: 'user_analytics' | 'job_analytics' | 'application_analytics' | 'engagement_analytics' | 'custom';
  reportConfig: ReportConfig;
  scheduleType: 'daily' | 'weekly' | 'monthly' | 'custom';
  scheduleConfig?: {
    dayOfWeek?: number;
    dayOfMonth?: number;
    hour?: number;
    minute?: number;
    cronExpression?: string;
  };
  format: 'csv' | 'pdf' | 'excel' | 'json';
  recipients?: string[];
  is_active?: boolean;
}

export const reportService = {
  // Create a new report
  async createReport(data: CreateReportData): Promise<Report> {
    const response = await apiClient.post('/reports', data);
    return response.data.data.report;
  },

  // Get user's reports
  async getUserReports(limit: number = 50, offset: number = 0): Promise<Report[]> {
    const response = await apiClient.get('/reports', {
      params: { limit, offset }
    });
    return response.data.data.reports;
  },

  // Get report by ID
  async getReportById(reportId: number): Promise<Report> {
    const response = await apiClient.get(`/reports/${reportId}`);
    return response.data.data.report;
  },

  // Download report file
  async downloadReport(reportId: number): Promise<Blob> {
    const response = await apiClient.get(`/reports/${reportId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Delete report
  async deleteReport(reportId: number): Promise<void> {
    await apiClient.delete(`/reports/${reportId}`);
  },

  // Get report analytics
  async getReportAnalytics(reportId: number): Promise<any> {
    const response = await apiClient.get(`/reports/${reportId}/analytics`);
    return response.data.data.analytics;
  },

  // Share report
  async shareReport(
    reportId: number,
    sharedWithUserId?: number | null,
    accessLevel: 'view' | 'download' = 'view',
    expiresAt?: string | null
  ): Promise<{ share: any; shareUrl: string }> {
    const response = await apiClient.post(`/reports/${reportId}/share`, {
      sharedWithUserId,
      accessLevel,
      expiresAt
    });
    return response.data.data;
  },

  // Get shared report by token (public)
  async getSharedReport(shareToken: string): Promise<{ report: Report; share: any }> {
    const response = await axios.get(`${API_BASE_URL}/reports/shared/${shareToken}`);
    return response.data.data;
  },

  // Download shared report (public)
  async downloadSharedReport(shareToken: string): Promise<Blob> {
    const response = await axios.get(`${API_BASE_URL}/reports/shared/${shareToken}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Revoke share
  async revokeShare(shareId: number): Promise<void> {
    await apiClient.delete(`/reports/share/${shareId}`);
  },

  // Scheduled Reports
  async createScheduledReport(data: CreateScheduledReportData): Promise<ScheduledReport> {
    const response = await apiClient.post('/reports/scheduled', data);
    return response.data.data.scheduledReport;
  },

  async getScheduledReports(): Promise<ScheduledReport[]> {
    const response = await apiClient.get('/reports/scheduled');
    return response.data.data.scheduledReports;
  },

  async getScheduledReportById(scheduledReportId: number): Promise<ScheduledReport> {
    const response = await apiClient.get(`/reports/scheduled/${scheduledReportId}`);
    return response.data.data.scheduledReport;
  },

  async updateScheduledReport(scheduledReportId: number, updates: Partial<CreateScheduledReportData>): Promise<ScheduledReport> {
    const response = await apiClient.put(`/reports/scheduled/${scheduledReportId}`, updates);
    return response.data.data.scheduledReport;
  },

  async deleteScheduledReport(scheduledReportId: number): Promise<void> {
    await apiClient.delete(`/reports/scheduled/${scheduledReportId}`);
  },

  async runScheduledReportNow(scheduledReportId: number): Promise<Report> {
    const response = await apiClient.post(`/reports/scheduled/${scheduledReportId}/run-now`);
    return response.data.data.report;
  }
};

