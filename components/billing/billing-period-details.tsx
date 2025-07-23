'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { 
  Calendar,
  Clock,
  DollarSign,
  Users,
  FileText,
  Download,
  Eye,
  Edit,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { useBillingPeriods, useCharges } from '@/hooks/use-billing'
import { BillingStatus, ChargeType, type BillingPeriod } from '@/lib/types/billing'

interface BillingPeriodDetailsProps {
  periodId: string
  onEdit?: (periodId: string) => void
  onClose?: () => void
}

const statusConfig = {
  [BillingStatus.DRAFT]: {
    label: 'Draft',
    variant: 'secondary' as const,
    icon: FileText,
    color: 'text-gray-600'
  },
  [BillingStatus.PROCESSING]: {
    label: 'Processing',
    variant: 'default' as const,
    icon: Clock,
    color: 'text-blue-600'
  },
  [BillingStatus.COMPLETED]: {
    label: 'Completed',
    variant: 'default' as const,
    icon: CheckCircle,
    color: 'text-green-600'
  },
  [BillingStatus.EXPORTED]: {
    label: 'Exported',
    variant: 'outline' as const,
    icon: CheckCircle,
    color: 'text-purple-600'
  },
  [BillingStatus.CANCELLED]: {
    label: 'Cancelled',
    variant: 'destructive' as const,
    icon: XCircle,
    color: 'text-red-600'
  }
}

const chargeTypeConfig = {
  [ChargeType.RENT]: {
    label: 'Rent',
    color: 'bg-blue-500',
    icon: '🏠'
  },
  [ChargeType.UTILITIES]: {
    label: 'Utilities',
    color: 'bg-yellow-500',
    icon: '⚡'
  },
  [ChargeType.TRANSPORT]: {
    label: 'Transport',
    color: 'bg-green-500',
    icon: '🚌'
  },
  [ChargeType.OTHER]: {
    label: 'Other',
    color: 'bg-gray-500',
    icon: '📋'
  }
}

export function BillingPeriodDetails({ periodId, onEdit, onClose }: BillingPeriodDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview')
  
  const { periods, isLoading: periodsLoading } = useBillingPeriods()
  const { charges, isLoading: chargesLoading } = useCharges({ billingPeriodId: periodId })
  
  const period = periods?.find(p => p.id === periodId)
  const isLoading = periodsLoading || chargesLoading

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  if (!period) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Billing period not found
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const config = statusConfig[period.status]
  const Icon = config.icon
  const duration = Math.ceil(
    (new Date(period.endDate).getTime() - new Date(period.startDate).getTime()) / 
    (1000 * 60 * 60 * 24)
  )

  // Calculate charge statistics
  const totalCharges = charges?.length || 0
  const totalAmount = charges?.reduce((sum, charge) => sum + charge.amount, 0) || 0
  const chargesByType = charges?.reduce((acc, charge) => {
    acc[charge.type] = (acc[charge.type] || 0) + charge.amount
    return acc
  }, {} as Record<ChargeType, number>) || {}

  const uniqueStaff = new Set(charges?.map(charge => charge.staffId) || []).size

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">
              Billing Period Details
            </h2>
            <Badge variant={config.variant} className="gap-1">
              <Icon className="h-3 w-3" />
              {config.label}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {format(new Date(period.startDate), 'MMM dd')} - {format(new Date(period.endDate), 'MMM dd, yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onEdit?.(period.id)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Export Summary
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Process Charges</DropdownMenuItem>
              <DropdownMenuItem>Export to Payroll</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Duration</p>
                <p className="text-2xl font-bold">{duration}</p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Charges</p>
                <p className="text-2xl font-bold">{totalCharges}</p>
                <p className="text-xs text-muted-foreground">line items</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">${totalAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">in deductions</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Staff Affected</p>
                <p className="text-2xl font-bold">{uniqueStaff}</p>
                <p className="text-xs text-muted-foreground">employees</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="charges">Charges ({totalCharges})</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Period Information */}
            <Card>
              <CardHeader>
                <CardTitle>Period Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Period ID</span>
                  <span className="text-sm text-muted-foreground font-mono">
                    {period.id.slice(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Start Date</span>
                  <span className="text-sm">{format(new Date(period.startDate), 'PPP')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">End Date</span>
                  <span className="text-sm">{format(new Date(period.endDate), 'PPP')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant={config.variant} className="gap-1">
                    <Icon className="h-3 w-3" />
                    {config.label}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Export Date</span>
                  <span className="text-sm">
                    {period.payrollExportDate 
                      ? format(new Date(period.payrollExportDate), 'PPP')
                      : 'Not exported'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Created</span>
                  <span className="text-sm">{format(new Date(period.createdAt), 'PPP')}</span>
                </div>
              </CardContent>
            </Card>

            {/* Charge Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Charge Distribution</CardTitle>
                <CardDescription>Breakdown by charge type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(chargesByType).map(([type, amount]) => {
                  const config = chargeTypeConfig[type as ChargeType]
                  const amountValue = Number(amount) || 0
                  const percentage = totalAmount > 0 ? (amountValue / totalAmount) * 100 : 0
                  
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${config.color}`} />
                          <span className="text-sm font-medium">{config.label}</span>
                        </div>
                        <span className="text-sm font-medium">${amountValue.toLocaleString()}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <div className="text-xs text-muted-foreground text-right">
                        {percentage.toFixed(1)}% of total
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="charges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Charges</CardTitle>
              <CardDescription>
                Complete list of charges for this billing period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {charges && charges.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {charges.map((charge) => {
                      const typeConfig = chargeTypeConfig[charge.type]
                      
                      return (
                        <TableRow key={charge.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">
                                {charge.staff?.firstName} {charge.staff?.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ID: {charge.staff?.employeeId}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${typeConfig.color}`} />
                              {typeConfig.label}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">
                              {charge.description}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {charge.startDate && charge.endDate ? 
                                `${format(new Date(charge.startDate), 'MMM dd')} - ${format(new Date(charge.endDate), 'MMM dd')}` :
                                'Full Period'
                              }
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${charge.amount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No charges found</h3>
                  <p className="text-muted-foreground">
                    No charges have been generated for this billing period yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(chargesByType).map(([type, amount]) => {
              const config = chargeTypeConfig[type as ChargeType]
              const amountValue = Number(amount) || 0
              const typeCharges = charges?.filter(c => c.type === type) || []
              const avgAmount = typeCharges.length > 0 ? amountValue / typeCharges.length : 0
              
              return (
                <Card key={type}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${config.color}`} />
                      {config.label} Charges
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                        <p className="text-xl font-bold">${amountValue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Count</p>
                        <p className="text-xl font-bold">{typeCharges.length}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Average per Charge</p>
                      <p className="text-lg font-semibold">${avgAmount.toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
