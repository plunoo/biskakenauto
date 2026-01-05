import { prisma } from '../utils/prisma.js';
import { aiService } from '../services/aiService.js';
export const inventoryController = {
    async list(req, res) {
        try {
            const { page = "1", limit = "20", category, lowStock } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);
            const where = {};
            if (category) {
                where.category = { contains: category };
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
                    { stockQty: 'asc' },
                    { partName: 'asc' }
                ],
                skip,
                take
            });
            const total = await prisma.inventory.count({ where });
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
        }
        catch (error) {
            console.error('List inventory error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    async getById(req, res) {
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
                        take: 10
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
        }
        catch (error) {
            console.error('Get inventory item error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    async create(req, res) {
        try {
            const { partName, category, stockQty, reorderLevel, unitCost, sellingPrice, supplier, notes } = req.body;
            const existingPart = await prisma.inventory.findFirst({
                where: {
                    partName: { equals: partName }
                }
            });
            if (existingPart) {
                return res.status(409).json({
                    success: false,
                    error: 'Part with this name already exists'
                });
            }
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
            if (req.user) {
                await prisma.activityLog.create({
                    data: {
                        userId: req.user.id,
                        action: 'CREATE_INVENTORY_ITEM',
                        entityType: 'INVENTORY',
                        entityId: item.id,
                        details: JSON.stringify({
                            partName,
                            category,
                            stockQty,
                            timestamp: new Date().toISOString()
                        })
                    }
                });
            }
            res.status(201).json({
                success: true,
                data: item,
                message: 'Inventory item created successfully'
            });
        }
        catch (error) {
            console.error('Create inventory item error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const existingItem = await prisma.inventory.findUnique({
                where: { id }
            });
            if (!existingItem) {
                return res.status(404).json({
                    success: false,
                    error: 'Inventory item not found'
                });
            }
            if (updateData.sellingPrice && updateData.unitCost) {
                if (updateData.sellingPrice <= updateData.unitCost) {
                    return res.status(400).json({
                        success: false,
                        error: 'Selling price must be higher than unit cost'
                    });
                }
            }
            if (updateData.partName && updateData.partName !== existingItem.partName) {
                const nameConflict = await prisma.inventory.findFirst({
                    where: {
                        partName: { equals: updateData.partName },
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
            if (req.user) {
                await prisma.activityLog.create({
                    data: {
                        userId: req.user.id,
                        action: 'UPDATE_INVENTORY_ITEM',
                        entityType: 'INVENTORY',
                        entityId: id,
                        details: JSON.stringify({
                            partName: updatedItem.partName,
                            changes: updateData,
                            timestamp: new Date().toISOString()
                        })
                    }
                });
            }
            res.json({
                success: true,
                data: updatedItem,
                message: 'Inventory item updated successfully'
            });
        }
        catch (error) {
            console.error('Update inventory item error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    async delete(req, res) {
        try {
            const { id } = req.params;
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
            if (item.jobParts.length > 0 || item.invoiceItems.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Cannot delete inventory item that has been used in jobs or invoices'
                });
            }
            await prisma.inventory.delete({
                where: { id }
            });
            if (req.user) {
                await prisma.activityLog.create({
                    data: {
                        userId: req.user.id,
                        action: 'DELETE_INVENTORY_ITEM',
                        entityType: 'INVENTORY',
                        entityId: id,
                        details: JSON.stringify({
                            partName: item.partName,
                            timestamp: new Date().toISOString()
                        })
                    }
                });
            }
            res.json({
                success: true,
                message: 'Inventory item deleted successfully'
            });
        }
        catch (error) {
            console.error('Delete inventory item error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    async getLowStock(req, res) {
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
        }
        catch (error) {
            console.error('Get low stock error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    async updateStock(req, res) {
        try {
            const { id } = req.params;
            const { quantity, type, reason } = req.body;
            const item = await prisma.inventory.findUnique({
                where: { id }
            });
            if (!item) {
                return res.status(404).json({
                    success: false,
                    error: 'Inventory item not found'
                });
            }
            let newStock;
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
            if (req.user) {
                await prisma.activityLog.create({
                    data: {
                        userId: req.user.id,
                        action: 'ADJUST_INVENTORY_STOCK',
                        entityType: 'INVENTORY',
                        entityId: id,
                        details: JSON.stringify({
                            partName: item.partName,
                            oldStock: item.stockQty,
                            newStock,
                            adjustmentType: type,
                            quantity,
                            reason,
                            timestamp: new Date().toISOString()
                        })
                    }
                });
            }
            res.json({
                success: true,
                data: updatedItem,
                message: `Stock ${type.toLowerCase()}ed successfully`
            });
        }
        catch (error) {
            console.error('Update stock error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    async getAIPrediction(req, res) {
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
                        take: 30
                    }
                }
            });
            if (!item) {
                return res.status(404).json({
                    success: false,
                    error: 'Inventory item not found'
                });
            }
            const usageHistory = item.jobParts.map(jp => ({
                date: jp.createdAt.toISOString().split('T')[0],
                quantityUsed: jp.quantity
            }));
            const prediction = await aiService.predictReorder({
                partName: item.partName,
                currentStock: item.stockQty,
                reorderLevel: item.reorderLevel,
                usageHistory,
                averageLeadTime: 7
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
        }
        catch (error) {
            console.error('AI prediction error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    async getUsageReport(req, res) {
        try {
            const { from, to } = req.query;
            const startDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const endDate = to ? new Date(to) : new Date();
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
            const usageByPart = usageData.reduce((acc, usage) => {
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
                .sort((a, b) => b.totalUsed - a.totalUsed)
                .slice(0, 20);
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
        }
        catch (error) {
            console.error('Get usage report error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
};
