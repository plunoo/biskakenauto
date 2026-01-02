"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Payment Service
 * Handles payment processing via Paystack (Mobile Money, Cards) and Plasma.to (USDT)
 */
class PaymentService {
    constructor() {
        this.paystackBaseUrl = 'https://api.paystack.co';
        this.paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || '';
        this.paystackPublicKey = process.env.PAYSTACK_PUBLIC_KEY || '';
        if (!this.paystackSecretKey || !this.paystackPublicKey) {
            console.warn('Paystack credentials not configured');
        }
    }
    /**
     * Initialize Paystack payment
     */
    async initializePaystackPayment(amount, // in GHS
    email, reference, metadata) {
        try {
            if (!this.paystackSecretKey) {
                throw new Error('Paystack secret key not configured');
            }
            const response = await axios_1.default.post(`${this.paystackBaseUrl}/transaction/initialize`, {
                amount: Math.round(amount * 100), // Convert to pesewas
                email,
                reference,
                channels: ['mobile_money', 'card', 'bank_transfer'],
                metadata: {
                    ...metadata,
                    referrer: 'Biskaken Auto Services'
                },
                callback_url: `${process.env.APP_URL}/payment/callback`,
                currency: 'GHS'
            }, {
                headers: {
                    Authorization: `Bearer ${this.paystackSecretKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return {
                success: true,
                data: {
                    authorization_url: response.data.data.authorization_url,
                    access_code: response.data.data.access_code,
                    reference: response.data.data.reference
                }
            };
        }
        catch (error) {
            console.error('Paystack initialization error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Payment initialization failed'
            };
        }
    }
    /**
     * Verify Paystack payment
     */
    async verifyPaystackPayment(reference) {
        try {
            if (!this.paystackSecretKey) {
                throw new Error('Paystack secret key not configured');
            }
            const response = await axios_1.default.get(`${this.paystackBaseUrl}/transaction/verify/${reference}`, {
                headers: {
                    Authorization: `Bearer ${this.paystackSecretKey}`
                }
            });
            const data = response.data.data;
            return {
                success: data.status === 'success',
                data: {
                    status: data.status,
                    reference: data.reference,
                    amount: data.amount / 100, // Convert from pesewas to GHS
                    currency: data.currency,
                    paid_at: data.paid_at,
                    channel: data.channel,
                    gateway_response: data.gateway_response,
                    fees: data.fees ? data.fees / 100 : 0,
                    customer: data.customer,
                    authorization: data.authorization,
                    metadata: data.metadata
                }
            };
        }
        catch (error) {
            console.error('Paystack verification error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Payment verification failed'
            };
        }
    }
    /**
     * Initialize Mobile Money payment (Paystack)
     */
    async initializeMobileMoneyPayment(amount, phone, reference, provider = 'mtn', metadata) {
        try {
            if (!this.paystackSecretKey) {
                throw new Error('Paystack secret key not configured');
            }
            // Format phone number for mobile money
            const formattedPhone = this.formatGhanaianPhone(phone);
            const response = await axios_1.default.post(`${this.paystackBaseUrl}/charge`, {
                email: `${formattedPhone.replace('+', '')}@biskaken.com`, // Dummy email
                amount: Math.round(amount * 100),
                currency: 'GHS',
                mobile_money: {
                    phone: formattedPhone,
                    provider: provider
                },
                reference,
                metadata
            }, {
                headers: {
                    Authorization: `Bearer ${this.paystackSecretKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return {
                success: true,
                data: response.data.data
            };
        }
        catch (error) {
            console.error('Mobile money initialization error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Mobile money payment failed'
            };
        }
    }
    /**
     * Get transaction history
     */
    async getTransactionHistory(page = 1, perPage = 50, from, to) {
        try {
            if (!this.paystackSecretKey) {
                throw new Error('Paystack secret key not configured');
            }
            const params = {
                page,
                perPage
            };
            if (from)
                params.from = from;
            if (to)
                params.to = to;
            const response = await axios_1.default.get(`${this.paystackBaseUrl}/transaction`, {
                headers: {
                    Authorization: `Bearer ${this.paystackSecretKey}`
                },
                params
            });
            return {
                success: true,
                data: response.data.data
            };
        }
        catch (error) {
            console.error('Transaction history error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch transaction history'
            };
        }
    }
    /**
     * Plasma.to USDT Payment Integration
     * Note: This is a simplified implementation - actual Plasma.to integration would require their SDK
     */
    async createUSDTPayment(amountUSD, invoiceId, metadata) {
        try {
            // This is a simplified implementation
            // In a real implementation, you would use Plasma.to's actual API/SDK
            const walletAddress = process.env.USDT_WALLET_ADDRESS;
            if (!walletAddress) {
                throw new Error('USDT wallet address not configured');
            }
            // Create a payment link/QR code data
            const paymentData = {
                amount: amountUSD,
                currency: 'USDT',
                wallet_address: walletAddress,
                invoice_id: invoiceId,
                payment_url: `https://plasma.to/pay/${invoiceId}`, // Placeholder URL
                qr_code: `usdt:${walletAddress}?amount=${amountUSD}&label=Biskaken-${invoiceId}`,
                expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
                metadata
            };
            return {
                success: true,
                data: paymentData
            };
        }
        catch (error) {
            console.error('USDT payment creation error:', error);
            return {
                success: false,
                error: error.message || 'Failed to create USDT payment'
            };
        }
    }
    /**
     * Check USDT payment status
     * Note: Simplified implementation - would need actual Plasma.to webhook/API integration
     */
    async checkUSDTPaymentStatus(paymentId) {
        try {
            // In a real implementation, this would check the blockchain or Plasma.to API
            // For now, this is a placeholder that simulates checking payment status
            // This would typically involve:
            // 1. Checking blockchain for transactions to the wallet address
            // 2. Verifying the amount and metadata
            // 3. Confirming the transaction has enough confirmations
            return {
                success: true,
                data: {
                    status: 'pending', // pending, confirmed, failed
                    payment_id: paymentId,
                    confirmations: 0,
                    required_confirmations: 3,
                    transaction_hash: null,
                    amount_received: 0,
                    message: 'Payment status check not implemented - requires blockchain integration'
                }
            };
        }
        catch (error) {
            console.error('USDT status check error:', error);
            return {
                success: false,
                error: error.message || 'Failed to check USDT payment status'
            };
        }
    }
    /**
     * Process refund via Paystack
     */
    async processRefund(transactionId, amount, // Partial refund amount in GHS
    reason) {
        try {
            if (!this.paystackSecretKey) {
                throw new Error('Paystack secret key not configured');
            }
            const refundData = {
                transaction: transactionId
            };
            if (amount) {
                refundData.amount = Math.round(amount * 100); // Convert to pesewas
            }
            if (reason) {
                refundData.customer_note = reason;
                refundData.merchant_note = reason;
            }
            const response = await axios_1.default.post(`${this.paystackBaseUrl}/refund`, refundData, {
                headers: {
                    Authorization: `Bearer ${this.paystackSecretKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return {
                success: true,
                data: response.data.data
            };
        }
        catch (error) {
            console.error('Refund processing error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Refund processing failed'
            };
        }
    }
    /**
     * Get payment analytics
     */
    async getPaymentAnalytics(from, to) {
        try {
            // This would typically aggregate data from your database
            // For demonstration, we're using placeholder values
            return {
                totalRevenue: 0,
                totalTransactions: 0,
                successfulTransactions: 0,
                failedTransactions: 0,
                averageTransactionValue: 0,
                topPaymentChannels: [
                    {
                        channel: 'mobile_money',
                        count: 0,
                        amount: 0
                    },
                    {
                        channel: 'card',
                        count: 0,
                        amount: 0
                    },
                    {
                        channel: 'usdt',
                        count: 0,
                        amount: 0
                    }
                ]
            };
        }
        catch (error) {
            console.error('Payment analytics error:', error);
            throw error;
        }
    }
    /**
     * Format Ghanaian phone number for mobile money
     */
    formatGhanaianPhone(phone) {
        // Remove all non-digit characters
        let cleaned = phone.replace(/\D/g, '');
        // If starts with 0, replace with 233
        if (cleaned.startsWith('0')) {
            cleaned = '233' + cleaned.substring(1);
        }
        // If doesn't start with 233, add it
        else if (!cleaned.startsWith('233')) {
            cleaned = '233' + cleaned;
        }
        // Add + prefix
        return '+' + cleaned;
    }
    /**
     * Generate unique payment reference
     */
    generatePaymentReference(prefix = 'BSK') {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `${prefix}_${timestamp}_${random}`;
    }
    /**
     * Validate payment amount
     */
    validatePaymentAmount(amount) {
        if (amount <= 0) {
            return { isValid: false, error: 'Amount must be greater than zero' };
        }
        if (amount < 1) {
            return { isValid: false, error: 'Minimum payment amount is GHS 1.00' };
        }
        if (amount > 50000) {
            return { isValid: false, error: 'Maximum payment amount is GHS 50,000.00' };
        }
        return { isValid: true };
    }
    /**
     * Get service configuration status
     */
    getServiceStatus() {
        return {
            paystack: {
                configured: Boolean(this.paystackSecretKey && this.paystackPublicKey),
                publicKey: this.paystackPublicKey ? this.paystackPublicKey.substring(0, 7) + '...' : undefined
            },
            usdt: {
                configured: Boolean(process.env.USDT_WALLET_ADDRESS),
                walletAddress: process.env.USDT_WALLET_ADDRESS ?
                    process.env.USDT_WALLET_ADDRESS.substring(0, 8) + '...' +
                        process.env.USDT_WALLET_ADDRESS.substring(process.env.USDT_WALLET_ADDRESS.length - 8) :
                    undefined
            }
        };
    }
}
exports.paymentService = new PaymentService();
//# sourceMappingURL=paymentService.js.map