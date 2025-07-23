/**
 * Employee-related type definitions
 * Contains all interfaces and types related to employee management
 * Matches frontend component expectations
 */

import { z } from 'zod';
import { BaseEntity } from './base';

// Employee domain enums
export enum EmploymentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TERMINATED = 'terminated',
  ON_LEAVE = 'on_leave',
  PROBATION = 'probation',
  SUSPENDED = 'suspended'
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff',
  HR = 'hr',
  FINANCE = 'finance'
}

// Zod schemas for validation
export const EmploymentStatusSchema = z.nativeEnum(EmploymentStatus);
export const UserRoleSchema = z.nativeEnum(UserRole);

// Emergency contact schema
export const EmergencyContactSchema = z.object({
  name: z.string().min(1, 'Emergency contact name is required').max(100),
  phone: z.string().min(1, 'Emergency contact phone is required').max(20),
  relationship: z.string().min(1, 'Relationship is required').max(50),
  email: z.string().email().optional(),
  address: z.string().max(255).optional(),
});

// Employee schemas
export const EmployeeSchema = z.object({
  id: z.string().uuid(),
  employeeId: z.string().min(1, 'Employee ID is required').max(20),
  userId: z.string().uuid().optional(),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20).optional(),
  dateOfBirth: z.date().optional(),
  address: z.string().max(500).optional(),
  departmentId: z.string().uuid(),
  position: z.string().min(1, 'Position is required').max(100),
  startDate: z.date(),
  endDate: z.date().optional(),
  employmentStatus: EmploymentStatusSchema,
  role: UserRoleSchema,
  salary: z.number().positive().optional(),
  housingEligible: z.boolean().default(false),
  transportEligible: z.boolean().default(false),
  supervisorId: z.string().uuid().optional(),
  emergencyContact: EmergencyContactSchema.optional(),
  skills: z.array(z.string()).optional(),
  bio: z.string().max(1000).optional(),
  notes: z.string().max(1000).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateEmployeeSchema = EmployeeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).refine(
  (data) => data.startDate <= new Date(),
  {
    message: 'Start date cannot be in the future',
    path: ['startDate'],
  }
);

export const UpdateEmployeeSchema = EmployeeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  employeeId: true,
}).partial();

// TypeScript interfaces (inferred from Zod schemas)
export type Employee = z.infer<typeof EmployeeSchema>;
export type CreateEmployee = z.infer<typeof CreateEmployeeSchema>;
export type UpdateEmployee = z.infer<typeof UpdateEmployeeSchema>;
export type EmergencyContact = z.infer<typeof EmergencyContactSchema>;

// Extended interfaces with relations
export interface EmployeeWithDetails extends Employee {
  department: {
    id: string;
    name: string;
    code: string;
  };
  supervisor?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  subordinates: Employee[];
  housingAssignments: any[]; // Will be HousingAssignment[] when housing types are imported
  tripHistory: any[]; // Will be Trip[] when trip types are imported
  billingCharges: any[]; // Will be Charge[] when billing types are imported
}

export interface StaffWithProfile extends Employee {
  userProfile?: {
    id: string;
    userId: string;
    staffId: string;
    role: UserRole;
    permissions: string[];
    createdAt: Date;
    updatedAt: Date;
  };
  profile?: {
    avatarUrl?: string;
    preferences: {
      language: string;
      timezone: string;
      theme: string;
    };
    createdAt: Date;
    updatedAt: Date;
  };
}

// Utility types for employee operations
export type EmployeeFilters = {
  departmentId?: string;
  employmentStatus?: EmploymentStatus;
  role?: UserRole;
  position?: string;
  supervisorId?: string;
  housingEligible?: boolean;
  transportEligible?: boolean;
  search?: string;
  startDateRange?: {
    start: Date;
    end: Date;
  };
  salaryRange?: {
    min: number;
    max: number;
  };
};

export type EmployeeMetrics = {
  totalEmployees: number;
  activeEmployees: number;
  newHires: number;
  terminations: number;
  retentionRate: number;
  averageTenure: number;
  employeesByDepartment: Record<string, number>;
  employeesByRole: Record<UserRole, number>;
  housingEligibleCount: number;
  transportEligibleCount: number;
};

export type EmployeePerformance = {
  employeeId: string;
  employee: Employee;
  performanceScore: number;
  goals: {
    completed: number;
    total: number;
  };
  lastReviewDate: Date;
  nextReviewDate: Date;
  strengths: string[];
  improvementAreas: string[];
};

// Database table type definitions for Supabase
export interface EmployeeRow extends BaseEntity {
  employee_id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  department_id: string;
  position: string;
  start_date: string;
  end_date?: string;
  employment_status: 'active' | 'inactive' | 'terminated' | 'on_leave' | 'probation' | 'suspended';
  role: 'admin' | 'manager' | 'staff' | 'hr' | 'finance';
  salary?: number;
  housing_eligible: boolean;
  transport_eligible: boolean;
  supervisor_id?: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
    email?: string;
    address?: string;
  };
  skills?: string[];
  bio?: string;
  notes?: string;
}

export interface EmployeeInsert extends Omit<EmployeeRow, 'id' | 'created_at' | 'updated_at'> {}
export interface EmployeeUpdate extends Partial<EmployeeInsert> {}

// Form validation helpers
export const validateEmployee = (data: unknown) => EmployeeSchema.safeParse(data);
export const validateCreateEmployee = (data: unknown) => CreateEmployeeSchema.safeParse(data);
export const validateUpdateEmployee = (data: unknown) => UpdateEmployeeSchema.safeParse(data);
export const validateEmergencyContact = (data: unknown) => EmergencyContactSchema.safeParse(data);
