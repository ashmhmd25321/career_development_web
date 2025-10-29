import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Button } from '../ui';
import { notificationPreferencesService, NotificationPreferences } from '../../services/notificationPreferencesService';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, Mail, Smartphone, Monitor, Settings, Save, Calendar, TrendingUp, FileText } from 'lucide-react';

export const NotificationPreferencesPage: React.FC = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationPreferencesService.getPreferences();
      setPreferences(data);
    } catch (err: any) {
      console.error('Error loading preferences:', err);
      setError(err.response?.data?.error || 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (field: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [field]: value });
  };

  const handleSave = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      const { id, user_id, created_at, updated_at, ...updateData } = preferences;
      await notificationPreferencesService.updatePreferences(updateData);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving preferences:', err);
      setError(err.response?.data?.error || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <p className="text-gray-600">Loading preferences...</p>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="container-custom py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-800">{error || 'Failed to load preferences'}</p>
            <Button variant="primary" onClick={loadPreferences} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Notification Preferences</h1>
        </div>
        <p className="text-gray-600">Manage how and when you receive notifications</p>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="p-4">
            <p className="text-green-800 text-sm">Preferences saved successfully!</p>
          </CardContent>
        </Card>
      )}

      {/* Delivery Methods */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Delivery Methods
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.email_enabled}
                  onChange={(e) => handleUpdate('email_enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-600">Receive push notifications (coming soon)</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.push_enabled}
                  onChange={(e) => handleUpdate('push_enabled', e.target.checked)}
                  className="sr-only peer"
                  disabled
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 opacity-50"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">In-App Notifications</p>
                  <p className="text-sm text-gray-600">Show notifications in the app</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.in_app_enabled}
                  onChange={(e) => handleUpdate('in_app_enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Preferences */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Categories</h2>
          <div className="space-y-3">
            {[
              { key: 'job_notifications', label: 'Job Notifications', desc: 'Updates about job postings and opportunities' },
              { key: 'application_notifications', label: 'Application Updates', desc: 'Status changes for your job applications' },
              { key: 'event_notifications', label: 'Event Notifications', desc: 'Information about upcoming events' },
              { key: 'system_notifications', label: 'System Notifications', desc: 'Important platform updates and announcements' },
              { key: 'message_notifications', label: 'Messages', desc: 'Direct messages from employers or other users' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences[item.key as keyof NotificationPreferences] as boolean}
                    onChange={(e) => handleUpdate(item.key as keyof NotificationPreferences, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Type Preferences */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Types</h2>
          <div className="space-y-3">
            {[
              { key: 'info_notifications', label: 'Info Notifications', desc: 'General information updates', color: 'blue' },
              { key: 'success_notifications', label: 'Success Notifications', desc: 'Positive updates and confirmations', color: 'green' },
              { key: 'warning_notifications', label: 'Warning Notifications', desc: 'Important warnings and alerts', color: 'yellow' },
              { key: 'error_notifications', label: 'Error Notifications', desc: 'Error messages and failures', color: 'red' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences[item.key as keyof NotificationPreferences] as boolean}
                    onChange={(e) => handleUpdate(item.key as keyof NotificationPreferences, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-3">
          <Link to="/settings/notifications/scheduled">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Scheduled Notifications
            </Button>
          </Link>
          <Link to="/settings/notifications/analytics">
            <Button variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              Notification Analytics
            </Button>
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin/notifications/templates">
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Notification Templates
              </Button>
            </Link>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={loadPreferences}>
            Reset
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </div>
  );
};

