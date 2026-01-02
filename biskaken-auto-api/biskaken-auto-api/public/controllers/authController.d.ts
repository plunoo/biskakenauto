import { Response } from 'express';
import { AuthRequest, ApiResponse } from '../types';
/**
 * Authentication Controller
 * Handles user registration, login, and authentication-related operations
 */
export declare const authController: {
    /**
     * Register new user (Admin setup or staff creation)
     */
    register(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
    /**
     * User login
     */
    login(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
    /**
     * Get current user profile
     */
    me(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
    /**
     * Change password
     */
    changePassword(req: AuthRequest, res: Response<ApiResponse>): Promise<Response<ApiResponse<any>, Record<string, any>>>;
    /**
     * Logout (optional - mainly for logging purposes)
     */
    logout(req: AuthRequest, res: Response<ApiResponse>): Promise<void>;
};
//# sourceMappingURL=authController.d.ts.map