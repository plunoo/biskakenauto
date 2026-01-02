import { Response } from 'express';
import { AuthRequest, ApiResponse } from '../types';
/**
 * Inventory Controller
 * Handles parts inventory management operations
 */
export declare const inventoryController: {
    /**
     * Get all inventory items with filtering and pagination
     */
    list(req: AuthRequest, res: Response<ApiResponse>): Promise<void>;
    /**
     * Get single inventory item by ID
     */
    getById(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
    /**
     * Create new inventory item
     */
    create(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
    /**
     * Update inventory item
     */
    update(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
    /**
     * Delete inventory item (Admin only)
     */
    delete(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
    /**
     * Get low stock alerts
     */
    getLowStock(req: AuthRequest, res: Response<ApiResponse>): Promise<void>;
    /**
     * Update stock quantity (for stock adjustments)
     */
    updateStock(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
    /**
     * AI-powered reorder prediction
     */
    getAIPrediction(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
    /**
     * Get usage report for inventory
     */
    getUsageReport(req: AuthRequest, res: Response<ApiResponse>): Promise<void>;
};
//# sourceMappingURL=inventoryController.d.ts.map