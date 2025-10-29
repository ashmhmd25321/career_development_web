import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { notificationAnalyticsService, NotificationAnalytics } from '../../services/notificationAnalyticsService';
import { Card, CardContent, Badge } from '../ui';
import { 
  TrendingUp, 
  Bell, 
  CheckCircle,
  XCircle,
  PieChart,
  BarChart3,
  Clock,
  Users
} from 'lucide-react';

export const NotificationAnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<NotificationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (user?.role === 'admin') {
        data = await notificationAnalyticsService.getOverallAnalytics();
      } else {
        data = await notificationAnalyticsService.getUserAnalytics();
      }
      
      setAnalytics(data);
    } catch (err: any) {
      console.error('Error loading analytics:', err);
      setError(err.response?.data?.error || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatMinutes = (minutes: number | null) => {
    if (minutes === null || minutes === undefined) return 'N/A';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <p className="text-gray-600">Loading analytics...</p>
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
            <button
              onClick={loadAnalytics}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notification Analytics</h1>
        <p className="text-gray-600 mt-1">
          {user?.role === 'admin' ? 'Overall platform notification analytics' : 'Your notification statistics'}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Notifications</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalNotifications || 0}</p>
              </div>
              <Bell className="w-10 h-10 text-primary-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Read Count</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.readCount || 0}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Unread Count</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.unreadCount || 0}</p>
              </div>
              <XCircle className="w-10 h-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Read Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.readRate?.toFixed(1) || 0}%
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Average Time to Read */}
      {analytics.averageTimeToRead !== null && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-primary-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Average Time to Read</h3>
                  <p className="text-sm text-gray-600">Time from notification sent to read</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-primary-600">
                {formatMinutes(analytics.averageTimeToRead)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* By Category */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Notifications by Category
            </h3>
            <div className="space-y-3">
              {analytics.notificationsByCategory && analytics.notificationsByCategory.length > 0 ? (
                analytics.notificationsByCategory.map((item: any) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-700 capitalize">{item.category}</span>
                      <Badge variant="secondary">{item.count} total</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${item.count > 0 ? (item.readCount / item.count) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.readCount} read ({item.count > 0 ? ((item.readCount / item.count) * 100).toFixed(1) : 0}%)
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No category data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* By Type */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Notifications by Type
            </h3>
            <div className="space-y-3">
              {analytics.notificationsByType && analytics.notificationsByType.length > 0 ? (
                analytics.notificationsByType.map((item: any) => {
                  const typeColors: Record<string, string> = {
                    info: 'bg-blue-100 text-blue-800',
                    success: 'bg-green-100 text-green-800',
                    warning: 'bg-yellow-100 text-yellow-800',
                    error: 'bg-red-100 text-red-800',
                  };
                  
                  return (
                    <div key={item.type}>
                      <div className="flex items-center justify-between mb-1">
                        <Badge className={typeColors[item.type] || 'bg-gray-100 text-gray-800'}>
                          {item.type}
                        </Badge>
                        <span className="text-sm text-gray-700">{item.count} total</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${item.count > 0 ? (item.readCount / item.count) * 100 : 0}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.readCount} read
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-sm">No type data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Trends */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Notification Trends (Last 30 Days)
          </h3>
          {analytics.notificationTrends && analytics.notificationTrends.length > 0 ? (
            <div className="space-y-2">
              {analytics.notificationTrends.map((trend: any, index: number) => {
                const maxSent = Math.max(...analytics.notificationTrends.map((t: any) => t.sent), 1);
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {new Date(trend.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="text-gray-700 font-medium">
                        {trend.sent} sent, {trend.read} read
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="flex h-full">
                        <div
                          className="bg-blue-600 rounded-l-full"
                          style={{ width: `${(trend.sent / maxSent) * 100}%` }}
                        />
                        <div
                          className="bg-green-600 rounded-r-full"
                          style={{ width: `${trend.sent > 0 ? (trend.read / trend.sent) * (trend.sent / maxSent) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No trends data available</p>
          )}
        </CardContent>
      </Card>

      {/* Most Engaged Users (Admin only) */}
      {user?.role === 'admin' && analytics.mostEngagedUsers && analytics.mostEngagedUsers.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Most Engaged Users (Top 10)
            </h3>
            <div className="space-y-3">
              {analytics.mostEngagedUsers.map((user: any) => (
                <div
                  key={user.user_id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{user.user_name}</h4>
                      <p className="text-sm text-gray-600">
                        {user.notification_count} notifications, {user.read_count} read
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {user.read_rate.toFixed(1)}% read rate
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${user.read_rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

