import { Response } from 'express';
import { eventAnalyticsService } from '../services/eventAnalyticsService';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export const eventAnalyticsController = {
  // Get overall analytics (admin only)
  getOverallAnalytics: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can view overall analytics' });
      }
      
      const analytics = await eventAnalyticsService.getOverallAnalytics();
      return res.json(analytics);
    } catch (error) {
      logger.error('Error getting overall analytics:', error);
      return res.status(500).json({ error: 'Failed to get analytics' });
    }
  },

  // Get organizer analytics
  getOrganizerAnalytics: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Only employers and admins can view organizer analytics
      if (req.user?.role !== 'employer' && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Only organizers can view their analytics' });
      }
      
      const analytics = await eventAnalyticsService.getOrganizerAnalytics(userId);
      return res.json(analytics);
    } catch (error) {
      logger.error('Error getting organizer analytics:', error);
      return res.status(500).json({ error: 'Failed to get analytics' });
    }
  }
};

