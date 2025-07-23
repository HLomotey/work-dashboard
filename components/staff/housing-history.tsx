'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { 
  History,
  Home,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  Eye,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useHousingAssignments } from '@/hooks/use-housing'
import { AssignmentStatus, type RoomAssignmentWithDetails } from '@/lib/types/housing'
import { cn } from '@/lib/utils'

interface HousingHistoryProps {
  staffId: string
  onViewDetails?: (assignmentId: string) => void
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

// Mock housing history data - in real implementation, this would come from the API
const mockHousingHistory: RoomAssignmentWithDetails[] = [
  {
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
      amenities: ['wifi', 'ac', 'parking'],
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
  },
  {
    id: '2',
    staffId: 'staff-1',
    roomId: 'room-2',
    startDate: new Date('2023-06-01'),
    endDate: new Date('2024-01-10'),
    status: AssignmentStatus.COMPLETED,
    createdAt: new Date('2023-05-25'),
    updatedAt: new Date('2024-01-10'),
    room: {
      id: 'room-2',
      propertyId: 'prop-2',
      roomNumber: '105',
      capacity: 1,
      currentOccupancy: 0,
      monthlyRate: 750.00,
      status: 'available' as any,
      amenities: ['wifi', 'laundry'],
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    property: {
      id: 'prop-2',
      name: 'Garden View Residences',
      address: '456 Garden Street, Midtown',
      totalCapacity: 80,
      status: 'active' as any,
      photos: ['/images/garden-1.jpg', '/images/garden-2.jpg'],
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    staff: {
      id: 'staff-1',
      firstName: 'John',
      lastName: 'Doe',
      employeeId: 'EMP001'
    }
  },
  {
    id: '3',
    staffId: 'staff-1',
    roomId: 'room-3',
    startDate: new Date('2023-01-15'),
    endDate: new Date('2023-05-30'),
    status: AssignmentStatus.COMPLETED,
    createdAt: new Date('2023-01-10'),
    updatedAt: new Date('2023-05-30'),
    room: {
      id: 'room-3',
      propertyId: 'prop-1',
      roomNumber: '301',
      capacity: 2,
      currentOccupancy: 0,
      monthlyRate: 800.00,
      status: 'available' as any,
      amenities: ['wifi', 'ac'],
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    property: {
      id: 'prop-1',
      name: 'Riverside Apartments',
      address: '123 River View Drive, Downtown',
      totalCapacity: 120,
      status: 'active' as any,
      photos: ['/images/riverside-1.jpg', '/images/riverside-2.jpg'],
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    staff: {
      id: 'staff-1',
      firstName: 'John',
      lastName: 'Doe',
      employeeId: 'EMP001'
    }
  }
]

export function HousingHistory({ staffId, onViewDetails }: HousingHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedAssignment, setSelectedAssignment] = useState<RoomAssignmentWithDetails | null>(null)

  // In real implementation, this would fetch data based on staffId
  const { assignments, isLoading, error } = useHousingAssignments(staffId)
  
  // Use mock data for demonstration
  const housingHistory = mockHousingHistory

  // Filter assignments based on search and status
  const filteredHistory = housingHistory.filter(assignment => {
    const matchesSearch = searchTerm === '' || 
      assignment.property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.property.address.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const calculateDuration = (startDate: Date, endDate?: Date) => {
    const end = endDate || new Date()
    const diffTime = Math.abs(end.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) {
      return `${diffDays} days`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} month${months > 1 ? 's' : ''}`
    } else {
      const years = Math.floor(diffDays / 365)
      const remainingMonths = Math.floor((diffDays % 365) / 30)
      return `${years} year${years > 1 ? 's' : ''} ${remainingMonths > 0 ? `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading housing history...</p>
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
            <p className="text-muted-foreground">Failed to load housing history</p>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Housing History
          </CardTitle>
          <CardDescription>
            Complete history of your housing assignments and moves
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by property, room, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={AssignmentStatus.ACTIVE}>Active</SelectItem>
                <SelectItem value={AssignmentStatus.COMPLETED}>Completed</SelectItem>
                <SelectItem value={AssignmentStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={AssignmentStatus.CANCELLED}>Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Housing History Table */}
          {filteredHistory.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property & Room</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Monthly Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{assignment.property.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Room {assignment.room.roomNumber} • {assignment.property.address}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{format(assignment.startDate, 'MMM dd, yyyy')}</div>
                          <div className="text-muted-foreground">
                            {assignment.endDate ? 
                              `to ${format(assignment.endDate, 'MMM dd, yyyy')}` : 
                              'Present'
                            }
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {calculateDuration(assignment.startDate, assignment.endDate)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          ${assignment.room.monthlyRate?.toLocaleString() || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[assignment.status].variant} className="gap-1">
                          {(() => {
                            const IconComponent = statusConfig[assignment.status].icon;
                            return <IconComponent className="h-3 w-3" />;
                          })()}
                          {statusConfig[assignment.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedAssignment(assignment)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Assignment Details</DialogTitle>
                              <DialogDescription>
                                Detailed information about this housing assignment
                              </DialogDescription>
                            </DialogHeader>
                            {selectedAssignment && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Property</p>
                                    <p className="text-sm">{selectedAssignment.property.name}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Room</p>
                                    <p className="text-sm">Room {selectedAssignment.room.roomNumber}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                                    <p className="text-sm">{selectedAssignment.property.address}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Monthly Rate</p>
                                    <p className="text-sm">${selectedAssignment.room.monthlyRate?.toLocaleString() || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Move-in Date</p>
                                    <p className="text-sm">{format(selectedAssignment.startDate, 'PPP')}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Move-out Date</p>
                                    <p className="text-sm">
                                      {selectedAssignment.endDate ? format(selectedAssignment.endDate, 'PPP') : 'Current'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Duration</p>
                                    <p className="text-sm">
                                      {calculateDuration(selectedAssignment.startDate, selectedAssignment.endDate)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    <Badge variant={statusConfig[selectedAssignment.status].variant} className="gap-1">
                                      {(() => {
                                        const IconComponent = statusConfig[selectedAssignment.status].icon;
                                        return <IconComponent className="h-3 w-3" />;
                                      })()}
                                      {statusConfig[selectedAssignment.status].label}
                                    </Badge>
                                  </div>
                                </div>
                                
                                {selectedAssignment.room.amenities && selectedAssignment.room.amenities.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Amenities</p>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedAssignment.room.amenities.map((amenity) => (
                                        <Badge key={amenity} variant="outline" className="text-xs">
                                          {amenity}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Housing History Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No assignments match your current filters.' 
                  : 'You don\'t have any housing assignment history yet.'
                }
              </p>
            </div>
          )}

          {/* Summary Stats */}
          {housingHistory.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold">{housingHistory.length}</div>
                <div className="text-sm text-muted-foreground">Total Assignments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {housingHistory.filter(a => a.status === AssignmentStatus.COMPLETED).length}
                </div>
                <div className="text-sm text-muted-foreground">Completed Moves</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {new Set(housingHistory.map(a => a.property.id)).size}
                </div>
                <div className="text-sm text-muted-foreground">Different Properties</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
