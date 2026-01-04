import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * PDF Service
 * Generates PDF documents for invoices, reports, and other business documents
 */
class PDFService {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(__dirname, '../../temp');
    this.ensureTempDirectory();
  }

  /**
   * Ensure temp directory exists
   */
  private ensureTempDirectory() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Generate invoice PDF
   */
  async generateInvoice(invoiceData: {
    invoice: {
      id: string;
      invoiceNumber: string;
      date: Date;
      dueDate?: Date;
      subtotal: number;
      tax: number;
      discount: number;
      total: number;
      status: string;
      notes?: string;
      items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
      }>;
    };
    customer: {
      name: string;
      phone: string;
      email?: string;
      address?: string;
    };
    job?: {
      jobNumber: string;
      vehicle: {
        make: string;
        model: string;
        year: number;
        plateNumber?: string;
      };
      complaint: string;
    };
    shop: {
      name: string;
      address?: string;
      phone?: string;
      email?: string;
      logo?: string;
    };
  }): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const { invoice, customer, job, shop } = invoiceData;
        const doc = new PDFDocument({ 
          margin: 50,
          size: 'A4'
        });
        
        const filename = `invoice-${invoice.invoiceNumber}-${Date.now()}.pdf`;
        const filepath = path.join(this.tempDir, filename);
        const stream = fs.createWriteStream(filepath);
        
        doc.pipe(stream);

        // Colors
        const primaryColor = '#2563eb'; // Blue
        const secondaryColor = '#6b7280'; // Gray
        const accentColor = '#dc2626'; // Red

        // Header with logo and shop info
        this.addHeader(doc, shop, primaryColor);

        // Invoice title and number
        doc.fontSize(24)
           .fillColor(primaryColor)
           .text('INVOICE', 400, 80, { align: 'right' });
        
        doc.fontSize(12)
           .fillColor(secondaryColor)
           .text(`Invoice #: ${invoice.invoiceNumber}`, 400, 110, { align: 'right' })
           .text(`Date: ${this.formatDate(invoice.date)}`, 400, 125, { align: 'right' });

        if (invoice.dueDate) {
          doc.text(`Due Date: ${this.formatDate(invoice.dueDate)}`, 400, 140, { align: 'right' });
        }

        // Customer information
        let yPos = 180;
        doc.fontSize(14)
           .fillColor('#000000')
           .text('Bill To:', 50, yPos);
        
        yPos += 20;
        doc.fontSize(11)
           .text(customer.name, 50, yPos);
        yPos += 15;
        doc.text(customer.phone, 50, yPos);
        
        if (customer.email) {
          yPos += 15;
          doc.text(customer.email, 50, yPos);
        }
        
        if (customer.address) {
          yPos += 15;
          doc.text(customer.address, 50, yPos, { width: 200 });
        }

        // Vehicle information (if available)
        if (job) {
          yPos += 30;
          doc.fontSize(12)
             .fillColor(secondaryColor)
             .text('Vehicle Information:', 50, yPos);
          
          yPos += 15;
          doc.fontSize(11)
             .fillColor('#000000')
             .text(`${job.vehicle.year} ${job.vehicle.make} ${job.vehicle.model}`, 50, yPos);
          
          if (job.vehicle.plateNumber) {
            yPos += 15;
            doc.text(`Plate: ${job.vehicle.plateNumber}`, 50, yPos);
          }
          
          yPos += 15;
          doc.text(`Job #: ${job.jobNumber}`, 50, yPos);
        }

        // Items table
        yPos = Math.max(yPos + 40, 320);
        this.drawItemsTable(doc, invoice.items, yPos, primaryColor);

        // Calculate totals position
        const totalsYPos = yPos + 60 + (invoice.items.length * 20);
        
        // Totals section
        this.drawTotals(doc, invoice, totalsYPos, primaryColor, accentColor);

        // Status and notes
        const notesYPos = totalsYPos + 120;
        this.addNotesAndStatus(doc, invoice, notesYPos, secondaryColor);

        // Footer
        this.addFooter(doc, shop, secondaryColor);

        doc.end();

        stream.on('finish', () => {
          resolve(filepath);
        });

        stream.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Add header with shop information
   */
  private addHeader(doc: PDFKit.PDFDocument, shop: any, primaryColor: string) {
    // Shop name
    doc.fontSize(22)
       .fillColor(primaryColor)
       .text(shop.name.toUpperCase(), 50, 50);

    // Shop details
    if (shop.address || shop.phone || shop.email) {
      let headerY = 75;
      doc.fontSize(10)
         .fillColor('#6b7280');

      if (shop.address) {
        doc.text(shop.address, 50, headerY);
        headerY += 12;
      }
      if (shop.phone) {
        doc.text(`Tel: ${shop.phone}`, 50, headerY);
        headerY += 12;
      }
      if (shop.email) {
        doc.text(`Email: ${shop.email}`, 50, headerY);
      }
    }

    // Line separator
    doc.moveTo(50, 140)
       .lineTo(545, 140)
       .strokeColor(primaryColor)
       .lineWidth(2)
       .stroke();
  }

  /**
   * Draw items table
   */
  private drawItemsTable(doc: PDFKit.PDFDocument, items: any[], startY: number, primaryColor: string) {
    // Table headers
    doc.fontSize(11)
       .fillColor('#ffffff')
       .rect(50, startY, 495, 25)
       .fill(primaryColor);

    doc.fillColor('#ffffff')
       .text('Description', 60, startY + 8)
       .text('Qty', 320, startY + 8)
       .text('Unit Price', 370, startY + 8)
       .text('Total', 480, startY + 8);

    // Table rows
    let yPos = startY + 30;
    doc.fillColor('#000000');
    
    items.forEach((item, index) => {
      const bgColor = index % 2 === 0 ? '#f9fafb' : '#ffffff';
      
      doc.rect(50, yPos - 5, 495, 20)
         .fill(bgColor);

      doc.fillColor('#000000')
         .fontSize(10)
         .text(item.description, 60, yPos, { width: 250 })
         .text(item.quantity.toString(), 320, yPos)
         .text(`GHS ${item.unitPrice.toFixed(2)}`, 370, yPos)
         .text(`GHS ${item.total.toFixed(2)}`, 480, yPos);
      
      yPos += 20;
    });

    // Table border
    doc.rect(50, startY, 495, 25 + (items.length * 20))
       .strokeColor('#e5e7eb')
       .stroke();
  }

  /**
   * Draw totals section
   */
  private drawTotals(doc: PDFKit.PDFDocument, invoice: any, yPos: number, primaryColor: string, accentColor: string) {
    const rightAlign = 470;
    
    doc.fontSize(11)
       .fillColor('#000000');

    // Subtotal
    doc.text('Subtotal:', 350, yPos)
       .text(`GHS ${invoice.subtotal.toFixed(2)}`, rightAlign, yPos);

    // Discount (if any)
    if (invoice.discount > 0) {
      yPos += 20;
      doc.fillColor(accentColor)
         .text('Discount:', 350, yPos)
         .text(`-GHS ${invoice.discount.toFixed(2)}`, rightAlign, yPos);
    }

    // Tax (if any)
    if (invoice.tax > 0) {
      yPos += 20;
      doc.fillColor('#000000')
         .text('Tax:', 350, yPos)
         .text(`GHS ${invoice.tax.toFixed(2)}`, rightAlign, yPos);
    }

    // Total line
    yPos += 20;
    doc.moveTo(350, yPos - 5)
       .lineTo(545, yPos - 5)
       .strokeColor(primaryColor)
       .lineWidth(1)
       .stroke();

    // Total amount
    yPos += 10;
    doc.fontSize(14)
       .fillColor(primaryColor)
       .text('TOTAL:', 350, yPos)
       .text(`GHS ${invoice.total.toFixed(2)}`, rightAlign, yPos);
  }

  /**
   * Add notes and status
   */
  private addNotesAndStatus(doc: PDFKit.PDFDocument, invoice: any, yPos: number, secondaryColor: string) {
    // Status
    const statusColors: { [key: string]: string } = {
      'PAID': '#16a34a',
      'UNPAID': '#dc2626',
      'OVERDUE': '#ea580c',
      'DRAFT': '#6b7280'
    };

    doc.fontSize(12)
       .fillColor(statusColors[invoice.status] || secondaryColor)
       .text(`Status: ${invoice.status}`, 50, yPos);

    // Notes
    if (invoice.notes) {
      yPos += 30;
      doc.fontSize(11)
         .fillColor('#000000')
         .text('Notes:', 50, yPos);
      
      yPos += 15;
      doc.fontSize(10)
         .fillColor(secondaryColor)
         .text(invoice.notes, 50, yPos, { width: 400 });
    }
  }

  /**
   * Add footer
   */
  private addFooter(doc: PDFKit.PDFDocument, shop: any, secondaryColor: string) {
    const footerY = 720;
    
    doc.fontSize(8)
       .fillColor(secondaryColor)
       .text('Thank you for your business!', 50, footerY, {
         align: 'center',
         width: 495
       });

    doc.text(`Generated on ${this.formatDate(new Date())} by Biskaken Auto Services`, 50, footerY + 15, {
      align: 'center',
      width: 495
    });
  }

  /**
   * Generate job report PDF
   */
  async generateJobReport(reportData: {
    title: string;
    dateRange: { from: Date; to: Date };
    jobs: Array<{
      jobNumber: string;
      customer: string;
      vehicle: string;
      status: string;
      priority: string;
      createdAt: Date;
      completedAt?: Date;
      totalCost?: number;
    }>;
    summary: {
      totalJobs: number;
      completedJobs: number;
      totalRevenue: number;
      averageJobTime: number;
    };
  }): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const filename = `job-report-${Date.now()}.pdf`;
        const filepath = path.join(this.tempDir, filename);
        const stream = fs.createWriteStream(filepath);
        
        doc.pipe(stream);

        // Report header
        doc.fontSize(20)
           .fillColor('#2563eb')
           .text(reportData.title, 50, 50);

        doc.fontSize(12)
           .fillColor('#6b7280')
           .text(`Period: ${this.formatDate(reportData.dateRange.from)} - ${this.formatDate(reportData.dateRange.to)}`, 50, 80)
           .text(`Generated: ${this.formatDate(new Date())}`, 50, 95);

        // Summary section
        let yPos = 130;
        doc.fontSize(14)
           .fillColor('#000000')
           .text('Summary', 50, yPos);

        yPos += 25;
        doc.fontSize(11)
           .text(`Total Jobs: ${reportData.summary.totalJobs}`, 50, yPos)
           .text(`Completed: ${reportData.summary.completedJobs}`, 200, yPos)
           .text(`Revenue: GHS ${reportData.summary.totalRevenue.toFixed(2)}`, 350, yPos);

        // Jobs table
        yPos += 40;
        this.drawJobsTable(doc, reportData.jobs, yPos);

        doc.end();

        stream.on('finish', () => {
          resolve(filepath);
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Draw jobs table for reports
   */
  private drawJobsTable(doc: PDFKit.PDFDocument, jobs: any[], startY: number) {
    // Table headers
    const headers = ['Job #', 'Customer', 'Vehicle', 'Status', 'Date', 'Cost'];
    const columnWidths = [70, 120, 120, 70, 80, 80];
    let xPos = 50;

    doc.fontSize(10)
       .fillColor('#ffffff')
       .rect(50, startY, 540, 20)
       .fill('#2563eb');

    headers.forEach((header, index) => {
      doc.fillColor('#ffffff')
         .text(header, xPos + 5, startY + 6);
      xPos += columnWidths[index];
    });

    // Table rows
    let yPos = startY + 25;
    doc.fillColor('#000000');

    jobs.slice(0, 25).forEach((job, index) => { // Limit to 25 jobs per page
      const bgColor = index % 2 === 0 ? '#f9fafb' : '#ffffff';
      
      doc.rect(50, yPos - 2, 540, 18)
         .fill(bgColor);

      xPos = 50;
      doc.fillColor('#000000')
         .fontSize(9)
         .text(job.jobNumber, xPos + 3, yPos, { width: columnWidths[0] - 6 });
      
      xPos += columnWidths[0];
      doc.text(job.customer, xPos + 3, yPos, { width: columnWidths[1] - 6 });
      
      xPos += columnWidths[1];
      doc.text(job.vehicle, xPos + 3, yPos, { width: columnWidths[2] - 6 });
      
      xPos += columnWidths[2];
      doc.text(job.status, xPos + 3, yPos, { width: columnWidths[3] - 6 });
      
      xPos += columnWidths[3];
      doc.text(this.formatDate(job.createdAt), xPos + 3, yPos, { width: columnWidths[4] - 6 });
      
      xPos += columnWidths[4];
      doc.text(job.totalCost ? `GHS ${job.totalCost.toFixed(2)}` : '-', xPos + 3, yPos, { width: columnWidths[5] - 6 });
      
      yPos += 18;
    });

    // Table border
    doc.rect(50, startY, 540, 20 + (Math.min(jobs.length, 25) * 18))
       .strokeColor('#e5e7eb')
       .stroke();
  }

  /**
   * Format date for display
   */
  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Clean up old PDF files
   */
  async cleanupOldFiles(maxAgeHours: number = 24) {
    try {
      const files = fs.readdirSync(this.tempDir);
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert to milliseconds

      for (const file of files) {
        if (file.endsWith('.pdf')) {
          const filePath = path.join(this.tempDir, file);
          const stats = fs.statSync(filePath);
          
          if (now - stats.mtime.getTime() > maxAge) {
            fs.unlinkSync(filePath);
            console.log(`Cleaned up old PDF: ${file}`);
          }
        }
      }
    } catch (error) {
      console.error('PDF cleanup error:', error);
    }
  }

  /**
   * Get PDF file info
   */
  async getFileInfo(filepath: string): Promise<{
    exists: boolean;
    size?: number;
    createdAt?: Date;
  }> {
    try {
      if (!fs.existsSync(filepath)) {
        return { exists: false };
      }

      const stats = fs.statSync(filepath);
      return {
        exists: true,
        size: stats.size,
        createdAt: stats.birthtime
      };
    } catch (error) {
      return { exists: false };
    }
  }

  /**
   * Delete PDF file
   */
  async deleteFile(filepath: string): Promise<boolean> {
    try {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting PDF:', error);
      return false;
    }
  }
}

export const pdfService = new PDFService();