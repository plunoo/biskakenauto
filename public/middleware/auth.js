import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.js';
export const authenticate = async (req, res, next) => {
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
    }
    catch (error) {
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
export const authorize = (...roles) => {
    return (req, res, next) => {
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
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
        if (token) {
            if (!process.env.JWT_SECRET) {
                console.warn('JWT_SECRET is not configured - using default secret (INSECURE)');
                process.env.JWT_SECRET = 'default-insecure-secret-change-in-production';
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
    }
    catch (error) {
        next();
    }
};
