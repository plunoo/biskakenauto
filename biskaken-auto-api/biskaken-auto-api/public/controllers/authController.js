"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../utils/prisma");
const types_1 = require("../types");
/**
 * Authentication Controller
 * Handles user registration, login, and authentication-related operations
 */
exports.authController = {
    /**
     * Register new user (Admin setup or staff creation)
     */
    async register(req, res) {
        try {
            const { name, email, phone, password, role = types_1.UserRole.STAFF } = req.body;
            // Check if this is the first user (admin setup)
            const userCount = await prisma_1.prisma.user.count();
            const isFirstUser = userCount === 0;
            const userRole = isFirstUser ? types_1.UserRole.ADMIN : role;
            // Check if user already exists
            const existingUser = await prisma_1.prisma.user.findFirst({
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
            const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
            // Create user
            const user = await prisma_1.prisma.user.create({
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
            const secret = process.env.JWT_SECRET;
            const options = { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') };
            const token = jsonwebtoken_1.default.sign(payload, secret, options);
            res.status(201).json({
                success: true,
                data: {
                    user,
                    token
                },
                message: `${isFirstUser ? 'Admin' : 'User'} registered successfully`
            });
        }
        catch (error) {
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
    async login(req, res) {
        try {
            const { email, password } = req.body;
            // Find user by email
            const user = await prisma_1.prisma.user.findUnique({
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
            const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
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
            const secret = process.env.JWT_SECRET;
            const options = { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') };
            const token = jsonwebtoken_1.default.sign(payload, secret, options);
            // Remove password from response
            const { password: _, ...userResponse } = user;
            // Log activity
            await prisma_1.prisma.activityLog.create({
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
        }
        catch (error) {
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
    async me(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }
            const user = await prisma_1.prisma.user.findUnique({
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
        }
        catch (error) {
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
    async changePassword(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }
            const { currentPassword, newPassword } = req.body;
            // Get current user with password
            const user = await prisma_1.prisma.user.findUnique({
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
            const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                return res.status(400).json({
                    success: false,
                    error: 'Current password is incorrect'
                });
            }
            // Hash new password
            const saltRounds = 12;
            const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, saltRounds);
            // Update password
            await prisma_1.prisma.user.update({
                where: { id: req.user.id },
                data: { password: hashedNewPassword }
            });
            // Log activity
            await prisma_1.prisma.activityLog.create({
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
        }
        catch (error) {
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
    async logout(req, res) {
        try {
            if (req.user) {
                // Log activity
                await prisma_1.prisma.activityLog.create({
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
        }
        catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
};
//# sourceMappingURL=authController.js.map