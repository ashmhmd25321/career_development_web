import { OkPacket, RowDataPacket } from 'mysql2';
import { getConnection } from '@/database/connection';

export const employerProfileService = {
  async getByUserId(userId: number): Promise<any | null> {
    const connection = getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT user_id, company_name, company_size, industry, website_url, company_description, logo_url,
              address, city, state, country, postal_code, linkedin_url, is_verified, created_at, updated_at
       FROM employer_profiles WHERE user_id = ?`,
      [userId]
    );
    return rows.length ? rows[0] : null;
  },
  async upsertCompanyName(userId: number, companyName: string): Promise<void> {
    const connection = getConnection();

    // Check if profile exists
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT id FROM employer_profiles WHERE user_id = ?',
      [userId]
    );

    if (rows.length === 0) {
      await connection.execute<OkPacket>(
        `INSERT INTO employer_profiles (user_id, company_name, company_size, is_verified, created_at, updated_at)
         VALUES (?, ?, '50-200', FALSE, NOW(), NOW())`,
        [userId, companyName]
      );
    } else {
      await connection.execute<OkPacket>(
        `UPDATE employer_profiles SET company_name = ?, updated_at = NOW() WHERE user_id = ?`,
        [companyName, userId]
      );
    }
  }
};


