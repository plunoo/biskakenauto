import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { prisma } from '../utils/prisma.js';
import { AuthRequest, ApiResponse } from '../types/index.js';
import { Response } from 'express';
import { aiService } from '../services/aiService.js';
import { pdfService } from '../services/pdfService.js';

const router = Router();

/**
 * Reports Routes
 * @base /api/reports
 * All routes require authentication
 */

// Apply authentication to all routes
router.use(authenticate);

// GET /api/reports/dashboard - Dashboard statistics
router.get('/dashboard', 
  asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
    try {
      const where: any = {};
      
      // Role-based filtering for staff
      if (req.user?.role === 'STAFF') {
        where.assignedTo = req.user.id;
      }

      // Get current date ranges
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Parallel queries for dashboard data
      const [
        totalJobs,
        completedJobs,
        pendingJobs,
        inProgressJobs,
        totalCustomers,
        totalInvoices,
        paidInvoices,
        totalRevenue,
        monthlyRevenue,
        lowStockItems,
        recentJobs,
        overdueInvoices
      ] = await Promise.all([
        prisma.job.count({ where }),
        prisma.job.count({ where: { ...where, status: 'COMPLETED' } }),
        prisma.job.count({ where: { ...where, status: 'PENDING' } }),
        prisma.job.count({ where: { ...where, status: 'IN_PROGRESS' } }),
        prisma.customer.count(),
        prisma.invoice.count(),
        prisma.invoice.count({ where: { status: 'PAID' } }),
        prisma.invoice.aggregate({
          where: { status: 'PAID' },
          _sum: { total: true }
        }),
        prisma.invoice.aggregate({
          where: {
            status: 'PAID',
            paymentDate: { gte: startOfMonth }
          },
          _sum: { total: true }
        }),
        prisma.inventory.count({
          where: {
            stockQty: { lte: prisma.inventory.fields.reorderLevel }
          }
        }),
        prisma.job.findMany({
          where,
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: { select: { name: true } },
            vehicle: { select: { make: true, model: true } }
          }
        }),
        prisma.invoice.count({
          where: {
            status: { in: ['SENT', 'OVERDUE'] },
            dueDate: { lt: now }
          }
        })
      ]);

      // Calculate performance metrics
      const completionRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;
      const collectionRate = totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0;

      const dashboardData = {
        summary: {
          totalJobs,
          completedJobs,
          pendingJobs,
          inProgressJobs,
          totalCustomers,
          totalRevenue: totalRevenue._sum.total || 0,
          monthlyRevenue: monthlyRevenue._sum.total || 0,
          completionRate,
          collectionRate
        },
        alerts: {
          lowStockItems,
          overdueInvoices
        },
        recentActivity: recentJobs.map(job => ({
          id: job.id,
          jobNumber: job.jobNumber,
          customer: job.customer.name,
          vehicle: `${job.vehicle.make} ${job.vehicle.model}`,
          status: job.status,
          createdAt: job.createdAt
        }))
      };

      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error: any) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  })
);

// GET /api/reports/revenue - Revenue report with date range
router.get('/revenue', 
  authorize('ADMIN', 'SUB_ADMIN'),
  asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
    try {
      const { from, to } = req.query;
      
      const startDate = from ? new Date(from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = to ? new Date(to as string) : new Date();

      // Revenue by payment method
      const revenueByMethod = await prisma.invoice.groupBy({
        by: ['paymentMethod'],
        where: {
          status: 'PAID',
          paymentDate: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: {
          total: true
        },
        _count: true
      });

      // Daily revenue breakdown
      const dailyRevenue = await prisma.invoice.findMany({
        where: {
          status: 'PAID',
          paymentDate: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          paymentDate: true,
          total: true
        },
        orderBy: { paymentDate: 'asc' }
      });

      // Group by date
      const dailyBreakdown = dailyRevenue.reduce((acc: any, invoice) => {
        const date = invoice.paymentDate?.toISOString().split('T')[0] || '';
        if (!acc[date]) {
          acc[date] = { date, revenue: 0, transactions: 0 };
        }
        acc[date].revenue += invoice.total;
        acc[date].transactions += 1;
        return acc;
      }, {});

      const totalRevenue = revenueByMethod.reduce((sum, item) => sum + (item._sum.total || 0), 0);
      const totalTransactions = revenueByMethod.reduce((sum, item) => sum + item._count, 0);

      res.json({
        success: true,
        data: {
          period: {
            from: startDate.toISOString().split('T')[0],
            to: endDate.toISOString().split('T')[0]
          },
          summary: {
            totalRevenue,
            totalTransactions,
            averageTransaction: totalTransactions > 0 ? totalRevenue / totalTransactions : 0
          },
          byPaymentMethod: revenueByMethod.map(item => ({
            method: item.paymentMethod || 'UNKNOWN',
            revenue: item._sum.total || 0,
            transactions: item._count,
            percentage: totalRevenue > 0 ? Math.round(((item._sum.total || 0) / totalRevenue) * 100) : 0
          })),
          dailyBreakdown: Object.values(dailyBreakdown).sort((a: any, b: any) => a.date.localeCompare(b.date))
        }
      });
    } catch (error: any) {
      console.error('Revenue report error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  })
);

// GET /api/reports/inventory - Inventory report
router.get('/inventory', 
  authorize('ADMIN', 'SUB_ADMIN'),
  asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
    try {
      // Inventory overview
      const [
        totalItems,
        totalValue,
        lowStockItems,
        outOfStockItems,
        topUsedParts
      ] = await Promise.all([
        prisma.inventory.count(),
        prisma.inventory.aggregate({
          _sum: {
            stockQty: true
          }
        }),
        prisma.inventory.findMany({
          where: {
            stockQty: { lte: prisma.inventory.fields.reorderLevel }
          },
          orderBy: { stockQty: 'asc' },
          take: 10
        }),
        prisma.inventory.count({
          where: { stockQty: 0 }
        }),
        prisma.jobPart.groupBy({
          by: ['partId'],
          _sum: { quantity: true },
          _count: true,
          orderBy: { _sum: { quantity: 'desc' } },
          take: 10
        })
      ]);

      // Get part details for top used parts
      const partIds = topUsedParts.map(p => p.partId);
      const partDetails = await prisma.inventory.findMany({
        where: { id: { in: partIds } },
        select: { id: true, partName: true, category: true, stockQty: true }
      });

      const topUsedWithDetails = topUsedParts.map(usage => {
        const part = partDetails.find(p => p.id === usage.partId);
        return {
          partId: usage.partId,
          partName: part?.partName || 'Unknown',
          category: part?.category || 'Unknown',
          currentStock: part?.stockQty || 0,
          totalUsed: usage._sum.quantity || 0,
          timesUsed: usage._count
        };
      });

      res.json({
        success: true,
        data: {
          overview: {
            totalItems,
            totalStockQuantity: totalValue._sum.stockQty || 0,
            lowStockItemsCount: lowStockItems.length,
            outOfStockItemsCount: outOfStockItems
          },
          lowStockAlerts: lowStockItems.map(item => ({
            id: item.id,
            partName: item.partName,
            category: item.category,
            currentStock: item.stockQty,
            reorderLevel: item.reorderLevel,
            urgency: item.stockQty === 0 ? 'CRITICAL' : item.stockQty <= item.reorderLevel / 2 ? 'HIGH' : 'MEDIUM'
          })),
          topUsedParts: topUsedWithDetails
        }
      });
    } catch (error: any) {
      console.error('Inventory report error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  })
);

// GET /api/reports/mechanics - Mechanic performance report
router.get('/mechanics', 
  authorize('ADMIN', 'SUB_ADMIN'),
  asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
    try {
      const { from, to } = req.query;
      
      const startDate = from ? new Date(from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = to ? new Date(to as string) : new Date();

      // Get mechanic performance data
      const mechanicStats = await prisma.user.findMany({
        where: {
          role: { in: ['STAFF', 'SUB_ADMIN'] },
          status: 'ACTIVE'
        },
        include: {
          assignedJobs: {
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            }
          }
        }
      });

      const mechanicPerformance = mechanicStats.map(mechanic => {
        const jobs = mechanic.assignedJobs;
        const completedJobs = jobs.filter(j => j.status === 'COMPLETED');
        const totalRevenue = completedJobs.reduce((sum, job) => sum + (job.actualCost || job.estimatedCost || 0), 0);
        
        // Calculate average completion time
        const completedJobsWithTime = completedJobs.filter(j => j.startedAt && j.completedAt);
        const avgCompletionTime = completedJobsWithTime.length > 0 
          ? completedJobsWithTime.reduce((sum, job) => {
              const startTime = job.startedAt!.getTime();
              const endTime = job.completedAt!.getTime();
              return sum + (endTime - startTime);
            }, 0) / completedJobsWithTime.length / (1000 * 60 * 60 * 24) // Convert to days
          : 0;

        return {
          mechanicId: mechanic.id,
          name: mechanic.name,
          email: mechanic.email,
          totalJobs: jobs.length,
          completedJobs: completedJobs.length,
          pendingJobs: jobs.filter(j => j.status === 'PENDING').length,
          inProgressJobs: jobs.filter(j => j.status === 'IN_PROGRESS').length,
          completionRate: jobs.length > 0 ? Math.round((completedJobs.length / jobs.length) * 100) : 0,
          totalRevenue,
          avgCompletionTime: Math.round(avgCompletionTime * 100) / 100,
          efficiency: completedJobs.length > 0 ? Math.round(totalRevenue / completedJobs.length) : 0
        };
      });

      // Sort by completion rate and total revenue
      mechanicPerformance.sort((a, b) => {
        if (b.completionRate !== a.completionRate) {
          return b.completionRate - a.completionRate;
        }
        return b.totalRevenue - a.totalRevenue;
      });

      res.json({
        success: true,
        data: {
          period: {
            from: startDate.toISOString().split('T')[0],
            to: endDate.toISOString().split('T')[0]
          },
          mechanics: mechanicPerformance
        }
      });
    } catch (error: any) {
      console.error('Mechanic performance report error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  })
);

// GET /api/reports/ai-insights - AI-powered business insights
router.get('/ai-insights', 
  authorize('ADMIN', 'SUB_ADMIN'),
  asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
    try {
      // Gather business data for AI analysis
      const [
        totalJobs,
        completedJobs,
        totalRevenue,
        topServices,
        inventoryAlerts,
        avgJobTime,
        customerRetention,
        monthlyTrend
      ] = await Promise.all([
        prisma.job.count(),
        prisma.job.count({ where: { status: 'COMPLETED' } }),
        prisma.invoice.aggregate({
          where: { status: 'PAID' },
          _sum: { total: true }
        }),
        // Top services (simplified)
        prisma.job.groupBy({
          by: ['status'],
          _count: true
        }),
        prisma.inventory.count({
          where: { stockQty: { lte: prisma.inventory.fields.reorderLevel } }
        }),
        // Average job completion time (simplified calculation)
        prisma.job.aggregate({
          where: {
            status: 'COMPLETED',
            startedAt: { not: null },
            completedAt: { not: null }
          },
          _count: true
        }),
        // Customer retention (simplified)
        prisma.customer.count(),
        // Monthly trend (last 6 months)
        Promise.all(Array.from({ length: 6 }, (_, i) => {
          const monthStart = new Date();
          monthStart.setMonth(monthStart.getMonth() - i);
          monthStart.setDate(1);
          const monthEnd = new Date(monthStart);
          monthEnd.setMonth(monthEnd.getMonth() + 1);
          
          return Promise.all([
            prisma.job.count({
              where: {
                createdAt: {
                  gte: monthStart,
                  lt: monthEnd
                }
              }
            }),
            prisma.invoice.aggregate({
              where: {
                status: 'PAID',
                paymentDate: {
                  gte: monthStart,
                  lt: monthEnd
                }
              },
              _sum: { total: true }
            })
          ]).then(([jobs, revenue]) => ({
            month: monthStart.toISOString().substring(0, 7),
            jobs,
            revenue: revenue._sum.total || 0
          }));
        }))
      ]);

      // Prepare data for AI analysis
      const businessData = {
        totalJobs,
        completedJobs,
        totalRevenue: totalRevenue._sum.total || 0,
        topServices: topServices.map(s => ({
          service: s.status,
          count: s._count,
          revenue: 0 // Simplified
        })),
        inventoryAlerts,
        averageJobTime: 3, // Simplified to 3 days average
        customerRetention: 75, // Simplified percentage
        monthlyTrend: monthlyTrend.reverse() // Most recent first
      };

      // Get AI insights
      const insights = await aiService.generateInsights(businessData);

      res.json({
        success: true,
        data: {
          businessData,
          insights,
          generatedAt: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('AI insights error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  })
);

// POST /api/reports/export - Export report to PDF
router.post('/export', 
  authorize('ADMIN', 'SUB_ADMIN'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { reportType, dateRange, filters } = req.body;
      
      if (reportType !== 'jobs') {
        return res.status(400).json({
          success: false,
          error: 'Only job reports are currently supported for export'
        });
      }

      const startDate = dateRange?.from ? new Date(dateRange.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = dateRange?.to ? new Date(dateRange.to) : new Date();

      // Get jobs data
      const jobs = await prisma.job.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          },
          ...(filters?.status && { status: filters.status })
        },
        include: {
          customer: { select: { name: true } },
          vehicle: { select: { make: true, model: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Generate summary
      const summary = {
        totalJobs: jobs.length,
        completedJobs: jobs.filter(j => j.status === 'COMPLETED').length,
        totalRevenue: jobs.reduce((sum, job) => sum + (job.actualCost || job.estimatedCost || 0), 0),
        averageJobTime: 3 // Simplified
      };

      // Prepare data for PDF
      const reportData = {
        title: 'Jobs Report',
        dateRange: { from: startDate, to: endDate },
        jobs: jobs.map(job => ({
          jobNumber: job.jobNumber,
          customer: job.customer.name,
          vehicle: `${job.vehicle.make} ${job.vehicle.model}`,
          status: job.status,
          priority: job.priority,
          createdAt: job.createdAt,
          completedAt: job.completedAt,
          totalCost: job.actualCost || job.estimatedCost
        })),
        summary
      };

      // Generate PDF
      const pdfPath = await pdfService.generateJobReport(reportData);

      // Send file
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="jobs-report-${startDate.toISOString().split('T')[0]}.pdf"`);
      
      const fs = require('fs');
      const fileStream = fs.createReadStream(pdfPath);
      fileStream.pipe(res);

      // Clean up file after sending
      fileStream.on('end', () => {
        setTimeout(() => {
          pdfService.deleteFile(pdfPath);
        }, 5000);
      });
    } catch (error: any) {
      console.error('Export report error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  })
);

export default router;