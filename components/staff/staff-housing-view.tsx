'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { 
  Home,
  MapPin,
  Calendar,
  Users,
  Bed,
  Wifi,
  Car,
  Coffee,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useHousingAssignments } from '@/hooks/use-housing'
import { AssignmentStatus, type RoomAssignmentWithDetails } from '@/lib/types/housing'
import { cn } from '@/lib/utils'

interface StaffHousingViewProps {
  staffId: string
  onViewDetails?: (assignmentId: string) => void
  onRequestChange?: () => void
}

const statusConfig = {
  [AssignmentStatus.ACTIVE]: {
    label: 'Active',
    variant: 'default' as const,
    icon: CheckCircle,
    color: 'text-green-600'
  },
  [AssignmentStatus.PENDING]: {
    label: 'Pending',
    variant: 'secondary' as const,
    icon: Clock,
    color: 'text-yellow-600'
  },
  [AssignmentStatus.COMPLETED]: {
    label: 'Completed',
    variant: 'outline' as const,
    icon: CheckCircle,
    color: 'text-gray-600'
  },
  [AssignmentStatus.CANCELLED]: {
    label: 'Cancelled',
    variant: 'destructive' as const,
    icon: AlertCircle,
    color: 'text-red-600'
  }
}

// Mock data for demonstration - in real implementation, this would come from the API
const mockCurrentAssignment: RoomAssignmentWithDetails = {
  id: '1',
  staffId: 'staff-1',
  roomId: 'room-1',
  startDate: new Date('2024-01-15'),
  endDate: undefined,
  status: AssignmentStatus.ACTIVE,
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-15'),
  room: {
    id: 'room-1',
    propertyId: 'prop-1',
    roomNumber: '204',
    capacity: 2,
    currentOccupancy: 1,
    monthlyRate: 850.00,
    status: 'available' as any,
    amenities: ['wifi', 'ac', 'parking', 'laundry'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  property: {
    id: 'prop-1',
    name: 'Riverside Apartments',
    address: '123 River View Drive, Downtown',
    totalCapacity: 120,
    status: 'active' as any,
    photos: ['/images/riverside-1.jpg', '/images/riverside-2.jpg'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  staff: {
    id: 'staff-1',
    firstName: 'John',
    lastName: 'Doe',
    employeeId: 'EMP001'
  }
}

const amenityIcons = {
  wifi: { icon: Wifi, label: 'WiFi' },
  ac: { icon: Shield, label: 'Air Conditioning' },
  parking: { icon: Car, label: 'Parking' },
  laundry: { icon: Coffee, label: 'Laundry' },
  gym: { icon: Users, label: 'Gym Access' },
  kitchen: { icon: Coffee, label: 'Kitchen' }
}

export function StaffHousingView({ staffId, onViewDetails, onRequestChange }: StaffHousingViewProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<RoomAssignmentWithDetails | null>(null)
  
  // In real implementation, this would fetch data based on staffId
  const { assignments, isLoading, error } = useHousingAssignments(staffId)
  
  // Mock current assignment for demonstration
  const currentAssignment = mockCurrentAssignment

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading housing information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Failed to load housing information</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Housing Assignment */}
      {currentAssignment && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Current Housing Assignment
                </CardTitle>
                <CardDescription>Your active housing assignment details</CardDescription>
              </div>
              <Badge variant={statusConfig[currentAssignment.status].variant} className="gap-1">
                {(() => {
                  const IconComponent = statusConfig[currentAssignment.status].icon;
                  return <IconComponent className="h-3 w-3" />;
                })()}
                {statusConfig[currentAssignment.status].label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Property and Room Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Property Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{currentAssignment.property.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{currentAssignment.property.address}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Room Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4 text-muted-foreground" />
                      <span>Room {currentAssignment.room.roomNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {currentAssignment.room.currentOccupancy} of {currentAssignment.room.capacity} occupied
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        ${currentAssignment.room.monthlyRate?.toLocaleString() || 'N/A'}/month
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Assignment Period</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Started: {format(currentAssignment.startDate, 'PPP')}
                      </span>
                    </div>
                    {currentAssignment.endDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Ends: {format(currentAssignment.endDate, 'PPP')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentAssignment.room.amenities?.map((amenity) => {
                      const amenityConfig = amenityIcons[amenity as keyof typeof amenityIcons]
                      if (!amenityConfig) return null
                      
                      const IconComponent = amenityConfig.icon
                      return (
                        <div key={amenity} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-sm">
                          <IconComponent className="h-3 w-3" />
                          <span>{amenityConfig.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Room Details - {currentAssignment.room.roomNumber}</DialogTitle>
                    <DialogDescription>
                      Detailed information about your current housing assignment
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Property</p>
                        <p className="text-sm">{currentAssignment.property.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Room Number</p>
                        <p className="text-sm">{currentAssignment.room.roomNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Monthly Rate</p>
                        <p className="text-sm">${currentAssignment.room.monthlyRate?.toLocaleString() || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Capacity</p>
                        <p className="text-sm">{currentAssignment.room.capacity} people</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Available Amenities</p>
                      <div className="grid grid-cols-2 gap-2">
                        {currentAssignment.room.amenities?.map((amenity) => {
                          const amenityConfig = amenityIcons[amenity as keyof typeof amenityIcons]
                          if (!amenityConfig) return null
                          
                          const IconComponent = amenityConfig.icon
                          return (
                            <div key={amenity} className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{amenityConfig.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="gap-2" onClick={onRequestChange}>
                <FileText className="h-4 w-4" />
                Request Change
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Current Assignment */}
      {!currentAssignment && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Current Housing Assignment</h3>
              <p className="text-muted-foreground mb-4">
                You don't have an active housing assignment at this time.
              </p>
              <Button onClick={onRequestChange}>
                Request Housing Assignment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
