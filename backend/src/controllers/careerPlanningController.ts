import { Response } from 'express';
import { careerPlanningService } from '@/services/careerPlanningService';
import { logger } from '@/utils/logger';
import { AuthRequest } from '@/middleware/auth';

export const careerPlanningController = {
  // Get all goals for user
  async getUserGoals(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const goals = await careerPlanningService.getUserGoals(userId);
      return res.json(goals);
    } catch (error) {
      logger.error('Error fetching user goals:', error);
      return res.status(500).json({ error: 'Failed to fetch goals' });
    }
  },

  // Get goal by ID
  async getGoalById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { goalId } = req.params;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const goal = await careerPlanningService.getGoalById(parseInt(goalId), userId);
      
      if (!goal) {
        return res.status(404).json({ error: 'Goal not found' });
      }

      return res.json(goal);
    } catch (error) {
      logger.error('Error fetching goal:', error);
      return res.status(500).json({ error: 'Failed to fetch goal' });
    }
  },

  // Create a new goal
  async createGoal(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const goal = await careerPlanningService.createGoal(userId, req.body);
      return res.status(201).json(goal);
    } catch (error) {
      logger.error('Error creating goal:', error);
      return res.status(500).json({ error: 'Failed to create goal' });
    }
  },

  // Update a goal
  async updateGoal(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { goalId } = req.params;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const goal = await careerPlanningService.updateGoal(parseInt(goalId), userId, req.body);
      return res.json(goal);
    } catch (error) {
      logger.error('Error updating goal:', error);
      return res.status(500).json({ error: 'Failed to update goal' });
    }
  },

  // Update goal progress
  async updateGoalProgress(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { goalId } = req.params;
      const { progressPercentage } = req.body;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (typeof progressPercentage !== 'number' || progressPercentage < 0 || progressPercentage > 100) {
        return res.status(400).json({ error: 'Invalid progress percentage' });
      }

      const goal = await careerPlanningService.updateGoalProgress(parseInt(goalId), userId, progressPercentage);
      return res.json(goal);
    } catch (error) {
      logger.error('Error updating goal progress:', error);
      return res.status(500).json({ error: 'Failed to update goal progress' });
    }
  },

  // Delete a goal
  async deleteGoal(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { goalId } = req.params;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await careerPlanningService.deleteGoal(parseInt(goalId), userId);
      return res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
      logger.error('Error deleting goal:', error);
      return res.status(500).json({ error: 'Failed to delete goal' });
    }
  },

  // Get goal milestones
  async getGoalMilestones(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { goalId } = req.params;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const milestones = await careerPlanningService.getGoalMilestones(parseInt(goalId), userId);
      return res.json(milestones);
    } catch (error) {
      logger.error('Error fetching milestones:', error);
      return res.status(500).json({ error: 'Failed to fetch milestones' });
    }
  },

  // Create a milestone
  async createMilestone(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const milestone = await careerPlanningService.createMilestone(userId, req.body);
      return res.status(201).json(milestone);
    } catch (error) {
      logger.error('Error creating milestone:', error);
      return res.status(500).json({ error: 'Failed to create milestone' });
    }
  },

  // Update a milestone
  async updateMilestone(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { milestoneId } = req.params;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const milestone = await careerPlanningService.updateMilestone(parseInt(milestoneId), userId, req.body);
      return res.json(milestone);
    } catch (error) {
      logger.error('Error updating milestone:', error);
      return res.status(500).json({ error: 'Failed to update milestone' });
    }
  },

  // Delete a milestone
  async deleteMilestone(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { milestoneId } = req.params;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await careerPlanningService.deleteMilestone(parseInt(milestoneId), userId);
      return res.json({ message: 'Milestone deleted successfully' });
    } catch (error) {
      logger.error('Error deleting milestone:', error);
      return res.status(500).json({ error: 'Failed to delete milestone' });
    }
  },

  // Get career statistics
  async getCareerStats(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const stats = await careerPlanningService.getCareerStats(userId);
      return res.json(stats);
    } catch (error) {
      logger.error('Error fetching career stats:', error);
      return res.status(500).json({ error: 'Failed to fetch career stats' });
    }
  },
};

