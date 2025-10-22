import { getConnection } from '@/database/connection';
import { Job } from '@/types';
import { logger } from '@/utils/logger';

export class RecommendationService {
  /**
   * Get job recommendations for a user based on their profile and preferences
   */
  static async getUserRecommendations(userId: number, limit = 10): Promise<Job[]> {
    try {
      const connection = getConnection();
      
      // Get user's application history to understand preferences
      const [applications] = await connection.query(`
        SELECT DISTINCT j.category_id, j.job_type, j.experience_level, j.location_type
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        WHERE a.user_id = ? AND a.status != 'rejected'
        ORDER BY a.applied_at DESC
        LIMIT 20
      `, [userId]) as any[];

      // Get user's bookmarked jobs to understand interests
      const [bookmarks] = await connection.query(`
        SELECT DISTINCT j.category_id, j.job_type, j.experience_level, j.location_type
        FROM job_bookmarks b
        JOIN jobs j ON b.job_id = j.id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
        LIMIT 20
      `, [userId]) as any[];

      // Combine preferences from applications and bookmarks
      const preferences = [...applications, ...bookmarks];
      
      if (preferences.length === 0) {
        // If no preferences, return featured jobs
        return this.getFeaturedJobs(limit);
      }

      // Create recommendation query based on user preferences
      const categoryIds = [...new Set(preferences.map((p: any) => p.category_id).filter(Boolean))];
      const jobTypes = [...new Set(preferences.map((p: any) => p.job_type).filter(Boolean))];
      const experienceLevels = [...new Set(preferences.map((p: any) => p.experience_level).filter(Boolean))];
      const locationTypes = [...new Set(preferences.map((p: any) => p.location_type).filter(Boolean))];

      // Build dynamic query based on available preferences
      let whereConditions = ['j.is_active = TRUE'];
      let queryParams: any[] = [];

      if (categoryIds.length > 0) {
        whereConditions.push(`j.category_id IN (${categoryIds.map(() => '?').join(',')})`);
        queryParams.push(...categoryIds);
      }

      if (jobTypes.length > 0) {
        whereConditions.push(`j.job_type IN (${jobTypes.map(() => '?').join(',')})`);
        queryParams.push(...jobTypes);
      }

      if (experienceLevels.length > 0) {
        whereConditions.push(`j.experience_level IN (${experienceLevels.map(() => '?').join(',')})`);
        queryParams.push(...experienceLevels);
      }

      if (locationTypes.length > 0) {
        whereConditions.push(`j.location_type IN (${locationTypes.map(() => '?').join(',')})`);
        queryParams.push(...locationTypes);
      }

      // Exclude jobs user has already applied to
      whereConditions.push(`j.id NOT IN (
        SELECT DISTINCT job_id FROM applications WHERE user_id = ?
      )`);
      queryParams.push(userId);

      // Exclude jobs user has already bookmarked
      whereConditions.push(`j.id NOT IN (
        SELECT DISTINCT job_id FROM job_bookmarks WHERE user_id = ?
      )`);
      queryParams.push(userId);

      const query = `
        SELECT 
          j.*,
          jc.name as category_name,
          ep.company_name,
          ep.company_size,
          ep.industry,
          ep.logo_url,
          ep.website_url
        FROM jobs j
        LEFT JOIN job_categories jc ON j.category_id = jc.id
        LEFT JOIN employer_profiles ep ON j.employer_id = ep.user_id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY 
          j.is_featured DESC,
          j.applications_count DESC,
          j.created_at DESC
        LIMIT ?
      `;

      queryParams.push(limit);

      const [jobs] = await connection.query(query, queryParams) as any[];
      
      return jobs as Job[];
    } catch (error) {
      logger.error('Error getting user recommendations:', error);
      throw new Error('Failed to get job recommendations');
    }
  }

  /**
   * Get featured jobs for users without preferences
   */
  static async getFeaturedJobs(limit = 10): Promise<Job[]> {
    try {
      const connection = getConnection();
      
      const [jobs] = await connection.query(`
        SELECT 
          j.*,
          jc.name as category_name,
          ep.company_name,
          ep.company_size,
          ep.industry,
          ep.logo_url,
          ep.website_url
        FROM jobs j
        LEFT JOIN job_categories jc ON j.category_id = jc.id
        LEFT JOIN employer_profiles ep ON j.employer_id = ep.user_id
        WHERE j.is_active = TRUE AND j.is_featured = TRUE
        ORDER BY j.applications_count DESC, j.created_at DESC
        LIMIT ?
      `, [limit]) as any[];

      return jobs as Job[];
    } catch (error) {
      logger.error('Error getting featured jobs:', error);
      throw new Error('Failed to get featured jobs');
    }
  }

  /**
   * Get trending jobs based on application count and recent activity
   */
  static async getTrendingJobs(limit = 10): Promise<Job[]> {
    try {
      const connection = getConnection();
      
      const [jobs] = await connection.query(`
        SELECT 
          j.*,
          jc.name as category_name,
          ep.company_name,
          ep.company_size,
          ep.industry,
          ep.logo_url,
          ep.website_url
        FROM jobs j
        LEFT JOIN job_categories jc ON j.category_id = jc.id
        LEFT JOIN employer_profiles ep ON j.employer_id = ep.user_id
        WHERE j.is_active = TRUE
        ORDER BY 
          j.applications_count DESC,
          j.views_count DESC,
          j.created_at DESC
        LIMIT ?
      `, [limit]) as any[];

      return jobs as Job[];
    } catch (error) {
      logger.error('Error getting trending jobs:', error);
      throw new Error('Failed to get trending jobs');
    }
  }

  /**
   * Get similar jobs based on a specific job
   */
  static async getSimilarJobs(jobId: number, limit = 5): Promise<Job[]> {
    try {
      const connection = getConnection();
      
      // First get the reference job
      const [referenceJob] = await connection.query(`
        SELECT category_id, job_type, experience_level, location_type
        FROM jobs WHERE id = ?
      `, [jobId]) as any[];

      if (!referenceJob || referenceJob.length === 0) {
        return [];
      }

      const job = referenceJob[0] as any;
      
      const [similarJobs] = await connection.query(`
        SELECT 
          j.*,
          jc.name as category_name,
          ep.company_name,
          ep.company_size,
          ep.industry,
          ep.logo_url,
          ep.website_url
        FROM jobs j
        LEFT JOIN job_categories jc ON j.category_id = jc.id
        LEFT JOIN employer_profiles ep ON j.employer_id = ep.user_id
        WHERE j.is_active = TRUE 
          AND j.id != ?
          AND (
            j.category_id = ? OR
            j.job_type = ? OR
            j.experience_level = ? OR
            j.location_type = ?
          )
        ORDER BY 
          CASE 
            WHEN j.category_id = ? THEN 4
            WHEN j.job_type = ? THEN 3
            WHEN j.experience_level = ? THEN 2
            WHEN j.location_type = ? THEN 1
            ELSE 0
          END DESC,
          j.applications_count DESC
        LIMIT ?
      `, [
        jobId,
        job.category_id, job.job_type, job.experience_level, job.location_type,
        job.category_id, job.job_type, job.experience_level, job.location_type,
        limit
      ]) as any[];

      return similarJobs as Job[];
    } catch (error) {
      logger.error('Error getting similar jobs:', error);
      throw new Error('Failed to get similar jobs');
    }
  }
}
