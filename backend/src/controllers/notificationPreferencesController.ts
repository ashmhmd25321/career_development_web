import { Response } from 'express';
import { notificationPreferencesService } from '../services/notificationPreferencesService';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export const notificationPreferencesController = {
  // Get user preferences
  getPreferences: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const preferences = await notificationPreferencesService.getUserPreferences(userId);
      return res.json(preferences);
    } catch (error) {
      logger.error('Error getting preferences:', error);
      return res.status(500).json({ error: 'Failed to get preferences' });
    }
  },

  // Update preferences
  updatePreferences: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const preferences = await notificationPreferencesService.updatePreferences(userId, req.body);
      return res.json(preferences);
    } catch (error) {
      logger.error('Error updating preferences:', error);
      return res.status(500).json({ error: 'Failed to update preferences' });
    }
  }
};

