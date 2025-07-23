'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { Calendar, CalendarIcon, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useBillingPeriods } from '@/hooks/use-billing'
import { BillingStatus, type BillingPeriod, type CreateBillingPeriod, type UpdateBillingPeriod } from '@/lib/types/billing'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  endDate: z.date({
    required_error: 'End date is required',
  }),
  status: z.nativeEnum(BillingStatus),
}).refine((data) => data.startDate < data.endDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
})

type FormData = z.infer<typeof formSchema>

interface BillingPeriodFormProps {
  period?: BillingPeriod
  onSuccess?: (period: BillingPeriod) => void
  onCancel?: () => void
}

export function BillingPeriodForm({ period, onSuccess, onCancel }: BillingPeriodFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { createPeriod, updatePeriod } = useBillingPeriods()
  const isEditing = !!period

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: period ? new Date(period.startDate) : new Date(),
      endDate: period ? new Date(period.endDate) : new Date(),
      status: period?.status || BillingStatus.DRAFT,
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

      if (isEditing && period) {
        const updateData: UpdateBillingPeriod = {
          startDate: data.startDate,
          endDate: data.endDate,
          status: data.status,
        }
        const updatedPeriod = await updatePeriod(period.id, updateData)
        onSuccess?.(updatedPeriod)
      } else {
        const createData: CreateBillingPeriod = {
          startDate: data.startDate,
          endDate: data.endDate,
          status: data.status,
        }
        const newPeriod = await createPeriod(createData)
        onSuccess?.(newPeriod)
      }
    } catch (err) {
      console.error('Error saving billing period:', err)
      setError(err instanceof Error ? err.message : 'Failed to save billing period')
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateDuration = () => {
    const startDate = form.watch('startDate')
    const endDate = form.watch('endDate')
    
    if (startDate && endDate) {
      const diffTime = endDate.getTime() - startDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays > 0 ? diffDays : 0
    }
    return 0
  }

  const duration = calculateDuration()

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Edit Billing Period' : 'Create New Billing Period'}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update the billing period details below'
            : 'Set up a new billing period for payroll processing'
          }
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      The start date of the billing period
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      The end date of the billing period
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select billing period status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={BillingStatus.DRAFT}>Draft</SelectItem>
                      <SelectItem value={BillingStatus.PROCESSING}>Processing</SelectItem>
                      <SelectItem value={BillingStatus.COMPLETED}>Completed</SelectItem>
                      <SelectItem value={BillingStatus.EXPORTED}>Exported</SelectItem>
                      <SelectItem value={BillingStatus.CANCELLED}>Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The current status of the billing period
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Period Summary */}
            {duration > 0 && (
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Period Duration:</span>
                    <span>{duration} days</span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    This billing period will cover {duration} days of staff housing and transport charges.
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>

          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Update Period' : 'Create Period'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
