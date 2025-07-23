'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { 
  FileText,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  MessageSquare,
  Send,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useHousingRequests } from '@/hooks/use-housing'
import { cn } from '@/lib/utils'

interface HousingRequestsProps {
  staffId: string
  onRequestSubmitted?: (requestId: string) => void
}

// Housing request types
enum RequestType {
  ROOM_CHANGE = 'room_change',
  MOVE_OUT = 'move_out',
  MAINTENANCE = 'maintenance',
  ROOMMATE_CHANGE = 'roommate_change',
  OTHER = 'other'
}

enum RequestStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed'
}

const requestTypeConfig = {
  [RequestType.ROOM_CHANGE]: {
    label: 'Room Change',
    description: 'Request to move to a different room',
    color: 'bg-blue-100 text-blue-800'
  },
  [RequestType.MOVE_OUT]: {
    label: 'Move Out',
    description: 'Request to terminate housing assignment',
    color: 'bg-red-100 text-red-800'
  },
  [RequestType.MAINTENANCE]: {
    label: 'Maintenance',
    description: 'Report maintenance issues',
    color: 'bg-yellow-100 text-yellow-800'
  },
  [RequestType.ROOMMATE_CHANGE]: {
    label: 'Roommate Change',
    description: 'Request roommate reassignment',
    color: 'bg-purple-100 text-purple-800'
  },
  [RequestType.OTHER]: {
    label: 'Other',
    description: 'Other housing-related requests',
    color: 'bg-gray-100 text-gray-800'
  }
}

const statusConfig = {
  [RequestStatus.PENDING]: {
    label: 'Pending',
    variant: 'secondary' as const,
    icon: Clock,
    color: 'text-yellow-600'
  },
  [RequestStatus.UNDER_REVIEW]: {
    label: 'Under Review',
    variant: 'default' as const,
    icon: MessageSquare,
    color: 'text-blue-600'
  },
  [RequestStatus.APPROVED]: {
    label: 'Approved',
    variant: 'default' as const,
    icon: CheckCircle,
    color: 'text-green-600'
  },
  [RequestStatus.REJECTED]: {
    label: 'Rejected',
    variant: 'destructive' as const,
    icon: XCircle,
    color: 'text-red-600'
  },
  [RequestStatus.COMPLETED]: {
    label: 'Completed',
    variant: 'outline' as const,
    icon: CheckCircle,
    color: 'text-gray-600'
  }
}

// Form schema for new housing request
const housingRequestSchema = z.object({
  type: z.nativeEnum(RequestType),
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(10, 'Please provide more details').max(1000),
  preferredDate: z.date().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
})

type HousingRequestForm = z.infer<typeof housingRequestSchema>

// Mock housing requests data
const mockHousingRequests = [
  {
    id: '1',
    staffId: 'staff-1',
    type: RequestType.ROOM_CHANGE,
    title: 'Request for Room with Better Internet',
    description: 'I work remotely and need a room with more reliable internet connection. My current room has frequent connectivity issues.',
    preferredDate: new Date('2024-02-15'),
    priority: 'medium',
    status: RequestStatus.UNDER_REVIEW,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-22'),
    response: 'We are reviewing available rooms with enhanced internet connectivity. Will update you within 3 business days.',
    responseDate: new Date('2024-01-22')
  },
  {
    id: '2',
    staffId: 'staff-1',
    type: RequestType.MAINTENANCE,
    title: 'Air Conditioning Not Working',
    description: 'The AC unit in my room has stopped working. It makes a loud noise but no cold air comes out.',
    priority: 'high',
    status: RequestStatus.COMPLETED,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12'),
    response: 'Maintenance team has replaced the AC unit. Please test and let us know if there are any issues.',
    responseDate: new Date('2024-01-12')
  },
  {
    id: '3',
    staffId: 'staff-1',
    type: RequestType.ROOMMATE_CHANGE,
    title: 'Roommate Compatibility Issues',
    description: 'Having some compatibility issues with current roommate regarding cleanliness and noise levels. Would appreciate a room change or roommate reassignment.',
    priority: 'medium',
    status: RequestStatus.APPROVED,
    createdAt: new Date('2023-12-15'),
    updatedAt: new Date('2023-12-20'),
    response: 'Approved for room change. New room assignment will be available from February 1st. Please coordinate with property manager for move details.',
    responseDate: new Date('2023-12-20')
  }
]

export function HousingRequests({ staffId, onRequestSubmitted }: HousingRequestsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)

  // In real implementation, this would fetch data based on staffId
  const { requests, isLoading, error, submitRequest, refresh } = useHousingRequests(staffId)
  
  // Use mock data for demonstration
  const housingRequests = mockHousingRequests

  const form = useForm<HousingRequestForm>({
    resolver: zodResolver(housingRequestSchema),
    defaultValues: {
      type: RequestType.ROOM_CHANGE,
      title: '',
      description: '',
      priority: 'medium',
    },
  })

  // Filter requests based on search and filters
  const filteredRequests = housingRequests.filter(request => {
    const matchesSearch = searchTerm === '' || 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesType = typeFilter === 'all' || request.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const handleSubmitRequest = async (data: any) => {
    try {
      await submitRequest(data)
      setIsNewRequestOpen(false)
      form.reset()
      onRequestSubmitted?.('new-request-id')
    } catch (error) {
      console.error('Failed to submit request:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading housing requests...</p>
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
            <p className="text-muted-foreground">Failed to load housing requests</p>
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
                <FileText className="h-5 w-5" />
                Housing Requests
              </CardTitle>
              <CardDescription>
                Submit and track your housing-related requests and changes
              </CardDescription>
            </div>
            <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Request
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Submit Housing Request</DialogTitle>
                  <DialogDescription>
                    Fill out the form below to submit a new housing request
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmitRequest)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Request Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select request type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(requestTypeConfig).map(([value, config]) => (
                                <SelectItem key={value} value={value}>
                                  {config.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {requestTypeConfig[field.value]?.description}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Request Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Brief title for your request" {...field} />
                          </FormControl>
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
                            <Textarea
                              placeholder="Please provide detailed information about your request..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Provide as much detail as possible to help us process your request
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="preferredDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Preferred Date (Optional)</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
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
                                  disabled={(date) =>
                                    date < new Date() || date < new Date("1900-01-01")
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
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsNewRequestOpen(false)}>
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
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(statusConfig).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(requestTypeConfig).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Requests Table */}
          {filteredRequests.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {request.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${requestTypeConfig[request.type as keyof typeof requestTypeConfig]?.color || 'bg-gray-100'} text-xs`}
                        >
                          {requestTypeConfig[request.type as keyof typeof requestTypeConfig]?.label || request.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={request.priority === 'high' ? 'destructive' : 
                                   request.priority === 'medium' ? 'default' : 'secondary'}
                        >
                          {request.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[request.status].variant} className="gap-1">
                          {(() => {
                            const IconComponent = statusConfig[request.status].icon;
                            return <IconComponent className="h-3 w-3" />;
                          })()}
                          {statusConfig[request.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {format(request.createdAt, 'MMM dd, yyyy')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Request Details</DialogTitle>
                              <DialogDescription>
                                {selectedRequest?.title}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedRequest && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                                    <Badge 
                                      variant="outline" 
                                      className={requestTypeConfig[selectedRequest.type as keyof typeof requestTypeConfig]?.color || 'bg-gray-100 text-gray-800'}
                                    >
                                      {requestTypeConfig[selectedRequest.type as keyof typeof requestTypeConfig]?.label || 'Unknown'}
                                    </Badge>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Priority</p>
                                    <Badge 
                                      variant={selectedRequest.priority === 'high' ? 'destructive' : 
                                               selectedRequest.priority === 'medium' ? 'default' : 'secondary'}
                                    >
                                      {selectedRequest.priority}
                                    </Badge>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    <Badge variant={statusConfig[selectedRequest.status as keyof typeof statusConfig]?.variant || 'secondary'} className="gap-1">
                                      {(() => {
                                        const config = statusConfig[selectedRequest.status as keyof typeof statusConfig];
                                        const IconComponent = config?.icon;
                                        return IconComponent ? <IconComponent className="h-3 w-3" /> : null;
                                      })()}
                                      {statusConfig[selectedRequest.status as keyof typeof statusConfig]?.label || 'Unknown'}
                                    </Badge>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                                    <p className="text-sm">{format(selectedRequest.createdAt, 'PPP')}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                                  <p className="text-sm bg-muted p-3 rounded-md">
                                    {selectedRequest.description}
                                  </p>
                                </div>
                                
                                {selectedRequest.preferredDate && (
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Preferred Date</p>
                                    <p className="text-sm">{format(selectedRequest.preferredDate, 'PPP')}</p>
                                  </div>
                                )}
                                
                                {selectedRequest.response && (
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Response</p>
                                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
                                      <p className="text-sm">{selectedRequest.response}</p>
                                      {selectedRequest.responseDate && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                          Responded on {format(selectedRequest.responseDate, 'PPP')}
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
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Requests Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'No requests match your current filters.'
                  : 'You haven\'t submitted any housing requests yet.'
                }
              </p>
              <Button onClick={() => setIsNewRequestOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Submit Your First Request
              </Button>
            </div>
          )}

          {/* Summary Stats */}
          {housingRequests.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold">{housingRequests.length}</div>
                <div className="text-sm text-muted-foreground">Total Requests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {housingRequests.filter(r => r.status === RequestStatus.PENDING || r.status === RequestStatus.UNDER_REVIEW).length}
                </div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {housingRequests.filter(r => r.status === RequestStatus.APPROVED || r.status === RequestStatus.COMPLETED).length}
                </div>
                <div className="text-sm text-muted-foreground">Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {housingRequests.filter(r => r.priority === 'high').length}
                </div>
                <div className="text-sm text-muted-foreground">High Priority</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
