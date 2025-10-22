import { Request, Response } from 'express';
import { RecommendationService } from '@/services/recommendationService';
import { AuthenticatedRequest } from '@/types';
import { logger } from '@/utils/logger';

export class RecommendationController {
  /**
   * Get personalized job recommendations for the authenticated user
   */
  static async getUserRecommendations(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' }
        });
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const recommendations = await RecommendationService.getUserRecommendations(userId, limit);

      return res.json({
        success: true,
        data: {
          recommendations,
          count: recommendations.length
        }
      });
    } catch (error) {
      logger.error('Error in getUserRecommendations:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to get job recommendations' }
      });
    }
  }

  /**
   * Get featured jobs for users without preferences
   */
  static async getFeaturedJobs(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const featuredJobs = await RecommendationService.getFeaturedJobs(limit);

      return res.json({
        success: true,
        data: {
          jobs: featuredJobs,
          count: featuredJobs.length
        }
      });
    } catch (error) {
      logger.error('Error in getFeaturedJobs:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to get featured jobs' }
      });
    }
  }

  /**
   * Get trending jobs based on application count and activity
   */
  static async getTrendingJobs(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const trendingJobs = await RecommendationService.getTrendingJobs(limit);

      return res.json({
        success: true,
        data: {
          jobs: trendingJobs,
          count: trendingJobs.length
        }
      });
    } catch (error) {
      logger.error('Error in getTrendingJobs:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to get trending jobs' }
      });
    }
  }

  /**
   * Get similar jobs based on a specific job
   */
  static async getSimilarJobs(req: Request, res: Response) {
    try {
      const jobId = parseInt(req.params.jobId);
      if (!jobId || isNaN(jobId)) {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid job ID' }
        });
      }

      const limit = parseInt(req.query.limit as string) || 5;
      const similarJobs = await RecommendationService.getSimilarJobs(jobId, limit);

      return res.json({
        success: true,
        data: {
          jobs: similarJobs,
          count: similarJobs.length
        }
      });
    } catch (error) {
      logger.error('Error in getSimilarJobs:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to get similar jobs' }
      });
    }
  }
}
