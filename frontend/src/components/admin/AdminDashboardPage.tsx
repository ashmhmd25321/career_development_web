import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { adminDashboardService, AdminDashboardMetrics } from '../../services/adminDashboardService';
import { Card, CardContent, Badge, Button } from '../ui';
import { 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Database,
  Bell,
  Calendar,
  BookOpen,
  Award,
  CheckCircle,
  XCircle
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    if (user?.role === 'admin') {
      loadMetrics();
    }
  }, [user, timeRange]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminDashboardService.getDashboardMetrics(timeRange);
      setMetrics(data);
    } catch (err: any) {
      console.error('Error loading dashboard metrics:', err);
      setError(err.response?.data?.error?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (user?.role !== 'admin') {
    return (
      <div className="container-custom py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-800">You do not have permission to access this page</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <p className="text-gray-600">Loading dashboard metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-800">{error}</p>
            <Button variant="primary" onClick={loadMetrics} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="container-custom py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive platform analytics and metrics</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.userMetrics.totalUsers)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {metrics.userMetrics.activeUsers} active
                </p>
              </div>
              <Users className="w-10 h-10 text-primary-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.jobMetrics.totalJobs)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {metrics.jobMetrics.activeJobs} active
                </p>
              </div>
              <Briefcase className="w-10 h-10 text-secondary-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Applications</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.applicationMetrics.totalApplications)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {metrics.applicationMetrics.averageApplicationsPerJob.toFixed(1)} avg/job
                </p>
              </div>
              <FileText className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Events</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.engagementMetrics.totalEvents)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {metrics.engagementMetrics.activeEvents} active
                </p>
              </div>
              <Calendar className="w-10 h-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Indicators */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Performance Indicators (KPIs)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Daily Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.performanceIndicators.dailyActiveUsers}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Monthly Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.performanceIndicators.monthlyActiveUsers)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Job Posting Rate</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.performanceIndicators.jobPostingRate.toFixed(1)}/day</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Application Rate</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.performanceIndicators.applicationRate.toFixed(1)}/day</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Job Fill Rate</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.performanceIndicators.jobFillRate.toFixed(1)}%</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Avg Time to Application</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.performanceIndicators.averageTimeToApplication.toFixed(1)} days</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Growth Rate</p>
              <p className={`text-2xl font-bold ${metrics.performanceIndicators.platformGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.performanceIndicators.platformGrowthRate >= 0 ? '+' : ''}{metrics.performanceIndicators.platformGrowthRate.toFixed(1)}%
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Retention Rate</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.performanceIndicators.retentionRate.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Metrics */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              User Analytics
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-xl font-semibold text-gray-900">{formatNumber(metrics.userMetrics.activeUsers)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Verified Users</p>
                  <p className="text-xl font-semibold text-gray-900">{formatNumber(metrics.userMetrics.verifiedUsers)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">New This Month</p>
                  <p className="text-xl font-semibold text-gray-900">{formatNumber(metrics.userMetrics.newUsersThisMonth)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Engagement Rate</p>
                  <p className="text-xl font-semibold text-gray-900">{metrics.userMetrics.userEngagementRate.toFixed(1)}%</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Users by Role</p>
                <div className="space-y-2">
                  {metrics.userMetrics.usersByRole.map((role) => (
                    <div key={role.role}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm capitalize text-gray-700">{role.role}</span>
                        <Badge variant="secondary">{role.count} ({role.percentage}%)</Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${role.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Metrics */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Job Analytics
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Views</p>
                  <p className="text-xl font-semibold text-gray-900">{formatNumber(metrics.jobMetrics.totalJobViews)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                  <p className="text-xl font-semibold text-gray-900">{metrics.jobMetrics.conversionRate.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Views/Job</p>
                  <p className="text-xl font-semibold text-gray-900">{metrics.jobMetrics.averageViewsPerJob.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Apps/Job</p>
                  <p className="text-xl font-semibold text-gray-900">{metrics.jobMetrics.averageApplicationsPerJob.toFixed(1)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Jobs by Status</p>
                <div className="space-y-2">
                  {metrics.jobMetrics.jobsByStatus.map((status) => {
                    const statusColors: Record<string, string> = {
                      active: 'bg-green-100 text-green-800',
                      paused: 'bg-yellow-100 text-yellow-800',
                      closed: 'bg-red-100 text-red-800',
                      draft: 'bg-gray-100 text-gray-800',
                      expired: 'bg-orange-100 text-orange-800'
                    };
                    return (
                      <div key={status.status}>
                        <div className="flex items-center justify-between mb-1">
                          <Badge className={statusColors[status.status] || 'bg-gray-100 text-gray-800'}>
                            {status.status}
                          </Badge>
                          <span className="text-sm text-gray-700">{status.count} ({status.percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${status.percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Metrics */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Application Analytics
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Applications</p>
                  <p className="text-xl font-semibold text-gray-900">{formatNumber(metrics.applicationMetrics.totalApplications)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                  <p className="text-xl font-semibold text-gray-900">{metrics.applicationMetrics.applicationConversionRate.toFixed(1)}%</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Applications by Status</p>
                <div className="space-y-2">
                  {metrics.applicationMetrics.applicationsByStatus.map((status) => {
                    const statusColors: Record<string, string> = {
                      pending: 'bg-yellow-100 text-yellow-800',
                      reviewed: 'bg-blue-100 text-blue-800',
                      shortlisted: 'bg-purple-100 text-purple-800',
                      interview: 'bg-indigo-100 text-indigo-800',
                      offered: 'bg-green-100 text-green-800',
                      rejected: 'bg-red-100 text-red-800',
                      withdrawn: 'bg-gray-100 text-gray-800'
                    };
                    return (
                      <div key={status.status}>
                        <div className="flex items-center justify-between mb-1">
                          <Badge className={statusColors[status.status] || 'bg-gray-100 text-gray-800'}>
                            {status.status}
                          </Badge>
                          <span className="text-sm text-gray-700">{status.count} ({status.percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${status.percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Metrics */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Engagement Metrics
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Event Registrations</p>
                  <p className="text-xl font-semibold text-gray-900">{formatNumber(metrics.engagementMetrics.totalEventRegistrations)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Skills Tracked</p>
                  <p className="text-xl font-semibold text-gray-900">{formatNumber(metrics.engagementMetrics.userSkillsCount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Learning Resources</p>
                  <p className="text-xl font-semibold text-gray-900">{formatNumber(metrics.engagementMetrics.totalLearningResources)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Certifications</p>
                  <p className="text-xl font-semibold text-gray-900">{formatNumber(metrics.engagementMetrics.totalCertificationsEarned)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Events by Type</p>
                <div className="space-y-2">
                  {metrics.engagementMetrics.eventsByType.map((event) => (
                    <div key={event.type}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm capitalize text-gray-700">{event.type}</span>
                        <Badge variant="secondary">{event.count}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2" />
            System Health
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-5 h-5 text-primary-600" />
                <p className="text-sm text-gray-600">Notifications Sent</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.systemHealth.totalNotificationsSent)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm text-gray-600">Read Rate</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{metrics.systemHealth.averageNotificationReadRate.toFixed(1)}%</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-green-600" />
                <p className="text-sm text-gray-600">System Uptime</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{metrics.systemHealth.systemUptime}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-gray-600">Database Size</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {typeof metrics.systemHealth.databaseSize === 'number' 
                  ? metrics.systemHealth.databaseSize.toFixed(2) 
                  : parseFloat(metrics.systemHealth.databaseSize || 0).toFixed(2)} MB
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-600" />
                <p className="text-sm text-gray-600">Active Sessions</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{metrics.systemHealth.activeSessions}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

