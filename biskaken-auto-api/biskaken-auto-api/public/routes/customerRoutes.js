"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customerController_1 = require("../controllers/customerController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
/**
 * Customer Routes
 * @base /api/customers
 * All routes require authentication
 */
// Apply authentication to all routes
router.use(auth_1.authenticate);
// GET /api/customers - List all customers (paginated, searchable)
router.get('/', (0, validation_1.validate)(validation_1.schemas.pagination), (0, errorHandler_1.asyncHandler)(customerController_1.customerController.list));
// GET /api/customers/search - Search customers by name/phone/plate
router.get('/search', (0, errorHandler_1.asyncHandler)(customerController_1.customerController.search));
// POST /api/customers - Create new customer
router.post('/', (0, validation_1.validate)(validation_1.schemas.createCustomer), (0, errorHandler_1.asyncHandler)(customerController_1.customerController.create));
// GET /api/customers/:id - Get single customer by ID
router.get('/:id', (0, validation_1.validate)(validation_1.schemas.uuidParam), (0, errorHandler_1.asyncHandler)(customerController_1.customerController.getById));
// PUT /api/customers/:id - Update customer
router.put('/:id', (0, validation_1.validate)(validation_1.schemas.updateCustomer), (0, errorHandler_1.asyncHandler)(customerController_1.customerController.update));
// DELETE /api/customers/:id - Delete customer (Admin only)
router.delete('/:id', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validate)(validation_1.schemas.uuidParam), (0, errorHandler_1.asyncHandler)(customerController_1.customerController.delete));
// GET /api/customers/:id/history - Get customer job history
router.get('/:id/history', (0, validation_1.validate)(validation_1.schemas.uuidParam), (0, errorHandler_1.asyncHandler)(customerController_1.customerController.getHistory));
exports.default = router;
//# sourceMappingURL=customerRoutes.js.map