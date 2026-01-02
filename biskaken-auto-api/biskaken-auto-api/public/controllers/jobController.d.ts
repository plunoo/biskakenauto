import { Response } from 'express';
import { AuthRequest, ApiResponse } from '../types';
/**
 * Job Controller
 * Handles vehicle repair job management operations
 */
export declare const jobController: {
    /**
     * Get all jobs with filtering and pagination
     */
    list(req: AuthRequest, res: Response<ApiResponse>): Promise<void>;
    /**
     * Get single job by ID
     */
    getById(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
    /**
     * Create new job
     */
    create(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
    /**
     * Update job
     */
    update(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
    /**
     * Update job status
     */
    updateStatus(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
    /**
     * Assign job to mechanic
     */
    assign(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
    /**
     * Delete job (Admin only)
     */
    delete(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
    /**
     * Get job statistics
     */
    getStats(req: AuthRequest, res: Response<ApiResponse>): Promise<void>;
};
//# sourceMappingURL=jobController.d.ts.map