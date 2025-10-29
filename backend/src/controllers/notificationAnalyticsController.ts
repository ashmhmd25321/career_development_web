import { Response } from 'express';
import { notificationAnalyticsService } from '../services/notificationAnalyticsService';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export const notificationAnalyticsController = {
  // Get overall analytics (admin only)
  getOverallAnalytics: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can view overall notification analytics' });
      }
      
      const analytics = await notificationAnalyticsService.getOverallAnalytics();
      return res.json(analytics);
    } catch (error) {
      logger.error('Error getting overall notification analytics:', error);
      return res.status(500).json({ error: 'Failed to get analytics' });
    }
  },

  // Get user analytics
  getUserAnalytics: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const analytics = await notificationAnalyticsService.getUserAnalytics(userId);
      return res.json(analytics);
    } catch (error) {
      logger.error('Error getting user notification analytics:', error);
      return res.status(500).json({ error: 'Failed to get analytics' });
    }
  }
};

