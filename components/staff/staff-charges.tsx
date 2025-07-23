'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { 
  DollarSign,
  Calendar,
  Filter,
  Search,
  Eye,
  Download,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Home,
  Car,
  Zap,
  Coffee,
  Info
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
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useStaffCharges } from '@/hooks/use-billing'
import { BillingStatus, ChargeType, type ChargeWithDetails } from '@/lib/types/billing'
import { cn } from '@/lib/utils'

interface StaffChargesProps {
  staffId: string
  onViewDetails?: (chargeId: string) => void
  onDispute?: (chargeId: string) => void
}

const chargeTypeConfig = {
  [ChargeType.RENT]: {
    label: 'Rent',
    icon: Home,
    color: 'bg-blue-100 text-blue-800',
    description: 'Monthly housing rent charges'
  },
  [ChargeType.UTILITIES]: {
    label: 'Utilities',
    icon: Zap,
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Electricity, water, and heating charges'
  },
  [ChargeType.TRANSPORT]: {
    label: 'Transport',
    icon: Car,
    color: 'bg-green-100 text-green-800',
    description: 'Company transport and trip charges'
  },
  [ChargeType.OTHER]: {
    label: 'Other',
    icon: Coffee,
    color: 'bg-gray-100 text-gray-800',
    description: 'Miscellaneous charges and fees'
  }
}

// Mock staff charges data - in real implementation, this would come from the API
const mockStaffCharges: ChargeWithDetails[] = [
  {
    id: '1',
    staffId: 'staff-1',
    billingPeriodId: 'bp-1',
    type: ChargeType.RENT,
    amount: 850.00,
    description: 'Monthly rent for Room 204, Riverside Apartments',
    prorationFactor: 1.0,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    staff: {
      id: 'staff-1',
      firstName: 'John',
      lastName: 'Doe',
      employeeId: 'EMP001'
    },
    billingPeriod: {
      id: 'bp-1',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      status: 'active' as any,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  },
  {
    id: '2',
    staffId: 'staff-1',
    billingPeriodId: 'bp-1',
    type: ChargeType.UTILITIES,
    amount: 125.50,
    description: 'Electricity and water usage for January 2024',
    prorationFactor: 1.0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    staff: {
      id: 'staff-1',
      firstName: 'John',
      lastName: 'Doe',
      employeeId: 'EMP001'
    },
    billingPeriod: {
      id: 'bp-1',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      status: 'active' as any,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  },
  {
    id: '3',
    staffId: 'staff-1',
    billingPeriodId: 'bp-1',
    type: ChargeType.TRANSPORT,
    amount: 45.00,
    description: 'Company shuttle service - 3 trips',
    prorationFactor: 1.0,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    staff: {
      id: 'staff-1',
      firstName: 'John',
      lastName: 'Doe',
      employeeId: 'EMP001'
    },
    billingPeriod: {
      id: 'bp-1',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      status: 'active' as any,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  },
  {
    id: '4',
    staffId: 'staff-1',
    billingPeriodId: 'bp-2',
    type: ChargeType.RENT,
    amount: 425.00,
    description: 'Prorated rent for Room 204 (15 days)',
    prorationFactor: 0.5,
    startDate: new Date('2023-12-16'),
    endDate: new Date('2023-12-31'),
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2023-12-01'),
    staff: {
      id: 'staff-1',
      firstName: 'John',
      lastName: 'Doe',
      employeeId: 'EMP001'
    },
    billingPeriod: {
      id: 'bp-2',
      startDate: new Date('2023-12-01'),
      endDate: new Date('2023-12-31'),
      status: 'completed' as any,
      createdAt: new Date('2023-12-01'),
      updatedAt: new Date('2023-12-01')
    }
  }
]

export function StaffCharges({ staffId, onViewDetails, onDispute }: StaffChargesProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [periodFilter, setPeriodFilter] = useState<string>('current')
  const [selectedCharge, setSelectedCharge] = useState<ChargeWithDetails | null>(null)

  // In real implementation, this would fetch data based on staffId
  const { charges, isLoading, error } = useStaffCharges(staffId)
  
  // Use mock data for demonstration
  const staffCharges = mockStaffCharges

  // Filter charges based on search and filters
  const filteredCharges = staffCharges.filter(charge => {
    const matchesSearch = searchTerm === '' || 
      charge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chargeTypeConfig[charge.type].label.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'all' || charge.type === typeFilter
    
    // Simple period filter - in real implementation, this would be more sophisticated
    const matchesPeriod = periodFilter === 'all' || 
      (periodFilter === 'current' && charge.billingPeriod.status === BillingStatus.PROCESSING) ||
      (periodFilter === 'past' && charge.billingPeriod.status === BillingStatus.COMPLETED)
    
    return matchesSearch && matchesType && matchesPeriod
  })

  // Calculate summary statistics
  const totalCharges = filteredCharges.reduce((sum, charge) => sum + charge.amount, 0)
  const chargesByType = filteredCharges.reduce((acc, charge) => {
    acc[charge.type] = (acc[charge.type] || 0) + charge.amount
    return acc
  }, {} as Record<ChargeType, number>)

  const currentMonthCharges = staffCharges.filter(charge => 
    charge.billingPeriod.status === BillingStatus.PROCESSING
  ).reduce((sum, charge) => sum + charge.amount, 0)

  const previousMonthCharges = staffCharges.filter(charge => 
    charge.billingPeriod.status === 'completed'
  ).reduce((sum, charge) => sum + charge.amount, 0)

  const monthlyChange = previousMonthCharges > 0 
    ? ((currentMonthCharges - previousMonthCharges) / previousMonthCharges) * 100 
    : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your charges...</p>
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
            <p className="text-muted-foreground">Failed to load charges</p>
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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Month</p>
                <p className="text-2xl font-bold">${currentMonthCharges.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              {monthlyChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500" />
              )}
              <span className={cn(
                "text-sm font-medium",
                monthlyChange >= 0 ? "text-red-600" : "text-green-600"
              )}>
                {Math.abs(monthlyChange).toFixed(1)}%
              </span>
              <span className="text-sm text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Charges</p>
                <p className="text-2xl font-bold">${totalCharges.toLocaleString()}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {filteredCharges.length} charge{filteredCharges.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Monthly</p>
                <p className="text-2xl font-bold">
                  ${(totalCharges / Math.max(1, new Set(staffCharges.map(c => c.billingPeriodId)).size)).toLocaleString()}
                </p>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Based on billing history
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Largest Charge</p>
                <p className="text-2xl font-bold">
                  ${Math.max(...filteredCharges.map(c => c.amount)).toLocaleString()}
                </p>
              </div>
              <div className="bg-orange-100 p-2 rounded-full">
                <AlertCircle className="h-4 w-4 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {chargeTypeConfig[filteredCharges.find(c => c.amount === Math.max(...filteredCharges.map(c => c.amount)))?.type || ChargeType.RENT].label}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charge Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Charge Breakdown</CardTitle>
          <CardDescription>Distribution of charges by type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(chargesByType).map(([type, amount]) => {
              const config = chargeTypeConfig[type as ChargeType]
              const percentage = totalCharges > 0 ? (amount / totalCharges) * 100 : 0
              
              return (
                <div key={type} className="space-y-2">
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

      {/* Charges List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Your Charges
              </CardTitle>
              <CardDescription>
                Detailed breakdown of all charges applied to your account
              </CardDescription>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search charges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(chargeTypeConfig).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                <SelectItem value="current">Current Month</SelectItem>
                <SelectItem value="past">Past Months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Charges Table */}
          {filteredCharges.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Proration</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCharges.map((charge) => {
                    const config = chargeTypeConfig[charge.type]
                    const IconComponent = config.icon
                    
                    return (
                      <TableRow key={charge.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={cn('p-2 rounded-md', config.color.replace('text-', 'bg-').replace('-800', '-100'))}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium">{charge.description}</div>
                              <div className="text-sm text-muted-foreground">
                                Created {format(charge.createdAt, 'MMM dd, yyyy')}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={config.color}>
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(charge.billingPeriod.startDate, 'MMM yyyy')}
                            {charge.startDate && charge.endDate && (
                              <div className="text-muted-foreground">
                                {format(charge.startDate, 'MMM dd')} - {format(charge.endDate, 'MMM dd')}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {charge.prorationFactor < 1 ? (
                            <div className="flex items-center gap-1">
                              <Badge variant="secondary">
                                {(charge.prorationFactor * 100).toFixed(0)}%
                              </Badge>
                              <Info className="h-3 w-3 text-muted-foreground" />
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Full</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${charge.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setSelectedCharge(charge)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Charge Details</DialogTitle>
                                  <DialogDescription>
                                    Detailed breakdown of this charge
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedCharge && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground">Type</p>
                                        <Badge variant="outline" className={chargeTypeConfig[selectedCharge.type].color}>
                                          {chargeTypeConfig[selectedCharge.type].label}
                                        </Badge>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground">Amount</p>
                                        <p className="text-lg font-semibold">${selectedCharge.amount.toLocaleString()}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground">Billing Period</p>
                                        <p className="text-sm">
                                          {format(selectedCharge.billingPeriod.startDate, 'MMM dd')} - {format(selectedCharge.billingPeriod.endDate, 'MMM dd, yyyy')}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground">Proration Factor</p>
                                        <p className="text-sm">
                                          {(selectedCharge.prorationFactor * 100).toFixed(0)}%
                                          {selectedCharge.prorationFactor < 1 && (
                                            <span className="text-muted-foreground ml-1">(Partial period)</span>
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <Separator />
                                    
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                                      <p className="text-sm bg-muted p-3 rounded-md">
                                        {selectedCharge.description}
                                      </p>
                                    </div>
                                    
                                    {selectedCharge.startDate && selectedCharge.endDate && (
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-2">Charge Period</p>
                                        <p className="text-sm">
                                          {format(selectedCharge.startDate, 'PPP')} to {format(selectedCharge.endDate, 'PPP')}
                                        </p>
                                      </div>
                                    )}
                                    
                                    <div className="flex gap-2 pt-4">
                                      <Button 
                                        variant="outline" 
                                        className="gap-2"
                                        onClick={() => onDispute?.(selectedCharge.id)}
                                      >
                                        <AlertCircle className="h-4 w-4" />
                                        Dispute Charge
                                      </Button>
                                      <Button variant="outline" className="gap-2">
                                        <Download className="h-4 w-4" />
                                        Download Receipt
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Charges Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || typeFilter !== 'all' || periodFilter !== 'all'
                  ? 'No charges match your current filters.'
                  : 'You don\'t have any charges yet.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
