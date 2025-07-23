// Mock data service for housing management
// This provides fallback data when Supabase is not available

export interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  total_capacity: number;
  occupied_rooms: number;
  status: 'active' | 'inactive' | 'maintenance';
  rooms?: Room[];
}

export interface Room {
  id: string;
  property_id: string;
  room_number: string;
  capacity: number;
  occupied: number;
  status: 'available' | 'occupied' | 'maintenance';
  amenities: string[];
}

export interface RoomAssignment {
  id: string;
  room_id: string;
  staff_id: string;
  status: 'active' | 'inactive';
  start_date: string;
  end_date?: string;
}

// Mock data
const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Executive Apartments',
    address: '123 Corporate Drive',
    type: 'apartment',
    total_capacity: 50,
    occupied_rooms: 35,
    status: 'active',
  },
  {
    id: '2',
    name: 'Staff Dormitory A',
    address: '456 Staff Lane',
    type: 'dormitory',
    total_capacity: 100,
    occupied_rooms: 87,
    status: 'active',
  },
  {
    id: '3',
    name: 'Guest House',
    address: '789 Guest Street',
    type: 'guesthouse',
    total_capacity: 20,
    occupied_rooms: 12,
    status: 'active',
  },
];

const mockRooms: Room[] = [
  {
    id: '1',
    property_id: '1',
    room_number: 'A101',
    capacity: 2,
    occupied: 2,
    status: 'occupied',
    amenities: ['WiFi', 'AC', 'Kitchen'],
  },
  {
    id: '2',
    property_id: '1',
    room_number: 'A102',
    capacity: 2,
    occupied: 0,
    status: 'available',
    amenities: ['WiFi', 'AC', 'Kitchen'],
  },
  {
    id: '3',
    property_id: '2',
    room_number: 'B201',
    capacity: 4,
    occupied: 3,
    status: 'occupied',
    amenities: ['WiFi', 'Shared Kitchen'],
  },
];

const mockAssignments: RoomAssignment[] = [
  {
    id: '1',
    room_id: '1',
    staff_id: 'staff_1',
    status: 'active',
    start_date: '2024-01-01',
  },
  {
    id: '2',
    room_id: '3',
    staff_id: 'staff_2',
    status: 'active',
    start_date: '2024-02-01',
  },
];

// Mock API functions
export const mockHousingAPI = {
  // Get properties with capacity summary
  getPropertiesCapacity: async (): Promise<Property[]> => {
    return mockProperties.map(p => ({
      id: p.id,
      total_capacity: p.total_capacity,
      status: p.status,
    })) as Property[];
  },

  // Get all properties with rooms
  getPropertiesWithRooms: async (): Promise<Property[]> => {
    return mockProperties.map(property => ({
      ...property,
      rooms: mockRooms.filter(room => room.property_id === property.id),
    }));
  },

  // Get rooms summary
  getRoomsSummary: async (): Promise<Room[]> => {
    return mockRooms.map(room => ({
      id: room.id,
      capacity: room.capacity,
      status: room.status,
    })) as Room[];
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
