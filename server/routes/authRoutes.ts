import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { validate, schemas } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

/**
 * Authentication Routes
 * @base /api/auth
 */

// POST /api/auth/register - Register new user (first user becomes admin)
router.post('/register', 
  validate(schemas.register),
  asyncHandler(authController.register)
);

// POST /api/auth/login - User login
router.post('/login', 
  validate(schemas.login),
  asyncHandler(authController.login)
);

// POST /api/auth/admin-login - Admin override login (environment-based)
router.post('/admin-login', 
  validate(schemas.login),
  asyncHandler(authController.adminLogin)
);

// GET /api/auth/me - Get current user profile (protected)
router.get('/me', 
  authenticate,
  asyncHandler(authController.me)
);

// PUT /api/auth/change-password - Change user password (protected)
router.put('/change-password', 
  authenticate,
  validate(schemas.changePassword),
  asyncHandler(authController.changePassword)
);

// POST /api/auth/logout - Logout (protected, mainly for logging)
router.post('/logout', 
  authenticate,
  asyncHandler(authController.logout)
);

export default router;