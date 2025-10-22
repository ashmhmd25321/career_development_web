import axios from 'axios';
import { ApiResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const authTokens = localStorage.getItem('authTokens');
  if (authTokens) {
    const tokens = JSON.parse(authTokens);
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

export interface JobAnalytics {
  totalJobs: number;
  activeJobs: number;
  pausedJobs: number;
  closedJobs: number;
  draftJobs: number;
  expiredJobs: number;
  totalViews: number;
  totalApplications: number;
  averageViewsPerJob: number;
  averageApplicationsPerJob: number;
  conversionRate: number;
  topPerformingJobs: Array<{
    id: number;
    title: string;
    views: number;
    applications: number;
    conversionRate: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    jobsPosted: number;
    applicationsReceived: number;
    viewsGenerated: number;
  }>;
  applicationTrends: Array<{
    date: string;
    applications: number;
  }>;
}

export interface JobPerformanceMetrics {
  id: number;
  title: string;
  status: string;
  views_count: number;
  applications_count: number;
  created_at: string;
  updated_at: string;
  conversionRate: number;
  daysActive: number;
}

export interface ApplicationAnalytics {
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  applicationsByJob: Array<{
    id: number;
    title: string;
    applicationCount: number;
    recentApplications: number;
  }>;
}

export const analyticsService = {
  // Get comprehensive job analytics
  async getJobAnalytics(timeRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<JobAnalytics> {
    try {
      const response = await api.get<ApiResponse<{ analytics: JobAnalytics }>>('/analytics/jobs', {
        params: { timeRange }
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data.analytics;
      }
      throw new Error(response.data.error?.message || 'Failed to fetch job analytics');
    } catch (error: any) {
      console.error('Error fetching job analytics:', error);
      throw error;
    }
  },

  // Get job performance metrics
  async getJobPerformanceMetrics(jobId?: number): Promise<JobPerformanceMetrics[]> {
    try {
      const response = await api.get<ApiResponse<{ metrics: JobPerformanceMetrics[] }>>('/analytics/performance', {
        params: jobId ? { jobId } : {}
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data.metrics;
      }
      throw new Error(response.data.error?.message || 'Failed to fetch job performance metrics');
    } catch (error: any) {
      console.error('Error fetching job performance metrics:', error);
      throw error;
    }
  },

  // Get application analytics
  async getApplicationAnalytics(timeRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<ApplicationAnalytics> {
    try {
      const response = await api.get<ApiResponse<{ analytics: ApplicationAnalytics }>>('/analytics/applications', {
        params: { timeRange }
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data.analytics;
      }
      throw new Error(response.data.error?.message || 'Failed to fetch application analytics');
    } catch (error: any) {
      console.error('Error fetching application analytics:', error);
      throw error;
    }
  }
};
