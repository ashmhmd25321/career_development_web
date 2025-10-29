import { getConnection } from '../database/connection';
import { RowDataPacket } from 'mysql2';
import mysql from 'mysql2/promise';
import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import PDFDocument from 'pdfkit';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

export interface ReportConfig {
  filters?: Record<string, any>;
  fields?: string[];
  timeRange?: '7d' | '30d' | '90d' | '1y';
  includeCharts?: boolean;
  grouping?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateReportData {
  userId: number;
  reportType: 'user_analytics' | 'job_analytics' | 'application_analytics' | 'engagement_analytics' | 'custom';
  reportName: string;
  description?: string;
  reportConfig: ReportConfig;
  format: 'csv' | 'pdf' | 'excel' | 'json';
  expiresAt?: Date;
}

export interface Report {
  id: number;
  user_id: number;
  report_type: string;
  report_name: string;
  description: string | null;
  report_config: ReportConfig;
  format: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  file_path: string | null;
  file_size: number | null;
  expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

const REPORTS_DIR = path.join(process.cwd(), 'reports');

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

export const reportService = {
  // Create a new report
  async createReport(data: CreateReportData): Promise<Report> {
    const connection = getConnection();
    
    try {
      // Ensure reportConfig is properly formatted as JSON string
      let reportConfigJson: string;
      if (typeof data.reportConfig === 'string') {
        // If already a string, validate it's valid JSON
        try {
          JSON.parse(data.reportConfig);
          reportConfigJson = data.reportConfig;
        } catch {
          throw new Error('Invalid reportConfig JSON string');
        }
      } else {
        reportConfigJson = JSON.stringify(data.reportConfig);
      }
      
      const [result] = await connection.execute<mysql.ResultSetHeader>(
        `INSERT INTO reports 
        (user_id, report_type, report_name, description, report_config, format, expires_at, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          data.userId,
          data.reportType,
          data.reportName,
          data.description || null,
          reportConfigJson,
          data.format,
          data.expiresAt || null
        ]
      );

      const reportId = result.insertId;
      
      // Generate report asynchronously
      this.generateReportAsync(reportId).catch(err => {
        logger.error(`Error generating report ${reportId}:`, err);
      });

      const report = await this.getReportById(reportId);
      if (!report) {
        throw new Error('Failed to retrieve created report');
      }
      
      return report;
    } catch (error) {
      logger.error('Error creating report:', error);
      throw error;
    }
  },

  // Generate report asynchronously
  async generateReportAsync(reportId: number): Promise<void> {
    const connection = getConnection();
    
    try {
      // Update status to generating
      await connection.execute(
        'UPDATE reports SET status = ? WHERE id = ?',
        ['generating', reportId]
      );

      const report = await this.getReportById(reportId);
      if (!report) {
        throw new Error('Report not found');
      }

      // Generate report data based on type
      let reportData: any;
      
      switch (report.report_type) {
        case 'user_analytics':
          reportData = await this.generateUserAnalyticsReport(report);
          break;
        case 'job_analytics':
          reportData = await this.generateJobAnalyticsReport(report);
          break;
        case 'application_analytics':
          reportData = await this.generateApplicationAnalyticsReport(report);
          break;
        case 'engagement_analytics':
          reportData = await this.generateEngagementAnalyticsReport(report);
          break;
        default:
          throw new Error(`Unsupported report type: ${report.report_type}`);
      }

      // Generate file based on format
      const filePath = await this.generateReportFile(report, reportData);
      
      const fileStats = fs.statSync(filePath);
      const fileSize = fileStats.size;

      // Update report with file info
      await connection.execute(
        `UPDATE reports 
        SET status = ?, file_path = ?, file_size = ? 
        WHERE id = ?`,
        ['completed', filePath, fileSize, reportId]
      );

      logger.info(`Report ${reportId} generated successfully: ${filePath}`);
    } catch (error) {
      logger.error(`Error generating report ${reportId}:`, error);
      
      // Update status to failed
      await connection.execute(
        'UPDATE reports SET status = ? WHERE id = ?',
        ['failed', reportId]
      );
      
      throw error;
    }
  },

  // Get report by ID
  async getReportById(reportId: number): Promise<Report | null> {
    const connection = getConnection();
    
    try {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM reports WHERE id = ?',
        [reportId]
      );

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      
      // Safely parse report_config
      let reportConfig: any = {};
      if (row.report_config) {
        try {
          if (typeof row.report_config === 'string') {
            reportConfig = JSON.parse(row.report_config);
          } else {
            reportConfig = row.report_config;
          }
        } catch (error) {
          logger.warn(`Failed to parse report_config for report ${row.id}:`, error);
          reportConfig = {};
        }
      }
      
      return {
        id: row.id,
        user_id: row.user_id,
        report_type: row.report_type,
        report_name: row.report_name,
        description: row.description,
        report_config: reportConfig,
        format: row.format,
        status: row.status,
        file_path: row.file_path,
        file_size: row.file_size,
        expires_at: row.expires_at,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    } catch (error) {
      logger.error('Error getting report:', error);
      throw error;
    }
  },

  // Get user's reports
  async getUserReports(userId: number, limit: number = 50, offset: number = 0): Promise<Report[]> {
    const connection = getConnection();
    
    try {
      const limitNum = parseInt(String(limit), 10);
      const offsetNum = parseInt(String(offset), 10);
      
      // MySQL doesn't support placeholders for LIMIT/OFFSET in prepared statements
      // Using string interpolation (sanitized via parseInt) for LIMIT/OFFSET
      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT * FROM reports 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ${limitNum} OFFSET ${offsetNum}`,
        [userId]
      );

      return rows.map(row => {
        // Safely parse report_config
        let reportConfig: any = {};
        if (row.report_config) {
          try {
            if (typeof row.report_config === 'string') {
              reportConfig = JSON.parse(row.report_config);
            } else {
              reportConfig = row.report_config;
            }
          } catch (error) {
            logger.warn(`Failed to parse report_config for report ${row.id}:`, error);
            reportConfig = {};
          }
        }
        
        return {
          id: row.id,
          user_id: row.user_id,
          report_type: row.report_type,
          report_name: row.report_name,
          description: row.description,
          report_config: reportConfig,
          format: row.format,
          status: row.status,
          file_path: row.file_path,
          file_size: row.file_size,
          expires_at: row.expires_at,
          created_at: row.created_at,
          updated_at: row.updated_at
        };
      });
    } catch (error) {
      logger.error('Error getting user reports:', error);
      throw error;
    }
  },

  // Generate user analytics report data
  async generateUserAnalyticsReport(report: Report): Promise<any> {
    const connection = getConnection();
    const config = report.report_config;
    const dateRange = this.getDateRange(config.timeRange || '30d');

    const [users] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        id, email, first_name, last_name, role, is_active, is_verified,
        created_at, updated_at
      FROM users
      WHERE created_at >= ?
      ORDER BY created_at DESC`,
      [dateRange.start]
    );

    return {
      type: 'user_analytics',
      timeRange: config.timeRange || '30d',
      totalUsers: users.length,
      data: users
    };
  },

  // Generate job analytics report data
  async generateJobAnalyticsReport(report: Report): Promise<any> {
    const connection = getConnection();
    const config = report.report_config;
    const dateRange = this.getDateRange(config.timeRange || '30d');

    let query = `
      SELECT 
        j.id, j.title, j.description, j.status, j.views_count, j.applications_count,
        j.created_at, j.updated_at, j.application_deadline,
        ep.company_name, ep.company_size, ep.industry,
        jc.name as category
      FROM jobs j
      LEFT JOIN employer_profiles ep ON j.employer_id = ep.user_id
      LEFT JOIN job_categories jc ON j.category_id = jc.id
      WHERE j.created_at >= ?
    `;

    const params: any[] = [dateRange.start];

    if (config.filters?.status) {
      query += ' AND j.status = ?';
      params.push(config.filters.status);
    }

    if (config.filters?.category_id) {
      query += ' AND j.category_id = ?';
      params.push(config.filters.category_id);
    }

    query += ' ORDER BY j.created_at DESC';

    const [jobs] = await connection.execute<RowDataPacket[]>(query, params);

    return {
      type: 'job_analytics',
      timeRange: config.timeRange || '30d',
      totalJobs: jobs.length,
      data: jobs
    };
  },

  // Generate application analytics report data
  async generateApplicationAnalyticsReport(report: Report): Promise<any> {
    const connection = getConnection();
    const config = report.report_config;
    const dateRange = this.getDateRange(config.timeRange || '30d');

    let query = `
      SELECT 
        a.id, a.status, a.notes, a.created_at, a.updated_at,
        j.id as job_id, j.title as job_title,
        u.id as user_id, u.email, u.first_name, u.last_name
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON a.user_id = u.id
      WHERE a.created_at >= ?
    `;

    const params: any[] = [dateRange.start];

    if (config.filters?.status) {
      query += ' AND a.status = ?';
      params.push(config.filters.status);
    }

    if (config.filters?.job_id) {
      query += ' AND a.job_id = ?';
      params.push(config.filters.job_id);
    }

    query += ' ORDER BY a.created_at DESC';

    const [applications] = await connection.execute<RowDataPacket[]>(query, params);

    return {
      type: 'application_analytics',
      timeRange: config.timeRange || '30d',
      totalApplications: applications.length,
      data: applications
    };
  },

  // Generate engagement analytics report data
  async generateEngagementAnalyticsReport(report: Report): Promise<any> {
    const connection = getConnection();
    const config = report.report_config;
    const dateRange = this.getDateRange(config.timeRange || '30d');

    // Events
    const [events] = await connection.execute<RowDataPacket[]>(
      `SELECT id, title, event_type, start_date, end_date, location, 
       is_free, price, created_at
      FROM events
      WHERE created_at >= ?
      ORDER BY created_at DESC`,
      [dateRange.start]
    );

    // Skills tracked
    const [skills] = await connection.execute<RowDataPacket[]>(
      `SELECT us.id, us.proficiency_level, us.experience_years, us.created_at,
       s.name as skill_name, u.email as user_email
      FROM user_skills us
      JOIN skills s ON us.skill_id = s.id
      JOIN users u ON us.user_id = u.id
      WHERE us.created_at >= ?
      ORDER BY us.created_at DESC`,
      [dateRange.start]
    );

    // Learning progress
    const [learningProgress] = await connection.execute<RowDataPacket[]>(
      `SELECT ulp.id, ulp.status, ulp.percentage_complete, ulp.rating, ulp.created_at,
       lr.title as resource_title, lr.resource_type, u.email as user_email
      FROM user_learning_progress ulp
      JOIN learning_resources lr ON ulp.resource_id = lr.id
      JOIN users u ON ulp.user_id = u.id
      WHERE ulp.created_at >= ?
      ORDER BY ulp.created_at DESC`,
      [dateRange.start]
    );

    return {
      type: 'engagement_analytics',
      timeRange: config.timeRange || '30d',
      events: events,
      skillsTracked: skills,
      learningProgress: learningProgress
    };
  },

  // Generate report file
  async generateReportFile(report: Report, data: any): Promise<string> {
    const timestamp = Date.now();
    const fileName = `${report.report_type}_${report.id}_${timestamp}.${report.format}`;
    const filePath = path.join(REPORTS_DIR, fileName);

    switch (report.format) {
      case 'csv':
        await this.generateCSVFile(filePath, data);
        break;
      case 'json':
        await this.generateJSONFile(filePath, data);
        break;
      case 'pdf':
        await this.generatePDFFile(filePath, report, data);
        break;
      case 'excel':
        // For Excel, we'll generate JSON for now
        // In production, you'd use libraries like exceljs
        await this.generateJSONFile(filePath, data);
        break;
      default:
        throw new Error(`Unsupported format: ${report.format}`);
    }

    return filePath;
  },

  // Generate CSV file
  async generateCSVFile(filePath: string, data: any): Promise<void> {
    let csvContent = '';

    if (data.type === 'user_analytics' || data.type === 'job_analytics' || data.type === 'application_analytics') {
      // Flat data structure
      if (data.data && data.data.length > 0) {
        // CSV Header
        const headers = Object.keys(data.data[0]);
        csvContent += headers.join(',') + '\n';

        // CSV Rows
        data.data.forEach((row: any) => {
          const values = headers.map(header => {
            const value = row[header];
            // Handle null, undefined, and comma-containing values
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
              ? `"${stringValue.replace(/"/g, '""')}"`
              : stringValue;
          });
          csvContent += values.join(',') + '\n';
        });
      }
    } else if (data.type === 'engagement_analytics') {
      // Multiple sections
      if (data.events && data.events.length > 0) {
        csvContent += '=== Events ===\n';
        const headers = Object.keys(data.events[0]);
        csvContent += headers.join(',') + '\n';
        data.events.forEach((row: any) => {
          const values = headers.map(header => {
            const value = row[header];
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
              ? `"${stringValue.replace(/"/g, '""')}"`
              : stringValue;
          });
          csvContent += values.join(',') + '\n';
        });
        csvContent += '\n';
      }

      if (data.skillsTracked && data.skillsTracked.length > 0) {
        csvContent += '=== Skills Tracked ===\n';
        const headers = Object.keys(data.skillsTracked[0]);
        csvContent += headers.join(',') + '\n';
        data.skillsTracked.forEach((row: any) => {
          const values = headers.map(header => {
            const value = row[header];
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
              ? `"${stringValue.replace(/"/g, '""')}"`
              : stringValue;
          });
          csvContent += values.join(',') + '\n';
        });
        csvContent += '\n';
      }

      if (data.learningProgress && data.learningProgress.length > 0) {
        csvContent += '=== Learning Progress ===\n';
        const headers = Object.keys(data.learningProgress[0]);
        csvContent += headers.join(',') + '\n';
        data.learningProgress.forEach((row: any) => {
          const values = headers.map(header => {
            const value = row[header];
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
              ? `"${stringValue.replace(/"/g, '""')}"`
              : stringValue;
          });
          csvContent += values.join(',') + '\n';
        });
      }
    }

    await writeFile(filePath, csvContent, 'utf-8');
  },

  // Generate JSON file
  async generateJSONFile(filePath: string, data: any): Promise<void> {
    const jsonContent = JSON.stringify(data, null, 2);
    await writeFile(filePath, jsonContent, 'utf-8');
  },

  // Generate PDF file
  async generatePDFFile(filePath: string, report: Report, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      // Track page number for footer
      let pageNumber = 1;
      
      // Add footer to each page
      const addFooter = () => {
        doc.fontSize(8).font('Helvetica').fillColor('#999999');
        doc.text(
          `CareerFlow Pro - Report ID: ${report.id}`,
          50,
          doc.page.height - 50,
          { align: 'left' }
        );
        doc.text(
          `Page ${pageNumber}`,
          doc.page.width - 50,
          doc.page.height - 50,
          { align: 'right' }
        );
        doc.fillColor('black');
      };
      
      doc.on('pageAdded', () => {
        pageNumber++;
        addFooter();
      });

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text(report.report_name, { align: 'center' });
      doc.moveDown(0.5);
      
      if (report.description) {
        doc.fontSize(12).font('Helvetica').fillColor('#666666').text(report.description, { align: 'center' });
        doc.fillColor('black');
        doc.moveDown(1);
      }

      // Report metadata
      doc.fontSize(10).font('Helvetica').fillColor('#999999').text(
        `Generated: ${new Date().toLocaleDateString()} | Type: ${report.report_type} | Format: PDF`,
        { align: 'center' }
      );
      doc.fillColor('black');
      doc.moveDown(2);

      // Report data
      if (data.type === 'user_analytics' || data.type === 'job_analytics' || data.type === 'application_analytics') {
        // Table format for flat data
        if (data.data && data.data.length > 0) {
          doc.fontSize(14).font('Helvetica-Bold').text(`Summary`, { underline: true });
          doc.moveDown(0.5);
          doc.fontSize(11).font('Helvetica').text(`Total Records: ${data.data.length}`);
          doc.fontSize(11).font('Helvetica').text(`Time Range: ${data.timeRange || 'N/A'}`);
          doc.moveDown(1);

          // Table header
          const headers = Object.keys(data.data[0]);
          const columnWidths = headers.map(() => (doc.page.width - 100) / headers.length);
          
          doc.fontSize(10).font('Helvetica-Bold');
          let xPos = 50;
          headers.forEach((header, index) => {
            doc.text(header.substring(0, 15), xPos, doc.y, { width: columnWidths[index], align: 'left' });
            xPos += columnWidths[index];
          });
          doc.moveDown(0.5);
          
          // Table rows
          doc.fontSize(8).font('Helvetica');
          data.data.slice(0, 50).forEach((row: any) => { // Limit to 50 rows per page
            if (doc.y > doc.page.height - 150) {
              addFooter();
              doc.addPage();
              // Repeat header
              doc.fontSize(10).font('Helvetica-Bold');
              xPos = 50;
              headers.forEach((header, index) => {
                doc.text(header.substring(0, 15), xPos, doc.y, { width: columnWidths[index], align: 'left' });
                xPos += columnWidths[index];
              });
              doc.moveDown(0.5);
              doc.fontSize(8).font('Helvetica');
            }
            
            xPos = 50;
            headers.forEach((header, index) => {
              const value = row[header];
              const cellValue = value !== null && value !== undefined ? String(value).substring(0, 20) : 'N/A';
              doc.text(cellValue, xPos, doc.y, { width: columnWidths[index], align: 'left' });
              xPos += columnWidths[index];
            });
            doc.moveDown(0.5);
          });

          if (data.data.length > 50) {
            doc.moveDown(1);
            doc.fontSize(10).font('Helvetica').fillColor('#666666').text(`... and ${data.data.length - 50} more records`);
            doc.fillColor('black');
          }
        } else {
          doc.fontSize(12).font('Helvetica').text('No data available for this report.', { align: 'center' });
        }
      } else if (data.type === 'engagement_analytics') {
        // Multiple sections for engagement analytics
        doc.fontSize(14).font('Helvetica-Bold').text('Engagement Analytics Report', { underline: true });
        doc.moveDown(1);

        // Events section
        if (data.events && data.events.length > 0) {
          doc.fontSize(12).font('Helvetica-Bold').text('Events', { underline: true });
          doc.moveDown(0.5);
          data.events.slice(0, 20).forEach((event: any) => {
            doc.fontSize(10).font('Helvetica-Bold').text(event.title || 'Untitled Event');
            doc.fontSize(9).font('Helvetica').text(`Type: ${event.event_type || 'N/A'} | Date: ${event.start_date || 'N/A'}`);
            doc.moveDown(0.3);
          });
          if (data.events.length > 20) {
            doc.fontSize(9).font('Helvetica').fillColor('#666666').text(`... and ${data.events.length - 20} more events`);
            doc.fillColor('black');
          }
          doc.moveDown(1);
        }

        // Skills section
        if (data.skillsTracked && data.skillsTracked.length > 0) {
          doc.fontSize(12).font('Helvetica-Bold').text('Skills Tracked', { underline: true });
          doc.moveDown(0.5);
          data.skillsTracked.slice(0, 20).forEach((skill: any) => {
            doc.fontSize(10).font('Helvetica').text(`${skill.skill_name || 'Unknown'} - ${skill.user_email || 'N/A'}`);
            doc.moveDown(0.3);
          });
          if (data.skillsTracked.length > 20) {
            doc.fontSize(9).font('Helvetica').fillColor('#666666').text(`... and ${data.skillsTracked.length - 20} more skills`);
            doc.fillColor('black');
          }
          doc.moveDown(1);
        }

        // Learning Progress section
        if (data.learningProgress && data.learningProgress.length > 0) {
          doc.fontSize(12).font('Helvetica-Bold').text('Learning Progress', { underline: true });
          doc.moveDown(0.5);
          data.learningProgress.slice(0, 20).forEach((progress: any) => {
            doc.fontSize(10).font('Helvetica-Bold').text(progress.resource_title || 'Unknown Resource');
            doc.fontSize(9).font('Helvetica').text(
              `Status: ${progress.status || 'N/A'} | Progress: ${progress.percentage_complete || 0}% | User: ${progress.user_email || 'N/A'}`
            );
            doc.moveDown(0.3);
          });
          if (data.learningProgress.length > 20) {
            doc.fontSize(9).font('Helvetica').fillColor('#666666').text(`... and ${data.learningProgress.length - 20} more progress records`);
            doc.fillColor('black');
          }
        }
      }

      // Add footer to final page
      addFooter();

      doc.end();

      stream.on('finish', () => {
        resolve();
      });

      stream.on('error', (error) => {
        reject(error);
      });
    });
  },

  // Delete report
  async deleteReport(reportId: number, userId: number): Promise<boolean> {
    const connection = getConnection();
    
    try {
      const report = await this.getReportById(reportId);
      if (!report || report.user_id !== userId) {
        return false;
      }

      // Delete file if exists
      if (report.file_path && fs.existsSync(report.file_path)) {
        fs.unlinkSync(report.file_path);
      }

      // Delete report record
      await connection.execute(
        'DELETE FROM reports WHERE id = ?',
        [reportId]
      );

      return true;
    } catch (error) {
      logger.error('Error deleting report:', error);
      throw error;
    }
  },

  // Track report analytics
  async trackReportAction(reportId: number, userId: number | null, actionType: 'viewed' | 'downloaded' | 'shared', metadata?: any): Promise<void> {
    const connection = getConnection();
    
    try {
      await connection.execute(
        `INSERT INTO report_analytics (report_id, user_id, action_type, metadata)
        VALUES (?, ?, ?, ?)`,
        [
          reportId,
          userId,
          actionType,
          metadata ? JSON.stringify(metadata) : null
        ]
      );
    } catch (error) {
      logger.error('Error tracking report action:', error);
      // Don't throw - analytics should not break the main flow
    }
  },

  // Get report analytics
  async getReportAnalytics(reportId: number): Promise<any> {
    const connection = getConnection();
    
    try {
      const [stats] = await connection.execute<RowDataPacket[]>(
        `SELECT 
          action_type,
          COUNT(*) as count
        FROM report_analytics
        WHERE report_id = ?
        GROUP BY action_type`,
        [reportId]
      );

      const [totalViews] = await connection.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as count
        FROM report_analytics
        WHERE report_id = ? AND action_type = 'viewed'`,
        [reportId]
      );

      const [totalDownloads] = await connection.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as count
        FROM report_analytics
        WHERE report_id = ? AND action_type = 'downloaded'`,
        [reportId]
      );

      const [recentActions] = await connection.execute<RowDataPacket[]>(
        `SELECT action_type, created_at, user_id
        FROM report_analytics
        WHERE report_id = ?
        ORDER BY created_at DESC
        LIMIT 20`,
        [reportId]
      );

      return {
        totalViews: totalViews[0]?.count || 0,
        totalDownloads: totalDownloads[0]?.count || 0,
        actionsByType: stats.map((s: any) => ({
          type: s.action_type,
          count: s.count
        })),
        recentActions: recentActions.map((a: any) => ({
          type: a.action_type,
          createdAt: a.created_at,
          userId: a.user_id
        }))
      };
    } catch (error) {
      logger.error('Error getting report analytics:', error);
      throw error;
    }
  },

  // Helper: Get date range
  getDateRange(timeRange: '7d' | '30d' | '90d' | '1y'): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();
    
    switch (timeRange) {
      case '7d':
        start.setDate(end.getDate() - 7);
        break;
      case '30d':
        start.setDate(end.getDate() - 30);
        break;
      case '90d':
        start.setDate(end.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(end.getFullYear() - 1);
        break;
    }
    
    return { start, end };
  }
};

