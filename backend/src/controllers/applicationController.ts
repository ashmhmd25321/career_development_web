import { Request, Response } from 'express';
import { applicationService } from '../services/applicationService';
import { AuthenticatedRequest } from '../types';

export const applicationController = {
  // Get all applications for a specific job (employer view)
  async getJobApplications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      const applications = await applicationService.findByJobId(parseInt(jobId));
      
      res.json({
        success: true,
        data: applications,
        message: 'Applications retrieved successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to retrieve applications'
        }
      });
    }
  },

  // Get applications for a specific user (student view)
  async getUserApplications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' }
        });
        return;
      }

      const applications = await applicationService.findByUserId(userId);
      
      res.json({
        success: true,
        data: applications,
        message: 'User applications retrieved successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to retrieve user applications'
        }
      });
    }
  },

  // Create a new application
  async createApplication(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' }
        });
        return;
      }

      const applicationData = {
        ...req.body,
        userId,
        appliedAt: new Date()
      };

      const application = await applicationService.createApplication(applicationData);
      
      res.status(201).json({
        success: true,
        data: application,
        message: 'Application submitted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to submit application'
        }
      });
    }
  },

  // Update application status (employer action)
  async updateApplicationStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { applicationId } = req.params;
      const { status, notes } = req.body;

      const application = await applicationService.updateApplicationStatus(
        parseInt(applicationId),
        status,
        notes
      );
      
      res.json({
        success: true,
        data: application,
        message: 'Application status updated successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to update application status'
        }
      });
    }
  },

  // Get application by ID
  async getApplicationById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { applicationId } = req.params;
      const application = await applicationService.findById(parseInt(applicationId));
      
      if (!application) {
        res.status(404).json({
          success: false,
          error: { message: 'Application not found' }
        });
        return;
      }

      res.json({
        success: true,
        data: application,
        message: 'Application retrieved successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to retrieve application'
        }
      });
    }
  },

  // Delete application (student can delete their own applications)
  async deleteApplication(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { applicationId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' }
        });
        return;
      }

      await applicationService.deleteApplication(parseInt(applicationId), userId);
      
      res.json({
        success: true,
        message: 'Application deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Failed to delete application'
        }
      });
    }
  }
};
