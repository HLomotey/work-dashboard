'use client'

import * as React from 'react'
import { Building, Users, TrendingUp, Calendar, Home, Bed } from 'lucide-react'

import { useHousingAnalytics, usePropertiesWithRooms } from '@/hooks/use-housing'
import { 
  KPICard, 
  KPIGrid, 
  CustomLineChart, 
  CustomBarChart, 
  CustomPieChart,
  LoadingSpinner,
  DateRangePicker,
  ExportButton
} from '@/components/shared'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

interface OccupancyDashboardProps {
  className?: string
}

export function OccupancyDashboard({ className }: OccupancyDashboardProps) {
  const [dateRange, setDateRange] = React.useState<{
    from?: Date
    to?: Date
  }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  })

  const { analytics, isLoading: analyticsLoading } = useHousingAnalytics(
    dateRange.from && dateRange.to ? {
      start: dateRange.from,
      end: dateRange.to,
    } : undefined
  )

  const { properties, isLoading: propertiesLoading } = usePropertiesWithRooms()

  // Generate mock trend data (in real app, this would come from API)
  const occupancyTrendData = React.useMemo(() => {
    const data = []
    const days = 30
    const today = new Date()
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        occupancy: Math.floor(Math.random() * 20) + 70, // 70-90% range
        available: Math.floor(Math.random() * 15) + 10, // 10-25 range
      })
    }
    
    return data
  }, [])

  // Property occupancy data for charts
  const propertyOccupancyData = React.useMemo(() => {
    if (!properties) return []
    
    return properties.map(property => ({
      name: property.name,
      occupancy: property.occupancyRate,
      capacity: property.totalCapacity,
      available: property.availableCapacity,
    }))
  }, [properties])

  // Status distribution data
  const statusDistributionData = React.useMemo(() => {
    if (!analytics) return []
    
    return [
      { name: 'Occupied', value: analytics.occupiedRooms, color: '#3b82f6' },
      { name: 'Available', value: analytics.availableRooms, color: '#10b981' },
      { name: 'Maintenance', value: analytics.maintenanceRooms, color: '#f59e0b' },
    ]
  }, [analytics])

  const handleExport = async (format: string) => {
    // Export logic would go here
    console.log('Exporting occupancy data as:', format)
  }

  if (analyticsLoading || propertiesLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Occupancy Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time housing occupancy metrics and analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <DateRangePicker
            from={dateRange.from}
            to={dateRange.to}
            onRangeChange={setDateRange}
            className="w-[300px]"
          />
          <ExportButton
            formats={['csv', 'excel', 'pdf']}
            onExport={handleExport}
            data={propertyOccupancyData}
            filename="occupancy-report"
          />
        </div>
      </div>

      {/* KPI Cards */}
      {analytics && (
        <KPIGrid columns={4} className="mb-6">
          <KPICard
            title="Total Properties"
            value={analytics.totalProperties}
            icon={Building}
            trend={{ value: 5.2, label: 'vs last month' }}
          />
          <KPICard
            title="Total Rooms"
            value={analytics.totalRooms}
            icon={Home}
            trend={{ value: 2.1, label: 'vs last month' }}
          />
          <KPICard
            title="Occupancy Rate"
            value={`${Math.round(analytics.occupancyRate)}%`}
            icon={Users}
            variant={analytics.occupancyRate > 80 ? 'success' : 'warning'}
            trend={{ value: analytics.occupancyRate > 80 ? 3.2 : -1.5, label: 'vs last month' }}
          />
          <KPICard
            title="Available Rooms"
            value={analytics.availableRooms}
            icon={Bed}
            variant="success"
            description="ready for assignment"
          />
        </KPIGrid>
      )}

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Occupancy Trends</TabsTrigger>
          <TabsTrigger value="properties">Property Breakdown</TabsTrigger>
          <TabsTrigger value="distribution">Status Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CustomLineChart
              title="Occupancy Trend"
              description="Daily occupancy rate over time"
              data={occupancyTrendData}
              xKey="date"
              yKey="occupancy"
              height={300}
              smooth
            />
            
            <CustomLineChart
              title="Available Rooms"
              description="Available room count over time"
              data={occupancyTrendData}
              xKey="date"
              yKey="available"
              height={300}
              strokeColor="#10b981"
              smooth
            />
          </div>
        </TabsContent>

        <TabsContent value="properties" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CustomBarChart
              title="Property Occupancy Rates"
              description="Occupancy percentage by property"
              data={propertyOccupancyData}
              xKey="name"
              yKey="occupancy"
              height={300}
              fillColor="#3b82f6"
            />
            
            <CustomBarChart
              title="Property Capacity"
              description="Total capacity by property"
              data={propertyOccupancyData}
              xKey="name"
              yKey="capacity"
              height={300}
              fillColor="#10b981"
            />
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CustomPieChart
              title="Room Status Distribution"
              description="Current status of all rooms"
              data={statusDistributionData}
              dataKey="value"
              nameKey="name"
              height={300}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Occupancy Insights</CardTitle>
                <CardDescription>Key insights from occupancy data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics && (
                  <>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Peak Occupancy</span>
                      </div>
                      <span className="text-sm font-semibold text-green-600">
                        {Math.round(analytics.occupancyRate)}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Total Capacity</span>
                      </div>
                      <span className="text-sm font-semibold text-blue-600">
                        {analytics.totalCapacity} beds
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium">Maintenance Rooms</span>
                      </div>
                      <span className="text-sm font-semibold text-yellow-600">
                        {analytics.maintenanceRooms}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}