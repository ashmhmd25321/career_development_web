import { Response } from 'express';
import { learningService } from '@/services/learningService';
import { logger } from '@/utils/logger';
import { AuthRequest } from '@/middleware/auth';

export const learningController = {
  // Get all learning resources
  async getAllResources(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { resourceType, skillId, difficultyLevel, free } = req.query;
      
      const resources = await learningService.getAllResources({
        resourceType: resourceType as string,
        skillId: skillId ? parseInt(skillId as string) : undefined,
        difficultyLevel: difficultyLevel as string,
        free: free === 'true' ? true : free === 'false' ? false : undefined,
      });
      
      return res.json(resources);
    } catch (error) {
      logger.error('Error fetching learning resources:', error);
      return res.status(500).json({ error: 'Failed to fetch learning resources' });
    }
  },

  // Get resource by ID
  async getResourceById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const resource = await learningService.getResourceById(parseInt(id));
      
      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }
      
      return res.json(resource);
    } catch (error) {
      logger.error('Error fetching resource:', error);
      return res.status(500).json({ error: 'Failed to fetch resource' });
    }
  },

  // Get user progress for a resource
  async getUserProgress(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { resourceId } = req.params;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const progress = await learningService.getUserProgress(parseInt(resourceId), userId);
      
      if (!progress) {
        return res.json({ status: 'Not Started', progressPercentage: 0 });
      }
      
      return res.json(progress);
    } catch (error) {
      logger.error('Error fetching progress:', error);
      return res.status(500).json({ error: 'Failed to fetch progress' });
    }
  },

  // Update learning progress
  async updateProgress(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { resourceId } = req.params;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const progress = await learningService.updateProgress(userId, parseInt(resourceId), req.body);
      return res.json(progress);
    } catch (error) {
      logger.error('Error updating progress:', error);
      return res.status(500).json({ error: 'Failed to update progress' });
    }
  },

  // Get all certifications
  async getAllCertifications(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { skillId, difficultyLevel } = req.query;
      
      const certifications = await learningService.getAllCertifications({
        skillId: skillId ? parseInt(skillId as string) : undefined,
        difficultyLevel: difficultyLevel as string,
      });
      
      return res.json(certifications);
    } catch (error) {
      logger.error('Error fetching certifications:', error);
      return res.status(500).json({ error: 'Failed to fetch certifications' });
    }
  },

  // Get user certifications
  async getUserCertifications(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const certifications = await learningService.getUserCertifications(userId);
      return res.json(certifications);
    } catch (error) {
      logger.error('Error fetching user certifications:', error);
      return res.status(500).json({ error: 'Failed to fetch certifications' });
    }
  },

  // Add user certification
  async addUserCertification(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const certification = await learningService.addUserCertification(userId, req.body);
      return res.status(201).json(certification);
    } catch (error) {
      logger.error('Error adding certification:', error);
      return res.status(500).json({ error: 'Failed to add certification' });
    }
  },

  // Get all learning paths
  async getAllPaths(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { category, targetRole, difficulty } = req.query;
      
      const paths = await learningService.getAllPaths({
        category: category as string,
        targetRole: targetRole as string,
        difficulty: difficulty as string,
      });
      
      return res.json(paths);
    } catch (error) {
      logger.error('Error fetching learning paths:', error);
      return res.status(500).json({ error: 'Failed to fetch learning paths' });
    }
  },

  // Get path by ID
  async getPathById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const path = await learningService.getPathById(parseInt(id));
      
      if (!path) {
        return res.status(404).json({ error: 'Learning path not found' });
      }
      
      return res.json(path);
    } catch (error) {
      logger.error('Error fetching learning path:', error);
      return res.status(500).json({ error: 'Failed to fetch learning path' });
    }
  },

  // Get learning statistics
  async getLearningStats(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const stats = await learningService.getLearningStats(userId);
      return res.json(stats);
    } catch (error) {
      logger.error('Error fetching learning stats:', error);
      return res.status(500).json({ error: 'Failed to fetch learning statistics' });
    }
  },
};

