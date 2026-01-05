import { Router } from 'express';
import { jobController } from '../controllers/jobController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { aiService } from '../services/aiService.js';
const router = Router();
router.use(authenticate);
router.get('/', validate(schemas.pagination), asyncHandler(jobController.list));
router.get('/stats', asyncHandler(jobController.getStats));
router.post('/ai-diagnosis', asyncHandler(async (req, res) => {
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
    }
    catch (error) {
        console.error('AI diagnosis error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));
router.post('/', validate(schemas.createJob), asyncHandler(jobController.create));
router.get('/:id', validate(schemas.uuidParam), asyncHandler(jobController.getById));
router.put('/:id', validate(schemas.updateJob), asyncHandler(jobController.update));
router.put('/:id/status', validate(schemas.updateJobStatus), asyncHandler(jobController.updateStatus));
router.post('/:id/assign', authorize('ADMIN', 'SUB_ADMIN'), validate(schemas.uuidParam), asyncHandler(jobController.assign));
router.delete('/:id', authorize('ADMIN'), validate(schemas.uuidParam), asyncHandler(jobController.delete));
export default router;
