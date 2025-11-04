import { getConnection } from '../database/connection';
import { RowDataPacket } from 'mysql2';
import { Application, CreateApplicationData, UpdateApplicationData } from '../types';

const toCamelCase = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (typeof obj !== 'object') return obj;

  const camelCaseObj: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    
    // Handle date fields specially
    if (camelKey === 'appliedAt' || camelKey === 'createdAt' || camelKey === 'updatedAt') {
      camelCaseObj[camelKey] = value ? new Date(value as string) : null;
    } else {
      camelCaseObj[camelKey] = toCamelCase(value);
    }
  }
  return camelCaseObj;
};

export const applicationService = {
  async findByJobId(jobId: number): Promise<Application[]> {
    const connection = getConnection();
    
    const query = `
      SELECT 
        a.id, a.student_id as userId, a.job_id as jobId, a.status, a.applied_at as appliedAt, a.notes,
        a.created_at as createdAt, a.updated_at as updatedAt,
        u.first_name as firstName, u.last_name as lastName, u.email, u.phone,
        j.title as jobTitle, ep.company_name as companyName
      FROM applications a
      LEFT JOIN users u ON a.student_id = u.id
      LEFT JOIN jobs j ON a.job_id = j.id
      LEFT JOIN employer_profiles ep ON j.employer_id = ep.user_id
      WHERE a.job_id = ?
      ORDER BY a.applied_at DESC
    `;
    
    const [rows] = await connection.execute<RowDataPacket[]>(query, [jobId]);
    return (rows as any[]).map(toCamelCase);
  },

  async findByUserId(userId: number): Promise<Application[]> {
    const connection = getConnection();
    
    const query = `
      SELECT 
        a.id, a.student_id as userId, a.job_id as jobId, a.status, a.applied_at as appliedAt, a.notes,
        a.created_at as createdAt, a.updated_at as updatedAt,
        j.title as jobTitle, ep.company_name as companyName, j.location, j.job_type as jobType,
        j.experience_level as experienceLevel, j.salary_min as salaryMin, j.salary_max as salaryMax, j.salary_currency as salaryCurrency
      FROM applications a
      LEFT JOIN jobs j ON a.job_id = j.id
      LEFT JOIN employer_profiles ep ON j.employer_id = ep.user_id
      WHERE a.student_id = ?
      ORDER BY a.applied_at DESC
    `;
    
    const [rows] = await connection.execute<RowDataPacket[]>(query, [userId]);
    return (rows as any[]).map(toCamelCase);
  },

  async findById(applicationId: number): Promise<Application | null> {
    const connection = getConnection();
    
    const query = `
      SELECT 
        a.id, a.student_id as userId, a.job_id as jobId, a.status, a.applied_at as appliedAt, a.notes,
        a.created_at as createdAt, a.updated_at as updatedAt,
        u.first_name as firstName, u.last_name as lastName, u.email, u.phone,
        j.title as jobTitle, ep.company_name as companyName, j.description, j.location,
        j.job_type as jobType, j.experience_level as experienceLevel, j.salary_min as salaryMin, j.salary_max as salaryMax, j.salary_currency as salaryCurrency
      FROM applications a
      LEFT JOIN users u ON a.student_id = u.id
      LEFT JOIN jobs j ON a.job_id = j.id
      LEFT JOIN employer_profiles ep ON j.employer_id = ep.user_id
      WHERE a.id = ?
    `;
    
    const [rows] = await connection.execute<RowDataPacket[]>(query, [applicationId]);
    const applications = (rows as any[]).map(toCamelCase);
    return applications.length > 0 ? applications[0] : null;
  },

  async createApplication(applicationData: CreateApplicationData): Promise<Application> {
    const connection = getConnection();
    
    // Check if user already applied for this job
    const existingApplication = await connection.execute(
      'SELECT id FROM applications WHERE student_id = ? AND job_id = ?',
      [applicationData.userId, applicationData.jobId]
    );
    
    if ((existingApplication[0] as any[]).length > 0) {
      throw new Error('You have already applied for this job');
    }

    // Validate user has contact details (phone number)
    const [userRows] = await connection.execute(
      'SELECT phone, email FROM users WHERE id = ?',
      [applicationData.userId]
    ) as any[];
    
    if (userRows.length === 0) {
      throw new Error('User not found');
    }
    
    const user = userRows[0];
    if (!user.phone || user.phone.trim() === '') {
      throw new Error('Phone number is required to submit an application. Please update your profile with your contact number.');
    }
    
    if (!user.email || user.email.trim() === '') {
      throw new Error('Email address is required to submit an application.');
    }

    const query = `
      INSERT INTO applications (
        student_id, job_id, status, applied_at, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const [result] = await connection.execute(query, [
      applicationData.userId,
      applicationData.jobId,
      applicationData.status || 'pending',
      applicationData.appliedAt || new Date(),
      applicationData.notes || null
    ]);

    const applicationId = (result as any).insertId;
    
    // Update job applications count
    await connection.execute(
      'UPDATE jobs SET applications_count = applications_count + 1 WHERE id = ?',
      [applicationData.jobId]
    );

    // Return the created application
    const application = await this.findById(applicationId);
    if (!application) {
      throw new Error('Failed to retrieve created application');
    }
    
    return application;
  },

  async updateApplicationStatus(
    applicationId: number, 
    status: string, 
    notes?: string
  ): Promise<Application> {
    const connection = getConnection();
    
    const query = `
      UPDATE applications 
      SET status = ?, notes = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    await connection.execute(query, [status, notes || null, applicationId]);
    
    const application = await this.findById(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }
    
    return application;
  },

  async deleteApplication(applicationId: number, userId: number): Promise<void> {
    const connection = getConnection();
    
    // Check if application exists and belongs to user
    const [rows] = await connection.execute(
      'SELECT job_id FROM applications WHERE id = ? AND student_id = ?',
      [applicationId, userId]
    );
    
    if ((rows as any[]).length === 0) {
      throw new Error('Application not found or you do not have permission to delete it');
    }

    const jobId = (rows as any[])[0].job_id;
    
    // Delete the application
    await connection.execute(
      'DELETE FROM applications WHERE id = ? AND student_id = ?',
      [applicationId, userId]
    );

    // Update job applications count
    await connection.execute(
      'UPDATE jobs SET applications_count = applications_count - 1 WHERE id = ?',
      [jobId]
    );
  },

  async getApplicationStats(jobId: number): Promise<{
    total: number;
    pending: number;
    reviewed: number;
    accepted: number;
    rejected: number;
  }> {
    const connection = getConnection();
    
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'reviewed' THEN 1 ELSE 0 END) as reviewed,
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM applications 
      WHERE job_id = ?
    `;
    
    const [rows] = await connection.execute<RowDataPacket[]>(query, [jobId]);
    const stats = (rows as any[])[0];
    
    return {
      total: parseInt(stats.total) || 0,
      pending: parseInt(stats.pending) || 0,
      reviewed: parseInt(stats.reviewed) || 0,
      accepted: parseInt(stats.accepted) || 0,
      rejected: parseInt(stats.rejected) || 0
    };
  }
};
