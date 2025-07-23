'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MapPin, Users, Calendar, Save, X, Plus, Minus } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useVehicles, useTrips } from '@/hooks/use-transport'
import {
  TripStatus,
  CreateTripSchema,
  type Vehicle,
  type Trip,
  type CreateTrip,
} from '@/lib/types/transport'
import { format } from 'date-fns'

interface TripLoggerProps {
  trip?: Trip
  onSuccess?: (trip: Trip) => void
  onCancel?: () => void
  preselectedVehicleId?: string
}

export function TripLogger({
  trip,
  onSuccess,
  onCancel,
  preselectedVehicleId,
}: TripLoggerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const { toast } = useToast()
  const { vehicles } = useVehicles()
  const { createTrip, updateTrip } = useTrips()

  const isEditing = !!trip

  type TripFormData = CreateTrip & { notes?: string }
  
  const form = useForm<TripFormData>({
    resolver: zodResolver(CreateTripSchema),
    defaultValues: trip ? {
      vehicleId: trip.vehicleId,
      date: trip.date,
      route: trip.route,
      passengerCount: trip.passengerCount,
      distance: trip.distance,
      cost: trip.cost,
      notes: trip.notes || '',
      status: trip.status,
    } : {
      vehicleId: preselectedVehicleId || '',
      date: new Date(),
      route: '',
      passengerCount: 1,
      distance: undefined,
      cost: undefined,
      notes: '',
      status: TripStatus.SCHEDULED,
    },
  })

  const watchedVehicleId = form.watch('vehicleId')
  const watchedPassengerCount = form.watch('passengerCount')

  // Update selected vehicle when vehicle ID changes
  React.useEffect(() => {
    if (watchedVehicleId && vehicles) {
      const vehicle = vehicles.find(v => v.id === watchedVehicleId)
      setSelectedVehicle(vehicle || null)
    }
  }, [watchedVehicleId, vehicles])

  const onSubmit = async (data: TripFormData) => {
    setIsSubmitting(true)
    
    try {
      let result: Trip
      
      if (isEditing && trip) {
        result = await updateTrip(trip.id, data)
        toast({
          title: 'Trip Updated',
          description: `Trip to ${result.route} has been updated successfully.`,
        })
      } else {
        result = await createTrip(data)
        toast({
          title: 'Trip Logged',
          description: `Trip to ${result.route} has been logged successfully.`,
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
          notes: '',
          status: TripStatus.SCHEDULED,
        })
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

  const adjustPassengerCount = (increment: number) => {
    const currentCount = form.getValues('passengerCount')
    const newCount = Math.max(0, Math.min(
      selectedVehicle?.capacity || 100,
      currentCount + increment
    ))
    form.setValue('passengerCount', newCount)
  }

  const getLoadFactor = () => {
    if (!selectedVehicle || !watchedPassengerCount) return 0
    return (watchedPassengerCount / selectedVehicle.capacity) * 100
  }

  const loadFactor = getLoadFactor()
  const loadFactorColor = loadFactor >= 90 ? 'text-red-600' : 
                         loadFactor >= 70 ? 'text-yellow-600' : 'text-green-600'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <CardTitle>
              {isEditing ? 'Edit Trip' : 'Log New Trip'}
            </CardTitle>
          </div>
          
          {selectedVehicle && (
            <Badge variant="outline">
              {selectedVehicle.make} {selectedVehicle.model}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
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
                                {vehicle.registration}
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
                    <FormLabel>Trip Date</FormLabel>
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
                    <FormLabel>Route</FormLabel>
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
                    <FormLabel>Passenger Count</FormLabel>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => adjustPassengerCount(-1)}
                        disabled={isSubmitting || field.value <= 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max={selectedVehicle?.capacity || 100}
                          className="text-center"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => adjustPassengerCount(1)}
                        disabled={isSubmitting || field.value >= (selectedVehicle?.capacity || 100)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {selectedVehicle && (
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Capacity: {selectedVehicle.capacity}</span>
                        <span className={loadFactorColor}>
                          Load: {loadFactor.toFixed(0)}%
                        </span>
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
                    <FormLabel>Status</FormLabel>
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
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="Optional"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        disabled={isSubmitting}
                      />
                    </FormControl>
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
                    <FormLabel>Cost ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Optional"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes about the trip..."
                        className="resize-none"
                        rows={3}
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                  ? (isEditing ? 'Updating...' : 'Logging...')
                  : (isEditing ? 'Update Trip' : 'Log Trip')
                }
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
