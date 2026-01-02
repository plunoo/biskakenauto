import { Response, NextFunction } from 'express';
import { AuthRequest, ApiResponse } from '../types';
/**
 * Authentication middleware - Verifies JWT token and adds user to request
 */
export declare const authenticate: (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => Promise<Response<ApiResponse<any>, Record<string, any>>>;
/**
 * Role-based authorization middleware
 * @param roles - Array of allowed roles
 */
export declare const authorize: (...roles: string[]) => (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction) => Response<ApiResponse<any>, Record<string, any>>;
/**
 * Optional authentication - adds user to request if token provided
 */
export declare const optionalAuth: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map