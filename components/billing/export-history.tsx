'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { 
  Download,
  FileText,
  Calendar,
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  DollarSign,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { DateRange } from 'react-day-picker'
import { usePayrollExport } from '@/hooks/use-billing'
import { PayrollExportStatus, type PayrollExport } from '@/lib/types/billing'
import { cn } from '@/lib/utils'

interface ExportHistoryProps {
  onViewExport?: (exportId: string) => void
  onDownloadExport?: (exportId: string) => void
  onDeleteExport?: (exportId: string) => void
}

const statusConfig = {
  [PayrollExportStatus.PENDING]: {
    label: 'Pending',
    variant: 'secondary' as const,
    icon: Clock,
    color: 'text-yellow-600'
  },
  [PayrollExportStatus.COMPLETED]: {
    label: 'Completed',
    variant: 'default' as const,
    icon: CheckCircle,
    color: 'text-green-600'
  },
  [PayrollExportStatus.FAILED]: {
    label: 'Failed',
    variant: 'destructive' as const,
    icon: AlertTriangle,
    color: 'text-red-600'
  }
}

// Mock export history data - in real implementation, this would come from the API
const mockExportHistory: PayrollExport[] = [
  {
    id: '1',
    billingPeriodId: 'bp-1',
    exportDate: new Date('2024-03-31T10:30:00'),
    format: 'csv',
    status: PayrollExportStatus.COMPLETED,
    recordCount: 45,
    totalAmount: 38500.00,
    fileName: 'payroll-export-march-2024.csv',
    fileSize: 15420,
    createdAt: new Date('2024-03-31T10:30:00'),
    updatedAt: new Date('2024-03-31T10:32:15'),
    metadata: {
      includeDetails: true,
      includeMetadata: false,
      groupByDepartment: false,
      includeZeroAmounts: false
    }
  },
  {
    id: '2',
    billingPeriodId: 'bp-2',
    exportDate: new Date('2024-02-29T14:15:00'),
    format: 'excel',
    status: PayrollExportStatus.COMPLETED,
    recordCount: 52,
    totalAmount: 42300.00,
    fileName: 'payroll-export-february-2024.xlsx',
    fileSize: 28750,
    createdAt: new Date('2024-02-29T14:15:00'),
    updatedAt: new Date('2024-02-29T14:18:30'),
    metadata: {
      includeDetails: true,
      includeMetadata: true,
      groupByDepartment: true,
      includeZeroAmounts: false
    }
  },
  {
    id: '3',
    billingPeriodId: 'bp-1',
    exportDate: new Date('2024-03-30T16:45:00'),
    format: 'csv',
    status: PayrollExportStatus.FAILED,
    recordCount: 0,
    totalAmount: 0,
    fileName: 'payroll-export-march-2024-failed.csv',
    createdAt: new Date('2024-03-30T16:45:00'),
    updatedAt: new Date('2024-03-30T16:47:12'),
    metadata: {
      includeDetails: true,
      includeMetadata: false,
      groupByDepartment: false,
      includeZeroAmounts: true
    },
    errorMessage: 'Database connection timeout during export generation'
  },
  {
    id: '4',
    billingPeriodId: 'bp-3',
    exportDate: new Date('2024-04-01T09:20:00'),
    format: 'json',
    status: PayrollExportStatus.PENDING,
    recordCount: 0,
    totalAmount: 0,
    fileName: 'payroll-export-april-2024.json',
    createdAt: new Date('2024-04-01T09:20:00'),
    updatedAt: new Date('2024-04-01T09:20:00'),
    metadata: {
      includeDetails: false,
      includeMetadata: false,
      groupByDepartment: false,
      includeZeroAmounts: false
    }
  }
]

export function ExportHistory({ onViewExport, onDownloadExport, onDeleteExport }: ExportHistoryProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PayrollExportStatus | 'all'>('all')
  const [formatFilter, setFormatFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [selectedExport, setSelectedExport] = useState<PayrollExport | null>(null)
  
  // In real implementation, this would use the actual hook with filters
  const exports = mockExportHistory

  // Filter exports based on current filters
  const filteredExports = exports.filter(exportItem => {
    if (statusFilter !== 'all' && exportItem.status !== statusFilter) return false
    if (formatFilter !== 'all' && exportItem.format !== formatFilter) return false
    if (search) {
      const searchLower = search.toLowerCase()
      if (!exportItem.fileName?.toLowerCase().includes(searchLower) &&
          !exportItem.id.toLowerCase().includes(searchLower)) {
        return false
      }
    }
    if (dateRange?.from && dateRange?.to) {
      const exportDate = new Date(exportItem.createdAt)
      if (exportDate < dateRange.from || exportDate > dateRange.to) return false
    }
    return true
  })

  const handleAction = (action: string, exportItem: PayrollExport) => {
    switch (action) {
      case 'view':
        setSelectedExport(exportItem)
        onViewExport?.(exportItem.id)
        break
      case 'download':
        onDownloadExport?.(exportItem.id)
        break
      case 'delete':
        onDeleteExport?.(exportItem.id)
        break
      default:
        break
    }
  }

  const handleDownload = (exportItem: PayrollExport) => {
    if (exportItem.status === PayrollExportStatus.COMPLETED && exportItem.fileName) {
      // In real implementation, this would trigger the actual download
      const link = document.createElement('a')
      link.href = `/api/billing/export/${exportItem.id}/download`
      link.download = exportItem.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Calculate summary statistics
  const totalExports = filteredExports.length
  const completedExports = filteredExports.filter(e => e.status === PayrollExportStatus.COMPLETED).length
  const failedExports = filteredExports.filter(e => e.status === PayrollExportStatus.FAILED).length
  const totalRecords = filteredExports
    .filter(e => e.recordCount)
    .reduce((sum, e) => sum + (e.recordCount || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Export History</h2>
          <p className="text-muted-foreground">
            View and manage previous payroll exports
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Exports</p>
                <p className="text-2xl font-bold">{totalExports}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedExports}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{failedExports}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">{totalRecords}</p>
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
                placeholder="Search exports..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as PayrollExportStatus | 'all')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(statusConfig).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center gap-2">
                      <config.icon className="h-4 w-4" />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Format Filter */}
            <Select
              value={formatFilter}
              onValueChange={setFormatFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Formats</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
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
          </div>
        </CardContent>
      </Card>

      {/* Export History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Export History</CardTitle>
          <CardDescription>
            {filteredExports.length} exports found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredExports.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Export Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>File Size</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExports.map((exportItem) => {
                  const config = statusConfig[exportItem.status]
                  const Icon = config.icon

                  return (
                    <TableRow key={exportItem.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {exportItem.fileName || `Export ${exportItem.id.slice(0, 8)}...`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {exportItem.id}
                          </div>
                          {exportItem.totalAmount && (
                            <div className="text-sm text-muted-foreground">
                              Total: ${exportItem.totalAmount.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.variant} className="gap-1">
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                        {exportItem.errorMessage && (
                          <div className="text-xs text-red-600 mt-1">
                            {exportItem.errorMessage}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {exportItem.format.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {exportItem.recordCount ? (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {exportItem.recordCount}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {exportItem.fileSize ? (
                          <span className="text-sm">
                            {(exportItem.fileSize / 1024).toFixed(1)} KB
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(exportItem.createdAt), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(exportItem.createdAt), 'HH:mm')}
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
                            <DropdownMenuItem onClick={() => handleAction('view', exportItem)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {exportItem.status === PayrollExportStatus.COMPLETED && (
                              <DropdownMenuItem onClick={() => handleDownload(exportItem)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download File
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleAction('delete', exportItem)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Export
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
              <h3 className="text-lg font-semibold mb-2">No exports found</h3>
              <p className="text-muted-foreground">
                {search || statusFilter !== 'all' || formatFilter !== 'all' || dateRange
                  ? 'Try adjusting your filters to see more results'
                  : 'No payroll exports have been created yet'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Details Dialog */}
      {selectedExport && (
        <Dialog open={!!selectedExport} onOpenChange={() => setSelectedExport(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Export Details</DialogTitle>
              <DialogDescription>
                Detailed information about the selected export
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Export ID</p>
                  <p className="font-mono text-sm">{selectedExport.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={statusConfig[selectedExport.status].variant} className="gap-1">
                    {(() => {
                      const IconComponent = statusConfig[selectedExport.status].icon;
                      return <IconComponent className="h-3 w-3" />;
                    })()}
                    {statusConfig[selectedExport.status].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Format</p>
                  <p className="text-sm">{selectedExport.format.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Records</p>
                  <p className="text-sm">{selectedExport.recordCount || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-sm">
                    {selectedExport.totalAmount ? `$${selectedExport.totalAmount.toLocaleString()}` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">File Size</p>
                  <p className="text-sm">
                    {selectedExport.fileSize ? `${(selectedExport.fileSize / 1024).toFixed(1)} KB` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p className="text-sm">{format(new Date(selectedExport.createdAt), 'PPP')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Updated</p>
                  <p className="text-sm">
                    {selectedExport.updatedAt ? format(new Date(selectedExport.updatedAt), 'PPP') : 'N/A'}
                  </p>
                </div>
              </div>

              {selectedExport.errorMessage && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Error Message</p>
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-1">
                    <p className="text-sm text-red-700">{selectedExport.errorMessage}</p>
                  </div>
                </div>
              )}

              {selectedExport.metadata && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Export Settings</p>
                  <div className="bg-muted rounded-md p-3 mt-1">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Include Details:</span>
                        <span>{selectedExport.metadata.includeDetails ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Include Metadata:</span>
                        <span>{selectedExport.metadata.includeMetadata ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Group by Department:</span>
                        <span>{selectedExport.metadata.groupByDepartment ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Include Zero Amounts:</span>
                        <span>{selectedExport.metadata.includeZeroAmounts ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedExport.status === PayrollExportStatus.COMPLETED && selectedExport.fileName && (
                <div className="flex justify-end">
                  <Button onClick={() => handleDownload(selectedExport)} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download File
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
