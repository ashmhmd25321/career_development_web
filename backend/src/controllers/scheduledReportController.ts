import { Response } from 'express';
import { scheduledReportService, CreateScheduledReportData } from '../services/scheduledReportService';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export const scheduledReportController = {
  // Create scheduled report
  createScheduledReport: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized' },
          timestamp: new Date().toISOString()
        });
      }

      const {
        reportTemplateId,
        reportName,
        reportType,
        reportConfig,
        scheduleType,
        scheduleConfig,
        format,
        recipients,
        is_active
      } = req.body;

      if (!reportName || !reportType || !reportConfig || !scheduleType || !format) {
        return res.status(400).json({
          success: false,
          error: { message: 'Missing required fields' },
          timestamp: new Date().toISOString()
        });
      }

      const scheduledReportData: CreateScheduledReportData = {
        userId,
        reportTemplateId,
        reportName,
        reportType,
        reportConfig,
        scheduleType,
        scheduleConfig,
        format,
        recipients,
        ...(is_active !== undefined && { is_active })
      };

      const scheduledReport = await scheduledReportService.createScheduledReport(scheduledReportData);

      return res.status(201).json({
        success: true,
        data: { scheduledReport },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error creating scheduled report:', error);
      return res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to create scheduled report' },
        timestamp: new Date().toISOString()
      });
    }
  },

  // Get user's scheduled reports
  getUserScheduledReports: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized' },
          timestamp: new Date().toISOString()
        });
      }

      const scheduledReports = await scheduledReportService.getUserScheduledReports(userId);

      return res.json({
        success: true,
        data: { scheduledReports },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error getting scheduled reports:', error);
      return res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to get scheduled reports' },
        timestamp: new Date().toISOString()
      });
    }
  },

  // Get scheduled report by ID
  getScheduledReportById: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      const scheduledReportId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized' },
          timestamp: new Date().toISOString()
        });
      }

      const scheduledReport = await scheduledReportService.getScheduledReportById(scheduledReportId);

      if (!scheduledReport) {
        return res.status(404).json({
          success: false,
          error: { message: 'Scheduled report not found' },
          timestamp: new Date().toISOString()
        });
      }

      if (scheduledReport.user_id !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: { message: 'Access denied' },
          timestamp: new Date().toISOString()
        });
      }

      return res.json({
        success: true,
        data: { scheduledReport },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error getting scheduled report:', error);
      return res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to get scheduled report' },
        timestamp: new Date().toISOString()
      });
    }
  },

  // Update scheduled report
  updateScheduledReport: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      const scheduledReportId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized' },
          timestamp: new Date().toISOString()
        });
      }

      const updates: any = {};
      if (req.body.reportName) updates.reportName = req.body.reportName;
      if (req.body.reportConfig) updates.reportConfig = req.body.reportConfig;
      if (req.body.scheduleType) updates.scheduleType = req.body.scheduleType;
      if (req.body.scheduleConfig !== undefined) updates.scheduleConfig = req.body.scheduleConfig;
      if (req.body.format) updates.format = req.body.format;
      if (req.body.recipients !== undefined) updates.recipients = req.body.recipients;
      if (req.body.is_active !== undefined) updates.is_active = req.body.is_active;

      const updated = await scheduledReportService.updateScheduledReport(
        scheduledReportId,
        userId,
        updates
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: { message: 'Scheduled report not found or access denied' },
          timestamp: new Date().toISOString()
        });
      }

      return res.json({
        success: true,
        data: { scheduledReport: updated },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error updating scheduled report:', error);
      return res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to update scheduled report' },
        timestamp: new Date().toISOString()
      });
    }
  },

  // Delete scheduled report
  deleteScheduledReport: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      const scheduledReportId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized' },
          timestamp: new Date().toISOString()
        });
      }

      const deleted = await scheduledReportService.deleteScheduledReport(scheduledReportId, userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: { message: 'Scheduled report not found or access denied' },
          timestamp: new Date().toISOString()
        });
      }

      return res.json({
        success: true,
        message: 'Scheduled report deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error deleting scheduled report:', error);
      return res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to delete scheduled report' },
        timestamp: new Date().toISOString()
      });
    }
  },

  // Run scheduled report now
  runScheduledReportNow: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      const scheduledReportId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized' },
          timestamp: new Date().toISOString()
        });
      }

      const report = await scheduledReportService.runScheduledReportNow(scheduledReportId, userId);

      if (!report) {
        return res.status(404).json({
          success: false,
          error: { message: 'Scheduled report not found or access denied' },
          timestamp: new Date().toISOString()
        });
      }

      return res.json({
        success: true,
        data: { report },
        message: 'Report generated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error running scheduled report:', error);
      return res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to run scheduled report' },
        timestamp: new Date().toISOString()
      });
    }
  }
};

