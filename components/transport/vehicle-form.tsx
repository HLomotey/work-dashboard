'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Car, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { useToast } from '@/hooks/use-toast'
import { useVehicles } from '@/hooks/use-transport'
import {
  VehicleStatus,
  VehicleType,
  CreateVehicleSchema,
  UpdateVehicleSchema,
  type Vehicle,
  type CreateVehicle,
  type UpdateVehicle,
} from '@/lib/types/transport'

interface VehicleFormProps {
  vehicle?: Vehicle
  onSuccess?: (vehicle: Vehicle) => void
  onCancel?: () => void
  isModal?: boolean
}

export function VehicleForm({
  vehicle,
  onSuccess,
  onCancel,
  isModal = false,
}: VehicleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { createVehicle, updateVehicle } = useVehicles()

  const isEditing = !!vehicle
  const schema = isEditing ? UpdateVehicleSchema : CreateVehicleSchema

  const form = useForm<CreateVehicle | UpdateVehicle>({
    resolver: zodResolver(schema),
    defaultValues: vehicle ? {
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      capacity: vehicle.capacity,
      registration: vehicle.registration,
      status: vehicle.status,
    } : {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      capacity: 1,
      registration: '',
      status: VehicleStatus.ACTIVE,
    },
  })

  const onSubmit = async (data: CreateVehicle | UpdateVehicle) => {
    setIsSubmitting(true)
    
    try {
      let result: Vehicle
      
      if (isEditing && vehicle) {
        result = await updateVehicle(vehicle.id, data as UpdateVehicle)
        toast({
          title: 'Vehicle Updated',
          description: `${result.make} ${result.model} has been updated successfully.`,
        })
      } else {
        result = await createVehicle(data as CreateVehicle)
        toast({
          title: 'Vehicle Added',
          description: `${result.make} ${result.model} has been added to the fleet.`,
        })
      }
      
      onSuccess?.(result)
      
      if (!isEditing) {
        form.reset()
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save vehicle',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1990 + 2 }, (_, i) => currentYear + 1 - i)

  const content = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Make */}
          <FormField
            control={form.control}
            name="make"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Make</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Toyota, Ford, Mercedes"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Model */}
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Camry, Transit, Sprinter"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Year */}
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value?.toString()}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Capacity */}
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Passenger Capacity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="e.g., 8"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Registration */}
          <FormField
            control={form.control}
            name="registration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registration Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., ABC-123"
                    className="font-mono"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
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
                    <SelectItem value={VehicleStatus.ACTIVE}>Active</SelectItem>
                    <SelectItem value={VehicleStatus.INACTIVE}>Inactive</SelectItem>
                    <SelectItem value={VehicleStatus.MAINTENANCE}>Maintenance</SelectItem>
                    <SelectItem value={VehicleStatus.OUT_OF_SERVICE}>Out of Service</SelectItem>
                  </SelectContent>
                </Select>
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
              ? (isEditing ? 'Updating...' : 'Adding...')
              : (isEditing ? 'Update Vehicle' : 'Add Vehicle')
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
          <Car className="h-5 w-5 text-blue-600" />
          <CardTitle>
            {isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  )
}
