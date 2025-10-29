import { Response } from 'express';
import { notificationSchedulerService } from '../services/notificationSchedulerService';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export const notificationSchedulerController = {
  // Schedule a notification
  scheduleNotification: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Can schedule for self or as admin for others
      const targetUserId = req.body.user_id || userId;
      if (targetUserId !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'You can only schedule notifications for yourself' });
      }
      
      const scheduled = await notificationSchedulerService.scheduleNotification({
        user_id: targetUserId,
        title: req.body.title,
        message: req.body.message,
        type: req.body.type,
        category: req.body.category,
        scheduled_at: new Date(req.body.scheduled_at),
        related_id: req.body.related_id
      });
      
      return res.status(201).json(scheduled);
    } catch (error: any) {
      logger.error('Error scheduling notification:', error);
      return res.status(500).json({ error: error.message || 'Failed to schedule notification' });
    }
  },

  // Get user's scheduled notifications
  getUserScheduledNotifications: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const scheduled = await notificationSchedulerService.getUserScheduledNotifications(userId);
      return res.json(scheduled);
    } catch (error) {
      logger.error('Error getting scheduled notifications:', error);
      return res.status(500).json({ error: 'Failed to get scheduled notifications' });
    }
  },

  // Update scheduled notification
  updateScheduledNotification: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const updates: any = {};
      if (req.body.title) updates.title = req.body.title;
      if (req.body.message) updates.message = req.body.message;
      if (req.body.type) updates.type = req.body.type;
      if (req.body.category) updates.category = req.body.category;
      if (req.body.scheduled_at) updates.scheduled_at = new Date(req.body.scheduled_at);
      if (req.body.related_id !== undefined) updates.related_id = req.body.related_id;
      
      const updated = await notificationSchedulerService.updateScheduledNotification(
        parseInt(id),
        userId,
        updates
      );
      
      return res.json(updated);
    } catch (error: any) {
      logger.error('Error updating scheduled notification:', error);
      return res.status(500).json({ error: error.message || 'Failed to update scheduled notification' });
    }
  },

  // Delete scheduled notification
  deleteScheduledNotification: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Admins can delete any, others can only delete their own
      const targetUserId = req.user?.role === 'admin' ? undefined : userId;
      
      await notificationSchedulerService.deleteScheduledNotification(parseInt(id), targetUserId);
      
      return res.json({ message: 'Scheduled notification deleted successfully' });
    } catch (error: any) {
      logger.error('Error deleting scheduled notification:', error);
      return res.status(500).json({ error: error.message || 'Failed to delete scheduled notification' });
    }
  },

  // Process scheduled notifications (admin only, or called by cron)
  processScheduledNotifications: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Only admins can manually trigger processing
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can process scheduled notifications' });
      }
      
      const sentCount = await notificationSchedulerService.processScheduledNotifications();
      
      return res.json({ 
        message: `Processed ${sentCount} scheduled notifications`,
        sent_count: sentCount
      });
    } catch (error) {
      logger.error('Error processing scheduled notifications:', error);
      return res.status(500).json({ error: 'Failed to process scheduled notifications' });
    }
  }
};

