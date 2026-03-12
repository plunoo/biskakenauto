const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.path}:`, err.message);

  if (err.message?.includes('not configured')) {
    return res.status(503).json({
      success: false,
      error: 'Database not configured. Set up Firebase or PostgreSQL credentials.'
    });
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
};

module.exports = errorHandler;
