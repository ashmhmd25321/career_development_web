import { Request, Response } from 'express';
import { analyticsService } from '@/services/analyticsService';
import { ApiResponse, AuthUser } from '@/types';
import { logger } from '@/utils/logger';

interface AuthenticatedRequest<P = any, ResBody = any, ReqBody = any, ReqQuery = any> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: AuthUser;
}

export const analyticsController = {
  async getJobAnalytics(req: AuthenticatedRequest<{}, any, any, { timeRange?: '7d' | '30d' | '90d' | '1y' }>, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user?.id;
      const { timeRange = '30d' } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Authentication required' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Only employers and admins can access analytics
      if (req.user?.role !== 'employer' && req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: { message: 'Access denied. Only employers and admins can view analytics' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const analytics = await analyticsService.getJobAnalytics(userId, timeRange);

      res.status(200).json({
        success: true,
        data: { analytics },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Failed to fetch job analytics:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch job analytics', code: 'FETCH_ANALYTICS_ERROR' },
        timestamp: new Date().toISOString(),
      });
    }
  },

  async getJobPerformanceMetrics(req: AuthenticatedRequest<{}, any, any, { jobId?: string }>, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user?.id;
      const { jobId } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Authentication required' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Only employers and admins can access performance metrics
      if (req.user?.role !== 'employer' && req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: { message: 'Access denied. Only employers and admins can view performance metrics' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const jobIdNumber = jobId ? parseInt(jobId) : undefined;
      const metrics = await analyticsService.getJobPerformanceMetrics(userId, jobIdNumber);

      res.status(200).json({
        success: true,
        data: { metrics },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Failed to fetch job performance metrics:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch job performance metrics', code: 'FETCH_PERFORMANCE_METRICS_ERROR' },
        timestamp: new Date().toISOString(),
      });
    }
  },

  async getApplicationAnalytics(req: AuthenticatedRequest<{}, any, any, { timeRange?: '7d' | '30d' | '90d' | '1y' }>, res: Response<ApiResponse>): Promise<void> {
    try {
      const userId = req.user?.id;
      const { timeRange = '30d' } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Authentication required' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Only employers and admins can access application analytics
      if (req.user?.role !== 'employer' && req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: { message: 'Access denied. Only employers and admins can view application analytics' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const analytics = await analyticsService.getApplicationAnalytics(userId, timeRange);

      res.status(200).json({
        success: true,
        data: { analytics },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Failed to fetch application analytics:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch application analytics', code: 'FETCH_APPLICATION_ANALYTICS_ERROR' },
        timestamp: new Date().toISOString(),
      });
    }
  }
};
