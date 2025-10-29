import { Response } from 'express';
import { notificationService } from '../services/notificationService';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export const notificationController = {
  // Get user notifications
  getNotifications: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const notifications = await notificationService.getNotifications(userId);
      return res.json(notifications);
    } catch (error) {
      logger.error('Error getting notifications:', error);
      return res.status(500).json({ error: 'Failed to get notifications' });
    }
  },

  // Get unread count
  getUnreadCount: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const count = await notificationService.getUnreadCount(userId);
      return res.json({ count });
    } catch (error) {
      logger.error('Error getting unread count:', error);
      return res.status(500).json({ error: 'Failed to get unread count' });
    }
  },

  // Mark notification as read
  markAsRead: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      await notificationService.markAsRead(parseInt(id), userId);
      return res.json({ message: 'Notification marked as read' });
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      return res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      await notificationService.markAllAsRead(userId);
      return res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      logger.error('Error marking all as read:', error);
      return res.status(500).json({ error: 'Failed to mark all as read' });
    }
  },

  // Delete notification
  deleteNotification: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      await notificationService.deleteNotification(parseInt(id), userId);
      return res.json({ message: 'Notification deleted' });
    } catch (error) {
      logger.error('Error deleting notification:', error);
      return res.status(500).json({ error: 'Failed to delete notification' });
    }
  },

  // Delete all notifications
  deleteAllNotifications: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      await notificationService.deleteAllNotifications(userId);
      return res.json({ message: 'All notifications deleted' });
    } catch (error) {
      logger.error('Error deleting all notifications:', error);
      return res.status(500).json({ error: 'Failed to delete all notifications' });
    }
  }
};

