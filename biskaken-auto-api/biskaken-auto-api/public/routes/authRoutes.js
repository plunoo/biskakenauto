"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
/**
 * Authentication Routes
 * @base /api/auth
 */
// POST /api/auth/register - Register new user (first user becomes admin)
router.post('/register', (0, validation_1.validate)(validation_1.schemas.register), (0, errorHandler_1.asyncHandler)(authController_1.authController.register));
// POST /api/auth/login - User login
router.post('/login', (0, validation_1.validate)(validation_1.schemas.login), (0, errorHandler_1.asyncHandler)(authController_1.authController.login));
// GET /api/auth/me - Get current user profile (protected)
router.get('/me', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(authController_1.authController.me));
// PUT /api/auth/change-password - Change user password (protected)
router.put('/change-password', auth_1.authenticate, (0, validation_1.validate)(validation_1.schemas.changePassword), (0, errorHandler_1.asyncHandler)(authController_1.authController.changePassword));
// POST /api/auth/logout - Logout (protected, mainly for logging)
router.post('/logout', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(authController_1.authController.logout));
exports.default = router;
//# sourceMappingURL=authRoutes.js.map