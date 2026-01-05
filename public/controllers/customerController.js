import { prisma } from '../utils/prisma.js';
export const customerController = {
    async list(req, res) {
        try {
            const { page = "1", limit = "20", search } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);
            const where = {};
            if (search) {
                where.OR = [
                    { name: { contains: search } },
                    { phone: { contains: search } },
                    { email: { contains: search } },
                    {
                        vehicles: {
                            some: {
                                OR: [
                                    { make: { contains: search } },
                                    { model: { contains: search } },
                                    { plateNumber: { contains: search } }
                                ]
                            }
                        }
                    }
                ];
            }
            const customers = await prisma.customer.findMany({
                where,
                include: {
                    vehicles: true,
                    _count: {
                        select: {
                            jobs: true,
                            invoices: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            });
            const total = await prisma.customer.count({ where });
            res.json({
                success: true,
                data: customers,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            });
        }
        catch (error) {
            console.error('List customers error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    async getById(req, res) {
        try {
            const { id } = req.params;
            const customer = await prisma.customer.findUnique({
                where: { id },
                include: {
                    vehicles: true,
                    jobs: {
                        include: {
                            vehicle: true,
                            assignedMechanic: {
                                select: { name: true }
                            }
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 10
                    },
                    invoices: {
                        orderBy: { createdAt: 'desc' },
                        take: 5
                    }
                }
            });
            if (!customer) {
                return res.status(404).json({
                    success: false,
                    error: 'Customer not found'
                });
            }
            res.json({
                success: true,
                data: customer
            });
        }
        catch (error) {
            console.error('Get customer error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    async create(req, res) {
        try {
            const { name, phone, email, address, notes, vehicle } = req.body;
            const existingCustomer = await prisma.customer.findUnique({
                where: { phone }
            });
            if (existingCustomer) {
                return res.status(409).json({
                    success: false,
                    error: 'Customer with this phone number already exists'
                });
            }
            if (vehicle.plateNumber) {
                const existingVehicle = await prisma.vehicle.findUnique({
                    where: { plateNumber: vehicle.plateNumber }
                });
                if (existingVehicle) {
                    return res.status(409).json({
                        success: false,
                        error: 'Vehicle with this plate number already exists'
                    });
                }
            }
            const result = await prisma.$transaction(async (tx) => {
                const newCustomer = await tx.customer.create({
                    data: {
                        name,
                        phone,
                        email,
                        address,
                        notes
                    }
                });
                const newVehicle = await tx.vehicle.create({
                    data: {
                        customerId: newCustomer.id,
                        make: vehicle.make,
                        model: vehicle.model,
                        year: vehicle.year,
                        plateNumber: vehicle.plateNumber,
                        vin: vehicle.vin,
                        notes: vehicle.notes
                    }
                });
                return { customer: newCustomer, vehicle: newVehicle };
            });
            if (req.user) {
                await prisma.activityLog.create({
                    data: {
                        userId: req.user.id,
                        action: 'CREATE_CUSTOMER',
                        entityType: 'CUSTOMER',
                        entityId: result.customer.id,
                        details: JSON.stringify({
                            customerName: name,
                            vehicle: `${vehicle.make} ${vehicle.model}`,
                            timestamp: new Date().toISOString()
                        })
                    }
                });
            }
            const customerWithVehicle = await prisma.customer.findUnique({
                where: { id: result.customer.id },
                include: { vehicles: true }
            });
            res.status(201).json({
                success: true,
                data: customerWithVehicle,
                message: 'Customer created successfully'
            });
        }
        catch (error) {
            console.error('Create customer error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    async update(req, res) {
        try {
            const { id } = req.params;
            const { name, phone, email, address, notes } = req.body;
            const existingCustomer = await prisma.customer.findUnique({
                where: { id }
            });
            if (!existingCustomer) {
                return res.status(404).json({
                    success: false,
                    error: 'Customer not found'
                });
            }
            if (phone && phone !== existingCustomer.phone) {
                const phoneConflict = await prisma.customer.findUnique({
                    where: { phone }
                });
                if (phoneConflict) {
                    return res.status(409).json({
                        success: false,
                        error: 'Another customer with this phone number already exists'
                    });
                }
            }
            const updatedCustomer = await prisma.customer.update({
                where: { id },
                data: {
                    ...(name && { name }),
                    ...(phone && { phone }),
                    ...(email && { email }),
                    ...(address && { address }),
                    ...(notes && { notes })
                },
                include: { vehicles: true }
            });
            if (req.user) {
                await prisma.activityLog.create({
                    data: {
                        userId: req.user.id,
                        action: 'UPDATE_CUSTOMER',
                        entityType: 'CUSTOMER',
                        entityId: id,
                        details: JSON.stringify({
                            customerName: updatedCustomer.name,
                            changes: req.body,
                            timestamp: new Date().toISOString()
                        })
                    }
                });
            }
            res.json({
                success: true,
                data: updatedCustomer,
                message: 'Customer updated successfully'
            });
        }
        catch (error) {
            console.error('Update customer error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    async delete(req, res) {
        try {
            const { id } = req.params;
            const customer = await prisma.customer.findUnique({
                where: { id },
                include: {
                    jobs: true,
                    invoices: true
                }
            });
            if (!customer) {
                return res.status(404).json({
                    success: false,
                    error: 'Customer not found'
                });
            }
            const activeJobs = customer.jobs.filter(job => job.status === 'PENDING' || job.status === 'IN_PROGRESS');
            const unpaidInvoices = customer.invoices.filter(invoice => invoice.status === 'SENT' || invoice.status === 'OVERDUE');
            if (activeJobs.length > 0 || unpaidInvoices.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Cannot delete customer with active jobs or unpaid invoices'
                });
            }
            await prisma.customer.delete({
                where: { id }
            });
            if (req.user) {
                await prisma.activityLog.create({
                    data: {
                        userId: req.user.id,
                        action: 'DELETE_CUSTOMER',
                        entityType: 'CUSTOMER',
                        entityId: id,
                        details: JSON.stringify({
                            customerName: customer.name,
                            timestamp: new Date().toISOString()
                        })
                    }
                });
            }
            res.json({
                success: true,
                message: 'Customer deleted successfully'
            });
        }
        catch (error) {
            console.error('Delete customer error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    async getHistory(req, res) {
        try {
            const { id } = req.params;
            const { page = "1", limit = "10" } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);
            const customer = await prisma.customer.findUnique({
                where: { id },
                select: { id: true, name: true }
            });
            if (!customer) {
                return res.status(404).json({
                    success: false,
                    error: 'Customer not found'
                });
            }
            const jobs = await prisma.job.findMany({
                where: { customerId: id },
                include: {
                    vehicle: {
                        select: { make: true, model: true, plateNumber: true }
                    },
                    assignedMechanic: {
                        select: { name: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            });
            const total = await prisma.job.count({
                where: { customerId: id }
            });
            res.json({
                success: true,
                data: {
                    customer,
                    jobs
                },
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            });
        }
        catch (error) {
            console.error('Get customer history error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    async search(req, res) {
        try {
            const { q } = req.query;
            if (!q || typeof q !== 'string' || q.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    error: 'Search query must be at least 2 characters'
                });
            }
            const searchTerm = q.trim();
            const customers = await prisma.customer.findMany({
                where: {
                    OR: [
                        { name: { contains: searchTerm } },
                        { phone: { contains: searchTerm } },
                        { email: { contains: searchTerm } },
                        {
                            vehicles: {
                                some: {
                                    OR: [
                                        { make: { contains: searchTerm } },
                                        { model: { contains: searchTerm } },
                                        { plateNumber: { contains: searchTerm } }
                                    ]
                                }
                            }
                        }
                    ]
                },
                include: {
                    vehicles: {
                        select: {
                            id: true,
                            make: true,
                            model: true,
                            year: true,
                            plateNumber: true
                        }
                    }
                },
                take: 10
            });
            res.json({
                success: true,
                data: customers
            });
        }
        catch (error) {
            console.error('Search customers error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
};
