import { RowDataPacket, FieldPacket, OkPacket } from 'mysql2/promise';
import { getConnection } from '@/database/connection';
import { JobCategory, CreateJobCategoryData, UpdateJobCategoryData } from '@/types';
import { logger } from '@/utils/logger';

// Helper function to convert snake_case to camelCase for category objects
const toCamelCase = (category: any): JobCategory => {
  if (!category) return category;
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    isActive: category.is_active,
    createdAt: category.created_at,
    updatedAt: category.updated_at,
  };
};

export const jobCategoryService = {
  async findAll(): Promise<JobCategory[]> {
    const connection = getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM job_categories WHERE is_active = TRUE ORDER BY name ASC'
    );
    return rows.map(toCamelCase);
  },

  async findById(id: number): Promise<JobCategory | null> {
    const connection = getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM job_categories WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return null;
    return toCamelCase(rows[0]);
  },

  async createCategory(categoryData: CreateJobCategoryData): Promise<JobCategory> {
    const connection = getConnection();
    const { name, description } = categoryData;

    const [result] = await connection.execute<OkPacket>(
      'INSERT INTO job_categories (name, description, is_active) VALUES (?, ?, ?)',
      [name, description || null, true]
    );

    const newCategory = await this.findById(result.insertId);
    if (!newCategory) {
      throw new Error('Failed to retrieve new category after creation.');
    }
    
    logger.info(`New job category created: ${name} (ID: ${result.insertId})`);
    return newCategory;
  },

  async updateCategory(id: number, categoryData: UpdateJobCategoryData): Promise<JobCategory | null> {
    const connection = getConnection();
    const fields: string[] = [];
    const values: any[] = [];

    if (categoryData.name !== undefined) {
      fields.push('name = ?');
      values.push(categoryData.name);
    }
    if (categoryData.description !== undefined) {
      fields.push('description = ?');
      values.push(categoryData.description);
    }
    if (categoryData.isActive !== undefined) {
      fields.push('is_active = ?');
      values.push(categoryData.isActive);
    }

    if (fields.length === 0) {
      return this.findById(id); // No fields to update
    }

    values.push(id);

    const query = `UPDATE job_categories SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await connection.execute(query, values);

    logger.info(`Job category updated: ID ${id}`);
    return this.findById(id);
  },

  async deleteCategory(id: number): Promise<boolean> {
    const connection = getConnection();
    const [result] = await connection.execute<OkPacket>(
      'UPDATE job_categories SET is_active = FALSE WHERE id = ?',
      [id]
    );
    
    logger.info(`Job category deactivated: ID ${id}`);
    return result.affectedRows > 0;
  },
};
