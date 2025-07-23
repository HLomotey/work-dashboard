'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { 
  Download,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  DollarSign,
  Calendar,
  Settings,
  Eye,
  Loader2,
  RefreshCw
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useBillingPeriods, usePayrollExport } from '@/hooks/use-billing'
import { BillingStatus, PayrollExportStatus, type BillingPeriod } from '@/lib/types/billing'

interface PayrollExportProps {
  billingPeriodId?: string
  onExportComplete?: (exportData: any) => void
}

interface ExportSettings {
  format: 'csv' | 'excel' | 'json'
  includeDetails: boolean
  includeMetadata: boolean
  groupByDepartment: boolean
  includeZeroAmounts: boolean
}

export function PayrollExport({ billingPeriodId, onExportComplete }: PayrollExportProps) {
  const [selectedPeriodId, setSelectedPeriodId] = useState(billingPeriodId || '')
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'csv',
    includeDetails: true,
    includeMetadata: false,
    groupByDepartment: false,
    includeZeroAmounts: false
  })
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { periods } = useBillingPeriods()
  const { createExport, exports, isLoading: exportsLoading } = usePayrollExport(selectedPeriodId)

  // Filter periods that are ready for export
  const exportablePeriods = periods?.filter(p => 
    p.status === BillingStatus.COMPLETED || p.status === BillingStatus.EXPORTED
  ) || []

  const selectedPeriod = periods?.find(p => p.id === selectedPeriodId)
  const periodExports = exports?.filter(e => e.billingPeriodId === selectedPeriodId) || []

  // Mock export data for preview - in real implementation, this would come from the API
  const mockExportData = [
    {
      employeeId: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      totalDeductions: 850.00,
      rentCharges: 600.00,
      utilityCharges: 150.00,
      transportCharges: 100.00,
      otherCharges: 0.00,
      billingPeriod: selectedPeriod ? `${format(new Date(selectedPeriod.startDate), 'MMM yyyy')}` : ''
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
      billingPeriod: selectedPeriod ? `${format(new Date(selectedPeriod.startDate), 'MMM yyyy')}` : ''
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
      billingPeriod: selectedPeriod ? `${format(new Date(selectedPeriod.startDate), 'MMM yyyy')}` : ''
    }
  ]

  const handleExport = async () => {
    if (!selectedPeriodId) {
      setError('Please select a billing period to export')
      return
    }

    try {
      setIsExporting(true)
      setError(null)
      setExportProgress(0)

      // Simulate export process with progress updates
      const steps = [
        { message: 'Validating billing period...', progress: 20 },
        { message: 'Gathering charge data...', progress: 40 },
        { message: 'Calculating totals...', progress: 60 },
        { message: 'Formatting export file...', progress: 80 },
        { message: 'Finalizing export...', progress: 100 }
      ]

      for (const step of steps) {
        setExportProgress(step.progress)
        await new Promise(resolve => setTimeout(resolve, 800))
      }

      const exportData = await createExport({
        billingPeriodId: selectedPeriodId,
        exportDate: new Date(),
        fileName: `payroll-export-${selectedPeriodId}.${exportSettings.format}`,
        recordCount: 0,
        totalAmount: 0,
        status: PayrollExportStatus.PENDING,
        format: exportSettings.format,
        metadata: {
          includeDetails: exportSettings.includeDetails,
          includeMetadata: exportSettings.includeMetadata,
          groupByDepartment: exportSettings.groupByDepartment,
          includeZeroAmounts: exportSettings.includeZeroAmounts
        }
      })

      onExportComplete?.(exportData)
    } catch (err) {
      console.error('Export error:', err)
      setError(err instanceof Error ? err.message : 'Failed to export payroll data')
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const handleDownloadExport = (exportId: string) => {
    // In real implementation, this would download the actual file
    const link = document.createElement('a')
    link.href = `/api/billing/export/${exportId}/download`
    link.download = `payroll-export-${exportId}.${exportSettings.format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalStaff = mockExportData.length
  const totalDeductions = mockExportData.reduce((sum, item) => sum + item.totalDeductions, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payroll Export</h2>
          <p className="text-muted-foreground">
            Export billing data for payroll processing
          </p>
        </div>
      </div>

      {/* Export Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Export Configuration
          </CardTitle>
          <CardDescription>
            Configure your payroll export settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Billing Period Selection */}
          <div className="space-y-2">
            <Label htmlFor="billing-period">Billing Period</Label>
            <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
              <SelectTrigger>
                <SelectValue placeholder="Select billing period to export" />
              </SelectTrigger>
              <SelectContent>
                {exportablePeriods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(period.startDate), 'MMM dd')} - {format(new Date(period.endDate), 'MMM dd, yyyy')}
                      <Badge variant={period.status === BillingStatus.EXPORTED ? 'outline' : 'default'} className="ml-2">
                        {period.status === BillingStatus.EXPORTED ? 'Exported' : 'Ready'}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Export Format */}
          <div className="space-y-2">
            <Label htmlFor="export-format">Export Format</Label>
            <Select 
              value={exportSettings.format} 
              onValueChange={(value) => setExportSettings(prev => ({ ...prev, format: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Comma Separated Values)</SelectItem>
                <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                <SelectItem value="json">JSON (JavaScript Object Notation)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <Label>Export Options</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-details"
                  checked={exportSettings.includeDetails}
                  onCheckedChange={(checked) => 
                    setExportSettings(prev => ({ ...prev, includeDetails: !!checked }))
                  }
                />
                <Label htmlFor="include-details" className="text-sm">
                  Include detailed breakdown
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-metadata"
                  checked={exportSettings.includeMetadata}
                  onCheckedChange={(checked) => 
                    setExportSettings(prev => ({ ...prev, includeMetadata: !!checked }))
                  }
                />
                <Label htmlFor="include-metadata" className="text-sm">
                  Include calculation metadata
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="group-by-department"
                  checked={exportSettings.groupByDepartment}
                  onCheckedChange={(checked) => 
                    setExportSettings(prev => ({ ...prev, groupByDepartment: !!checked }))
                  }
                />
                <Label htmlFor="group-by-department" className="text-sm">
                  Group by department
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="include-zero-amounts"
                  checked={exportSettings.includeZeroAmounts}
                  onCheckedChange={(checked) => 
                    setExportSettings(prev => ({ ...prev, includeZeroAmounts: !!checked }))
                  }
                />
                <Label htmlFor="include-zero-amounts" className="text-sm">
                  Include zero amounts
                </Label>
              </div>
            </div>
          </div>

          {/* Export Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Exporting...</span>
                <span className="text-sm text-muted-foreground">{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="h-2" />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  disabled={!selectedPeriodId || isExporting}
                >
                  <Eye className="h-4 w-4" />
                  Preview Data
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Export Preview</DialogTitle>
                  <DialogDescription>
                    Preview of the data that will be exported for payroll processing
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                      <p className="text-2xl font-bold">{totalStaff}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">Total Deductions</p>
                      <p className="text-2xl font-bold">${totalDeductions.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">Average per Staff</p>
                      <p className="text-2xl font-bold">${(totalDeductions / totalStaff).toFixed(0)}</p>
                    </div>
                  </div>

                  {/* Data Table */}
                  <div className="max-h-96 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead className="text-right">Rent</TableHead>
                          <TableHead className="text-right">Utilities</TableHead>
                          <TableHead className="text-right">Transport</TableHead>
                          <TableHead className="text-right">Other</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockExportData.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.firstName} {item.lastName}</p>
                                <p className="text-sm text-muted-foreground">{item.employeeId}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">${item.rentCharges.toFixed(2)}</TableCell>
                            <TableCell className="text-right">${item.utilityCharges.toFixed(2)}</TableCell>
                            <TableCell className="text-right">${item.transportCharges.toFixed(2)}</TableCell>
                            <TableCell className="text-right">${item.otherCharges.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-medium">
                              ${item.totalDeductions.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowPreview(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button 
              onClick={handleExport}
              disabled={!selectedPeriodId || isExporting}
              className="gap-2"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export to Payroll
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export History */}
      {selectedPeriodId && periodExports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Export History
            </CardTitle>
            <CardDescription>
              Previous exports for the selected billing period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Export Date</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periodExports.map((exportItem) => (
                  <TableRow key={exportItem.id}>
                    <TableCell>
                      {format(new Date(exportItem.createdAt), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {exportItem.format.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          exportItem.status === PayrollExportStatus.COMPLETED 
                            ? 'default' 
                            : exportItem.status === PayrollExportStatus.FAILED
                              ? 'destructive'
                              : 'secondary'
                        }
                        className="gap-1"
                      >
                        {exportItem.status === PayrollExportStatus.COMPLETED && <CheckCircle className="h-3 w-3" />}
                        {exportItem.status === PayrollExportStatus.FAILED && <AlertTriangle className="h-3 w-3" />}
                        {exportItem.status === PayrollExportStatus.PENDING && <Clock className="h-3 w-3" />}
                        {exportItem.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{exportItem.recordCount || 0}</TableCell>
                    <TableCell className="text-right">
                      {exportItem.status === PayrollExportStatus.COMPLETED && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownloadExport(exportItem.id)}
                          className="gap-1"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Summary Information */}
      {selectedPeriod && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Export Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Billing Period</p>
                <p className="font-semibold">
                  {format(new Date(selectedPeriod.startDate), 'MMM dd')} - {format(new Date(selectedPeriod.endDate), 'MMM dd, yyyy')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Staff Count</p>
                <p className="text-xl font-bold">{totalStaff}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Total Deductions</p>
                <p className="text-xl font-bold">${totalDeductions.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Export Status</p>
                <Badge variant={selectedPeriod.status === BillingStatus.EXPORTED ? 'outline' : 'default'}>
                  {selectedPeriod.status === BillingStatus.EXPORTED ? 'Previously Exported' : 'Ready to Export'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
