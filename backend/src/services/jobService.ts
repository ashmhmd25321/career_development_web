import { RowDataPacket, FieldPacket, OkPacket } from 'mysql2/promise';
import { getConnection } from '@/database/connection';
import { Job, CreateJobData, UpdateJobData, JobFilters } from '@/types';
import { logger } from '@/utils/logger';

// Helper function to convert snake_case to camelCase for job objects
const toCamelCase = (job: any): Job => {
  if (!job) return job;
  return {
    id: job.id,
    employerId: job.employer_id,
    title: job.title,
    description: job.description,
    requirements: job.requirements,
    responsibilities: job.responsibilities,
    benefits: job.benefits,
    jobType: job.job_type,
    locationType: job.location_type,
    location: job.location,
    salaryMin: job.salary_min,
    salaryMax: job.salary_max,
    salaryCurrency: job.salary_currency,
    experienceLevel: job.experience_level,
    categoryId: job.category_id,
    applicationDeadline: job.application_deadline,
    startDate: job.start_date,
    isActive: job.is_active,
    isFeatured: job.is_featured,
    viewsCount: job.views_count,
    applicationsCount: job.applications_count,
    createdAt: job.created_at,
    updatedAt: job.updated_at,
  };
};

export const jobService = {
  async findAll(filters: JobFilters = {}): Promise<Job[]> {
    const connection = getConnection();
    
    let query = `
      SELECT 
        j.id, j.employer_id, j.title, j.description, j.requirements, j.responsibilities, 
        j.benefits, j.job_type, j.location_type, j.location, j.salary_min, j.salary_max, 
        j.salary_currency, j.experience_level, j.category_id, j.application_deadline, 
        j.start_date, j.is_active, j.is_featured, j.views_count, j.applications_count, 
        j.created_at, j.updated_at,
        jc.name as category_name
      FROM jobs j
      LEFT JOIN job_categories jc ON j.category_id = jc.id
      WHERE j.is_active = TRUE
    `;
    
    const queryParams: any[] = [];
    
    // Apply filters
    if (filters.jobType) {
      query += ` AND j.job_type = ?`;
      queryParams.push(filters.jobType);
    }
    
    if (filters.locationType) {
      query += ` AND j.location_type = ?`;
      queryParams.push(filters.locationType);
    }
    
    if (filters.experienceLevel) {
      query += ` AND j.experience_level = ?`;
      queryParams.push(filters.experienceLevel);
    }
    
    if (filters.categoryId) {
      query += ` AND j.category_id = ?`;
      queryParams.push(filters.categoryId);
    }
    
    if (filters.location) {
      query += ` AND j.location LIKE ?`;
      queryParams.push(`%${filters.location}%`);
    }
    
    if (filters.search) {
      query += ` AND (j.title LIKE ? OR j.description LIKE ?)`;
      const searchTerm = `%${filters.search}%`;
      queryParams.push(searchTerm, searchTerm);
    }
    
    if (filters.salaryMin) {
      query += ` AND j.salary_min >= ?`;
      queryParams.push(filters.salaryMin);
    }
    
    if (filters.salaryMax) {
      query += ` AND j.salary_max <= ?`;
      queryParams.push(filters.salaryMax);
    }
    
    // Order by featured first, then by creation date
    query += ` ORDER BY j.is_featured DESC, j.created_at DESC`;
    
    // Apply pagination
    if (filters.limit) {
      query += ` LIMIT ${filters.limit}`;
      
      if (filters.offset) {
        query += ` OFFSET ${filters.offset}`;
      }
    }
    
    const [rows] = await connection.execute<RowDataPacket[]>(query, queryParams);
    return rows.map(toCamelCase);
  },

  async findById(id: number): Promise<Job | null> {
    const connection = getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        j.id, j.employer_id, j.title, j.description, j.requirements, j.responsibilities, 
        j.benefits, j.job_type, j.location_type, j.location, j.salary_min, j.salary_max, 
        j.salary_currency, j.experience_level, j.category_id, j.application_deadline, 
        j.start_date, j.is_active, j.is_featured, j.views_count, j.applications_count, 
        j.created_at, j.updated_at,
        ep.company_name, ep.company_size, ep.industry, ep.logo_url, ep.website_url,
        jc.name as category_name
       FROM jobs j
       LEFT JOIN employer_profiles ep ON j.employer_id = ep.user_id
       LEFT JOIN job_categories jc ON j.category_id = jc.id
       WHERE j.id = ? AND j.is_active = TRUE`,
      [id]
    );
    
    if (rows.length === 0) return null;
    return toCamelCase(rows[0]);
  },

  async findByEmployerId(employerId: number): Promise<Job[]> {
    const connection = getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        j.id, j.employer_id, j.title, j.description, j.requirements, j.responsibilities, 
        j.benefits, j.job_type, j.location_type, j.location, j.salary_min, j.salary_max, 
        j.salary_currency, j.experience_level, j.category_id, j.application_deadline, 
        j.start_date, j.is_active, j.is_featured, j.views_count, j.applications_count, 
        j.created_at, j.updated_at,
        ep.company_name, ep.company_size, ep.industry, ep.logo_url,
        jc.name as category_name
       FROM jobs j
       LEFT JOIN employer_profiles ep ON j.employer_id = ep.user_id
       LEFT JOIN job_categories jc ON j.category_id = jc.id
       WHERE j.employer_id = ?
       ORDER BY j.created_at DESC`,
      [employerId]
    );
    
    return rows.map(toCamelCase);
  },

  async createJob(jobData: CreateJobData): Promise<Job> {
    const connection = getConnection();
    const {
      employerId,
      title,
      description,
      requirements,
      responsibilities,
      benefits,
      jobType,
      locationType,
      location,
      salaryMin,
      salaryMax,
      salaryCurrency,
      experienceLevel,
      categoryId,
      applicationDeadline,
      startDate,
    } = jobData;

    const [result] = await connection.execute<OkPacket>(
      `INSERT INTO jobs (
        employer_id, title, description, requirements, responsibilities, benefits,
        job_type, location_type, location, salary_min, salary_max, salary_currency,
        experience_level, category_id, application_deadline, start_date, is_active, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employerId,
        title,
        description || null,
        requirements || null,
        responsibilities || null,
        benefits || null,
        jobType,
        locationType,
        location || null,
        salaryMin || null,
        salaryMax || null,
        salaryCurrency || 'USD',
        experienceLevel,
        categoryId || null,
        applicationDeadline || null,
        startDate || null,
        true,
        false,
      ]
    );

    const newJob = await this.findById(result.insertId);
    if (!newJob) {
      throw new Error('Failed to retrieve new job after creation.');
    }
    
    logger.info(`New job created: ${title} by employer ${employerId} (ID: ${result.insertId})`);
    return newJob;
  },

  async updateJob(id: number, jobData: UpdateJobData): Promise<Job | null> {
    const connection = getConnection();
    const fields: string[] = [];
    const values: any[] = [];

    if (jobData.title !== undefined) {
      fields.push('title = ?');
      values.push(jobData.title);
    }
    if (jobData.description !== undefined) {
      fields.push('description = ?');
      values.push(jobData.description);
    }
    if (jobData.requirements !== undefined) {
      fields.push('requirements = ?');
      values.push(jobData.requirements);
    }
    if (jobData.responsibilities !== undefined) {
      fields.push('responsibilities = ?');
      values.push(jobData.responsibilities);
    }
    if (jobData.benefits !== undefined) {
      fields.push('benefits = ?');
      values.push(jobData.benefits);
    }
    if (jobData.jobType !== undefined) {
      fields.push('job_type = ?');
      values.push(jobData.jobType);
    }
    if (jobData.locationType !== undefined) {
      fields.push('location_type = ?');
      values.push(jobData.locationType);
    }
    if (jobData.location !== undefined) {
      fields.push('location = ?');
      values.push(jobData.location);
    }
    if (jobData.salaryMin !== undefined) {
      fields.push('salary_min = ?');
      values.push(jobData.salaryMin);
    }
    if (jobData.salaryMax !== undefined) {
      fields.push('salary_max = ?');
      values.push(jobData.salaryMax);
    }
    if (jobData.salaryCurrency !== undefined) {
      fields.push('salary_currency = ?');
      values.push(jobData.salaryCurrency);
    }
    if (jobData.experienceLevel !== undefined) {
      fields.push('experience_level = ?');
      values.push(jobData.experienceLevel);
    }
    if (jobData.categoryId !== undefined) {
      fields.push('category_id = ?');
      values.push(jobData.categoryId);
    }
    if (jobData.applicationDeadline !== undefined) {
      fields.push('application_deadline = ?');
      values.push(jobData.applicationDeadline);
    }
    if (jobData.startDate !== undefined) {
      fields.push('start_date = ?');
      values.push(jobData.startDate);
    }
    if (jobData.isActive !== undefined) {
      fields.push('is_active = ?');
      values.push(jobData.isActive);
    }
    if (jobData.isFeatured !== undefined) {
      fields.push('is_featured = ?');
      values.push(jobData.isFeatured);
    }

    if (fields.length === 0) {
      return this.findById(id); // No fields to update
    }

    values.push(id);

    const query = `UPDATE jobs SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await connection.execute(query, values);

    logger.info(`Job updated: ID ${id}`);
    return this.findById(id);
  },

  async deleteJob(id: number): Promise<boolean> {
    const connection = getConnection();
    const [result] = await connection.execute<OkPacket>(
      'UPDATE jobs SET is_active = FALSE WHERE id = ?',
      [id]
    );
    
    logger.info(`Job deactivated: ID ${id}`);
    return result.affectedRows > 0;
  },

  async incrementViewsCount(id: number): Promise<void> {
    const connection = getConnection();
    await connection.execute(
      'UPDATE jobs SET views_count = views_count + 1 WHERE id = ?',
      [id]
    );
  },

  async incrementApplicationsCount(id: number): Promise<void> {
    const connection = getConnection();
    await connection.execute(
      'UPDATE jobs SET applications_count = applications_count + 1 WHERE id = ?',
      [id]
    );
  },

  async getJobStats(employerId: number): Promise<any> {
    const connection = getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total_jobs,
        SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_jobs,
        SUM(CASE WHEN is_featured = TRUE THEN 1 ELSE 0 END) as featured_jobs,
        SUM(views_count) as total_views,
        SUM(applications_count) as total_applications
       FROM jobs 
       WHERE employer_id = ?`,
      [employerId]
    );
    
    return rows[0];
  },
};
