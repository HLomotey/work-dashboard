'use client'

import { useState } from 'react'
import { Download, FileText, Calendar, Filter, Users, Car, MapPin, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { useVehicles, useTrips, useTransportAnalytics } from '@/hooks/use-transport'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'

interface ReportConfig {
  type: 'fleet' | 'trips' | 'utilization' | 'financial' | 'comprehensive'
  format: 'pdf' | 'excel' | 'csv'
  dateRange: { start: Date; end: Date }
  includeCharts: boolean
  includeDetails: boolean
  vehicleFilter?: string
  groupBy?: 'vehicle' | 'route' | 'date' | 'none'
}

interface TransportReportsProps {
  className?: string
}

export function TransportReports({ className = '' }: TransportReportsProps) {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    type: 'comprehensive',
    format: 'pdf',
    dateRange: {
      start: startOfMonth(new Date()),
      end: endOfMonth(new Date()),
    },
    includeCharts: true,
    includeDetails: true,
    groupBy: 'vehicle',
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const { toast } = useToast()
  const { vehicles } = useVehicles()
  const { trips } = useTrips()
  const { analytics } = useTransportAnalytics(reportConfig.dateRange)

  const reportTypes = [
    {
      id: 'fleet',
      name: 'Fleet Overview',
      description: 'Vehicle status, utilization, and maintenance summary',
      icon: Car,
    },
    {
      id: 'trips',
      name: 'Trip Analysis',
      description: 'Detailed trip logs, routes, and passenger data',
      icon: MapPin,
    },
    {
      id: 'utilization',
      name: 'Utilization Report',
      description: 'Vehicle usage patterns and efficiency metrics',
      icon: Users,
    },
    {
      id: 'financial',
      name: 'Financial Summary',
      description: 'Cost analysis, expenses, and budget tracking',
      icon: DollarSign,
    },
    {
      id: 'comprehensive',
      name: 'Comprehensive Report',
      description: 'Complete transport operations overview',
      icon: FileText,
    },
  ]

  const handleDateRangeChange = (range: string) => {
    const now = new Date()
    let start: Date, end: Date

    switch (range) {
      case 'week':
        start = subDays(now, 7)
        end = now
        break
      case 'month':
        start = startOfMonth(now)
        end = endOfMonth(now)
        break
      case 'quarter':
        start = subDays(now, 90)
        end = now
        break
      case 'year':
        start = new Date(now.getFullYear(), 0, 1)
        end = now
        break
      default:
        return
    }

    setReportConfig(prev => ({
      ...prev,
      dateRange: { start, end }
    }))
  }

  const generateReport = async () => {
    setIsGenerating(true)
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real implementation, this would call an API to generate the report
      const reportData = {
        config: reportConfig,
        vehicles: vehicles?.length || 0,
        trips: trips?.length || 0,
        dateRange: reportConfig.dateRange,
      }

      // Mock download
      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transport-report-${format(new Date(), 'yyyy-MM-dd')}.${reportConfig.format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: 'Report Generated',
        description: `${reportTypes.find(t => t.id === reportConfig.type)?.name} has been downloaded successfully.`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate report. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const getReportPreview = () => {
    const selectedType = reportTypes.find(t => t.id === reportConfig.type)
    const vehicleCount = vehicles?.length || 0
    const tripCount = trips?.length || 0
    const dateRangeText = `${format(reportConfig.dateRange.start, 'MMM dd, yyyy')} - ${format(reportConfig.dateRange.end, 'MMM dd, yyyy')}`

    return {
      title: selectedType?.name || 'Report',
      description: selectedType?.description || '',
      stats: {
        vehicles: vehicleCount,
        trips: tripCount,
        dateRange: dateRangeText,
      }
    }
  }

  const preview = getReportPreview()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transport Reports</h2>
          <p className="text-gray-600">
            Generate comprehensive reports and analytics for transport operations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>Report Type</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportTypes.map((type) => {
                  const Icon = type.icon
                  const isSelected = reportConfig.type === type.id
                  
                  return (
                    <div
                      key={type.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setReportConfig(prev => ({ ...prev, type: type.id as any }))}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className={`h-5 w-5 mt-0.5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                        <div>
                          <div className={`font-medium ${isSelected ? 'text-blue-800' : 'text-gray-900'}`}>
                            {type.name}
                          </div>
                          <div className={`text-sm ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}>
                            {type.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Configuration Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-blue-600" />
                <span>Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Select onValueChange={handleDateRangeChange} defaultValue="month">
                    <SelectTrigger>
                      <Calendar className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">Last 90 Days</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select 
                    onValueChange={(value) => setReportConfig(prev => ({ ...prev, format: value as any }))}
                    defaultValue={reportConfig.format}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Custom Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={format(reportConfig.dateRange.start, 'yyyy-MM-dd')}
                    onChange={(e) => setReportConfig(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: new Date(e.target.value) }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={format(reportConfig.dateRange.end, 'yyyy-MM-dd')}
                    onChange={(e) => setReportConfig(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: new Date(e.target.value) }
                    }))}
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vehicle Filter</Label>
                  <Select 
                    onValueChange={(value) => setReportConfig(prev => ({ 
                      ...prev, 
                      vehicleFilter: value === 'all' ? undefined : value 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All vehicles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Vehicles</SelectItem>
                      {vehicles?.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.make} {vehicle.model} ({vehicle.registration})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Group By</Label>
                  <Select 
                    onValueChange={(value) => setReportConfig(prev => ({ ...prev, groupBy: value as any }))}
                    defaultValue={reportConfig.groupBy}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select grouping" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Grouping</SelectItem>
                      <SelectItem value="vehicle">By Vehicle</SelectItem>
                      <SelectItem value="route">By Route</SelectItem>
                      <SelectItem value="date">By Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeCharts"
                    checked={reportConfig.includeCharts}
                    onCheckedChange={(checked) => setReportConfig(prev => ({ 
                      ...prev, 
                      includeCharts: checked as boolean 
                    }))}
                  />
                  <Label htmlFor="includeCharts">Include charts and visualizations</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeDetails"
                    checked={reportConfig.includeDetails}
                    onCheckedChange={(checked) => setReportConfig(prev => ({ 
                      ...prev, 
                      includeDetails: checked as boolean 
                    }))}
                  />
                  <Label htmlFor="includeDetails">Include detailed data tables</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Preview & Generation */}
        <div className="space-y-6">
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="font-medium text-lg">{preview.title}</div>
                <div className="text-sm text-gray-600">{preview.description}</div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Format:</span>
                  <Badge variant="outline">{reportConfig.format.toUpperCase()}</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Period:</span>
                  <span className="text-sm font-medium">{preview.stats.dateRange}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Vehicles:</span>
                  <span className="text-sm font-medium">{preview.stats.vehicles}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Trips:</span>
                  <span className="text-sm font-medium">{preview.stats.trips}</span>
                </div>
              </div>

              <div className="pt-3 border-t">
                <div className="text-sm font-medium mb-2">Includes:</div>
                <div className="space-y-1">
                  {reportConfig.includeCharts && (
                    <div className="text-xs text-gray-600">✓ Charts and visualizations</div>
                  )}
                  {reportConfig.includeDetails && (
                    <div className="text-xs text-gray-600">✓ Detailed data tables</div>
                  )}
                  <div className="text-xs text-gray-600">✓ Summary statistics</div>
                  <div className="text-xs text-gray-600">✓ Key performance indicators</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Card>
            <CardContent className="p-6">
              <Button 
                onClick={generateReport}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                <Download className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating Report...' : 'Generate Report'}
              </Button>
              
              <div className="text-xs text-gray-500 text-center mt-3">
                Report will be downloaded automatically when ready
              </div>
            </CardContent>
          </Card>

          {/* Quick Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => {
                  setReportConfig(prev => ({ 
                    ...prev, 
                    type: 'fleet',
                    format: 'pdf',
                    dateRange: { start: startOfMonth(new Date()), end: endOfMonth(new Date()) }
                  }))
                  generateReport()
                }}
              >
                <Car className="h-4 w-4 mr-2" />
                Monthly Fleet Summary
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => {
                  setReportConfig(prev => ({ 
                    ...prev, 
                    type: 'trips',
                    format: 'excel',
                    dateRange: { start: subDays(new Date(), 7), end: new Date() }
                  }))
                  generateReport()
                }}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Weekly Trip Log
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => {
                  setReportConfig(prev => ({ 
                    ...prev, 
                    type: 'financial',
                    format: 'csv',
                    dateRange: { start: startOfMonth(new Date()), end: endOfMonth(new Date()) }
                  }))
                  generateReport()
                }}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Cost Analysis
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
