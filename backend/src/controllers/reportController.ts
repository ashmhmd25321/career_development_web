import { Response } from 'express';
import { reportService, CreateReportData } from '../services/reportService';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';
import * as fs from 'fs';
import * as path from 'path';

export const reportController = {
  // Create a new report
  createReport: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized' },
          timestamp: new Date().toISOString()
        });
      }

      const { reportType, reportName, description, reportConfig, format, expiresAt } = req.body;

      if (!reportType || !reportName || !reportConfig || !format) {
        return res.status(400).json({
          success: false,
          error: { message: 'Missing required fields: reportType, reportName, reportConfig, format' },
          timestamp: new Date().toISOString()
        });
      }

      const reportData: CreateReportData = {
        userId,
        reportType,
        reportName,
        description,
        reportConfig,
        format,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined
      };

      const report = await reportService.createReport(reportData);

      return res.status(201).json({
        success: true,
        data: { report },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error creating report:', error);
      return res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to create report' },
        timestamp: new Date().toISOString()
      });
    }
  },

  // Get user's reports
  getUserReports: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized' },
          timestamp: new Date().toISOString()
        });
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const reports = await reportService.getUserReports(userId, limit, offset);

      return res.json({
        success: true,
        data: { reports },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error getting user reports:', error);
      return res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to get reports' },
        timestamp: new Date().toISOString()
      });
    }
  },

  // Get report by ID
  getReportById: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      const reportId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized' },
          timestamp: new Date().toISOString()
        });
      }

      const report = await reportService.getReportById(reportId);

      if (!report) {
        return res.status(404).json({
          success: false,
          error: { message: 'Report not found' },
          timestamp: new Date().toISOString()
        });
      }

      // Check if user has access (owner or admin)
      if (report.user_id !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: { message: 'Access denied' },
          timestamp: new Date().toISOString()
        });
      }

      // Track view
      await reportService.trackReportAction(reportId, userId, 'viewed');

      return res.json({
        success: true,
        data: { report },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error getting report:', error);
      return res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to get report' },
        timestamp: new Date().toISOString()
      });
    }
  },

  // Download report file
  downloadReport: async (req: AuthRequest, res: Response): Promise<Response | void> => {
    try {
      const userId = req.user?.id;
      const reportId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized' },
          timestamp: new Date().toISOString()
        });
      }

      const report = await reportService.getReportById(reportId);

      if (!report) {
        return res.status(404).json({
          success: false,
          error: { message: 'Report not found' },
          timestamp: new Date().toISOString()
        });
      }

      // Check if user has access
      if (report.user_id !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: { message: 'Access denied' },
          timestamp: new Date().toISOString()
        });
      }

      // Check if report is ready
      if (report.status !== 'completed' || !report.file_path) {
        return res.status(400).json({
          success: false,
          error: { message: `Report is ${report.status}. Please wait for generation to complete.` },
          timestamp: new Date().toISOString()
        });
      }

      // Check if file exists
      if (!fs.existsSync(report.file_path)) {
        return res.status(404).json({
          success: false,
          error: { message: 'Report file not found' },
          timestamp: new Date().toISOString()
        });
      }

      // Track download
      await reportService.trackReportAction(reportId, userId, 'downloaded');

      // Set headers for file download
      const fileName = `${report.report_name}.${report.format}`;
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', reportController.getContentType(report.format));
      res.setHeader('Content-Length', report.file_size || 0);

      // Stream file
      const fileStream = fs.createReadStream(report.file_path);
      fileStream.pipe(res);
    } catch (error: any) {
      logger.error('Error downloading report:', error);
      return res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to download report' },
        timestamp: new Date().toISOString()
      });
    }
  },

  // Delete report
  deleteReport: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      const reportId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized' },
          timestamp: new Date().toISOString()
        });
      }

      const deleted = await reportService.deleteReport(reportId, userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: { message: 'Report not found or access denied' },
          timestamp: new Date().toISOString()
        });
      }

      return res.json({
        success: true,
        message: 'Report deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error deleting report:', error);
      return res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to delete report' },
        timestamp: new Date().toISOString()
      });
    }
  },

  // Get report analytics
  getReportAnalytics: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      const reportId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized' },
          timestamp: new Date().toISOString()
        });
      }

      const report = await reportService.getReportById(reportId);

      if (!report) {
        return res.status(404).json({
          success: false,
          error: { message: 'Report not found' },
          timestamp: new Date().toISOString()
        });
      }

      // Check if user has access
      if (report.user_id !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: { message: 'Access denied' },
          timestamp: new Date().toISOString()
        });
      }

      const analytics = await reportService.getReportAnalytics(reportId);

      return res.json({
        success: true,
        data: { analytics },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error getting report analytics:', error);
      return res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to get report analytics' },
        timestamp: new Date().toISOString()
      });
    }
  },

  // Helper: Get content type
  getContentType(format: string): string {
    const contentTypes: Record<string, string> = {
      csv: 'text/csv',
      json: 'application/json',
      pdf: 'application/pdf',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
    return contentTypes[format] || 'application/octet-stream';
  }
};

