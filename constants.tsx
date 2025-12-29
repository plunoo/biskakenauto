
import React from 'react';
import { UserRole, JobStatus, Priority, InvoiceStatus } from './types';

export const COLORS = {
  primary: '#2563eb',
  secondary: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  gray: '#6b7280',
  background: '#f9fafb',
};

export const VEHICLE_MAKES = [
  'Toyota', 'Honda', 'Nissan', 'Hyundai', 'Kia', 'Mercedes-Benz', 'BMW', 'Ford', 'Volkswagen', 'Mitsubishi', 'Mazda'
];

export const PAYMENT_METHODS = [
  'Cash', 'Mobile Money', 'Card', 'Bank Transfer', 'USDT'
];

export const INVENTORY_CATEGORIES = [
  'Filters', 'Oils', 'Brake Parts', 'Suspension', 'Electrical', 'Tyres', 'Engine Parts', 'Body Parts'
];

export const MOCK_USERS = [
  { id: '1', name: 'Admin User', email: 'admin@biskaken.com', role: UserRole.ADMIN },
  { id: '2', name: 'Kofi Mensah', email: 'kofi@biskaken.com', role: UserRole.SUB_ADMIN },
  { id: '3', name: 'Kwame Tech', email: 'kwame@biskaken.com', role: UserRole.STAFF },
];
