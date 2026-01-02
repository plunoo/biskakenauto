"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jobController_1 = require("../controllers/jobController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const errorHandler_1 = require("../middleware/errorHandler");
const aiService_1 = require("../services/aiService");
const router = (0, express_1.Router)();
/**
 * Job Routes
 * @base /api/jobs
 * All routes require authentication
 */
// Apply authentication to all routes
router.use(auth_1.authenticate);
// GET /api/jobs - List all jobs (filtered by role, paginated)
router.get('/', (0, validation_1.validate)(validation_1.schemas.pagination), (0, errorHandler_1.asyncHandler)(jobController_1.jobController.list));
// GET /api/jobs/stats - Get job statistics
router.get('/stats', (0, errorHandler_1.asyncHandler)(jobController_1.jobController.getStats));
// POST /api/jobs/ai-diagnosis - AI-powered vehicle diagnosis
router.post('/ai-diagnosis', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { complaint, vehicleInfo } = req.body;
        if (!complaint || complaint.trim().length < 10) {
            return res.status(400).json({
                success: false,
                error: 'Complaint must be at least 10 characters long'
            });
        }
        const diagnosis = await aiService_1.aiService.diagnoseIssue(complaint, vehicleInfo);
        res.json({
            success: true,
            data: diagnosis
        });
    }
    catch (error) {
        console.error('AI diagnosis error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));
// POST /api/jobs - Create new job
router.post('/', (0, validation_1.validate)(validation_1.schemas.createJob), (0, errorHandler_1.asyncHandler)(jobController_1.jobController.create));
// GET /api/jobs/:id - Get single job by ID
router.get('/:id', (0, validation_1.validate)(validation_1.schemas.uuidParam), (0, errorHandler_1.asyncHandler)(jobController_1.jobController.getById));
// PUT /api/jobs/:id - Update job
router.put('/:id', (0, validation_1.validate)(validation_1.schemas.updateJob), (0, errorHandler_1.asyncHandler)(jobController_1.jobController.update));
// PUT /api/jobs/:id/status - Update job status
router.put('/:id/status', (0, validation_1.validate)(validation_1.schemas.updateJobStatus), (0, errorHandler_1.asyncHandler)(jobController_1.jobController.updateStatus));
// POST /api/jobs/:id/assign - Assign job to mechanic (Admin/Sub-Admin)
router.post('/:id/assign', (0, auth_1.authorize)('ADMIN', 'SUB_ADMIN'), (0, validation_1.validate)(validation_1.schemas.uuidParam), (0, errorHandler_1.asyncHandler)(jobController_1.jobController.assign));
// DELETE /api/jobs/:id - Delete job (Admin only)
router.delete('/:id', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validate)(validation_1.schemas.uuidParam), (0, errorHandler_1.asyncHandler)(jobController_1.jobController.delete));
exports.default = router;
//# sourceMappingURL=jobRoutes.js.map