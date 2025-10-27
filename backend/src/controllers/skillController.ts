import { Request, Response } from 'express';
import { skillService } from '@/services/skillService';
import { logger } from '@/utils/logger';

export const skillController = {
  // Get all skills
  async getAllSkills(req: Request, res: Response): Promise<Response> {
    try {
      const { category, difficultyLevel } = req.query;
      const filters: any = {};
      
      if (category) filters.category = category as string;
      if (difficultyLevel) filters.difficultyLevel = difficultyLevel as string;
      
      const skills = await skillService.findAll(filters);
      return res.json(skills);
    } catch (error) {
      logger.error('Error fetching skills:', error);
      return res.status(500).json({ error: 'Failed to fetch skills' });
    }
  },

  // Get skill by ID
  async getSkillById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const skill = await skillService.findById(parseInt(id));

      if (!skill) {
        return res.status(404).json({ error: 'Skill not found' });
      }

      return res.json(skill);
    } catch (error) {
      logger.error('Error fetching skill:', error);
      return res.status(500).json({ error: 'Failed to fetch skill' });
    }
  },

  // Create a new skill (Admin only)
  async createSkill(req: Request, res: Response): Promise<Response> {
    try {
      const skill = await skillService.createSkill(req.body);
      return res.status(201).json(skill);
    } catch (error) {
      logger.error('Error creating skill:', error);
      return res.status(500).json({ error: 'Failed to create skill' });
    }
  },

  // Get user's skills
  async getUserSkills(req: Request, res: Response): Promise<Response> {
    try {
      const userId = parseInt(req.user?.id as string);
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const skills = await skillService.getUserSkills(userId);
      return res.json(skills);
    } catch (error) {
      logger.error('Error fetching user skills:', error);
      return res.status(500).json({ error: 'Failed to fetch user skills' });
    }
  },

  // Add a skill to user's profile
  async addUserSkill(req: Request, res: Response): Promise<Response> {
    try {
      const userId = parseInt(req.user?.id as string);
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const userSkill = await skillService.addUserSkill(userId, req.body);
      return res.status(201).json(userSkill);
    } catch (error) {
      logger.error('Error adding user skill:', error);
      return res.status(500).json({ error: 'Failed to add skill' });
    }
  },

  // Update user's skill
  async updateUserSkill(req: Request, res: Response): Promise<Response> {
    try {
      const userId = parseInt(req.user?.id as string);
      const { skillId } = req.params;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const userSkill = await skillService.updateUserSkill(userId, parseInt(skillId), req.body);
      return res.json(userSkill);
    } catch (error) {
      logger.error('Error updating user skill:', error);
      return res.status(500).json({ error: 'Failed to update skill' });
    }
  },

  // Assess skill (mark as self-assessed)
  async assessSkill(req: Request, res: Response): Promise<Response> {
    try {
      const userId = parseInt(req.user?.id as string);
      const { skillId } = req.params;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const userSkill = await skillService.assessSkill(userId, parseInt(skillId));
      return res.json(userSkill);
    } catch (error) {
      logger.error('Error assessing skill:', error);
      return res.status(500).json({ error: 'Failed to assess skill' });
    }
  },

  // Remove user's skill
  async removeUserSkill(req: Request, res: Response): Promise<Response> {
    try {
      const userId = parseInt(req.user?.id as string);
      const { skillId } = req.params;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await skillService.removeUserSkill(userId, parseInt(skillId));
      return res.json({ message: 'Skill removed successfully' });
    } catch (error) {
      logger.error('Error removing user skill:', error);
      return res.status(500).json({ error: 'Failed to remove skill' });
    }
  },

  // Get skill categories
  async getCategories(req: Request, res: Response): Promise<Response> {
    try {
      const categories = await skillService.getCategories();
      return res.json(categories);
    } catch (error) {
      logger.error('Error fetching skill categories:', error);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }
  },

  // Get skills by category
  async getSkillsByCategory(req: Request, res: Response): Promise<Response> {
    try {
      const { category } = req.params;
      const skills = await skillService.findByCategory(category);
      return res.json(skills);
    } catch (error) {
      logger.error('Error fetching skills by category:', error);
      return res.status(500).json({ error: 'Failed to fetch skills' });
    }
  },

  // Get recommended skills for user
  async getRecommendedSkills(req: Request, res: Response): Promise<Response> {
    try {
      const userId = parseInt(req.user?.id as string);
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { limit } = req.query;
      const skills = await skillService.getRecommendedSkills(userId, limit ? parseInt(limit as string) : 10);
      return res.json(skills);
    } catch (error) {
      logger.error('Error fetching recommended skills:', error);
      return res.status(500).json({ error: 'Failed to fetch recommended skills' });
    }
  },
};

