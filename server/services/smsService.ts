import twilio from 'twilio';

/**
 * SMS Service using Twilio
 * Handles SMS notifications for customers and internal communication
 */
class SMSService {
  private client: twilio.Twilio | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;

      if (accountSid && authToken) {
        this.client = twilio(accountSid, authToken);
        this.isConfigured = true;
        console.log('SMS Service initialized successfully');
      } else {
        console.warn('SMS Service not configured - missing Twilio credentials');
        this.isConfigured = false;
      }
    } catch (error) {
      console.error('Failed to initialize SMS Service:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Send generic SMS message
   */
  async sendSMS(
    to: string,
    message: string,
    options: {
      priority?: 'high' | 'normal';
      scheduledSendTime?: Date;
    } = {}
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured || !this.client) {
      console.warn('SMS not sent - service not configured');
      return {
        success: false,
        error: 'SMS service not configured'
      };
    }

    try {
      // Format phone number (ensure it starts with + for international format)
      const formattedNumber = this.formatPhoneNumber(to);

      const messageOptions: any = {
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedNumber
      };

      // Add scheduled send time if provided
      if (options.scheduledSendTime) {
        messageOptions.sendAt = options.scheduledSendTime;
      }

      const sentMessage = await this.client.messages.create(messageOptions);

      return {
        success: true,
        messageId: sentMessage.sid
      };
    } catch (error: any) {
      console.error('SMS sending error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send SMS'
      };
    }
  }

  /**
   * Format phone number for international SMS
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If starts with 0 (Ghana local format), replace with +233
    if (cleaned.startsWith('0')) {
      cleaned = '+233' + cleaned.substring(1);
    }
    // If doesn't start with +, assume Ghana and add +233
    else if (!cleaned.startsWith('+') && !cleaned.startsWith('233')) {
      cleaned = '+233' + cleaned;
    }
    // If starts with 233 but no +, add +
    else if (cleaned.startsWith('233') && !cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }

    return cleaned;
  }

  /**
   * Job started notification
   */
  async notifyJobStarted(
    customerPhone: string,
    customerName: string,
    jobData: {
      jobNumber: string;
      vehicle: string;
      mechanicName?: string;
      estimatedCompletion?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const message = `Hi ${customerName}! 

Work on your ${jobData.vehicle} has started (Job #${jobData.jobNumber}).${jobData.mechanicName ? ` Mechanic: ${jobData.mechanicName}` : ''}${jobData.estimatedCompletion ? ` Expected completion: ${jobData.estimatedCompletion}` : ''}

We'll update you on progress.

- Biskaken Auto Services`;

    return this.sendSMS(customerPhone, message, { priority: 'normal' });
  }

  /**
   * Job completed notification
   */
  async notifyJobCompleted(
    customerPhone: string,
    customerName: string,
    jobData: {
      jobNumber: string;
      vehicle: string;
      totalCost: number;
      pickupTime?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const message = `Hi ${customerName}! 

Great news! Your ${jobData.vehicle} is ready for pickup (Job #${jobData.jobNumber}).

Total: GHS ${jobData.totalCost.toFixed(2)}${jobData.pickupTime ? `
Pickup time: ${jobData.pickupTime}` : ''}

Thank you for choosing Biskaken Auto Services!`;

    return this.sendSMS(customerPhone, message, { priority: 'high' });
  }

  /**
   * Payment reminder notification
   */
  async sendPaymentReminder(
    customerPhone: string,
    customerName: string,
    invoiceData: {
      invoiceNumber: string;
      amount: number;
      dueDate?: string;
      paymentLink?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const message = `Hi ${customerName}!

Reminder: Invoice ${invoiceData.invoiceNumber} for GHS ${invoiceData.amount.toFixed(2)} is pending payment.${invoiceData.dueDate ? ` Due: ${invoiceData.dueDate}` : ''}${invoiceData.paymentLink ? `

Pay online: ${invoiceData.paymentLink}` : ''}

Thank you!
- Biskaken Auto Services`;

    return this.sendSMS(customerPhone, message, { priority: 'normal' });
  }

  /**
   * Appointment reminder notification
   */
  async sendAppointmentReminder(
    customerPhone: string,
    customerName: string,
    appointmentData: {
      date: string;
      time: string;
      service: string;
      vehicle?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const message = `Hi ${customerName}!

Reminder: Your appointment is tomorrow (${appointmentData.date}) at ${appointmentData.time} for ${appointmentData.service}${appointmentData.vehicle ? ` on your ${appointmentData.vehicle}` : ''}.

Please arrive 10 minutes early.

- Biskaken Auto Services
Call: 0XX XXX XXXX`;

    return this.sendSMS(customerPhone, message, { priority: 'normal' });
  }

  /**
   * Parts arrival notification
   */
  async notifyPartsArrived(
    customerPhone: string,
    customerName: string,
    jobData: {
      jobNumber: string;
      vehicle: string;
      partsDescription: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const message = `Hi ${customerName}!

Good news! The parts for your ${jobData.vehicle} (Job #${jobData.jobNumber}) have arrived: ${jobData.partsDescription}

We'll resume work shortly and keep you updated.

- Biskaken Auto Services`;

    return this.sendSMS(customerPhone, message, { priority: 'normal' });
  }

  /**
   * Service maintenance reminder
   */
  async sendMaintenanceReminder(
    customerPhone: string,
    customerName: string,
    maintenanceData: {
      vehicle: string;
      mileage: number;
      serviceType: string;
      dueDate: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const message = `Hi ${customerName}!

Your ${maintenanceData.vehicle} (${maintenanceData.mileage.toLocaleString()}km) is due for ${maintenanceData.serviceType} service by ${maintenanceData.dueDate}.

Book now to keep your vehicle running smoothly!

- Biskaken Auto Services
Call: 0XX XXX XXXX`;

    return this.sendSMS(customerPhone, message, { priority: 'normal' });
  }

  /**
   * Emergency/urgent notification
   */
  async sendUrgentNotification(
    customerPhone: string,
    customerName: string,
    urgentData: {
      jobNumber: string;
      vehicle: string;
      issue: string;
      action: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const message = `URGENT - ${customerName}!

Important update on your ${urgentData.vehicle} (Job #${urgentData.jobNumber}):

${urgentData.issue}

${urgentData.action}

Please call us immediately: 0XX XXX XXXX

- Biskaken Auto Services`;

    return this.sendSMS(customerPhone, message, { priority: 'high' });
  }

  /**
   * Promotional/marketing messages
   */
  async sendPromoMessage(
    customerPhone: string,
    customerName: string,
    promoData: {
      title: string;
      description: string;
      validUntil?: string;
      code?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const message = `Hi ${customerName}!

${promoData.title}

${promoData.description}${promoData.code ? `

Use code: ${promoData.code}` : ''}${promoData.validUntil ? `
Valid until: ${promoData.validUntil}` : ''}

- Biskaken Auto Services`;

    return this.sendSMS(customerPhone, message, { priority: 'normal' });
  }

  /**
   * Bulk SMS to multiple recipients
   */
  async sendBulkSMS(
    recipients: Array<{
      phone: string;
      name: string;
      customMessage?: string;
    }>,
    defaultMessage: string,
    options: {
      batchSize?: number;
      delayBetweenBatches?: number; // milliseconds
    } = {}
  ): Promise<{
    success: boolean;
    results: Array<{
      phone: string;
      success: boolean;
      messageId?: string;
      error?: string;
    }>;
  }> {
    const batchSize = options.batchSize || 10;
    const delay = options.delayBetweenBatches || 1000;
    const results: any[] = [];

    // Process in batches to avoid rate limiting
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (recipient) => {
        const message = recipient.customMessage || defaultMessage.replace('{name}', recipient.name);
        const result = await this.sendSMS(recipient.phone, message);
        
        return {
          phone: recipient.phone,
          success: result.success,
          messageId: result.messageId,
          error: result.error
        };
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Delay between batches (except for the last batch)
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    const successCount = results.filter(r => r.success).length;
    
    return {
      success: successCount > 0,
      results
    };
  }

  /**
   * Check SMS service status
   */
  getServiceStatus(): {
    isConfigured: boolean;
    accountSid?: string;
    fromNumber?: string;
  } {
    return {
      isConfigured: this.isConfigured,
      accountSid: this.isConfigured ? process.env.TWILIO_ACCOUNT_SID?.substring(0, 10) + '...' : undefined,
      fromNumber: process.env.TWILIO_PHONE_NUMBER
    };
  }
}

export const smsService = new SMSService();