import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface AdminDashboardMetrics {
  userMetrics: {
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    usersByRole: Array<{ role: string; count: number; percentage: number }>;
    newUsersThisMonth: number;
    newUsersTrend: Array<{ date: string; count: number }>;
    userEngagementRate: number;
  };
  jobMetrics: {
    totalJobs: number;
    activeJobs: number;
    totalJobViews: number;
    totalApplications: number;
    averageViewsPerJob: number;
    averageApplicationsPerJob: number;
    conversionRate: number;
    jobsByStatus: Array<{ status: string; count: number; percentage: number }>;
    jobsByCategory: Array<{ category: string; count: number }>;
    jobsPostedTrend: Array<{ date: string; count: number }>;
    topEmployers: Array<{ employer_id: number; company_name: string; job_count: number }>;
  };
  applicationMetrics: {
    totalApplications: number;
    applicationsByStatus: Array<{ status: string; count: number; percentage: number }>;
    averageApplicationsPerJob: number;
    applicationTrends: Array<{ date: string; count: number }>;
    topApplicantJobs: Array<{ job_id: number; job_title: string; application_count: number }>;
    applicationConversionRate: number;
  };
  engagementMetrics: {
    totalEvents: number;
    activeEvents: number;
    totalEventRegistrations: number;
    averageRegistrationsPerEvent: number;
    eventsByType: Array<{ type: string; count: number }>;
    totalSkillsTracked: number;
    totalLearningResources: number;
    totalCertificationsEarned: number;
    userSkillsCount: number;
    careerGoalsCount: number;
    learningProgressCount: number;
  };
  performanceIndicators: {
    dailyActiveUsers: number;
    monthlyActiveUsers: number;
    jobPostingRate: number;
    applicationRate: number;
    jobFillRate: number;
    averageTimeToApplication: number;
    platformGrowthRate: number;
    retentionRate: number;
  };
  systemHealth: {
    totalNotificationsSent: number;
    averageNotificationReadRate: number;
    systemUptime: string;
    databaseSize: number;
    activeSessions: number;
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

export const adminDashboardService = {
  getDashboardMetrics: async (timeRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<AdminDashboardMetrics> => {
    const response = await axios.get(`${API_BASE_URL}/analytics/admin/dashboard`, {
      headers: getAuthHeaders(),
      params: { timeRange }
    });
    
    if (response.data.success && response.data.data) {
      return response.data.data.metrics;
    }
    throw new Error(response.data.error?.message || 'Failed to fetch dashboard metrics');
  }
};

