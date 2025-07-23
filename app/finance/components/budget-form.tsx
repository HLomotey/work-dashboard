"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Plus, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Import Supabase Budget types
import {
  BudgetStatus,
  BudgetCategory,
  BudgetPeriod,
  CreateBudgetSchema,
  UpdateBudgetSchema,
  BudgetLineItemSchema,
  validateCreateBudget,
  validateUpdateBudget,
  type Budget,
  type CreateBudget,
  type UpdateBudget,
  type BudgetLineItem,
} from '@/lib/supabase/types/budget'

interface BudgetFormProps {
  budget?: Budget
  onSubmit: (data: CreateBudget | UpdateBudget) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

type BudgetFormData = CreateBudget

export function BudgetForm({ budget, onSubmit, onCancel, isLoading }: BudgetFormProps) {
  const [lineItems, setLineItems] = useState<BudgetLineItem[]>(
    budget?.lineItems || [
      {
        id: crypto.randomUUID(),
        name: 'Default Line Item',
        category: BudgetCategory.OPERATIONAL,
        description: '',
        allocatedAmount: 0,
        spentAmount: 0,
        remainingAmount: 0,
        notes: '',
      },
    ]
  )

  const form = useForm<CreateBudget>({
    resolver: zodResolver(CreateBudgetSchema),
    defaultValues: {
      name: budget?.name || '',
      description: budget?.description || '',
      allocatedAmount: budget?.allocatedAmount || 0,
      departmentId: budget?.departmentId || '',
      periodType: budget?.periodType || BudgetPeriod.MONTHLY,
      periodStart: budget?.periodStart || new Date(),
      periodEnd: budget?.periodEnd || new Date(),
      status: budget?.status || BudgetStatus.DRAFT,
      lineItems: lineItems,
      notes: budget?.notes || '',
    },
  })

  const handleSubmit = async (data: BudgetFormData) => {
    try {
      // Validate the budget data
      const validationResult = validateCreateBudget(data)
      if (!validationResult.success) {
        toast.error('Validation failed: ' + validationResult.error.message)
        return
      }

      await onSubmit({
        ...data,
        lineItems,
      })
      
      toast.success(budget ? 'Budget updated successfully!' : 'Budget created successfully!')
    } catch (error) {
      toast.error('Failed to save budget. Please try again.')
      console.error('Budget form error:', error)
    }
  }

  const addLineItem = () => {
    const newItem: BudgetLineItem = {
      id: crypto.randomUUID(),
      name: '',
      category: BudgetCategory.OPERATIONAL,
      description: '',
      allocatedAmount: 0,
      spentAmount: 0,
      remainingAmount: 0,
      notes: '',
    }
    setLineItems([...lineItems, newItem])
  }

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id))
  }

  const updateLineItem = (id: string, updates: Partial<BudgetLineItem>) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ))
  }

  const calculateTotalAllocated = () => {
    return lineItems.reduce((sum, item) => sum + (item.allocatedAmount || 0), 0)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{budget ? 'Edit Budget' : 'Create New Budget'}</CardTitle>
        <CardDescription>
          {budget ? 'Update budget details and allocations' : 'Set up a new budget with line items and allocations'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Q1 2024 Marketing Budget" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department ID *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Department UUID" />
                    </FormControl>
                    <FormDescription>
                      Select the department this budget belongs to
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Describe the purpose and scope of this budget..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Budget Period and Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="periodType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Period *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(BudgetPeriod).map((period) => (
                          <SelectItem key={period} value={period}>
                            {period.charAt(0).toUpperCase() + period.slice(1).toLowerCase()}
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
                name="periodStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date("1900-01-01")
                          }
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
                name="periodEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Total Amount and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="allocatedAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Budget Amount *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Allocated: ${calculateTotalAllocated().toFixed(2)}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(BudgetStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            <Badge variant={
                              status === BudgetStatus.APPROVED ? 'default' :
                              status === BudgetStatus.ACTIVE ? 'secondary' :
                              status === BudgetStatus.DRAFT ? 'outline' : 'destructive'
                            }>
                              {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Budget Line Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Budget Line Items</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLineItem}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Line Item
                </Button>
              </div>

              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <Card key={item.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Category *</Label>
                        <Select
                          value={item.category}
                          onValueChange={(value) => updateLineItem(item.id, { category: value as BudgetCategory })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(BudgetCategory).map((category) => (
                              <SelectItem key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                          placeholder="Brief description"
                        />
                      </div>
                      <div>
                        <Label>Allocated Amount *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.allocatedAmount}
                          onChange={(e) => updateLineItem(item.id, { allocatedAmount: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeLineItem(item.id)}
                          disabled={lineItems.length === 1}
                          className="w-full"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {item.notes && (
                      <div className="mt-3">
                        <Label>Notes</Label>
                        <Textarea
                          value={item.notes}
                          onChange={(e) => updateLineItem(item.id, { notes: e.target.value })}
                          placeholder="Additional notes for this line item..."
                          rows={2}
                        />
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Any additional notes or comments about this budget..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : budget ? 'Update Budget' : 'Create Budget'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
