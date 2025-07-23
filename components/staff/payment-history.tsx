'use client'

import { useState } from 'react'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { 
  CreditCard,
  Calendar,
  Filter,
  Search,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { Separator } from '@/components/ui/separator'
import { usePaymentHistory } from '@/hooks/use-billing'
import { ChargeType } from '@/lib/types/billing'
import { cn } from '@/lib/utils'

interface PaymentHistoryProps {
  staffId: string
  onExportData?: (data: any[]) => void
}

// Payment types and statuses
enum PaymentMethod {
  PAYROLL_DEDUCTION = 'payroll_deduction',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
  CHECK = 'check',
  OTHER = 'other'
}

enum PaymentStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

const paymentMethodConfig = {
  [PaymentMethod.PAYROLL_DEDUCTION]: {
    label: 'Payroll Deduction',
    description: 'Automatic deduction from salary',
    color: 'bg-blue-100 text-blue-800',
    icon: CreditCard
  },
  [PaymentMethod.BANK_TRANSFER]: {
    label: 'Bank Transfer',
    description: 'Direct bank transfer payment',
    color: 'bg-green-100 text-green-800',
    icon: CreditCard
  },
  [PaymentMethod.CASH]: {
    label: 'Cash',
    description: 'Cash payment',
    color: 'bg-yellow-100 text-yellow-800',
    icon: DollarSign
  },
  [PaymentMethod.CHECK]: {
    label: 'Check',
    description: 'Check payment',
    color: 'bg-purple-100 text-purple-800',
    icon: Receipt
  },
  [PaymentMethod.OTHER]: {
    label: 'Other',
    description: 'Other payment method',
    color: 'bg-gray-100 text-gray-800',
    icon: CreditCard
  }
}

const statusConfig = {
  [PaymentStatus.PENDING]: {
    label: 'Pending',
    variant: 'secondary' as const,
    icon: Clock,
    color: 'text-yellow-600'
  },
  [PaymentStatus.PROCESSED]: {
    label: 'Processed',
    variant: 'default' as const,
    icon: Clock,
    color: 'text-blue-600'
  },
  [PaymentStatus.COMPLETED]: {
    label: 'Completed',
    variant: 'outline' as const,
    icon: CheckCircle,
    color: 'text-green-600'
  },
  [PaymentStatus.FAILED]: {
    label: 'Failed',
    variant: 'destructive' as const,
    icon: AlertCircle,
    color: 'text-red-600'
  },
  [PaymentStatus.REFUNDED]: {
    label: 'Refunded',
    variant: 'outline' as const,
    icon: TrendingDown,
    color: 'text-orange-600'
  }
}

// Mock payment history data
const mockPaymentHistory = [
  {
    id: '1',
    staffId: 'staff-1',
    amount: 975.50,
    method: PaymentMethod.PAYROLL_DEDUCTION,
    status: PaymentStatus.COMPLETED,
    description: 'January 2024 - Rent, Utilities, Transport',
    paymentDate: new Date('2024-01-31'),
    processedDate: new Date('2024-01-31'),
    reference: 'PAY-2024-01-001',
    charges: [
      { type: ChargeType.RENT, amount: 850.00, description: 'Monthly rent' },
      { type: ChargeType.UTILITIES, amount: 125.50, description: 'Utilities' }
    ],
    monthYear: '2024-01',
    createdAt: new Date('2024-01-31'),
    updatedAt: new Date('2024-01-31')
  },
  {
    id: '2',
    staffId: 'staff-1',
    amount: 960.00,
    method: PaymentMethod.PAYROLL_DEDUCTION,
    status: PaymentStatus.COMPLETED,
    description: 'December 2023 - Rent, Utilities',
    paymentDate: new Date('2023-12-31'),
    processedDate: new Date('2023-12-31'),
    reference: 'PAY-2023-12-001',
    charges: [
      { type: ChargeType.RENT, amount: 850.00, description: 'Monthly rent' },
      { type: ChargeType.UTILITIES, amount: 110.00, description: 'Utilities' }
    ],
    monthYear: '2023-12',
    createdAt: new Date('2023-12-31'),
    updatedAt: new Date('2023-12-31')
  },
  {
    id: '3',
    staffId: 'staff-1',
    amount: 965.00,
    method: PaymentMethod.PAYROLL_DEDUCTION,
    status: PaymentStatus.COMPLETED,
    description: 'November 2023 - Rent, Utilities',
    paymentDate: new Date('2023-11-30'),
    processedDate: new Date('2023-11-30'),
    reference: 'PAY-2023-11-001',
    charges: [
      { type: ChargeType.RENT, amount: 850.00, description: 'Monthly rent' },
      { type: ChargeType.UTILITIES, amount: 115.00, description: 'Utilities' }
    ],
    monthYear: '2023-11',
    createdAt: new Date('2023-11-30'),
    updatedAt: new Date('2023-11-30')
  },
  {
    id: '4',
    staffId: 'staff-1',
    amount: 45.00,
    method: PaymentMethod.CASH,
    status: PaymentStatus.COMPLETED,
    description: 'Transport charges - Additional trips',
    paymentDate: new Date('2024-01-15'),
    processedDate: new Date('2024-01-15'),
    reference: 'PAY-2024-01-002',
    charges: [
      { type: ChargeType.TRANSPORT, amount: 45.00, description: 'Company shuttle - 3 trips' }
    ],
    monthYear: '2024-01',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '5',
    staffId: 'staff-1',
    amount: 25.00,
    method: PaymentMethod.BANK_TRANSFER,
    status: PaymentStatus.PENDING,
    description: 'Maintenance fee',
    paymentDate: new Date('2024-02-01'),
    reference: 'PAY-2024-02-001',
    charges: [
      { type: ChargeType.OTHER, amount: 25.00, description: 'Room maintenance fee' }
    ],
    monthYear: '2024-02',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  }
]

export function PaymentHistory({ staffId, onExportData }: PaymentHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [methodFilter, setMethodFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: subMonths(new Date(), 6),
    to: new Date()
  })
  const [selectedPayment, setSelectedPayment] = useState<any>(null)

  // In real implementation, this would fetch data based on staffId and filters
  const { payments, isLoading, error } = usePaymentHistory(staffId, dateRange.from && dateRange.to ? { start: dateRange.from, end: dateRange.to } : undefined)
  
  // Use mock data for demonstration
  const paymentHistory = mockPaymentHistory

  // Filter payments based on search and filters
  const filteredPayments = paymentHistory.filter(payment => {
    const matchesSearch = searchTerm === '' || 
      payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    const matchesMethod = methodFilter === 'all' || payment.method === methodFilter
    
    const paymentDate = payment.paymentDate
    const matchesDateRange = !dateRange.from || !dateRange.to ||
      (paymentDate >= dateRange.from && paymentDate <= dateRange.to)
    
    return matchesSearch && matchesStatus && matchesMethod && matchesDateRange
  })

  // Calculate summary statistics
  const totalPaid = filteredPayments
    .filter(p => p.status === PaymentStatus.COMPLETED)
    .reduce((sum, payment) => sum + payment.amount, 0)

  const pendingAmount = filteredPayments
    .filter(p => p.status === PaymentStatus.PENDING)
    .reduce((sum, payment) => sum + payment.amount, 0)

  const averagePayment = filteredPayments.length > 0 
    ? totalPaid / filteredPayments.filter(p => p.status === PaymentStatus.COMPLETED).length 
    : 0

  // Group payments by month for trends
  const paymentsByMonth = filteredPayments.reduce((acc, payment) => {
    const monthKey = payment.monthYear
    if (!acc[monthKey]) {
      acc[monthKey] = { payments: [], total: 0 }
    }
    acc[monthKey].payments.push(payment)
    if (payment.status === PaymentStatus.COMPLETED) {
      acc[monthKey].total += payment.amount
    }
    return acc
  }, {} as Record<string, { payments: any[], total: number }>)

  const monthlyTotals = Object.entries(paymentsByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month, total: data.total }))

  // Payment method distribution
  const paymentsByMethod = filteredPayments.reduce((acc, payment) => {
    if (payment.status === PaymentStatus.COMPLETED) {
      acc[payment.method] = (acc[payment.method] || 0) + payment.amount
    }
    return acc
  }, {} as Record<PaymentMethod, number>)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading payment history...</p>
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
            <p className="text-muted-foreground">Failed to load payment history</p>
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
                <CreditCard className="h-5 w-5" />
                Payment History
              </CardTitle>
              <CardDescription>
                Track your payment history and deduction details
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={() => onExportData?.(filteredPayments)}>
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Paid</p>
                        <p className="text-2xl font-bold">${totalPaid.toLocaleString()}</p>
                      </div>
                      <div className="bg-green-100 p-2 rounded-full">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {filteredPayments.filter(p => p.status === PaymentStatus.COMPLETED).length} completed payments
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Pending</p>
                        <p className="text-2xl font-bold">${pendingAmount.toLocaleString()}</p>
                      </div>
                      <div className="bg-yellow-100 p-2 rounded-full">
                        <Clock className="h-4 w-4 text-yellow-600" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {filteredPayments.filter(p => p.status === PaymentStatus.PENDING).length} pending payments
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Average Payment</p>
                        <p className="text-2xl font-bold">${averagePayment.toLocaleString()}</p>
                      </div>
                      <div className="bg-blue-100 p-2 rounded-full">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Per completed payment
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">This Month</p>
                        <p className="text-2xl font-bold">
                          ${paymentsByMonth['2024-01']?.total.toLocaleString() || '0'}
                        </p>
                      </div>
                      <div className="bg-purple-100 p-2 rounded-full">
                        <Calendar className="h-4 w-4 text-purple-600" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      January 2024
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Method Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Distribution of payments by method</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(paymentsByMethod).map(([method, amount]) => {
                      const config = paymentMethodConfig[method as PaymentMethod]
                      const percentage = totalPaid > 0 ? (amount / totalPaid) * 100 : 0
                      
                      return (
                        <div key={method} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className={cn('w-3 h-3 rounded-full', config.color.split(' ')[0])} />
                              <span className="text-sm font-medium">{config.label}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-medium">${amount.toLocaleString()}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              {/* Monthly Payment Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Payment Trends</CardTitle>
                  <CardDescription>Your payment patterns over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyTotals.map((month, index) => {
                      const previousMonth = monthlyTotals[index - 1]
                      const change = previousMonth 
                        ? ((month.total - previousMonth.total) / previousMonth.total) * 100 
                        : 0
                      
                      return (
                        <div key={month.month} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">
                              {format(new Date(month.month + '-01'), 'MMMM yyyy')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {paymentsByMonth[month.month]?.payments.length || 0} payments
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${month.total.toLocaleString()}</p>
                            {previousMonth && (
                              <div className="flex items-center gap-1">
                                {change >= 0 ? (
                                  <TrendingUp className="h-3 w-3 text-red-500" />
                                ) : (
                                  <TrendingDown className="h-3 w-3 text-green-500" />
                                )}
                                <span className={cn(
                                  "text-xs",
                                  change >= 0 ? "text-red-600" : "text-green-600"
                                )}>
                                  {Math.abs(change).toFixed(1)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              {/* Filters */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search payments..."
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
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    {Object.entries(paymentMethodConfig).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <DatePickerWithRange
                  date={dateRange.from && dateRange.to ? { from: dateRange.from, to: dateRange.to } : undefined}
                  onDateChange={(range) => {
                    setDateRange({
                      from: range?.from,
                      to: range?.to
                    })
                  }}
                />
              </div>

              {/* Payments Table */}
              {filteredPayments.length > 0 ? (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment) => {
                        const methodConfig = paymentMethodConfig[payment.method]
                        const statusConf = statusConfig[payment.status]
                        
                        return (
                          <TableRow key={payment.id}>
                            <TableCell>
                              <div className="text-sm">
                                {format(payment.paymentDate, 'MMM dd, yyyy')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{payment.description}</div>
                                <div className="text-sm text-muted-foreground">
                                  {payment.charges.length} charge{payment.charges.length !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={methodConfig.color}>
                                {methodConfig.label}
                              </Badge>
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
                              <span className="text-sm font-mono">{payment.reference}</span>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ${payment.amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setSelectedPayment(payment)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Payment Details</DialogTitle>
                                    <DialogDescription>
                                      {selectedPayment?.description}
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedPayment && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm font-medium text-muted-foreground">Payment Date</p>
                                          <p className="text-sm">{format(selectedPayment.paymentDate, 'PPP')}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-muted-foreground">Amount</p>
                                          <p className="text-lg font-semibold">${selectedPayment.amount.toLocaleString()}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-muted-foreground">Method</p>
                                          <Badge variant="outline" className={paymentMethodConfig[selectedPayment.method as keyof typeof paymentMethodConfig]?.color || 'text-gray-600'}>
                                            {paymentMethodConfig[selectedPayment.method as keyof typeof paymentMethodConfig]?.label || selectedPayment.method}
                                          </Badge>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-muted-foreground">Status</p>
                                          <Badge variant={statusConfig[selectedPayment.status as keyof typeof statusConfig]?.variant as any || 'secondary'} className="gap-1">
                                            {(() => {
                                              const config = statusConfig[selectedPayment.status as keyof typeof statusConfig];
                                              if (config?.icon) {
                                                const IconComponent = config.icon;
                                                return <IconComponent className="h-3 w-3" />;
                                              }
                                              return null;
                                            })()}
                                            {statusConfig[selectedPayment.status as keyof typeof statusConfig]?.label || selectedPayment.status}
                                          </Badge>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-muted-foreground">Reference</p>
                                          <p className="text-sm font-mono">{selectedPayment.reference}</p>
                                        </div>
                                        {selectedPayment.processedDate && (
                                          <div>
                                            <p className="text-sm font-medium text-muted-foreground">Processed Date</p>
                                            <p className="text-sm">{format(selectedPayment.processedDate, 'PPP')}</p>
                                          </div>
                                        )}
                                      </div>
                                      
                                      <Separator />
                                      
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-3">Charge Breakdown</p>
                                        <div className="space-y-2">
                                          {selectedPayment.charges.map((charge: any, index: number) => (
                                            <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                                              <div>
                                                <span className="text-sm font-medium">{charge.description}</span>
                                                <Badge variant="outline" className="ml-2 text-xs">
                                                  {charge.type.replace('_', ' ').toLowerCase()}
                                                </Badge>
                                              </div>
                                              <span className="text-sm font-medium">${charge.amount.toLocaleString()}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
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
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Payments Found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== 'all' || methodFilter !== 'all'
                      ? 'No payments match your current filters.'
                      : 'No payment history available for the selected period.'
                    }
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
