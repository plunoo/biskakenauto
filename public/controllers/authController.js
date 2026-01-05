import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.js';
import { UserRole } from '../types/index.js';
export const authController = {
    async register(req, res) {
        try {
            const { name, email, phone, password, role = UserRole.STAFF } = req.body;
            const userCount = await prisma.user.count();
            const isFirstUser = userCount === 0;
            const userRole = isFirstUser ? UserRole.ADMIN : role;
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
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
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
            if (!process.env.JWT_SECRET) {
                console.warn('JWT_SECRET is not configured - using default secret (INSECURE)');
                process.env.JWT_SECRET = 'default-insecure-secret-change-in-production';
            }
            const payload = { userId: user.id, role: user.role };
            const secret = process.env.JWT_SECRET;
            const options = { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') };
            const token = jwt.sign(payload, secret, options);
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
    async login(req, res) {
        try {
            const { email, password } = req.body;
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
            if (user.status !== 'ACTIVE') {
                return res.status(401).json({
                    success: false,
                    error: 'Account is deactivated. Please contact administrator.'
                });
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
            }
            if (!process.env.JWT_SECRET) {
                console.warn('JWT_SECRET is not configured - using default secret (INSECURE)');
                process.env.JWT_SECRET = 'default-insecure-secret-change-in-production';
            }
            const payload = { userId: user.id, role: user.role };
            const secret = process.env.JWT_SECRET;
            const options = { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') };
            const token = jwt.sign(payload, secret, options);
            const { password: _, ...userResponse } = user;
            await prisma.activityLog.create({
                data: {
                    userId: user.id,
                    action: 'LOGIN',
                    entityType: 'USER',
                    entityId: user.id,
                    details: JSON.stringify({
                        email,
                        timestamp: new Date().toISOString(),
                        userAgent: req.headers['user-agent']
                    })
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
    async adminLogin(req, res) {
        try {
            const { email, password } = req.body;
            const adminEmail = process.env.ADMIN_EMAIL || 'admin@biskaken.com';
            const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
            const adminName = process.env.ADMIN_NAME || 'Admin User';
            if (email !== adminEmail || password !== adminPassword) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid admin credentials'
                });
            }
            if (!process.env.JWT_SECRET) {
                console.warn('JWT_SECRET is not configured - using default secret (INSECURE)');
                process.env.JWT_SECRET = 'default-insecure-secret-change-in-production';
            }
            const adminUser = {
                id: 'admin-env',
                name: adminName,
                email: adminEmail,
                phone: null,
                role: UserRole.ADMIN,
                status: 'ACTIVE',
                createdAt: new Date()
            };
            const payload = { userId: adminUser.id, role: adminUser.role };
            const secret = process.env.JWT_SECRET;
            const options = { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') };
            const token = jwt.sign(payload, secret, options);
            res.json({
                success: true,
                data: {
                    user: adminUser,
                    token
                },
                message: 'Admin login successful'
            });
        }
        catch (error) {
            console.error('Admin login error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    async me(req, res) {
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
        }
        catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    async changePassword(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }
            const { currentPassword, newPassword } = req.body;
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
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                return res.status(400).json({
                    success: false,
                    error: 'Current password is incorrect'
                });
            }
            const saltRounds = 12;
            const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
            await prisma.user.update({
                where: { id: req.user.id },
                data: { password: hashedNewPassword }
            });
            await prisma.activityLog.create({
                data: {
                    userId: req.user.id,
                    action: 'PASSWORD_CHANGE',
                    entityType: 'USER',
                    entityId: req.user.id,
                    details: JSON.stringify({
                        timestamp: new Date().toISOString()
                    })
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
    async logout(req, res) {
        try {
            if (req.user) {
                await prisma.activityLog.create({
                    data: {
                        userId: req.user.id,
                        action: 'LOGOUT',
                        entityType: 'USER',
                        entityId: req.user.id,
                        details: JSON.stringify({
                            timestamp: new Date().toISOString()
                        })
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
