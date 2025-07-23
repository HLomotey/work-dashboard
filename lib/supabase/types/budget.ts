/**
 * Budget-related type definitions
 * Contains all interfaces and types related to budget management
 * Matches frontend component expectations
 */

import { z } from 'zod';
import { BaseEntity } from './base';

// Budget domain enums
export enum BudgetStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended'
}

export enum BudgetCategory {
  OPERATIONAL = 'operational',
  CAPITAL = 'capital',
  PERSONNEL = 'personnel',
  MARKETING = 'marketing',
  TECHNOLOGY = 'technology',
  FACILITIES = 'facilities',
  TRAVEL = 'travel',
  TRAINING = 'training',
  MISCELLANEOUS = 'miscellaneous'
}

export enum BudgetPeriod {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUAL = 'semi_annual',
  ANNUAL = 'annual',
  CUSTOM = 'custom'
}

// Zod schemas for validation
export const BudgetStatusSchema = z.nativeEnum(BudgetStatus);
export const BudgetCategorySchema = z.nativeEnum(BudgetCategory);
export const BudgetPeriodSchema = z.nativeEnum(BudgetPeriod);

// Budget line item schema
export const BudgetLineItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Line item name is required').max(255),
  description: z.string().max(500).optional(),
  category: BudgetCategorySchema,
  allocatedAmount: z.number().positive('Allocated amount must be positive'),
  spentAmount: z.number().min(0).default(0),
  remainingAmount: z.number(),
  notes: z.string().max(500).optional(),
});

// Budget approval schema
export const BudgetApprovalSchema = z.object({
  approverId: z.string().uuid(),
  approverName: z.string(),
  approvedAt: z.date(),
  comments: z.string().max(1000).optional(),
  level: z.number().int().positive(),
});

// Base budget schema without refinements
const BaseBudgetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Budget name is required').max(255),
  description: z.string().max(1000).optional(),
  category: BudgetCategorySchema,
  departmentId: z.string().uuid().optional(),
  ownerId: z.string().uuid(),
  allocatedAmount: z.number().positive('Allocated amount must be positive'),
  spentAmount: z.number().min(0).default(0),
  remainingAmount: z.number(),
  utilizationRate: z.number().min(0).max(100).default(0),
  periodType: BudgetPeriodSchema,
  periodStart: z.date(),
  periodEnd: z.date(),
  status: BudgetStatusSchema,
  approvals: z.array(BudgetApprovalSchema).default([]),
  lineItems: z.array(BudgetLineItemSchema).default([]),
  tags: z.array(z.string()).default([]),
  notes: z.string().max(1000).optional(),
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Budget schema with refinements
export const BudgetSchema = BaseBudgetSchema.refine(
  (data) => data.periodEnd > data.periodStart,
  {
    message: 'Period end date must be after start date',
    path: ['periodEnd'],
  }
).refine(
  (data) => data.remainingAmount === data.allocatedAmount - data.spentAmount,
  {
    message: 'Remaining amount must equal allocated minus spent',
    path: ['remainingAmount'],
  }
);

// Create schema (omit from base, then add refinements)
export const CreateBudgetSchema = BaseBudgetSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  spentAmount: true,
  remainingAmount: true,
  utilizationRate: true,
  approvals: true,
}).refine(
  (data) => data.periodStart >= new Date(new Date().setHours(0, 0, 0, 0)),
  {
    message: 'Budget period cannot start in the past',
    path: ['periodStart'],
  }
);

// Update schema (omit from base, make partial)
export const UpdateBudgetSchema = BaseBudgetSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
}).partial();

// TypeScript interfaces (inferred from Zod schemas)
export type Budget = z.infer<typeof BudgetSchema>;
export type CreateBudget = z.infer<typeof CreateBudgetSchema>;
export type UpdateBudget = z.infer<typeof UpdateBudgetSchema>;
export type BudgetLineItem = z.infer<typeof BudgetLineItemSchema>;
export type BudgetApproval = z.infer<typeof BudgetApprovalSchema>;

// Extended interfaces with relations
export interface BudgetWithDetails extends Budget {
  department?: {
    id: string;
    name: string;
    code: string;
  };
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  transactions: any[]; // Will be Transaction[] when transaction types are created
  variance: {
    amount: number;
    percentage: number;
    trend: 'over' | 'under' | 'on_track';
  };
  forecast: {
    projectedSpend: number;
    projectedRemaining: number;
    completionDate: Date;
  };
}

export interface BudgetSummary {
  budgetId: string;
  name: string;
  category: BudgetCategory;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  utilizationRate: number;
  status: BudgetStatus;
  daysRemaining: number;
  burnRate: number;
}

// Utility types for budget operations
export type BudgetFilters = {
  status?: BudgetStatus;
  category?: BudgetCategory;
  departmentId?: string;
  ownerId?: string;
  periodType?: BudgetPeriod;
  search?: string;
  allocatedAmountRange?: {
    min: number;
    max: number;
  };
  utilizationRange?: {
    min: number;
    max: number;
  };
  periodRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
};

export type BudgetMetrics = {
  totalBudgets: number;
  activeBudgets: number;
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  averageUtilization: number;
  budgetsByCategory: Record<BudgetCategory, number>;
  budgetsByStatus: Record<BudgetStatus, number>;
  topSpendingCategories: {
    category: BudgetCategory;
    amount: number;
    percentage: number;
  }[];
  budgetsOverBudget: number;
  budgetsUnderBudget: number;
};

export type BudgetAnalytics = {
  budgetId: string;
  budget: Budget;
  spendingTrend: {
    period: string;
    amount: number;
    cumulative: number;
  }[];
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  variance: {
    planned: number;
    actual: number;
    difference: number;
    percentage: number;
  };
  forecast: {
    projectedTotal: number;
    estimatedCompletion: Date;
    riskLevel: 'low' | 'medium' | 'high';
  };
};

// Database table type definitions for Supabase
export interface BudgetRow extends BaseEntity {
  name: string;
  description?: string;
  category: 'operational' | 'capital' | 'personnel' | 'marketing' | 'technology' | 'facilities' | 'travel' | 'training' | 'miscellaneous';
  department_id?: string;
  owner_id: string;
  allocated_amount: number;
  spent_amount: number;
  remaining_amount: number;
  utilization_rate: number;
  period_type: 'monthly' | 'quarterly' | 'semi_annual' | 'annual' | 'custom';
  period_start: string;
  period_end: string;
  status: 'draft' | 'active' | 'inactive' | 'approved' | 'rejected' | 'expired' | 'suspended';
  approvals: {
    approverId: string;
    approverName: string;
    approvedAt: string;
    comments?: string;
    level: number;
  }[];
  line_items: {
    id: string;
    name: string;
    description?: string;
    category: string;
    allocatedAmount: number;
    spentAmount: number;
    remainingAmount: number;
    notes?: string;
  }[];
  tags: string[];
  notes?: string;
  created_by: string;
}

export interface BudgetInsert extends Omit<BudgetRow, 'id' | 'created_at' | 'updated_at'> {}
export interface BudgetUpdate extends Partial<BudgetInsert> {}

// Form validation helpers
export const validateBudget = (data: unknown) => BudgetSchema.safeParse(data);
export const validateCreateBudget = (data: unknown) => CreateBudgetSchema.safeParse(data);
export const validateUpdateBudget = (data: unknown) => UpdateBudgetSchema.safeParse(data);
export const validateBudgetLineItem = (data: unknown) => BudgetLineItemSchema.safeParse(data);
export const validateBudgetApproval = (data: unknown) => BudgetApprovalSchema.safeParse(data);
