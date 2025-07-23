'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { 
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Calendar,
  Users,
  FileText,
  AlertCircle,
  Plus
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { DateRange } from 'react-day-picker'
import { useCharges } from '@/hooks/use-billing'
import { ChargeType, type BillingFilters } from '@/lib/types/billing'
import { cn } from '@/lib/utils'

interface ChargeListProps {
  billingPeriodId?: string
  onCreateCharge?: () => void
  onEditCharge?: (chargeId: string) => void
  onViewCharge?: (chargeId: string) => void
  onDeleteCharge?: (chargeId: string) => void
}

const chargeTypeConfig = {
  [ChargeType.RENT]: {
    label: 'Rent',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    icon: '🏠'
  },
  [ChargeType.UTILITIES]: {
    label: 'Utilities',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    icon: '⚡'
  },
  [ChargeType.TRANSPORT]: {
    label: 'Transport',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    icon: '🚌'
  },
  [ChargeType.OTHER]: {
    label: 'Other',
    color: 'bg-gray-500',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50',
    icon: '📋'
  }
}

export function ChargeList({ 
  billingPeriodId,
  onCreateCharge, 
  onEditCharge, 
  onViewCharge,
  onDeleteCharge 
}: ChargeListProps) {
  const [search, setSearch] = useState('')
  const [chargeTypeFilter, setChargeTypeFilter] = useState<ChargeType | 'all'>('all')
  const [staffFilter, setStaffFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [amountRange, setAmountRange] = useState({ min: '', max: '' })
  
  const filters: BillingFilters = {
    ...(billingPeriodId && { billingPeriodId }),
    ...(chargeTypeFilter !== 'all' && { chargeType: chargeTypeFilter }),
    ...(staffFilter !== 'all' && { staffId: staffFilter }),
    ...(search && { search }),
    ...(dateRange?.from && dateRange?.to && {
      dateRange: { start: dateRange.from, end: dateRange.to }
    }),
    ...(amountRange.min && amountRange.max && {
      amountRange: { 
        min: parseFloat(amountRange.min), 
        max: parseFloat(amountRange.max) 
      }
    })
  }
  
  const { charges, isLoading, error } = useCharges(filters)

  const handleAction = (action: string, chargeId: string) => {
    switch (action) {
      case 'view':
        onViewCharge?.(chargeId)
        break
      case 'edit':
        onEditCharge?.(chargeId)
        break
      case 'delete':
        onDeleteCharge?.(chargeId)
        break
      default:
        break
    }
  }

  // Calculate summary statistics
  const totalCharges = charges?.length || 0
  const totalAmount = charges?.reduce((sum, charge) => sum + charge.amount, 0) || 0
  const averageAmount = totalCharges > 0 ? totalAmount / totalCharges : 0
  const chargesByType = charges?.reduce((acc, charge) => {
    acc[charge.type] = (acc[charge.type] || 0) + 1
    return acc
  }, {} as Record<ChargeType, number>) || {}

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Failed to load charges
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
          <h2 className="text-2xl font-bold tracking-tight">Charges</h2>
          <p className="text-muted-foreground">
            Manage billing charges and adjustments
          </p>
        </div>
        <Button onClick={onCreateCharge} className="gap-2">
          <Plus className="h-4 w-4" />
          New Charge
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Charges</p>
                <p className="text-2xl font-bold">{totalCharges}</p>
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
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Amount</p>
                <p className="text-2xl font-bold">${averageAmount.toFixed(0)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique Staff</p>
                <p className="text-2xl font-bold">
                  {new Set(charges?.map(c => c.staffId) || []).size}
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search charges..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Charge Type Filter */}
            <Select
              value={chargeTypeFilter}
              onValueChange={(value) => setChargeTypeFilter(value as ChargeType | 'all')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(chargeTypeConfig).map(([type, config]) => (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center gap-2">
                      <span>{config.icon}</span>
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Range Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dateRange && 'text-muted-foreground'
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'LLL dd, y')} -{' '}
                        {format(dateRange.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(dateRange.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            {/* Amount Range */}
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min $"
                value={amountRange.min}
                onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                className="w-full"
              />
              <Input
                type="number"
                placeholder="Max $"
                value={amountRange.max}
                onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                className="w-full"
              />
            </div>
          </div>

          {/* Active Filters Summary */}
          {(chargeTypeFilter !== 'all' || staffFilter !== 'all' || dateRange || search || amountRange.min || amountRange.max) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
              {chargeTypeFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {chargeTypeConfig[chargeTypeFilter].icon}
                  {chargeTypeConfig[chargeTypeFilter].label}
                </Badge>
              )}
              {search && (
                <Badge variant="secondary">
                  Search: "{search}"
                </Badge>
              )}
              {dateRange?.from && dateRange?.to && (
                <Badge variant="secondary">
                  {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd')}
                </Badge>
              )}
              {(amountRange.min || amountRange.max) && (
                <Badge variant="secondary">
                  ${amountRange.min || '0'} - ${amountRange.max || '∞'}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charges Table */}
      <Card>
        <CardHeader>
          <CardTitle>Charges</CardTitle>
          <CardDescription>
            {totalCharges} charges found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : charges && charges.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                        <Badge 
                          variant="outline" 
                          className={cn(
                            'gap-1',
                            typeConfig.textColor,
                            typeConfig.bgColor
                          )}
                        >
                          <span>{typeConfig.icon}</span>
                          {typeConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="truncate font-medium">{charge.description}</p>
                          {charge.source && (
                            <p className="text-xs text-muted-foreground">
                              Source: {charge.source.type}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {charge.startDate && charge.endDate ? (
                            <>
                              <div>{format(new Date(charge.startDate), 'MMM dd')}</div>
                              <div className="text-muted-foreground">
                                to {format(new Date(charge.endDate), 'MMM dd')}
                              </div>
                            </>
                          ) : (
                            <div className="text-muted-foreground">Full Period</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium">${charge.amount.toLocaleString()}</div>
                        {charge.metadata && (charge.metadata as any)?.baseAmount && (charge.metadata as any).baseAmount !== charge.amount && (
                          <div className="text-xs text-muted-foreground">
                            Base: ${((charge.metadata as any).baseAmount as number).toLocaleString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(charge.createdAt), 'MMM dd, yyyy')}
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
                            <DropdownMenuItem onClick={() => handleAction('view', charge.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction('edit', charge.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Charge
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleAction('delete', charge.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Charge
                            </DropdownMenuItem>
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
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No charges found</h3>
              <p className="text-muted-foreground mb-4">
                {Object.keys(filters).length > 1 
                  ? 'Try adjusting your filters to see more results'
                  : 'Get started by creating your first charge'
                }
              </p>
              <Button onClick={onCreateCharge} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Charge
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Type Distribution */}
      {totalCharges > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Charge Distribution</CardTitle>
            <CardDescription>Breakdown by charge type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(chargesByType).map(([type, count]) => {
                const config = chargeTypeConfig[type as ChargeType]
                const countValue = Number(count) || 0
                const percentage = (countValue / totalCharges) * 100
                
                return (
                  <div key={type} className="text-center">
                    <div className={cn(
                      'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2',
                      config.bgColor
                    )}>
                      <span className="text-2xl">{config.icon}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">{config.label}</p>
                      <p className="text-2xl font-bold">{countValue}</p>
                      <p className="text-xs text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
