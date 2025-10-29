import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { eventService } from '../../services/eventService';
import { Card, CardContent, Badge } from '../ui';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  Star,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

export const EventAnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
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
        data = await eventService.getOverallAnalytics();
      } else if (user?.role === 'employer') {
        data = await eventService.getOrganizerAnalytics();
      } else {
        setError('You do not have permission to view analytics');
        return;
      }
      
      setAnalytics(data);
    } catch (err: any) {
      console.error('Error loading analytics:', err);
      setError(err.response?.data?.error || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Event Analytics</h1>
        <p className="text-gray-600 mt-1">
          {user?.role === 'admin' ? 'Overall platform event analytics' : 'Your event performance metrics'}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalEvents || analytics.myEvents || 0}</p>
              </div>
              <Calendar className="w-10 h-10 text-primary-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Registrations</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalRegistrations || 0}</p>
              </div>
              <Users className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.averageAttendanceRate?.toFixed(1) || 0}%
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${analytics.totalRevenue?.toFixed(2) || '0.00'}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Events by Type */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Events by Type
            </h3>
            <div className="space-y-3">
              {analytics.eventsByType && analytics.eventsByType.length > 0 ? (
                analytics.eventsByType.map((item: any) => (
                  <div key={item.type} className="flex items-center justify-between">
                    <span className="text-gray-700 capitalize">{item.type.replace('_', ' ')}</span>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No events by type data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Events by Status */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Events by Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Upcoming</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {analytics.eventsByStatus?.upcoming || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Past</span>
                <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                  {analytics.eventsByStatus?.past || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Cancelled</span>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {analytics.eventsByStatus?.cancelled || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Events */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Top Events by Registrations
          </h3>
          {analytics.topEvents && analytics.topEvents.length > 0 ? (
            <div className="space-y-4">
              {analytics.topEvents.map((event: any) => (
                <div
                  key={event.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{event.title}</h4>
                    {event.average_rating && (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="text-sm text-gray-600">{event.average_rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      <Users className="w-4 h-4 inline mr-1" />
                      {event.registrations} registrations
                    </span>
                    <span>
                      <TrendingUp className="w-4 h-4 inline mr-1" />
                      {event.attendance_rate.toFixed(1)}% attendance
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No top events data available</p>
          )}
        </CardContent>
      </Card>

      {/* Registration Trends */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Registration Trends (Last 30 Days)
          </h3>
          {analytics.registrationTrends && analytics.registrationTrends.length > 0 ? (
            <div className="space-y-2">
              {analytics.registrationTrends.map((trend: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {new Date(trend.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{
                          width: `${(trend.count / Math.max(...analytics.registrationTrends.map((t: any) => t.count))) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-12 text-right">
                      {trend.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No registration trends data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

