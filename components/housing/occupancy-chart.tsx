'use client'

import * as React from 'react'
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react'

import { 
  CustomLineChart, 
  CustomAreaChart, 
  CustomBarChart,
  MultiLineChart,
  ChartWithReference 
} from '@/components/shared'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface OccupancyChartProps {
  data?: any[]
  title?: string
  description?: string
  height?: number
  showControls?: boolean
  className?: string
}

export function OccupancyChart({
  data = [],
  title = "Occupancy Overview",
  description = "Housing occupancy metrics over time",
  height = 300,
  showControls = true,
  className,
}: OccupancyChartProps) {
  const [chartType, setChartType] = React.useState<'line' | 'area' | 'bar'>('line')
  const [timeRange, setTimeRange] = React.useState<'7d' | '30d' | '90d' | '1y'>('30d')

  // Generate sample data if none provided
  const chartData = React.useMemo(() => {
    if (data.length > 0) return data

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365
    const sampleData = []
    const today = new Date()
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      sampleData.push({
        date: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          ...(timeRange === '1y' && { year: '2-digit' })
        }),
        occupancy: Math.floor(Math.random() * 20) + 70, // 70-90%
        capacity: 100,
        available: Math.floor(Math.random() * 15) + 10,
        maintenance: Math.floor(Math.random() * 5) + 2,
      })
    }
    
    return sampleData
  }, [data, timeRange])

  // Calculate trend
  const trend = React.useMemo(() => {
    if (chartData.length < 2) return null
    
    const recent = chartData.slice(-7).reduce((sum, d) => sum + d.occupancy, 0) / 7
    const previous = chartData.slice(-14, -7).reduce((sum, d) => sum + d.occupancy, 0) / 7
    const change = ((recent - previous) / previous) * 100
    
    return {
      value: change,
      isPositive: change > 0,
      recent: Math.round(recent),
      previous: Math.round(previous),
    }
  }, [chartData])

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      xKey: 'date',
      height,
      showGrid: true,
      showTooltip: true,
    }

    switch (chartType) {
      case 'area':
        return (
          <CustomAreaChart
            {...commonProps}
            yKey="occupancy"
            fillColor="hsl(var(--primary))"
            strokeColor="hsl(var(--primary))"
          />
        )
      case 'bar':
        return (
          <CustomBarChart
            {...commonProps}
            yKey="occupancy"
            fillColor="hsl(var(--primary))"
          />
        )
      default:
        return (
          <CustomLineChart
            {...commonProps}
            yKey="occupancy"
            strokeColor="hsl(var(--primary))"
            smooth
          />
        )
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center space-x-2">
              <span>{title}</span>
              {trend && (
                <Badge variant={trend.isPositive ? 'default' : 'secondary'}>
                  {trend.isPositive ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {trend.isPositive ? '+' : ''}{trend.value.toFixed(1)}%
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          
          {showControls && (
            <div className="flex items-center space-x-2">
              <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="area">Area</SelectItem>
                  <SelectItem value="bar">Bar</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="30d">30 days</SelectItem>
                  <SelectItem value="90d">90 days</SelectItem>
                  <SelectItem value="1y">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
        
        {/* Summary Stats */}
        {trend && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t text-sm">
            <div className="flex items-center space-x-4">
              <div>
                <span className="text-muted-foreground">Current: </span>
                <span className="font-medium">{trend.recent}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Previous: </span>
                <span className="font-medium">{trend.previous}%</span>
              </div>
            </div>
            <div className="text-muted-foreground">
              <Calendar className="h-4 w-4 inline mr-1" />
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Multi-series Occupancy Chart
interface MultiSeriesOccupancyChartProps {
  data?: any[]
  title?: string
  description?: string
  height?: number
  className?: string
}

export function MultiSeriesOccupancyChart({
  data = [],
  title = "Occupancy Breakdown",
  description = "Detailed occupancy metrics over time",
  height = 350,
  className,
}: MultiSeriesOccupancyChartProps) {
  // Generate sample data if none provided
  const chartData = React.useMemo(() => {
    if (data.length > 0) return data

    const sampleData = []
    const today = new Date()
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      sampleData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        occupied: Math.floor(Math.random() * 20) + 60,
        available: Math.floor(Math.random() * 15) + 20,
        maintenance: Math.floor(Math.random() * 5) + 5,
        outOfOrder: Math.floor(Math.random() * 3) + 1,
      })
    }
    
    return sampleData
  }, [data])

  const series = [
    { key: 'occupied', name: 'Occupied', color: '#3b82f6' },
    { key: 'available', name: 'Available', color: '#10b981' },
    { key: 'maintenance', name: 'Maintenance', color: '#f59e0b' },
    { key: 'outOfOrder', name: 'Out of Order', color: '#ef4444' },
  ]

  return (
    <MultiLineChart
      title={title}
      description={description}
      data={chartData}
      xKey="date"
      series={series}
      height={height}
      className={className}
      showLegend
      showGrid
    />
  )
}

// Occupancy Heatmap (simplified version)
interface OccupancyHeatmapProps {
  data?: any[]
  title?: string
  description?: string
  className?: string
}

export function OccupancyHeatmap({
  data = [],
  title = "Occupancy Heatmap",
  description = "Occupancy patterns by day and time",
  className,
}: OccupancyHeatmapProps) {
  // Generate sample heatmap data
  const heatmapData = React.useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const hours = Array.from({ length: 24 }, (_, i) => i)
    
    return days.map(day => ({
      day,
      hours: hours.map(hour => ({
        hour,
        occupancy: Math.floor(Math.random() * 40) + 60, // 60-100%
      }))
    }))
  }, [])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {heatmapData.map((dayData) => (
            <div key={dayData.day} className="flex items-center space-x-2">
              <div className="w-12 text-sm font-medium">{dayData.day}</div>
              <div className="flex space-x-1">
                {dayData.hours.map((hourData) => (
                  <div
                    key={hourData.hour}
                    className="w-3 h-6 rounded-sm"
                    style={{
                      backgroundColor: `hsl(${120 - (hourData.occupancy - 60)}, 70%, ${50 + hourData.occupancy / 4}%)`,
                    }}
                    title={`${hourData.hour}:00 - ${hourData.occupancy}% occupied`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Hover over cells to see detailed occupancy
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-400 rounded-sm" />
              <span>Low</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-400 rounded-sm" />
              <span>Medium</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-400 rounded-sm" />
              <span>High</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}