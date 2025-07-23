// Base types for the Work Dashboard application

// Common base types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Base entity interface
export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

// Status enums
export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  ARCHIVED = 'archived',
  MAINTENANCE = 'maintenance'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff',
  GUEST = 'guest'
}

// Common filter types
export interface BaseFilters {
  search?: string
  status?: Status
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// API response types
export interface ApiResponse<T> {
  data: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  totalPages: number
}

// Common utility types
export type CreateInput<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>
export type UpdateInput<T> = Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>

// Address type
export interface Address {
  street: string
  city: string
  state: string
  postal_code: string
  country: string
}

// Contact information
export interface ContactInfo {
  email?: string
  phone?: string
  mobile?: string
  emergency_contact?: string
  emergency_phone?: string
}

// File/Document types
export interface FileUpload {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploaded_at: string
  uploaded_by: string
}

// Notification types
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  created_at: string
  user_id: string
}

// Audit log
export interface AuditLog {
  id: string
  table_name: string
  record_id: string
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  old_data?: Json
  new_data?: Json
  user_id: string
  timestamp: string
}