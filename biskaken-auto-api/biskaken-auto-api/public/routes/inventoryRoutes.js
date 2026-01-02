"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventoryController_1 = require("../controllers/inventoryController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
/**
 * Inventory Routes
 * @base /api/inventory
 * All routes require authentication
 */
// Apply authentication to all routes
router.use(auth_1.authenticate);
// GET /api/inventory - List all inventory items
router.get('/', (0, validation_1.validate)(validation_1.schemas.pagination), (0, errorHandler_1.asyncHandler)(inventoryController_1.inventoryController.list));
// GET /api/inventory/low-stock - Get low stock alerts
router.get('/low-stock', (0, errorHandler_1.asyncHandler)(inventoryController_1.inventoryController.getLowStock));
// GET /api/inventory/usage - Get inventory usage report
router.get('/usage', (0, errorHandler_1.asyncHandler)(inventoryController_1.inventoryController.getUsageReport));
// POST /api/inventory - Add inventory item (Admin/Sub-Admin)
router.post('/', (0, auth_1.authorize)('ADMIN', 'SUB_ADMIN'), (0, validation_1.validate)(validation_1.schemas.createInventoryItem), (0, errorHandler_1.asyncHandler)(inventoryController_1.inventoryController.create));
// GET /api/inventory/:id - Get inventory item details
router.get('/:id', (0, validation_1.validate)(validation_1.schemas.uuidParam), (0, errorHandler_1.asyncHandler)(inventoryController_1.inventoryController.getById));
// PUT /api/inventory/:id - Update inventory item
router.put('/:id', (0, auth_1.authorize)('ADMIN', 'SUB_ADMIN'), (0, validation_1.validate)(validation_1.schemas.updateInventoryItem), (0, errorHandler_1.asyncHandler)(inventoryController_1.inventoryController.update));
// POST /api/inventory/:id/adjust-stock - Adjust stock quantity
router.post('/:id/adjust-stock', (0, auth_1.authorize)('ADMIN', 'SUB_ADMIN'), (0, validation_1.validate)(validation_1.schemas.uuidParam), (0, errorHandler_1.asyncHandler)(inventoryController_1.inventoryController.updateStock));
// GET /api/inventory/:id/ai-predict - Get AI reorder prediction
router.get('/:id/ai-predict', (0, auth_1.authorize)('ADMIN', 'SUB_ADMIN'), (0, validation_1.validate)(validation_1.schemas.uuidParam), (0, errorHandler_1.asyncHandler)(inventoryController_1.inventoryController.getAIPrediction));
// DELETE /api/inventory/:id - Delete inventory item (Admin only)
router.delete('/:id', (0, auth_1.authorize)('ADMIN'), (0, validation_1.validate)(validation_1.schemas.uuidParam), (0, errorHandler_1.asyncHandler)(inventoryController_1.inventoryController.delete));
exports.default = router;
//# sourceMappingURL=inventoryRoutes.js.map