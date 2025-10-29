import { getConnection } from '../database/connection';
import { RowDataPacket } from 'mysql2';
import mysql from 'mysql2/promise';
import { logger } from '../utils/logger';
import crypto from 'crypto';

export interface ShareReportData {
  reportId: number;
  sharedByUserId: number;
  sharedWithUserId?: number | null; // null for public share
  accessLevel: 'view' | 'download';
  expiresAt?: Date | null;
}

export interface ReportShare {
  id: number;
  report_id: number;
  shared_by_user_id: number;
  shared_with_user_id: number | null;
  share_token: string;
  access_level: string;
  expires_at: Date | null;
  is_active: boolean;
  view_count: number;
  download_count: number;
  created_at: Date;
  updated_at: Date;
}

export const reportShareService = {
  // Share report
  async shareReport(data: ShareReportData): Promise<ReportShare> {
    const connection = getConnection();
    
    try {
      // Generate unique share token
      const shareToken = crypto.randomBytes(32).toString('hex');

      const [result] = await connection.execute<mysql.ResultSetHeader>(
        `INSERT INTO report_shares 
        (report_id, shared_by_user_id, shared_with_user_id, share_token, access_level, expires_at, is_active)
        VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
        [
          data.reportId,
          data.sharedByUserId,
          data.sharedWithUserId || null,
          shareToken,
          data.accessLevel,
          data.expiresAt || null
        ]
      );

      const share = await this.getShareById(result.insertId);
      if (!share) {
        throw new Error('Failed to retrieve created share');
      }

      return share;
    } catch (error) {
      logger.error('Error sharing report:', error);
      throw error;
    }
  },

  // Get share by ID
  async getShareById(shareId: number): Promise<ReportShare | null> {
    const connection = getConnection();
    
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM report_shares WHERE id = ?',
        [shareId]
      );

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      return {
        id: row.id,
        report_id: row.report_id,
        shared_by_user_id: row.shared_by_user_id,
        shared_with_user_id: row.shared_with_user_id,
        share_token: row.share_token,
        access_level: row.access_level,
        expires_at: row.expires_at,
        is_active: row.is_active,
        view_count: row.view_count,
        download_count: row.download_count,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    } catch (error) {
      logger.error('Error getting share:', error);
      throw error;
    }
  },

  // Get share by token
  async getShareByToken(shareToken: string): Promise<ReportShare | null> {
    const connection = getConnection();
    
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM report_shares WHERE share_token = ? AND is_active = TRUE',
        [shareToken]
      );

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      
      // Check if expired
      if (row.expires_at && new Date(row.expires_at) < new Date()) {
        return null;
      }

      return {
        id: row.id,
        report_id: row.report_id,
        shared_by_user_id: row.shared_by_user_id,
        shared_with_user_id: row.shared_with_user_id,
        share_token: row.share_token,
        access_level: row.access_level,
        expires_at: row.expires_at,
        is_active: row.is_active,
        view_count: row.view_count,
        download_count: row.download_count,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    } catch (error) {
      logger.error('Error getting share by token:', error);
      throw error;
    }
  },

  // Get shares for a report
  async getReportShares(reportId: number, userId: number): Promise<ReportShare[]> {
    const connection = getConnection();
    
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT * FROM report_shares 
        WHERE report_id = ? AND shared_by_user_id = ?
        ORDER BY created_at DESC`,
        [reportId, userId]
      );

      return rows.map(row => ({
        id: row.id,
        report_id: row.report_id,
        shared_by_user_id: row.shared_by_user_id,
        shared_with_user_id: row.shared_with_user_id,
        share_token: row.share_token,
        access_level: row.access_level,
        expires_at: row.expires_at,
        is_active: row.is_active,
        view_count: row.view_count,
        download_count: row.download_count,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));
    } catch (error) {
      logger.error('Error getting report shares:', error);
      throw error;
    }
  },

  // Increment view count
  async incrementViewCount(shareId: number): Promise<void> {
    const connection = getConnection();
    
    try {
      await connection.execute(
        'UPDATE report_shares SET view_count = view_count + 1 WHERE id = ?',
        [shareId]
      );
    } catch (error) {
      logger.error('Error incrementing view count:', error);
    }
  },

  // Increment download count
  async incrementDownloadCount(shareId: number): Promise<void> {
    const connection = getConnection();
    
    try {
      await connection.execute(
        'UPDATE report_shares SET download_count = download_count + 1 WHERE id = ?',
        [shareId]
      );
    } catch (error) {
      logger.error('Error incrementing download count:', error);
    }
  },

  // Revoke share
  async revokeShare(shareId: number, userId: number): Promise<boolean> {
    const connection = getConnection();
    
    try {
      const share = await this.getShareById(shareId);
      if (!share || share.shared_by_user_id !== userId) {
        return false;
      }

      await connection.execute(
        'UPDATE report_shares SET is_active = FALSE WHERE id = ?',
        [shareId]
      );

      return true;
    } catch (error) {
      logger.error('Error revoking share:', error);
      throw error;
    }
  }
};

