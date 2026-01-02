"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemas = exports.validate = void 0;
const zod_1 = require("zod");
/**
 * Generic validation middleware factory
 */
const validate = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.safeParse({
                body: req.body,
                query: req.query,
                params: req.params
            });
            if (!result.success) {
                const errors = result.error.issues.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }));
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    data: errors
                });
            }
            // Merge validated data back to request
            const validatedData = result.data;
            req.body = validatedData.body || req.body;
            req.query = validatedData.query || req.query;
            req.params = validatedData.params || req.params;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.validate = validate;
// Common validation schemas
exports.schemas = {
    // Auth schemas
    login: zod_1.z.object({
        body: zod_1.z.object({
            email: zod_1.z.string().email('Invalid email address'),
            password: zod_1.z.string().min(6, 'Password must be at least 6 characters')
        })
    }),
    register: zod_1.z.object({
        body: zod_1.z.object({
            name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
            email: zod_1.z.string().email('Invalid email address'),
            phone: zod_1.z.string().optional(),
            password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
            role: zod_1.z.enum(['ADMIN', 'SUB_ADMIN', 'STAFF']).optional()
        })
    }),
    changePassword: zod_1.z.object({
        body: zod_1.z.object({
            currentPassword: zod_1.z.string().min(1, 'Current password is required'),
            newPassword: zod_1.z.string().min(6, 'New password must be at least 6 characters')
        })
    }),
    // Customer schemas
    createCustomer: zod_1.z.object({
        body: zod_1.z.object({
            name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
            phone: zod_1.z.string().min(10, 'Phone number must be at least 10 characters'),
            email: zod_1.z.string().email().optional(),
            address: zod_1.z.string().optional(),
            notes: zod_1.z.string().optional(),
            vehicle: zod_1.z.object({
                make: zod_1.z.string().min(1, 'Vehicle make is required'),
                model: zod_1.z.string().min(1, 'Vehicle model is required'),
                year: zod_1.z.number().min(1900).max(new Date().getFullYear() + 1),
                plateNumber: zod_1.z.string().optional(),
                vin: zod_1.z.string().optional(),
                notes: zod_1.z.string().optional()
            })
        })
    }),
    updateCustomer: zod_1.z.object({
        params: zod_1.z.object({
            id: zod_1.z.string().uuid('Invalid customer ID')
        }),
        body: zod_1.z.object({
            name: zod_1.z.string().min(2).optional(),
            phone: zod_1.z.string().min(10).optional(),
            email: zod_1.z.string().email().optional(),
            address: zod_1.z.string().optional(),
            notes: zod_1.z.string().optional()
        })
    }),
    // Job schemas
    createJob: zod_1.z.object({
        body: zod_1.z.object({
            customerId: zod_1.z.string().uuid('Invalid customer ID'),
            vehicleId: zod_1.z.string().uuid('Invalid vehicle ID'),
            complaint: zod_1.z.string().min(10, 'Complaint must be at least 10 characters'),
            priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
            laborHours: zod_1.z.number().positive().optional(),
            laborRate: zod_1.z.number().positive().optional(),
            estimatedCost: zod_1.z.number().positive().optional(),
            expectedCompletion: zod_1.z.string().datetime().optional(),
            notes: zod_1.z.string().optional()
        })
    }),
    updateJob: zod_1.z.object({
        params: zod_1.z.object({
            id: zod_1.z.string().uuid('Invalid job ID')
        }),
        body: zod_1.z.object({
            complaint: zod_1.z.string().min(10).optional(),
            diagnosis: zod_1.z.string().optional(),
            status: zod_1.z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
            priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
            assignedTo: zod_1.z.string().uuid().optional(),
            laborHours: zod_1.z.number().positive().optional(),
            laborRate: zod_1.z.number().positive().optional(),
            estimatedCost: zod_1.z.number().positive().optional(),
            actualCost: zod_1.z.number().positive().optional(),
            expectedCompletion: zod_1.z.string().datetime().optional(),
            notes: zod_1.z.string().optional()
        })
    }),
    updateJobStatus: zod_1.z.object({
        params: zod_1.z.object({
            id: zod_1.z.string().uuid('Invalid job ID')
        }),
        body: zod_1.z.object({
            status: zod_1.z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
            notes: zod_1.z.string().optional()
        })
    }),
    // Inventory schemas
    createInventoryItem: zod_1.z.object({
        body: zod_1.z.object({
            partName: zod_1.z.string().min(2, 'Part name must be at least 2 characters'),
            category: zod_1.z.string().min(2, 'Category is required'),
            stockQty: zod_1.z.number().min(0, 'Stock quantity cannot be negative'),
            reorderLevel: zod_1.z.number().min(0, 'Reorder level cannot be negative'),
            unitCost: zod_1.z.number().positive('Unit cost must be positive'),
            sellingPrice: zod_1.z.number().positive('Selling price must be positive'),
            supplier: zod_1.z.string().optional(),
            notes: zod_1.z.string().optional()
        })
    }),
    updateInventoryItem: zod_1.z.object({
        params: zod_1.z.object({
            id: zod_1.z.string().uuid('Invalid item ID')
        }),
        body: zod_1.z.object({
            partName: zod_1.z.string().min(2).optional(),
            category: zod_1.z.string().min(2).optional(),
            stockQty: zod_1.z.number().min(0).optional(),
            reorderLevel: zod_1.z.number().min(0).optional(),
            unitCost: zod_1.z.number().positive().optional(),
            sellingPrice: zod_1.z.number().positive().optional(),
            supplier: zod_1.z.string().optional(),
            notes: zod_1.z.string().optional()
        })
    }),
    // Invoice schemas
    createInvoice: zod_1.z.object({
        body: zod_1.z.object({
            customerId: zod_1.z.string().uuid('Invalid customer ID'),
            jobId: zod_1.z.string().uuid().optional(),
            dueDate: zod_1.z.string().datetime().optional(),
            tax: zod_1.z.number().min(0).optional(),
            discount: zod_1.z.number().min(0).optional(),
            notes: zod_1.z.string().optional(),
            items: zod_1.z.array(zod_1.z.object({
                partId: zod_1.z.string().uuid().optional(),
                description: zod_1.z.string().min(1, 'Description is required'),
                quantity: zod_1.z.number().positive('Quantity must be positive'),
                unitPrice: zod_1.z.number().positive('Unit price must be positive')
            })).min(1, 'At least one item is required')
        })
    }),
    recordPayment: zod_1.z.object({
        params: zod_1.z.object({
            id: zod_1.z.string().uuid('Invalid invoice ID')
        }),
        body: zod_1.z.object({
            amount: zod_1.z.number().positive('Amount must be positive'),
            method: zod_1.z.enum(['CASH', 'MOBILE_MONEY', 'CARD', 'BANK_TRANSFER', 'USDT']),
            reference: zod_1.z.string().optional(),
            notes: zod_1.z.string().optional()
        })
    }),
    // Common query schemas
    pagination: zod_1.z.object({
        query: zod_1.z.object({
            page: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
            limit: zod_1.z.string().regex(/^\d+$/).transform(Number).optional()
        })
    }),
    uuidParam: zod_1.z.object({
        params: zod_1.z.object({
            id: zod_1.z.string().uuid('Invalid ID format')
        })
    })
};
//# sourceMappingURL=validation.js.map