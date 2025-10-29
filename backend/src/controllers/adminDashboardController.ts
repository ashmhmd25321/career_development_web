import { Response } from 'express';
import { adminDashboardService } from '../services/adminDashboardService';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export const adminDashboardController = {
  getDashboardMetrics: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ 
          success: false,
          error: { message: 'Only administrators can access dashboard metrics' },
          timestamp: new Date().toISOString()
        });
      }

      const timeRange = (req.query.timeRange as '7d' | '30d' | '90d' | '1y') || '30d';
      const metrics = await adminDashboardService.getDashboardMetrics(timeRange);

      return res.json({
        success: true,
        data: { metrics },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error fetching admin dashboard metrics:', error);
      return res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to fetch dashboard metrics' },
        timestamp: new Date().toISOString()
      });
    }
  }
};

