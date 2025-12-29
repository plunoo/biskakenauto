import { Router } from 'express';
import { customerController } from '../controllers/customerController';
import { authenticate, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * Customer Routes
 * @base /api/customers
 * All routes require authentication
 */

// Apply authentication to all routes
router.use(authenticate);

// GET /api/customers - List all customers (paginated, searchable)
router.get('/', 
  validate(schemas.pagination),
  asyncHandler(customerController.list)
);

// GET /api/customers/search - Search customers by name/phone/plate
router.get('/search', 
  asyncHandler(customerController.search)
);

// POST /api/customers - Create new customer
router.post('/', 
  validate(schemas.createCustomer),
  asyncHandler(customerController.create)
);

// GET /api/customers/:id - Get single customer by ID
router.get('/:id', 
  validate(schemas.uuidParam),
  asyncHandler(customerController.getById)
);

// PUT /api/customers/:id - Update customer
router.put('/:id', 
  validate(schemas.updateCustomer),
  asyncHandler(customerController.update)
);

// DELETE /api/customers/:id - Delete customer (Admin only)
router.delete('/:id', 
  authorize('ADMIN'),
  validate(schemas.uuidParam),
  asyncHandler(customerController.delete)
);

// GET /api/customers/:id/history - Get customer job history
router.get('/:id/history', 
  validate(schemas.uuidParam),
  asyncHandler(customerController.getHistory)
);

export default router;