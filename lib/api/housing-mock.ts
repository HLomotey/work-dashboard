// Mock data service for housing management
// This provides fallback data when Supabase is not available

export interface Property {
  id: string;
  name: string;
  address: string;
  description?: string;
  photos?: string[];
  totalCapacity: number;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
}

export interface Room {
  id: string;
  propertyId: string;
  roomNumber: string;
  capacity: number;
  status: 'available' | 'occupied' | 'maintenance' | 'out_of_order';
  amenities: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomAssignment {
  id: string;
  roomId: string;
  staffId: string;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Mock data
const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Executive Apartments',
    address: '123 Corporate Drive',
    description: 'Modern executive apartments for senior staff',
    photos: ['/images/property1.jpg'],
    totalCapacity: 50,
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Staff Dormitory A',
    address: '456 Staff Lane',
    description: 'Shared dormitory facilities for general staff',
    photos: ['/images/property2.jpg'],
    totalCapacity: 100,
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    name: 'Guest House',
    address: '789 Visitor Street',
    description: 'Temporary accommodation for visitors and guests',
    photos: ['/images/property3.jpg'],
    totalCapacity: 20,
    status: 'maintenance',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

const mockRooms: Room[] = [
  {
    id: '1',
    propertyId: '1',
    roomNumber: '101',
    capacity: 2,
    status: 'occupied',
    amenities: ['wifi', 'ac', 'private_bathroom'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    propertyId: '1',
    roomNumber: '102',
    capacity: 2,
    status: 'available',
    amenities: ['wifi', 'ac', 'private_bathroom'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    propertyId: '2',
    roomNumber: '201',
    capacity: 4,
    status: 'occupied',
    amenities: ['wifi', 'shared_bathroom'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

const mockAssignments: RoomAssignment[] = [
  {
    id: '1',
    roomId: '1',
    staffId: 'staff-1',
    status: 'active',
    startDate: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    roomId: '3',
    staffId: 'staff-2',
    status: 'active',
    startDate: new Date('2024-02-01'),
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
];

// Mock API functions
export const mockHousingAPI = {
  // Get properties with capacity summary
  getPropertiesCapacity(): Promise<Property[]> {
    return Promise.resolve(mockProperties);
  },

  // Get all properties with rooms
  getPropertiesWithRooms: async (): Promise<Property[]> => {
    return mockProperties.map(property => ({
      ...property,
      rooms: mockRooms.filter(room => room.propertyId === property.id),
    }));
  },

  // Get rooms summary
  getRoomsSummary(): Promise<Room[]> {
    return Promise.resolve(
      mockRooms.filter(r => r.propertyId === '1')
    );
  },

  // Get active room assignments
  getActiveAssignments: async (): Promise<RoomAssignment[]> => {
    return mockAssignments.filter(assignment => assignment.status === 'active');
  },
};

// Check if we should use mock data (when Supabase is not available)
export const shouldUseMockData = () => {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || 
         !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your_supabase_anon_key_here';
};
