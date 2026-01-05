import { z } from 'zod';
export const validate = (schema) => {
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
            const validatedData = result.data;
            if (validatedData.body) {
                Object.assign(req.body, validatedData.body);
            }
            if (validatedData.query) {
                Object.assign(req.query, validatedData.query);
            }
            if (validatedData.params) {
                Object.assign(req.params, validatedData.params);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
export const schemas = {
    login: z.object({
        body: z.object({
            email: z.string().email('Invalid email address'),
            password: z.string().min(6, 'Password must be at least 6 characters')
        })
    }),
    register: z.object({
        body: z.object({
            name: z.string().min(2, 'Name must be at least 2 characters'),
            email: z.string().email('Invalid email address'),
            phone: z.string().optional(),
            password: z.string().min(6, 'Password must be at least 6 characters'),
            role: z.enum(['ADMIN', 'SUB_ADMIN', 'STAFF']).optional()
        })
    }),
    changePassword: z.object({
        body: z.object({
            currentPassword: z.string().min(1, 'Current password is required'),
            newPassword: z.string().min(6, 'New password must be at least 6 characters')
        })
    }),
    createCustomer: z.object({
        body: z.object({
            name: z.string().min(2, 'Name must be at least 2 characters'),
            phone: z.string().min(10, 'Phone number must be at least 10 characters'),
            email: z.string().email().optional(),
            address: z.string().optional(),
            notes: z.string().optional(),
            vehicle: z.object({
                make: z.string().min(1, 'Vehicle make is required'),
                model: z.string().min(1, 'Vehicle model is required'),
                year: z.number().min(1900).max(new Date().getFullYear() + 1),
                plateNumber: z.string().optional(),
                vin: z.string().optional(),
                notes: z.string().optional()
            })
        })
    }),
    updateCustomer: z.object({
        params: z.object({
            id: z.string().uuid('Invalid customer ID')
        }),
        body: z.object({
            name: z.string().min(2).optional(),
            phone: z.string().min(10).optional(),
            email: z.string().email().optional(),
            address: z.string().optional(),
            notes: z.string().optional()
        })
    }),
    createJob: z.object({
        body: z.object({
            customerId: z.string().uuid('Invalid customer ID'),
            vehicleId: z.string().uuid('Invalid vehicle ID'),
            complaint: z.string().min(10, 'Complaint must be at least 10 characters'),
            priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
            laborHours: z.number().positive().optional(),
            laborRate: z.number().positive().optional(),
            estimatedCost: z.number().positive().optional(),
            expectedCompletion: z.string().datetime().optional(),
            notes: z.string().optional()
        })
    }),
    updateJob: z.object({
        params: z.object({
            id: z.string().uuid('Invalid job ID')
        }),
        body: z.object({
            complaint: z.string().min(10).optional(),
            diagnosis: z.string().optional(),
            status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
            priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
            assignedTo: z.string().uuid().optional(),
            laborHours: z.number().positive().optional(),
            laborRate: z.number().positive().optional(),
            estimatedCost: z.number().positive().optional(),
            actualCost: z.number().positive().optional(),
            expectedCompletion: z.string().datetime().optional(),
            notes: z.string().optional()
        })
    }),
    updateJobStatus: z.object({
        params: z.object({
            id: z.string().uuid('Invalid job ID')
        }),
        body: z.object({
            status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
            notes: z.string().optional()
        })
    }),
    createInventoryItem: z.object({
        body: z.object({
            partName: z.string().min(2, 'Part name must be at least 2 characters'),
            category: z.string().min(2, 'Category is required'),
            stockQty: z.number().min(0, 'Stock quantity cannot be negative'),
            reorderLevel: z.number().min(0, 'Reorder level cannot be negative'),
            unitCost: z.number().positive('Unit cost must be positive'),
            sellingPrice: z.number().positive('Selling price must be positive'),
            supplier: z.string().optional(),
            notes: z.string().optional()
        })
    }),
    updateInventoryItem: z.object({
        params: z.object({
            id: z.string().uuid('Invalid item ID')
        }),
        body: z.object({
            partName: z.string().min(2).optional(),
            category: z.string().min(2).optional(),
            stockQty: z.number().min(0).optional(),
            reorderLevel: z.number().min(0).optional(),
            unitCost: z.number().positive().optional(),
            sellingPrice: z.number().positive().optional(),
            supplier: z.string().optional(),
            notes: z.string().optional()
        })
    }),
    createInvoice: z.object({
        body: z.object({
            customerId: z.string().uuid('Invalid customer ID'),
            jobId: z.string().uuid().optional(),
            dueDate: z.string().datetime().optional(),
            tax: z.number().min(0).optional(),
            discount: z.number().min(0).optional(),
            notes: z.string().optional(),
            items: z.array(z.object({
                partId: z.string().uuid().optional(),
                description: z.string().min(1, 'Description is required'),
                quantity: z.number().positive('Quantity must be positive'),
                unitPrice: z.number().positive('Unit price must be positive')
            })).min(1, 'At least one item is required')
        })
    }),
    recordPayment: z.object({
        params: z.object({
            id: z.string().uuid('Invalid invoice ID')
        }),
        body: z.object({
            amount: z.number().positive('Amount must be positive'),
            method: z.enum(['CASH', 'MOBILE_MONEY', 'CARD', 'BANK_TRANSFER', 'USDT']),
            reference: z.string().optional(),
            notes: z.string().optional()
        })
    }),
    pagination: z.object({
        query: z.object({
            page: z.string().regex(/^\d+$/).transform(Number).optional(),
            limit: z.string().regex(/^\d+$/).transform(Number).optional()
        })
    }),
    uuidParam: z.object({
        params: z.object({
            id: z.string().uuid('Invalid ID format')
        })
    })
};
