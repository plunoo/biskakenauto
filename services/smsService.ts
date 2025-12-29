// SMS Service for Customer Notifications
// Production API will be integrated during deployment

export interface SMSMessage {
  to: string; // Customer phone number
  message: string;
  type: 'job_update' | 'invoice' | 'reminder' | 'promotion';
  jobId?: string;
  invoiceId?: string;
}

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  cost?: number;
}

class SMSService {
  private apiKey: string = '';
  private apiUrl: string = 'https://api.sms-provider.com/v1/send'; // Will be updated in production
  private isProduction: boolean = false;

  constructor() {
    // In production, this will be set from environment variables
    this.apiKey = process.env.SMS_API_KEY || 'demo_key';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  // Format phone number for Ghana (+233)
  private formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // If starts with 0, replace with 233
    if (cleaned.startsWith('0')) {
      return `+233${cleaned.substring(1)}`;
    }
    
    // If starts with 233, add +
    if (cleaned.startsWith('233')) {
      return `+${cleaned}`;
    }
    
    // If doesn't start with country code, assume it's local Ghana number
    if (cleaned.length === 9) {
      return `+233${cleaned}`;
    }
    
    return `+${cleaned}`;
  }

  // Send SMS notification
  async sendSMS(message: SMSMessage): Promise<SMSResponse> {
    try {
      const formattedPhone = this.formatPhoneNumber(message.to);
      
      // In development, simulate SMS sending
      if (!this.isProduction) {
        console.log('🔔 SMS Notification (Development Mode):');
        console.log(`📱 To: ${formattedPhone}`);
        console.log(`📝 Message: ${message.message}`);
        console.log(`🏷️ Type: ${message.type}`);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
          success: true,
          messageId: `dev_msg_${Date.now()}`,
          cost: 0.05 // Simulated cost in GHS
        };
      }

      // Production SMS API call
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          to: formattedPhone,
          message: message.message,
          from: 'BISKAKEN', // Sender ID
          type: 'plain'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          messageId: data.messageId,
          cost: data.cost
        };
      } else {
        throw new Error(data.error || 'SMS sending failed');
      }
    } catch (error) {
      console.error('SMS sending error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Send job status update SMS
  async sendJobStatusUpdate(customerPhone: string, customerName: string, jobId: string, status: string, vehicleInfo: string): Promise<SMSResponse> {
    let message = '';
    
    switch (status) {
      case 'IN_PROGRESS':
        message = `Hello ${customerName}, your vehicle (${vehicleInfo}) repair has started. Job ID: ${jobId}. We'll update you when it's ready. - Biskaken Auto`;
        break;
      case 'COMPLETED':
        message = `Good news ${customerName}! Your vehicle (${vehicleInfo}) is ready for pickup. Job ID: ${jobId}. Please visit us at your convenience. - Biskaken Auto`;
        break;
      case 'ON_HOLD':
        message = `Hi ${customerName}, your vehicle repair (${vehicleInfo}) is temporarily on hold. Job ID: ${jobId}. We'll contact you shortly. - Biskaken Auto`;
        break;
      default:
        message = `Hi ${customerName}, update on your vehicle (${vehicleInfo}): Status changed to ${status}. Job ID: ${jobId}. - Biskaken Auto`;
    }

    return await this.sendSMS({
      to: customerPhone,
      message,
      type: 'job_update',
      jobId
    });
  }

  // Send invoice SMS
  async sendInvoiceNotification(customerPhone: string, customerName: string, invoiceId: string, amount: number): Promise<SMSResponse> {
    const message = `Hi ${customerName}, your invoice #${invoiceId} for GH₵${amount.toFixed(2)} is ready. You can pay via Mobile Money or Cash. Thank you! - Biskaken Auto`;
    
    return await this.sendSMS({
      to: customerPhone,
      message,
      type: 'invoice',
      invoiceId
    });
  }

  // Send payment confirmation SMS
  async sendPaymentConfirmation(customerPhone: string, customerName: string, amount: number, method: string): Promise<SMSResponse> {
    const message = `Thank you ${customerName}! Payment of GH₵${amount.toFixed(2)} received via ${method}. Your receipt has been generated. - Biskaken Auto`;
    
    return await this.sendSMS({
      to: customerPhone,
      message,
      type: 'invoice'
    });
  }

  // Send appointment reminder SMS
  async sendAppointmentReminder(customerPhone: string, customerName: string, appointmentDate: string): Promise<SMSResponse> {
    const message = `Reminder: ${customerName}, you have an appointment at Biskaken Auto on ${appointmentDate}. Please call us if you need to reschedule. - Biskaken Auto`;
    
    return await this.sendSMS({
      to: customerPhone,
      message,
      type: 'reminder'
    });
  }

  // Send promotional SMS
  async sendPromotionalMessage(customerPhone: string, customerName: string, promotion: string): Promise<SMSResponse> {
    const message = `Hi ${customerName}, ${promotion} Valid until end of month. Visit Biskaken Auto today! - Biskaken Auto`;
    
    return await this.sendSMS({
      to: customerPhone,
      message,
      type: 'promotion'
    });
  }

  // Bulk SMS for all customers
  async sendBulkSMS(customers: Array<{phone: string, name: string}>, message: string, type: SMSMessage['type'] = 'promotion'): Promise<SMSResponse[]> {
    const results: SMSResponse[] = [];
    
    for (const customer of customers) {
      const personalizedMessage = message.replace('{name}', customer.name);
      const result = await this.sendSMS({
        to: customer.phone,
        message: personalizedMessage,
        type
      });
      results.push(result);
      
      // Add delay between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    return results;
  }
}

// Export singleton instance
export const smsService = new SMSService();

// SMS Templates for common notifications
export const SMS_TEMPLATES = {
  JOB_STARTED: (name: string, vehicle: string, jobId: string) => 
    `Hello ${name}, your vehicle (${vehicle}) repair has started. Job ID: ${jobId}. We'll update you when it's ready. - Biskaken Auto`,
  
  JOB_COMPLETED: (name: string, vehicle: string, jobId: string) =>
    `Good news ${name}! Your vehicle (${vehicle}) is ready for pickup. Job ID: ${jobId}. Please visit us at your convenience. - Biskaken Auto`,
  
  INVOICE_READY: (name: string, invoiceId: string, amount: number) =>
    `Hi ${name}, your invoice #${invoiceId} for GH₵${amount.toFixed(2)} is ready. You can pay via Mobile Money or Cash. Thank you! - Biskaken Auto`,
  
  PAYMENT_RECEIVED: (name: string, amount: number, method: string) =>
    `Thank you ${name}! Payment of GH₵${amount.toFixed(2)} received via ${method}. Your receipt has been generated. - Biskaken Auto`,
  
  APPOINTMENT_REMINDER: (name: string, date: string) =>
    `Reminder: ${name}, you have an appointment at Biskaken Auto on ${date}. Please call us if you need to reschedule. - Biskaken Auto`,
  
  LOW_STOCK_ALERT: (itemName: string, currentStock: number) =>
    `Alert: ${itemName} is running low (${currentStock} remaining). Please restock soon. - Biskaken Auto System`,
  
  BULK_PROMOTION: (name: string, offer: string) =>
    `Hi ${name}, ${offer} Valid until end of month. Visit Biskaken Auto today! - Biskaken Auto`
};