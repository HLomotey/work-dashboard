'use client'

import { Car, Users, Calendar, TrendingUp, Wrench } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { VehicleStatus, type Vehicle, type VehicleWithTrips } from '@/lib/supabase/types/vehicle'

interface VehicleCardProps {
  vehicle: VehicleWithTrips
  onSelect?: () => void
  onEdit?: () => void
  showMetrics?: boolean
  className?: string
}

export function VehicleCard({
  vehicle,
  onSelect,
  onEdit,
  showMetrics = true,
  className = '',
}: VehicleCardProps) {
  const getStatusColor = (status: VehicleStatus) => {
    switch (status) {
      case VehicleStatus.ACTIVE:
        return 'bg-green-100 text-green-800 border-green-200'
      case VehicleStatus.INACTIVE:
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case VehicleStatus.MAINTENANCE:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case VehicleStatus.OUT_OF_SERVICE:
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: VehicleStatus) => {
    switch (status) {
      case VehicleStatus.MAINTENANCE:
        return <Wrench className="h-3 w-3" />
      default:
        return <Car className="h-3 w-3" />
    }
  }

  const utilizationRate = vehicle.utilizationRate || 0
  const utilizationColor = utilizationRate >= 80 ? 'text-green-600' : 
                          utilizationRate >= 60 ? 'text-yellow-600' : 'text-red-600'

  return (
    <Card className={`hover:shadow-md transition-shadow cursor-pointer ${className}`} onClick={onSelect}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Car className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle className="text-lg">
                {vehicle.make} {vehicle.model}
              </CardTitle>
              <p className="text-sm text-gray-600 font-mono">
                {vehicle.registration}
              </p>
            </div>
          </div>
          
          <Badge className={getStatusColor(vehicle.status)}>
            <div className="flex items-center space-x-1">
              {getStatusIcon(vehicle.status)}
              <span className="text-xs">
                {vehicle.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span>{vehicle.capacity} seats</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{vehicle.year}</span>
          </div>
        </div>

        {/* Metrics */}
        {showMetrics && (
          <div className="space-y-3 pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Utilization Rate</span>
              <span className={`text-sm font-semibold ${utilizationColor}`}>
                {utilizationRate.toFixed(1)}%
              </span>
            </div>
            <Progress value={utilizationRate} className="h-2" />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Total Trips</div>
                <div className="font-semibold">{vehicle.totalTrips || 0}</div>
              </div>
              <div>
                <div className="text-gray-600">Distance</div>
                <div className="font-semibold">
                  {vehicle.totalDistance ? `${vehicle.totalDistance.toFixed(0)} km` : '0 km'}
                </div>
              </div>
            </div>

            {vehicle.totalCost && (
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-gray-600">Total Cost</span>
                <span className="text-sm font-semibold">
                  ${vehicle.totalCost.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation()
              onSelect?.()
            }}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            View Details
          </Button>
          {onEdit && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
            >
              Edit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
