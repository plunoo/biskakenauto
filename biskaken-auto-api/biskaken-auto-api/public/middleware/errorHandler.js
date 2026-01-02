"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFound = exports.errorHandler = void 0;
/**
 * Global error handler middleware
 */
const errorHandler = (error, req, res, next) => {
    console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params
    });
    // Prisma errors
    if (error.code === 'P2002') {
        return res.status(409).json({
            success: false,
            error: 'A record with this information already exists'
        });
    }
    if (error.code === 'P2025') {
        return res.status(404).json({
            success: false,
            error: 'Record not found'
        });
    }
    if (error.code === 'P2003') {
        return res.status(400).json({
            success: false,
            error: 'Foreign key constraint failed'
        });
    }
    // Validation errors
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
    // JWT errors (should be handled by auth middleware, but just in case)
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: 'Token expired'
        });
    }
    // Multer file upload errors
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            error: 'File too large'
        });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            success: false,
            error: 'Unexpected file field'
        });
    }
    // Default error response
    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(statusCode).json({
        success: false,
        error: process.env.NODE_ENV === 'development' ? message : 'Something went wrong'
    });
};
exports.errorHandler = errorHandler;
/**
 * 404 handler for unmatched routes
 */
const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`
    });
};
exports.notFound = notFound;
/**
 * Async error wrapper to catch async errors in route handlers
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map