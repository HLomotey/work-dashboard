/**
 * Vehicle-related type definitions
 * Contains all interfaces and types related to vehicle management
 * Matches frontend component expectations
 */

import { z } from 'zod';
import { BaseEntity } from './base';

// Vehicle domain enums
export enum VehicleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  OUT_OF_SERVICE = 'out_of_service'
}

export enum VehicleType {
  BUS = 'bus',
  VAN = 'van',
  CAR = 'car',
  TRUCK = 'truck'
}

// Zod schemas for validation
export const VehicleStatusSchema = z.nativeEnum(VehicleStatus);
export const VehicleTypeSchema = z.nativeEnum(VehicleType);

// Vehicle schemas
export const VehicleSchema = z.object({
  id: z.string().uuid(),
  make: z.string().min(1, 'Vehicle make is required').max(100),
  model: z.string().min(1, 'Vehicle model is required').max(100),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  capacity: z.number().int().positive('Vehicle capacity must be positive').max(100),
  registration: z.string().min(1, 'Registration is required').max(50),
  licensePlate: z.string().min(1, 'License plate is required').max(20),
  type: VehicleTypeSchema,
  status: VehicleStatusSchema,
  fuelType: z.enum(['gasoline', 'diesel', 'electric', 'hybrid']).optional(),
  mileage: z.number().min(0).optional(),
  lastMaintenanceDate: z.date().optional(),
  nextMaintenanceDate: z.date().optional(),
  insuranceExpiry: z.date().optional(),
  notes: z.string().max(500).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateVehicleSchema = VehicleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateVehicleSchema = CreateVehicleSchema.partial();

// TypeScript interfaces (inferred from Zod schemas)
export type Vehicle = z.infer<typeof VehicleSchema>;
export type CreateVehicle = z.infer<typeof CreateVehicleSchema>;
export type UpdateVehicle = z.infer<typeof UpdateVehicleSchema>;

// Extended interfaces with relations
export interface VehicleWithTrips extends Vehicle {
  trips: any[]; // Will be Trip[] when trip types are updated
  totalTrips: number;
  totalDistance: number;
  totalCost: number;
  utilizationRate: number;
}

// Utility types for vehicle operations
export type VehicleFilters = {
  status?: VehicleStatus;
  type?: VehicleType;
  make?: string;
  model?: string;
  yearRange?: {
    min: number;
    max: number;
  };
  capacityRange?: {
    min: number;
    max: number;
  };
  search?: string;
  maintenanceDue?: boolean;
  insuranceExpiring?: boolean;
};

export type VehicleMetrics = {
  totalVehicles: number;
  activeVehicles: number;
  maintenanceVehicles: number;
  totalCapacity: number;
  averageAge: number;
  vehiclesByType: Record<VehicleType, number>;
  utilizationRate: number;
};

export type VehicleUtilization = {
  vehicleId: string;
  vehicle: Vehicle;
  tripsCount: number;
  totalDistance: number;
  totalPassengers: number;
  utilizationRate: number;
  averageLoadFactor: number;
  maintenanceHours: number;
};

// Database table type definitions for Supabase
export interface VehicleRow extends BaseEntity {
  make: string;
  model: string;
  year: number;
  license_plate: string;
  capacity: number;
  type: 'bus' | 'van' | 'car' | 'truck';
  status: 'active' | 'inactive' | 'maintenance';
  registration?: string;
  fuel_type?: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  mileage?: number;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  insurance_expiry?: string;
  notes?: string;
}

export interface VehicleInsert extends Omit<VehicleRow, 'id' | 'created_at' | 'updated_at'> {}
export interface VehicleUpdate extends Partial<VehicleInsert> {}

// Form validation helpers
export const validateVehicle = (data: unknown) => VehicleSchema.safeParse(data);
export const validateCreateVehicle = (data: unknown) => CreateVehicleSchema.safeParse(data);
export const validateUpdateVehicle = (data: unknown) => UpdateVehicleSchema.safeParse(data);