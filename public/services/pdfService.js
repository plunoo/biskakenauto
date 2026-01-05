import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
class PDFService {
    constructor() {
        this.tempDir = path.join(__dirname, '../../temp');
        this.ensureTempDirectory();
    }
    ensureTempDirectory() {
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }
    async generateInvoice(invoiceData) {
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
                const primaryColor = '#2563eb';
                const secondaryColor = '#6b7280';
                const accentColor = '#dc2626';
                this.addHeader(doc, shop, primaryColor);
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
                yPos = Math.max(yPos + 40, 320);
                this.drawItemsTable(doc, invoice.items, yPos, primaryColor);
                const totalsYPos = yPos + 60 + (invoice.items.length * 20);
                this.drawTotals(doc, invoice, totalsYPos, primaryColor, accentColor);
                const notesYPos = totalsYPos + 120;
                this.addNotesAndStatus(doc, invoice, notesYPos, secondaryColor);
                this.addFooter(doc, shop, secondaryColor);
                doc.end();
                stream.on('finish', () => {
                    resolve(filepath);
                });
                stream.on('error', (error) => {
                    reject(error);
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    addHeader(doc, shop, primaryColor) {
        doc.fontSize(22)
            .fillColor(primaryColor)
            .text(shop.name.toUpperCase(), 50, 50);
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
        doc.moveTo(50, 140)
            .lineTo(545, 140)
            .strokeColor(primaryColor)
            .lineWidth(2)
            .stroke();
    }
    drawItemsTable(doc, items, startY, primaryColor) {
        doc.fontSize(11)
            .fillColor('#ffffff')
            .rect(50, startY, 495, 25)
            .fill(primaryColor);
        doc.fillColor('#ffffff')
            .text('Description', 60, startY + 8)
            .text('Qty', 320, startY + 8)
            .text('Unit Price', 370, startY + 8)
            .text('Total', 480, startY + 8);
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
        doc.rect(50, startY, 495, 25 + (items.length * 20))
            .strokeColor('#e5e7eb')
            .stroke();
    }
    drawTotals(doc, invoice, yPos, primaryColor, accentColor) {
        const rightAlign = 470;
        doc.fontSize(11)
            .fillColor('#000000');
        doc.text('Subtotal:', 350, yPos)
            .text(`GHS ${invoice.subtotal.toFixed(2)}`, rightAlign, yPos);
        if (invoice.discount > 0) {
            yPos += 20;
            doc.fillColor(accentColor)
                .text('Discount:', 350, yPos)
                .text(`-GHS ${invoice.discount.toFixed(2)}`, rightAlign, yPos);
        }
        if (invoice.tax > 0) {
            yPos += 20;
            doc.fillColor('#000000')
                .text('Tax:', 350, yPos)
                .text(`GHS ${invoice.tax.toFixed(2)}`, rightAlign, yPos);
        }
        yPos += 20;
        doc.moveTo(350, yPos - 5)
            .lineTo(545, yPos - 5)
            .strokeColor(primaryColor)
            .lineWidth(1)
            .stroke();
        yPos += 10;
        doc.fontSize(14)
            .fillColor(primaryColor)
            .text('TOTAL:', 350, yPos)
            .text(`GHS ${invoice.total.toFixed(2)}`, rightAlign, yPos);
    }
    addNotesAndStatus(doc, invoice, yPos, secondaryColor) {
        const statusColors = {
            'PAID': '#16a34a',
            'UNPAID': '#dc2626',
            'OVERDUE': '#ea580c',
            'DRAFT': '#6b7280'
        };
        doc.fontSize(12)
            .fillColor(statusColors[invoice.status] || secondaryColor)
            .text(`Status: ${invoice.status}`, 50, yPos);
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
    addFooter(doc, shop, secondaryColor) {
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
    async generateJobReport(reportData) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50, size: 'A4' });
                const filename = `job-report-${Date.now()}.pdf`;
                const filepath = path.join(this.tempDir, filename);
                const stream = fs.createWriteStream(filepath);
                doc.pipe(stream);
                doc.fontSize(20)
                    .fillColor('#2563eb')
                    .text(reportData.title, 50, 50);
                doc.fontSize(12)
                    .fillColor('#6b7280')
                    .text(`Period: ${this.formatDate(reportData.dateRange.from)} - ${this.formatDate(reportData.dateRange.to)}`, 50, 80)
                    .text(`Generated: ${this.formatDate(new Date())}`, 50, 95);
                let yPos = 130;
                doc.fontSize(14)
                    .fillColor('#000000')
                    .text('Summary', 50, yPos);
                yPos += 25;
                doc.fontSize(11)
                    .text(`Total Jobs: ${reportData.summary.totalJobs}`, 50, yPos)
                    .text(`Completed: ${reportData.summary.completedJobs}`, 200, yPos)
                    .text(`Revenue: GHS ${reportData.summary.totalRevenue.toFixed(2)}`, 350, yPos);
                yPos += 40;
                this.drawJobsTable(doc, reportData.jobs, yPos);
                doc.end();
                stream.on('finish', () => {
                    resolve(filepath);
                });
                stream.on('error', reject);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    drawJobsTable(doc, jobs, startY) {
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
        let yPos = startY + 25;
        doc.fillColor('#000000');
        jobs.slice(0, 25).forEach((job, index) => {
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
        doc.rect(50, startY, 540, 20 + (Math.min(jobs.length, 25) * 18))
            .strokeColor('#e5e7eb')
            .stroke();
    }
    formatDate(date) {
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    async cleanupOldFiles(maxAgeHours = 24) {
        try {
            const files = fs.readdirSync(this.tempDir);
            const now = Date.now();
            const maxAge = maxAgeHours * 60 * 60 * 1000;
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
        }
        catch (error) {
            console.error('PDF cleanup error:', error);
        }
    }
    async getFileInfo(filepath) {
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
        }
        catch (error) {
            return { exists: false };
        }
    }
    async deleteFile(filepath) {
        try {
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('Error deleting PDF:', error);
            return false;
        }
    }
}
export const pdfService = new PDFService();
