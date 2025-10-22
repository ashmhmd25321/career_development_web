import { getConnection } from '../database/connection';
import { RowDataPacket } from 'mysql2';
import { JobBookmark, CreateBookmarkData } from '../types';

const toCamelCase = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (typeof obj !== 'object') return obj;

  const camelCaseObj: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

    // Handle date fields specially
    if (camelKey === 'createdAt' || camelKey === 'applicationDeadline') {
      camelCaseObj[camelKey] = value ? new Date(value as string) : null;
    } else {
      camelCaseObj[camelKey] = toCamelCase(value);
    }
  }
  return camelCaseObj;
};

export const bookmarkService = {
  async findByUserId(userId: number): Promise<JobBookmark[]> {
    const connection = getConnection();

    const query = `
      SELECT
        b.id, b.user_id as userId, b.job_id as jobId, b.created_at as createdAt,
        j.title as jobTitle, ep.company_name as companyName, j.location, j.job_type as jobType,
        j.experience_level as experienceLevel, j.salary_min as salaryMin, j.salary_max as salaryMax, 
        j.salary_currency as salaryCurrency, j.description, jc.name as categoryName,
        j.is_active as isActive, j.application_deadline as applicationDeadline
      FROM job_bookmarks b
      LEFT JOIN jobs j ON b.job_id = j.id
      LEFT JOIN employer_profiles ep ON j.employer_id = ep.user_id
      LEFT JOIN job_categories jc ON j.category_id = jc.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `;

    const [rows] = await connection.execute<RowDataPacket[]>(query, [userId]);
    return (rows as any[]).map(toCamelCase);
  },

  async findById(bookmarkId: number): Promise<JobBookmark | null> {
    const connection = getConnection();

    const query = `
      SELECT
        b.id, b.user_id as userId, b.job_id as jobId, b.created_at as createdAt,
        j.title as jobTitle, ep.company_name as companyName, j.location, j.job_type as jobType,
        j.experience_level as experienceLevel, j.salary_min as salaryMin, j.salary_max as salaryMax, 
        j.salary_currency as salaryCurrency, j.description, jc.name as categoryName,
        j.is_active as isActive, j.application_deadline as applicationDeadline
      FROM job_bookmarks b
      LEFT JOIN jobs j ON b.job_id = j.id
      LEFT JOIN employer_profiles ep ON j.employer_id = ep.user_id
      LEFT JOIN job_categories jc ON j.category_id = jc.id
      WHERE b.id = ?
    `;

    const [rows] = await connection.execute<RowDataPacket[]>(query, [bookmarkId]);
    const bookmarks = (rows as any[]).map(toCamelCase);
    return bookmarks.length > 0 ? bookmarks[0] : null;
  },

  async createBookmark(bookmarkData: CreateBookmarkData & { userId: number }): Promise<JobBookmark> {
    const connection = getConnection();

    // Check if bookmark already exists
    const existingBookmark = await connection.execute(
      'SELECT id FROM job_bookmarks WHERE user_id = ? AND job_id = ?',
      [bookmarkData.userId, bookmarkData.jobId]
    );

    if ((existingBookmark[0] as any[]).length > 0) {
      throw new Error('Job is already bookmarked');
    }

    const query = `
      INSERT INTO job_bookmarks (user_id, job_id, created_at)
      VALUES (?, ?, NOW())
    `;

    const [result] = await connection.execute(query, [
      bookmarkData.userId,
      bookmarkData.jobId
    ]);

    const bookmarkId = (result as any).insertId;
    return (await this.findById(bookmarkId))!;
  },

  async deleteBookmark(bookmarkId: number, userId: number): Promise<void> {
    const connection = getConnection();

    // Check if bookmark exists and belongs to user
    const [rows] = await connection.execute(
      'SELECT id FROM job_bookmarks WHERE id = ? AND user_id = ?',
      [bookmarkId, userId]
    );

    if ((rows as any[]).length === 0) {
      throw new Error('Bookmark not found or you do not have permission to delete it');
    }

    // Delete the bookmark
    await connection.execute(
      'DELETE FROM job_bookmarks WHERE id = ? AND user_id = ?',
      [bookmarkId, userId]
    );
  },

  async deleteBookmarkByJobId(jobId: number, userId: number): Promise<void> {
    const connection = getConnection();

    // Delete the bookmark by job ID
    await connection.execute(
      'DELETE FROM job_bookmarks WHERE job_id = ? AND user_id = ?',
      [jobId, userId]
    );
  },

  async isBookmarked(jobId: number, userId: number): Promise<boolean> {
    const connection = getConnection();

    const [rows] = await connection.execute(
      'SELECT id FROM job_bookmarks WHERE job_id = ? AND user_id = ?',
      [jobId, userId]
    );

    return (rows as any[]).length > 0;
  },

  async getBookmarkCount(jobId: number): Promise<number> {
    const connection = getConnection();

    const [rows] = await connection.execute(
      'SELECT COUNT(*) as count FROM job_bookmarks WHERE job_id = ?',
      [jobId]
    );

    return (rows as any[])[0].count;
  }
};
