import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { AuthRequest, JWTPayload, ApiResponse } from '../types';

/**
 * Authentication middleware - Verifies JWT token and adds user to request
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token required'
      });
    }

    if (!process.env.JWT_SECRET) {
      console.warn('JWT_SECRET is not configured - using default secret (INSECURE)');
      process.env.JWT_SECRET = 'default-insecure-secret-change-in-production';
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.userId,
        status: 'ACTIVE'
      },
      select: { 
        id: true, 
        email: true, 
        role: true, 
        name: true 
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Role-based authorization middleware
 * @param roles - Array of allowed roles
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Optional authentication - adds user to request if token provided
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    if (token) {
      if (!process.env.JWT_SECRET) {
        console.warn('JWT_SECRET is not configured - using default secret (INSECURE)');
        process.env.JWT_SECRET = 'default-insecure-secret-change-in-production';
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
      
      const user = await prisma.user.findUnique({
        where: { 
          id: decoded.userId,
          status: 'ACTIVE'
        },
        select: { 
          id: true, 
          email: true, 
          role: true, 
          name: true 
        }
      });

      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};