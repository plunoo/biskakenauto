import { Router } from 'express';
import { inventoryController } from '../controllers/inventoryController';
import { authenticate, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * Inventory Routes
 * @base /api/inventory
 * All routes require authentication
 */

// Apply authentication to all routes
router.use(authenticate);

// GET /api/inventory - List all inventory items
router.get('/', 
  validate(schemas.pagination),
  asyncHandler(inventoryController.list)
);

// GET /api/inventory/low-stock - Get low stock alerts
router.get('/low-stock', 
  asyncHandler(inventoryController.getLowStock)
);

// GET /api/inventory/usage - Get inventory usage report
router.get('/usage', 
  asyncHandler(inventoryController.getUsageReport)
);

// POST /api/inventory - Add inventory item (Admin/Sub-Admin)
router.post('/', 
  authorize('ADMIN', 'SUB_ADMIN'),
  validate(schemas.createInventoryItem),
  asyncHandler(inventoryController.create)
);

// GET /api/inventory/:id - Get inventory item details
router.get('/:id', 
  validate(schemas.uuidParam),
  asyncHandler(inventoryController.getById)
);

// PUT /api/inventory/:id - Update inventory item
router.put('/:id', 
  authorize('ADMIN', 'SUB_ADMIN'),
  validate(schemas.updateInventoryItem),
  asyncHandler(inventoryController.update)
);

// POST /api/inventory/:id/adjust-stock - Adjust stock quantity
router.post('/:id/adjust-stock', 
  authorize('ADMIN', 'SUB_ADMIN'),
  validate(schemas.uuidParam),
  asyncHandler(inventoryController.updateStock)
);

// GET /api/inventory/:id/ai-predict - Get AI reorder prediction
router.get('/:id/ai-predict', 
  authorize('ADMIN', 'SUB_ADMIN'),
  validate(schemas.uuidParam),
  asyncHandler(inventoryController.getAIPrediction)
);

// DELETE /api/inventory/:id - Delete inventory item (Admin only)
router.delete('/:id', 
  authorize('ADMIN'),
  validate(schemas.uuidParam),
  asyncHandler(inventoryController.delete)
);

export default router;