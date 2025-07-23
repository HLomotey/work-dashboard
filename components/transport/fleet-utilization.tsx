'use client'

import { useState } from 'react'
import { Car, TrendingUp, Users, MapPin, Clock, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
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
import { useVehicleUtilization, useVehicles } from '@/hooks/use-transport'
import { VehicleStatus, type VehicleUtilization } from '@/lib/types/transport'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'

interface FleetUtilizationProps {
  className?: string
}

export function FleetUtilization({ className = '' }: FleetUtilizationProps) {
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  })
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('all')

  const { vehicles } = useVehicles()
  const { utilization: vehicleUtilization, isLoading } = useVehicleUtilization(
    selectedVehicleId === 'all' ? undefined : selectedVehicleId,
    dateRange
  )

  const handleDateRangeChange = (range: string) => {
    const now = new Date()
    let start: Date, end: Date

    switch (range) {
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

  // Calculate fleet-wide metrics
  const activeVehicles = vehicles?.filter(v => v.status === VehicleStatus.ACTIVE) || []
  const totalCapacity = activeVehicles.reduce((sum: number, v) => sum + v.capacity, 0)
  const averageUtilization = vehicleUtilization && vehicleUtilization.length > 0
    ? vehicleUtilization.reduce((sum: number, v) => sum + v.utilizationRate, 0) / vehicleUtilization.length
    : 0

  const getUtilizationColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600'
    if (rate >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getUtilizationBadge = (rate: number) => {
    if (rate >= 80) return <Badge className="bg-green-100 text-green-800">High</Badge>
    if (rate >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
    return <Badge className="bg-red-100 text-red-800">Low</Badge>
  }

  const getStatusBadge = (status: VehicleStatus) => {
    const variants = {
      [VehicleStatus.ACTIVE]: 'default',
      [VehicleStatus.INACTIVE]: 'secondary',
      [VehicleStatus.MAINTENANCE]: 'destructive',
      [VehicleStatus.OUT_OF_SERVICE]: 'outline',
    } as const

    return (
      <Badge variant={variants[status]} className="text-xs">
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-8">Loading fleet utilization data...</div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fleet Utilization</h2>
          <p className="text-gray-600">
            Vehicle usage and load factor analysis for {format(dateRange.start, 'MMM dd')} - {format(dateRange.end, 'MMM dd, yyyy')}
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Select onValueChange={setSelectedVehicleId} defaultValue="all">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select vehicle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vehicles</SelectItem>
              {vehicles?.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.make} {vehicle.model} ({vehicle.registration})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select onValueChange={handleDateRangeChange} defaultValue="month">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Fleet Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Fleet</CardTitle>
            <Car className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeVehicles.length}</div>
            <p className="text-xs text-gray-600 mt-1">
              {totalCapacity} total seats
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getUtilizationColor(averageUtilization)}`}>
              {averageUtilization.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Fleet-wide average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            <MapPin className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicleUtilization?.reduce((sum: number, v) => sum + v.tripsCount, 0) || 0}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Across all vehicles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(vehicleUtilization?.reduce((sum: number, v) => sum + v.totalDistance, 0) || 0).toFixed(0)} km
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Fleet total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Vehicle Utilization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Car className="h-5 w-5 text-blue-600" />
            <span>Vehicle Utilization Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!vehicleUtilization || vehicleUtilization.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No utilization data available for the selected period.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Trips</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Passengers</TableHead>
                  <TableHead>Load Factor</TableHead>
                  <TableHead>Maintenance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicleUtilization.map((util: VehicleUtilization) => (
                  <TableRow key={util.vehicleId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {util.vehicle.make} {util.vehicle.model}
                        </div>
                        <div className="text-sm text-gray-600 font-mono">
                          {util.vehicle.registration}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {getStatusBadge(util.vehicle.status)}
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold ${getUtilizationColor(util.utilizationRate)}`}>
                            {util.utilizationRate.toFixed(1)}%
                          </span>
                          {getUtilizationBadge(util.utilizationRate)}
                        </div>
                        <Progress value={util.utilizationRate} className="h-2" />
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{util.tripsCount}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="font-medium">
                        {util.totalDistance.toFixed(1)} km
                      </div>
                      <div className="text-xs text-gray-600">
                        {util.tripsCount > 0 ? (util.totalDistance / util.tripsCount).toFixed(1) : '0'} km/trip
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{util.totalPassengers}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {util.tripsCount > 0 ? (util.totalPassengers / util.tripsCount).toFixed(1) : '0'} avg/trip
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className={`font-semibold ${getUtilizationColor(util.averageLoadFactor)}`}>
                          {util.averageLoadFactor.toFixed(1)}%
                        </div>
                        <Progress value={util.averageLoadFactor} className="h-1" />
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{util.maintenanceHours}h</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Utilization Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Utilization Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'High Utilization (≥80%)', count: vehicleUtilization?.filter((v) => v.utilizationRate >= 80).length || 0, color: 'bg-green-500' },
                { label: 'Medium Utilization (60-79%)', count: vehicleUtilization?.filter((v) => v.utilizationRate >= 60 && v.utilizationRate < 80).length || 0, color: 'bg-yellow-500' },
                { label: 'Low Utilization (<60%)', count: vehicleUtilization?.filter((v) => v.utilizationRate < 60).length || 0, color: 'bg-red-500' },
              ].map((category) => {
                const percentage = vehicleUtilization && vehicleUtilization.length > 0 
                  ? (category.count / vehicleUtilization.length) * 100 
                  : 0

                return (
                  <div key={category.label} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{category.label}</span>
                      <span className="text-sm text-gray-600">{category.count} vehicles</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${category.color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 text-right">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Top Performer</span>
                </div>
                <div className="text-sm text-blue-700">
                  {vehicleUtilization && vehicleUtilization.length > 0 ? (
                    <>
                      <strong>
                        {vehicleUtilization.reduce((prev: VehicleUtilization, current: VehicleUtilization) => 
                          prev.utilizationRate > current.utilizationRate ? prev : current
                        ).vehicle.make} {vehicleUtilization.reduce((prev: VehicleUtilization, current: VehicleUtilization) => 
                          prev.utilizationRate > current.utilizationRate ? prev : current
                        ).vehicle.model}
                      </strong>
                      <br />
                      {vehicleUtilization.reduce((prev: VehicleUtilization, current: VehicleUtilization) => 
                        prev.utilizationRate > current.utilizationRate ? prev : current
                      ).utilizationRate.toFixed(1)}% utilization rate
                    </>
                  ) : (
                    'No data available'
                  )}
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Capacity Optimization</span>
                </div>
                <div className="text-sm text-yellow-700">
                  Fleet average load factor: {averageUtilization.toFixed(1)}%
                  <br />
                  {averageUtilization < 70 ? 'Consider route consolidation' : 'Good capacity utilization'}
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Efficiency Score</span>
                </div>
                <div className="text-sm text-green-700">
                  Overall fleet efficiency: {averageUtilization >= 70 ? 'Excellent' : averageUtilization >= 50 ? 'Good' : 'Needs Improvement'}
                  <br />
                  {activeVehicles.length} vehicles actively serving routes
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
