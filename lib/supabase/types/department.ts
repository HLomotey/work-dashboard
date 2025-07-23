/**
 * Department-related type definitions
 * Contains all interfaces and types related to department management
 * Matches frontend component expectations
 */

import { z } from 'zod';
import { BaseEntity } from './base';

// Department domain enums
export enum DepartmentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  RESTRUCTURING = 'restructuring',
  DISSOLVED = 'dissolved'
}

export enum DepartmentType {
  OPERATIONAL = 'operational',
  SUPPORT = 'support',
  MANAGEMENT = 'management',
  TECHNICAL = 'technical'
}

// Zod schemas for validation
export const DepartmentStatusSchema = z.nativeEnum(DepartmentStatus);
export const DepartmentTypeSchema = z.nativeEnum(DepartmentType);

// Department budget schema
export const DepartmentBudgetSchema = z.object({
  annual: z.number().positive(),
  allocated: z.number().min(0),
  spent: z.number().min(0),
  remaining: z.number(),
});

// Department schemas
export const DepartmentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Department name is required').max(100),
  code: z.string().min(2, 'Department code must be at least 2 characters').max(10).toUpperCase(),
  description: z.string().max(500).optional(),
  type: DepartmentTypeSchema,
  status: DepartmentStatusSchema,
  managerId: z.string().uuid().optional(),
  parentDepartmentId: z.string().uuid().optional(),
  location: z.string().max(255).optional(),
  budget: DepartmentBudgetSchema.optional(),
  headcount: z.number().int().min(0).default(0),
  maxHeadcount: z.number().int().positive().optional(),
  costCenter: z.string().max(20).optional(),
  establishedDate: z.date().optional(),
  notes: z.string().max(1000).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateDepartmentSchema = DepartmentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  headcount: true, // Calculated from employee count
}).refine(
  (data) => {
    if (data.maxHeadcount && data.maxHeadcount < 1) {
      return false;
    }
    return true;
  },
  {
    message: 'Maximum headcount must be at least 1',
    path: ['maxHeadcount'],
  }
);

export const UpdateDepartmentSchema = DepartmentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  code: true, // Department code should not be changed after creation
}).partial();

// TypeScript interfaces (inferred from Zod schemas)
export type Department = z.infer<typeof DepartmentSchema>;
export type CreateDepartment = z.infer<typeof CreateDepartmentSchema>;
export type UpdateDepartment = z.infer<typeof UpdateDepartmentSchema>;
export type DepartmentBudget = z.infer<typeof DepartmentBudgetSchema>;

// Extended interfaces with relations
export interface DepartmentWithDetails extends Department {
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
    email: string;
  };
  parentDepartment?: {
    id: string;
    name: string;
    code: string;
  };
  subDepartments: Department[];
  employees: {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    position: string;
    employmentStatus: string;
  }[];
  activeEmployeeCount: number;
  totalEmployeeCount: number;
}

export interface DepartmentHierarchy extends Department {
  level: number;
  path: string[];
  children: DepartmentHierarchy[];
  employeeCount: number;
  totalBudget: number;
}

// Utility types for department operations
export type DepartmentFilters = {
  status?: DepartmentStatus;
  type?: DepartmentType;
  managerId?: string;
  parentDepartmentId?: string;
  location?: string;
  search?: string;
  budgetRange?: {
    min: number;
    max: number;
  };
  headcountRange?: {
    min: number;
    max: number;
  };
  establishedDateRange?: {
    start: Date;
    end: Date;
  };
};

export type DepartmentMetrics = {
  totalDepartments: number;
  activeDepartments: number;
  inactiveDepartments: number;
  totalEmployees: number;
  averageHeadcount: number;
  departmentsByType: Record<DepartmentType, number>;
  totalBudget: number;
  budgetUtilization: number;
  largestDepartment: {
    name: string;
    headcount: number;
  };
  smallestDepartment: {
    name: string;
    headcount: number;
  };
};

export type DepartmentPerformance = {
  departmentId: string;
  department: Department;
  budgetUtilization: number;
  headcountUtilization: number;
  productivityScore: number;
  employeeSatisfaction: number;
  turnoverRate: number;
  avgTenure: number;
  costPerEmployee: number;
  revenueContribution: number;
};

export type DepartmentReorganization = {
  id: string;
  name: string;
  description: string;
  effectiveDate: Date;
  changes: {
    departmentId: string;
    changeType: 'create' | 'update' | 'merge' | 'split' | 'dissolve';
    oldStructure?: any;
    newStructure: any;
  }[];
  approvedBy: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
};

// Database table type definitions for Supabase
export interface DepartmentRow extends BaseEntity {
  name: string;
  code: string;
  description?: string;
  type: 'operational' | 'support' | 'management' | 'technical';
  status: 'active' | 'inactive' | 'restructuring' | 'dissolved';
  manager_id?: string;
  parent_department_id?: string;
  location?: string;
  budget?: {
    annual: number;
    allocated: number;
    spent: number;
    remaining: number;
  };
  headcount: number;
  max_headcount?: number;
  cost_center?: string;
  established_date?: string;
  notes?: string;
}

export interface DepartmentInsert extends Omit<DepartmentRow, 'id' | 'created_at' | 'updated_at'> {}
export interface DepartmentUpdate extends Partial<DepartmentInsert> {}

// Form validation helpers
export const validateDepartment = (data: unknown) => DepartmentSchema.safeParse(data);
export const validateCreateDepartment = (data: unknown) => CreateDepartmentSchema.safeParse(data);
export const validateUpdateDepartment = (data: unknown) => UpdateDepartmentSchema.safeParse(data);
export const validateDepartmentBudget = (data: unknown) => DepartmentBudgetSchema.safeParse(data);
