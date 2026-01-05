import { Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { AuthRequest, ApiResponse, JobQuery } from '../types/index.js';

/**
 * Job Controller
 * Handles vehicle repair job management operations
 */
export const jobController = {
  /**
   * Get all jobs with filtering and pagination
   */
  async list(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const { page = "1", limit = "20", status, priority, assignedTo }: JobQuery = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Build filter conditions
      const where: any = {};

      // Role-based filtering: Staff can only see their assigned jobs
      if (req.user?.role === 'STAFF') {
        where.assignedTo = req.user.id;
      }

      if (status) {
        where.status = status;
      }

      if (priority) {
        where.priority = priority;
      }

      if (assignedTo && req.user?.role !== 'STAFF') {
        where.assignedTo = assignedTo;
      }

      const jobs = await prisma.job.findMany({
        where,
        include: {
          customer: { 
            select: { 
              id: true, 
              name: true, 
              phone: true, 
              email: true 
            } 
          },
          vehicle: { 
            select: { 
              id: true, 
              make: true, 
              model: true, 
              year: true, 
              plateNumber: true 
            } 
          },
          assignedMechanic: { 
            select: { 
              id: true, 
              name: true 
            } 
          },
          jobParts: {
            include: {
              part: {
                select: {
                  id: true,
                  partName: true,
                  sellingPrice: true
                }
              }
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take
      });

      const total = await prisma.job.count({ where });

      res.json({
        success: true,
        data: jobs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error: any) {
      console.error('List jobs error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Get single job by ID
   */
  async getById(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const { id } = req.params;

      const job = await prisma.job.findUnique({
        where: { id },
        include: {
          customer: true,
          vehicle: true,
          assignedMechanic: {
            select: { id: true, name: true, email: true }
          },
          jobParts: {
            include: {
              part: {
                select: {
                  id: true,
                  partName: true,
                  category: true,
                  sellingPrice: true
                }
              }
            }
          },
          invoices: {
            select: {
              id: true,
              invoiceNumber: true,
              status: true,
              total: true,
              date: true
            }
          }
        }
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          error: 'Job not found'
        });
      }

      // Role-based access: Staff can only see their assigned jobs
      if (req.user?.role === 'STAFF' && job.assignedTo !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'You can only view your assigned jobs'
        });
      }

      res.json({
        success: true,
        data: job
      });
    } catch (error: any) {
      console.error('Get job error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Create new job
   */
  async create(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const {
        customerId,
        vehicleId,
        complaint,
        priority = 'MEDIUM',
        laborHours,
        laborRate,
        estimatedCost,
        expectedCompletion,
        notes
      } = req.body;

      // Verify customer and vehicle exist and are related
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: {
          vehicles: {
            where: { id: vehicleId }
          }
        }
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          error: 'Customer not found'
        });
      }

      if (customer.vehicles.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Vehicle does not belong to this customer'
        });
      }

      // Generate job number
      const jobCount = await prisma.job.count();
      const jobNumber = `J${String(jobCount + 1).padStart(4, '0')}`;

      // Create job
      const job = await prisma.job.create({
        data: {
          jobNumber,
          customerId,
          vehicleId,
          complaint,
          priority: priority as any,
          assignedTo: req.user?.id,
          laborHours,
          laborRate,
          estimatedCost,
          expectedCompletion: expectedCompletion ? new Date(expectedCompletion) : null,
          notes
        },
        include: {
          customer: {
            select: { id: true, name: true, phone: true }
          },
          vehicle: {
            select: { id: true, make: true, model: true, plateNumber: true }
          },
          assignedMechanic: {
            select: { id: true, name: true }
          }
        }
      });

      // Log activity
      if (req.user) {
        await prisma.activityLog.create({
          data: {
            userId: req.user.id,
            action: 'CREATE_JOB',
            entityType: 'JOB',
            entityId: job.id,
            details: JSON.stringify({
              jobNumber: job.jobNumber,
              customer: customer.name,
              vehicle: `${job.vehicle.make} ${job.vehicle.model}`,
              complaint: complaint.substring(0, 100),
              timestamp: new Date().toISOString()
            })
          }
        });
      }

      res.status(201).json({
        success: true,
        data: job,
        message: 'Job created successfully'
      });
    } catch (error: any) {
      console.error('Create job error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Update job
   */
  async update(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if job exists
      const existingJob = await prisma.job.findUnique({
        where: { id },
        include: {
          assignedMechanic: { select: { name: true } }
        }
      });

      if (!existingJob) {
        return res.status(404).json({
          success: false,
          error: 'Job not found'
        });
      }

      // Role-based access: Staff can only update their assigned jobs
      if (req.user?.role === 'STAFF' && existingJob.assignedTo !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'You can only update your assigned jobs'
        });
      }

      // Handle status change logic
      if (updateData.status) {
        if (updateData.status === 'IN_PROGRESS' && existingJob.status === 'PENDING') {
          updateData.startedAt = new Date();
        }
        if (updateData.status === 'COMPLETED' && existingJob.status !== 'COMPLETED') {
          updateData.completedAt = new Date();
        }
      }

      // Convert date strings to Date objects
      if (updateData.expectedCompletion) {
        updateData.expectedCompletion = new Date(updateData.expectedCompletion);
      }

      // Update job
      const updatedJob = await prisma.job.update({
        where: { id },
        data: updateData,
        include: {
          customer: {
            select: { id: true, name: true, phone: true }
          },
          vehicle: {
            select: { id: true, make: true, model: true, plateNumber: true }
          },
          assignedMechanic: {
            select: { id: true, name: true }
          }
        }
      });

      // Log activity
      if (req.user) {
        await prisma.activityLog.create({
          data: {
            userId: req.user.id,
            action: 'UPDATE_JOB',
            entityType: 'JOB',
            entityId: id,
            details: JSON.stringify({
              jobNumber: updatedJob.jobNumber,
              changes: updateData,
              timestamp: new Date().toISOString()
            })
          }
        });
      }

      res.json({
        success: true,
        data: updatedJob,
        message: 'Job updated successfully'
      });
    } catch (error: any) {
      console.error('Update job error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Update job status
   */
  async updateStatus(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const existingJob = await prisma.job.findUnique({
        where: { id },
        include: {
          customer: { select: { name: true, phone: true } },
          vehicle: { select: { make: true, model: true } }
        }
      });

      if (!existingJob) {
        return res.status(404).json({
          success: false,
          error: 'Job not found'
        });
      }

      // Role-based access
      if (req.user?.role === 'STAFF' && existingJob.assignedTo !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'You can only update status for your assigned jobs'
        });
      }

      const updateData: any = { status };

      // Add timestamp based on status
      if (status === 'IN_PROGRESS' && existingJob.status === 'PENDING') {
        updateData.startedAt = new Date();
      }
      
      if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }

      if (notes) {
        updateData.notes = notes;
      }

      const updatedJob = await prisma.job.update({
        where: { id },
        data: updateData,
        include: {
          customer: { select: { name: true, phone: true } },
          vehicle: { select: { make: true, model: true } }
        }
      });

      // Log activity
      if (req.user) {
        await prisma.activityLog.create({
          data: {
            userId: req.user.id,
            action: 'UPDATE_JOB_STATUS',
            entityType: 'JOB',
            entityId: id,
            details: JSON.stringify({
              jobNumber: updatedJob.jobNumber,
              oldStatus: existingJob.status,
              newStatus: status,
              timestamp: new Date().toISOString()
            })
          }
        });
      }

      res.json({
        success: true,
        data: updatedJob,
        message: `Job status updated to ${status}`
      });
    } catch (error: any) {
      console.error('Update job status error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Assign job to mechanic
   */
  async assign(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const { id } = req.params;
      const { mechanicId, notes } = req.body;

      // Check if job exists
      const job = await prisma.job.findUnique({
        where: { id }
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          error: 'Job not found'
        });
      }

      // Check if mechanic exists and is active staff
      const mechanic = await prisma.user.findUnique({
        where: { 
          id: mechanicId,
          status: 'ACTIVE'
        }
      });

      if (!mechanic) {
        return res.status(404).json({
          success: false,
          error: 'Mechanic not found or inactive'
        });
      }

      // Update job assignment
      const updatedJob = await prisma.job.update({
        where: { id },
        data: {
          assignedTo: mechanicId,
          ...(notes && { notes })
        },
        include: {
          customer: { select: { name: true } },
          vehicle: { select: { make: true, model: true } },
          assignedMechanic: { select: { name: true } }
        }
      });

      // Log activity
      if (req.user) {
        await prisma.activityLog.create({
          data: {
            userId: req.user.id,
            action: 'ASSIGN_JOB',
            entityType: 'JOB',
            entityId: id,
            details: JSON.stringify({
              jobNumber: updatedJob.jobNumber,
              mechanicName: mechanic.name,
              timestamp: new Date().toISOString()
            })
          }
        });
      }

      res.json({
        success: true,
        data: updatedJob,
        message: `Job assigned to ${mechanic.name}`
      });
    } catch (error: any) {
      console.error('Assign job error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Delete job (Admin only)
   */
  async delete(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const { id } = req.params;

      // Check if job exists
      const job = await prisma.job.findUnique({
        where: { id },
        include: {
          invoices: true,
          jobParts: true
        }
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          error: 'Job not found'
        });
      }

      // Check if job has invoices or parts
      if (job.invoices.length > 0 || job.jobParts.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete job with associated invoices or parts'
        });
      }

      // Only allow deletion if job is not completed
      if (job.status === 'COMPLETED') {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete completed job'
        });
      }

      await prisma.job.delete({
        where: { id }
      });

      // Log activity
      if (req.user) {
        await prisma.activityLog.create({
          data: {
            userId: req.user.id,
            action: 'DELETE_JOB',
            entityType: 'JOB',
            entityId: id,
            details: JSON.stringify({
              jobNumber: job.jobNumber,
              timestamp: new Date().toISOString()
            })
          }
        });
      }

      res.json({
        success: true,
        message: 'Job deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete job error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Get job statistics
   */
  async getStats(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const where: any = {};
      
      // Role-based filtering
      if (req.user?.role === 'STAFF') {
        where.assignedTo = req.user.id;
      }

      const [
        total,
        pending,
        inProgress,
        completed,
        cancelled,
        highPriority,
        overdue
      ] = await Promise.all([
        prisma.job.count({ where }),
        prisma.job.count({ where: { ...where, status: 'PENDING' } }),
        prisma.job.count({ where: { ...where, status: 'IN_PROGRESS' } }),
        prisma.job.count({ where: { ...where, status: 'COMPLETED' } }),
        prisma.job.count({ where: { ...where, status: 'CANCELLED' } }),
        prisma.job.count({ where: { ...where, priority: 'HIGH' } }),
        prisma.job.count({
          where: {
            ...where,
            expectedCompletion: { lt: new Date() },
            status: { in: ['PENDING', 'IN_PROGRESS'] }
          }
        })
      ]);

      const stats = {
        total,
        byStatus: {
          pending,
          inProgress,
          completed,
          cancelled
        },
        highPriority,
        overdue,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Get job stats error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};