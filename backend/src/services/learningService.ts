import { RowDataPacket, OkPacket } from 'mysql2/promise';
import { getConnection } from '@/database/connection';
import { logger } from '@/utils/logger';

export interface LearningResource {
  id: number;
  title: string;
  description: string | null;
  resourceType: 'Article' | 'Video' | 'Course' | 'Tutorial' | 'Documentation' | 'Webinar' | 'Book';
  url: string | null;
  skillId: number | null;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  durationMinutes: number | null;
  free: boolean;
  externalLink: string | null;
  createdBy: number | null;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserLearningProgress {
  id: number;
  userId: number;
  resourceId: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
  progressPercentage: number;
  startedDate: string | null;
  completedDate: string | null;
  notes: string | null;
  rating: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Certification {
  id: number;
  title: string;
  description: string | null;
  issuingOrganization: string | null;
  skillId: number | null;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  validityPeriodMonths: number | null;
  cost: number | null;
  examRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserCertification {
  id: number;
  userId: number;
  certificationId: number;
  certificationNumber: string | null;
  issuedDate: string;
  expiryDate: string | null;
  verified: boolean;
  verificationDocumentUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LearningPath {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  targetRole: string | null;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedDurationHours: number | null;
  skillsCovered: string | null; // JSON array
  resourcesIncluded: string | null; // JSON array
  createdBy: number | null;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLearningResourceData {
  title: string;
  description?: string;
  resourceType: 'Article' | 'Video' | 'Course' | 'Tutorial' | 'Documentation' | 'Webinar' | 'Book';
  url?: string;
  skillId?: number;
  difficultyLevel?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  durationMinutes?: number;
  free?: boolean;
  externalLink?: string;
}

export interface CreateUserCertificationData {
  certificationId: number;
  certificationNumber?: string;
  issuedDate: string;
  expiryDate?: string;
  verificationDocumentUrl?: string;
}

const toCamelCaseResource = (resource: any): LearningResource => {
  if (!resource) return resource;
  return {
    id: resource.id,
    title: resource.title,
    description: resource.description,
    resourceType: resource.resource_type,
    url: resource.url,
    skillId: resource.skill_id,
    difficultyLevel: resource.difficulty_level,
    durationMinutes: resource.duration_minutes,
    free: resource.free,
    externalLink: resource.external_link,
    createdBy: resource.created_by,
    isApproved: resource.is_approved,
    createdAt: resource.created_at,
    updatedAt: resource.updated_at,
  };
};

const toCamelCaseProgress = (progress: any): UserLearningProgress => {
  if (!progress) return progress;
  return {
    id: progress.id,
    userId: progress.user_id,
    resourceId: progress.resource_id,
    status: progress.status,
    progressPercentage: progress.progress_percentage,
    startedDate: progress.started_date,
    completedDate: progress.completed_date,
    notes: progress.notes,
    rating: progress.rating,
    createdAt: progress.created_at,
    updatedAt: progress.updated_at,
  };
};

const toCamelCaseCertification = (cert: any): Certification => {
  if (!cert) return cert;
  return {
    id: cert.id,
    title: cert.title,
    description: cert.description,
    issuingOrganization: cert.issuing_organization,
    skillId: cert.skill_id,
    difficultyLevel: cert.difficulty_level,
    validityPeriodMonths: cert.validity_period_months,
    cost: cert.cost,
    examRequired: cert.exam_required,
    createdAt: cert.created_at,
    updatedAt: cert.updated_at,
  };
};

const toCamelCaseUserCertification = (userCert: any): UserCertification => {
  if (!userCert) return userCert;
  return {
    id: userCert.id,
    userId: userCert.user_id,
    certificationId: userCert.certification_id,
    certificationNumber: userCert.certification_number,
    issuedDate: userCert.issued_date,
    expiryDate: userCert.expiry_date,
    verified: userCert.verified,
    verificationDocumentUrl: userCert.verification_document_url,
    createdAt: userCert.created_at,
    updatedAt: userCert.updated_at,
  };
};

const toCamelCasePath = (path: any): LearningPath => {
  if (!path) return path;
  return {
    id: path.id,
    title: path.title,
    description: path.description,
    category: path.category,
    targetRole: path.target_role,
    difficulty: path.difficulty,
    estimatedDurationHours: path.estimated_duration_hours,
    skillsCovered: path.skills_covered,
    resourcesIncluded: path.resources_included,
    createdBy: path.created_by,
    isFeatured: path.is_featured,
    createdAt: path.created_at,
    updatedAt: path.updated_at,
  };
};

export const learningService = {
  // ==================== LEARNING RESOURCES ====================
  
  async getAllResources(filters?: {
    resourceType?: string;
    skillId?: number;
    difficultyLevel?: string;
    free?: boolean;
  }): Promise<LearningResource[]> {
    const connection = getConnection();
    let query = 'SELECT * FROM learning_resources WHERE is_approved = TRUE';
    const params: any[] = [];

    if (filters?.resourceType) {
      query += ' AND resource_type = ?';
      params.push(filters.resourceType);
    }

    if (filters?.skillId) {
      query += ' AND skill_id = ?';
      params.push(filters.skillId);
    }

    if (filters?.difficultyLevel) {
      query += ' AND difficulty_level = ?';
      params.push(filters.difficultyLevel);
    }

    if (filters?.free !== undefined) {
      query += ' AND free = ?';
      params.push(filters.free);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await connection.execute<RowDataPacket[]>(query, params);
    return rows.map(toCamelCaseResource);
  },

  async getResourceById(id: number): Promise<LearningResource | null> {
    const connection = getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM learning_resources WHERE id = ? AND is_approved = TRUE',
      [id]
    );

    if (rows.length === 0) return null;
    return toCamelCaseResource(rows[0]);
  },

  async getUserProgress(resourceId: number, userId: number): Promise<UserLearningProgress | null> {
    const connection = getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM user_learning_progress WHERE resource_id = ? AND user_id = ?',
      [resourceId, userId]
    );

    if (rows.length === 0) return null;
    return toCamelCaseProgress(rows[0]);
  },

  async updateProgress(userId: number, resourceId: number, data: {
    status?: 'Not Started' | 'In Progress' | 'Completed';
    progressPercentage?: number;
    notes?: string;
    rating?: number;
  }): Promise<UserLearningProgress> {
    const connection = getConnection();
    
    const updates: string[] = [];
    const params: any[] = [];

    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
      
      if (data.status === 'In Progress' && !params.find(p => p === 'started_date')) {
        updates.push('started_date = COALESCE(started_date, CURRENT_TIMESTAMP)');
      }
      
      if (data.status === 'Completed') {
        updates.push('completed_date = CURRENT_TIMESTAMP');
      }
    }

    if (data.progressPercentage !== undefined) {
      updates.push('progress_percentage = ?');
      params.push(data.progressPercentage);
    }

    if (data.notes !== undefined) {
      updates.push('notes = ?');
      params.push(data.notes);
    }

    if (data.rating !== undefined) {
      updates.push('rating = ?');
      params.push(data.rating);
    }

    // Check if progress exists
    const existing = await this.getUserProgress(resourceId, userId);
    
    if (!existing) {
      // Create new progress record
      const [result] = await connection.execute<OkPacket>(
        `INSERT INTO user_learning_progress (user_id, resource_id, status, progress_percentage, notes, rating)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          resourceId,
          data.status || 'Not Started',
          data.progressPercentage || 0,
          data.notes || null,
          data.rating || null,
        ]
      );
      
      const newProgress = await this.getUserProgress(resourceId, userId);
      if (!newProgress) throw new Error('Failed to create progress');
      return newProgress;
    } else {
      // Update existing progress
      params.push(userId, resourceId);
      
      await connection.execute(
        `UPDATE user_learning_progress 
         SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ? AND resource_id = ?`,
        params
      );
      
      const updated = await this.getUserProgress(resourceId, userId);
      if (!updated) throw new Error('Failed to update progress');
      return updated;
    }
  },

  // ==================== CERTIFICATIONS ====================

  async getAllCertifications(filters?: {
    skillId?: number;
    difficultyLevel?: string;
  }): Promise<Certification[]> {
    const connection = getConnection();
    let query = 'SELECT * FROM certifications WHERE 1=1';
    const params: any[] = [];

    if (filters?.skillId) {
      query += ' AND skill_id = ?';
      params.push(filters.skillId);
    }

    if (filters?.difficultyLevel) {
      query += ' AND difficulty_level = ?';
      params.push(filters.difficultyLevel);
    }

    query += ' ORDER BY title ASC';

    const [rows] = await connection.execute<RowDataPacket[]>(query, params);
    return rows.map(toCamelCaseCertification);
  },

  async getUserCertifications(userId: number): Promise<Array<UserCertification & { certification: Certification }>> {
    const connection = getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        uc.*,
        c.*
       FROM user_certifications uc
       INNER JOIN certifications c ON uc.certification_id = c.id
       WHERE uc.user_id = ?
       ORDER BY uc.issued_date DESC`,
      [userId]
    );

    return rows.map((row: any) => ({
      ...toCamelCaseUserCertification({
        id: row.id,
        user_id: row.user_id,
        certification_id: row.certification_id,
        certification_number: row.certification_number,
        issued_date: row.issued_date,
        expiry_date: row.expiry_date,
        verified: row.verified,
        verification_document_url: row.verification_document_url,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }),
      certification: toCamelCaseCertification({
        id: row.certification_id,
        title: row.title,
        description: row.description,
        issuing_organization: row.issuing_organization,
        skill_id: row.cert_skill_id || row.skill_id,
        difficulty_level: row.difficulty_level,
        validity_period_months: row.validity_period_months,
        cost: row.cost,
        exam_required: row.exam_required,
        created_at: row.cert_created_at || row.created_at,
        updated_at: row.cert_updated_at || row.updated_at,
      }),
    }));
  },

  async addUserCertification(userId: number, data: CreateUserCertificationData): Promise<UserCertification> {
    const connection = getConnection();
    const [result] = await connection.execute<OkPacket>(
      `INSERT INTO user_certifications (user_id, certification_id, certification_number, issued_date, expiry_date, verification_document_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        data.certificationId,
        data.certificationNumber || null,
        data.issuedDate,
        data.expiryDate || null,
        data.verificationDocumentUrl || null,
      ]
    );

    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM user_certifications WHERE id = ?',
      [result.insertId]
    );

    if (rows.length === 0) throw new Error('Failed to create user certification');
    return toCamelCaseUserCertification(rows[0]);
  },

  // ==================== LEARNING PATHS ====================

  async getAllPaths(filters?: {
    category?: string;
    targetRole?: string;
    difficulty?: string;
  }): Promise<LearningPath[]> {
    const connection = getConnection();
    let query = 'SELECT * FROM learning_paths WHERE 1=1';
    const params: any[] = [];

    if (filters?.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters?.targetRole) {
      query += ' AND target_role = ?';
      params.push(filters.targetRole);
    }

    if (filters?.difficulty) {
      query += ' AND difficulty = ?';
      params.push(filters.difficulty);
    }

    query += ' ORDER BY is_featured DESC, created_at DESC';

    const [rows] = await connection.execute<RowDataPacket[]>(query, params);
    return rows.map(toCamelCasePath);
  },

  async getPathById(id: number): Promise<LearningPath | null> {
    const connection = getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM learning_paths WHERE id = ?',
      [id]
    );

    if (rows.length === 0) return null;
    return toCamelCasePath(rows[0]);
  },

  // ==================== STATISTICS ====================

  async getLearningStats(userId: number): Promise<{
    totalResourcesStarted: number;
    totalResourcesCompleted: number;
    totalCertifications: number;
    certificationsExpiringSoon: number;
    averageRating: number;
  }> {
    const connection = getConnection();
    
    const [stats] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        COUNT(*) as total,
        AVG(rating) as avg_rating
       FROM user_learning_progress
       WHERE user_id = ?`,
      [userId]
    );

    const [certStats] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 MONTH) THEN 1 ELSE 0 END) as expiring_soon
       FROM user_certifications
       WHERE user_id = ?`,
      [userId]
    );

    const statsData = stats[0];
    const certData = certStats[0];

    return {
      totalResourcesStarted: statsData.total || 0,
      totalResourcesCompleted: statsData.completed || 0,
      totalCertifications: certData.total || 0,
      certificationsExpiringSoon: certData.expiring_soon || 0,
      averageRating: Math.round((statsData.avg_rating || 0) * 10) / 10,
    };
  },
};

