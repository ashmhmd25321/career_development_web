import { getConnection } from '../database/connection';
import { RowDataPacket } from 'mysql2';
import mysql from 'mysql2/promise';

export interface AdminDashboardMetrics {
  // User Metrics
  userMetrics: {
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    usersByRole: Array<{ role: string; count: number; percentage: number }>;
    newUsersThisMonth: number;
    newUsersTrend: Array<{ date: string; count: number }>;
    userEngagementRate: number;
  };

  // Job Metrics
  jobMetrics: {
    totalJobs: number;
    activeJobs: number;
    totalJobViews: number;
    totalApplications: number;
    averageViewsPerJob: number;
    averageApplicationsPerJob: number;
    conversionRate: number;
    jobsByStatus: Array<{ status: string; count: number; percentage: number }>;
    jobsByCategory: Array<{ category: string; count: number }>;
    jobsPostedTrend: Array<{ date: string; count: number }>;
    topEmployers: Array<{ employer_id: number; company_name: string; job_count: number }>;
  };

  // Application Metrics
  applicationMetrics: {
    totalApplications: number;
    applicationsByStatus: Array<{ status: string; count: number; percentage: number }>;
    averageApplicationsPerJob: number;
    applicationTrends: Array<{ date: string; count: number }>;
    topApplicantJobs: Array<{ job_id: number; job_title: string; application_count: number }>;
    applicationConversionRate: number;
  };

  // Engagement Metrics
  engagementMetrics: {
    totalEvents: number;
    activeEvents: number;
    totalEventRegistrations: number;
    averageRegistrationsPerEvent: number;
    eventsByType: Array<{ type: string; count: number }>;
    totalSkillsTracked: number;
    totalLearningResources: number;
    totalCertificationsEarned: number;
    userSkillsCount: number;
    careerGoalsCount: number;
    learningProgressCount: number;
  };

  // Performance Indicators (KPIs)
  performanceIndicators: {
    dailyActiveUsers: number;
    monthlyActiveUsers: number;
    jobPostingRate: number; // jobs posted per day (average)
    applicationRate: number; // applications per day (average)
    jobFillRate: number; // percentage of jobs that received applications
    averageTimeToApplication: number; // average days from job posting to first application
    platformGrowthRate: number; // month-over-month user growth
    retentionRate: number; // percentage of users active in last 30 days who were also active 60 days ago
  };

  // System Health
  systemHealth: {
    totalNotificationsSent: number;
    averageNotificationReadRate: number;
    systemUptime: string;
    databaseSize: number;
    activeSessions: number;
  };
}

export const adminDashboardService = {
  async getDashboardMetrics(timeRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<AdminDashboardMetrics> {
    const connection = getConnection();
    const dateRange = this.getDateRange(timeRange);

    try {
      // Get User Metrics
      const userMetrics = await this.getUserMetrics(connection, dateRange);

      // Get Job Metrics
      const jobMetrics = await this.getJobMetrics(connection, dateRange);

      // Get Application Metrics
      const applicationMetrics = await this.getApplicationMetrics(connection, dateRange);

      // Get Engagement Metrics
      const engagementMetrics = await this.getEngagementMetrics(connection, dateRange);

      // Get Performance Indicators
      const performanceIndicators = await this.getPerformanceIndicators(connection, dateRange);

      // Get System Health
      const systemHealth = await this.getSystemHealth(connection);

      return {
        userMetrics,
        jobMetrics,
        applicationMetrics,
        engagementMetrics,
        performanceIndicators,
        systemHealth
      };
    } catch (error) {
      console.error('Error fetching admin dashboard metrics:', error);
      throw error;
    }
  },

  async getUserMetrics(connection: mysql.Connection, dateRange: { start: Date; end: Date }) {
    // Total users
    const [userStats] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as totalUsers,
        COUNT(CASE WHEN is_active = TRUE THEN 1 END) as activeUsers,
        COUNT(CASE WHEN is_verified = TRUE THEN 1 END) as verifiedUsers
      FROM users`
    );

    // Users by role
    const [usersByRole] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        role,
        COUNT(*) as count,
        ROUND((COUNT(*) / (SELECT COUNT(*) FROM users)) * 100, 1) as percentage
      FROM users
      GROUP BY role
      ORDER BY count DESC`
    );

    // New users this month
    const [newUsersMonth] = await connection.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count
      FROM users
      WHERE created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')`
    );

    // New users trend (last 30 days)
    const [newUsersTrend] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC`
    );

    // User engagement rate (users who logged in or performed action in last 7 days)
    const [engagementRate] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(DISTINCT u.id) as activeInLastWeek,
        (SELECT COUNT(*) FROM users) as totalUsers
      FROM users u
      LEFT JOIN refresh_tokens rt ON u.id = rt.user_id
      WHERE rt.expires_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
         OR u.updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    );

    const totalUsers = userStats[0]?.totalUsers || 0;
    const activeInWeek = engagementRate[0]?.activeInLastWeek || 0;
    const engagementRatePercent = totalUsers > 0 ? (activeInWeek / totalUsers) * 100 : 0;

    return {
      totalUsers,
      activeUsers: userStats[0]?.activeUsers || 0,
      verifiedUsers: userStats[0]?.verifiedUsers || 0,
      usersByRole: usersByRole.map((row: any) => ({
        role: row.role,
        count: row.count || 0,
        percentage: parseFloat(row.percentage) || 0
      })),
      newUsersThisMonth: newUsersMonth[0]?.count || 0,
      newUsersTrend: newUsersTrend.map((row: any) => ({
        date: row.date.toISOString().split('T')[0],
        count: row.count || 0
      })),
      userEngagementRate: Math.round(engagementRatePercent * 100) / 100
    };
  },

  async getJobMetrics(connection: mysql.Connection, dateRange: { start: Date; end: Date }) {
    // Total job stats
    const [jobStats] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as totalJobs,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeJobs,
        SUM(views_count) as totalViews,
        SUM(applications_count) as totalApplications
      FROM jobs
      WHERE created_at >= ?`,
      [dateRange.start]
    );

    // Jobs by status
    const [jobsByStatus] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        status,
        COUNT(*) as count,
        ROUND((COUNT(*) / (SELECT COUNT(*) FROM jobs WHERE created_at >= ?)) * 100, 1) as percentage
      FROM jobs
      WHERE created_at >= ?
      GROUP BY status
      ORDER BY count DESC`,
      [dateRange.start, dateRange.start]
    );

    // Jobs by category
    const [jobsByCategory] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        jc.name as category,
        COUNT(j.id) as count
      FROM jobs j
      JOIN job_categories jc ON j.category_id = jc.id
      WHERE j.created_at >= ?
      GROUP BY jc.id, jc.name
      ORDER BY count DESC
      LIMIT 10`,
      [dateRange.start]
    );

    // Jobs posted trend (last 30 days)
    const [jobsTrend] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM jobs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC`
    );

    // Top employers by job count
    const [topEmployers] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        j.employer_id,
        ep.company_name,
        COUNT(j.id) as job_count
      FROM jobs j
      JOIN employer_profiles ep ON j.employer_id = ep.user_id
      WHERE j.created_at >= ?
      GROUP BY j.employer_id, ep.company_name
      ORDER BY job_count DESC
      LIMIT 10`,
      [dateRange.start]
    );

    const totalJobs = jobStats[0]?.totalJobs || 0;
    const totalViews = jobStats[0]?.totalViews || 0;
    const totalApplications = jobStats[0]?.totalApplications || 0;

    return {
      totalJobs,
      activeJobs: jobStats[0]?.activeJobs || 0,
      totalJobViews: totalViews,
      totalApplications,
      averageViewsPerJob: totalJobs > 0 ? Math.round((totalViews / totalJobs) * 100) / 100 : 0,
      averageApplicationsPerJob: totalJobs > 0 ? Math.round((totalApplications / totalJobs) * 100) / 100 : 0,
      conversionRate: totalViews > 0 ? Math.round((totalApplications / totalViews) * 10000) / 100 : 0,
      jobsByStatus: jobsByStatus.map((row: any) => ({
        status: row.status,
        count: row.count || 0,
        percentage: parseFloat(row.percentage) || 0
      })),
      jobsByCategory: jobsByCategory.map((row: any) => ({
        category: row.category,
        count: row.count || 0
      })),
      jobsPostedTrend: jobsTrend.map((row: any) => ({
        date: row.date.toISOString().split('T')[0],
        count: row.count || 0
      })),
      topEmployers: topEmployers.map((row: any) => ({
        employer_id: row.employer_id,
        company_name: row.company_name,
        job_count: row.job_count || 0
      }))
    };
  },

  async getApplicationMetrics(connection: mysql.Connection, dateRange: { start: Date; end: Date }) {
    // Total applications
    const [appStats] = await connection.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as totalApplications
      FROM applications
      WHERE created_at >= ?`,
      [dateRange.start]
    );

    // Applications by status
    const [appsByStatus] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        status,
        COUNT(*) as count,
        ROUND((COUNT(*) / (SELECT COUNT(*) FROM applications WHERE created_at >= ?)) * 100, 1) as percentage
      FROM applications
      WHERE created_at >= ?
      GROUP BY status
      ORDER BY count DESC`,
      [dateRange.start, dateRange.start, dateRange.start]
    );

    // Application trends (last 30 days)
    const [appTrends] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM applications
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC`
    );

    // Top applicant jobs
    const [topJobs] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        a.job_id,
        j.title as job_title,
        COUNT(a.id) as application_count
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.created_at >= ?
      GROUP BY a.job_id, j.title
      ORDER BY application_count DESC
      LIMIT 10`,
      [dateRange.start]
    );

    // Calculate average applications per job
    const [avgApps] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(DISTINCT a.job_id) as jobsWithApplications,
        COUNT(a.id) as totalApplications
      FROM applications a
      WHERE a.created_at >= ?`,
      [dateRange.start]
    );

    const totalApplications = appStats[0]?.totalApplications || 0;
    const jobsWithApps = avgApps[0]?.jobsWithApplications || 0;
    const avgApplications = jobsWithApps > 0 ? totalApplications / jobsWithApps : 0;

    // Application conversion rate (applications / total jobs)
    const [totalJobsCount] = await connection.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM jobs WHERE created_at >= ?`,
      [dateRange.start]
    );
    const conversionRate = totalJobsCount[0]?.count > 0 
      ? (totalApplications / totalJobsCount[0].count) * 100 
      : 0;

    return {
      totalApplications,
      applicationsByStatus: appsByStatus.map((row: any) => ({
        status: row.status,
        count: row.count || 0,
        percentage: parseFloat(row.percentage) || 0
      })),
      averageApplicationsPerJob: Math.round(avgApplications * 100) / 100,
      applicationTrends: appTrends.map((row: any) => ({
        date: row.date.toISOString().split('T')[0],
        count: row.count || 0
      })),
      topApplicantJobs: topJobs.map((row: any) => ({
        job_id: row.job_id,
        job_title: row.job_title,
        application_count: row.application_count || 0
      })),
      applicationConversionRate: Math.round(conversionRate * 100) / 100
    };
  },

  async getEngagementMetrics(connection: mysql.Connection, dateRange: { start: Date; end: Date }) {
    // Event metrics
    const [eventStats] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as totalEvents,
        COUNT(CASE WHEN start_date > NOW() THEN 1 END) as activeEvents,
        (SELECT COUNT(*) FROM event_registrations) as totalRegistrations
      FROM events
      WHERE created_at >= ?`,
      [dateRange.start]
    );

    const totalEvents = eventStats[0]?.totalEvents || 0;
    const totalRegistrations = eventStats[0]?.totalRegistrations || 0;

    // Events by type
    const [eventsByType] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        event_type as type,
        COUNT(*) as count
      FROM events
      WHERE created_at >= ?
      GROUP BY event_type
      ORDER BY count DESC`,
      [dateRange.start]
    );

    // Skills metrics
    const [skillsStats] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        (SELECT COUNT(*) FROM skills) as totalSkills,
        (SELECT COUNT(*) FROM user_skills) as userSkillsCount
      FROM DUAL`
    );

    // Learning metrics
    const [learningStats] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        (SELECT COUNT(*) FROM learning_resources) as totalResources,
        (SELECT COUNT(*) FROM user_certifications WHERE verified = TRUE) as totalCertifications,
        (SELECT COUNT(*) FROM user_learning_progress) as learningProgressCount
      FROM DUAL`
    );

    // Career goals
    const [careerGoals] = await connection.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM career_goals`
    );

    return {
      totalEvents,
      activeEvents: eventStats[0]?.activeEvents || 0,
      totalEventRegistrations: totalRegistrations,
      averageRegistrationsPerEvent: totalEvents > 0 ? Math.round((totalRegistrations / totalEvents) * 100) / 100 : 0,
      eventsByType: eventsByType.map((row: any) => ({
        type: row.type,
        count: row.count || 0
      })),
      totalSkillsTracked: skillsStats[0]?.totalSkills || 0,
      totalLearningResources: learningStats[0]?.totalResources || 0,
      totalCertificationsEarned: learningStats[0]?.totalCertifications || 0,
      userSkillsCount: skillsStats[0]?.userSkillsCount || 0,
      careerGoalsCount: careerGoals[0]?.count || 0,
      learningProgressCount: learningStats[0]?.learningProgressCount || 0
    };
  },

  async getPerformanceIndicators(connection: mysql.Connection, dateRange: { start: Date; end: Date }) {
    // Daily Active Users (users who logged in today or performed action today)
    const [dau] = await connection.execute<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT u.id) as count
      FROM users u
      LEFT JOIN refresh_tokens rt ON u.id = rt.user_id
      WHERE DATE(rt.created_at) = CURDATE() 
         OR DATE(u.updated_at) = CURDATE()`
    );

    // Monthly Active Users (users active in last 30 days)
    const [mau] = await connection.execute<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT u.id) as count
      FROM users u
      LEFT JOIN refresh_tokens rt ON u.id = rt.user_id
      WHERE rt.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
         OR u.updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
    );

    // Job posting rate (average jobs per day)
    const [jobRate] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as totalJobs,
        DATEDIFF(NOW(), ?) as days
      FROM jobs
      WHERE created_at >= ?`,
      [dateRange.start, dateRange.start]
    );
    const days = jobRate[0]?.days || 1;
    const jobPostingRate = days > 0 ? (jobRate[0]?.totalJobs || 0) / days : 0;

    // Application rate (average applications per day)
    const [appRate] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as totalApps,
        DATEDIFF(NOW(), ?) as days
      FROM applications
      WHERE created_at >= ?`,
      [dateRange.start, dateRange.start]
    );
    const applicationRate = days > 0 ? (appRate[0]?.totalApps || 0) / days : 0;

    // Job fill rate (percentage of jobs with at least one application)
    const [fillRate] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(DISTINCT j.id) as jobsWithApps,
        COUNT(DISTINCT j.id) as totalJobs
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      WHERE j.created_at >= ? AND a.id IS NOT NULL`,
      [dateRange.start]
    );
    const [totalJobsCount] = await connection.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM jobs WHERE created_at >= ?`,
      [dateRange.start]
    );
    const jobFillRate = totalJobsCount[0]?.count > 0 
      ? ((fillRate[0]?.jobsWithApps || 0) / totalJobsCount[0].count) * 100 
      : 0;

    // Average time to application (average days from job posting to first application)
    const [timeToApp] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        AVG(DATEDIFF(a.created_at, j.created_at)) as avgDays
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE j.created_at >= ?`,
      [dateRange.start]
    );

    // Platform growth rate (month-over-month)
    const [currentMonth] = await connection.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count
      FROM users
      WHERE created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')`
    );
    const [lastMonth] = await connection.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as count
      FROM users
      WHERE created_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
        AND created_at < DATE_FORMAT(NOW(), '%Y-%m-01')`
    );
    const currentCount = currentMonth[0]?.count || 0;
    const lastCount = lastMonth[0]?.count || 0;
    const growthRate = lastCount > 0 ? ((currentCount - lastCount) / lastCount) * 100 : 0;

    // Retention rate (users active in last 30 days who were also active 60 days ago)
    const [retention] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(DISTINCT u1.user_id) as retained,
        COUNT(DISTINCT u2.user_id) as totalActive30Days
      FROM (
        SELECT DISTINCT user_id
        FROM refresh_tokens
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
           OR EXISTS (
             SELECT 1 FROM users WHERE id = refresh_tokens.user_id 
             AND updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
           )
      ) u2
      LEFT JOIN (
        SELECT DISTINCT user_id
        FROM refresh_tokens
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY)
          AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
           OR EXISTS (
             SELECT 1 FROM users WHERE id = refresh_tokens.user_id 
             AND updated_at >= DATE_SUB(NOW(), INTERVAL 60 DAY)
             AND updated_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
           )
      ) u1 ON u2.user_id = u1.user_id`
    );
    const retentionRate = retention[0]?.totalActive30Days > 0
      ? ((retention[0]?.retained || 0) / retention[0].totalActive30Days) * 100
      : 0;

    return {
      dailyActiveUsers: dau[0]?.count || 0,
      monthlyActiveUsers: mau[0]?.count || 0,
      jobPostingRate: Math.round(jobPostingRate * 100) / 100,
      applicationRate: Math.round(applicationRate * 100) / 100,
      jobFillRate: Math.round(jobFillRate * 100) / 100,
      averageTimeToApplication: timeToApp[0]?.avgDays ? Math.round(timeToApp[0].avgDays * 100) / 100 : 0,
      platformGrowthRate: Math.round(growthRate * 100) / 100,
      retentionRate: Math.round(retentionRate * 100) / 100
    };
  },

  async getSystemHealth(connection: mysql.Connection) {
    // Notification metrics
    const [notifStats] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as totalSent,
        COUNT(CASE WHEN is_read = TRUE THEN 1 END) as totalRead
      FROM notifications`
    );
    const totalSent = notifStats[0]?.totalSent || 0;
    const totalRead = notifStats[0]?.totalRead || 0;
    const readRate = totalSent > 0 ? (totalRead / totalSent) * 100 : 0;

    // Database size (approximate)
    const [dbSize] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) as size_mb
      FROM information_schema.tables
      WHERE table_schema = DATABASE()`
    );
    
    // Ensure databaseSize is a number
    const dbSizeValue = dbSize[0]?.size_mb;
    const databaseSize = typeof dbSizeValue === 'number' ? dbSizeValue : parseFloat(dbSizeValue || '0');

    // Active sessions (refresh tokens not expired)
    const [sessions] = await connection.execute<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT user_id) as count
      FROM refresh_tokens
      WHERE expires_at > NOW()`
    );

    return {
      totalNotificationsSent: totalSent,
      averageNotificationReadRate: Math.round(readRate * 100) / 100,
      systemUptime: '99.9%', // Placeholder - would need actual monitoring
      databaseSize: databaseSize,
      activeSessions: sessions[0]?.count || 0
    };
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

