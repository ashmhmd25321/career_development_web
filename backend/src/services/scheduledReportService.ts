import { getConnection } from '../database/connection';
import { RowDataPacket } from 'mysql2';
import mysql from 'mysql2/promise';
import { logger } from '../utils/logger';
import { reportService } from './reportService';

export interface ScheduledReportConfig {
  scheduleType: 'daily' | 'weekly' | 'monthly' | 'custom';
  scheduleConfig?: {
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    hour?: number; // 0-23
    minute?: number; // 0-59
    cronExpression?: string; // For custom schedules
  };
  recipients?: string[]; // Email addresses
}

export interface CreateScheduledReportData {
  userId: number;
  reportTemplateId?: number;
  reportName: string;
  reportType: 'user_analytics' | 'job_analytics' | 'application_analytics' | 'engagement_analytics' | 'custom';
  reportConfig: any;
  scheduleType: 'daily' | 'weekly' | 'monthly' | 'custom';
  scheduleConfig?: ScheduledReportConfig['scheduleConfig'];
  format: 'csv' | 'pdf' | 'excel' | 'json';
  recipients?: string[];
}

export interface ScheduledReport {
  id: number;
  user_id: number;
  report_template_id: number | null;
  report_name: string;
  report_type: string;
  report_config: any;
  schedule_type: string;
  schedule_config: ScheduledReportConfig['scheduleConfig'] | null;
  format: string;
  recipients: string[] | null;
  is_active: boolean;
  last_run_at: Date | null;
  next_run_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export const scheduledReportService = {
  // Create scheduled report
  async createScheduledReport(data: CreateScheduledReportData): Promise<ScheduledReport> {
    const connection = getConnection();
    
    try {
      const reportConfigJson = JSON.stringify(data.reportConfig);
      const scheduleConfigJson = data.scheduleConfig ? JSON.stringify(data.scheduleConfig) : null;
      const recipientsJson = data.recipients ? JSON.stringify(data.recipients) : null;

      // Calculate next run time
      const nextRunAt = this.calculateNextRunTime(data.scheduleType, data.scheduleConfig);

      const [result] = await connection.execute<mysql.ResultSetHeader>(
        `INSERT INTO scheduled_reports 
        (user_id, report_template_id, report_name, report_type, report_config, 
         schedule_type, schedule_config, format, recipients, is_active, next_run_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)`,
        [
          data.userId,
          data.reportTemplateId || null,
          data.reportName,
          data.reportType,
          reportConfigJson,
          data.scheduleType,
          scheduleConfigJson,
          data.format,
          recipientsJson,
          nextRunAt
        ]
      );

      const scheduledReport = await this.getScheduledReportById(result.insertId);
      if (!scheduledReport) {
        throw new Error('Failed to retrieve created scheduled report');
      }

      return scheduledReport;
    } catch (error) {
      logger.error('Error creating scheduled report:', error);
      throw error;
    }
  },

  // Get scheduled report by ID
  async getScheduledReportById(scheduledReportId: number): Promise<ScheduledReport | null> {
    const connection = getConnection();
    
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM scheduled_reports WHERE id = ?',
        [scheduledReportId]
      );

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      return {
        id: row.id,
        user_id: row.user_id,
        report_template_id: row.report_template_id,
        report_name: row.report_name,
        report_type: row.report_type,
        report_config: JSON.parse(row.report_config),
        schedule_type: row.schedule_type,
        schedule_config: row.schedule_config ? JSON.parse(row.schedule_config) : null,
        format: row.format,
        recipients: row.recipients ? JSON.parse(row.recipients) : null,
        is_active: row.is_active,
        last_run_at: row.last_run_at,
        next_run_at: row.next_run_at,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    } catch (error) {
      logger.error('Error getting scheduled report:', error);
      throw error;
    }
  },

  // Get user's scheduled reports
  async getUserScheduledReports(userId: number): Promise<ScheduledReport[]> {
    const connection = getConnection();
    
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT * FROM scheduled_reports 
        WHERE user_id = ? 
        ORDER BY created_at DESC`,
        [userId]
      );

      return rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        report_template_id: row.report_template_id,
        report_name: row.report_name,
        report_type: row.report_type,
        report_config: JSON.parse(row.report_config),
        schedule_type: row.schedule_type,
        schedule_config: row.schedule_config ? JSON.parse(row.schedule_config) : null,
        format: row.format,
        recipients: row.recipients ? JSON.parse(row.recipients) : null,
        is_active: row.is_active,
        last_run_at: row.last_run_at,
        next_run_at: row.next_run_at,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));
    } catch (error) {
      logger.error('Error getting user scheduled reports:', error);
      throw error;
    }
  },

  // Update scheduled report
  async updateScheduledReport(scheduledReportId: number, userId: number, updates: Partial<CreateScheduledReportData>): Promise<ScheduledReport | null> {
    const connection = getConnection();
    
    try {
      const scheduledReport = await this.getScheduledReportById(scheduledReportId);
      if (!scheduledReport || scheduledReport.user_id !== userId) {
        return null;
      }

      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (updates.reportName) {
        updateFields.push('report_name = ?');
        updateValues.push(updates.reportName);
      }

      if (updates.reportConfig) {
        updateFields.push('report_config = ?');
        updateValues.push(JSON.stringify(updates.reportConfig));
      }

      if (updates.scheduleType) {
        updateFields.push('schedule_type = ?');
        updateValues.push(updates.scheduleType);
      }

      if (updates.scheduleConfig !== undefined) {
        updateFields.push('schedule_config = ?');
        updateValues.push(updates.scheduleConfig ? JSON.stringify(updates.scheduleConfig) : null);
      }

      if (updates.format) {
        updateFields.push('format = ?');
        updateValues.push(updates.format);
      }

      if (updates.recipients !== undefined) {
        updateFields.push('recipients = ?');
        updateValues.push(updates.recipients ? JSON.stringify(updates.recipients) : null);
      }

      if (updates.hasOwnProperty('is_active')) {
        updateFields.push('is_active = ?');
        updateValues.push((updates as any).is_active);
      }

      // Recalculate next run time if schedule changed
      if (updates.scheduleType || updates.scheduleConfig !== undefined) {
        const nextRunAt = this.calculateNextRunTime(
          updates.scheduleType || scheduledReport.schedule_type,
          updates.scheduleConfig !== undefined ? updates.scheduleConfig : scheduledReport.schedule_config
        );
        updateFields.push('next_run_at = ?');
        updateValues.push(nextRunAt);
      }

      if (updateFields.length === 0) {
        return scheduledReport;
      }

      updateValues.push(scheduledReportId);
      
      await connection.execute(
        `UPDATE scheduled_reports 
        SET ${updateFields.join(', ')} 
        WHERE id = ?`,
        updateValues
      );

      return await this.getScheduledReportById(scheduledReportId);
    } catch (error) {
      logger.error('Error updating scheduled report:', error);
      throw error;
    }
  },

  // Delete scheduled report
  async deleteScheduledReport(scheduledReportId: number, userId: number): Promise<boolean> {
    const connection = getConnection();
    
    try {
      const scheduledReport = await this.getScheduledReportById(scheduledReportId);
      if (!scheduledReport || scheduledReport.user_id !== userId) {
        return false;
      }

      await connection.execute(
        'DELETE FROM scheduled_reports WHERE id = ?',
        [scheduledReportId]
      );

      return true;
    } catch (error) {
      logger.error('Error deleting scheduled report:', error);
      throw error;
    }
  },

  // Run scheduled report now
  async runScheduledReportNow(scheduledReportId: number, userId: number): Promise<any> {
    const connection = getConnection();
    
    try {
      const scheduledReport = await this.getScheduledReportById(scheduledReportId);
      if (!scheduledReport || scheduledReport.user_id !== userId) {
        return null;
      }

      // Create report from scheduled template
      const report = await reportService.createReport({
        userId: scheduledReport.user_id,
        reportType: scheduledReport.report_type as any,
        reportName: `${scheduledReport.report_name} (Manual Run)`,
        description: `Generated from scheduled report: ${scheduledReport.report_name}`,
        reportConfig: scheduledReport.report_config,
        format: scheduledReport.format as any
      });

      // Update last run time
      await connection.execute(
        'UPDATE scheduled_reports SET last_run_at = NOW() WHERE id = ?',
        [scheduledReportId]
      );

      return report;
    } catch (error) {
      logger.error('Error running scheduled report:', error);
      throw error;
    }
  },

  // Process scheduled reports (called by cron)
  async processScheduledReports(): Promise<number> {
    const connection = getConnection();
    
    try {
      const now = new Date();
      
      const [scheduledReports] = await connection.execute<RowDataPacket[]>(
        `SELECT * FROM scheduled_reports 
        WHERE is_active = TRUE 
        AND next_run_at <= ?
        AND (last_run_at IS NULL OR last_run_at < next_run_at)`,
        [now]
      );

      let processedCount = 0;

      for (const scheduledReportRow of scheduledReports) {
        try {
          const scheduledReport = await this.getScheduledReportById(scheduledReportRow.id);
          if (!scheduledReport) continue;

          // Generate report
          const report = await reportService.createReport({
            userId: scheduledReport.user_id,
            reportType: scheduledReport.report_type as any,
            reportName: scheduledReport.report_name,
            description: `Automatically generated scheduled report`,
            reportConfig: scheduledReport.report_config,
            format: scheduledReport.format as any
          });

          // Update last run and calculate next run
          const nextRunAt = this.calculateNextRunTime(
            scheduledReport.schedule_type,
            scheduledReport.schedule_config
          );

          await connection.execute(
            `UPDATE scheduled_reports 
            SET last_run_at = NOW(), next_run_at = ? 
            WHERE id = ?`,
            [nextRunAt, scheduledReport.id]
          );

          // TODO: Send email to recipients if configured
          // if (scheduledReport.recipients && scheduledReport.recipients.length > 0) {
          //   await emailService.sendScheduledReport(scheduledReport.recipients, report);
          // }

          processedCount++;
          logger.info(`Processed scheduled report ${scheduledReport.id}`);
        } catch (error) {
          logger.error(`Error processing scheduled report ${scheduledReportRow.id}:`, error);
        }
      }

      return processedCount;
    } catch (error) {
      logger.error('Error processing scheduled reports:', error);
      return 0;
    }
  },

  // Calculate next run time
  calculateNextRunTime(scheduleType: string, scheduleConfig?: ScheduledReportConfig['scheduleConfig'] | null): Date {
    const now = new Date();
    const nextRun = new Date(now);

    switch (scheduleType) {
      case 'daily':
        // Run at specified hour and minute, or default to 9 AM
        const hour = scheduleConfig?.hour ?? 9;
        const minute = scheduleConfig?.minute ?? 0;
        nextRun.setHours(hour, minute, 0, 0);
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;

      case 'weekly':
        // Run on specified day of week
        const dayOfWeek = scheduleConfig?.dayOfWeek ?? 1; // Monday by default
        const weekHour = scheduleConfig?.hour ?? 9;
        const weekMinute = scheduleConfig?.minute ?? 0;
        
        const currentDay = now.getDay();
        const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7;
        
        if (daysUntilTarget === 0) {
          // Same day - check if time has passed
          nextRun.setHours(weekHour, weekMinute, 0, 0);
          if (nextRun <= now) {
            nextRun.setDate(nextRun.getDate() + 7);
            nextRun.setHours(weekHour, weekMinute, 0, 0);
          }
        } else {
          nextRun.setDate(nextRun.getDate() + daysUntilTarget);
          nextRun.setHours(weekHour, weekMinute, 0, 0);
        }
        break;

      case 'monthly':
        // Run on specified day of month
        const dayOfMonth = scheduleConfig?.dayOfMonth ?? 1;
        const monthHour = scheduleConfig?.hour ?? 9;
        const monthMinute = scheduleConfig?.minute ?? 0;
        
        nextRun.setDate(dayOfMonth);
        nextRun.setHours(monthHour, monthMinute, 0, 0);
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
          nextRun.setDate(dayOfMonth);
          nextRun.setHours(monthHour, monthMinute, 0, 0);
        }
        break;

      case 'custom':
        // For custom, use cron expression (simplified - would need a cron parser in production)
        // For now, default to daily
        nextRun.setHours(9, 0, 0, 0);
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;

      default:
        // Default to daily at 9 AM
        nextRun.setHours(9, 0, 0, 0);
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
    }

    return nextRun;
  }
};

