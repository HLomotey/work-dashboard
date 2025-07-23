/**
 * User-related type definitions
 * Contains all interfaces and types related to user management
 * Matches frontend component expectations
 */

import { z } from 'zod';
import { BaseEntity } from './base';

// Re-export enums from employee types for consistency
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff',
  HR = 'hr',
  FINANCE = 'finance',
  GUEST = 'guest'
}

export enum EmploymentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TERMINATED = 'terminated',
  ON_LEAVE = 'on_leave',
  PROBATION = 'probation',
  SUSPENDED = 'suspended'
}

// User preferences schema
export const UserPreferencesSchema = z.object({
  language: z.string().default('en'),
  timezone: z.string().default('UTC'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
  }).default({}),
  dateFormat: z.string().default('MM/dd/yyyy'),
  timeFormat: z.enum(['12h', '24h']).default('12h'),
});

// User profile schema
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  staffId: z.string().uuid().optional(),
  role: z.nativeEnum(UserRole),
  permissions: z.array(z.string()).default([]),
  avatarUrl: z.string().url().optional(),
  preferences: UserPreferencesSchema.default({}),
  lastLoginAt: z.date().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// User schemas
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email('Invalid email address'),
  role: z.nativeEnum(UserRole),
  isActive: z.boolean().default(true),
  lastLogin: z.date().optional(),
  emailVerified: z.boolean().default(false),
  passwordChangedAt: z.date().optional(),
  twoFactorEnabled: z.boolean().default(false),
  loginAttempts: z.number().int().min(0).default(0),
  lockedUntil: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
  loginAttempts: true,
  lockedUntil: true,
});

export const UpdateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  email: true, // Email changes require special handling
}).partial();

// TypeScript interfaces (inferred from Zod schemas)
export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

// Extended interfaces with relations
export interface UserWithProfile extends User {
  profile?: UserProfile;
  employee?: {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    position: string;
    departmentId: string;
    employmentStatus: EmploymentStatus;
  };
}

export interface StaffWithProfile extends UserWithProfile {
  department?: {
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
  housingAssignments?: any[]; // Will be HousingAssignment[] when housing types are imported
  currentCharges?: any[]; // Will be Charge[] when billing types are imported
}

// Utility types for user operations
export type UserFilters = {
  role?: UserRole;
  isActive?: boolean;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  departmentId?: string;
  employmentStatus?: EmploymentStatus;
  search?: string;
  lastLoginRange?: {
    start: Date;
    end: Date;
  };
  createdRange?: {
    start: Date;
    end: Date;
  };
};

export type UserMetrics = {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  twoFactorEnabledUsers: number;
  usersByRole: Record<UserRole, number>;
  recentLogins: number;
  lockedAccounts: number;
};

export type UserActivity = {
  userId: string;
  user: User;
  lastLoginAt: Date;
  loginCount: number;
  averageSessionDuration: number;
  mostActiveHours: number[];
  deviceTypes: string[];
  ipAddresses: string[];
};

// Security and authentication types
export type LoginAttempt = {
  id: string;
  userId: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
  timestamp: Date;
};

export type PasswordReset = {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
};

export type TwoFactorAuth = {
  id: string;
  userId: string;
  secret: string;
  backupCodes: string[];
  isEnabled: boolean;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

// Database table type definitions for Supabase
export interface UserRow extends BaseEntity {
  email: string;
  role: 'admin' | 'manager' | 'staff' | 'hr' | 'finance' | 'guest';
  is_active: boolean;
  last_login?: string;
  email_verified: boolean;
  password_changed_at?: string;
  two_factor_enabled: boolean;
  login_attempts: number;
  locked_until?: string;
}

export interface UserProfileRow extends BaseEntity {
  user_id: string;
  staff_id?: string;
  role: 'admin' | 'manager' | 'staff' | 'hr' | 'finance' | 'guest';
  permissions: string[];
  avatar_url?: string;
  preferences: {
    language: string;
    timezone: string;
    theme: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    dateFormat: string;
    timeFormat: string;
  };
  last_login_at?: string;
  is_active: boolean;
}

export interface UserInsert extends Omit<UserRow, 'id' | 'created_at' | 'updated_at'> {}
export interface UserUpdate extends Partial<UserInsert> {}

export interface UserProfileInsert extends Omit<UserProfileRow, 'id' | 'created_at' | 'updated_at'> {}
export interface UserProfileUpdate extends Partial<UserProfileInsert> {}

// Form validation helpers
export const validateUser = (data: unknown) => UserSchema.safeParse(data);
export const validateCreateUser = (data: unknown) => CreateUserSchema.safeParse(data);
export const validateUpdateUser = (data: unknown) => UpdateUserSchema.safeParse(data);
export const validateUserProfile = (data: unknown) => UserProfileSchema.safeParse(data);
export const validateUserPreferences = (data: unknown) => UserPreferencesSchema.safeParse(data);
