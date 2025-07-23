'use client'

import { useState } from 'react'
import { Car, Calendar, Users, MapPin, TrendingUp, Edit, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Progress } from '@/components/ui/progress'
import { useVehicles, useTrips } from '@/hooks/use-transport'
import { VehicleStatus, TripStatus, type VehicleWithTrips } from '@/lib/types/transport'
import { format } from 'date-fns'

interface VehicleDetailsProps {
  vehicleId: string
  onEdit?: () => void
  onClose?: () => void
}

export function VehicleDetails({ vehicleId, onEdit, onClose }: VehicleDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const { vehicles, isLoading: vehiclesLoading } = useVehicles()
  const { trips, isLoading: tripsLoading } = useTrips({ vehicleId })

  const vehicle = vehicles?.find(v => v.id === vehicleId) as VehicleWithTrips | undefined

  if (vehiclesLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading vehicle details...</div>
        </CardContent>
      </Card>
    )
  }

  if (!vehicle) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">Vehicle not found</div>
        </CardContent>
      </Card>
    )
  }

  const getStatusBadge = (status: VehicleStatus) => {
    const variants = {
      [VehicleStatus.ACTIVE]: 'default',
      [VehicleStatus.INACTIVE]: 'secondary',
      [VehicleStatus.MAINTENANCE]: 'destructive',
      [VehicleStatus.OUT_OF_SERVICE]: 'outline',
    } as const

    return (
      <Badge variant={variants[status]}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  const getTripStatusBadge = (status: TripStatus) => {
    const variants = {
      [TripStatus.SCHEDULED]: 'outline',
      [TripStatus.IN_PROGRESS]: 'default',
      [TripStatus.COMPLETED]: 'secondary',
      [TripStatus.CANCELLED]: 'destructive',
    } as const

    return (
      <Badge variant={variants[status]} className="text-xs">
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  const utilizationRate = vehicle.utilizationRate || 0
  const utilizationColor = utilizationRate >= 80 ? 'text-green-600' : 
                          utilizationRate >= 60 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Car className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl">
                  {vehicle.make} {vehicle.model}
                </CardTitle>
                <p className="text-sm text-gray-600 font-mono">
                  Registration: {vehicle.registration}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {getStatusBadge(vehicle.status)}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Vehicle
                  </DropdownMenuItem>
                  {onClose && (
                    <DropdownMenuItem onClick={onClose}>
                      Close Details
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{vehicle.capacity}</div>
              <div className="text-sm text-gray-600">Passenger Capacity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{vehicle.year}</div>
              <div className="text-sm text-gray-600">Model Year</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{vehicle.totalTrips || 0}</div>
              <div className="text-sm text-gray-600">Total Trips</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {vehicle.totalDistance ? `${vehicle.totalDistance.toFixed(0)}` : '0'}
              </div>
              <div className="text-sm text-gray-600">Total Distance (km)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trips">Trip History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Utilization Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Utilization Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Utilization Rate</span>
                    <span className={`text-sm font-semibold ${utilizationColor}`}>
                      {utilizationRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={utilizationRate} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Average Load</div>
                    <div className="font-semibold">
                      {vehicle.totalTrips && vehicle.capacity 
                        ? `${((vehicle.totalTrips * 0.7) / vehicle.capacity * 100).toFixed(1)}%`
                        : 'N/A'
                      }
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Cost per Trip</div>
                    <div className="font-semibold">
                      {vehicle.totalCost && vehicle.totalTrips
                        ? `$${(vehicle.totalCost / vehicle.totalTrips).toFixed(2)}`
                        : 'N/A'
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Financial Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Operating Cost</span>
                    <span className="font-semibold">
                      ${vehicle.totalCost?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cost per Kilometer</span>
                    <span className="font-semibold">
                      {vehicle.totalDistance && vehicle.totalCost
                        ? `$${(vehicle.totalCost / vehicle.totalDistance).toFixed(2)}`
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Monthly Average</span>
                    <span className="font-semibold">
                      {vehicle.totalCost
                        ? `$${(vehicle.totalCost / 12).toFixed(2)}`
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trip History Tab */}
        <TabsContent value="trips">
          <Card>
            <CardHeader>
              <CardTitle>Recent Trips</CardTitle>
            </CardHeader>
            <CardContent>
              {tripsLoading ? (
                <div className="text-center py-8">Loading trip history...</div>
              ) : !trips || trips.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No trips recorded for this vehicle
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Passengers</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trips.slice(0, 10).map((trip) => (
                      <TableRow key={trip.id}>
                        <TableCell>
                          {format(new Date(trip.date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span>{trip.route}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3 text-gray-400" />
                            <span>{trip.passengerCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {trip.distance ? `${trip.distance.toFixed(1)} km` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {getTripStatusBadge(trip.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Performance charts will be displayed here</p>
                  <p className="text-sm">Integration with recharts pending</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Maintenance Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <div className="font-medium">Next Service Due</div>
                      <div className="text-sm text-gray-600">Estimated based on usage</div>
                    </div>
                    <Badge variant="outline">Upcoming</Badge>
                  </div>
                  
                  <div className="text-sm text-gray-500 text-center py-4">
                    Maintenance tracking features coming soon
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
