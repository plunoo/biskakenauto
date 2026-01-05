import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { prisma } from '../utils/prisma.js';
import bcrypt from 'bcryptjs';
const router = Router();
router.use(authenticate);
router.use(authorize('ADMIN'));
router.get('/', validate(schemas.pagination), asyncHandler(async (req, res) => {
    try {
        const { page = "1", limit = "20", role, status } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        const where = {};
        if (role)
            where.role = role;
        if (status)
            where.status = status;
        const users = await prisma.user.findMany({
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
        const total = await prisma.user.count({ where });
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
router.post('/', validate(schemas.register), asyncHandler(async (req, res) => {
    try {
        const { name, email, phone, password, role = 'STAFF' } = req.body;
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
        if (req.user) {
            await prisma.activityLog.create({
                data: {
                    userId: req.user.id,
                    action: 'CREATE_USER',
                    entityType: 'USER',
                    entityId: user.id,
                    details: JSON.stringify({
                        userName: user.name,
                        userRole: user.role,
                        timestamp: new Date().toISOString()
                    })
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
router.get('/:id', validate(schemas.uuidParam), asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
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
router.put('/:id', validate(schemas.uuidParam), asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, role } = req.body;
        const existingUser = await prisma.user.findUnique({
            where: { id }
        });
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        if (req.user?.id === id && role && role !== existingUser.role) {
            return res.status(400).json({
                success: false,
                error: 'Cannot change your own role'
            });
        }
        if (email || phone) {
            const conflict = await prisma.user.findFirst({
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
        const updatedUser = await prisma.user.update({
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
        if (req.user) {
            await prisma.activityLog.create({
                data: {
                    userId: req.user.id,
                    action: 'UPDATE_USER',
                    entityType: 'USER',
                    entityId: id,
                    details: JSON.stringify({
                        userName: updatedUser.name,
                        changes: { name, email, phone, role },
                        timestamp: new Date().toISOString()
                    })
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
router.put('/:id/status', validate(schemas.uuidParam), asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['ACTIVE', 'INACTIVE'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Status must be ACTIVE or INACTIVE'
            });
        }
        const existingUser = await prisma.user.findUnique({
            where: { id }
        });
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        if (req.user?.id === id && status === 'INACTIVE') {
            return res.status(400).json({
                success: false,
                error: 'Cannot deactivate your own account'
            });
        }
        const updatedUser = await prisma.user.update({
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
        if (req.user) {
            await prisma.activityLog.create({
                data: {
                    userId: req.user.id,
                    action: status === 'ACTIVE' ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
                    entityType: 'USER',
                    entityId: id,
                    details: JSON.stringify({
                        userName: updatedUser.name,
                        newStatus: status,
                        timestamp: new Date().toISOString()
                    })
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
router.put('/:id/reset-password', validate(schemas.uuidParam), asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters long'
            });
        }
        const user = await prisma.user.findUnique({
            where: { id },
            select: { id: true, name: true }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        await prisma.user.update({
            where: { id },
            data: { password: hashedPassword }
        });
        if (req.user) {
            await prisma.activityLog.create({
                data: {
                    userId: req.user.id,
                    action: 'RESET_USER_PASSWORD',
                    entityType: 'USER',
                    entityId: id,
                    details: JSON.stringify({
                        userName: user.name,
                        timestamp: new Date().toISOString()
                    })
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
router.delete('/:id', validate(schemas.uuidParam), asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
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
        if (req.user?.id === id) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete your own account'
            });
        }
        if (user.assignedJobs.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete user with active jobs. Please reassign jobs first.'
            });
        }
        await prisma.user.delete({
            where: { id }
        });
        if (req.user) {
            await prisma.activityLog.create({
                data: {
                    userId: req.user.id,
                    action: 'DELETE_USER',
                    entityType: 'USER',
                    entityId: id,
                    details: JSON.stringify({
                        userName: user.name,
                        timestamp: new Date().toISOString()
                    })
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
router.get('/activity/:id', validate(schemas.uuidParam), asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const { page = "1", limit = "20" } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        const user = await prisma.user.findUnique({
            where: { id },
            select: { id: true, name: true }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        const activities = await prisma.activityLog.findMany({
            where: { userId: id },
            orderBy: { createdAt: 'desc' },
            skip,
            take
        });
        const total = await prisma.activityLog.count({
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
export default router;
