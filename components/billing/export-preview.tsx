'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { 
  Eye,
  Download,
  FileText,
  Users,
  DollarSign,
  Calendar,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  Info,
  BarChart3
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { usePayrollExport } from '@/hooks/use-billing'
import { ChargeType, type PayrollExportData } from '@/lib/types/billing'

interface ExportPreviewProps {
  billingPeriodId: string
  exportSettings?: {
    format: string
    includeDetails: boolean
    includeMetadata: boolean
    groupByDepartment: boolean
    includeZeroAmounts: boolean
  }
  onConfirmExport?: (data: PayrollExportData[]) => void
  onCancel?: () => void
}

// Mock export data - in real implementation, this would come from the API
const generateMockExportData = (includeZeroAmounts: boolean = false): PayrollExportData[] => {
  const baseData = [
    {
      employeeId: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      totalDeductions: 850.00,
      rentCharges: 600.00,
      utilityCharges: 150.00,
      transportCharges: 100.00,
      otherCharges: 0.00,
      billingPeriod: 'March 2024'
    },
    {
      employeeId: 'EMP002',
      firstName: 'Jane',
      lastName: 'Smith',
      totalDeductions: 720.00,
      rentCharges: 550.00,
      utilityCharges: 120.00,
      transportCharges: 50.00,
      otherCharges: 0.00,
      billingPeriod: 'March 2024'
    },
    {
      employeeId: 'EMP003',
      firstName: 'Mike',
      lastName: 'Johnson',
      totalDeductions: 950.00,
      rentCharges: 700.00,
      utilityCharges: 180.00,
      transportCharges: 70.00,
      otherCharges: 0.00,
      billingPeriod: 'March 2024'
    },
    {
      employeeId: 'EMP004',
      firstName: 'Sarah',
      lastName: 'Wilson',
      totalDeductions: 0.00,
      rentCharges: 0.00,
      utilityCharges: 0.00,
      transportCharges: 0.00,
      otherCharges: 0.00,
      billingPeriod: 'March 2024'
    },
    {
      employeeId: 'EMP005',
      firstName: 'David',
      lastName: 'Brown',
      totalDeductions: 1200.00,
      rentCharges: 800.00,
      utilityCharges: 200.00,
      transportCharges: 150.00,
      otherCharges: 50.00,
      billingPeriod: 'March 2024'
    }
  ]

  return includeZeroAmounts ? baseData : baseData.filter(item => item.totalDeductions > 0)
}

export function ExportPreview({ 
  billingPeriodId, 
  exportSettings,
  onConfirmExport, 
  onCancel 
}: ExportPreviewProps) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'total' | 'employeeId'>('name')
  const [showValidationDetails, setShowValidationDetails] = useState(false)
  
  const { isLoading } = usePayrollExport(billingPeriodId)
  
  const exportData = generateMockExportData(exportSettings?.includeZeroAmounts)
  
  // Filter and sort data
  const filteredData = exportData
    .filter(item => {
      if (!search) return true
      const searchLower = search.toLowerCase()
      return (
        item.firstName.toLowerCase().includes(searchLower) ||
        item.lastName.toLowerCase().includes(searchLower) ||
        item.employeeId.toLowerCase().includes(searchLower)
      )
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        case 'total':
          return b.totalDeductions - a.totalDeductions
        case 'employeeId':
          return a.employeeId.localeCompare(b.employeeId)
        default:
          return 0
      }
    })

  // Calculate summary statistics
  const totalStaff = filteredData.length
  const totalDeductions = filteredData.reduce((sum, item) => sum + item.totalDeductions, 0)
  const totalRent = filteredData.reduce((sum, item) => sum + item.rentCharges, 0)
  const totalUtilities = filteredData.reduce((sum, item) => sum + item.utilityCharges, 0)
  const totalTransport = filteredData.reduce((sum, item) => sum + item.transportCharges, 0)
  const totalOther = filteredData.reduce((sum, item) => sum + item.otherCharges, 0)
  const averageDeduction = totalStaff > 0 ? totalDeductions / totalStaff : 0

  // Validation checks
  const validationIssues = []
  const zeroAmountCount = filteredData.filter(item => item.totalDeductions === 0).length
  const highAmountCount = filteredData.filter(item => item.totalDeductions > 2000).length
  
  if (zeroAmountCount > 0 && !exportSettings?.includeZeroAmounts) {
    validationIssues.push({
      type: 'warning',
      message: `${zeroAmountCount} staff members have zero deductions`,
      suggestion: 'Consider enabling "Include zero amounts" if these should be included'
    })
  }
  
  if (highAmountCount > 0) {
    validationIssues.push({
      type: 'info',
      message: `${highAmountCount} staff members have deductions over $2,000`,
      suggestion: 'Review these amounts for accuracy before export'
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Export Preview</h2>
          <p className="text-muted-foreground">
            Review payroll data before export
          </p>
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button 
            onClick={() => onConfirmExport?.(filteredData)}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Confirm Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                <p className="text-2xl font-bold">{totalStaff}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Deductions</p>
                <p className="text-2xl font-bold">${totalDeductions.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average per Staff</p>
                <p className="text-2xl font-bold">${averageDeduction.toFixed(0)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rent Charges</p>
                <p className="text-2xl font-bold">${totalRent.toLocaleString()}</p>
              </div>
              <div className="text-2xl">🏠</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transport Charges</p>
                <p className="text-2xl font-bold">${totalTransport.toLocaleString()}</p>
              </div>
              <div className="text-2xl">🚌</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation Issues */}
      {validationIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Data Validation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {validationIssues.map((issue, index) => (
              <Alert key={index} variant={issue.type === 'warning' ? 'destructive' : 'default'}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{issue.message}</strong>
                  <br />
                  <span className="text-sm">{issue.suggestion}</span>
                </AlertDescription>
              </Alert>
            ))}
            
            <Dialog open={showValidationDetails} onOpenChange={setShowValidationDetails}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="h-4 w-4" />
                  View Validation Details
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Validation Details</DialogTitle>
                  <DialogDescription>
                    Detailed validation results for the export data
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Records with zero amounts</p>
                      <p className="text-2xl font-bold">{zeroAmountCount}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Records over $2,000</p>
                      <p className="text-2xl font-bold">{highAmountCount}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Data Quality Score</p>
                    <Progress value={85} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      85% - Good data quality, ready for export
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data Preview</CardTitle>
          <CardDescription>
            {filteredData.length} of {exportData.length} records shown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search staff..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="total">Total Amount</SelectItem>
                <SelectItem value="employeeId">Employee ID</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Data Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead className="text-right">Rent</TableHead>
                  <TableHead className="text-right">Utilities</TableHead>
                  <TableHead className="text-right">Transport</TableHead>
                  <TableHead className="text-right">Other</TableHead>
                  <TableHead className="text-right">Total Deductions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {item.firstName} {item.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.employeeId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.rentCharges.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.utilityCharges.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.transportCharges.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.otherCharges.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">
                        ${item.totalDeductions.toFixed(2)}
                      </div>
                      {item.totalDeductions === 0 && (
                        <Badge variant="outline" className="text-xs">
                          Zero Amount
                        </Badge>
                      )}
                      {item.totalDeductions > 2000 && (
                        <Badge variant="secondary" className="text-xs">
                          High Amount
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No data found</h3>
              <p className="text-muted-foreground">
                No staff records match your current search criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Settings Summary */}
      {exportSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Export Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Format</p>
                <Badge variant="outline">{exportSettings.format.toUpperCase()}</Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Options</p>
                <div className="flex flex-wrap gap-1">
                  {exportSettings.includeDetails && (
                    <Badge variant="secondary" className="text-xs">Details</Badge>
                  )}
                  {exportSettings.includeMetadata && (
                    <Badge variant="secondary" className="text-xs">Metadata</Badge>
                  )}
                  {exportSettings.groupByDepartment && (
                    <Badge variant="secondary" className="text-xs">Grouped</Badge>
                  )}
                  {exportSettings.includeZeroAmounts && (
                    <Badge variant="secondary" className="text-xs">Zero Amounts</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charge Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Charge Type Breakdown</CardTitle>
          <CardDescription>Distribution of charges by type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Rent Charges</span>
                <span className="text-sm font-medium">${totalRent.toLocaleString()}</span>
              </div>
              <Progress value={(totalRent / totalDeductions) * 100} className="h-2" />
              <div className="text-xs text-muted-foreground text-right">
                {((totalRent / totalDeductions) * 100).toFixed(1)}% of total
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Utility Charges</span>
                <span className="text-sm font-medium">${totalUtilities.toLocaleString()}</span>
              </div>
              <Progress value={(totalUtilities / totalDeductions) * 100} className="h-2" />
              <div className="text-xs text-muted-foreground text-right">
                {((totalUtilities / totalDeductions) * 100).toFixed(1)}% of total
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Transport Charges</span>
                <span className="text-sm font-medium">${totalTransport.toLocaleString()}</span>
              </div>
              <Progress value={(totalTransport / totalDeductions) * 100} className="h-2" />
              <div className="text-xs text-muted-foreground text-right">
                {((totalTransport / totalDeductions) * 100).toFixed(1)}% of total
              </div>
            </div>

            {totalOther > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Other Charges</span>
                  <span className="text-sm font-medium">${totalOther.toLocaleString()}</span>
                </div>
                <Progress value={(totalOther / totalDeductions) * 100} className="h-2" />
                <div className="text-xs text-muted-foreground text-right">
                  {((totalOther / totalDeductions) * 100).toFixed(1)}% of total
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Final Confirmation */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Ready to Export:</strong> {totalStaff} staff records with total deductions of ${totalDeductions.toLocaleString()}. 
          Please review the data above and click "Confirm Export" when ready to proceed.
        </AlertDescription>
      </Alert>
    </div>
  )
}
