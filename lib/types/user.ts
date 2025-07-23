import { z } from 'zod'

// User management enums
export enum UserRole {
  ADMIN = 'admin',
  HR_MANAGER = 'hr_manager',
  PROPERTY_MANAGER = 'property_manager',
  TRANSPORT_MANAGER = 'transport_manager',
  FINANCE_MANAGER = 'finance_manager',
  STAFF = 'staff'
}

export enum EmploymentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TERMINATED = 'terminated',
  ON_LEAVE = 'on_leave'
}

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
  IMPORT = 'import'
}

// Zod schemas for validation
export const UserRoleSchema = z.nativeEnum(UserRole)
export const EmploymentStatusSchema = z.nativeEnum(EmploymentStatus)
export const AuditActionSchema = z.nativeEnum(AuditAction)

// Staff schemas
export const StaffSchema = z.object({
  id: z.string().uuid(),
  employeeId: z.string().min(1, 'Employee ID is required').max(100),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email format').max(255),
  phone: z.string().max(50).optional(),
  employmentStatus: EmploymentStatusSchema,
  housingEligible: z.boolean().default(false),
  role: UserRoleSchema,
  departmentId: z.string().uuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const CreateStaffSchema = StaffSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const UpdateStaffSchema = CreateStaffSchema.partial().omit({ employeeId: true })

// User Profile schemas
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(), // Supabase auth user ID
  staffId: z.string().uuid().optional(),
  role: UserRoleSchema,
  permissions: z.array(z.string()).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const CreateUserProfileSchema = UserProfileSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const UpdateUserProfileSchema = CreateUserProfileSchema.partial().omit({ userId: true })

// Audit Log schemas
export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  action: AuditActionSchema,
  tableName: z.string().min(1, 'Table name is required').max(100),
  recordId: z.string().uuid(),
  oldValues: z.record(z.any()).optional(),
  newValues: z.record(z.any()).optional(),
  timestamp: z.date(),
})

export const CreateAuditLogSchema = AuditLogSchema.omit({
  id: true,
  timestamp: true,
})

// TypeScript interfaces (inferred from Zod schemas)
export type Staff = z.infer<typeof StaffSchema>
export type CreateStaff = z.infer<typeof CreateStaffSchema>
export type UpdateStaff = z.infer<typeof UpdateStaffSchema>

export type UserProfile = z.infer<typeof UserProfileSchema>
export type CreateUserProfile = z.infer<typeof CreateUserProfileSchema>
export type UpdateUserProfile = z.infer<typeof UpdateUserProfileSchema>

export type AuditLog = z.infer<typeof AuditLogSchema>
export type CreateAuditLog = z.infer<typeof CreateAuditLogSchema>

// Extended interfaces with relations
export interface StaffWithProfile extends Staff {
  userProfile?: UserProfile
  department?: {
    id: string
    name: string
  }
  housingAssignments?: {
    id: string
    roomId: string
    startDate: Date
    endDate?: Date
    status: string
  }[]
  totalCharges?: number
  lastLoginDate?: Date
}

export interface UserProfileWithStaff extends UserProfile {
  staff?: Staff
  lastLoginDate?: Date
  loginCount?: number
}

export interface AuditLogWithDetails extends AuditLog {
  user?: {
    id: string
    email: string
    staff?: {
      firstName: string
      lastName: string
      employeeId: string
    }
  }
  changes?: {
    field: string
    oldValue: any
    newValue: any
  }[]
}

// Permission definitions
export const PERMISSIONS = {
  // Housing permissions
  HOUSING_VIEW: 'housing:view',
  HOUSING_CREATE: 'housing:create',
  HOUSING_UPDATE: 'housing:update',
  HOUSING_DELETE: 'housing:delete',
  
  // Transport permissions
  TRANSPORT_VIEW: 'transport:view',
  TRANSPORT_CREATE: 'transport:create',
  TRANSPORT_UPDATE: 'transport:update',
  TRANSPORT_DELETE: 'transport:delete',
  
  // Billing permissions
  BILLING_VIEW: 'billing:view',
  BILLING_CREATE: 'billing:create',
  BILLING_UPDATE: 'billing:update',
  BILLING_DELETE: 'billing:delete',
  BILLING_EXPORT: 'billing:export',
  
  // User management permissions
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  
  // Admin permissions
  ADMIN_ALL: 'admin:all',
  AUDIT_VIEW: 'audit:view',
} as const

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: [PERMISSIONS.ADMIN_ALL],
  [UserRole.HR_MANAGER]: [
    PERMISSIONS.HOUSING_VIEW,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.BILLING_VIEW,
  ],
  [UserRole.PROPERTY_MANAGER]: [
    PERMISSIONS.HOUSING_VIEW,
    PERMISSIONS.HOUSING_CREATE,
    PERMISSIONS.HOUSING_UPDATE,
    PERMISSIONS.HOUSING_DELETE,
    PERMISSIONS.BILLING_VIEW,
  ],
  [UserRole.TRANSPORT_MANAGER]: [
    PERMISSIONS.TRANSPORT_VIEW,
    PERMISSIONS.TRANSPORT_CREATE,
    PERMISSIONS.TRANSPORT_UPDATE,
    PERMISSIONS.TRANSPORT_DELETE,
    PERMISSIONS.BILLING_VIEW,
  ],
  [UserRole.FINANCE_MANAGER]: [
    PERMISSIONS.BILLING_VIEW,
    PERMISSIONS.BILLING_CREATE,
    PERMISSIONS.BILLING_UPDATE,
    PERMISSIONS.BILLING_DELETE,
    PERMISSIONS.BILLING_EXPORT,
    PERMISSIONS.HOUSING_VIEW,
    PERMISSIONS.TRANSPORT_VIEW,
  ],
  [UserRole.STAFF]: [],
}

// Utility types for user operations
export type UserFilters = {
  role?: UserRole
  employmentStatus?: EmploymentStatus
  departmentId?: string
  housingEligible?: boolean
  search?: string
  dateRange?: {
    start: Date
    end: Date
  }
}

export type UserMetrics = {
  totalStaff: number
  activeStaff: number
  housingEligibleStaff: number
  staffByRole: Record<UserRole, number>
  staffByDepartment: Record<string, number>
  recentLogins: number
  newStaffThisMonth: number
}

export type PermissionCheck = {
  userId: string
  permission: string
  granted: boolean
  reason?: string
}

// Form validation helpers
export const validateStaff = (data: unknown) => StaffSchema.safeParse(data)
export const validateCreateStaff = (data: unknown) => CreateStaffSchema.safeParse(data)
export const validateUpdateStaff = (data: unknown) => UpdateStaffSchema.safeParse(data)

export const validateUserProfile = (data: unknown) => UserProfileSchema.safeParse(data)
export const validateCreateUserProfile = (data: unknown) => CreateUserProfileSchema.safeParse(data)
export const validateUpdateUserProfile = (data: unknown) => UpdateUserProfileSchema.safeParse(data)

export const validateAuditLog = (data: unknown) => AuditLogSchema.safeParse(data)
export const validateCreateAuditLog = (data: unknown) => CreateAuditLogSchema.safeParse(data)

// Utility functions
export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  if (userRole === UserRole.ADMIN) return true
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false
}

export const getUserPermissions = (userRole: UserRole): string[] => {
  if (userRole === UserRole.ADMIN) return Object.values(PERMISSIONS)
  return ROLE_PERMISSIONS[userRole] || []
}

export const getFullName = (staff: Pick<Staff, 'firstName' | 'lastName'>): string => {
  return `${staff.firstName} ${staff.lastName}`.trim()
}