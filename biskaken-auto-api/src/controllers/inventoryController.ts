import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest, ApiResponse, InventoryQuery } from '../types';
import { aiService } from '../services/aiService';

/**
 * Inventory Controller
 * Handles parts inventory management operations
 */
export const inventoryController = {
  /**
   * Get all inventory items with filtering and pagination
   */
  async list(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const { page = "1", limit = "20", category, lowStock }: InventoryQuery = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Build filter conditions
      const where: any = {};
      
      if (category) {
        where.category = { contains: category, mode: 'insensitive' };
      }

      if (lowStock === 'true') {
        where.stockQty = { lte: prisma.inventory.fields.reorderLevel };
      }

      const items = await prisma.inventory.findMany({
        where,
        include: {
          _count: {
            select: {
              jobParts: true,
              invoiceItems: true
            }
          }
        },
        orderBy: [
          { stockQty: 'asc' }, // Low stock items first
          { partName: 'asc' }
        ],
        skip,
        take
      });

      const total = await prisma.inventory.count({ where });

      // Add low stock indicators
      const itemsWithStatus = items.map(item => ({
        ...item,
        isLowStock: item.stockQty <= item.reorderLevel,
        isOutOfStock: item.stockQty === 0
      }));

      res.json({
        success: true,
        data: itemsWithStatus,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error: any) {
      console.error('List inventory error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Get single inventory item by ID
   */
  async getById(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const { id } = req.params;

      const item = await prisma.inventory.findUnique({
        where: { id },
        include: {
          jobParts: {
            include: {
              job: {
                select: {
                  id: true,
                  jobNumber: true,
                  createdAt: true,
                  customer: {
                    select: { name: true }
                  }
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 10 // Recent usage history
          },
          _count: {
            select: {
              jobParts: true,
              invoiceItems: true
            }
          }
        }
      });

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Inventory item not found'
        });
      }

      // Calculate usage statistics
      const usageHistory = item.jobParts.map(jp => ({
        date: jp.createdAt.toISOString().split('T')[0],
        quantityUsed: jp.quantity,
        jobNumber: jp.job.jobNumber,
        customer: jp.job.customer.name
      }));

      const totalUsed = item.jobParts.reduce((sum, jp) => sum + jp.quantity, 0);
      const avgMonthlyUsage = totalUsed > 0 ? totalUsed / Math.max(item.jobParts.length, 1) : 0;

      res.json({
        success: true,
        data: {
          ...item,
          isLowStock: item.stockQty <= item.reorderLevel,
          isOutOfStock: item.stockQty === 0,
          usage: {
            totalUsed,
            avgMonthlyUsage: Math.round(avgMonthlyUsage * 100) / 100,
            history: usageHistory
          }
        }
      });
    } catch (error: any) {
      console.error('Get inventory item error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Create new inventory item
   */
  async create(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const {
        partName,
        category,
        stockQty,
        reorderLevel,
        unitCost,
        sellingPrice,
        supplier,
        notes
      } = req.body;

      // Check if part with same name already exists
      const existingPart = await prisma.inventory.findFirst({
        where: {
          partName: { equals: partName, mode: 'insensitive' }
        }
      });

      if (existingPart) {
        return res.status(409).json({
          success: false,
          error: 'Part with this name already exists'
        });
      }

      // Validate pricing
      if (sellingPrice <= unitCost) {
        return res.status(400).json({
          success: false,
          error: 'Selling price must be higher than unit cost'
        });
      }

      const item = await prisma.inventory.create({
        data: {
          partName,
          category,
          stockQty,
          reorderLevel,
          unitCost,
          sellingPrice,
          supplier,
          notes
        }
      });

      // Log activity
      if (req.user) {
        await prisma.activityLog.create({
          data: {
            userId: req.user.id,
            action: 'CREATE_INVENTORY_ITEM',
            entityType: 'INVENTORY',
            entityId: item.id,
            details: {
              partName,
              category,
              stockQty,
              timestamp: new Date().toISOString()
            }
          }
        });
      }

      res.status(201).json({
        success: true,
        data: item,
        message: 'Inventory item created successfully'
      });
    } catch (error: any) {
      console.error('Create inventory item error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Update inventory item
   */
  async update(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if item exists
      const existingItem = await prisma.inventory.findUnique({
        where: { id }
      });

      if (!existingItem) {
        return res.status(404).json({
          success: false,
          error: 'Inventory item not found'
        });
      }

      // Validate pricing if being updated
      if (updateData.sellingPrice && updateData.unitCost) {
        if (updateData.sellingPrice <= updateData.unitCost) {
          return res.status(400).json({
            success: false,
            error: 'Selling price must be higher than unit cost'
          });
        }
      }

      // Check for name conflicts if name is being changed
      if (updateData.partName && updateData.partName !== existingItem.partName) {
        const nameConflict = await prisma.inventory.findFirst({
          where: {
            partName: { equals: updateData.partName, mode: 'insensitive' },
            id: { not: id }
          }
        });

        if (nameConflict) {
          return res.status(409).json({
            success: false,
            error: 'Another part with this name already exists'
          });
        }
      }

      const updatedItem = await prisma.inventory.update({
        where: { id },
        data: updateData
      });

      // Log activity
      if (req.user) {
        await prisma.activityLog.create({
          data: {
            userId: req.user.id,
            action: 'UPDATE_INVENTORY_ITEM',
            entityType: 'INVENTORY',
            entityId: id,
            details: {
              partName: updatedItem.partName,
              changes: updateData,
              timestamp: new Date().toISOString()
            }
          }
        });
      }

      res.json({
        success: true,
        data: updatedItem,
        message: 'Inventory item updated successfully'
      });
    } catch (error: any) {
      console.error('Update inventory item error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Delete inventory item (Admin only)
   */
  async delete(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const { id } = req.params;

      // Check if item exists
      const item = await prisma.inventory.findUnique({
        where: { id },
        include: {
          jobParts: true,
          invoiceItems: true
        }
      });

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Inventory item not found'
        });
      }

      // Check if item has been used in jobs or invoices
      if (item.jobParts.length > 0 || item.invoiceItems.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete inventory item that has been used in jobs or invoices'
        });
      }

      await prisma.inventory.delete({
        where: { id }
      });

      // Log activity
      if (req.user) {
        await prisma.activityLog.create({
          data: {
            userId: req.user.id,
            action: 'DELETE_INVENTORY_ITEM',
            entityType: 'INVENTORY',
            entityId: id,
            details: {
              partName: item.partName,
              timestamp: new Date().toISOString()
            }
          }
        });
      }

      res.json({
        success: true,
        message: 'Inventory item deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete inventory item error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Get low stock alerts
   */
  async getLowStock(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const lowStockItems = await prisma.inventory.findMany({
        where: {
          OR: [
            { stockQty: { lte: prisma.inventory.fields.reorderLevel } },
            { stockQty: 0 }
          ]
        },
        orderBy: [
          { stockQty: 'asc' },
          { reorderLevel: 'desc' }
        ]
      });

      const alerts = lowStockItems.map(item => ({
        ...item,
        alertType: item.stockQty === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
        urgency: item.stockQty === 0 ? 'HIGH' : item.stockQty <= item.reorderLevel / 2 ? 'MEDIUM' : 'LOW'
      }));

      res.json({
        success: true,
        data: alerts,
        message: `${alerts.length} items require attention`
      });
    } catch (error: any) {
      console.error('Get low stock error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Update stock quantity (for stock adjustments)
   */
  async updateStock(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const { id } = req.params;
      const { quantity, type, reason } = req.body; // type: 'ADD' | 'REMOVE' | 'SET'

      const item = await prisma.inventory.findUnique({
        where: { id }
      });

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Inventory item not found'
        });
      }

      let newStock: number;
      switch (type) {
        case 'ADD':
          newStock = item.stockQty + quantity;
          break;
        case 'REMOVE':
          newStock = Math.max(0, item.stockQty - quantity);
          break;
        case 'SET':
          newStock = Math.max(0, quantity);
          break;
        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid stock adjustment type'
          });
      }

      const updatedItem = await prisma.inventory.update({
        where: { id },
        data: { stockQty: newStock }
      });

      // Log activity
      if (req.user) {
        await prisma.activityLog.create({
          data: {
            userId: req.user.id,
            action: 'ADJUST_INVENTORY_STOCK',
            entityType: 'INVENTORY',
            entityId: id,
            details: {
              partName: item.partName,
              oldStock: item.stockQty,
              newStock,
              adjustmentType: type,
              quantity,
              reason,
              timestamp: new Date().toISOString()
            }
          }
        });
      }

      res.json({
        success: true,
        data: updatedItem,
        message: `Stock ${type.toLowerCase()}ed successfully`
      });
    } catch (error: any) {
      console.error('Update stock error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * AI-powered reorder prediction
   */
  async getAIPrediction(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const { id } = req.params;

      const item = await prisma.inventory.findUnique({
        where: { id },
        include: {
          jobParts: {
            select: {
              quantity: true,
              createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 30 // Last 30 usage records
          }
        }
      });

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'Inventory item not found'
        });
      }

      // Prepare usage history for AI
      const usageHistory = item.jobParts.map(jp => ({
        date: jp.createdAt.toISOString().split('T')[0],
        quantityUsed: jp.quantity
      }));

      // Get AI prediction
      const prediction = await aiService.predictReorder({
        partName: item.partName,
        currentStock: item.stockQty,
        reorderLevel: item.reorderLevel,
        usageHistory,
        averageLeadTime: 7 // Default 7 days lead time
      });

      res.json({
        success: true,
        data: {
          item: {
            id: item.id,
            partName: item.partName,
            currentStock: item.stockQty,
            reorderLevel: item.reorderLevel
          },
          prediction
        }
      });
    } catch (error: any) {
      console.error('AI prediction error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Get usage report for inventory
   */
  async getUsageReport(req: AuthRequest, res: Response<ApiResponse>) {
    try {
      const { from, to } = req.query;
      const startDate = from ? new Date(from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days ago
      const endDate = to ? new Date(to as string) : new Date();

      // Get usage data within date range
      const usageData = await prisma.jobPart.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          part: {
            select: {
              id: true,
              partName: true,
              category: true,
              stockQty: true,
              reorderLevel: true
            }
          },
          job: {
            select: {
              jobNumber: true,
              customer: {
                select: { name: true }
              }
            }
          }
        }
      });

      // Aggregate usage by part
      const usageByPart = usageData.reduce((acc: any, usage) => {
        const partId = usage.part.id;
        if (!acc[partId]) {
          acc[partId] = {
            part: usage.part,
            totalUsed: 0,
            usageCount: 0,
            totalValue: 0,
            jobs: []
          };
        }
        acc[partId].totalUsed += usage.quantity;
        acc[partId].usageCount += 1;
        acc[partId].totalValue += usage.total;
        acc[partId].jobs.push({
          jobNumber: usage.job.jobNumber,
          customer: usage.job.customer.name,
          quantity: usage.quantity,
          date: usage.createdAt
        });
        return acc;
      }, {});

      const reportData = Object.values(usageByPart)
        .sort((a: any, b: any) => b.totalUsed - a.totalUsed) // Sort by most used
        .slice(0, 20); // Top 20 most used parts

      res.json({
        success: true,
        data: {
          reportPeriod: {
            from: startDate.toISOString().split('T')[0],
            to: endDate.toISOString().split('T')[0]
          },
          totalPartsUsed: usageData.reduce((sum, u) => sum + u.quantity, 0),
          totalValue: usageData.reduce((sum, u) => sum + u.total, 0),
          topUsedParts: reportData
        }
      });
    } catch (error: any) {
      console.error('Get usage report error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};