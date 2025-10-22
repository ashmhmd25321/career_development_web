import { RowDataPacket } from 'mysql2/promise';
import { getConnection } from '@/database/connection';
import { logger } from '@/utils/logger';

export interface JobAnalytics {
  totalJobs: number;
  activeJobs: number;
  pausedJobs: number;
  closedJobs: number;
  draftJobs: number;
  expiredJobs: number;
  totalViews: number;
  totalApplications: number;
  averageViewsPerJob: number;
  averageApplicationsPerJob: number;
  conversionRate: number;
  topPerformingJobs: Array<{
    id: number;
    title: string;
    views: number;
    applications: number;
    conversionRate: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    jobsPosted: number;
    applicationsReceived: number;
    viewsGenerated: number;
  }>;
  applicationTrends: Array<{
    date: string;
    applications: number;
  }>;
}

export const analyticsService = {
  async getJobAnalytics(employerId: number, timeRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<JobAnalytics> {
    const connection = getConnection();
    
    try {
      // Calculate date range
      const dateRange = this.getDateRange(timeRange);
      
      // Get basic job statistics
      const [jobStats] = await connection.execute<RowDataPacket[]>(
        `SELECT 
          COUNT(*) as totalJobs,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeJobs,
          SUM(CASE WHEN status = 'paused' THEN 1 ELSE 0 END) as pausedJobs,
          SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closedJobs,
          SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draftJobs,
          SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expiredJobs,
          SUM(views_count) as totalViews,
          SUM(applications_count) as totalApplications
        FROM jobs 
        WHERE employer_id = ? AND created_at >= ?`,
        [employerId, dateRange.start]
      );

      const stats = jobStats[0];
      const totalJobs = stats.totalJobs || 0;
      const totalViews = stats.totalViews || 0;
      const totalApplications = stats.totalApplications || 0;

      // Calculate averages and conversion rate
      const averageViewsPerJob = totalJobs > 0 ? Math.round(totalViews / totalJobs * 100) / 100 : 0;
      const averageApplicationsPerJob = totalJobs > 0 ? Math.round(totalApplications / totalJobs * 100) / 100 : 0;
      const conversionRate = totalViews > 0 ? Math.round((totalApplications / totalViews) * 10000) / 100 : 0;

      // Get top performing jobs
      const [topJobs] = await connection.execute<RowDataPacket[]>(
        `SELECT 
          id, title, views_count as views, applications_count as applications,
          CASE 
            WHEN views_count > 0 THEN ROUND((applications_count / views_count) * 100, 2)
            ELSE 0 
          END as conversionRate
        FROM jobs 
        WHERE employer_id = ? AND created_at >= ?
        ORDER BY applications_count DESC, views_count DESC
        LIMIT 5`,
        [employerId, dateRange.start]
      );

      // Get status distribution
      const [statusDist] = await connection.execute<RowDataPacket[]>(
        `SELECT 
          status,
          COUNT(*) as count,
          ROUND((COUNT(*) / ?) * 100, 1) as percentage
        FROM jobs 
        WHERE employer_id = ? AND created_at >= ?
        GROUP BY status
        ORDER BY count DESC`,
        [totalJobs, employerId, dateRange.start]
      );

      // Get monthly trends
      const [monthlyTrends] = await connection.execute<RowDataPacket[]>(
        `SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as jobsPosted,
          SUM(applications_count) as applicationsReceived,
          SUM(views_count) as viewsGenerated
        FROM jobs 
        WHERE employer_id = ? AND created_at >= ?
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month DESC
        LIMIT 12`,
        [employerId, dateRange.start]
      );

      // Get application trends (last 30 days)
      const [appTrends] = await connection.execute<RowDataPacket[]>(
        `SELECT 
          DATE(created_at) as date,
          COUNT(*) as applications
        FROM applications 
        WHERE job_id IN (
          SELECT id FROM jobs WHERE employer_id = ?
        ) AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30`,
        [employerId]
      );

      return {
        totalJobs,
        activeJobs: stats.activeJobs || 0,
        pausedJobs: stats.pausedJobs || 0,
        closedJobs: stats.closedJobs || 0,
        draftJobs: stats.draftJobs || 0,
        expiredJobs: stats.expiredJobs || 0,
        totalViews,
        totalApplications,
        averageViewsPerJob,
        averageApplicationsPerJob,
        conversionRate,
        topPerformingJobs: topJobs.map(job => ({
          id: job.id,
          title: job.title,
          views: job.views,
          applications: job.applications,
          conversionRate: job.conversionRate
        })),
        statusDistribution: statusDist.map(status => ({
          status: status.status,
          count: status.count,
          percentage: status.percentage
        })),
        monthlyTrends: monthlyTrends.map(trend => ({
          month: trend.month,
          jobsPosted: trend.jobsPosted,
          applicationsReceived: trend.applicationsReceived || 0,
          viewsGenerated: trend.viewsGenerated || 0
        })),
        applicationTrends: appTrends.map(trend => ({
          date: trend.date,
          applications: trend.applications
        }))
      };

    } catch (error) {
      logger.error('Error fetching job analytics:', error);
      throw error;
    }
  },

  async getJobPerformanceMetrics(employerId: number, jobId?: number): Promise<any> {
    const connection = getConnection();
    
    try {
      let whereClause = 'WHERE employer_id = ?';
      let params: any[] = [employerId];
      
      if (jobId) {
        whereClause += ' AND id = ?';
        params.push(jobId);
      }

      const [metrics] = await connection.execute<RowDataPacket[]>(
        `SELECT 
          id,
          title,
          status,
          views_count,
          applications_count,
          created_at,
          updated_at,
          CASE 
            WHEN views_count > 0 THEN ROUND((applications_count / views_count) * 100, 2)
            ELSE 0 
          END as conversionRate,
          DATEDIFF(NOW(), created_at) as daysActive
        FROM jobs 
        ${whereClause}
        ORDER BY applications_count DESC, views_count DESC`,
        params
      );

      return metrics;

    } catch (error) {
      logger.error('Error fetching job performance metrics:', error);
      throw error;
    }
  },

  async getApplicationAnalytics(employerId: number, timeRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<any> {
    const connection = getConnection();
    
    try {
      const dateRange = this.getDateRange(timeRange);
      
      // Get application status distribution
      const [appStatusDist] = await connection.execute<RowDataPacket[]>(
        `SELECT 
          a.status,
          COUNT(*) as count,
          ROUND((COUNT(*) / (SELECT COUNT(*) FROM applications a2 
            JOIN jobs j2 ON a2.job_id = j2.id 
            WHERE j2.employer_id = ? AND a2.created_at >= ?)) * 100, 1) as percentage
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        WHERE j.employer_id = ? AND a.created_at >= ?
        GROUP BY a.status
        ORDER BY count DESC`,
        [employerId, dateRange.start, employerId, dateRange.start]
      );

      // Get applications by job
      const [appsByJob] = await connection.execute<RowDataPacket[]>(
        `SELECT 
          j.id,
          j.title,
          COUNT(a.id) as applicationCount,
          AVG(CASE WHEN a.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as recentApplications
        FROM jobs j
        LEFT JOIN applications a ON j.id = a.job_id
        WHERE j.employer_id = ? AND j.created_at >= ?
        GROUP BY j.id, j.title
        ORDER BY applicationCount DESC
        LIMIT 10`,
        [employerId, dateRange.start]
      );

      return {
        statusDistribution: appStatusDist,
        applicationsByJob: appsByJob
      };

    } catch (error) {
      logger.error('Error fetching application analytics:', error);
      throw error;
    }
  },

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
