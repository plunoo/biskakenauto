/**
 * SMS Service using Twilio
 * Handles SMS notifications for customers and internal communication
 */
declare class SMSService {
    private client;
    private isConfigured;
    constructor();
    private initialize;
    /**
     * Send generic SMS message
     */
    sendSMS(to: string, message: string, options?: {
        priority?: 'high' | 'normal';
        scheduledSendTime?: Date;
    }): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    /**
     * Format phone number for international SMS
     */
    private formatPhoneNumber;
    /**
     * Job started notification
     */
    notifyJobStarted(customerPhone: string, customerName: string, jobData: {
        jobNumber: string;
        vehicle: string;
        mechanicName?: string;
        estimatedCompletion?: string;
    }): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Job completed notification
     */
    notifyJobCompleted(customerPhone: string, customerName: string, jobData: {
        jobNumber: string;
        vehicle: string;
        totalCost: number;
        pickupTime?: string;
    }): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Payment reminder notification
     */
    sendPaymentReminder(customerPhone: string, customerName: string, invoiceData: {
        invoiceNumber: string;
        amount: number;
        dueDate?: string;
        paymentLink?: string;
    }): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Appointment reminder notification
     */
    sendAppointmentReminder(customerPhone: string, customerName: string, appointmentData: {
        date: string;
        time: string;
        service: string;
        vehicle?: string;
    }): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Parts arrival notification
     */
    notifyPartsArrived(customerPhone: string, customerName: string, jobData: {
        jobNumber: string;
        vehicle: string;
        partsDescription: string;
    }): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Service maintenance reminder
     */
    sendMaintenanceReminder(customerPhone: string, customerName: string, maintenanceData: {
        vehicle: string;
        mileage: number;
        serviceType: string;
        dueDate: string;
    }): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Emergency/urgent notification
     */
    sendUrgentNotification(customerPhone: string, customerName: string, urgentData: {
        jobNumber: string;
        vehicle: string;
        issue: string;
        action: string;
    }): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Promotional/marketing messages
     */
    sendPromoMessage(customerPhone: string, customerName: string, promoData: {
        title: string;
        description: string;
        validUntil?: string;
        code?: string;
    }): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Bulk SMS to multiple recipients
     */
    sendBulkSMS(recipients: Array<{
        phone: string;
        name: string;
        customMessage?: string;
    }>, defaultMessage: string, options?: {
        batchSize?: number;
        delayBetweenBatches?: number;
    }): Promise<{
        success: boolean;
        results: Array<{
            phone: string;
            success: boolean;
            messageId?: string;
            error?: string;
        }>;
    }>;
    /**
     * Check SMS service status
     */
    getServiceStatus(): {
        isConfigured: boolean;
        accountSid?: string;
        fromNumber?: string;
    };
}
export declare const smsService: SMSService;
export {};
//# sourceMappingURL=smsService.d.ts.map