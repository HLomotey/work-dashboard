'use client'

import * as React from 'react'
import { Building, MapPin, Users, Settings, Eye, Edit } from 'lucide-react'

import type { Property } from '@/lib/types/housing'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface PropertyCardProps {
  property: Property
  occupancyRate?: number
  availableCapacity?: number
  onView?: (property: Property) => void
  onEdit?: (property: Property) => void
  onManageRooms?: (property: Property) => void
  showActions?: boolean
  className?: string
}

export function PropertyCard({
  property,
  occupancyRate = 0,
  availableCapacity = property.totalCapacity,
  onView,
  onEdit,
  onManageRooms,
  showActions = true,
  className,
}: PropertyCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'maintenance':
        return 'secondary'
      case 'inactive':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600'
      case 'maintenance':
        return 'text-yellow-600'
      case 'inactive':
        return 'text-gray-600'
      default:
        return 'text-gray-600'
    }
  }

  const occupiedBeds = property.totalCapacity - availableCapacity
  const occupancyPercentage = Math.round(occupancyRate)

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg">{property.name}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                {property.address}
              </CardDescription>
            </div>
          </div>
          <Badge variant={getStatusVariant(property.status)} className="capitalize">
            {property.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Capacity Information */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Occupancy</span>
            <span className="font-medium">
              {occupiedBeds} / {property.totalCapacity} beds
            </span>
          </div>
          <Progress value={occupancyPercentage} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{occupancyPercentage}% occupied</span>
            <span>{availableCapacity} available</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="text-lg font-semibold">{property.totalCapacity}</div>
            <div className="text-xs text-muted-foreground">Total Beds</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">{availableCapacity}</div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">{occupiedBeds}</div>
            <div className="text-xs text-muted-foreground">Occupied</div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-2">
              {onView && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(property)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(property)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
            {onManageRooms && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onManageRooms(property)}
              >
                <Settings className="h-4 w-4 mr-1" />
                Manage Rooms
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Property Grid Layout
interface PropertyGridProps {
  properties: Property[]
  occupancyData?: Record<string, { occupancyRate: number; availableCapacity: number }>
  onView?: (property: Property) => void
  onEdit?: (property: Property) => void
  onManageRooms?: (property: Property) => void
  showActions?: boolean
  className?: string
  columns?: 1 | 2 | 3 | 4
}

export function PropertyGrid({
  properties,
  occupancyData = {},
  onView,
  onEdit,
  onManageRooms,
  showActions = true,
  className,
  columns = 3,
}: PropertyGridProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          No properties found
        </h3>
        <p className="text-sm text-muted-foreground">
          Add your first property to get started with housing management.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('grid gap-6', columnClasses[columns], className)}>
      {properties.map((property) => {
        const occupancy = occupancyData[property.id] || {
          occupancyRate: 0,
          availableCapacity: property.totalCapacity,
        }

        return (
          <PropertyCard
            key={property.id}
            property={property}
            occupancyRate={occupancy.occupancyRate}
            availableCapacity={occupancy.availableCapacity}
            onView={onView}
            onEdit={onEdit}
            onManageRooms={onManageRooms}
            showActions={showActions}
          />
        )
      })}
    </div>
  )
}