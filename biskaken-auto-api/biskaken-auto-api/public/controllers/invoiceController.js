"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceController = void 0;
const prisma_1 = require("../utils/prisma");
const pdfService_1 = require("../services/pdfService");
const smsService_1 = require("../services/smsService");
const paymentService_1 = require("../services/paymentService");
/**
 * Invoice Controller
 * Handles invoice creation, payment processing, and document generation
 */
exports.invoiceController = {
    /**
     * Get all invoices with pagination and filtering
     */
    async list(req, res) {
        try {
            const { page = "1", limit = "20", status, customerId, from, to } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const take = Number(limit);
            // Build filter conditions
            const where = {};
            if (status) {
                where.status = status;
            }
            if (customerId) {
                where.customerId = customerId;
            }
            if (from || to) {
                where.date = {};
                if (from)
                    where.date.gte = new Date(from);
                if (to)
                    where.date.lte = new Date(to);
            }
            const invoices = await prisma_1.prisma.invoice.findMany({
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
                    job: {
                        select: {
                            id: true,
                            jobNumber: true,
                            vehicle: {
                                select: {
                                    make: true,
                                    model: true,
                                    plateNumber: true
                                }
                            }
                        }
                    },
                    items: {
                        include: {
                            part: {
                                select: {
                                    id: true,
                                    partName: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            });
            const total = await prisma_1.prisma.invoice.count({ where });
            res.json({
                success: true,
                data: invoices,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            });
        }
        catch (error) {
            console.error('List invoices error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    /**
     * Get single invoice by ID
     */
    async getById(req, res) {
        try {
            const { id } = req.params;
            const invoice = await prisma_1.prisma.invoice.findUnique({
                where: { id },
                include: {
                    customer: true,
                    job: {
                        include: {
                            vehicle: true,
                            assignedMechanic: {
                                select: { name: true }
                            }
                        }
                    },
                    items: {
                        include: {
                            part: {
                                select: {
                                    id: true,
                                    partName: true,
                                    category: true
                                }
                            }
                        }
                    }
                }
            });
            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    error: 'Invoice not found'
                });
            }
            res.json({
                success: true,
                data: invoice
            });
        }
        catch (error) {
            console.error('Get invoice error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    /**
     * Create new invoice
     */
    async create(req, res) {
        try {
            const { customerId, jobId, dueDate, tax = 0, discount = 0, notes, items } = req.body;
            // Verify customer exists
            const customer = await prisma_1.prisma.customer.findUnique({
                where: { id: customerId }
            });
            if (!customer) {
                return res.status(404).json({
                    success: false,
                    error: 'Customer not found'
                });
            }
            // Verify job exists (if provided)
            let job = null;
            if (jobId) {
                job = await prisma_1.prisma.job.findUnique({
                    where: { id: jobId },
                    include: { vehicle: true }
                });
                if (!job) {
                    return res.status(404).json({
                        success: false,
                        error: 'Job not found'
                    });
                }
                if (job.customerId !== customerId) {
                    return res.status(400).json({
                        success: false,
                        error: 'Job does not belong to this customer'
                    });
                }
            }
            // Generate invoice number
            const invoiceCount = await prisma_1.prisma.invoice.count();
            const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(4, '0')}`;
            // Calculate totals
            const subtotal = items.reduce((sum, item) => {
                return sum + (item.quantity * item.unitPrice);
            }, 0);
            const total = subtotal - discount + tax;
            // Create invoice with items in a transaction
            const invoice = await prisma_1.prisma.$transaction(async (tx) => {
                const newInvoice = await tx.invoice.create({
                    data: {
                        invoiceNumber,
                        customerId,
                        jobId,
                        date: new Date(),
                        dueDate: dueDate ? new Date(dueDate) : null,
                        subtotal,
                        tax,
                        discount,
                        total,
                        status: 'DRAFT',
                        notes
                    }
                });
                // Create invoice items
                for (const item of items) {
                    await tx.invoiceItem.create({
                        data: {
                            invoiceId: newInvoice.id,
                            partId: item.partId,
                            description: item.description,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            total: item.quantity * item.unitPrice
                        }
                    });
                    // Update inventory if part is specified
                    if (item.partId) {
                        const inventoryItem = await tx.inventory.findUnique({
                            where: { id: item.partId }
                        });
                        if (inventoryItem && inventoryItem.stockQty >= item.quantity) {
                            await tx.inventory.update({
                                where: { id: item.partId },
                                data: {
                                    stockQty: inventoryItem.stockQty - item.quantity
                                }
                            });
                        }
                    }
                }
                return newInvoice;
            });
            // Log activity
            if (req.user) {
                await prisma_1.prisma.activityLog.create({
                    data: {
                        userId: req.user.id,
                        action: 'CREATE_INVOICE',
                        entityType: 'INVOICE',
                        entityId: invoice.id,
                        details: {
                            invoiceNumber: invoice.invoiceNumber,
                            customer: customer.name,
                            total: invoice.total,
                            timestamp: new Date().toISOString()
                        }
                    }
                });
            }
            // Return invoice with relations
            const invoiceWithRelations = await prisma_1.prisma.invoice.findUnique({
                where: { id: invoice.id },
                include: {
                    customer: true,
                    job: { include: { vehicle: true } },
                    items: { include: { part: true } }
                }
            });
            res.status(201).json({
                success: true,
                data: invoiceWithRelations,
                message: 'Invoice created successfully'
            });
        }
        catch (error) {
            console.error('Create invoice error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    /**
     * Update invoice
     */
    async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const existingInvoice = await prisma_1.prisma.invoice.findUnique({
                where: { id }
            });
            if (!existingInvoice) {
                return res.status(404).json({
                    success: false,
                    error: 'Invoice not found'
                });
            }
            // Prevent modification of paid invoices
            if (existingInvoice.status === 'PAID' && req.user?.role !== 'ADMIN') {
                return res.status(400).json({
                    success: false,
                    error: 'Cannot modify paid invoice'
                });
            }
            // Convert date strings to Date objects
            if (updateData.dueDate) {
                updateData.dueDate = new Date(updateData.dueDate);
            }
            const updatedInvoice = await prisma_1.prisma.invoice.update({
                where: { id },
                data: updateData,
                include: {
                    customer: true,
                    job: { include: { vehicle: true } },
                    items: { include: { part: true } }
                }
            });
            // Log activity
            if (req.user) {
                await prisma_1.prisma.activityLog.create({
                    data: {
                        userId: req.user.id,
                        action: 'UPDATE_INVOICE',
                        entityType: 'INVOICE',
                        entityId: id,
                        details: {
                            invoiceNumber: updatedInvoice.invoiceNumber,
                            changes: updateData,
                            timestamp: new Date().toISOString()
                        }
                    }
                });
            }
            res.json({
                success: true,
                data: updatedInvoice,
                message: 'Invoice updated successfully'
            });
        }
        catch (error) {
            console.error('Update invoice error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    /**
     * Record payment for invoice
     */
    async recordPayment(req, res) {
        try {
            const { id } = req.params;
            const { amount, method, reference, notes } = req.body;
            const invoice = await prisma_1.prisma.invoice.findUnique({
                where: { id },
                include: {
                    customer: true,
                    job: { include: { vehicle: true } }
                }
            });
            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    error: 'Invoice not found'
                });
            }
            if (invoice.status === 'PAID') {
                return res.status(400).json({
                    success: false,
                    error: 'Invoice already paid'
                });
            }
            if (amount > invoice.total) {
                return res.status(400).json({
                    success: false,
                    error: 'Payment amount cannot exceed invoice total'
                });
            }
            // Update invoice status
            const newStatus = amount >= invoice.total ? 'PAID' : 'SENT';
            const updatedInvoice = await prisma_1.prisma.invoice.update({
                where: { id },
                data: {
                    status: newStatus,
                    paymentMethod: method,
                    paymentDate: new Date(),
                    paymentRef: reference,
                    notes: notes ? `${invoice.notes || ''}\n\nPayment: ${notes}` : invoice.notes
                }
            });
            // Send SMS notification if payment completed
            if (newStatus === 'PAID') {
                await smsService_1.smsService.notifyJobCompleted(invoice.customer.phone, invoice.customer.name, {
                    jobNumber: invoice.job?.jobNumber || invoice.invoiceNumber,
                    vehicle: invoice.job?.vehicle ?
                        `${invoice.job.vehicle.make} ${invoice.job.vehicle.model}` :
                        'Vehicle',
                    totalCost: invoice.total
                });
            }
            // Log activity
            if (req.user) {
                await prisma_1.prisma.activityLog.create({
                    data: {
                        userId: req.user.id,
                        action: 'RECORD_PAYMENT',
                        entityType: 'INVOICE',
                        entityId: id,
                        details: {
                            invoiceNumber: invoice.invoiceNumber,
                            amount,
                            method,
                            reference,
                            timestamp: new Date().toISOString()
                        }
                    }
                });
            }
            res.json({
                success: true,
                data: updatedInvoice,
                message: 'Payment recorded successfully'
            });
        }
        catch (error) {
            console.error('Record payment error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    /**
     * Initialize mobile money payment
     */
    async initializeMobileMoneyPayment(req, res) {
        try {
            const { id } = req.params;
            const { phone, provider = 'mtn' } = req.body; // provider: 'mtn', 'vodafone', 'tigo'
            const invoice = await prisma_1.prisma.invoice.findUnique({
                where: { id },
                include: {
                    customer: true,
                    job: { include: { vehicle: true } }
                }
            });
            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    error: 'Invoice not found'
                });
            }
            if (invoice.status === 'PAID') {
                return res.status(400).json({
                    success: false,
                    error: 'Invoice already paid'
                });
            }
            // Generate payment reference
            const reference = paymentService_1.paymentService.generatePaymentReference(`MM_${invoice.invoiceNumber}`);
            // Initialize mobile money payment
            const paymentResult = await paymentService_1.paymentService.initializeMobileMoneyPayment(invoice.total, phone, reference, provider, {
                invoiceId: invoice.id,
                customerId: invoice.customerId,
                customerName: invoice.customer.name,
                description: `Payment for Invoice ${invoice.invoiceNumber}`
            });
            if (!paymentResult.success) {
                return res.status(400).json({
                    success: false,
                    error: paymentResult.error
                });
            }
            // Log payment attempt
            if (req.user) {
                await prisma_1.prisma.activityLog.create({
                    data: {
                        userId: req.user.id,
                        action: 'INITIALIZE_MOBILE_MONEY_PAYMENT',
                        entityType: 'INVOICE',
                        entityId: id,
                        details: {
                            invoiceNumber: invoice.invoiceNumber,
                            amount: invoice.total,
                            phone,
                            provider,
                            reference,
                            timestamp: new Date().toISOString()
                        }
                    }
                });
            }
            res.json({
                success: true,
                data: {
                    reference,
                    amount: invoice.total,
                    currency: 'GHS',
                    provider,
                    phone,
                    status: 'pending',
                    message: `Mobile money payment initiated. Please check your ${provider.toUpperCase()} phone for payment prompt.`,
                    paymentData: paymentResult.data
                },
                message: 'Mobile money payment initialized'
            });
        }
        catch (error) {
            console.error('Initialize mobile money payment error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    /**
     * Initialize online payment (Paystack)
     */
    async initializeOnlinePayment(req, res) {
        try {
            const { id } = req.params;
            const { email } = req.body;
            const invoice = await prisma_1.prisma.invoice.findUnique({
                where: { id },
                include: {
                    customer: true,
                    job: { include: { vehicle: true } }
                }
            });
            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    error: 'Invoice not found'
                });
            }
            if (invoice.status === 'PAID') {
                return res.status(400).json({
                    success: false,
                    error: 'Invoice already paid'
                });
            }
            // Generate payment reference
            const reference = paymentService_1.paymentService.generatePaymentReference(`PAY_${invoice.invoiceNumber}`);
            // Initialize Paystack payment
            const paymentResult = await paymentService_1.paymentService.initializePaystackPayment(invoice.total, email || invoice.customer.email || `${invoice.customer.phone}@biskaken.com`, reference, {
                invoiceId: invoice.id,
                customerId: invoice.customerId,
                customerName: invoice.customer.name,
                phone: invoice.customer.phone
            });
            if (!paymentResult.success) {
                return res.status(400).json({
                    success: false,
                    error: paymentResult.error
                });
            }
            // Log payment attempt
            if (req.user) {
                await prisma_1.prisma.activityLog.create({
                    data: {
                        userId: req.user.id,
                        action: 'INITIALIZE_ONLINE_PAYMENT',
                        entityType: 'INVOICE',
                        entityId: id,
                        details: {
                            invoiceNumber: invoice.invoiceNumber,
                            amount: invoice.total,
                            email,
                            reference,
                            timestamp: new Date().toISOString()
                        }
                    }
                });
            }
            res.json({
                success: true,
                data: paymentResult.data,
                message: 'Online payment initialized'
            });
        }
        catch (error) {
            console.error('Initialize online payment error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    /**
     * Verify payment status
     */
    async verifyPayment(req, res) {
        try {
            const { reference } = req.params;
            // Verify payment with Paystack
            const verification = await paymentService_1.paymentService.verifyPaystackPayment(reference);
            if (!verification.success) {
                return res.status(400).json({
                    success: false,
                    error: verification.error
                });
            }
            const paymentData = verification.data;
            if (paymentData.status === 'success') {
                // Find invoice by reference in metadata
                const invoiceId = paymentData.metadata?.invoiceId;
                if (!invoiceId) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invoice ID not found in payment metadata'
                    });
                }
                // Update invoice as paid
                const updatedInvoice = await prisma_1.prisma.invoice.update({
                    where: { id: invoiceId },
                    data: {
                        status: 'PAID',
                        paymentMethod: paymentData.channel?.toUpperCase() === 'MOBILE_MONEY' ? 'MOBILE_MONEY' : 'CARD',
                        paymentDate: new Date(paymentData.paid_at),
                        paymentRef: reference
                    },
                    include: {
                        customer: true,
                        job: { include: { vehicle: true } }
                    }
                });
                // Send SMS notification
                await smsService_1.smsService.notifyJobCompleted(updatedInvoice.customer.phone, updatedInvoice.customer.name, {
                    jobNumber: updatedInvoice.job?.jobNumber || updatedInvoice.invoiceNumber,
                    vehicle: updatedInvoice.job?.vehicle ?
                        `${updatedInvoice.job.vehicle.make} ${updatedInvoice.job.vehicle.model}` :
                        'Vehicle',
                    totalCost: updatedInvoice.total
                });
                // Log payment
                if (req.user) {
                    await prisma_1.prisma.activityLog.create({
                        data: {
                            userId: req.user.id,
                            action: 'PAYMENT_VERIFIED',
                            entityType: 'INVOICE',
                            entityId: invoiceId,
                            details: {
                                invoiceNumber: updatedInvoice.invoiceNumber,
                                amount: paymentData.amount,
                                channel: paymentData.channel,
                                reference,
                                timestamp: new Date().toISOString()
                            }
                        }
                    });
                }
                res.json({
                    success: true,
                    data: {
                        invoice: updatedInvoice,
                        payment: paymentData
                    },
                    message: 'Payment verified and recorded successfully'
                });
            }
            else {
                res.json({
                    success: false,
                    data: paymentData,
                    message: 'Payment was not successful'
                });
            }
        }
        catch (error) {
            console.error('Verify payment error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    /**
     * Generate and download invoice PDF
     */
    async downloadPDF(req, res) {
        try {
            const { id } = req.params;
            const invoice = await prisma_1.prisma.invoice.findUnique({
                where: { id },
                include: {
                    customer: true,
                    job: { include: { vehicle: true } },
                    items: { include: { part: true } }
                }
            });
            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    error: 'Invoice not found'
                });
            }
            // Get shop settings
            const shopSettings = await prisma_1.prisma.shopSettings.findFirst();
            // Generate PDF
            const pdfPath = await pdfService_1.pdfService.generateInvoice({
                invoice: {
                    id: invoice.id,
                    invoiceNumber: invoice.invoiceNumber,
                    date: invoice.date,
                    dueDate: invoice.dueDate || undefined,
                    subtotal: invoice.subtotal,
                    tax: invoice.tax,
                    discount: invoice.discount,
                    total: invoice.total,
                    status: invoice.status,
                    notes: invoice.notes || undefined,
                    items: invoice.items.map(item => ({
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        total: item.total
                    }))
                },
                customer: invoice.customer,
                job: invoice.job ? {
                    jobNumber: invoice.job.jobNumber,
                    vehicle: invoice.job.vehicle,
                    complaint: invoice.job.complaint
                } : undefined,
                shop: {
                    name: shopSettings?.shopName || 'Biskaken Auto Services',
                    address: shopSettings?.address,
                    phone: shopSettings?.phone,
                    email: shopSettings?.email,
                    logo: shopSettings?.logo
                }
            });
            // Send file
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);
            const fs = require('fs');
            const fileStream = fs.createReadStream(pdfPath);
            fileStream.pipe(res);
            // Clean up file after sending
            fileStream.on('end', () => {
                setTimeout(() => {
                    pdfService_1.pdfService.deleteFile(pdfPath);
                }, 5000);
            });
        }
        catch (error) {
            console.error('Download PDF error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    /**
     * Get overdue invoices
     */
    async getOverdueInvoices(req, res) {
        try {
            const overdueInvoices = await prisma_1.prisma.invoice.findMany({
                where: {
                    status: { in: ['SENT', 'OVERDUE'] },
                    dueDate: { lt: new Date() }
                },
                include: {
                    customer: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                            email: true
                        }
                    }
                },
                orderBy: { dueDate: 'asc' }
            });
            res.json({
                success: true,
                data: overdueInvoices,
                message: `${overdueInvoices.length} overdue invoices found`
            });
        }
        catch (error) {
            console.error('Get overdue invoices error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    /**
     * Send payment reminder SMS
     */
    async sendPaymentReminder(req, res) {
        try {
            const { id } = req.params;
            const { customMessage } = req.body;
            const invoice = await prisma_1.prisma.invoice.findUnique({
                where: { id },
                include: { customer: true }
            });
            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    error: 'Invoice not found'
                });
            }
            if (invoice.status === 'PAID') {
                return res.status(400).json({
                    success: false,
                    error: 'Cannot send reminder for paid invoice'
                });
            }
            // Send SMS reminder
            const smsResult = await smsService_1.smsService.sendPaymentReminder(invoice.customer.phone, invoice.customer.name, {
                invoiceNumber: invoice.invoiceNumber,
                amount: invoice.total,
                dueDate: invoice.dueDate?.toLocaleDateString(),
                paymentLink: `${process.env.APP_URL}/pay/${invoice.id}`
            });
            if (smsResult.success) {
                // Log activity
                if (req.user) {
                    await prisma_1.prisma.activityLog.create({
                        data: {
                            userId: req.user.id,
                            action: 'SEND_PAYMENT_REMINDER',
                            entityType: 'INVOICE',
                            entityId: id,
                            details: {
                                invoiceNumber: invoice.invoiceNumber,
                                customerPhone: invoice.customer.phone,
                                timestamp: new Date().toISOString()
                            }
                        }
                    });
                }
                res.json({
                    success: true,
                    message: 'Payment reminder sent successfully'
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    error: smsResult.error || 'Failed to send SMS reminder'
                });
            }
        }
        catch (error) {
            console.error('Send payment reminder error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    /**
     * Delete invoice (Admin only)
     */
    async delete(req, res) {
        try {
            const { id } = req.params;
            const invoice = await prisma_1.prisma.invoice.findUnique({
                where: { id }
            });
            if (!invoice) {
                return res.status(404).json({
                    success: false,
                    error: 'Invoice not found'
                });
            }
            // Prevent deletion of paid invoices
            if (invoice.status === 'PAID') {
                return res.status(400).json({
                    success: false,
                    error: 'Cannot delete paid invoice'
                });
            }
            await prisma_1.prisma.invoice.delete({
                where: { id }
            });
            // Log activity
            if (req.user) {
                await prisma_1.prisma.activityLog.create({
                    data: {
                        userId: req.user.id,
                        action: 'DELETE_INVOICE',
                        entityType: 'INVOICE',
                        entityId: id,
                        details: {
                            invoiceNumber: invoice.invoiceNumber,
                            timestamp: new Date().toISOString()
                        }
                    }
                });
            }
            res.json({
                success: true,
                message: 'Invoice deleted successfully'
            });
        }
        catch (error) {
            console.error('Delete invoice error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
};
//# sourceMappingURL=invoiceController.js.map