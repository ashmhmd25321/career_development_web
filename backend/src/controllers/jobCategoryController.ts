import { Request, Response } from 'express';
import { jobCategoryService } from '@/services/jobCategoryService';
import { ApiResponse, AuthUser, CreateJobCategoryRequest, UpdateJobCategoryRequest } from '@/types';
import { logger } from '@/utils/logger';

interface AuthenticatedRequest<P = any, ResBody = any, ReqBody = any, ReqQuery = any> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: AuthUser;
}

export const jobCategoryController = {
  async getCategories(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const categories = await jobCategoryService.findAll();

      res.status(200).json({
        success: true,
        data: { categories },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Failed to fetch job categories:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch job categories', code: 'FETCH_CATEGORIES_ERROR' },
        timestamp: new Date().toISOString(),
      });
    }
  },

  async getCategoryById(req: Request<{ id: string }>, res: Response<ApiResponse>): Promise<void> {
    try {
      const categoryId = parseInt(req.params.id);
      
      if (isNaN(categoryId)) {
        res.status(400).json({
          success: false,
          error: { message: 'Invalid category ID' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const category = await jobCategoryService.findById(categoryId);
      
      if (!category) {
        res.status(404).json({
          success: false,
          error: { message: 'Job category not found' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { category },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Failed to fetch job category:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch job category', code: 'FETCH_CATEGORY_ERROR' },
        timestamp: new Date().toISOString(),
      });
    }
  },

  async createCategory(req: AuthenticatedRequest<{}, any, CreateJobCategoryRequest>, res: Response<ApiResponse>): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: { message: 'Access denied. Admin role required.' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { name, description } = req.body;

      if (!name) {
        res.status(400).json({
          success: false,
          error: { message: 'Category name is required' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const categoryData = { name, description };
      const newCategory = await jobCategoryService.createCategory(categoryData);

      res.status(201).json({
        success: true,
        message: 'Job category created successfully',
        data: { category: newCategory },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Failed to create job category:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to create job category', code: 'CREATE_CATEGORY_ERROR' },
        timestamp: new Date().toISOString(),
      });
    }
  },

  async updateCategory(req: AuthenticatedRequest<{ id: string }, any, UpdateJobCategoryRequest>, res: Response<ApiResponse>): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: { message: 'Access denied. Admin role required.' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const categoryId = parseInt(req.params.id);
      
      if (isNaN(categoryId)) {
        res.status(400).json({
          success: false,
          error: { message: 'Invalid category ID' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check if category exists
      const existingCategory = await jobCategoryService.findById(categoryId);
      if (!existingCategory) {
        res.status(404).json({
          success: false,
          error: { message: 'Job category not found' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const updatedCategory = await jobCategoryService.updateCategory(categoryId, req.body);

      res.status(200).json({
        success: true,
        message: 'Job category updated successfully',
        data: { category: updatedCategory },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Failed to update job category:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to update job category', code: 'UPDATE_CATEGORY_ERROR' },
        timestamp: new Date().toISOString(),
      });
    }
  },

  async deleteCategory(req: AuthenticatedRequest<{ id: string }>, res: Response<ApiResponse>): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: { message: 'Access denied. Admin role required.' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const categoryId = parseInt(req.params.id);
      
      if (isNaN(categoryId)) {
        res.status(400).json({
          success: false,
          error: { message: 'Invalid category ID' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Check if category exists
      const existingCategory = await jobCategoryService.findById(categoryId);
      if (!existingCategory) {
        res.status(404).json({
          success: false,
          error: { message: 'Job category not found' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const deleted = await jobCategoryService.deleteCategory(categoryId);

      if (!deleted) {
        res.status(500).json({
          success: false,
          error: { message: 'Failed to delete job category' },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Job category deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Failed to delete job category:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to delete job category', code: 'DELETE_CATEGORY_ERROR' },
        timestamp: new Date().toISOString(),
      });
    }
  },
};
