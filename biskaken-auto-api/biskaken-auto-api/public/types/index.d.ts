import { Request } from 'express';
export declare enum UserRole {
    ADMIN = "ADMIN",
    SUB_ADMIN = "SUB_ADMIN",
    STAFF = "STAFF"
}
export declare enum UserStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE"
}
export interface User {
    id: string;
    email: string;
    phone?: string;
    name: string;
    role: UserRole;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
}
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        name: string;
    };
}
export interface JWTPayload {
    userId: string;
    role: string;
}
export interface LoginCredentials {
    email: string;
    password: string;
}
export interface RegisterData {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role?: UserRole;
}
export interface Customer {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface Vehicle {
    id: string;
    customerId: string;
    make: string;
    model: string;
    year: number;
    plateNumber?: string;
    vin?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare enum JobStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare enum JobPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH"
}
export interface Job {
    id: string;
    jobNumber: string;
    customerId: string;
    vehicleId: string;
    complaint: string;
    diagnosis?: string;
    aiDiagnosis?: any;
    status: JobStatus;
    priority: JobPriority;
    assignedTo?: string;
    laborHours?: number;
    laborRate?: number;
    estimatedCost?: number;
    actualCost?: number;
    expectedCompletion?: Date;
    startedAt?: Date;
    completedAt?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface InventoryItem {
    id: string;
    partName: string;
    category: string;
    stockQty: number;
    reorderLevel: number;
    unitCost: number;
    sellingPrice: number;
    supplier?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare enum InvoiceStatus {
    DRAFT = "DRAFT",
    SENT = "SENT",
    PAID = "PAID",
    OVERDUE = "OVERDUE",
    CANCELLED = "CANCELLED"
}
export declare enum PaymentMethod {
    CASH = "CASH",
    MOBILE_MONEY = "MOBILE_MONEY",
    CARD = "CARD",
    BANK_TRANSFER = "BANK_TRANSFER",
    USDT = "USDT"
}
export interface Invoice {
    id: string;
    invoiceNumber: string;
    jobId?: string;
    customerId: string;
    date: Date;
    dueDate?: Date;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    status: InvoiceStatus;
    paymentMethod?: PaymentMethod;
    paymentDate?: Date;
    paymentRef?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface InvoiceItem {
    id: string;
    invoiceId: string;
    partId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}
export interface AIDiagnosis {
    diagnosis: string;
    confidence: number;
    estimatedCostRange: string;
    suggestedParts: string[];
    repairTime: string;
    urgency: 'Low' | 'Medium' | 'High';
}
export interface AIInsight {
    category: string;
    recommendation: string;
    impact: 'Low' | 'Medium' | 'High';
    actionRequired: boolean;
}
export interface PaymentResponse {
    success: boolean;
    data?: any;
    error?: string;
}
export interface PaystackInitResponse {
    authorization_url: string;
    access_code: string;
    reference: string;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
export interface PaginationQuery {
    page?: string;
    limit?: string;
}
export interface CustomerQuery extends PaginationQuery {
    search?: string;
}
export interface JobQuery extends PaginationQuery {
    status?: JobStatus;
    priority?: JobPriority;
    assignedTo?: string;
}
export interface InventoryQuery extends PaginationQuery {
    category?: string;
    lowStock?: string;
}
export interface ReportDateRange {
    from?: string;
    to?: string;
}
//# sourceMappingURL=index.d.ts.map