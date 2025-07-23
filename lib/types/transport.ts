import { z } from 'zod'

// Transport domain enums
export enum VehicleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  OUT_OF_SERVICE = 'out_of_service'
}

export enum TripStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Zod schemas for validation
export const VehicleStatusSchema = z.nativeEnum(VehicleStatus)
export const TripStatusSchema = z.nativeEnum(TripStatus)

// Vehicle schemas
export const VehicleSchema = z.object({
  id: z.string().uuid(),
  make: z.string().min(1, 'Vehicle make is required').max(100),
  model: z.string().min(1, 'Vehicle model is required').max(100),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  capacity: z.number().int().positive('Vehicle capacity must be positive').max(100),
  registration: z.string().min(1, 'Registration is required').max(50),
  status: VehicleStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const CreateVehicleSchema = VehicleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const UpdateVehicleSchema = CreateVehicleSchema.partial()

// Trip schemas
const BaseTripSchema = z.object({
  id: z.string().uuid(),
  vehicleId: z.string().uuid(),
  date: z.date(),
  route: z.string().min(1, 'Route is required').max(255),
  passengerCount: z.number().int().min(0).max(100),
  distance: z.number().positive().optional(),
  cost: z.number().positive().optional(),
  driverId: z.string().uuid(),
  status: TripStatusSchema,
  notes: z.string().max(500).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const TripSchema = BaseTripSchema.refine(
  (data) => data.date >= new Date(new Date().setHours(0, 0, 0, 0)),
  {
    message: 'Trip date cannot be in the past',
    path: ['date'],
  }
)

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
)

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
)

// Trip Passenger schemas
export const TripPassengerSchema = z.object({
  id: z.string().uuid(),
  tripId: z.string().uuid(),
  staffId: z.string().uuid(),
  pickupLocation: z.string().max(255).optional(),
  dropoffLocation: z.string().max(255).optional(),
  createdAt: z.date(),
})

export const CreateTripPassengerSchema = TripPassengerSchema.omit({
  id: true,
  createdAt: true,
})

export const UpdateTripPassengerSchema = CreateTripPassengerSchema.partial().omit({
  tripId: true,
  staffId: true,
})

// TypeScript interfaces (inferred from Zod schemas)
export type Vehicle = z.infer<typeof VehicleSchema>
export type CreateVehicle = z.infer<typeof CreateVehicleSchema>
export type UpdateVehicle = z.infer<typeof UpdateVehicleSchema>

export type Trip = z.infer<typeof TripSchema>
export type CreateTrip = z.infer<typeof CreateTripSchema>
export type UpdateTrip = z.infer<typeof UpdateTripSchema>

export type TripPassenger = z.infer<typeof TripPassengerSchema>
export type CreateTripPassenger = z.infer<typeof CreateTripPassengerSchema>
export type UpdateTripPassenger = z.infer<typeof UpdateTripPassengerSchema>

// Extended interfaces with relations
export interface VehicleWithTrips extends Vehicle {
  trips: Trip[]
  totalTrips: number
  totalDistance: number
  totalCost: number
  utilizationRate: number
}

export interface TripWithDetails extends Trip {
  vehicle: Vehicle
  passengers: TripPassengerWithDetails[]
  driver?: {
    id: string
    firstName: string
    lastName: string
    employeeId: string
  }
  loadFactor: number
  costPerPassenger: number
}

export interface TripPassengerWithDetails extends TripPassenger {
  staff: {
    id: string
    firstName: string
    lastName: string
    employeeId: string
  }
}

// Utility types for transport operations
export type TransportFilters = {
  vehicleId?: string
  driverId?: string
  status?: VehicleStatus | TripStatus
  dateRange?: {
    start: Date
    end: Date
  }
  route?: string
  search?: string
}

export type FleetMetrics = {
  totalVehicles: number
  activeVehicles: number
  maintenanceVehicles: number
  totalCapacity: number
  totalTrips: number
  totalPassengers: number
  totalDistance: number
  totalCost: number
  averageLoadFactor: number
  costPerMile: number
  costPerPassenger: number
}

export type VehicleUtilization = {
  vehicleId: string
  vehicle: Vehicle
  tripsCount: number
  totalDistance: number
  totalPassengers: number
  utilizationRate: number
  averageLoadFactor: number
  maintenanceHours: number
}

export type RouteAnalytics = {
  route: string
  tripsCount: number
  totalPassengers: number
  averagePassengers: number
  totalCost: number
  averageCost: number
  popularTimes: string[]
}

// Form validation helpers
export const validateVehicle = (data: unknown) => VehicleSchema.safeParse(data)
export const validateCreateVehicle = (data: unknown) => CreateVehicleSchema.safeParse(data)
export const validateUpdateVehicle = (data: unknown) => UpdateVehicleSchema.safeParse(data)

export const validateTrip = (data: unknown) => TripSchema.safeParse(data)
export const validateCreateTrip = (data: unknown) => CreateTripSchema.safeParse(data)
export const validateUpdateTrip = (data: unknown) => UpdateTripSchema.safeParse(data)

export const validateTripPassenger = (data: unknown) => TripPassengerSchema.safeParse(data)
export const validateCreateTripPassenger = (data: unknown) => CreateTripPassengerSchema.safeParse(data)
export const validateUpdateTripPassenger = (data: unknown) => UpdateTripPassengerSchema.safeParse(data)