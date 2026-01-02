/**
 * PDF Service
 * Generates PDF documents for invoices, reports, and other business documents
 */
declare class PDFService {
    private tempDir;
    constructor();
    /**
     * Ensure temp directory exists
     */
    private ensureTempDirectory;
    /**
     * Generate invoice PDF
     */
    generateInvoice(invoiceData: {
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
    }): Promise<string>;
    /**
     * Add header with shop information
     */
    private addHeader;
    /**
     * Draw items table
     */
    private drawItemsTable;
    /**
     * Draw totals section
     */
    private drawTotals;
    /**
     * Add notes and status
     */
    private addNotesAndStatus;
    /**
     * Add footer
     */
    private addFooter;
    /**
     * Generate job report PDF
     */
    generateJobReport(reportData: {
        title: string;
        dateRange: {
            from: Date;
            to: Date;
        };
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
    }): Promise<string>;
    /**
     * Draw jobs table for reports
     */
    private drawJobsTable;
    /**
     * Format date for display
     */
    private formatDate;
    /**
     * Clean up old PDF files
     */
    cleanupOldFiles(maxAgeHours?: number): Promise<void>;
    /**
     * Get PDF file info
     */
    getFileInfo(filepath: string): Promise<{
        exists: boolean;
        size?: number;
        createdAt?: Date;
    }>;
    /**
     * Delete PDF file
     */
    deleteFile(filepath: string): Promise<boolean>;
}
export declare const pdfService: PDFService;
export {};
//# sourceMappingURL=pdfService.d.ts.map