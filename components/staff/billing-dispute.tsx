'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { 
  AlertTriangle,
  MessageSquare,
  Plus,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter,
  FileText,
  Upload,
  Paperclip
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
import { Separator } from '@/components/ui/separator'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useBillingDisputes } from '@/hooks/use-billing'
import { ChargeType } from '@/lib/types/billing'
import { cn } from '@/lib/utils'

interface BillingDisputeProps {
  staffId: string
  chargeId?: string
  onDisputeSubmitted?: (disputeId: string) => void
}

// Dispute types and statuses
enum DisputeType {
  INCORRECT_AMOUNT = 'incorrect_amount',
  UNAUTHORIZED_CHARGE = 'unauthorized_charge',
  BILLING_ERROR = 'billing_error',
  PRORATION_ERROR = 'proration_error',
  OTHER = 'other'
}

enum DisputeStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  REJECTED = 'rejected'
}

const disputeTypeConfig = {
  [DisputeType.INCORRECT_AMOUNT]: {
    label: 'Incorrect Amount',
    description: 'The charged amount is incorrect or different from expected',
    color: 'bg-red-100 text-red-800'
  },
  [DisputeType.UNAUTHORIZED_CHARGE]: {
    label: 'Unauthorized Charge',
    description: 'Charge was applied without authorization or notice',
    color: 'bg-orange-100 text-orange-800'
  },
  [DisputeType.BILLING_ERROR]: {
    label: 'Billing Error',
    description: 'Error in billing calculation or application',
    color: 'bg-yellow-100 text-yellow-800'
  },
  [DisputeType.PRORATION_ERROR]: {
    label: 'Proration Error',
    description: 'Incorrect proration calculation for partial periods',
    color: 'bg-blue-100 text-blue-800'
  },
  [DisputeType.OTHER]: {
    label: 'Other',
    description: 'Other billing-related issues',
    color: 'bg-gray-100 text-gray-800'
  }
}

const statusConfig = {
  [DisputeStatus.SUBMITTED]: {
    label: 'Submitted',
    variant: 'secondary' as const,
    icon: Clock,
    color: 'text-blue-600'
  },
  [DisputeStatus.UNDER_REVIEW]: {
    label: 'Under Review',
    variant: 'default' as const,
    icon: MessageSquare,
    color: 'text-yellow-600'
  },
  [DisputeStatus.INVESTIGATING]: {
    label: 'Investigating',
    variant: 'default' as const,
    icon: AlertTriangle,
    color: 'text-orange-600'
  },
  [DisputeStatus.RESOLVED]: {
    label: 'Resolved',
    variant: 'outline' as const,
    icon: CheckCircle,
    color: 'text-green-600'
  },
  [DisputeStatus.REJECTED]: {
    label: 'Rejected',
    variant: 'destructive' as const,
    icon: XCircle,
    color: 'text-red-600'
  }
}

// Form schema for new dispute
const disputeSchema = z.object({
  chargeId: z.string().min(1, 'Please select a charge'),
  type: z.nativeEnum(DisputeType),
  subject: z.string().min(1, 'Subject is required').max(100),
  description: z.string().min(10, 'Please provide more details').max(1000),
  expectedAmount: z.number().min(0).optional(),
  attachments: z.array(z.string()).optional(),
})

type DisputeForm = z.infer<typeof disputeSchema>

// Mock disputes data
const mockDisputes = [
  {
    id: '1',
    staffId: 'staff-1',
    chargeId: 'charge-1',
    type: DisputeType.INCORRECT_AMOUNT,
    subject: 'Incorrect Utility Charge Amount',
    description: 'The utility charge for January 2024 shows $125.50, but based on my usage and the rate card, it should be around $95.00. I was away for 10 days during the month.',
    expectedAmount: 95.00,
    status: DisputeStatus.UNDER_REVIEW,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-26'),
    charge: {
      id: 'charge-1',
      type: ChargeType.UTILITIES,
      amount: 125.50,
      description: 'Electricity and water usage for January 2024',
      billingPeriod: 'January 2024'
    },
    response: 'We are reviewing your utility usage records and will get back to you within 3 business days.',
    responseDate: new Date('2024-01-26')
  },
  {
    id: '2',
    staffId: 'staff-1',
    chargeId: 'charge-2',
    type: DisputeType.PRORATION_ERROR,
    subject: 'Incorrect Rent Proration',
    description: 'I moved in on December 16th, but the rent charge shows full month amount instead of prorated amount for 15 days.',
    expectedAmount: 425.00,
    status: DisputeStatus.RESOLVED,
    createdAt: new Date('2023-12-20'),
    updatedAt: new Date('2023-12-22'),
    charge: {
      id: 'charge-2',
      type: ChargeType.RENT,
      amount: 850.00,
      description: 'Monthly rent for Room 204',
      billingPeriod: 'December 2023'
    },
    response: 'You are correct. The proration was not applied correctly. We have adjusted your charge to $425.00 and the difference will be credited to your next billing period.',
    responseDate: new Date('2023-12-22'),
    resolution: 'Charge adjusted from $850.00 to $425.00. Credit of $425.00 applied to January 2024 billing.'
  }
]

// Mock available charges for dispute
const mockAvailableCharges = [
  {
    id: 'charge-1',
    type: ChargeType.UTILITIES,
    amount: 125.50,
    description: 'Electricity and water usage for January 2024',
    billingPeriod: 'January 2024',
    date: new Date('2024-01-01')
  },
  {
    id: 'charge-4',
    type: ChargeType.RENT,
    amount: 850.00,
    description: 'Monthly rent for Room 204',
    billingPeriod: 'February 2024',
    date: new Date('2024-02-01')
  }
]

export function BillingDispute({ staffId, chargeId, onDisputeSubmitted }: BillingDisputeProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [isNewDisputeOpen, setIsNewDisputeOpen] = useState(false)
  const [selectedDispute, setSelectedDispute] = useState<any>(null)

  // In real implementation, this would fetch data based on staffId
  const { disputes, isLoading, error, createDispute } = useBillingDisputes(staffId)
  
  // Use mock data for demonstration
  const billingDisputes = mockDisputes

  const form = useForm<DisputeForm>({
    resolver: zodResolver(disputeSchema),
    defaultValues: {
      chargeId: chargeId || '',
      type: DisputeType.INCORRECT_AMOUNT,
      subject: '',
      description: '',
      attachments: [],
    },
  })

  // Filter disputes based on search and filters
  const filteredDisputes = billingDisputes.filter(dispute => {
    const matchesSearch = searchTerm === '' || 
      dispute.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter
    const matchesType = typeFilter === 'all' || dispute.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const onSubmit = async (data: DisputeForm) => {
    try {
      // In real implementation, this would call the API
      console.log('Submitting dispute:', data)
      
      // Mock successful submission
      setIsNewDisputeOpen(false)
      form.reset()
      onDisputeSubmitted?.('new-dispute-id')
    } catch (error) {
      console.error('Failed to submit dispute:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading billing disputes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Failed to load billing disputes</p>
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
                <AlertTriangle className="h-5 w-5" />
                Billing Disputes
              </CardTitle>
              <CardDescription>
                Submit and track disputes for billing charges and inquiries
              </CardDescription>
            </div>
            <Dialog open={isNewDisputeOpen} onOpenChange={setIsNewDisputeOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Dispute
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Submit Billing Dispute</DialogTitle>
                  <DialogDescription>
                    Dispute a charge or report a billing issue
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="chargeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Charge to Dispute</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a charge" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mockAvailableCharges.map((charge) => (
                                <SelectItem key={charge.id} value={charge.id}>
                                  <div className="flex items-center justify-between w-full">
                                    <span>{charge.description}</span>
                                    <span className="ml-2 font-medium">${charge.amount}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose the charge you want to dispute
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dispute Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select dispute type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(disputeTypeConfig).map(([value, config]) => (
                                <SelectItem key={value} value={value}>
                                  {config.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {disputeTypeConfig[field.value]?.description}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="Brief description of the issue" {...field} />
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
                          <FormLabel>Detailed Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Please provide detailed information about the dispute..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            The more details you provide, the faster we can resolve your dispute
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expectedAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Amount (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormDescription>
                            If disputing an amount, what do you believe the correct amount should be?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsNewDisputeOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="gap-2">
                        <Send className="h-4 w-4" />
                        Submit Dispute
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
                  placeholder="Search disputes..."
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
                {Object.entries(disputeTypeConfig).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Disputes Table */}
          {filteredDisputes.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Charge</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDisputes.map((dispute) => (
                    <TableRow key={dispute.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{dispute.subject}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {dispute.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={disputeTypeConfig[dispute.type].color}
                        >
                          {disputeTypeConfig[dispute.type].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">${dispute.charge.amount}</div>
                          <div className="text-muted-foreground">{dispute.charge.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[dispute.status].variant} className="gap-1">
                          {(() => {
                            const IconComponent = statusConfig[dispute.status].icon;
                            return <IconComponent className="h-3 w-3" />;
                          })()}
                          {statusConfig[dispute.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {format(dispute.createdAt, 'MMM dd, yyyy')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedDispute(dispute)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Dispute Details</DialogTitle>
                              <DialogDescription>
                                {selectedDispute?.subject}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedDispute && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                                    <Badge 
                                      variant="outline" 
                                      className={disputeTypeConfig[selectedDispute.type].color}
                                    >
                                      {disputeTypeConfig[selectedDispute.type].label}
                                    </Badge>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    <Badge variant={statusConfig[selectedDispute.status].variant} className="gap-1">
                                      {(() => {
                                        const IconComponent = statusConfig[selectedDispute.status].icon;
                                        return <IconComponent className="h-3 w-3" />;
                                      })()}
                                      {statusConfig[selectedDispute.status].label}
                                    </Badge>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Disputed Charge</p>
                                    <p className="text-sm font-semibold">${selectedDispute.charge.amount}</p>
                                    <p className="text-xs text-muted-foreground">{selectedDispute.charge.description}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                                    <p className="text-sm">{format(selectedDispute.createdAt, 'PPP')}</p>
                                  </div>
                                  {selectedDispute.expectedAmount && (
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Expected Amount</p>
                                      <p className="text-sm font-semibold">${selectedDispute.expectedAmount}</p>
                                    </div>
                                  )}
                                </div>
                                
                                <Separator />
                                
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                                  <p className="text-sm bg-muted p-3 rounded-md">
                                    {selectedDispute.description}
                                  </p>
                                </div>
                                
                                {selectedDispute.response && (
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Response</p>
                                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
                                      <p className="text-sm">{selectedDispute.response}</p>
                                      {selectedDispute.responseDate && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                          Responded on {format(selectedDispute.responseDate, 'PPP')}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                {selectedDispute.resolution && (
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Resolution</p>
                                    <div className="bg-green-50 border border-green-200 p-3 rounded-md">
                                      <p className="text-sm">{selectedDispute.resolution}</p>
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
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Disputes Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'No disputes match your current filters.'
                  : 'You haven\'t submitted any billing disputes yet.'
                }
              </p>
              <Button onClick={() => setIsNewDisputeOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Submit Your First Dispute
              </Button>
            </div>
          )}

          {/* Summary Stats */}
          {billingDisputes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold">{billingDisputes.length}</div>
                <div className="text-sm text-muted-foreground">Total Disputes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {billingDisputes.filter(d => d.status === DisputeStatus.SUBMITTED || d.status === DisputeStatus.UNDER_REVIEW || d.status === DisputeStatus.INVESTIGATING).length}
                </div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {billingDisputes.filter(d => d.status === DisputeStatus.RESOLVED).length}
                </div>
                <div className="text-sm text-muted-foreground">Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {billingDisputes.filter(d => d.status === DisputeStatus.REJECTED).length}
                </div>
                <div className="text-sm text-muted-foreground">Rejected</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
