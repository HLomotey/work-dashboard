'use client'

import * as React from 'react'
import { Building, MapPin, Users, Calendar, Edit, Settings } from 'lucide-react'
import { format } from 'date-fns'

import type { Property } from '@/lib/types/housing'
import { useRooms, useRoomAssignments } from '@/hooks/use-housing'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  KPICard, 
  KPIGrid, 
  LoadingSpinner, 
  DataTable,
  createSortableHeader 
} from '@/components/shared'
import { ColumnDef } from '@tanstack/react-table'

interface PropertyDetailsProps {
  property: Property
  onEdit?: () => void
  onManageRooms?: () => void
  className?: string
}

export function PropertyDetails({
  property,
  onEdit,
  onManageRooms,
  className,
}: PropertyDetailsProps) {
  const { rooms, isLoading: roomsLoading } = useRooms(property.id)
  const { assignments, isLoading: assignmentsLoading } = useRoomAssignments({
    propertyId: property.id,
  })

  // Calculate metrics
  const metrics = React.useMemo(() => {
    if (!rooms) return null

    const totalRooms = rooms.length
    const availableRooms = rooms.filter(r => r.status === 'available').length
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length
    const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length
    const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0)
    const occupancyRate = totalCapacity > 0 ? (occupiedRooms / totalRooms) * 100 : 0

    return {
      totalRooms,
      availableRooms,
      occupiedRooms,
      maintenanceRooms,
      totalCapacity,
      occupancyRate,
    }
  }, [rooms])

  // Room columns for table
  const roomColumns: ColumnDef<any>[] = React.useMemo(() => [
    {
      accessorKey: 'roomNumber',
      header: createSortableHeader('Room', 'roomNumber'),
      cell: ({ row }) => (
        <div className="font-medium">{row.original.roomNumber}</div>
      ),
    },
    {
      accessorKey: 'capacity',
      header: createSortableHeader('Capacity', 'capacity'),
      cell: ({ row }) => (
        <div className="text-center">{row.original.capacity}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        const variant = status === 'available' ? 'default' : 
                      status === 'occupied' ? 'secondary' : 
                      status === 'maintenance' ? 'outline' : 'destructive'
        
        return (
          <Badge variant={variant} className="capitalize">
            {status.replace('_', ' ')}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'amenities',
      header: 'Amenities',
      cell: ({ row }) => (
        <div className="max-w-[200px]">
          {row.original.amenities?.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {row.original.amenities.slice(0, 2).map((amenity: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {amenity}
                </Badge>
              ))}
              {row.original.amenities.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{row.original.amenities.length - 2}
                </Badge>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">None</span>
          )}
        </div>
      ),
    },
  ], [])

  // Assignment columns for table
  const assignmentColumns: ColumnDef<any>[] = React.useMemo(() => [
    {
      accessorKey: 'staff',
      header: 'Staff Member',
      cell: ({ row }) => {
        const staff = row.original.staff
        return staff ? (
          <div>
            <div className="font-medium">{staff.firstName} {staff.lastName}</div>
            <div className="text-sm text-muted-foreground">{staff.employeeId}</div>
          </div>
        ) : (
          <span className="text-muted-foreground">Unknown</span>
        )
      },
    },
    {
      accessorKey: 'room',
      header: 'Room',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.room?.roomNumber || 'N/A'}</div>
      ),
    },
    {
      accessorKey: 'startDate',
      header: createSortableHeader('Start Date', 'startDate'),
      cell: ({ row }) => (
        <div>{format(new Date(row.original.startDate), 'MMM dd, yyyy')}</div>
      ),
    },
    {
      accessorKey: 'endDate',
      header: 'End Date',
      cell: ({ row }) => (
        <div>
          {row.original.endDate 
            ? format(new Date(row.original.endDate), 'MMM dd, yyyy')
            : 'Ongoing'
          }
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        const variant = status === 'active' ? 'default' : 
                      status === 'pending' ? 'secondary' : 
                      status === 'completed' ? 'outline' : 'destructive'
        
        return (
          <Badge variant={variant} className="capitalize">
            {status}
          </Badge>
        )
      },
    },
  ], [])

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{property.name}</h2>
            <div className="flex items-center text-muted-foreground mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {property.address}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge 
            variant={property.status === 'active' ? 'default' : 'secondary'}
            className="capitalize"
          >
            {property.status}
          </Badge>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {onManageRooms && (
            <Button variant="outline" size="sm" onClick={onManageRooms}>
              <Settings className="h-4 w-4 mr-2" />
              Manage Rooms
            </Button>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Property Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Capacity</div>
              <div className="text-2xl font-semibold">{property.totalCapacity}</div>
              <div className="text-xs text-muted-foreground">beds</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="text-lg font-medium capitalize">{property.status}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Created</div>
              <div className="text-lg font-medium">
                {format(new Date(property.createdAt), 'MMM dd, yyyy')}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Last Updated</div>
              <div className="text-lg font-medium">
                {format(new Date(property.updatedAt), 'MMM dd, yyyy')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      {metrics && (
        <KPIGrid columns={4} className="mb-6">
          <KPICard
            title="Total Rooms"
            value={metrics.totalRooms}
            icon={Building}
          />
          <KPICard
            title="Available Rooms"
            value={metrics.availableRooms}
            variant="success"
          />
          <KPICard
            title="Occupied Rooms"
            value={metrics.occupiedRooms}
            variant="default"
          />
          <KPICard
            title="Occupancy Rate"
            value={`${Math.round(metrics.occupancyRate)}%`}
            description="current occupancy"
          />
        </KPIGrid>
      )}

      {/* Detailed Information */}
      <Tabs defaultValue="rooms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="assignments">Current Assignments</TabsTrigger>
          <TabsTrigger value="history">Assignment History</TabsTrigger>
        </TabsList>

        <TabsContent value="rooms">
          <Card>
            <CardHeader>
              <CardTitle>Rooms</CardTitle>
              <CardDescription>
                All rooms in this property and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {roomsLoading ? (
                <LoadingSpinner />
              ) : (
                <DataTable
                  columns={roomColumns}
                  data={rooms || []}
                  searchKey="roomNumber"
                  emptyMessage="No rooms found for this property."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Current Assignments</CardTitle>
              <CardDescription>
                Active room assignments for this property
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignmentsLoading ? (
                <LoadingSpinner />
              ) : (
                <DataTable
                  columns={assignmentColumns}
                  data={assignments?.filter(a => a.status === 'active') || []}
                  searchKey="staff.firstName"
                  emptyMessage="No active assignments for this property."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Assignment History</CardTitle>
              <CardDescription>
                All room assignments for this property
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignmentsLoading ? (
                <LoadingSpinner />
              ) : (
                <DataTable
                  columns={assignmentColumns}
                  data={assignments || []}
                  searchKey="staff.firstName"
                  emptyMessage="No assignment history for this property."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}