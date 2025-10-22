import { Request, Response } from 'express';
import { bookmarkService } from '../services/bookmarkService';
import { AuthenticatedRequest } from '../types';

export const bookmarkController = {
  // Get all bookmarks for a specific user (student view)
  async getUserBookmarks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' }
        });
        return;
      }

      const bookmarks = await bookmarkService.findByUserId(userId);

      res.json({
        success: true,
        data: bookmarks,
        message: 'User bookmarks retrieved successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to retrieve user bookmarks'
        }
      });
    }
  },

  // Create a new bookmark
  async createBookmark(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' }
        });
        return;
      }

      const bookmarkData = {
        ...req.body,
        userId
      };

      const bookmark = await bookmarkService.createBookmark(bookmarkData);

      res.status(201).json({
        success: true,
        data: bookmark,
        message: 'Job bookmarked successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to bookmark job'
        }
      });
    }
  },

  // Delete bookmark by ID
  async deleteBookmark(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { bookmarkId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' }
        });
        return;
      }

      await bookmarkService.deleteBookmark(parseInt(bookmarkId), userId);

      res.json({
        success: true,
        message: 'Bookmark removed successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to remove bookmark'
        }
      });
    }
  },

  // Delete bookmark by job ID
  async deleteBookmarkByJobId(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' }
        });
        return;
      }

      await bookmarkService.deleteBookmarkByJobId(parseInt(jobId), userId);

      res.json({
        success: true,
        message: 'Bookmark removed successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to remove bookmark'
        }
      });
    }
  },

  // Check if job is bookmarked
  async isBookmarked(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' }
        });
        return;
      }

      const isBookmarked = await bookmarkService.isBookmarked(parseInt(jobId), userId);

      res.json({
        success: true,
        data: { isBookmarked },
        message: 'Bookmark status retrieved successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to check bookmark status'
        }
      });
    }
  },

  // Get bookmark count for a job
  async getBookmarkCount(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      const count = await bookmarkService.getBookmarkCount(parseInt(jobId));

      res.json({
        success: true,
        data: { count },
        message: 'Bookmark count retrieved successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to get bookmark count'
        }
      });
    }
  }
};
