/**
 * Room-related type definitions
 * Contains all interfaces and types related to room management
 * Matches frontend component expectations
 */

import { z } from 'zod';
import { BaseEntity } from './base';

// Room domain enums
export enum RoomStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  OUT_OF_ORDER = 'out_of_order',
  RESERVED = 'reserved'
}

export enum AssignmentStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  INACTIVE = 'inactive',
  TERMINATED = 'terminated'
}

// Zod schemas for validation
export const RoomStatusSchema = z.nativeEnum(RoomStatus);
export const AssignmentStatusSchema = z.nativeEnum(AssignmentStatus);

// Room schemas
export const RoomSchema = z.object({
  id: z.string().uuid(),
  propertyId: z.string().uuid(),
  roomNumber: z.string().min(1, 'Room number is required').max(50),
  capacity: z.number().int().positive('Room capacity must be positive').max(10),
  currentOccupancy: z.number().int().min(0).default(0),
  monthlyRate: z.number().positive('Monthly rate must be positive').optional(),
  amenities: z.array(z.string()).default([]),
  status: RoomStatusSchema,
  description: z.string().optional(),
  photos: z.array(z.string()).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateRoomSchema = RoomSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateRoomSchema = CreateRoomSchema.partial().omit({ propertyId: true });

// Room Assignment schemas
const BaseRoomAssignmentSchema = z.object({
  id: z.string().uuid(),
  roomId: z.string().uuid(),
  staffId: z.string().uuid(),
  startDate: z.date(),
  endDate: z.date().optional(),
  status: AssignmentStatusSchema,
  monthlyRate: z.number().positive('Monthly rate must be positive'),
  moveInDate: z.date().optional(),
  moveOutDate: z.date().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const RoomAssignmentSchema = BaseRoomAssignmentSchema.refine(
  (data) => !data.endDate || data.startDate <= data.endDate,
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
).refine(
  (data) => !data.moveInDate || data.moveInDate >= data.startDate,
  {
    message: 'Move-in date cannot be before start date',
    path: ['moveInDate'],
  }
).refine(
  (data) => !data.moveOutDate || !data.endDate || data.moveOutDate <= data.endDate,
  {
    message: 'Move-out date cannot be after end date',
    path: ['moveOutDate'],
  }
);

export const CreateRoomAssignmentSchema = BaseRoomAssignmentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateRoomAssignmentSchema = CreateRoomAssignmentSchema.partial().omit({
  roomId: true,
  staffId: true,
});

// TypeScript interfaces (inferred from Zod schemas)
export type Room = z.infer<typeof RoomSchema>;
export type CreateRoom = z.infer<typeof CreateRoomSchema>;
export type UpdateRoom = z.infer<typeof UpdateRoomSchema>;

export type RoomAssignment = z.infer<typeof RoomAssignmentSchema>;
export type CreateRoomAssignment = z.infer<typeof CreateRoomAssignmentSchema>;
export type UpdateRoomAssignment = z.infer<typeof UpdateRoomAssignmentSchema>;

// Extended interfaces with relations
export interface RoomWithAssignments extends Room {
  assignments: RoomAssignment[];
  isAvailable: boolean;
  property?: {
    id: string;
    name: string;
    address: string;
  };
}

export interface RoomAssignmentWithDetails extends RoomAssignment {
  room: Room;
  property?: {
    id: string;
    name: string;
    address: string;
  };
  staff?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
}

// Utility types for room operations
export type RoomFilters = {
  propertyId?: string;
  status?: RoomStatus;
  assignmentStatus?: AssignmentStatus;
  capacityRange?: {
    min: number;
    max: number;
  };
  rateRange?: {
    min: number;
    max: number;
  };
  search?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
};

export type RoomAvailability = {
  roomId: string;
  available: boolean;
  availableFrom?: Date;
  availableUntil?: Date;
  currentOccupancy: number;
  maxCapacity: number;
};

export type OccupancyMetrics = {
  totalRooms: number;
  totalCapacity: number;
  occupiedRooms: number;
  occupancyRate: number;
  availableRooms: number;
  maintenanceRooms: number;
  averageMonthlyRate: number;
};

// Database table type definitions for Supabase
export interface RoomRow extends BaseEntity {
  property_id: string;
  room_number: string;
  capacity: number;
  occupied: number;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  monthly_rate?: number;
  amenities?: string[];
  description?: string;
  photos?: string[];
}

export interface RoomAssignmentRow extends BaseEntity {
  room_id: string;
  staff_id: string;
  status: 'active' | 'inactive' | 'pending' | 'terminated';
  start_date: string;
  end_date?: string;
  monthly_rate: number;
  move_in_date?: string;
  move_out_date?: string;
  notes?: string;
}

export interface RoomInsert extends Omit<RoomRow, 'id' | 'created_at' | 'updated_at'> {}
export interface RoomUpdate extends Partial<RoomInsert> {}

export interface RoomAssignmentInsert extends Omit<RoomAssignmentRow, 'id' | 'created_at' | 'updated_at'> {}
export interface RoomAssignmentUpdate extends Partial<RoomAssignmentInsert> {}

// Form validation helpers
export const validateRoom = (data: unknown) => RoomSchema.safeParse(data);
export const validateCreateRoom = (data: unknown) => CreateRoomSchema.safeParse(data);
export const validateUpdateRoom = (data: unknown) => UpdateRoomSchema.safeParse(data);

export const validateRoomAssignment = (data: unknown) => RoomAssignmentSchema.safeParse(data);
export const validateCreateRoomAssignment = (data: unknown) => CreateRoomAssignmentSchema.safeParse(data);
export const validateUpdateRoomAssignment = (data: unknown) => UpdateRoomAssignmentSchema.safeParse(data);
