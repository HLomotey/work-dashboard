'use client'

import { useState } from 'react'
import { Search, Plus, Filter, MoreHorizontal } from 'lucide-react'
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
import { useVehicles } from '@/hooks/use-transport'
import { VehicleStatus, type TransportFilters } from '@/lib/types/transport'

interface VehicleListProps {
  onVehicleSelect?: (vehicleId: string) => void
  onVehicleEdit?: (vehicleId: string) => void
  onVehicleDelete?: (vehicleId: string) => void
  onAddVehicle?: () => void
}

export function VehicleList({
  onVehicleSelect,
  onVehicleEdit,
  onVehicleDelete,
  onAddVehicle,
}: VehicleListProps) {
  const [filters, setFilters] = useState<TransportFilters>({})
  const { vehicles, isLoading, error } = useVehicles(filters)

  const handleSearchChange = (search: string) => {
    setFilters(prev => ({ ...prev, search: search || undefined }))
  }

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: status === 'all' ? undefined : (status as VehicleStatus)
    }))
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

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading vehicles: {error.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Vehicle Registry</CardTitle>
          <Button onClick={onAddVehicle}>
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Button>
        </div>
        
        {/* Filters */}
        <div className="flex gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search vehicles..."
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
              <SelectItem value={VehicleStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={VehicleStatus.INACTIVE}>Inactive</SelectItem>
              <SelectItem value={VehicleStatus.MAINTENANCE}>Maintenance</SelectItem>
              <SelectItem value={VehicleStatus.OUT_OF_SERVICE}>Out of Service</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading vehicles...</div>
        ) : !vehicles || vehicles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No vehicles found. {onAddVehicle && (
              <Button variant="link" onClick={onAddVehicle} className="p-0 ml-1">
                Add your first vehicle
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Year</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow
                  key={vehicle.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onVehicleSelect?.(vehicle.id)}
                >
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {vehicle.make} {vehicle.model}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {vehicle.registration}
                  </TableCell>
                  <TableCell>
                    {vehicle.capacity} passengers
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(vehicle.status)}
                  </TableCell>
                  <TableCell>{vehicle.year}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onVehicleSelect?.(vehicle.id)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onVehicleEdit?.(vehicle.id)}>
                          Edit Vehicle
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onVehicleDelete?.(vehicle.id)}
                          className="text-red-600"
                        >
                          Delete Vehicle
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
