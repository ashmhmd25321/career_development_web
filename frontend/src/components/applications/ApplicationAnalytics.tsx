import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../ui';
import { applicationService } from '../../services/applicationService';
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Users
} from 'lucide-react';

interface ApplicationStats {
  total: number;
  pending: number;
  reviewed: number;
  shortlisted: number;
  interview: number;
  accepted: number;
  rejected: number;
}

interface ApplicationAnalyticsProps {
  jobId?: number;
}

export const ApplicationAnalytics: React.FC<ApplicationAnalyticsProps> = ({ jobId }) => {
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    pending: 0,
    reviewed: 0,
    shortlisted: 0,
    interview: 0,
    accepted: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // TODO: Implement analytics API endpoint
        // const data = await applicationService.getAnalytics(jobId);
        // setStats(data);
        
        // For now, use mock data
        setStats({
          total: 45,
          pending: 12,
          reviewed: 8,
          shortlisted: 5,
          interview: 15,
          accepted: 3,
          rejected: 2
        });
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [jobId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const calculatePercentage = (count: number) => {
    return stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : '0';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      total: 'bg-blue-100 text-blue-700',
      pending: 'bg-yellow-100 text-yellow-700',
      reviewed: 'bg-blue-100 text-blue-700',
      shortlisted: 'bg-purple-100 text-purple-700',
      interview: 'bg-indigo-100 text-indigo-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      total: Users,
      pending: Clock,
      reviewed: FileText,
      shortlisted: Users,
      interview: Calendar,
      accepted: CheckCircle,
      rejected: XCircle
    };
    return icons[status as keyof typeof icons] || FileText;
  };

  const statCards = [
    { label: 'Total Applications', key: 'total', icon: Users },
    { label: 'Pending', key: 'pending', icon: Clock },
    { label: 'Under Review', key: 'reviewed', icon: FileText },
    { label: 'Shortlisted', key: 'shortlisted', icon: Users }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, key, icon: Icon }) => {
          const count = stats[key as keyof ApplicationStats];
          const percentage = calculatePercentage(count);
          
          return (
            <Card key={key} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${getStatusColor(key)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">{label}</span>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-gray-900">{count}</span>
                  <span className="text-xs text-gray-500">{percentage}%</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Application Status</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats).map(([key, value]) => {
                if (key === 'total') return null;
                
                const Icon = getStatusIcon(key);
                const percentage = calculatePercentage(value);
                
                return (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getStatusColor(key)}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">{key}</p>
                        <p className="text-xs text-gray-500">{percentage}% of total</p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{value}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Conversion Rate</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Application to Shortlist</span>
                <span className="text-lg font-semibold text-purple-600">
                  {stats.total > 0 ? ((stats.shortlisted / stats.total) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Shortlist to Interview</span>
                <span className="text-lg font-semibold text-indigo-600">
                  {stats.shortlisted > 0 ? ((stats.interview / stats.shortlisted) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Interview to Offer</span>
                <span className="text-lg font-semibold text-green-600">
                  {stats.interview > 0 ? ((stats.accepted / stats.interview) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Overall Success Rate</span>
                <span className="text-lg font-semibold text-primary-600">
                  {stats.total > 0 ? ((stats.accepted / stats.total) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
