import { Router } from 'express';
import { jobController } from '../controllers/jobController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { aiService } from '../services/aiService.js';
import { Response } from 'express';
import { AuthRequest, ApiResponse } from '../types/index.js';

const router = Router();

/**
 * Job Routes
 * @base /api/jobs
 * All routes require authentication
 */

// Apply authentication to all routes
router.use(authenticate);

// GET /api/jobs - List all jobs (filtered by role, paginated)
router.get('/', 
  validate(schemas.pagination),
  asyncHandler(jobController.list)
);

// GET /api/jobs/stats - Get job statistics
router.get('/stats', 
  asyncHandler(jobController.getStats)
);

// POST /api/jobs/ai-diagnosis - AI-powered vehicle diagnosis
router.post('/ai-diagnosis', 
  asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
    try {
      const { complaint, vehicleInfo } = req.body;

      if (!complaint || complaint.trim().length < 10) {
        return res.status(400).json({
          success: false,
          error: 'Complaint must be at least 10 characters long'
        });
      }

      const diagnosis = await aiService.diagnoseIssue(complaint, vehicleInfo);

      res.json({
        success: true,
        data: diagnosis
      });
    } catch (error: any) {
      console.error('AI diagnosis error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  })
);

// POST /api/jobs - Create new job
router.post('/', 
  validate(schemas.createJob),
  asyncHandler(jobController.create)
);

// GET /api/jobs/:id - Get single job by ID
router.get('/:id', 
  validate(schemas.uuidParam),
  asyncHandler(jobController.getById)
);

// PUT /api/jobs/:id - Update job
router.put('/:id', 
  validate(schemas.updateJob),
  asyncHandler(jobController.update)
);

// PUT /api/jobs/:id/status - Update job status
router.put('/:id/status', 
  validate(schemas.updateJobStatus),
  asyncHandler(jobController.updateStatus)
);

// POST /api/jobs/:id/assign - Assign job to mechanic (Admin/Sub-Admin)
router.post('/:id/assign', 
  authorize('ADMIN', 'SUB_ADMIN'),
  validate(schemas.uuidParam),
  asyncHandler(jobController.assign)
);

// DELETE /api/jobs/:id - Delete job (Admin only)
router.delete('/:id', 
  authorize('ADMIN'),
  validate(schemas.uuidParam),
  asyncHandler(jobController.delete)
);

export default router;