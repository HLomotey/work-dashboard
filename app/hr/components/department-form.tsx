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
import { CalendarIcon, Building2, Users, DollarSign, Plus, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Import Supabase Department types
import {
  DepartmentStatus,
  CreateDepartmentSchema,
  UpdateDepartmentSchema,
  DepartmentBudgetSchema,
  validateCreateDepartment,
  validateUpdateDepartment,
  type Department,
  type CreateDepartment,
  type UpdateDepartment,
  type DepartmentBudget,
} from '@/lib/supabase/types/department'

interface DepartmentFormProps {
  department?: Department
  onSubmit: (data: CreateDepartment | UpdateDepartment) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

type DepartmentFormData = CreateDepartment

export function DepartmentForm({ department, onSubmit, onCancel, isLoading }: DepartmentFormProps) {
  const [budget, setBudget] = useState<DepartmentBudget>(
    department?.budget || {
      annual: 0,
      allocated: 0,
      spent: 0,
      remaining: 0,
    }
  )

  const form = useForm<CreateDepartment>({
    resolver: zodResolver(CreateDepartmentSchema),
    defaultValues: {
      name: department?.name || '',
      code: department?.code || '',
      description: department?.description || '',
      managerId: department?.managerId || '',
      parentDepartmentId: department?.parentDepartmentId || '',
      location: department?.location || '',
      costCenter: department?.costCenter || '',
      status: department?.status || DepartmentStatus.ACTIVE,
      establishedDate: department?.establishedDate || new Date(),
      budget: budget,
      notes: department?.notes || '',
    },
  })

  const handleSubmit = async (data: DepartmentFormData) => {
    try {
      // Validate the department data
      const validationResult = validateCreateDepartment(data)
      if (!validationResult.success) {
        toast.error('Validation failed: ' + validationResult.error.message)
        return
      }

      await onSubmit({
        ...data,
        budget,
      })
      
      toast.success(department ? 'Department updated successfully!' : 'Department created successfully!')
    } catch (error) {
      toast.error('Failed to save department. Please try again.')
      console.error('Department form error:', error)
    }
  }



  const getStatusColor = (status: DepartmentStatus) => {
    switch (status) {
      case DepartmentStatus.ACTIVE:
        return 'default'
      case DepartmentStatus.INACTIVE:
        return 'secondary'
      case DepartmentStatus.RESTRUCTURING:
        return 'outline'
      default:
        return 'outline'
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          {department ? 'Edit Department' : 'Create New Department'}
        </CardTitle>
        <CardDescription>
          {department ? 'Update department information and organizational structure' : 'Set up a new department with budget allocations and management structure'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Department Information
              </Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Human Resources, Engineering, Marketing" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department Code *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., HR, ENG, MKT" />
                      </FormControl>
                      <FormDescription>
                        Short code for identification and reporting
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
                        placeholder="Describe the department's purpose, responsibilities, and scope..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Organizational Structure */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Organizational Structure
              </Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="managerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department Manager ID</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Manager UUID" />
                      </FormControl>
                      <FormDescription>
                        Employee ID of the department manager
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parentDepartmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Department ID</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Parent Department UUID" />
                      </FormControl>
                      <FormDescription>
                        If this is a sub-department, specify the parent
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Location and Financial */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Building A, Floor 3" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="costCenter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost Center</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., CC-001, 1000" />
                      </FormControl>
                      <FormDescription>
                        Financial cost center code
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
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(DepartmentStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                              <Badge variant={getStatusColor(status)}>
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

              <FormField
                control={form.control}
                name="establishedDate"
                render={({ field }) => (
                  <FormItem className="w-full md:w-64">
                    <FormLabel>Established Date</FormLabel>
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
                            date > new Date() || date < new Date("1900-01-01")
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

            {/* Budget Information */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Budget Allocations
                </Label>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    Annual: ${budget.annual.toLocaleString()} | 
                    Spent: ${budget.spent.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Card className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Annual Budget *</Label>
                      <Input
                        type="number"
                        step="1000"
                        min="0"
                        value={budget.annual}
                        onChange={(e) => setBudget(prev => ({ ...prev, annual: parseFloat(e.target.value) || 0 }))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label>Allocated Amount *</Label>
                      <Input
                        type="number"
                        step="1000"
                        min="0"
                        value={budget.allocated}
                        onChange={(e) => setBudget(prev => ({ ...prev, allocated: parseFloat(e.target.value) || 0 }))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label>Spent Amount</Label>
                      <Input
                        type="number"
                        step="1000"
                        min="0"
                        value={budget.spent}
                        onChange={(e) => setBudget(prev => ({ ...prev, spent: parseFloat(e.target.value) || 0 }))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label>Remaining Amount</Label>
                      <Input
                        type="number"
                        step="1000"
                        min="0"
                        value={budget.remaining}
                        onChange={(e) => setBudget(prev => ({ ...prev, remaining: parseFloat(e.target.value) || 0 }))}
                        placeholder="0"
                        readOnly
                        className="bg-muted"
                      />
                    </div>

                  </div>
                  <div className="mt-4">
                    <div className="text-sm text-muted-foreground">
                      Remaining: ${(budget.allocated - budget.spent).toLocaleString()}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${budget.allocated ? Math.min((budget.spent / budget.allocated) * 100, 100) : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Goals */}


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
                      placeholder="Any additional notes or comments about this department..."
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
                {isLoading ? 'Saving...' : department ? 'Update Department' : 'Create Department'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
