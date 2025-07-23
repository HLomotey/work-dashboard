'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { 
  Calendar,
  CalendarIcon,
  DollarSign,
  Users,
  Home,
  Zap,
  Car,
  FileText,
  Loader2,
  AlertCircle,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useCharges } from '@/hooks/use-billing'
import { ChargeType, type Charge, type CreateCharge, type UpdateCharge } from '@/lib/types/billing'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  staffId: z.string().min(1, 'Staff selection is required'),
  billingPeriodId: z.string().min(1, 'Billing period is required'),
  type: z.nativeEnum(ChargeType),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  endDate: z.date({
    required_error: 'End date is required',
  }),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
}).refine((data) => data.startDate < data.endDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
})

type FormData = z.infer<typeof formSchema>

interface ChargeFormProps {
  charge?: Charge
  billingPeriodId?: string
  onSuccess?: (charge: Charge) => void
  onCancel?: () => void
}

const chargeTypeConfig = {
  [ChargeType.RENT]: {
    label: 'Rent',
    icon: Home,
    color: 'bg-blue-500',
    description: 'Housing rent charges'
  },
  [ChargeType.UTILITIES]: {
    label: 'Utilities',
    icon: Zap,
    color: 'bg-yellow-500',
    description: 'Utility costs and fees'
  },
  [ChargeType.TRANSPORT]: {
    label: 'Transport',
    icon: Car,
    color: 'bg-green-500',
    description: 'Transportation charges'
  },
  [ChargeType.OTHER]: {
    label: 'Other',
    icon: FileText,
    color: 'bg-gray-500',
    description: 'Miscellaneous charges'
  }
}

// Mock data - in real implementation, these would come from hooks
const mockStaff = [
  { id: '1', name: 'John Doe', employeeId: 'EMP001' },
  { id: '2', name: 'Jane Smith', employeeId: 'EMP002' },
  { id: '3', name: 'Mike Johnson', employeeId: 'EMP003' },
]

const mockBillingPeriods = [
  { id: '1', name: 'January 2024', startDate: '2024-01-01', endDate: '2024-01-31' },
  { id: '2', name: 'February 2024', startDate: '2024-02-01', endDate: '2024-02-29' },
  { id: '3', name: 'March 2024', startDate: '2024-03-01', endDate: '2024-03-31' },
]

export function ChargeForm({ charge, billingPeriodId, onSuccess, onCancel }: ChargeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { createCharge, updateCharge } = useCharges()
  const isEditing = !!charge

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      staffId: charge?.staffId || '',
      billingPeriodId: charge?.billingPeriodId || billingPeriodId || '',
      type: charge?.type || ChargeType.RENT,
      amount: charge?.amount || 0,
      description: charge?.description || '',
      startDate: charge?.startDate ? new Date(charge.startDate) : new Date(),
      endDate: charge?.endDate ? new Date(charge.endDate) : new Date(),
      notes: charge?.notes || '',
      metadata: charge?.metadata || {},
    },
  })

  const watchedType = form.watch('type')
  const config = chargeTypeConfig[watchedType]
  const Icon = config.icon

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

      if (isEditing && charge) {
        const updateData: UpdateCharge = {
          type: data.type,
          amount: data.amount,
          description: data.description,
          prorationFactor: 1,
          startDate: data.startDate,
          endDate: data.endDate,
          notes: data.notes,
          metadata: data.metadata,
        }
        const updatedCharge = await updateCharge(charge.id, updateData)
        onSuccess?.(updatedCharge)
      } else {
        const createData: CreateCharge = {
          staffId: data.staffId,
          billingPeriodId: data.billingPeriodId,
          type: data.type,
          amount: data.amount,
          description: data.description,
          prorationFactor: 1,
          startDate: data.startDate,
          endDate: data.endDate,
          notes: data.notes,
          metadata: data.metadata,
        }
        const newCharge = await createCharge(createData)
        onSuccess?.(newCharge)
      }
    } catch (err) {
      console.error('Error saving charge:', err)
      setError(err instanceof Error ? err.message : 'Failed to save charge')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getChargeTypeHelp = (type: ChargeType) => {
    switch (type) {
      case ChargeType.RENT:
        return 'Housing rent charges are typically calculated monthly and prorated based on occupancy period.'
      case ChargeType.UTILITIES:
        return 'Utility charges are shared costs allocated among occupants, usually prorated by occupancy days.'
      case ChargeType.TRANSPORT:
        return 'Transport charges are based on trips taken, calculated per passenger and distance.'
      case ChargeType.OTHER:
        return 'Other charges include miscellaneous fees, adjustments, and one-time costs.'
      default:
        return ''
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {isEditing ? 'Edit Charge' : 'Create New Charge'}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update the charge details below'
            : 'Add a new charge to the billing system'
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

            {/* Charge Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Charge Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select charge type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(chargeTypeConfig).map(([type, config]) => {
                        const TypeIcon = config.icon
                        return (
                          <SelectItem key={type} value={type}>
                            <div className="flex items-center gap-2">
                              <TypeIcon className="h-4 w-4" />
                              {config.label}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <FormDescription>{config.description}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Staff and Billing Period */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="staffId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff Member</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockStaff.map((staff) => (
                          <SelectItem key={staff.id} value={staff.id}>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              {staff.name} ({staff.employeeId})
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billingPeriodId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Period</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select billing period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockBillingPeriods.map((period) => (
                          <SelectItem key={period.id} value={period.id}>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {period.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Amount and Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="pl-10"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>The charge amount in dollars</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter charge description..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Brief description of the charge</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date Range */}
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
                          disabled={(date) => date < new Date('1900-01-01')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>Charge period start date</FormDescription>
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
                          disabled={(date) => date < new Date('1900-01-01')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>Charge period end date</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes or comments about this charge..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional notes for internal reference
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Charge Type Help */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>{config.label} Charges:</strong> {getChargeTypeHelp(watchedType)}
              </AlertDescription>
            </Alert>

            {/* Preview */}
            {form.watch('amount') > 0 && form.watch('staffId') && (
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Charge Preview:</span>
                      <Badge variant="outline" className="gap-1">
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </div>
                    <div className="text-lg font-semibold">
                      ${form.watch('amount').toLocaleString()} 
                      {form.watch('staffId') && (
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          for {mockStaff.find(s => s.id === form.watch('staffId'))?.name}
                        </span>
                      )}
                    </div>
                    {form.watch('description') && (
                      <p className="text-sm text-muted-foreground">
                        {form.watch('description')}
                      </p>
                    )}
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
              {isEditing ? 'Update Charge' : 'Create Charge'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
