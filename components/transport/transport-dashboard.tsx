'use client'

import { useState } from 'react'
import { Car, Users, MapPin, DollarSign, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTransportAnalytics, useVehicles, useTrips } from '@/hooks/use-transport'
import { VehicleStatus, TripStatus } from '@/lib/types/transport'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'

interface TransportDashboardProps {
  className?: string
}

export function TransportDashboard({ className = '' }: TransportDashboardProps) {
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  })

  const { vehicles } = useVehicles()
  const { trips } = useTrips()
  const { analytics, isLoading } = useTransportAnalytics(dateRange)

  // Calculate key metrics
  const activeVehicles = vehicles?.filter(v => v.status === VehicleStatus.ACTIVE).length || 0
  const totalVehicles = vehicles?.length || 0
  const maintenanceVehicles = vehicles?.filter(v => v.status === VehicleStatus.MAINTENANCE).length || 0
  
  const completedTrips = trips?.filter(t => t.status === TripStatus.COMPLETED).length || 0
  const scheduledTrips = trips?.filter(t => t.status === TripStatus.SCHEDULED).length || 0
  const inProgressTrips = trips?.filter(t => t.status === TripStatus.IN_PROGRESS).length || 0

  const totalDistance = trips?.reduce((sum, trip) => sum + (trip.distance || 0), 0) || 0
  const totalCost = trips?.reduce((sum, trip) => sum + (trip.cost || 0), 0) || 0
  const totalPassengers = trips?.reduce((sum, trip) => sum + trip.passengerCount, 0) || 0

  // Calculate utilization metrics
  const fleetUtilization = totalVehicles > 0 ? (activeVehicles / totalVehicles) * 100 : 0
  const averageLoadFactor = completedTrips > 0 && vehicles ? 
    (totalPassengers / (completedTrips * (vehicles.reduce((sum, v) => sum + v.capacity, 0) / vehicles.length))) * 100 : 0

  const costPerKm = totalDistance > 0 ? totalCost / totalDistance : 0
  const costPerTrip = completedTrips > 0 ? totalCost / completedTrips : 0

  // Mock trend data (in real implementation, this would come from historical analytics)
  const trends = {
    trips: { value: 12, isPositive: true },
    cost: { value: -8, isPositive: true },
    utilization: { value: 5, isPositive: true },
    efficiency: { value: 15, isPositive: true },
  }

  const handleDateRangeChange = (range: string) => {
    const now = new Date()
    let start: Date, end: Date

    switch (range) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
        break
      case 'week':
        start = subDays(now, 7)
        end = now
        break
      case 'month':
        start = startOfMonth(now)
        end = endOfMonth(now)
        break
      case 'quarter':
        start = subDays(now, 90)
        end = now
        break
      default:
        return
    }

    setDateRange({ start, end })
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-8">Loading transport analytics...</div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transport Dashboard</h2>
          <p className="text-gray-600">
            Fleet utilization and trip analytics for {format(dateRange.start, 'MMM dd')} - {format(dateRange.end, 'MMM dd, yyyy')}
          </p>
        </div>
        
        <Select onValueChange={handleDateRangeChange} defaultValue="month">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Fleet Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fleet Status</CardTitle>
            <Car className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeVehicles}/{totalVehicles}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={fleetUtilization} className="flex-1 h-2" />
              <span className="text-sm text-gray-600">{fleetUtilization.toFixed(0)}%</span>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant={maintenanceVehicles > 0 ? 'destructive' : 'secondary'} className="text-xs">
                {maintenanceVehicles} in maintenance
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Total Trips */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            <MapPin className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTrips + inProgressTrips + scheduledTrips}</div>
            <div className="flex items-center space-x-1 mt-2">
              {trends.trips.isPositive ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={`text-xs ${trends.trips.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trends.trips.isPositive ? '+' : ''}{trends.trips.value}% from last period
              </span>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {completedTrips} completed • {scheduledTrips} scheduled
            </div>
          </CardContent>
        </Card>

        {/* Passengers Transported */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passengers</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPassengers}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={averageLoadFactor} className="flex-1 h-2" />
              <span className="text-sm text-gray-600">{averageLoadFactor.toFixed(0)}%</span>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Average load factor
            </div>
          </CardContent>
        </Card>

        {/* Operating Cost */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operating Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(0)}</div>
            <div className="flex items-center space-x-1 mt-2">
              {trends.cost.isPositive ? (
                <TrendingDown className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingUp className="h-3 w-3 text-red-600" />
              )}
              <span className={`text-xs ${trends.cost.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trends.cost.isPositive ? '' : '+'}{Math.abs(trends.cost.value)}% from last period
              </span>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              ${costPerKm.toFixed(2)}/km • ${costPerTrip.toFixed(2)}/trip
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fleet Utilization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Fleet Utilization</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {vehicles?.slice(0, 5).map((vehicle) => {
              const vehicleTrips = trips?.filter(t => t.vehicleId === vehicle.id).length || 0
              const utilization = totalVehicles > 0 ? (vehicleTrips / (completedTrips || 1)) * 100 : 0
              
              return (
                <div key={vehicle.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{vehicle.make} {vehicle.model}</span>
                      <span className="text-sm text-gray-600 ml-2">({vehicle.registration})</span>
                    </div>
                    <span className="text-sm font-semibold">{utilization.toFixed(0)}%</span>
                  </div>
                  <Progress value={utilization} className="h-2" />
                  <div className="text-xs text-gray-600">
                    {vehicleTrips} trips • {vehicle.capacity} seats
                  </div>
                </div>
              )
            })}
            
            {(!vehicles || vehicles.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No vehicles available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trips?.slice(0, 5).map((trip) => {
                const vehicle = vehicles?.find(v => v.id === trip.vehicleId)
                
                return (
                  <div key={trip.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <Badge variant={
                        trip.status === TripStatus.COMPLETED ? 'secondary' :
                        trip.status === TripStatus.IN_PROGRESS ? 'default' :
                        trip.status === TripStatus.SCHEDULED ? 'outline' : 'destructive'
                      }>
                        {trip.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{trip.route}</div>
                      <div className="text-sm text-gray-600">
                        {vehicle ? `${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle'} • 
                        {trip.passengerCount} passengers
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(trip.date), 'MMM dd')}
                    </div>
                  </div>
                )
              })}
              
              {(!trips || trips.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  No recent trips
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalDistance.toFixed(0)}</div>
              <div className="text-sm text-gray-600">Total Distance (km)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{averageLoadFactor.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Average Load Factor</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">${costPerKm.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Cost per Kilometer</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{fleetUtilization.toFixed(0)}%</div>
              <div className="text-sm text-gray-600">Fleet Utilization</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
