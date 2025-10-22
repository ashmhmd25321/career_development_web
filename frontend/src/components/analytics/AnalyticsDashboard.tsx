import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  FileText, 
  Calendar,
  Target,
  Award,
  Activity,
  PieChart,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { analyticsService, JobAnalytics, JobPerformanceMetrics, ApplicationAnalytics } from '../../services/analyticsService';

interface AnalyticsDashboardProps {
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  className = ''
}) => {
  const [jobAnalytics, setJobAnalytics] = useState<JobAnalytics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<JobPerformanceMetrics[]>([]);
  const [applicationAnalytics, setApplicationAnalytics] = useState<ApplicationAnalytics | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [jobData, performanceData, applicationData] = await Promise.all([
        analyticsService.getJobAnalytics(timeRange),
        analyticsService.getJobPerformanceMetrics(),
        analyticsService.getApplicationAnalytics(timeRange)
      ]);
      
      setJobAnalytics(jobData);
      setPerformanceMetrics(performanceData);
      setApplicationAnalytics(applicationData);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      active: 'text-green-600 bg-green-100',
      paused: 'text-yellow-600 bg-yellow-100',
      closed: 'text-red-600 bg-red-100',
      draft: 'text-gray-600 bg-gray-100',
      expired: 'text-orange-600 bg-orange-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            Loading analytics...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600">
            <Activity className="w-5 h-5" />
            <span className="font-medium">Error loading analytics</span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
          <button 
            onClick={fetchAnalytics}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!jobAnalytics) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Insights and performance metrics for your job postings</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d' | '1y')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{jobAnalytics.totalJobs}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(jobAnalytics.totalViews)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Applications</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(jobAnalytics.totalApplications)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{jobAnalytics.conversionRate.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Job Status Distribution</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {jobAnalytics.statusDistribution.map((status) => (
            <div key={status.status} className="text-center">
              <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(status.status)}`}>
                <span className="capitalize">{status.status}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{status.count}</p>
              <p className="text-sm text-gray-600">{status.percentage}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Jobs */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Jobs</h3>
        </div>
        <div className="space-y-4">
          {jobAnalytics.topPerformingJobs.map((job, index) => (
            <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{job.title}</h4>
                  <p className="text-sm text-gray-600">Job ID: {job.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="font-medium text-gray-900">{job.views}</p>
                  <p className="text-gray-600">Views</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900">{job.applications}</p>
                  <p className="text-gray-600">Applications</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900">{job.conversionRate}%</p>
                  <p className="text-gray-600">Conversion</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trends */}
      {jobAnalytics.monthlyTrends.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Monthly Trends</h3>
          </div>
          <div className="space-y-3">
            {jobAnalytics.monthlyTrends.map((trend) => (
              <div key={trend.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{trend.month}</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{trend.jobsPosted}</p>
                    <p className="text-gray-600">Jobs Posted</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{trend.applicationsReceived}</p>
                    <p className="text-gray-600">Applications</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{trend.viewsGenerated}</p>
                    <p className="text-gray-600">Views</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
