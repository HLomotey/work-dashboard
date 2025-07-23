/**
 * Trip-related type definitions
 * Contains all interfaces and types related to trip management
 * Matches frontend component expectations
 */

import { z } from 'zod';
import { BaseEntity } from './base';

// Trip domain enums
export enum TripStatus {
  SCHEDULED = 'scheduled',
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum PassengerStatus {
  CONFIRMED = 'confirmed',
  NO_SHOW = 'no_show',
  CANCELLED = 'cancelled'
}

// Zod schemas for validation
export const TripStatusSchema = z.nativeEnum(TripStatus);
export const PassengerStatusSchema = z.nativeEnum(PassengerStatus);

// Trip schemas
const BaseTripSchema = z.object({
  id: z.string().uuid(),
  vehicleId: z.string().uuid(),
  driverId: z.string().uuid(),
  date: z.date(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  route: z.string().min(1, 'Route is required').max(255),
  startLocation: z.string().min(1, 'Start location is required').max(255),
  endLocation: z.string().min(1, 'End location is required').max(255),
  passengerCount: z.number().int().min(0).max(100),
  distance: z.number().positive().optional(),
  cost: z.number().positive().optional(),
  purpose: z.string().min(1, 'Purpose is required').max(255),
  status: TripStatusSchema,
  notes: z.string().max(500).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const TripSchema = BaseTripSchema.refine(
  (data) => data.date >= new Date(new Date().setHours(0, 0, 0, 0)),
  {
    message: 'Trip date cannot be in the past',
    path: ['date'],
  }
);

export const CreateTripSchema = BaseTripSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).refine(
  (data) => data.date >= new Date(new Date().setHours(0, 0, 0, 0)),
  {
    message: 'Trip date cannot be in the past',
    path: ['date'],
  }
);

export const UpdateTripSchema = BaseTripSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  vehicleId: true,
}).partial().refine(
  (data) => !data.date || data.date >= new Date(new Date().setHours(0, 0, 0, 0)),
  {
    message: 'Trip date cannot be in the past',
    path: ['date'],
  }
);

// Trip Passenger schemas
export const TripPassengerSchema = z.object({
  id: z.string().uuid(),
  tripId: z.string().uuid(),
  staffId: z.string().uuid(),
  status: PassengerStatusSchema,
  pickupLocation: z.string().max(255).optional(),
  dropoffLocation: z.string().max(255).optional(),
  notes: z.string().max(255).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateTripPassengerSchema = TripPassengerSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateTripPassengerSchema = CreateTripPassengerSchema.partial().omit({
  tripId: true,
  staffId: true,
});

// TypeScript interfaces (inferred from Zod schemas)
export type Trip = z.infer<typeof TripSchema>;
export type CreateTrip = z.infer<typeof CreateTripSchema>;
export type UpdateTrip = z.infer<typeof UpdateTripSchema>;

export type TripPassenger = z.infer<typeof TripPassengerSchema>;
export type CreateTripPassenger = z.infer<typeof CreateTripPassengerSchema>;
export type UpdateTripPassenger = z.infer<typeof UpdateTripPassengerSchema>;

// Extended interfaces with relations
export interface TripWithDetails extends Trip {
  vehicle?: {
    id: string;
    make: string;
    model: string;
    licensePlate: string;
    capacity: number;
  };
  passengers: TripPassengerWithDetails[];
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  loadFactor: number;
  costPerPassenger: number;
}

export interface TripPassengerWithDetails extends TripPassenger {
  staff: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  trip?: Trip;
}

// Utility types for trip operations
export type TripFilters = {
  vehicleId?: string;
  driverId?: string;
  status?: TripStatus;
  passengerStatus?: PassengerStatus;
  dateRange?: {
    start: Date;
    end: Date;
  };
  route?: string;
  search?: string;
  costRange?: {
    min: number;
    max: number;
  };
};

export type TripMetrics = {
  totalTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  totalPassengers: number;
  totalDistance: number;
  totalCost: number;
  averageLoadFactor: number;
  costPerMile: number;
  costPerPassenger: number;
  popularRoutes: string[];
};

export type RouteAnalytics = {
  route: string;
  tripsCount: number;
  totalPassengers: number;
  averagePassengers: number;
  totalCost: number;
  averageCost: number;
  popularTimes: string[];
};

// Database table type definitions for Supabase
export interface TripRow extends BaseEntity {
  vehicle_id: string;
  driver_id: string;
  route: string;
  start_location: string;
  end_location: string;
  start_time: string;
  end_time?: string;
  cost: number;
  purpose: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  date?: string;
  passenger_count?: number;
  distance?: number;
  notes?: string;
}

export interface TripPassengerRow extends BaseEntity {
  trip_id: string;
  staff_id: string;
  status: 'confirmed' | 'no_show' | 'cancelled';
  pickup_location?: string;
  dropoff_location?: string;
  notes?: string;
}

export interface TripInsert extends Omit<TripRow, 'id' | 'created_at' | 'updated_at'> {}
export interface TripUpdate extends Partial<TripInsert> {}

export interface TripPassengerInsert extends Omit<TripPassengerRow, 'id' | 'created_at' | 'updated_at'> {}
export interface TripPassengerUpdate extends Partial<TripPassengerInsert> {}

// Form validation helpers
export const validateTrip = (data: unknown) => TripSchema.safeParse(data);
export const validateCreateTrip = (data: unknown) => CreateTripSchema.safeParse(data);
export const validateUpdateTrip = (data: unknown) => UpdateTripSchema.safeParse(data);

export const validateTripPassenger = (data: unknown) => TripPassengerSchema.safeParse(data);
export const validateCreateTripPassenger = (data: unknown) => CreateTripPassengerSchema.safeParse(data);
export const validateUpdateTripPassenger = (data: unknown) => UpdateTripPassengerSchema.safeParse(data);