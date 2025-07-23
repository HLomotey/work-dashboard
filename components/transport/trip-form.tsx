'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MapPin, Save, X, Calculator } from 'lucide-react'
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useVehicles, useTrips } from '@/hooks/use-transport'
import {
  TripStatus,
  CreateTripSchema,
  UpdateTripSchema,
  type Trip,
  type CreateTrip,
  type UpdateTrip,
  type Vehicle,
  VehicleStatus
} from '@/lib/types/transport'
import { format } from 'date-fns'

interface TripFormProps {
  trip?: Trip
  onSuccess?: (trip: Trip) => void
  onCancel?: () => void
  preselectedVehicleId?: string
  isModal?: boolean
}

export function TripForm({
  trip,
  onSuccess,
  onCancel,
  preselectedVehicleId,
  isModal = false,
}: TripFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [costCalculation, setCostCalculation] = useState<{
    baseCost: number
    distanceCost: number
    total: number
  } | null>(null)
  
  const { toast } = useToast()
  const { vehicles } = useVehicles()
  const { createTrip, updateTrip } = useTrips()

  const isEditing = !!trip
  const schema = isEditing ? UpdateTripSchema : CreateTripSchema

  const form = useForm<CreateTrip | UpdateTrip>({
    resolver: zodResolver(schema),
    defaultValues: trip ? {
      vehicleId: trip.vehicleId,
      date: trip.date,
      route: trip.route,
      startLocation: trip.startLocation,
      endLocation: trip.endLocation,
      purpose: trip.purpose,
      passengerCount: trip.passengerCount,
      distance: trip.distance,
      cost: trip.cost,
      driverId: trip.driverId,
      status: trip.status,
      notes: trip.notes,
      startTime: trip.startTime,
      endTime: trip.endTime,
    } : {
      vehicleId: preselectedVehicleId || '',
      date: new Date(),
      route: '',
      startLocation: '',
      endLocation: '',
      purpose: '',
      passengerCount: 1,
      distance: undefined,
      cost: undefined,
      driverId: '',
      status: TripStatus.SCHEDULED,
      notes: '',
      startTime: '',
      endTime: '',
    },
  })

  const watchedDistance = form.watch('distance')
  const watchedPassengerCount = form.watch('passengerCount')

  // Calculate estimated cost based on distance and passengers
  const calculateCost = () => {
    if (!watchedDistance || watchedDistance <= 0) {
      setCostCalculation(null)
      return
    }

    const baseCostPerKm = 0.5 // Base cost per kilometer
    const passengerMultiplier = 1 + ((watchedPassengerCount || 0) - 1) * 0.1 // 10% increase per additional passenger
    
    const baseCost = watchedDistance * baseCostPerKm
    const distanceCost = baseCost * passengerMultiplier
    const total = Math.round(distanceCost * 100) / 100

    setCostCalculation({
      baseCost,
      distanceCost,
      total,
    })

    form.setValue('cost', total)
  }

  const onSubmit = async (data: CreateTrip | UpdateTrip) => {
    setIsSubmitting(true)
    
    try {
      let result: Trip
      
      if (isEditing && trip) {
        result = await updateTrip(trip.id, data as UpdateTrip)
        toast({
          title: 'Trip Updated',
          description: `Trip to ${result.route} has been updated successfully.`,
        })
      } else {
        result = await createTrip(data as CreateTrip)
        toast({
          title: 'Trip Created',
          description: `Trip to ${result.route} has been created successfully.`,
        })
      }
      
      onSuccess?.(result)
      
      if (!isEditing) {
        form.reset({
          vehicleId: preselectedVehicleId || '',
          date: new Date(),
          route: '',
          passengerCount: 1,
          distance: undefined,
          cost: undefined,
          status: TripStatus.SCHEDULED,
        })
        setCostCalculation(null)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save trip',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedVehicle = vehicles?.find(v => v.id === form.watch('vehicleId'))

  const content = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vehicle Selection */}
          <FormField
            control={form.control}
            name="vehicleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting || !!preselectedVehicleId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {vehicles?.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{vehicle.make} {vehicle.model}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({vehicle.capacity} seats)
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trip Date & Time</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    value={field.value ? format(new Date(field.value), "yyyy-MM-dd'T'HH:mm") : ''}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Route */}
          <FormField
            control={form.control}
            name="route"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Route Description</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Office to Airport, Downtown to Residential Area"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Passenger Count */}
          <FormField
            control={form.control}
            name="passengerCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Passengers</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max={selectedVehicle?.capacity || 100}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    disabled={isSubmitting}
                  />
                </FormControl>
                {selectedVehicle && (
                  <div className="text-xs text-gray-600">
                    Vehicle capacity: {selectedVehicle.capacity} passengers
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trip Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={TripStatus.SCHEDULED}>Scheduled</SelectItem>
                    <SelectItem value={TripStatus.IN_PROGRESS}>In Progress</SelectItem>
                    <SelectItem value={TripStatus.COMPLETED}>Completed</SelectItem>
                    <SelectItem value={TripStatus.CANCELLED}>Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Distance */}
          <FormField
            control={form.control}
            name="distance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Distance (km)</FormLabel>
                <div className="flex space-x-2">
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="0.0"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={calculateCost}
                    disabled={!watchedDistance || watchedDistance <= 0}
                  >
                    <Calculator className="h-4 w-4" />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cost */}
          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trip Cost ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    disabled={isSubmitting}
                  />
                </FormControl>
                {costCalculation && (
                  <div className="text-xs text-green-600">
                    Calculated: ${costCalculation.total.toFixed(2)} 
                    ({watchedDistance}km × {watchedPassengerCount} passengers)
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Cost Calculation Details */}
        {costCalculation && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="text-sm space-y-1">
                <div className="font-medium text-blue-800">Cost Breakdown:</div>
                <div className="text-blue-700">
                  Base cost: ${costCalculation.baseCost.toFixed(2)} ({watchedDistance}km × $0.50/km)
                </div>
                <div className="text-blue-700">
                  Passenger adjustment: {(watchedPassengerCount || 0) > 1 ? `+${(((watchedPassengerCount || 0) - 1) * 10)}%` : 'None'}
                </div>
                <div className="font-medium text-blue-800">
                  Total: ${costCalculation.total.toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting
              ? (isEditing ? 'Updating...' : 'Creating...')
              : (isEditing ? 'Update Trip' : 'Create Trip')
            }
          </Button>
        </div>
      </form>
    </Form>
  )

  if (isModal) {
    return content
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <CardTitle>
            {isEditing ? 'Edit Trip' : 'Create New Trip'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  )
}
