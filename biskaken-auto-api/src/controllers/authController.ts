import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { AuthRequest, ApiResponse, LoginCredentials, RegisterData, UserRole } from '../types';

/**
 * Authentication Controller
 * Handles user registration, login, and authentication-related operations
 */
export const authController = {
  /**
   * Register new user (Admin setup or staff creation)
   */
  async register(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const { name, email, phone, password, role = UserRole.STAFF }: RegisterData = req.body;

      // Check if this is the first user (admin setup)
      const userCount = await prisma.user.count();
      const isFirstUser = userCount === 0;
      const userRole = isFirstUser ? UserRole.ADMIN : role;

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            ...(phone ? [{ phone }] : [])
          ]
        }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'User with this email or phone already exists'
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          phone,
          password: hashedPassword,
          role: userRole
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true
        }
      });

      // Generate JWT token
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
      }

      const payload = { userId: user.id, role: user.role };
      const secret = process.env.JWT_SECRET as string;
      const options: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any };
      const token = jwt.sign(payload, secret, options);

      res.status(201).json({
        success: true,
        data: {
          user,
          token
        },
        message: `${isFirstUser ? 'Admin' : 'User'} registered successfully`
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * User login
   */
  async login(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const { email, password }: LoginCredentials = req.body;

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          password: true,
          role: true,
          status: true,
          createdAt: true
        }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      // Check if user is active
      if (user.status !== 'ACTIVE') {
        return res.status(401).json({
          success: false,
          error: 'Account is deactivated. Please contact administrator.'
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      // Generate JWT token
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
      }

      const payload = { userId: user.id, role: user.role };
      const secret = process.env.JWT_SECRET as string;
      const options: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any };
      const token = jwt.sign(payload, secret, options);

      // Remove password from response
      const { password: _, ...userResponse } = user;

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN',
          entityType: 'USER',
          entityId: user.id,
          details: {
            email,
            timestamp: new Date().toISOString(),
            userAgent: req.headers['user-agent']
          }
        }
      });

      res.json({
        success: true,
        data: {
          user: userResponse,
          token
        },
        message: 'Login successful'
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Get current user profile
   */
  async me(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error: any) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Change password
   */
  async changePassword(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const { currentPassword, newPassword } = req.body;

      // Get current user with password
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, password: true }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedNewPassword }
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'PASSWORD_CHANGE',
          entityType: 'USER',
          entityId: req.user.id,
          details: {
            timestamp: new Date().toISOString()
          }
        }
      });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error: any) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Logout (optional - mainly for logging purposes)
   */
  async logout(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      if (req.user) {
        // Log activity
        await prisma.activityLog.create({
          data: {
            userId: req.user.id,
            action: 'LOGOUT',
            entityType: 'USER',
            entityId: req.user.id,
            details: {
              timestamp: new Date().toISOString()
            }
          }
        });
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};