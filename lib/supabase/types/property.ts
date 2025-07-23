/**
 * Property-related type definitions
 * Contains all interfaces and types related to property management
 * Matches frontend component expectations
 */

import { z } from 'zod';
import { BaseEntity } from './base';

// Property domain enums
export enum PropertyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance'
}

export enum PropertyType {
  APARTMENT = 'apartment',
  DORMITORY = 'dormitory',
  GUESTHOUSE = 'guesthouse',
  VILLA = 'villa'
}

// Zod schemas for validation
export const PropertyStatusSchema = z.nativeEnum(PropertyStatus);
export const PropertyTypeSchema = z.nativeEnum(PropertyType);

// Property schemas
export const PropertySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Property name is required').max(255),
  address: z.string().min(1, 'Address is required'),
  type: PropertyTypeSchema,
  description: z.string().optional(),
  photos: z.array(z.string()).default([]),
  totalCapacity: z.number().int().positive('Total capacity must be positive'),
  occupiedRooms: z.number().int().min(0).default(0),
  status: PropertyStatusSchema,
  contactInfo: z.object({
    phone: z.string().optional(),
    email: z.string().email().optional(),
    manager: z.string().optional(),
  }).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreatePropertySchema = PropertySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdatePropertySchema = CreatePropertySchema.partial();

// TypeScript interfaces (inferred from Zod schemas)
export type Property = z.infer<typeof PropertySchema>;
export type CreateProperty = z.infer<typeof CreatePropertySchema>;
export type UpdateProperty = z.infer<typeof UpdatePropertySchema>;

// Extended interfaces with relations
export interface PropertyWithRooms extends Property {
  rooms: any[]; // Will be Room[] when room types are updated
  occupancyRate: number;
  availableCapacity: number;
}

// Utility types for property operations
export type PropertyFilters = {
  status?: PropertyStatus;
  type?: PropertyType;
  search?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
};

export type PropertyMetrics = {
  totalProperties: number;
  activeProperties: number;
  totalCapacity: number;
  occupancyRate: number;
  propertiesByType: Record<PropertyType, number>;
};

// Database table type definitions for Supabase
export interface PropertyRow extends BaseEntity {
  name: string;
  address: string;
  type: 'apartment' | 'dormitory' | 'guesthouse' | 'villa';
  total_capacity: number;
  occupied_rooms: number;
  status: 'active' | 'inactive' | 'maintenance';
  description?: string;
  photos?: string[];
  contact_info?: {
    phone?: string;
    email?: string;
    manager?: string;
  };
}

export interface PropertyInsert extends Omit<PropertyRow, 'id' | 'created_at' | 'updated_at'> {}
export interface PropertyUpdate extends Partial<PropertyInsert> {}

// Form validation helpers
export const validateProperty = (data: unknown) => PropertySchema.safeParse(data);
export const validateCreateProperty = (data: unknown) => CreatePropertySchema.safeParse(data);
export const validateUpdateProperty = (data: unknown) => UpdatePropertySchema.safeParse(data);
