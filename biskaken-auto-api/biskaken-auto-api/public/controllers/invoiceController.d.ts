import { Response } from 'express';
import { AuthRequest, ApiResponse } from '../types';
/**
 * Invoice Controller
 * Handles invoice creation, payment processing, and document generation
 */
export declare const invoiceController: {
    /**
     * Get all invoices with pagination and filtering
     */
    list(req: AuthRequest, res: Response<ApiResponse>): Promise<void>;
    /**
     * Get single invoice by ID
     */
    getById(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
    /**
     * Create new invoice
     */
    create(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
    /**
     * Update invoice
     */
    update(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
    /**
     * Record payment for invoice
     */
    recordPayment(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
    /**
     * Initialize mobile money payment
     */
    initializeMobileMoneyPayment(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
    /**
     * Initialize online payment (Paystack)
     */
    initializeOnlinePayment(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
    /**
     * Verify payment status
     */
    verifyPayment(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
    /**
     * Generate and download invoice PDF
     */
    downloadPDF(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Get overdue invoices
     */
    getOverdueInvoices(req: AuthRequest, res: Response<ApiResponse>): Promise<void>;
    /**
     * Send payment reminder SMS
     */
    sendPaymentReminder(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
    /**
     * Delete invoice (Admin only)
     */
    delete(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
};
//# sourceMappingURL=invoiceController.d.ts.map