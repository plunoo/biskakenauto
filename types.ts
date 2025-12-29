
export enum UserRole {
  ADMIN = 'ADMIN',
  SUB_ADMIN = 'SUB_ADMIN',
  STAFF = 'STAFF'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  vehicle: {
    make: string;
    model: string;
    year: string;
    plateNumber: string;
    vin?: string;
  };
  notes?: string;
  createdAt: string;
}

export enum JobStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface Job {
  id: string;
  customerId: string;
  customerName: string; // Denormalized for easy listing
  vehicleInfo: string;
  issueDescription: string;
  status: JobStatus;
  priority: Priority;
  assignedMechanic?: string;
  estimatedCost: number;
  parts: Array<{ id: string; name: string; quantity: number; price: number }>;
  laborHours: number;
  laborRate: number;
  expectedCompletion?: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  reorderLevel: number;
  unitCost: number;
  sellingPrice: number;
  supplier?: string;
}

export enum InvoiceStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  OVERDUE = 'OVERDUE'
}

export interface Invoice {
  id: string;
  jobId?: string;
  customerId: string;
  customerName: string;
  date: string;
  dueDate?: string;
  items: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  status: InvoiceStatus;
  payments: Array<{ amount: number; date: string; method: string; ref?: string }>;
}

export interface AIDiagnosis {
  diagnosis: string;
  confidence: number;
  estimatedCostRange: string;
  suggestedParts: string[];
  repairTime: string;
}
