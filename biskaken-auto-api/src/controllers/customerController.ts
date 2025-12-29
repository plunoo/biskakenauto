import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest, ApiResponse, Customer, CustomerQuery } from '../types';

/**
 * Customer Controller
 * Handles customer and vehicle management operations
 */
export const customerController = {
  /**
   * Get all customers with pagination and search
   */
  async list(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const { page = "1", limit = "20", search }: CustomerQuery = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Build search conditions
      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
          { email: { contains: search, mode: 'insensitive' } },
          {
            vehicles: {
              some: {
                OR: [
                  { make: { contains: search, mode: 'insensitive' } },
                  { model: { contains: search, mode: 'insensitive' } },
                  { plateNumber: { contains: search, mode: 'insensitive' } }
                ]
              }
            }
          }
        ];
      }

      // Get customers with vehicles
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

      // Get total count for pagination
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
    } catch (error: any) {
      console.error('List customers error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Get single customer by ID
   */
  async getById(req: AuthRequest, res: Response<ApiResponse>) {
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
            take: 10 // Latest 10 jobs
          },
          invoices: {
            orderBy: { createdAt: 'desc' },
            take: 5 // Latest 5 invoices
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
    } catch (error: any) {
      console.error('Get customer error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Create new customer with vehicle
   */
  async create(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const { name, phone, email, address, notes, vehicle } = req.body;

      // Check if customer with phone already exists
      const existingCustomer = await prisma.customer.findUnique({
        where: { phone }
      });

      if (existingCustomer) {
        return res.status(409).json({
          success: false,
          error: 'Customer with this phone number already exists'
        });
      }

      // Check if vehicle plate number already exists (if provided)
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

      // Create customer with vehicle in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create customer
        const newCustomer = await tx.customer.create({
          data: {
            name,
            phone,
            email,
            address,
            notes
          }
        });

        // Create vehicle
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

      // Log activity
      if (req.user) {
        await prisma.activityLog.create({
          data: {
            userId: req.user.id,
            action: 'CREATE_CUSTOMER',
            entityType: 'CUSTOMER',
            entityId: result.customer.id,
            details: {
              customerName: name,
              vehicle: `${vehicle.make} ${vehicle.model}`,
              timestamp: new Date().toISOString()
            }
          }
        });
      }

      // Return customer with vehicle
      const customerWithVehicle = await prisma.customer.findUnique({
        where: { id: result.customer.id },
        include: { vehicles: true }
      });

      res.status(201).json({
        success: true,
        data: customerWithVehicle,
        message: 'Customer created successfully'
      });
    } catch (error: any) {
      console.error('Create customer error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Update customer
   */
  async update(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const { id } = req.params;
      const { name, phone, email, address, notes } = req.body;

      // Check if customer exists
      const existingCustomer = await prisma.customer.findUnique({
        where: { id }
      });

      if (!existingCustomer) {
        return res.status(404).json({
          success: false,
          error: 'Customer not found'
        });
      }

      // Check if phone number is being changed and conflicts with another customer
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

      // Update customer
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

      // Log activity
      if (req.user) {
        await prisma.activityLog.create({
          data: {
            userId: req.user.id,
            action: 'UPDATE_CUSTOMER',
            entityType: 'CUSTOMER',
            entityId: id,
            details: {
              customerName: updatedCustomer.name,
              changes: req.body,
              timestamp: new Date().toISOString()
            }
          }
        });
      }

      res.json({
        success: true,
        data: updatedCustomer,
        message: 'Customer updated successfully'
      });
    } catch (error: any) {
      console.error('Update customer error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Delete customer (Admin only)
   */
  async delete(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const { id } = req.params;

      // Check if customer exists
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

      // Check if customer has active jobs or unpaid invoices
      const activeJobs = customer.jobs.filter(job => 
        job.status === 'PENDING' || job.status === 'IN_PROGRESS'
      );
      const unpaidInvoices = customer.invoices.filter(invoice => 
        invoice.status === 'SENT' || invoice.status === 'OVERDUE'
      );

      if (activeJobs.length > 0 || unpaidInvoices.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete customer with active jobs or unpaid invoices'
        });
      }

      // Delete customer (this will cascade to vehicles)
      await prisma.customer.delete({
        where: { id }
      });

      // Log activity
      if (req.user) {
        await prisma.activityLog.create({
          data: {
            userId: req.user.id,
            action: 'DELETE_CUSTOMER',
            entityType: 'CUSTOMER',
            entityId: id,
            details: {
              customerName: customer.name,
              timestamp: new Date().toISOString()
            }
          }
        });
      }

      res.json({
        success: true,
        message: 'Customer deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete customer error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Get customer job history
   */
  async getHistory(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const { id } = req.params;
      const { page = "1", limit = "10" } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Check if customer exists
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

      // Get job history
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
    } catch (error: any) {
      console.error('Get customer history error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Search customers
   */
  async search(req: AuthRequest, res: Response<ApiResponse>) {
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
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { phone: { contains: searchTerm } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            {
              vehicles: {
                some: {
                  OR: [
                    { make: { contains: searchTerm, mode: 'insensitive' } },
                    { model: { contains: searchTerm, mode: 'insensitive' } },
                    { plateNumber: { contains: searchTerm, mode: 'insensitive' } }
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
        take: 10 // Limit search results
      });

      res.json({
        success: true,
        data: customers
      });
    } catch (error: any) {
      console.error('Search customers error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};