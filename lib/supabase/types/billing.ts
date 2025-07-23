/**
 * Billing-related type definitions
 * Contains all interfaces and types related to billing management
 * Matches frontend component expectations
 */

import { z } from "zod";
import { BaseEntity } from './base';

// Billing domain enums
export enum BillingStatus {
  DRAFT = "draft",
  PROCESSING = "processing",
  COMPLETED = "completed",
  EXPORTED = "exported",
  CANCELLED = "cancelled",
}

export enum ChargeType {
  RENT = "rent",
  UTILITIES = "utilities",
  TRANSPORT = "transport",
  OTHER = "other",
}

export enum PayrollExportStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

// Zod schemas for validation
export const BillingStatusSchema = z.nativeEnum(BillingStatus);
export const ChargeTypeSchema = z.nativeEnum(ChargeType);
export const PayrollExportStatusSchema = z.nativeEnum(PayrollExportStatus);

// Billing Period schemas
export const BillingPeriodSchema = z
  .object({
    id: z.string().uuid(),
    startDate: z.date(),
    endDate: z.date(),
    status: BillingStatusSchema,
    payrollExportDate: z.date().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .refine((data) => data.startDate < data.endDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  })
  .refine(
    (data) => !data.payrollExportDate || data.payrollExportDate >= data.endDate,
    {
      message: "Payroll export date cannot be before billing period end date",
      path: ["payrollExportDate"],
    }
  );

export const CreateBillingPeriodSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  status: BillingStatusSchema.default(BillingStatus.DRAFT),
  payrollExportDate: z.date().optional(),
});

export const UpdateBillingPeriodSchema = CreateBillingPeriodSchema.partial();

// Charge schemas
export const ChargeSchema = z.object({
  id: z.string().uuid(),
  staffId: z.string().uuid(),
  billingPeriodId: z.string().uuid(),
  type: ChargeTypeSchema,
  amount: z.number().positive("Charge amount must be positive"),
  description: z.string().min(1, "Description is required").max(500),
  prorationFactor: z.number().min(0).max(1).default(1),
  sourceId: z.string().uuid().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateChargeSchema = ChargeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateChargeSchema = CreateChargeSchema.partial().omit({
  billingPeriodId: true,
});

// Payroll Export schemas
export const PayrollExportSchema = z.object({
  id: z.string().uuid(),
  billingPeriodId: z.string().uuid(),
  exportDate: z.date(),
  fileName: z.string().min(1, "File name is required").max(255),
  recordCount: z.number().int().min(0),
  totalAmount: z.number().min(0),
  status: PayrollExportStatusSchema,
  format: z.enum(['csv', 'excel', 'json']),
  fileSize: z.number().int().min(0).optional(),
  errorMessage: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
});

export const CreatePayrollExportSchema = PayrollExportSchema.omit({
  id: true,
  createdAt: true,
});

export const UpdatePayrollExportSchema =
  CreatePayrollExportSchema.partial().omit({
    billingPeriodId: true,
  });

// TypeScript interfaces (inferred from Zod schemas)
export type BillingPeriod = z.infer<typeof BillingPeriodSchema>;
export type CreateBillingPeriod = z.infer<typeof CreateBillingPeriodSchema>;
export type UpdateBillingPeriod = z.infer<typeof UpdateBillingPeriodSchema>;

export type Charge = z.infer<typeof ChargeSchema>;
export type CreateCharge = z.infer<typeof CreateChargeSchema>;
export type UpdateCharge = z.infer<typeof UpdateChargeSchema>;

export type PayrollExport = z.infer<typeof PayrollExportSchema>;
export type CreatePayrollExport = z.infer<typeof CreatePayrollExportSchema>;
export type UpdatePayrollExport = z.infer<typeof UpdatePayrollExportSchema>;

// Extended interfaces with relations
export interface BillingPeriodWithCharges extends BillingPeriod {
  charges: ChargeWithDetails[];
  totalAmount: number;
  totalStaff: number;
  chargesByType: Record<ChargeType, number>;
}

export interface ChargeWithDetails extends Charge {
  staff: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  billingPeriod: BillingPeriod;
  source?: {
    type: "room_assignment" | "trip";
    details: any;
  };
}

export interface PayrollExportWithDetails extends PayrollExport {
  billingPeriod: BillingPeriod;
  charges: Charge[];
}

// Utility types for billing operations
export type BillingFilters = {
  billingPeriodId?: string;
  staffId?: string;
  chargeType?: ChargeType;
  type?: ChargeType;
  status?: BillingStatus;
  dateRange?: {
    start: Date;
    end: Date;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  search?: string;
};

export type BillingMetrics = {
  totalBillingPeriods: number;
  activeBillingPeriods: number;
  totalCharges: number;
  totalAmount: number;
  averageChargeAmount: number;
  chargesByType: Record<
    ChargeType,
    {
      count: number;
      amount: number;
      percentage: number;
    }
  >;
  monthlyTrends: {
    month: string;
    totalAmount: number;
    chargeCount: number;
  }[];
};

export type StaffBillingSummary = {
  staffId: string;
  staff: {
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  totalCharges: number;
  totalAmount: number;
  chargesByType: Record<ChargeType, number>;
  lastBillingDate: Date;
  averageMonthlyAmount: number;
};

export type PayrollExportData = {
  employeeId: string;
  firstName: string;
  lastName: string;
  totalDeductions: number;
  rentCharges: number;
  utilityCharges: number;
  transportCharges: number;
  otherCharges: number;
  billingPeriod: string;
};

// Database table type definitions for Supabase
export interface BillingPeriodRow extends BaseEntity {
  name: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'closed' | 'archived';
  total_charges: number;
  total_deductions: number;
  net_amount: number;
}

export interface ChargeRow extends BaseEntity {
  billing_period_id: string;
  staff_id: string;
  type: 'housing' | 'transport' | 'utilities' | 'other';
  category: string;
  description: string;
  amount: number;
  status: 'pending' | 'approved' | 'disputed' | 'cancelled';
  created_by: string;
}

export interface PayrollExportRow extends BaseEntity {
  billing_period_id: string;
  format: 'csv' | 'excel' | 'json' | 'xml';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_records: number;
  exported_by: string;
}

export interface BillingPeriodInsert extends Omit<BillingPeriodRow, 'id' | 'created_at' | 'updated_at'> {}
export interface BillingPeriodUpdate extends Partial<BillingPeriodInsert> {}

export interface ChargeInsert extends Omit<ChargeRow, 'id' | 'created_at' | 'updated_at'> {}
export interface ChargeUpdate extends Partial<ChargeInsert> {}

export interface PayrollExportInsert extends Omit<PayrollExportRow, 'id' | 'created_at' | 'updated_at'> {}
export interface PayrollExportUpdate extends Partial<PayrollExportInsert> {}

// Form validation helpers
export const validateBillingPeriod = (data: unknown) =>
  BillingPeriodSchema.safeParse(data);
export const validateCreateBillingPeriod = (data: unknown) =>
  CreateBillingPeriodSchema.safeParse(data);
export const validateUpdateBillingPeriod = (data: unknown) =>
  UpdateBillingPeriodSchema.safeParse(data);

export const validateCharge = (data: unknown) => ChargeSchema.safeParse(data);
export const validateCreateCharge = (data: unknown) =>
  CreateChargeSchema.safeParse(data);
export const validateUpdateCharge = (data: unknown) =>
  UpdateChargeSchema.safeParse(data);

export const validatePayrollExport = (data: unknown) =>
  PayrollExportSchema.safeParse(data);
export const validateCreatePayrollExport = (data: unknown) =>
  CreatePayrollExportSchema.safeParse(data);
export const validateUpdatePayrollExport = (data: unknown) =>
  UpdatePayrollExportSchema.safeParse(data);
