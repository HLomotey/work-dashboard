'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, differenceInDays } from 'date-fns'
import { 
  Calculator,
  Calendar,
  DollarSign,
  Users,
  Home,
  Zap,
  Car,
  FileText,
  AlertCircle,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
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
import { Separator } from '@/components/ui/separator'
import { ChargeType } from '@/lib/types/billing'
import { cn } from '@/lib/utils'

const calculatorSchema = z.object({
  chargeType: z.nativeEnum(ChargeType),
  staffId: z.string().min(1, 'Staff selection is required'),
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  endDate: z.date({
    required_error: 'End date is required',
  }),
  baseAmount: z.number().min(0, 'Base amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  // Type-specific fields
  dailyRate: z.number().optional(),
  occupancyDays: z.number().optional(),
  utilityRate: z.number().optional(),
  occupantCount: z.number().optional(),
  transportDistance: z.number().optional(),
  passengerCount: z.number().optional(),
}).refine((data) => data.startDate < data.endDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
})

type CalculatorFormData = z.infer<typeof calculatorSchema>

interface ChargeCalculatorProps {
  onCalculate?: (calculation: ChargeCalculation) => void
  onCreateCharge?: (chargeData: any) => void
}

interface ChargeCalculation {
  chargeType: ChargeType
  staffId: string
  baseAmount: number
  prorationFactor: number
  proratedAmount: number
  totalDays: number
  description: string
  breakdown: {
    label: string
    value: number
    description: string
  }[]
}

const chargeTypeConfig = {
  [ChargeType.RENT]: {
    label: 'Rent',
    icon: Home,
    color: 'bg-blue-500',
    description: 'Housing rent charges with daily proration'
  },
  [ChargeType.UTILITIES]: {
    label: 'Utilities',
    icon: Zap,
    color: 'bg-yellow-500',
    description: 'Utility costs allocated per occupant'
  },
  [ChargeType.TRANSPORT]: {
    label: 'Transport',
    icon: Car,
    color: 'bg-green-500',
    description: 'Transportation costs per passenger'
  },
  [ChargeType.OTHER]: {
    label: 'Other',
    icon: FileText,
    color: 'bg-gray-500',
    description: 'Miscellaneous charges and fees'
  }
}

// Mock staff data - in real implementation, this would come from a hook
const mockStaff = [
  { id: '1', name: 'John Doe', employeeId: 'EMP001' },
  { id: '2', name: 'Jane Smith', employeeId: 'EMP002' },
  { id: '3', name: 'Mike Johnson', employeeId: 'EMP003' },
]

export function ChargeCalculator({ onCalculate, onCreateCharge }: ChargeCalculatorProps) {
  const [calculation, setCalculation] = useState<ChargeCalculation | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const form = useForm<CalculatorFormData>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      chargeType: ChargeType.RENT,
      startDate: new Date(),
      endDate: new Date(),
      baseAmount: 0,
      description: '',
    },
  })

  const watchedValues = form.watch()
  const selectedChargeType = watchedValues.chargeType

  useEffect(() => {
    // Auto-calculate when form values change
    const subscription = form.watch(() => {
      if (form.formState.isValid) {
        handleCalculate()
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  const handleCalculate = async () => {
    const formData = form.getValues()
    if (!form.formState.isValid) return

    setIsCalculating(true)
    
    try {
      // Calculate proration based on date range
      const totalDays = differenceInDays(formData.endDate, formData.startDate) + 1
      const monthDays = 30 // Standard month for proration
      const prorationFactor = totalDays / monthDays

      let proratedAmount = formData.baseAmount * prorationFactor
      const breakdown: ChargeCalculation['breakdown'] = []

      // Type-specific calculations
      switch (formData.chargeType) {
        case ChargeType.RENT:
          breakdown.push(
            { label: 'Base Monthly Rent', value: formData.baseAmount, description: 'Monthly rent amount' },
            { label: 'Days in Period', value: totalDays, description: 'Actual occupancy days' },
            { label: 'Proration Factor', value: prorationFactor, description: `${totalDays} days / ${monthDays} days` },
            { label: 'Prorated Amount', value: proratedAmount, description: 'Final rent charge' }
          )
          break

        case ChargeType.UTILITIES:
          const occupantCount = formData.occupantCount || 1
          const perOccupantAmount = formData.baseAmount / occupantCount
          proratedAmount = perOccupantAmount * prorationFactor
          breakdown.push(
            { label: 'Total Utility Cost', value: formData.baseAmount, description: 'Total utility bill' },
            { label: 'Occupant Count', value: occupantCount, description: 'Number of occupants' },
            { label: 'Per Occupant Share', value: perOccupantAmount, description: 'Individual share' },
            { label: 'Proration Factor', value: prorationFactor, description: `${totalDays} days / ${monthDays} days` },
            { label: 'Final Amount', value: proratedAmount, description: 'Prorated utility charge' }
          )
          break

        case ChargeType.TRANSPORT:
          const distance = formData.transportDistance || 1
          const passengers = formData.passengerCount || 1
          const costPerPassengerKm = formData.baseAmount
          proratedAmount = costPerPassengerKm * distance * passengers
          breakdown.push(
            { label: 'Cost per Passenger-KM', value: costPerPassengerKm, description: 'Base transport rate' },
            { label: 'Distance (KM)', value: distance, description: 'Trip distance' },
            { label: 'Passenger Count', value: passengers, description: 'Number of passengers' },
            { label: 'Total Cost', value: proratedAmount, description: 'Total transport charge' }
          )
          break

        case ChargeType.OTHER:
          breakdown.push(
            { label: 'Base Amount', value: formData.baseAmount, description: 'Charge amount' },
            { label: 'Proration Factor', value: prorationFactor, description: `${totalDays} days / ${monthDays} days` },
            { label: 'Final Amount', value: proratedAmount, description: 'Prorated charge' }
          )
          break
      }

      const newCalculation: ChargeCalculation = {
        chargeType: formData.chargeType,
        staffId: formData.staffId,
        baseAmount: formData.baseAmount,
        prorationFactor,
        proratedAmount,
        totalDays,
        description: formData.description,
        breakdown
      }

      setCalculation(newCalculation)
      onCalculate?.(newCalculation)
    } catch (error) {
      console.error('Calculation error:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  const handleCreateCharge = () => {
    if (!calculation) return

    const chargeData = {
      staffId: calculation.staffId,
      type: calculation.chargeType,
      amount: calculation.proratedAmount,
      description: calculation.description,
      startDate: form.getValues('startDate'),
      endDate: form.getValues('endDate'),
      metadata: {
        baseAmount: calculation.baseAmount,
        prorationFactor: calculation.prorationFactor,
        totalDays: calculation.totalDays,
        breakdown: calculation.breakdown
      }
    }

    onCreateCharge?.(chargeData)
  }

  const config = chargeTypeConfig[selectedChargeType]
  const Icon = config.icon

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Charge Calculator
          </CardTitle>
          <CardDescription>
            Calculate prorated charges with automatic breakdown and validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              {/* Charge Type Selection */}
              <FormField
                control={form.control}
                name="chargeType"
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

              {/* Staff Selection */}
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
                    <FormDescription>Select the staff member for this charge</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
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
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Base Amount and Type-specific Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="baseAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {selectedChargeType === ChargeType.RENT && 'Monthly Rent Amount'}
                        {selectedChargeType === ChargeType.UTILITIES && 'Total Utility Cost'}
                        {selectedChargeType === ChargeType.TRANSPORT && 'Cost per Passenger-KM'}
                        {selectedChargeType === ChargeType.OTHER && 'Base Amount'}
                      </FormLabel>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Type-specific additional fields */}
                {selectedChargeType === ChargeType.UTILITIES && (
                  <FormField
                    control={form.control}
                    name="occupantCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Occupants</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormDescription>Total occupants sharing utilities</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedChargeType === ChargeType.TRANSPORT && (
                  <>
                    <FormField
                      control={form.control}
                      name="transportDistance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Distance (KM)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              placeholder="0.0"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>

              {selectedChargeType === ChargeType.TRANSPORT && (
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
                          placeholder="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormDescription>Number of passengers for this trip</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Description */}
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
                    <FormDescription>Brief description of this charge</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Calculation Results */}
      {calculation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              Calculation Results
            </CardTitle>
            <CardDescription>
              Detailed breakdown of the calculated charge
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Final Charge Amount</p>
                <p className="text-2xl font-bold">${calculation.proratedAmount.toFixed(2)}</p>
              </div>
              <Badge variant="outline" className="gap-1">
                <Icon className="h-3 w-3" />
                {config.label}
              </Badge>
            </div>

            {/* Breakdown */}
            <div className="space-y-2">
              <h4 className="font-medium">Calculation Breakdown</h4>
              {calculation.breakdown.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <p className="text-sm font-mono">
                    {typeof item.value === 'number' && item.value < 10 
                      ? item.value.toFixed(3)
                      : typeof item.value === 'number' 
                        ? item.value.toLocaleString()
                        : item.value
                    }
                  </p>
                </div>
              ))}
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={handleCreateCharge} className="gap-2">
                <FileText className="h-4 w-4" />
                Create Charge
              </Button>
              <Button variant="outline" onClick={handleCalculate}>
                <Calculator className="h-4 w-4 mr-2" />
                Recalculate
              </Button>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This calculation includes automatic proration based on the selected date range. 
                The charge will be applied to the selected staff member's billing record.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
