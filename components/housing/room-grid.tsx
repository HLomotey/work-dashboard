'use client'

import * as React from 'react'
import { Bed, Users, Settings, Plus, Eye, Edit, UserPlus } from 'lucide-react'

import type { Room, RoomWithAssignments, RoomStatus } from '@/lib/types/housing'
import { useRooms } from '@/hooks/use-housing'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Modal, 
  useModal, 
  SearchInput, 
  LoadingSpinner,
  KPICard,
  KPIGrid 
} from '@/components/shared'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface RoomGridProps {
  propertyId?: string
  onRoomSelect?: (room: Room) => void
  onAssignRoom?: (room: Room) => void
  showActions?: boolean
  className?: string
}

export function RoomGrid({
  propertyId,
  onRoomSelect,
  onAssignRoom,
  showActions = true,
  className,
}: RoomGridProps) {
  const [filters, setFilters] = React.useState<{
    search?: string
    status?: RoomStatus | 'all'
  }>({})

  const { rooms, isLoading, error } = useRooms(propertyId, filters)

  // Handle search
  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }))
  }

  // Handle status filter
  const handleStatusFilter = (status: RoomStatus | 'all') => {
    setFilters(prev => ({
      ...prev,
      status: status === 'all' ? undefined : status
    }))
  }

  // Calculate metrics
  const metrics = React.useMemo(() => {
    if (!rooms) return null

    const total = rooms.length
    const available = rooms.filter(r => r.status === 'available').length
    const occupied = rooms.filter(r => r.status === 'occupied').length
    const maintenance = rooms.filter(r => r.status === 'maintenance').length
    const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0)
    const occupancyRate = total > 0 ? (occupied / total) * 100 : 0

    return { total, available, occupied, maintenance, totalCapacity, occupancyRate }
  }, [rooms])

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            Error loading rooms: {error.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      {/* Metrics */}
      {metrics && (
        <KPIGrid columns={4} className="mb-6">
          <KPICard
            title="Total Rooms"
            value={metrics.total}
            icon={Bed}
          />
          <KPICard
            title="Available"
            value={metrics.available}
            variant="success"
          />
          <KPICard
            title="Occupied"
            value={metrics.occupied}
            variant="default"
          />
          <KPICard
            title="Occupancy Rate"
            value={`${Math.round(metrics.occupancyRate)}%`}
            description="current occupancy"
          />
        </KPIGrid>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Rooms</CardTitle>
              <CardDescription>
                Manage rooms and their availability
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 max-w-sm">
              <SearchInput
                placeholder="Search rooms..."
                onValueChange={handleSearch}
              />
            </div>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => handleStatusFilter(value as RoomStatus | 'all')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="out_of_order">Out of Order</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Room Grid */}
          {isLoading ? (
            <LoadingSpinner />
          ) : rooms && rooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onSelect={onRoomSelect}
                  onAssign={onAssignRoom}
                  showActions={showActions}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No rooms found
              </h3>
              <p className="text-sm text-muted-foreground">
                {filters.search || filters.status 
                  ? 'Try adjusting your filters to see more rooms.'
                  : 'Add rooms to this property to get started.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Individual Room Card Component
interface RoomCardProps {
  room: Room
  onSelect?: (room: Room) => void
  onAssign?: (room: Room) => void
  showActions?: boolean
  className?: string
}

function RoomCard({
  room,
  onSelect,
  onAssign,
  showActions = true,
  className,
}: RoomCardProps) {
  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'occupied':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'out_of_order':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: RoomStatus) => {
    switch (status) {
      case 'available':
        return '✓'
      case 'occupied':
        return '👤'
      case 'maintenance':
        return '🔧'
      case 'out_of_order':
        return '❌'
      default:
        return '?'
    }
  }

  const isAvailable = room.status === 'available'
  const currentOccupancy = 0 // This would come from assignments data
  const occupancyPercentage = (currentOccupancy / room.capacity) * 100

  return (
    <Card 
      className={cn(
        'hover:shadow-md transition-all cursor-pointer',
        isAvailable && 'hover:border-green-300',
        className
      )}
      onClick={() => onSelect?.(room)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bed className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-lg">{room.roomNumber}</CardTitle>
          </div>
          <div className={cn(
            'px-2 py-1 rounded-full text-xs font-medium border',
            getStatusColor(room.status)
          )}>
            <span className="mr-1">{getStatusIcon(room.status)}</span>
            {room.status.replace('_', ' ')}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Capacity */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Capacity</span>
          <div className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span className="font-medium">{room.capacity} beds</span>
          </div>
        </div>

        {/* Occupancy Progress */}
        {room.status === 'occupied' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Occupancy</span>
              <span>{currentOccupancy}/{room.capacity}</span>
            </div>
            <Progress value={occupancyPercentage} className="h-1" />
          </div>
        )}

        {/* Amenities */}
        {room.amenities && room.amenities.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Amenities</div>
            <div className="flex flex-wrap gap-1">
              {room.amenities.slice(0, 3).map((amenity, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {amenity}
                </Badge>
              ))}
              {room.amenities.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{room.amenities.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onSelect?.(room)
              }}
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            
            {isAvailable && onAssign && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onAssign(room)
                }}
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Assign
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}