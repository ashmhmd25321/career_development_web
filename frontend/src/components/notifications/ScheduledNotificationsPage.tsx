import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Badge, Modal } from '../ui';
import { notificationSchedulerService, ScheduledNotification } from '../../services/notificationSchedulerService';
import ScheduleNotificationModal from './ScheduleNotificationModal';
import { Calendar, Clock, Plus, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const ScheduledNotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState<ScheduledNotification | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadScheduledNotifications();
  }, []);

  const loadScheduledNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationSchedulerService.getUserScheduledNotifications();
      setScheduledNotifications(data);
    } catch (err: any) {
      console.error('Error loading scheduled notifications:', err);
      setError(err.response?.data?.error || 'Failed to load scheduled notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this scheduled notification?')) {
      return;
    }

    try {
      setDeletingId(id);
      await notificationSchedulerService.deleteScheduledNotification(id);
      await loadScheduledNotifications();
    } catch (err: any) {
      console.error('Error deleting scheduled notification:', err);
      alert(err.response?.data?.error || 'Failed to delete scheduled notification');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isPast = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      info: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      job: 'bg-purple-100 text-purple-800',
      application: 'bg-indigo-100 text-indigo-800',
      event: 'bg-pink-100 text-pink-800',
      system: 'bg-gray-100 text-gray-800',
      message: 'bg-cyan-100 text-cyan-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <p className="text-gray-600">Loading scheduled notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-primary-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Scheduled Notifications</h1>
            <p className="text-gray-600 mt-1">Manage your scheduled notifications</p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowScheduleModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Schedule New
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {scheduledNotifications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Scheduled Notifications</h3>
            <p className="text-gray-600 mb-6">
              Schedule notifications to be sent at a specific date and time
            </p>
            <Button
              variant="primary"
              onClick={() => setShowScheduleModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Schedule Your First Notification
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {scheduledNotifications.map((notification) => {
            const isPastDate = isPast(notification.scheduled_at);
            
            return (
              <Card key={notification.id} className={notification.is_sent ? 'opacity-60' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                        <Badge className={getTypeColor(notification.type)}>
                          {notification.type}
                        </Badge>
                        <Badge className={getCategoryColor(notification.category)}>
                          {notification.category}
                        </Badge>
                        {notification.is_sent ? (
                          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Sent
                          </Badge>
                        ) : isPastDate ? (
                          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Overdue
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Scheduled
                          </Badge>
                        )}
                      </div>

                      <p className="text-gray-600 mb-4">{notification.message}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            Scheduled: <strong>{formatDate(notification.scheduled_at)}</strong>
                          </span>
                        </div>
                        {notification.sent_at && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>
                              Sent: <strong>{formatDate(notification.sent_at)}</strong>
                            </span>
                          </div>
                        )}
                        {notification.related_id && (
                          <div className="text-gray-500">
                            Related ID: {notification.related_id}
                          </div>
                        )}
                      </div>
                    </div>

                    {!notification.is_sent && (
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleDelete(notification.id)}
                          disabled={deletingId === notification.id}
                          className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <ScheduleNotificationModal
          isOpen={showScheduleModal}
          onClose={() => {
            setShowScheduleModal(false);
            setEditingNotification(null);
          }}
          onSuccess={() => {
            loadScheduledNotifications();
            setShowScheduleModal(false);
            setEditingNotification(null);
          }}
        />
      )}
    </div>
  );
};

