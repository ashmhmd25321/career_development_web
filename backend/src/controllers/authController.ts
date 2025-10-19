import { Request, Response } from 'express';
import { UserService } from '@/services/userService';
import { AuthUtils } from '@/utils/auth';
import { logger } from '@/utils/logger';
import { AuthRequest } from '@/middleware/auth';

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      // Validate required fields
      if (!email || !password || !firstName || !lastName) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Missing required fields: email, password, firstName, lastName',
            code: 'MISSING_FIELDS'
          }
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Invalid email format',
            code: 'INVALID_EMAIL'
          }
        });
        return;
      }

      // Validate password strength
      if (password.length < 8) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Password must be at least 8 characters long',
            code: 'WEAK_PASSWORD'
          }
        });
        return;
      }

      // Validate role
      const validRoles = ['student', 'employer', 'admin'];
      if (role && !validRoles.includes(role)) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Invalid role. Must be one of: student, employer, admin',
            code: 'INVALID_ROLE'
          }
        });
        return;
      }

      const { user, verificationToken } = await UserService.createUser({
        email,
        password,
        firstName,
        lastName,
        role: role || 'student'
      });

      // Generate tokens
      const tokens = AuthUtils.generateTokenPair(user.id, user.email, user.role);

      // TODO: Send verification email with verificationToken
      logger.info(`Verification email should be sent with token: ${verificationToken}`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email for verification.',
        data: {
          user,
          tokens,
          verificationRequired: !user.isVerified
        }
      });
    } catch (error: any) {
      logger.error('Registration error:', error);
      
      if (error.message === 'User with this email already exists') {
        res.status(409).json({
          success: false,
          error: {
            message: 'User with this email already exists',
            code: 'USER_EXISTS'
          }
        });
      } else {
        res.status(500).json({
          success: false,
          error: {
            message: 'Registration failed',
            code: 'REGISTRATION_ERROR'
          }
        });
      }
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Email and password are required',
            code: 'MISSING_CREDENTIALS'
          }
        });
        return;
      }

      const user = await UserService.authenticateUser(email, password);

      if (!user) {
        res.status(401).json({
          success: false,
          error: {
            message: 'Invalid email or password',
            code: 'INVALID_CREDENTIALS'
          }
        });
        return;
      }

      // Generate tokens
      const tokens = AuthUtils.generateTokenPair(user.id, user.email, user.role);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          tokens
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Login failed',
          code: 'LOGIN_ERROR'
        }
      });
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Refresh token is required',
            code: 'MISSING_REFRESH_TOKEN'
          }
        });
        return;
      }

      const decoded = AuthUtils.verifyRefreshToken(refreshToken);

      if (!decoded) {
        res.status(401).json({
          success: false,
          error: {
            message: 'Invalid or expired refresh token',
            code: 'INVALID_REFRESH_TOKEN'
          }
        });
        return;
      }

      // Get current user data
      const user = await UserService.getUserById(decoded.userId);

      if (!user || !user.isActive) {
        res.status(401).json({
          success: false,
          error: {
            message: 'User not found or inactive',
            code: 'USER_NOT_FOUND'
          }
        });
        return;
      }

      // Generate new tokens
      const tokens = AuthUtils.generateTokenPair(user.id, user.email, user.role);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          tokens
        }
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Token refresh failed',
          code: 'REFRESH_ERROR'
        }
      });
    }
  }

  /**
   * Logout user
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      // For JWT tokens, logout is handled on the client side by removing tokens
      // In a more secure implementation, you might maintain a token blacklist
      
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Logout failed',
          code: 'LOGOUT_ERROR'
        }
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            message: 'Authentication required',
            code: 'AUTH_REQUIRED'
          }
        });
        return;
      }

      const user = await UserService.getUserById(req.user.id);

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
            code: 'USER_NOT_FOUND'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: {
          user
        }
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get user profile',
          code: 'PROFILE_ERROR'
        }
      });
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            message: 'Authentication required',
            code: 'AUTH_REQUIRED'
          }
        });
        return;
      }

      const updateData = req.body;
      const user = await UserService.updateUser(req.user.id, updateData);

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
            code: 'USER_NOT_FOUND'
          }
        });
        return;
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user
        }
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to update profile',
          code: 'UPDATE_ERROR'
        }
      });
    }
  }

  /**
   * Verify email address
   */
  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      if (!token) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Verification token is required',
            code: 'MISSING_TOKEN'
          }
        });
        return;
      }

      const success = await UserService.verifyEmail(token);

      if (!success) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Invalid or expired verification token',
            code: 'INVALID_TOKEN'
          }
        });
        return;
      }

      res.json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      logger.error('Email verification error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Email verification failed',
          code: 'VERIFICATION_ERROR'
        }
      });
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Email is required',
            code: 'MISSING_EMAIL'
          }
        });
        return;
      }

      const resetToken = await UserService.initiatePasswordReset(email);

      // Always return success to prevent email enumeration
      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });

      if (resetToken) {
        // TODO: Send password reset email with resetToken
        logger.info(`Password reset email should be sent with token: ${resetToken}`);
      }
    } catch (error) {
      logger.error('Password reset request error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Password reset request failed',
          code: 'RESET_REQUEST_ERROR'
        }
      });
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Token and new password are required',
            code: 'MISSING_FIELDS'
          }
        });
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Password must be at least 8 characters long',
            code: 'WEAK_PASSWORD'
          }
        });
        return;
      }

      const success = await UserService.resetPassword(token, newPassword);

      if (!success) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Invalid or expired reset token',
            code: 'INVALID_TOKEN'
          }
        });
        return;
      }

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      logger.error('Password reset error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Password reset failed',
          code: 'RESET_ERROR'
        }
      });
    }
  }
}
