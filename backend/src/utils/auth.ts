import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { logger } from './logger';

interface TokenPayload {
  userId: number;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

export class AuthUtils {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
  private static readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
  private static readonly ACCESS_TOKEN_EXPIRY = '7d';
  private static readonly REFRESH_TOKEN_EXPIRY = '30d';

  /**
   * Generate access token
   */
  static generateAccessToken(userId: number, email: string, role: string): string {
    const payload: TokenPayload = {
      userId,
      email,
      role,
      type: 'access'
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
      issuer: 'careerflow-pro',
      audience: 'careerflow-pro-users'
    });
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(userId: number, email: string, role: string): string {
    const payload: TokenPayload = {
      userId,
      email,
      role,
      type: 'refresh'
    };

    return jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
      issuer: 'careerflow-pro',
      audience: 'careerflow-pro-users'
    });
  }

  /**
   * Generate token pair (access + refresh)
   */
  static generateTokenPair(userId: number, email: string, role: string): {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  } {
    const accessToken = this.generateAccessToken(userId, email, role);
    const refreshToken = this.generateRefreshToken(userId, email, role);
    
    // Calculate expiry time in seconds (7 days)
    const expiresIn = 7 * 24 * 60 * 60;

    return {
      accessToken,
      refreshToken,
      expiresIn
    };
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.JWT_REFRESH_SECRET) as TokenPayload;
      
      if (decoded.type !== 'refresh') {
        return null;
      }

      return decoded;
    } catch (error) {
      logger.error('Refresh token verification failed:', error);
      return null;
    }
  }

  /**
   * Generate email verification token
   */
  static generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate password reset token
   */
  static generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash token for storage (for security)
   */
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generate secure random string
   */
  static generateSecureRandom(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}
