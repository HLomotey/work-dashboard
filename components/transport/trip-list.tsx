'use client'

import { useState } from 'react'
import { Search, Filter, Calendar, MapPin, Users, MoreHorizontal, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTrips, useVehicles } from '@/hooks/use-transport'
import { TripStatus, type Trip, type TransportFilters } from '@/lib/types/transport'
import { format } from 'date-fns'

interface TripListProps {
  vehicleId?: string
  onTripSelect?: (tripId: string) => void
  onTripEdit?: (tripId: string) => void
  onTripDelete?: (tripId: string) => void
  onAddTrip?: () => void
  showVehicleColumn?: boolean
}

export function TripList({
  vehicleId,
  onTripSelect,
  onTripEdit,
  onTripDelete,
  onAddTrip,
  showVehicleColumn = true,
}: TripListProps) {
  const [filters, setFilters] = useState<TransportFilters>({
    vehicleId,
  })
  
  const { trips, isLoading, error } = useTrips(filters)
  const { vehicles } = useVehicles()

  const handleSearchChange = (search: string) => {
    setFilters((prev: TransportFilters) => ({ ...prev, search: search || undefined }))
  }

  const handleStatusFilter = (status: string) => {
    setFilters((prev: TransportFilters) => ({
      ...prev,
      status: status === 'all' ? undefined : (status as TripStatus)
    }))
  }

  const handleVehicleFilter = (vehicleId: string) => {
    setFilters((prev: TransportFilters) => ({
      ...prev,
      vehicleId: vehicleId === 'all' ? undefined : vehicleId
    }))
  }

  const getStatusBadge = (status: TripStatus) => {
    const variants = {
      [TripStatus.SCHEDULED]: 'outline',
      [TripStatus.IN_PROGRESS]: 'default',
      [TripStatus.COMPLETED]: 'secondary',
      [TripStatus.CANCELLED]: 'destructive',
    } as const

    return (
      <Badge variant={variants[status]}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles?.find(v => v.id === vehicleId)
    return vehicle ? `${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle'
  }

  const getLoadFactor = (passengerCount: number, vehicleId: string) => {
    const vehicle = vehicles?.find(v => v.id === vehicleId)
    if (!vehicle) return 0
    return (passengerCount / vehicle.capacity) * 100
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading trips: {error.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {vehicleId ? 'Vehicle Trips' : 'Trip Log'}
          </CardTitle>
          <Button onClick={onAddTrip}>
            <Plus className="h-4 w-4 mr-2" />
            Log Trip
          </Button>
        </div>
        
        {/* Filters */}
        <div className="flex gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search routes..."
              className="pl-10"
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          
          <Select onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value={TripStatus.SCHEDULED}>Scheduled</SelectItem>
              <SelectItem value={TripStatus.IN_PROGRESS}>In Progress</SelectItem>
              <SelectItem value={TripStatus.COMPLETED}>Completed</SelectItem>
              <SelectItem value={TripStatus.CANCELLED}>Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {showVehicleColumn && !vehicleId && (
            <Select onValueChange={handleVehicleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by vehicle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vehicles</SelectItem>
                {vehicles?.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.make} {vehicle.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading trips...</div>
        ) : !trips || trips.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No trips found. {onAddTrip && (
              <Button variant="link" onClick={onAddTrip} className="p-0 ml-1">
                Log your first trip
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                {showVehicleColumn && !vehicleId && <TableHead>Vehicle</TableHead>}
                <TableHead>Route</TableHead>
                <TableHead>Passengers</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trips.map((trip) => {
                const loadFactor = getLoadFactor(trip.passengerCount, trip.vehicleId)
                const loadFactorColor = loadFactor >= 90 ? 'text-red-600' : 
                                      loadFactor >= 70 ? 'text-yellow-600' : 'text-green-600'
                
                return (
                  <TableRow
                    key={trip.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => onTripSelect?.(trip.id)}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">
                            {format(new Date(trip.date), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(trip.date), 'HH:mm')}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    {showVehicleColumn && !vehicleId && (
                      <TableCell>
                        <div className="text-sm">
                          {getVehicleName(trip.vehicleId)}
                        </div>
                      </TableCell>
                    )}
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{trip.route}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{trip.passengerCount}</div>
                          <div className={`text-xs ${loadFactorColor}`}>
                            {loadFactor.toFixed(0)}% load
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {trip.distance ? `${trip.distance.toFixed(1)} km` : '-'}
                    </TableCell>
                    
                    <TableCell>
                      {trip.cost ? `$${trip.cost.toFixed(2)}` : '-'}
                    </TableCell>
                    
                    <TableCell>
                      {getStatusBadge(trip.status)}
                    </TableCell>
                    
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onTripSelect?.(trip.id)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onTripEdit?.(trip.id)}>
                            Edit Trip
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onTripDelete?.(trip.id)}
                            className="text-red-600"
                          >
                            Delete Trip
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
