import { Response, Request } from 'express';
import { reportShareService, ShareReportData } from '../services/reportShareService';
import { reportService } from '../services/reportService';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';
import * as fs from 'fs';

export const reportShareController = {
  // Share report
  shareReport: async (req: AuthRequest, res: Response): Promise<Response> => {
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

      // Verify user owns the report
      const report = await reportService.getReportById(reportId);
      if (!report || report.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: { message: 'Access denied' },
          timestamp: new Date().toISOString()
        });
      }

      const { sharedWithUserId, accessLevel, expiresAt } = req.body;

      const shareData: ShareReportData = {
        reportId,
        sharedByUserId: userId,
        sharedWithUserId: sharedWithUserId || null,
        accessLevel: accessLevel || 'view',
        expiresAt: expiresAt ? new Date(expiresAt) : null
      };

      const share = await reportShareService.shareReport(shareData);

      return res.status(201).json({
        success: true,
        data: {
          share,
          shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reports/shared/${share.share_token}`
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error sharing report:', error);
      return res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to share report' },
        timestamp: new Date().toISOString()
      });
    }
  },

  // Get shared report by token
  getSharedReport: async (req: Request, res: Response): Promise<Response> => {
    try {
      const shareToken = req.params.token as string;

      const share = await reportShareService.getShareByToken(shareToken);

      if (!share) {
        return res.status(404).json({
          success: false,
          error: { message: 'Shared report not found or expired' },
          timestamp: new Date().toISOString()
        });
      }

      const report = await reportService.getReportById(share.report_id);

      if (!report || report.status !== 'completed') {
        return res.status(404).json({
          success: false,
          error: { message: 'Report not found or not ready' },
          timestamp: new Date().toISOString()
        });
      }

      // Increment view count
      await reportShareService.incrementViewCount(share.id);

      // Track analytics (no user ID for anonymous access)
      await reportService.trackReportAction(share.report_id, null, 'viewed', {
        share_id: share.id,
        access_level: share.access_level
      });

      return res.json({
        success: true,
        data: {
          report,
          share: {
            accessLevel: share.access_level,
            expiresAt: share.expires_at
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error getting shared report:', error);
      return res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to get shared report' },
        timestamp: new Date().toISOString()
      });
    }
  },

  // Download shared report
  downloadSharedReport: async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const shareToken = req.params.token as string;

      const share = await reportShareService.getShareByToken(shareToken);

      if (!share) {
        return res.status(404).json({
          success: false,
          error: { message: 'Shared report not found or expired' },
          timestamp: new Date().toISOString()
        });
      }

      if (share.access_level !== 'download') {
        return res.status(403).json({
          success: false,
          error: { message: 'Download not allowed for this share' },
          timestamp: new Date().toISOString()
        });
      }

      const report = await reportService.getReportById(share.report_id);

      if (!report || report.status !== 'completed' || !report.file_path) {
        return res.status(404).json({
          success: false,
          error: { message: 'Report file not found' },
          timestamp: new Date().toISOString()
        });
      }

      if (!fs.existsSync(report.file_path)) {
        return res.status(404).json({
          success: false,
          error: { message: 'Report file not found' },
          timestamp: new Date().toISOString()
        });
      }

      // Increment download count
      await reportShareService.incrementDownloadCount(share.id);

      // Track analytics
      await reportService.trackReportAction(share.report_id, null, 'downloaded', {
        share_id: share.id
      });

      // Set headers for file download
      const fileName = `${report.report_name}.${report.format}`;
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', reportShareController.getContentType(report.format));
      res.setHeader('Content-Length', report.file_size || 0);

      // Stream file
      const fileStream = fs.createReadStream(report.file_path);
      fileStream.pipe(res);
    } catch (error: any) {
      logger.error('Error downloading shared report:', error);
      return res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to download shared report' },
        timestamp: new Date().toISOString()
      });
    }
  },

  // Revoke share
  revokeShare: async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      const shareId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { message: 'Unauthorized' },
          timestamp: new Date().toISOString()
        });
      }

      const revoked = await reportShareService.revokeShare(shareId, userId);

      if (!revoked) {
        return res.status(404).json({
          success: false,
          error: { message: 'Share not found or access denied' },
          timestamp: new Date().toISOString()
        });
      }

      return res.json({
        success: true,
        message: 'Share revoked successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error revoking share:', error);
      return res.status(500).json({
        success: false,
        error: { message: error.message || 'Failed to revoke share' },
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

