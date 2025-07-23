"use client"

import { useState } from 'react'
import { useForm, SubmitHandler, Control } from 'react-hook-form'
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
import { CalendarIcon, User as UserIcon, Phone, Mail } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Import Supabase Employee types
import {
  EmploymentStatus,
  CreateEmployeeSchema,
  UpdateEmployeeSchema,
  EmergencyContactSchema,
  validateCreateEmployee,
  validateUpdateEmployee,
  type Employee,
  type CreateEmployee,
  type UpdateEmployee,
  type EmergencyContact,
} from '@/lib/supabase/types/employee'

// Import User types for role management
import {
  UserRole,
  type User,
} from '@/lib/supabase/types/user'

// Employment Type enum
enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  TEMPORARY = 'temporary',
  INTERN = 'intern'
}

interface EmployeeFormProps {
  employee?: Employee
  onSubmit: (data: CreateEmployee | UpdateEmployee) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

// Form data type is directly CreateEmployee from the schema

export function EmployeeForm({ employee, onSubmit, onCancel, isLoading }: EmployeeFormProps) {
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact>(
    employee?.emergencyContact || {
      name: '',
      relationship: '',
      phone: '',
      email: '',
      address: '',
    }
  )

  const form = useForm<CreateEmployee>({
    resolver: zodResolver(CreateEmployeeSchema),
    defaultValues: {
      userId: employee?.userId || '',
      employeeId: employee?.employeeId || '',
      firstName: employee?.firstName || '',
      lastName: employee?.lastName || '',
      email: employee?.email || '',
      phone: employee?.phone || '',
      position: employee?.position || '',
      departmentId: employee?.departmentId || '',
      supervisorId: employee?.supervisorId || '',
      startDate: employee?.startDate || new Date(),
      endDate: employee?.endDate || undefined,
      employmentStatus: employee?.employmentStatus || EmploymentStatus.ACTIVE,
      role: employee?.role || undefined,
      salary: employee?.salary || 0,
      housingEligible: employee?.housingEligible || false,
      transportEligible: employee?.transportEligible || false,
      dateOfBirth: employee?.dateOfBirth || undefined,
      address: employee?.address || '',
      emergencyContact: emergencyContact,
      skills: employee?.skills || [],
      bio: employee?.bio || '',
      notes: employee?.notes || '',
    },
  })

  const handleSubmit = async (data: CreateEmployee) => {
    try {
      // Validate the employee data
      const validationResult = validateCreateEmployee(data)
      if (!validationResult.success) {
        toast.error('Validation failed: ' + validationResult.error.message)
        return
      }

      await onSubmit({
        ...data,
        emergencyContact,
      })
      
      toast.success(employee ? 'Employee updated successfully!' : 'Employee created successfully!')
    } catch (error) {
      toast.error('Failed to save employee. Please try again.')
      console.error('Employee form error:', error)
    }
  }

  const updateEmergencyContact = (updates: Partial<EmergencyContact>) => {
    setEmergencyContact(prev => ({ ...prev, ...updates }))
  }

  const getEmploymentStatusColor = (status: EmploymentStatus) => {
    switch (status) {
      case EmploymentStatus.ACTIVE:
        return 'default'
      case EmploymentStatus.INACTIVE:
        return 'secondary'
      case EmploymentStatus.TERMINATED:
        return 'destructive'
      case EmploymentStatus.ON_LEAVE:
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getEmploymentTypeColor = (type: EmploymentType) => {
    switch (type) {
      case EmploymentType.FULL_TIME:
        return 'default'
      case EmploymentType.PART_TIME:
        return 'secondary'
      case EmploymentType.CONTRACT:
        return 'outline'
      case EmploymentType.INTERN:
        return 'outline'
      default:
        return 'outline'
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{employee ? 'Edit Employee' : 'Add New Employee'}</CardTitle>
        <CardDescription>
          {employee ? 'Update employee information and employment details' : 'Create a new employee record with personal and professional information'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit as any)} className="space-y-6">
            {/* Employee ID and User ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., EMP001, E-2024-001" />
                    </FormControl>
                    <FormDescription>
                      Unique employee identifier for the organization
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User ID *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="User UUID" />
                    </FormControl>
                    <FormDescription>
                      Link to the user account in the system
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Personal Information
              </Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="John" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Doe" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="john.doe@company.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+1 (555) 123-4567" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
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

                <FormField
                  control={form.control as any}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Street address, city, state, zip code" rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Employment Information */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Employment Information</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Software Engineer, Marketing Manager" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department ID *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Department UUID" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="supervisorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supervisor ID</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Supervisor UUID" />
                      </FormControl>
                      <FormDescription>
                        Direct supervisor or manager
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Salary</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          step="1000"
                          min="0"
                          placeholder="0"
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Annual salary in USD
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control as any}
                  name="startDate"
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
                  control={form.control as any}
                  name="employmentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employment Status *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(EmploymentStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                              <Badge variant={getEmploymentStatusColor(status)}>
                                {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Emergency Contact
              </Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Contact Name</Label>
                  <Input
                    value={emergencyContact.name}
                    onChange={(e) => updateEmergencyContact({ name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label>Relationship</Label>
                  <Input
                    value={emergencyContact.relationship}
                    onChange={(e) => updateEmergencyContact({ relationship: e.target.value })}
                    placeholder="e.g., Spouse, Parent, Sibling"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={emergencyContact.phone}
                    onChange={(e) => updateEmergencyContact({ phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input
                    value={emergencyContact.email || ''}
                    onChange={(e) => updateEmergencyContact({ email: e.target.value })}
                    placeholder="contact@email.com"
                  />
                </div>
              </div>

              <div>
                <Label>Address</Label>
                <Textarea
                  value={emergencyContact.address || ''}
                  onChange={(e) => updateEmergencyContact({ address: e.target.value })}
                  placeholder="Contact's address"
                  rows={2}
                />
              </div>
            </div>

            {/* Skills */}
            <FormField
              control={form.control as unknown as Control<CreateEmployee, any>}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills & Competencies</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Enter skills separated by commas (e.g., JavaScript, Project Management, Leadership)"
                      onChange={(e) => {
                        const skills = e.target.value.split(',').map(skill => skill.trim()).filter(Boolean)
                        field.onChange(skills)
                      }}
                      value={field.value?.join(', ') || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    List relevant skills and competencies for this employee
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control as any}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Any additional notes about this employee..."
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
                {isLoading ? 'Saving...' : employee ? 'Update Employee' : 'Create Employee'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
