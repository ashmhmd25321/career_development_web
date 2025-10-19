import bcrypt from 'bcryptjs';
import { getConnection } from '@/database/connection';
import { AuthUtils } from '@/utils/auth';
import { logger } from '@/utils/logger';
import { User, CreateUserData, UpdateUserData } from '@/types';

export class UserService {
  /**
   * Create a new user
   */
  static async createUser(userData: CreateUserData): Promise<{ user: User; verificationToken: string }> {
    const connection = getConnection();
    
    try {
      // Check if user already exists
      const [existingUsers] = await connection.query(
        'SELECT id FROM users WHERE email = ?',
        [userData.email]
      );

      if (Array.isArray(existingUsers) && existingUsers.length > 0) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Generate verification token
      const verificationToken = AuthUtils.generateEmailVerificationToken();
      const hashedVerificationToken = AuthUtils.hashToken(verificationToken);

      // Create user
      const [result] = await connection.query(
        `INSERT INTO users (
          email, password_hash, first_name, last_name, role, 
          is_active, is_verified, email_verification_token
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userData.email,
          hashedPassword,
          userData.firstName,
          userData.lastName,
          userData.role || 'student',
          true,
          false,
          hashedVerificationToken
        ]
      );

      const insertResult = result as any;
      const userId = insertResult.insertId;

      // Get the created user
      const [users] = await connection.query(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );

      const user = (users as any[])[0];
      
      // Remove sensitive data
      delete user.password_hash;
      delete user.email_verification_token;
      delete user.password_reset_token;
      delete user.password_reset_expires;

      logger.info(`New user created: ${user.email} (ID: ${userId})`);

      return {
        user: this.formatUser(user),
        verificationToken
      };
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Authenticate user login
   */
  static async authenticateUser(email: string, password: string): Promise<User | null> {
    const connection = getConnection();
    
    try {
      const [users] = await connection.query(
        'SELECT * FROM users WHERE email = ? AND is_active = true',
        [email]
      );

      if (!Array.isArray(users) || users.length === 0) {
        return null;
      }

      const user = (users as any)[0];
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        return null;
      }

      // Remove sensitive data
      delete user.password_hash;
      delete user.email_verification_token;
      delete user.password_reset_token;
      delete user.password_reset_expires;

      return this.formatUser(user);
    } catch (error) {
      logger.error('Error authenticating user:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: number): Promise<User | null> {
    const connection = getConnection();
    
    try {
      const [users] = await connection.query(
        'SELECT * FROM users WHERE id = ? AND is_active = true',
        [userId]
      );

      if (!Array.isArray(users) || users.length === 0) {
        return null;
      }

      const user = (users as any)[0];
      
      // Remove sensitive data
      delete user.password_hash;
      delete user.email_verification_token;
      delete user.password_reset_token;
      delete user.password_reset_expires;

      return this.formatUser(user);
    } catch (error) {
      logger.error('Error getting user by ID:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateUser(userId: number, updateData: UpdateUserData): Promise<User | null> {
    const connection = getConnection();
    
    try {
      const updateFields: string[] = [];
      const values: any[] = [];

      if (updateData.firstName !== undefined) {
        updateFields.push('first_name = ?');
        values.push(updateData.firstName);
      }

      if (updateData.lastName !== undefined) {
        updateFields.push('last_name = ?');
        values.push(updateData.lastName);
      }

      if (updateData.email !== undefined) {
        updateFields.push('email = ?');
        values.push(updateData.email);
      }

      if (updateData.phone !== undefined) {
        updateFields.push('phone = ?');
        values.push(updateData.phone);
      }

      if (updateData.bio !== undefined) {
        updateFields.push('bio = ?');
        values.push(updateData.bio);
      }

      if (updateData.location !== undefined) {
        updateFields.push('location = ?');
        values.push(updateData.location);
      }

      updateFields.push('updated_at = NOW()');
      values.push(userId);

      await connection.query(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      );

      return await this.getUserById(userId);
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Verify email address
   */
  static async verifyEmail(token: string): Promise<boolean> {
    const connection = getConnection();
    
    try {
      const hashedToken = AuthUtils.hashToken(token);
      
      const [users] = await connection.query(
        'SELECT id FROM users WHERE email_verification_token = ? AND is_verified = false',
        [hashedToken]
      );

      if (!Array.isArray(users) || users.length === 0) {
        return false;
      }

      await connection.query(
        'UPDATE users SET is_verified = true, email_verification_token = NULL WHERE email_verification_token = ?',
        [hashedToken]
      );

      logger.info(`Email verified for user with token: ${hashedToken}`);
      return true;
    } catch (error) {
      logger.error('Error verifying email:', error);
      throw error;
    }
  }

  /**
   * Initiate password reset
   */
  static async initiatePasswordReset(email: string): Promise<string | null> {
    const connection = getConnection();
    
    try {
      const [users] = await connection.query(
        'SELECT id FROM users WHERE email = ? AND is_active = true',
        [email]
      );

      if (!Array.isArray(users) || users.length === 0) {
        return null;
      }

      const resetToken = AuthUtils.generatePasswordResetToken();
      const hashedResetToken = AuthUtils.hashToken(resetToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await connection.query(
        'UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE email = ?',
        [hashedResetToken, expiresAt, email]
      );

      logger.info(`Password reset initiated for email: ${email}`);
      return resetToken;
    } catch (error) {
      logger.error('Error initiating password reset:', error);
      throw error;
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const connection = getConnection();
    
    try {
      const hashedToken = AuthUtils.hashToken(token);
      
      const [users] = await connection.query(
        'SELECT id FROM users WHERE password_reset_token = ? AND password_reset_expires > NOW()',
        [hashedToken]
      );

      if (!Array.isArray(users) || users.length === 0) {
        return false;
      }

      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      await connection.query(
        'UPDATE users SET password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE password_reset_token = ?',
        [hashedPassword, hashedToken]
      );

      logger.info(`Password reset completed for user with token: ${hashedToken}`);
      return true;
    } catch (error) {
      logger.error('Error resetting password:', error);
      throw error;
    }
  }

  /**
   * Format user data for response
   */
  private static formatUser(user: any): User {
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      phone: user.phone,
      bio: user.bio,
      location: user.location,
      isActive: user.is_active,
      isVerified: user.is_verified,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }
}
