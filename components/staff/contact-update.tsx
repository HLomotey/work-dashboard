'use client'

import React, { useState } from "react"
import { format } from 'date-fns'
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Users,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  Send,
  History
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useContactUpdates } from '../../hooks/use-staff'
import { cn } from '@/lib/utils'

interface ContactUpdateProps {
  staffId: string
  onUpdateSubmitted?: (updateId: string) => void
}

// Contact update types and statuses
enum UpdateType {
  EMAIL = 'email',
  PHONE = 'phone',
  ADDRESS = 'address',
  EMERGENCY_CONTACT = 'emergency_contact',
  OTHER = 'other'
}

enum UpdateStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed'
}

const updateTypeConfig = {
  [UpdateType.EMAIL]: {
    label: 'Email Address',
    description: 'Update your primary email address',
    color: 'bg-blue-100 text-blue-800',
    icon: Mail
  },
  [UpdateType.PHONE]: {
    label: 'Phone Number',
    description: 'Update your primary phone number',
    color: 'bg-green-100 text-green-800',
    icon: Phone
  },
  [UpdateType.ADDRESS]: {
    label: 'Home Address',
    description: 'Update your residential address',
    color: 'bg-purple-100 text-purple-800',
    icon: MapPin
  },
  [UpdateType.EMERGENCY_CONTACT]: {
    label: 'Emergency Contact',
    description: 'Update emergency contact information',
    color: 'bg-orange-100 text-orange-800',
    icon: Users
  },
  [UpdateType.OTHER]: {
    label: 'Other Information',
    description: 'Other contact information updates',
    color: 'bg-gray-100 text-gray-800',
    icon: User
  }
}

const statusConfig = {
  [UpdateStatus.PENDING]: {
    label: 'Pending',
    variant: 'secondary' as const,
    icon: Clock,
    color: 'text-yellow-600'
  },
  [UpdateStatus.UNDER_REVIEW]: {
    label: 'Under Review',
    variant: 'default' as const,
    icon: AlertCircle,
    color: 'text-blue-600'
  },
  [UpdateStatus.APPROVED]: {
    label: 'Approved',
    variant: 'outline' as const,
    icon: CheckCircle,
    color: 'text-green-600'
  },
  [UpdateStatus.REJECTED]: {
    label: 'Rejected',
    variant: 'destructive' as const,
    icon: X,
    color: 'text-red-600'
  },
  [UpdateStatus.COMPLETED]: {
    label: 'Completed',
    variant: 'outline' as const,
    icon: CheckCircle,
    color: 'text-gray-600'
  }
}

// Form schema
const contactUpdateSchema = z.object({
  type: z.nativeEnum(UpdateType),
  currentValue: z.string().min(1, 'Current value is required'),
  newValue: z.string().min(1, 'New value is required'),
  reason: z.string().min(10, 'Please provide a reason for this change').max(500),
  effectiveDate: z.date().optional(),
})

type ContactUpdateForm = z.infer<typeof contactUpdateSchema>

// Mock contact updates data
const mockContactUpdates = [
  {
    id: '1',
    staffId: 'staff-1',
    type: UpdateType.EMAIL,
    currentValue: 'john.doe@company.com',
    newValue: 'john.doe.new@company.com',
    reason: 'Changed to personal email for better accessibility',
    status: UpdateStatus.UNDER_REVIEW,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-22'),
    reviewedBy: null,
    reviewNotes: null,
    effectiveDate: new Date('2024-02-01')
  },
  {
    id: '2',
    staffId: 'staff-1',
    type: UpdateType.PHONE,
    currentValue: '+1 (555) 123-4567',
    newValue: '+1 (555) 987-6543',
    reason: 'Got a new phone number due to carrier change',
    status: UpdateStatus.APPROVED,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12'),
    reviewedBy: 'HR Manager',
    reviewNotes: 'Approved. Please update your phone number in all company systems.',
    effectiveDate: new Date('2024-01-15'),
    completedAt: new Date('2024-01-15')
  },
  {
    id: '3',
    staffId: 'staff-1',
    type: UpdateType.EMERGENCY_CONTACT,
    currentValue: 'Jane Doe - +1 (555) 987-6543 (Spouse)',
    newValue: 'John Smith - +1 (555) 456-7890 (Brother)',
    reason: 'Emergency contact moved out of state, updating to local contact',
    status: UpdateStatus.COMPLETED,
    createdAt: new Date('2023-12-15'),
    updatedAt: new Date('2023-12-18'),
    reviewedBy: 'HR Manager',
    reviewNotes: 'Approved and updated in system.',
    effectiveDate: new Date('2023-12-20'),
    completedAt: new Date('2023-12-20')
  }
]

// Mock current contact information
const mockCurrentContact = {
  email: 'john.doe@company.com',
  phone: '+1 (555) 987-6543',
  address: '123 Main Street, Apt 4B, New York, NY 10001',
  emergencyContact: {
    name: 'John Smith',
    phone: '+1 (555) 456-7890',
    relationship: 'Brother'
  }
}

export function ContactUpdate({ staffId, onUpdateSubmitted }: ContactUpdateProps) {
  const [isNewUpdateOpen, setIsNewUpdateOpen] = useState(false)
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null)

  // In real implementation, this would fetch data based on staffId
  const { updates, currentContact, isLoading, error, submitUpdate } = useContactUpdates(staffId)
  
  // Use mock data for demonstration
  const contactUpdates = mockContactUpdates
  const currentContactInfo = mockCurrentContact

  const form = useForm<ContactUpdateForm>({
    resolver: zodResolver(contactUpdateSchema),
    defaultValues: {
      type: UpdateType.EMAIL,
      currentValue: '',
      newValue: '',
      reason: '',
    },
  })

  const selectedType = form.watch('type')

  // Set current value based on selected type
  const getCurrentValue = (type: UpdateType) => {
    switch (type) {
      case UpdateType.EMAIL:
        return currentContactInfo.email
      case UpdateType.PHONE:
        return currentContactInfo.phone
      case UpdateType.ADDRESS:
        return currentContactInfo.address
      case UpdateType.EMERGENCY_CONTACT:
        return `${currentContactInfo.emergencyContact.name} - ${currentContactInfo.emergencyContact.phone} (${currentContactInfo.emergencyContact.relationship})`
      default:
        return ''
    }
  }

  // Update current value when type changes
  React.useEffect(() => {
    form.setValue('currentValue', getCurrentValue(selectedType))
  }, [selectedType, form])

  const onSubmit = async (data: ContactUpdateForm) => {
    try {
      // In real implementation, this would call the API
      console.log('Submitting contact update:', data)
      
      // Mock successful submission
      setIsNewUpdateOpen(false)
      form.reset()
      onUpdateSubmitted?.('new-update-id')
    } catch (error) {
      console.error('Failed to submit contact update:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading contact updates...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Failed to load contact updates</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information Updates
              </CardTitle>
              <CardDescription>
                Request changes to your contact information
              </CardDescription>
            </div>
            <Dialog open={isNewUpdateOpen} onOpenChange={setIsNewUpdateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Request Update
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Request Contact Information Update</DialogTitle>
                  <DialogDescription>
                    Submit a request to update your contact information
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Information Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select information type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(updateTypeConfig).map(([value, config]) => (
                                <SelectItem key={value} value={value}>
                                  <div className="flex items-center gap-2">
                                    <config.icon className="h-4 w-4" />
                                    {config.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {updateTypeConfig[field.value]?.description}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currentValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Information</FormLabel>
                          <FormControl>
                            <Input {...field} disabled className="bg-muted" />
                          </FormControl>
                          <FormDescription>
                            This is your current information on file
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="newValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Information</FormLabel>
                          <FormControl>
                            {selectedType === UpdateType.ADDRESS ? (
                              <Textarea
                                placeholder="Enter your new address..."
                                {...field}
                              />
                            ) : (
                              <Input
                                placeholder={`Enter your new ${updateTypeConfig[selectedType]?.label.toLowerCase()}...`}
                                {...field}
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason for Change</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Please explain why you need to update this information..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Provide a clear reason to help expedite the review process
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="effectiveDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Effective Date (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              min={format(new Date(), 'yyyy-MM-dd')}
                              {...field}
                              value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                              onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormDescription>
                            When would you like this change to take effect?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsNewUpdateOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="gap-2">
                        <Send className="h-4 w-4" />
                        Submit Request
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="current" className="space-y-4">
            <TabsList>
              <TabsTrigger value="current">Current Information</TabsTrigger>
              <TabsTrigger value="requests">Update Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Current Contact Information</CardTitle>
                  <CardDescription>
                    Your contact information currently on file
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Email Address</p>
                          <p className="text-sm text-muted-foreground">{currentContactInfo.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <Phone className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Phone Number</p>
                          <p className="text-sm text-muted-foreground">{currentContactInfo.phone}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <MapPin className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Home Address</p>
                          <p className="text-sm text-muted-foreground">{currentContactInfo.address}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 border rounded-lg">
                        <Users className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Emergency Contact</p>
                          <p className="text-sm text-muted-foreground">
                            {currentContactInfo.emergencyContact.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {currentContactInfo.emergencyContact.phone} • {currentContactInfo.emergencyContact.relationship}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center pt-4">
                    <Button onClick={() => setIsNewUpdateOpen(true)} className="gap-2">
                      <Edit className="h-4 w-4" />
                      Request Update
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requests" className="space-y-4">
              {contactUpdates.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contactUpdates.map((update) => {
                        const typeConfig = updateTypeConfig[update.type]
                        const statusConf = statusConfig[update.status]
                        
                        return (
                          <TableRow key={update.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <typeConfig.icon className="h-4 w-4" />
                                <Badge variant="outline" className={typeConfig.color}>
                                  {typeConfig.label}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm">
                                  <span className="text-muted-foreground">From:</span> {update.currentValue}
                                </div>
                                <div className="text-sm">
                                  <span className="text-muted-foreground">To:</span> {update.newValue}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={statusConf.variant} className="gap-1">
                                {(() => {
                                  const IconComponent = statusConf.icon;
                                  return <IconComponent className="h-3 w-3" />;
                                })()}
                                {statusConf.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {format(update.createdAt, 'MMM dd, yyyy')}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setSelectedUpdate(update)}
                                  >
                                    <History className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Update Request Details</DialogTitle>
                                    <DialogDescription>
                                      {updateTypeConfig[selectedUpdate?.type as keyof typeof updateTypeConfig]?.label || 'Unknown'} update request
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedUpdate && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm font-medium text-muted-foreground">Type</p>
                                          <div className="flex items-center gap-2">
                                             {(() => {
                                               const config = updateTypeConfig[selectedUpdate.type as keyof typeof updateTypeConfig];
                                               const IconComponent = config?.icon;
                                               return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
                                             })()}
                                             <Badge variant="outline" className={updateTypeConfig[selectedUpdate.type as keyof typeof updateTypeConfig]?.color || 'bg-gray-100 text-gray-800'}>
                                               {updateTypeConfig[selectedUpdate.type as keyof typeof updateTypeConfig]?.label || 'Unknown'}
                                             </Badge>
                                          </div>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-muted-foreground">Status</p>
                                          <Badge variant={statusConfig[selectedUpdate.status as keyof typeof statusConfig]?.variant || 'secondary'} className="gap-1">
                                            {(() => {
                                              const config = statusConfig[selectedUpdate.status as keyof typeof statusConfig];
                                              const IconComponent = config?.icon;
                                              return IconComponent ? <IconComponent className="h-3 w-3" /> : null;
                                            })()}
                                            {statusConfig[selectedUpdate.status as keyof typeof statusConfig]?.label || 'Unknown'}
                                          </Badge>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                                          <p className="text-sm">{format(selectedUpdate.createdAt, 'PPP')}</p>
                                        </div>
                                        {selectedUpdate.effectiveDate && (
                                          <div>
                                            <p className="text-sm font-medium text-muted-foreground">Effective Date</p>
                                            <p className="text-sm">{format(selectedUpdate.effectiveDate, 'PPP')}</p>
                                          </div>
                                        )}
                                      </div>
                                      
                                      <Separator />
                                      
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-2">Current Information</p>
                                        <p className="text-sm bg-muted p-3 rounded-md">
                                          {selectedUpdate.currentValue}
                                        </p>
                                      </div>
                                      
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-2">Requested Change</p>
                                        <p className="text-sm bg-blue-50 border border-blue-200 p-3 rounded-md">
                                          {selectedUpdate.newValue}
                                        </p>
                                      </div>
                                      
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-2">Reason</p>
                                        <p className="text-sm bg-muted p-3 rounded-md">
                                          {selectedUpdate.reason}
                                        </p>
                                      </div>
                                      
                                      {selectedUpdate.reviewNotes && (
                                        <div>
                                          <p className="text-sm font-medium text-muted-foreground mb-2">Review Notes</p>
                                          <div className="bg-green-50 border border-green-200 p-3 rounded-md">
                                            <p className="text-sm">{selectedUpdate.reviewNotes}</p>
                                            {selectedUpdate.reviewedBy && (
                                              <p className="text-xs text-muted-foreground mt-2">
                                                Reviewed by {selectedUpdate.reviewedBy} on {format(selectedUpdate.updatedAt, 'PPP')}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Update Requests</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't submitted any contact information update requests yet.
                  </p>
                  <Button onClick={() => setIsNewUpdateOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Submit Your First Request
                  </Button>
                </div>
              )}

              {/* Summary Stats */}
              {contactUpdates.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{contactUpdates.length}</div>
                    <div className="text-sm text-muted-foreground">Total Requests</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {contactUpdates.filter(u => u.status === UpdateStatus.PENDING || u.status === UpdateStatus.UNDER_REVIEW).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {contactUpdates.filter(u => u.status === UpdateStatus.APPROVED || u.status === UpdateStatus.COMPLETED).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Approved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {contactUpdates.filter(u => u.status === UpdateStatus.COMPLETED).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
