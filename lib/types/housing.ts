import { z } from 'zod'

// Housing domain enums
export enum PropertyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance'
}

export enum RoomStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  OUT_OF_ORDER = 'out_of_order'
}

export enum AssignmentStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Zod schemas for validation
export const PropertyStatusSchema = z.nativeEnum(PropertyStatus)
export const RoomStatusSchema = z.nativeEnum(RoomStatus)
export const AssignmentStatusSchema = z.nativeEnum(AssignmentStatus)

// Property schemas
export const PropertySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Property name is required').max(255),
  address: z.string().min(1, 'Address is required'),
  description: z.string().optional(),
  photos: z.array(z.string()).default([]),
  totalCapacity: z.number().int().positive('Total capacity must be positive'),
  status: PropertyStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const CreatePropertySchema = PropertySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const UpdatePropertySchema = CreatePropertySchema.partial()

// Room schemas
export const RoomSchema = z.object({
  id: z.string().uuid(),
  propertyId: z.string().uuid(),
  roomNumber: z.string().min(1, 'Room number is required').max(50),
  capacity: z.number().int().positive('Room capacity must be positive').max(10),
  currentOccupancy: z.number().int().min(0).optional(),
  monthlyRate: z.number().positive('Monthly rate must be positive').optional(),
  amenities: z.array(z.string()).default([]),
  status: RoomStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const CreateRoomSchema = RoomSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const UpdateRoomSchema = CreateRoomSchema.partial().omit({ propertyId: true })

// Room Assignment schemas
const BaseRoomAssignmentSchema = z.object({
  id: z.string().uuid(),
  roomId: z.string().uuid(),
  staffId: z.string().uuid(),
  startDate: z.date(),
  endDate: z.date().optional(),
  status: AssignmentStatusSchema,
  moveInDate: z.date().optional(),
  moveOutDate: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

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
)

export const CreateRoomAssignmentSchema = BaseRoomAssignmentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const UpdateRoomAssignmentSchema = CreateRoomAssignmentSchema.partial().omit({
  roomId: true,
  staffId: true,
})

// TypeScript interfaces (inferred from Zod schemas)
export type Property = z.infer<typeof PropertySchema>
export type CreateProperty = z.infer<typeof CreatePropertySchema>
export type UpdateProperty = z.infer<typeof UpdatePropertySchema>

export type Room = z.infer<typeof RoomSchema>
export type CreateRoom = z.infer<typeof CreateRoomSchema>
export type UpdateRoom = z.infer<typeof UpdateRoomSchema>

export type RoomAssignment = z.infer<typeof RoomAssignmentSchema>
export type CreateRoomAssignment = z.infer<typeof CreateRoomAssignmentSchema>
export type UpdateRoomAssignment = z.infer<typeof UpdateRoomAssignmentSchema>

// Extended interfaces with relations
export interface PropertyWithRooms extends Property {
  rooms: Room[]
  occupancyRate: number
  availableCapacity: number
  contactInfo?: {
    phone?: string
    email?: string
    manager?: string
  }
}

export interface RoomWithAssignments extends Room {
  assignments: RoomAssignment[]
  currentOccupancy: number
  isAvailable: boolean
}

export interface RoomAssignmentWithDetails extends RoomAssignment {
  room: Room
  property: Property
  staff?: {
    id: string
    firstName: string
    lastName: string
    employeeId: string
  }
}

// Utility types for housing operations
export type HousingFilters = {
  propertyId?: string
  status?: PropertyStatus | RoomStatus | AssignmentStatus
  dateRange?: {
    start: Date
    end: Date
  }
  search?: string
}

export type OccupancyMetrics = {
  totalProperties: number
  totalRooms: number
  totalCapacity: number
  occupiedRooms: number
  occupancyRate: number
  availableRooms: number
  maintenanceRooms: number
}

export type RoomAvailability = {
  roomId: string
  available: boolean
  availableFrom?: Date
  availableUntil?: Date
  currentOccupancy: number
  maxCapacity: number
}

// Form validation helpers
export const validateProperty = (data: unknown) => PropertySchema.safeParse(data)
export const validateCreateProperty = (data: unknown) => CreatePropertySchema.safeParse(data)
export const validateUpdateProperty = (data: unknown) => UpdatePropertySchema.safeParse(data)

export const validateRoom = (data: unknown) => RoomSchema.safeParse(data)
export const validateCreateRoom = (data: unknown) => CreateRoomSchema.safeParse(data)
export const validateUpdateRoom = (data: unknown) => UpdateRoomSchema.safeParse(data)

export const validateRoomAssignment = (data: unknown) => RoomAssignmentSchema.safeParse(data)
export const validateCreateRoomAssignment = (data: unknown) => CreateRoomAssignmentSchema.safeParse(data)
export const validateUpdateRoomAssignment = (data: unknown) => UpdateRoomAssignmentSchema.safeParse(data)