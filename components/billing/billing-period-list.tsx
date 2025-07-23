'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { 
  Calendar,
  Clock,
  DollarSign,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBillingPeriods } from '@/hooks/use-billing'
import { BillingStatus, type BillingFilters } from '@/lib/types/billing'

interface BillingPeriodListProps {
  onCreatePeriod?: () => void
  onViewPeriod?: (periodId: string) => void
  onEditPeriod?: (periodId: string) => void
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

export function BillingPeriodList({ 
  onCreatePeriod, 
  onViewPeriod, 
  onEditPeriod 
}: BillingPeriodListProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<BillingStatus | 'all'>('all')
  
  const filters: BillingFilters = {
    ...(statusFilter !== 'all' && { status: statusFilter }),
    ...(search && { search })
  }
  
  const { periods, isLoading, error } = useBillingPeriods(filters)

  const handleAction = (action: string, periodId: string) => {
    switch (action) {
      case 'view':
        onViewPeriod?.(periodId)
        break
      case 'edit':
        onEditPeriod?.(periodId)
        break
      default:
        break
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Failed to load billing periods
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Billing Periods</h2>
          <p className="text-muted-foreground">
            Manage billing periods and track payroll processing
          </p>
        </div>
        <Button onClick={onCreatePeriod} className="gap-2">
          <Plus className="h-4 w-4" />
          New Period
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search billing periods..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as BillingStatus | 'all')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(statusConfig).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Billing Periods Table */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Periods</CardTitle>
          <CardDescription>
            {periods?.length || 0} billing periods found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : periods && periods.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Export Date</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.map((period) => {
                  const config = statusConfig[period.status]
                  const Icon = config.icon
                  const duration = Math.ceil(
                    (new Date(period.endDate).getTime() - new Date(period.startDate).getTime()) / 
                    (1000 * 60 * 60 * 24)
                  )

                  return (
                    <TableRow key={period.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {format(new Date(period.startDate), 'MMM dd')} - {format(new Date(period.endDate), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {period.id.slice(0, 8)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.variant} className="gap-1">
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {duration} days
                        </div>
                      </TableCell>
                      <TableCell>
                        {period.payrollExportDate ? (
                          <div className="text-sm">
                            {format(new Date(period.payrollExportDate), 'MMM dd, yyyy')}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not exported</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(period.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleAction('view', period.id)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('edit', period.id)}>
                              Edit Period
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Process Charges</DropdownMenuItem>
                            <DropdownMenuItem>Export to Payroll</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No billing periods found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first billing period
              </p>
              <Button onClick={onCreatePeriod} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Billing Period
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
