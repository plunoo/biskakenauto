import { Router } from 'express';
import { invoiceController } from '../controllers/invoiceController';
import { authenticate, authorize } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * Invoice Routes
 * @base /api/invoices
 * All routes require authentication unless specified
 */

// Apply authentication to most routes
router.use(authenticate);

// GET /api/invoices - List all invoices
router.get('/', 
  validate(schemas.pagination),
  asyncHandler(invoiceController.list)
);

// GET /api/invoices/overdue - Get overdue invoices
router.get('/overdue', 
  asyncHandler(invoiceController.getOverdueInvoices)
);

// POST /api/invoices - Create new invoice
router.post('/', 
  validate(schemas.createInvoice),
  asyncHandler(invoiceController.create)
);

// GET /api/invoices/:id - Get single invoice by ID
router.get('/:id', 
  validate(schemas.uuidParam),
  asyncHandler(invoiceController.getById)
);

// PUT /api/invoices/:id - Update invoice
router.put('/:id', 
  validate(schemas.uuidParam),
  asyncHandler(invoiceController.update)
);

// POST /api/invoices/:id/payment - Record manual payment
router.post('/:id/payment', 
  validate(schemas.recordPayment),
  asyncHandler(invoiceController.recordPayment)
);

// POST /api/invoices/:id/pay/mobile-money - Initialize mobile money payment
router.post('/:id/pay/mobile-money', 
  validate(schemas.uuidParam),
  asyncHandler(invoiceController.initializeMobileMoneyPayment)
);

// POST /api/invoices/:id/pay/online - Initialize online payment (Paystack)
router.post('/:id/pay/online', 
  validate(schemas.uuidParam),
  asyncHandler(invoiceController.initializeOnlinePayment)
);

// GET /api/invoices/verify/:reference - Verify payment status
router.get('/verify/:reference', 
  asyncHandler(invoiceController.verifyPayment)
);

// GET /api/invoices/:id/pdf - Download invoice PDF
router.get('/:id/pdf', 
  validate(schemas.uuidParam),
  asyncHandler(invoiceController.downloadPDF)
);

// POST /api/invoices/:id/send-reminder - Send payment reminder SMS
router.post('/:id/send-reminder', 
  validate(schemas.uuidParam),
  asyncHandler(invoiceController.sendPaymentReminder)
);

// DELETE /api/invoices/:id - Delete invoice (Admin only)
router.delete('/:id', 
  authorize('ADMIN'),
  validate(schemas.uuidParam),
  asyncHandler(invoiceController.delete)
);

export default router;