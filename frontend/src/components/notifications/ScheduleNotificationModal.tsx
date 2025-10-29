import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '../ui';
import { notificationSchedulerService, CreateScheduledNotificationData } from '../../services/notificationSchedulerService';
import { Calendar, X, Clock } from 'lucide-react';

interface ScheduleNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId?: number; // For admins to schedule for other users
  onSuccess: () => void;
}

const ScheduleNotificationModal: React.FC<ScheduleNotificationModalProps> = ({
  isOpen,
  onClose,
  targetUserId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CreateScheduledNotificationData>({
    title: '',
    message: '',
    type: 'info',
    category: 'system',
    scheduled_at: '',
    related_id: undefined,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Set default scheduled_at to 1 hour from now
      const oneHourLater = new Date();
      oneHourLater.setHours(oneHourLater.getHours() + 1);
      const formatted = oneHourLater.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
      
      setFormData({
        title: '',
        message: '',
        type: 'info',
        category: 'system',
        scheduled_at: formatted,
        related_id: undefined,
      });
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.message.trim()) {
      setError('Message is required');
      return;
    }

    if (!formData.scheduled_at) {
      setError('Scheduled time is required');
      return;
    }

    const scheduledTime = new Date(formData.scheduled_at);
    if (scheduledTime <= new Date()) {
      setError('Scheduled time must be in the future');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const dataToSend: CreateScheduledNotificationData = {
        ...formData,
        scheduled_at: scheduledTime.toISOString(),
      };
      
      if (targetUserId) {
        dataToSend.user_id = targetUserId;
      }

      await notificationSchedulerService.scheduleNotification(dataToSend);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error scheduling notification:', err);
      setError(err.response?.data?.error || 'Failed to schedule notification');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-primary-600" />
            <h3 className="text-2xl font-bold text-gray-900">Schedule Notification</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <Input
              type="text"
              placeholder="Enter notification title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={4}
              placeholder="Enter notification message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>

          {/* Type and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              >
                <option value="system">System</option>
                <option value="job">Job</option>
                <option value="application">Application</option>
                <option value="event">Event</option>
                <option value="message">Message</option>
              </select>
            </div>
          </div>

          {/* Scheduled Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Scheduled Date & Time *
            </label>
            <input
              type="datetime-local"
              value={formData.scheduled_at}
              onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Select a future date and time for the notification
            </p>
          </div>

          {/* Related ID (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Related ID (Optional)
            </label>
            <input
              type="number"
              placeholder="e.g., Job ID, Application ID, etc."
              value={formData.related_id || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                related_id: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Link this notification to a specific job, application, etc.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={submitting || !formData.title.trim() || !formData.message.trim() || !formData.scheduled_at}
            >
              {submitting ? 'Scheduling...' : 'Schedule Notification'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ScheduleNotificationModal;

