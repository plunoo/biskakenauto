"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const errorHandler_1 = require("../middleware/errorHandler");
const prisma_1 = require("../utils/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const router = (0, express_1.Router)();
/**
 * User Management Routes
 * @base /api/users
 * All routes require Admin authentication
 */
// Apply authentication and admin authorization to all routes
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)('ADMIN'));
// GET /api/users - List all users
router.get('/', (0, validation_1.validate)(validation_1.schemas.pagination), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { page = "1", limit = "20", role, status } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        const where = {};
        if (role)
            where.role = role;
        if (status)
            where.status = status;
        const users = await prisma_1.prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        assignedJobs: true,
                        activityLogs: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take
        });
        const total = await prisma_1.prisma.user.count({ where });
        res.json({
            success: true,
            data: users,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('List users error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));
// POST /api/users - Create new user
router.post('/', (0, validation_1.validate)(validation_1.schemas.register), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { name, email, phone, password, role = 'STAFF' } = req.body;
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
                role: role
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
        // Log activity
        if (req.user) {
            await prisma_1.prisma.activityLog.create({
                data: {
                    userId: req.user.id,
                    action: 'CREATE_USER',
                    entityType: 'USER',
                    entityId: user.id,
                    details: {
                        userName: user.name,
                        userRole: user.role,
                        timestamp: new Date().toISOString()
                    }
                }
            });
        }
        res.status(201).json({
            success: true,
            data: user,
            message: 'User created successfully'
        });
    }
    catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));
// GET /api/users/:id - Get single user
router.get('/:id', (0, validation_1.validate)(validation_1.schemas.uuidParam), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma_1.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                assignedJobs: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        jobNumber: true,
                        status: true,
                        createdAt: true,
                        customer: { select: { name: true } }
                    }
                },
                _count: {
                    select: {
                        assignedJobs: true,
                        activityLogs: true
                    }
                }
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
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));
// PUT /api/users/:id - Update user
router.put('/:id', (0, validation_1.validate)(validation_1.schemas.uuidParam), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, role } = req.body;
        // Check if user exists
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { id }
        });
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        // Prevent admin from changing their own role
        if (req.user?.id === id && role && role !== existingUser.role) {
            return res.status(400).json({
                success: false,
                error: 'Cannot change your own role'
            });
        }
        // Check for email/phone conflicts
        if (email || phone) {
            const conflict = await prisma_1.prisma.user.findFirst({
                where: {
                    id: { not: id },
                    OR: [
                        ...(email ? [{ email }] : []),
                        ...(phone ? [{ phone }] : [])
                    ]
                }
            });
            if (conflict) {
                return res.status(409).json({
                    success: false,
                    error: 'Another user with this email or phone already exists'
                });
            }
        }
        // Update user
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(email && { email }),
                ...(phone && { phone }),
                ...(role && { role: role })
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                updatedAt: true
            }
        });
        // Log activity
        if (req.user) {
            await prisma_1.prisma.activityLog.create({
                data: {
                    userId: req.user.id,
                    action: 'UPDATE_USER',
                    entityType: 'USER',
                    entityId: id,
                    details: {
                        userName: updatedUser.name,
                        changes: { name, email, phone, role },
                        timestamp: new Date().toISOString()
                    }
                }
            });
        }
        res.json({
            success: true,
            data: updatedUser,
            message: 'User updated successfully'
        });
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));
// PUT /api/users/:id/status - Update user status (activate/deactivate)
router.put('/:id/status', (0, validation_1.validate)(validation_1.schemas.uuidParam), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['ACTIVE', 'INACTIVE'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Status must be ACTIVE or INACTIVE'
            });
        }
        // Check if user exists
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { id }
        });
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        // Prevent admin from deactivating themselves
        if (req.user?.id === id && status === 'INACTIVE') {
            return res.status(400).json({
                success: false,
                error: 'Cannot deactivate your own account'
            });
        }
        // Update status
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id },
            data: { status },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                updatedAt: true
            }
        });
        // Log activity
        if (req.user) {
            await prisma_1.prisma.activityLog.create({
                data: {
                    userId: req.user.id,
                    action: status === 'ACTIVE' ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
                    entityType: 'USER',
                    entityId: id,
                    details: {
                        userName: updatedUser.name,
                        newStatus: status,
                        timestamp: new Date().toISOString()
                    }
                }
            });
        }
        res.json({
            success: true,
            data: updatedUser,
            message: `User ${status === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`
        });
    }
    catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));
// PUT /api/users/:id/reset-password - Reset user password
router.put('/:id/reset-password', (0, validation_1.validate)(validation_1.schemas.uuidParam), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters long'
            });
        }
        // Check if user exists
        const user = await prisma_1.prisma.user.findUnique({
            where: { id },
            select: { id: true, name: true }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        // Hash new password
        const saltRounds = 12;
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, saltRounds);
        // Update password
        await prisma_1.prisma.user.update({
            where: { id },
            data: { password: hashedPassword }
        });
        // Log activity
        if (req.user) {
            await prisma_1.prisma.activityLog.create({
                data: {
                    userId: req.user.id,
                    action: 'RESET_USER_PASSWORD',
                    entityType: 'USER',
                    entityId: id,
                    details: {
                        userName: user.name,
                        timestamp: new Date().toISOString()
                    }
                }
            });
        }
        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    }
    catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));
// DELETE /api/users/:id - Delete user
router.delete('/:id', (0, validation_1.validate)(validation_1.schemas.uuidParam), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { id } = req.params;
        // Check if user exists
        const user = await prisma_1.prisma.user.findUnique({
            where: { id },
            include: {
                assignedJobs: { where: { status: { in: ['PENDING', 'IN_PROGRESS'] } } }
            }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        // Prevent admin from deleting themselves
        if (req.user?.id === id) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete your own account'
            });
        }
        // Check for active jobs
        if (user.assignedJobs.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete user with active jobs. Please reassign jobs first.'
            });
        }
        await prisma_1.prisma.user.delete({
            where: { id }
        });
        // Log activity
        if (req.user) {
            await prisma_1.prisma.activityLog.create({
                data: {
                    userId: req.user.id,
                    action: 'DELETE_USER',
                    entityType: 'USER',
                    entityId: id,
                    details: {
                        userName: user.name,
                        timestamp: new Date().toISOString()
                    }
                }
            });
        }
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));
// GET /api/users/activity/:id - Get user activity logs
router.get('/activity/:id', (0, validation_1.validate)(validation_1.schemas.uuidParam), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { id } = req.params;
        const { page = "1", limit = "20" } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        // Check if user exists
        const user = await prisma_1.prisma.user.findUnique({
            where: { id },
            select: { id: true, name: true }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        // Get activity logs
        const activities = await prisma_1.prisma.activityLog.findMany({
            where: { userId: id },
            orderBy: { createdAt: 'desc' },
            skip,
            take
        });
        const total = await prisma_1.prisma.activityLog.count({
            where: { userId: id }
        });
        res.json({
            success: true,
            data: {
                user,
                activities
            },
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Get user activity error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));
exports.default = router;
//# sourceMappingURL=userRoutes.js.map