export const errorHandler = (error, req, res, next) => {
    console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params
    });
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
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
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
    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(statusCode).json({
        success: false,
        error: process.env.NODE_ENV === 'development' ? message : 'Something went wrong'
    });
};
export const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`
    });
};
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
