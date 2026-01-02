import { Response } from 'express';
import { AuthRequest, ApiResponse } from '../types';
/**
 * Customer Controller
 * Handles customer and vehicle management operations
 */
export declare const customerController: {
    /**
     * Get all customers with pagination and search
     */
    list(req: AuthRequest, res: Response<ApiResponse>): Promise<void>;
    /**
     * Get single customer by ID
     */
    getById(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
    /**
     * Create new customer with vehicle
     */
    create(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
    /**
     * Update customer
     */
    update(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
    /**
     * Delete customer (Admin only)
     */
    delete(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
    /**
     * Get customer job history
     */
    getHistory(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
    /**
     * Search customers
     */
    search(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
};
//# sourceMappingURL=customerController.d.ts.map