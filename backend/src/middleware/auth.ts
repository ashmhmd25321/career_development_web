import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getConnection } from '@/database/connection';
import { logger } from '@/utils/logger';

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    isActive: boolean;
    isVerified: boolean;
  };
}

interface JwtPayload {
  userId: number;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Access token required',
          code: 'MISSING_TOKEN'
        }
      });
      return;
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JwtPayload;
    
    if (decoded.type !== 'access') {
      res.status(401).json({
        success: false,
        error: {
          message: 'Invalid token type',
          code: 'INVALID_TOKEN_TYPE'
        }
      });
      return;
    }

    // Check if user still exists and is active
    const connection = getConnection();
    const [users] = await connection.query(
      'SELECT id, email, role, is_active, is_verified FROM users WHERE id = ? AND is_active = true',
      [decoded.userId]
    );

    if (!Array.isArray(users) || users.length === 0) {
      res.status(401).json({
        success: false,
        error: {
          message: 'User not found or inactive',
          code: 'USER_NOT_FOUND'
        }
      });
      return;
    }

    const user = users[0] as any;
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
      isVerified: user.is_verified
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Invalid or expired token',
          code: 'INVALID_TOKEN'
        }
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Token expired',
          code: 'TOKEN_EXPIRED'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          message: 'Authentication failed',
          code: 'AUTH_ERROR'
        }
      });
    }
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
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

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          message: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS'
        }
      });
      return;
    }

    next();
  };
};

export const requireVerified = (req: AuthRequest, res: Response, next: NextFunction): void => {
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

  if (!req.user.isVerified) {
    res.status(403).json({
      success: false,
      error: {
        message: 'Email verification required',
        code: 'EMAIL_NOT_VERIFIED'
      }
    });
    return;
  }

  next();
};

export { AuthRequest };
