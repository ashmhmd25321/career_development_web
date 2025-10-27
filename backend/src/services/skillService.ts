import { RowDataPacket, OkPacket } from 'mysql2/promise';
import { getConnection } from '@/database/connection';
import { logger } from '@/utils/logger';

export interface Skill {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  createdAt: string;
  updatedAt: string;
}

export interface UserSkill {
  id: number;
  userId: number;
  skillId: number;
  proficiencyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  experienceYears: number;
  certified: boolean;
  certificationDate: string | null;
  selfAssessed: boolean;
  assessmentDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSkillData {
  name: string;
  description?: string;
  category?: string;
  difficultyLevel?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface CreateUserSkillData {
  skillId: number;
  proficiencyLevel?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  experienceYears?: number;
  certified?: boolean;
  certificationDate?: string;
  notes?: string;
}

export interface SkillWithUserData extends Skill {
  userSkill?: UserSkill;
}

const toCamelCaseSkill = (skill: any): Skill => {
  if (!skill) return skill;
  return {
    id: skill.id,
    name: skill.name,
    description: skill.description,
    category: skill.category,
    difficultyLevel: skill.difficulty_level,
    createdAt: skill.created_at,
    updatedAt: skill.updated_at,
  };
};

const toCamelCaseUserSkill = (userSkill: any): UserSkill => {
  if (!userSkill) return userSkill;
  return {
    id: userSkill.id,
    userId: userSkill.user_id,
    skillId: userSkill.skill_id,
    proficiencyLevel: userSkill.proficiency_level,
    experienceYears: userSkill.experience_years,
    certified: userSkill.certified,
    certificationDate: userSkill.certification_date,
    selfAssessed: userSkill.self_assessed,
    assessmentDate: userSkill.assessment_date,
    notes: userSkill.notes,
    createdAt: userSkill.created_at,
    updatedAt: userSkill.updated_at,
  };
};

export const skillService = {
  // Get all skills
  async findAll(filters?: { category?: string; difficultyLevel?: string }): Promise<Skill[]> {
    const connection = getConnection();
    let query = 'SELECT * FROM skills WHERE 1=1';
    const params: any[] = [];

    if (filters?.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters?.difficultyLevel) {
      query += ' AND difficulty_level = ?';
      params.push(filters.difficultyLevel);
    }

    query += ' ORDER BY name ASC';

    const [rows] = await connection.execute<RowDataPacket[]>(query, params);
    return rows.map(toCamelCaseSkill);
  },

  // Get skill by ID
  async findById(id: number): Promise<Skill | null> {
    const connection = getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM skills WHERE id = ?',
      [id]
    );

    if (rows.length === 0) return null;
    return toCamelCaseSkill(rows[0]);
  },

  // Create a new skill (Admin only)
  async createSkill(data: CreateSkillData): Promise<Skill> {
    const connection = getConnection();
    const [result] = await connection.execute<OkPacket>(
      'INSERT INTO skills (name, description, category, difficulty_level) VALUES (?, ?, ?, ?)',
      [data.name, data.description || null, data.category || null, data.difficultyLevel || 'Beginner']
    );

    const newSkill = await this.findById(result.insertId);
    if (!newSkill) throw new Error('Failed to create skill');
    return newSkill;
  },

  // Get user's skills
  async getUserSkills(userId: number): Promise<SkillWithUserData[]> {
    const connection = getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT 
        s.*,
        us.id as user_skill_id,
        us.user_id,
        us.skill_id,
        us.proficiency_level,
        us.experience_years,
        us.certified,
        us.certification_date,
        us.self_assessed,
        us.assessment_date,
        us.notes,
        us.created_at as user_skill_created_at,
        us.updated_at as user_skill_updated_at
      FROM skills s
      LEFT JOIN user_skills us ON s.id = us.skill_id AND us.user_id = ?
      ORDER BY us.updated_at DESC, s.name ASC`,
      [userId]
    );

    return rows.map((row: any) => {
      const skill = toCamelCaseSkill(row);
      const userSkill = row.user_skill_id ? toCamelCaseUserSkill({
        id: row.user_skill_id,
        user_id: row.user_id,
        skill_id: row.skill_id,
        proficiency_level: row.proficiency_level,
        experience_years: row.experience_years,
        certified: row.certified,
        certification_date: row.certification_date,
        self_assessed: row.self_assessed,
        assessment_date: row.assessment_date,
        notes: row.notes,
        created_at: row.user_skill_created_at,
        updated_at: row.user_skill_updated_at,
      }) : undefined;

      return { ...skill, userSkill };
    });
  },

  // Add a skill to user's profile
  async addUserSkill(userId: number, data: CreateUserSkillData): Promise<UserSkill> {
    const connection = getConnection();
    const [result] = await connection.execute<OkPacket>(
      `INSERT INTO user_skills (user_id, skill_id, proficiency_level, experience_years, certified, certification_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       proficiency_level = VALUES(proficiency_level),
       experience_years = VALUES(experience_years),
       certified = VALUES(certified),
       certification_date = VALUES(certification_date),
       notes = VALUES(notes),
       updated_at = CURRENT_TIMESTAMP`,
      [
        userId,
        data.skillId,
        data.proficiencyLevel || 'Beginner',
        data.experienceYears || 0,
        data.certified || false,
        data.certificationDate || null,
        data.notes || null,
      ]
    );

    const userSkill = await this.getUserSkillById(result.insertId || data.skillId, userId);
    if (!userSkill) throw new Error('Failed to add user skill');
    return userSkill;
  },

  // Update user's skill
  async updateUserSkill(userId: number, skillId: number, data: Partial<CreateUserSkillData>): Promise<UserSkill> {
    const connection = getConnection();
    
    const updates: string[] = [];
    const params: any[] = [];

    if (data.proficiencyLevel !== undefined) {
      updates.push('proficiency_level = ?');
      params.push(data.proficiencyLevel);
    }

    if (data.experienceYears !== undefined) {
      updates.push('experience_years = ?');
      params.push(data.experienceYears);
    }

    if (data.certified !== undefined) {
      updates.push('certified = ?');
      params.push(data.certified);
    }

    if (data.certificationDate !== undefined) {
      updates.push('certification_date = ?');
      params.push(data.certificationDate);
    }

    if (data.notes !== undefined) {
      updates.push('notes = ?');
      params.push(data.notes);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    params.push(userId, skillId);

    await connection.execute(
      `UPDATE user_skills 
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ? AND skill_id = ?`,
      params
    );

    const updatedSkill = await this.getUserSkill(skillId, userId);
    if (!updatedSkill) throw new Error('Failed to update user skill');
    return updatedSkill;
  },

  // Assess skill (mark as self-assessed)
  async assessSkill(userId: number, skillId: number): Promise<UserSkill> {
    const connection = getConnection();
    
    await connection.execute(
      `UPDATE user_skills 
       SET self_assessed = TRUE, assessment_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ? AND skill_id = ?`,
      [userId, skillId]
    );

    const userSkill = await this.getUserSkill(skillId, userId);
    if (!userSkill) throw new Error('Failed to assess skill');
    return userSkill;
  },

  // Remove user's skill
  async removeUserSkill(userId: number, skillId: number): Promise<void> {
    const connection = getConnection();
    await connection.execute(
      'DELETE FROM user_skills WHERE user_id = ? AND skill_id = ?',
      [userId, skillId]
    );
  },

  // Get specific user skill
  async getUserSkill(skillId: number, userId: number): Promise<UserSkill | null> {
    const connection = getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM user_skills WHERE skill_id = ? AND user_id = ?',
      [skillId, userId]
    );

    if (rows.length === 0) return null;
    return toCamelCaseUserSkill(rows[0]);
  },

  // Get user skill by ID
  async getUserSkillById(userSkillId: number, userId: number): Promise<UserSkill | null> {
    const connection = getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM user_skills WHERE id = ? AND user_id = ?',
      [userSkillId, userId]
    );

    if (rows.length === 0) return null;
    return toCamelCaseUserSkill(rows[0]);
  },

  // Get skill categories
  async getCategories(): Promise<string[]> {
    const connection = getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT DISTINCT category FROM skills WHERE category IS NOT NULL ORDER BY category'
    );

    return rows.map(row => row.category);
  },

  // Get skills by category
  async findByCategory(category: string): Promise<Skill[]> {
    const connection = getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM skills WHERE category = ? ORDER BY name ASC',
      [category]
    );

    return rows.map(toCamelCaseSkill);
  },

  // Get recommended skills for user
  async getRecommendedSkills(userId: number, limit: number = 10): Promise<Skill[]> {
    const connection = getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT s.*, COUNT(us.id) as user_count
       FROM skills s
       LEFT JOIN user_skills us ON s.id = us.skill_id
       WHERE s.id NOT IN (SELECT skill_id FROM user_skills WHERE user_id = ?)
       GROUP BY s.id
       ORDER BY user_count DESC, s.name ASC
       LIMIT ?`,
      [userId, limit]
    );

    return rows.map(toCamelCaseSkill);
  },
};

