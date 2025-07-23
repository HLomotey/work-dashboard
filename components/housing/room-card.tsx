'use client'

import * as React from 'react'
import { Bed, Users, Settings, Edit, Eye, UserPlus, Wrench } from 'lucide-react'

import type { Room, RoomStatus } from '@/lib/types/housing'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface RoomCardProps {
  room: Room
  currentOccupancy?: number
  onView?: (room: Room) => void
  onEdit?: (room: Room) => void
  onAssign?: (room: Room) => void
  onMaintenance?: (room: Room) => void
  showActions?: boolean
  compact?: boolean
  className?: string
}

export function RoomCard({
  room,
  currentOccupancy = 0,
  onView,
  onEdit,
  onAssign,
  onMaintenance,
  showActions = true,
  compact = false,
  className,
}: RoomCardProps) {
  const getStatusVariant = (status: RoomStatus) => {
    switch (status) {
      case 'available':
        return 'default'
      case 'occupied':
        return 'secondary'
      case 'maintenance':
        return 'outline'
      case 'out_of_order':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case 'available':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'occupied':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'out_of_order':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const occupancyPercentage = room.capacity > 0 ? (currentOccupancy / room.capacity) * 100 : 0
  const isAvailable = room.status === 'available'
  const isOccupied = room.status === 'occupied'
  const availableSpots = room.capacity - currentOccupancy

  return (
    <Card className={cn(
      'hover:shadow-md transition-all',
      isAvailable && 'hover:border-green-300',
      className
    )}>
      <CardHeader className={cn('pb-3', compact && 'pb-2')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bed className="h-4 w-4 text-muted-foreground" />
            <CardTitle className={cn('text-lg', compact && 'text-base')}>
              Room {room.roomNumber}
            </CardTitle>
          </div>
          <Badge 
            className={cn('capitalize', getStatusColor(room.status))}
            variant="outline"
          >
            {room.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Capacity Information */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Capacity</span>
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span className="font-medium">{room.capacity} beds</span>
            </div>
          </div>

          {/* Occupancy Progress for occupied rooms */}
          {isOccupied && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Occupancy</span>
                <span className="font-medium">
                  {currentOccupancy}/{room.capacity}
                </span>
              </div>
              <Progress value={occupancyPercentage} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {availableSpots} spot{availableSpots !== 1 ? 's' : ''} available
              </div>
            </div>
          )}

          {/* Available spots for available rooms */}
          {isAvailable && (
            <div className="text-sm text-green-600 font-medium">
              All {room.capacity} spots available
            </div>
          )}
        </div>

        {/* Amenities */}
        {!compact && room.amenities && room.amenities.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Amenities</div>
            <div className="flex flex-wrap gap-1">
              {room.amenities.slice(0, 3).map((amenity, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {amenity}
                </Badge>
              ))}
              {room.amenities.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{room.amenities.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {!compact && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t text-center">
            <div>
              <div className="text-sm font-semibold text-green-600">
                {availableSpots}
              </div>
              <div className="text-xs text-muted-foreground">Available</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-blue-600">
                {currentOccupancy}
              </div>
              <div className="text-xs text-muted-foreground">Occupied</div>
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-1">
              {onView && (
                <Button variant="ghost" size="sm" onClick={() => onView(room)}>
                  <Eye className="h-3 w-3 mr-1" />
                  {compact ? '' : 'View'}
                </Button>
              )}
              {onEdit && (
                <Button variant="ghost" size="sm" onClick={() => onEdit(room)}>
                  <Edit className="h-3 w-3 mr-1" />
                  {compact ? '' : 'Edit'}
                </Button>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              {isAvailable && onAssign && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAssign(room)}
                >
                  <UserPlus className="h-3 w-3 mr-1" />
                  {compact ? '' : 'Assign'}
                </Button>
              )}
              
              {room.status !== 'maintenance' && onMaintenance && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMaintenance(room)}
                >
                  <Wrench className="h-3 w-3 mr-1" />
                  {compact ? '' : 'Maintenance'}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Room Status Summary Card
interface RoomStatusSummaryProps {
  rooms: Room[]
  className?: string
}

export function RoomStatusSummary({ rooms, className }: RoomStatusSummaryProps) {
  const summary = React.useMemo(() => {
    const total = rooms.length
    const available = rooms.filter(r => r.status === 'available').length
    const occupied = rooms.filter(r => r.status === 'occupied').length
    const maintenance = rooms.filter(r => r.status === 'maintenance').length
    const outOfOrder = rooms.filter(r => r.status === 'out_of_order').length

    return { total, available, occupied, maintenance, outOfOrder }
  }, [rooms])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Room Status Summary</CardTitle>
        <CardDescription>Overview of all room statuses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{summary.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{summary.available}</div>
            <div className="text-sm text-muted-foreground">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{summary.occupied}</div>
            <div className="text-sm text-muted-foreground">Occupied</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{summary.maintenance}</div>
            <div className="text-sm text-muted-foreground">Maintenance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{summary.outOfOrder}</div>
            <div className="text-sm text-muted-foreground">Out of Order</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}