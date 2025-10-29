import { Response } from 'express';
import { notificationTemplateService } from '../services/notificationTemplateService';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export const notificationTemplateController = {
  // Get all templates
  getAllTemplates: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const activeOnly = req.query.active === 'true';
      const templates = await notificationTemplateService.getAllTemplates(activeOnly);
      return res.json(templates);
    } catch (error) {
      logger.error('Error getting templates:', error);
      return res.status(500).json({ error: 'Failed to get templates' });
    }
  },

  // Get template by ID
  getTemplateById: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const template = await notificationTemplateService.getTemplateById(parseInt(id));
      
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      
      return res.json(template);
    } catch (error) {
      logger.error('Error getting template:', error);
      return res.status(500).json({ error: 'Failed to get template' });
    }
  },

  // Create template (admin only)
  createTemplate: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can create templates' });
      }
      
      const template = await notificationTemplateService.createTemplate({
        name: req.body.name,
        title_template: req.body.title_template,
        message_template: req.body.message_template,
        type: req.body.type,
        category: req.body.category,
        variables: req.body.variables,
        description: req.body.description,
        created_by: userId
      });
      
      return res.status(201).json(template);
    } catch (error: any) {
      logger.error('Error creating template:', error);
      return res.status(500).json({ error: error.message || 'Failed to create template' });
    }
  },

  // Update template (admin only)
  updateTemplate: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can update templates' });
      }
      
      const { id } = req.params;
      
      const updates: any = {};
      if (req.body.name) updates.name = req.body.name;
      if (req.body.title_template) updates.title_template = req.body.title_template;
      if (req.body.message_template) updates.message_template = req.body.message_template;
      if (req.body.type) updates.type = req.body.type;
      if (req.body.category) updates.category = req.body.category;
      if (req.body.variables) updates.variables = req.body.variables;
      if (req.body.description !== undefined) updates.description = req.body.description;
      if (req.body.is_active !== undefined) updates.is_active = req.body.is_active;
      
      const template = await notificationTemplateService.updateTemplate(parseInt(id), updates);
      
      return res.json(template);
    } catch (error: any) {
      logger.error('Error updating template:', error);
      return res.status(500).json({ error: error.message || 'Failed to update template' });
    }
  },

  // Delete template (admin only)
  deleteTemplate: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can delete templates' });
      }
      
      const { id } = req.params;
      await notificationTemplateService.deleteTemplate(parseInt(id));
      
      return res.json({ message: 'Template deleted successfully' });
    } catch (error: any) {
      logger.error('Error deleting template:', error);
      return res.status(500).json({ error: error.message || 'Failed to delete template' });
    }
  },

  // Render template preview
  previewTemplate: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const template = await notificationTemplateService.getTemplateById(parseInt(id));
      
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      
      const sampleVariables = req.body.variables || {};
      const rendered = notificationTemplateService.renderTemplate(template, sampleVariables);
      
      return res.json({
        title: rendered.title,
        message: rendered.message
      });
    } catch (error: any) {
      logger.error('Error previewing template:', error);
      return res.status(500).json({ error: error.message || 'Failed to preview template' });
    }
  },

  // Use template to send notification
  useTemplateToSend: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Admins can send to any user, others can only send to themselves
      const targetUserId = req.body.user_id || userId;
      if (targetUserId !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'You can only send notifications to yourself' });
      }
      
      const { id } = req.params;
      const variables = req.body.variables || {};
      const relatedId = req.body.related_id;
      
      await notificationTemplateService.useTemplateToSend(
        parseInt(id),
        targetUserId,
        variables,
        relatedId
      );
      
      return res.json({ message: 'Notification sent successfully' });
    } catch (error: any) {
      logger.error('Error sending notification from template:', error);
      return res.status(500).json({ error: error.message || 'Failed to send notification' });
    }
  },

  // Get available variables
  getAvailableVariables: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const category = req.query.category as string || 'system';
      const variables = notificationTemplateService.getAvailableVariables(category);
      return res.json({ variables });
    } catch (error) {
      logger.error('Error getting available variables:', error);
      return res.status(500).json({ error: 'Failed to get variables' });
    }
  }
};

