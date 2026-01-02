import { PaymentResponse } from '../types';
/**
 * Payment Service
 * Handles payment processing via Paystack (Mobile Money, Cards) and Plasma.to (USDT)
 */
declare class PaymentService {
    private paystackBaseUrl;
    private paystackSecretKey;
    private paystackPublicKey;
    constructor();
    /**
     * Initialize Paystack payment
     */
    initializePaystackPayment(amount: number, // in GHS
    email: string, reference: string, metadata?: {
        invoiceId?: string;
        customerId?: string;
        customerName?: string;
        phone?: string;
    }): Promise<PaymentResponse>;
    /**
     * Verify Paystack payment
     */
    verifyPaystackPayment(reference: string): Promise<PaymentResponse>;
    /**
     * Initialize Mobile Money payment (Paystack)
     */
    initializeMobileMoneyPayment(amount: number, phone: string, reference: string, provider?: 'mtn' | 'vodafone' | 'tigo', metadata?: any): Promise<PaymentResponse>;
    /**
     * Get transaction history
     */
    getTransactionHistory(page?: number, perPage?: number, from?: string, to?: string): Promise<PaymentResponse>;
    /**
     * Plasma.to USDT Payment Integration
     * Note: This is a simplified implementation - actual Plasma.to integration would require their SDK
     */
    createUSDTPayment(amountUSD: number, invoiceId: string, metadata?: {
        customerId?: string;
        customerName?: string;
        description?: string;
    }): Promise<PaymentResponse>;
    /**
     * Check USDT payment status
     * Note: Simplified implementation - would need actual Plasma.to webhook/API integration
     */
    checkUSDTPaymentStatus(paymentId: string): Promise<PaymentResponse>;
    /**
     * Process refund via Paystack
     */
    processRefund(transactionId: string, amount?: number, // Partial refund amount in GHS
    reason?: string): Promise<PaymentResponse>;
    /**
     * Get payment analytics
     */
    getPaymentAnalytics(from?: string, to?: string): Promise<{
        totalRevenue: number;
        totalTransactions: number;
        successfulTransactions: number;
        failedTransactions: number;
        averageTransactionValue: number;
        topPaymentChannels: Array<{
            channel: string;
            count: number;
            amount: number;
        }>;
    }>;
    /**
     * Format Ghanaian phone number for mobile money
     */
    private formatGhanaianPhone;
    /**
     * Generate unique payment reference
     */
    generatePaymentReference(prefix?: string): string;
    /**
     * Validate payment amount
     */
    validatePaymentAmount(amount: number): {
        isValid: boolean;
        error?: string;
    };
    /**
     * Get service configuration status
     */
    getServiceStatus(): {
        paystack: {
            configured: boolean;
            publicKey?: string;
        };
        usdt: {
            configured: boolean;
            walletAddress?: string;
        };
    };
}
export declare const paymentService: PaymentService;
export {};
//# sourceMappingURL=paymentService.d.ts.map