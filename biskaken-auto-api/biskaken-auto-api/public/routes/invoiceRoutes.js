"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invoiceController_1 = require("../controllers/invoiceController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
/**
 * Invoice Routes
 * @base /api/invoices
 * All routes require authentication unless specified
 */
// Apply authentication to most routes
router.use(auth_1.authenticate);
// GET /api/invoices - List all invoices
router.get('/', (0, validation_1.validate)(validation_1.schemas.pagination), (0, errorHandler_1.asyncHandler)(invoiceController_1.invoiceController.list));
// GET /api/invoices/overdue - Get overdue invoices
router.get('/overdue', (0, errorHandler_1.asyncHandler)(invoiceController_1.invoiceController.getOverdueInvoices));
// POST /api/invoices - Create new invoice
router.post('/', (0, validation_1.validate)(validation_1.schemas.createInvoice), (0, errorHandler_1.asyncHandler)(invoiceController_1.invoiceController.create));
// GET /api/invoices/:id - Get single invoice by ID
router.get('/:id', (0, validation_1.validate)(validation_1.schemas.uuidParam), (0, errorHandler_1.asyncHandler)(invoiceController_1.invoiceController.getById));
// PUT /api/invoices/:id - Update invoice
router.put('/:id', (0, validation_1.validate)(validation_1.schemas.uuidParam), (0, errorHandler_1.asyncHandler)(invoiceController_1.invoiceController.update));
// POST /api/invoices/:id/payment - Record manual payment
router.post('/:id/payment', (0, validation_1.validate)(validation_1.schemas.recordPayment), (0, errorHandler_1.asyncHandler)(invoiceController_1.invoiceController.recordPayment));
// POST /api/invoices/:id/pay/mobile-money - Initialize mobile money payment
router.post('/:id/pay/mobile-money', (0, validation_1.validate)(validation_1.schemas.uuidParam), (0, errorHandler_1.asyncHandler)(invoiceController_1.invoiceController.initializeMobileMoneyPayment));
// POST /api/invoices/:id/pay/online - Initialize online payment (Paystack)
router.post('/:id/pay/online', (0, validation_1.validate)(validation_1.schemas.uuidParam), (0, errorHandler_1.asyncHandler)(invoiceController_1.invoiceController.initializeOnlinePayment));
// GET /api/invoices/verify/:reference - Verify payment status
router.get('/verify/:reference', (0, errorHandler_1.asyncHandler)(invoiceController_1.invoiceController.verifyPayment));
// GET /api/invoices/:id/pdf - Download invoice PDF
router.get('/:id/pdf', (0, validation_1.validate)(validation_1.schemas.uuidParam), (0, errorHandler_1.asyncHandler)(invoiceController_1.invoiceController.downloadPDF));
// POST /api/invoices/:id/send-reminder - Send payment reminder SMS
router.post('/:id/send-reminder', (0, validation_1.validate)(validation_1.schemas.uuidParam), (0, errorHandler_1.asyncHandler)(invoiceController_1.invoiceController.sendPaymentReminder));
// DELETE /api/invoices/:id - Delete invoice (Admin only)
router.delete('/:id', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validate)(validation_1.schemas.uuidParam), (0, errorHandler_1.asyncHandler)(invoiceController_1.invoiceController.delete));
exports.default = router;
//# sourceMappingURL=invoiceRoutes.js.map