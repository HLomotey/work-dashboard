/**
 * Transaction-related type definitions
 * Contains all interfaces and types related to financial transaction management
 * Matches frontend component expectations
 */

import { z } from 'zod';
import { BaseEntity } from './base';

// Transaction domain enums
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
  REFUND = 'refund',
  ADJUSTMENT = 'adjustment'
}

export enum TransactionStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
  REVERSED = 'reversed'
}

export enum TransactionCategory {
  // Income categories
  REVENUE = 'revenue',
  INVESTMENT = 'investment',
  GRANT = 'grant',
  LOAN = 'loan',
  OTHER_INCOME = 'other_income',
  
  // Expense categories
  PAYROLL = 'payroll',
  UTILITIES = 'utilities',
  RENT = 'rent',
  SUPPLIES = 'supplies',
  EQUIPMENT = 'equipment',
  TRAVEL = 'travel',
  MARKETING = 'marketing',
  PROFESSIONAL_SERVICES = 'professional_services',
  INSURANCE = 'insurance',
  TAXES = 'taxes',
  MAINTENANCE = 'maintenance',
  OTHER_EXPENSE = 'other_expense',
  
  // Transfer categories
  INTERNAL_TRANSFER = 'internal_transfer',
  BANK_TRANSFER = 'bank_transfer',
  PETTY_CASH = 'petty_cash'
}

export enum PaymentMethod {
  CASH = 'cash',
  CHECK = 'check',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  WIRE_TRANSFER = 'wire_transfer',
  PAYPAL = 'paypal',
  CRYPTOCURRENCY = 'cryptocurrency',
  OTHER = 'other'
}

// Zod schemas for validation
export const TransactionTypeSchema = z.nativeEnum(TransactionType);
export const TransactionStatusSchema = z.nativeEnum(TransactionStatus);
export const TransactionCategorySchema = z.nativeEnum(TransactionCategory);
export const PaymentMethodSchema = z.nativeEnum(PaymentMethod);

// Transaction attachment schema
export const TransactionAttachmentSchema = z.object({
  id: z.string().uuid(),
  filename: z.string(),
  url: z.string().url(),
  type: z.string(),
  size: z.number().positive(),
  uploadedAt: z.date(),
});

// Transaction approval schema
export const TransactionApprovalSchema = z.object({
  approverId: z.string().uuid(),
  approverName: z.string(),
  approvedAt: z.date(),
  comments: z.string().max(500).optional(),
  level: z.number().int().positive(),
});

// Base transaction schema
const BaseTransactionSchema = z.object({
  id: z.string().uuid(),
  type: TransactionTypeSchema,
  category: TransactionCategorySchema,
  description: z.string().min(1, 'Description is required').max(500),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  date: z.date(),
  dueDate: z.date().optional(),
  status: TransactionStatusSchema,
  paymentMethod: PaymentMethodSchema.optional(),
  referenceNumber: z.string().max(100).optional(),
  budgetId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  vendorId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  taxAmount: z.number().min(0).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  discountAmount: z.number().min(0).optional(),
  totalAmount: z.number().positive(),
  approvals: z.array(TransactionApprovalSchema).default([]),
  attachments: z.array(TransactionAttachmentSchema).default([]),
  tags: z.array(z.string()).default([]),
  notes: z.string().max(1000).optional(),
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Transaction schema with refinements
export const TransactionSchema = BaseTransactionSchema.refine(
  (data) => {
    const calculatedTotal = data.amount + (data.taxAmount || 0) - (data.discountAmount || 0);
    return Math.abs(data.totalAmount - calculatedTotal) < 0.01; // Allow for rounding differences
  },
  {
    message: 'Total amount must equal amount + tax - discount',
    path: ['totalAmount'],
  }
).refine(
  (data) => !data.dueDate || data.dueDate >= data.date,
  {
    message: 'Due date cannot be before transaction date',
    path: ['dueDate'],
  }
);

// Create schema
export const CreateTransactionSchema = BaseTransactionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvals: true,
  totalAmount: true, // Will be calculated
}).refine(
  (data) => data.date <= new Date(),
  {
    message: 'Transaction date cannot be in the future',
    path: ['date'],
  }
);

// Update schema
export const UpdateTransactionSchema = BaseTransactionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
}).partial();

// TypeScript interfaces (inferred from Zod schemas)
export type Transaction = z.infer<typeof TransactionSchema>;
export type CreateTransaction = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransaction = z.infer<typeof UpdateTransactionSchema>;
export type TransactionAttachment = z.infer<typeof TransactionAttachmentSchema>;
export type TransactionApproval = z.infer<typeof TransactionApprovalSchema>;

// Extended interfaces with relations
export interface TransactionWithDetails extends Transaction {
  budget?: {
    id: string;
    name: string;
    category: string;
  };
  department?: {
    id: string;
    name: string;
    code: string;
  };
  vendor?: {
    id: string;
    name: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
    code: string;
  };
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  relatedTransactions: Transaction[];
}

export interface TransactionSummary {
  transactionId: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  totalAmount: number;
  status: TransactionStatus;
  date: Date;
  paymentMethod?: PaymentMethod;
  vendor?: string;
}

// Utility types for transaction operations
export type TransactionFilters = {
  type?: TransactionType;
  status?: TransactionStatus;
  category?: TransactionCategory;
  paymentMethod?: PaymentMethod;
  budgetId?: string;
  departmentId?: string;
  vendorId?: string;
  projectId?: string;
  createdBy?: string;
  search?: string;
  amountRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
  dueDateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  hasAttachments?: boolean;
  requiresApproval?: boolean;
};

export type TransactionMetrics = {
  totalTransactions: number;
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  pendingTransactions: number;
  completedTransactions: number;
  failedTransactions: number;
  transactionsByType: Record<TransactionType, number>;
  transactionsByStatus: Record<TransactionStatus, number>;
  transactionsByCategory: Record<TransactionCategory, number>;
  averageTransactionAmount: number;
  largestTransaction: number;
  smallestTransaction: number;
};

export type TransactionAnalytics = {
  period: {
    start: Date;
    end: Date;
  };
  cashFlow: {
    date: string;
    income: number;
    expenses: number;
    net: number;
  }[];
  categoryBreakdown: {
    category: TransactionCategory;
    amount: number;
    percentage: number;
    transactionCount: number;
  }[];
  monthlyTrends: {
    month: string;
    income: number;
    expenses: number;
    net: number;
    transactionCount: number;
  }[];
  topVendors: {
    vendorId: string;
    vendorName: string;
    totalAmount: number;
    transactionCount: number;
  }[];
};

export type RecurringTransaction = {
  id: string;
  templateId: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  nextDueDate: Date;
  endDate?: Date;
  isActive: boolean;
  lastProcessed?: Date;
  failureCount: number;
  maxFailures: number;
  createdAt: Date;
  updatedAt: Date;
};

// Database table type definitions for Supabase
export interface TransactionRow extends BaseEntity {
  type: 'income' | 'expense' | 'transfer' | 'refund' | 'adjustment';
  category: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  due_date?: string;
  status: 'draft' | 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed' | 'reversed';
  payment_method?: string;
  reference_number?: string;
  budget_id?: string;
  department_id?: string;
  vendor_id?: string;
  project_id?: string;
  tax_amount?: number;
  tax_rate?: number;
  discount_amount?: number;
  total_amount: number;
  approvals: {
    approverId: string;
    approverName: string;
    approvedAt: string;
    comments?: string;
    level: number;
  }[];
  attachments: {
    id: string;
    filename: string;
    url: string;
    type: string;
    size: number;
    uploadedAt: string;
  }[];
  tags: string[];
  notes?: string;
  created_by: string;
}

export interface TransactionInsert extends Omit<TransactionRow, 'id' | 'created_at' | 'updated_at'> {}
export interface TransactionUpdate extends Partial<TransactionInsert> {}

// Form validation helpers
export const validateTransaction = (data: unknown) => TransactionSchema.safeParse(data);
export const validateCreateTransaction = (data: unknown) => CreateTransactionSchema.safeParse(data);
export const validateUpdateTransaction = (data: unknown) => UpdateTransactionSchema.safeParse(data);
export const validateTransactionAttachment = (data: unknown) => TransactionAttachmentSchema.safeParse(data);
export const validateTransactionApproval = (data: unknown) => TransactionApprovalSchema.safeParse(data);
