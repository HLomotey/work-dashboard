'use client'

import * as React from 'react'
import { FileText, Download, Calendar, Filter, Building, Users, TrendingUp } from 'lucide-react'

import { useHousingAnalytics, usePropertiesWithRooms, useRoomAssignments } from '@/hooks/use-housing'
import { 
  ExportButton, 
  DateRangePicker, 
  SearchInput,
  DataTable,
  createSortableHeader,
  LoadingSpinner,
  KPICard,
  KPIGrid
} from '@/components/shared'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface HousingReportsProps {
  className?: string
}

export function HousingReports({ className }: HousingReportsProps) {
  const [dateRange, setDateRange] = React.useState<{
    from?: Date
    to?: Date
  }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  })

  const [filters, setFilters] = React.useState({
    propertyId: '',
    status: '',
    search: '',
  })

  const { analytics, isLoading: analyticsLoading } = useHousingAnalytics(
    dateRange.from && dateRange.to ? {
      start: dateRange.from,
      end: dateRange.to,
    } : undefined
  )

  const { properties, isLoading: propertiesLoading } = usePropertiesWithRooms()
  const { assignments, isLoading: assignmentsLoading } = useRoomAssignments({
    dateRange: dateRange.from && dateRange.to ? {
      start: dateRange.from,
      end: dateRange.to,
    } : undefined,
  })

  // Property report columns
  const propertyColumns: ColumnDef<any>[] = React.useMemo(() => [
    {
      accessorKey: 'name',
      header: createSortableHeader('Property Name', 'name'),
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'totalCapacity',
      header: createSortableHeader('Total Capacity', 'totalCapacity'),
      cell: ({ row }) => (
        <div className="text-center font-medium">{row.original.totalCapacity}</div>
      ),
    },
    {
      accessorKey: 'occupancyRate',
      header: createSortableHeader('Occupancy Rate', 'occupancyRate'),
      cell: ({ row }) => (
        <div className="text-center">
          <Badge 
            variant={row.original.occupancyRate > 80 ? 'default' : 'secondary'}
          >
            {Math.round(row.original.occupancyRate)}%
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'availableCapacity',
      header: createSortableHeader('Available', 'availableCapacity'),
      cell: ({ row }) => (
        <div className="text-center text-green-600 font-medium">
          {row.original.availableCapacity}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
      ),
    },
  ], [])

  // Assignment report columns
  const assignmentColumns: ColumnDef<any>[] = React.useMemo(() => [
    {
      accessorKey: 'staff',
      header: 'Staff Member',
      cell: ({ row }) => {
        const staff = row.original.staff
        return staff ? (
          <div>
            <div className="font-medium">{staff.firstName} {staff.lastName}</div>
            <div className="text-sm text-muted-foreground">{staff.employeeId}</div>
          </div>
        ) : (
          <span className="text-muted-foreground">Unknown</span>
        )
      },
    },
    {
      accessorKey: 'property',
      header: 'Property',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.property?.name || 'N/A'}</div>
      ),
    },
    {
      accessorKey: 'room',
      header: 'Room',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.room?.roomNumber || 'N/A'}</div>
      ),
    },
    {
      accessorKey: 'startDate',
      header: createSortableHeader('Start Date', 'startDate'),
      cell: ({ row }) => (
        <div>{format(new Date(row.original.startDate), 'MMM dd, yyyy')}</div>
      ),
    },
    {
      accessorKey: 'endDate',
      header: 'End Date',
      cell: ({ row }) => (
        <div>
          {row.original.endDate 
            ? format(new Date(row.original.endDate), 'MMM dd, yyyy')
            : 'Ongoing'
          }
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge 
          variant={row.original.status === 'active' ? 'default' : 'secondary'}
          className="capitalize"
        >
          {row.original.status}
        </Badge>
      ),
    },
  ], [])

  // Export handlers
  const handleExportProperties = async (exportFormat: string) => {
    if (!properties) return
    
    const exportData = properties.map(property => ({
      'Property Name': property.name,
      'Address': property.address,
      'Total Capacity': property.totalCapacity,
      'Occupancy Rate': `${Math.round(property.occupancyRate)}%`,
      'Available Capacity': property.availableCapacity,
      'Status': property.status,
      'Created Date': format(new Date(property.createdAt), 'yyyy-MM-dd'),
    }))

    // In a real app, this would trigger the actual export
    console.log('Exporting properties as:', exportFormat, exportData)
    toast.success(`Properties exported as ${exportFormat.toUpperCase()}`)
  }

  const handleExportAssignments = async (exportFormat: string) => {
    if (!assignments) return
    
    const exportData = assignments.map(assignment => ({
      'Staff Name': assignment.staff ? `${assignment.staff.firstName} ${assignment.staff.lastName}` : 'Unknown',
      'Employee ID': assignment.staff?.employeeId || 'N/A',
      'Property': assignment.property?.name || 'N/A',
      'Room': assignment.room?.roomNumber || 'N/A',
      'Start Date': format(new Date(assignment.startDate), 'yyyy-MM-dd'),
      'End Date': assignment.endDate ? format(new Date(assignment.endDate), 'yyyy-MM-dd') : 'Ongoing',
      'Status': assignment.status,
      'Move In Date': assignment.moveInDate ? format(new Date(assignment.moveInDate), 'yyyy-MM-dd') : 'N/A',
      'Move Out Date': assignment.moveOutDate ? format(new Date(assignment.moveOutDate), 'yyyy-MM-dd') : 'N/A',
    }))

    console.log('Exporting assignments as:', exportFormat, exportData)
    toast.success(`Assignments exported as ${exportFormat.toUpperCase()}`)
  }

  const isLoading = analyticsLoading || propertiesLoading || assignmentsLoading

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Housing Reports</h2>
          <p className="text-muted-foreground">
            Generate and export detailed housing reports
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <DateRangePicker
            from={dateRange.from}
            to={dateRange.to}
            onRangeChange={setDateRange}
            className="w-[300px]"
          />
        </div>
      </div>

      {/* Summary Metrics */}
      {analytics && (
        <KPIGrid columns={4} className="mb-6">
          <KPICard
            title="Total Properties"
            value={analytics.totalProperties}
            icon={Building}
          />
          <KPICard
            title="Total Rooms"
            value={analytics.totalRooms}
            icon={Users}
          />
          <KPICard
            title="Occupancy Rate"
            value={`${Math.round(analytics.occupancyRate)}%`}
            icon={TrendingUp}
            variant={analytics.occupancyRate > 80 ? 'success' : 'warning'}
          />
          <KPICard
            title="Available Rooms"
            value={analytics.availableRooms}
            variant="success"
          />
        </KPIGrid>
      )}

      {/* Report Tabs */}
      <Tabs defaultValue="properties" className="space-y-4">
        <TabsList>
          <TabsTrigger value="properties">Property Report</TabsTrigger>
          <TabsTrigger value="assignments">Assignment Report</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy Report</TabsTrigger>
        </TabsList>

        <TabsContent value="properties">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Property Report</CardTitle>
                  <CardDescription>
                    Detailed information about all properties and their occupancy
                  </CardDescription>
                </div>
                <ExportButton
                  formats={['csv', 'excel', 'pdf']}
                  onExport={handleExportProperties}
                  filename="property-report"
                />
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center space-x-4 mb-4">
                <SearchInput
                  placeholder="Search properties..."
                  onValueChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
                  className="max-w-sm"
                />
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Data Table */}
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <DataTable
                  columns={propertyColumns}
                  data={properties || []}
                  searchKey="name"
                  emptyMessage="No properties found for the selected criteria."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Assignment Report</CardTitle>
                  <CardDescription>
                    Current and historical room assignments
                  </CardDescription>
                </div>
                <ExportButton
                  formats={['csv', 'excel', 'pdf']}
                  onExport={handleExportAssignments}
                  filename="assignment-report"
                />
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center space-x-4 mb-4">
                <SearchInput
                  placeholder="Search assignments..."
                  onValueChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
                  className="max-w-sm"
                />
                <Select
                  value={filters.propertyId}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, propertyId: value }))}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Properties</SelectItem>
                    {properties?.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Data Table */}
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <DataTable
                  columns={assignmentColumns}
                  data={assignments || []}
                  searchKey="staff.firstName"
                  emptyMessage="No assignments found for the selected criteria."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="occupancy">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Occupancy Report</CardTitle>
                  <CardDescription>
                    Detailed occupancy metrics and trends
                  </CardDescription>
                </div>
                <ExportButton
                  formats={['csv', 'excel', 'pdf']}
                  onExport={(format) => {
                    console.log('Exporting occupancy report as:', format)
                    toast.success(`Occupancy report exported as ${format.toUpperCase()}`)
                  }}
                  filename="occupancy-report"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Occupancy Summary */}
                {analytics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(analytics.occupancyRate)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Overall Occupancy</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {analytics.availableRooms}
                      </div>
                      <div className="text-sm text-muted-foreground">Available Rooms</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {analytics.maintenanceRooms}
                      </div>
                      <div className="text-sm text-muted-foreground">Under Maintenance</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {analytics.totalCapacity}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Capacity</div>
                    </div>
                  </div>
                )}

                {/* Property Breakdown */}
                {properties && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Property Breakdown</h3>
                    <div className="space-y-2">
                      {properties.map((property) => (
                        <div key={property.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{property.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {property.totalCapacity} beds total
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {Math.round(property.occupancyRate)}% occupied
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {property.availableCapacity} available
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}