import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';
/**
 * Global error handler middleware
 */
export declare const errorHandler: (error: any, req: Request, res: Response<ApiResponse>, next: NextFunction) => Response<ApiResponse<any>, Record<string, any>>;
/**
 * 404 handler for unmatched routes
 */
export declare const notFound: (req: Request, res: Response<ApiResponse>) => void;
/**
 * Async error wrapper to catch async errors in route handlers
 */
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map