'use client'

import { useState } from 'react'
import { MapPin, TrendingUp, DollarSign, Clock, Users, Route, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouteAnalytics } from '@/hooks/use-transport'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'

interface RouteOptimization {
  routeId: string
  route: string
  currentCost: number
  optimizedCost: number
  savings: number
  savingsPercentage: number
  currentTime: number
  optimizedTime: number
  timeSavings: number
  currentDistance: number
  optimizedDistance: number
  distanceSavings: number
  recommendation: string
  priority: 'high' | 'medium' | 'low'
}

// Mock route optimization data
const mockOptimizations: RouteOptimization[] = [
  {
    routeId: '1',
    route: 'Office to Airport',
    currentCost: 45.50,
    optimizedCost: 38.20,
    savings: 7.30,
    savingsPercentage: 16.0,
    currentTime: 35,
    optimizedTime: 28,
    timeSavings: 7,
    currentDistance: 25.5,
    optimizedDistance: 21.8,
    distanceSavings: 3.7,
    recommendation: 'Use Highway Route 101 during off-peak hours',
    priority: 'high'
  },
  {
    routeId: '2',
    route: 'Downtown to Residential Area',
    currentCost: 32.80,
    optimizedCost: 28.90,
    savings: 3.90,
    savingsPercentage: 11.9,
    currentTime: 42,
    optimizedTime: 38,
    timeSavings: 4,
    currentDistance: 18.2,
    optimizedDistance: 16.5,
    distanceSavings: 1.7,
    recommendation: 'Consolidate multiple stops into single trip',
    priority: 'medium'
  },
  {
    routeId: '3',
    route: 'Hotel to Conference Center',
    currentCost: 28.60,
    optimizedCost: 26.40,
    savings: 2.20,
    savingsPercentage: 7.7,
    currentTime: 25,
    optimizedTime: 23,
    timeSavings: 2,
    currentDistance: 15.8,
    optimizedDistance: 14.9,
    distanceSavings: 0.9,
    recommendation: 'Schedule during low-traffic periods',
    priority: 'low'
  }
]

interface RouteOptimizerProps {
  className?: string
}

export function RouteOptimizer({ className = '' }: RouteOptimizerProps) {
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  })
  const [selectedPriority, setSelectedPriority] = useState<string>('all')

  const { analytics, isLoading, error, refresh } = useRouteAnalytics(dateRange)

  // Filter optimizations by priority
  const filteredOptimizations = mockOptimizations.filter(opt => 
    selectedPriority === 'all' || opt.priority === selectedPriority
  )

  // Calculate total potential savings
  const totalSavings = filteredOptimizations.reduce((sum, opt) => sum + opt.savings, 0)
  const totalTimeSavings = filteredOptimizations.reduce((sum, opt) => sum + opt.timeSavings, 0)
  const averageSavingsPercentage = filteredOptimizations.length > 0 
    ? filteredOptimizations.reduce((sum, opt) => sum + opt.savingsPercentage, 0) / filteredOptimizations.length
    : 0

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
      default:
        return
    }

    setDateRange({ start, end })
  }

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    const variants = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary',
    } as const

    return (
      <Badge variant={variants[priority]}>
        {priority.toUpperCase()}
      </Badge>
    )
  }

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return <Zap className="h-4 w-4 text-red-600" />
      case 'medium':
        return <TrendingUp className="h-4 w-4 text-yellow-600" />
      case 'low':
        return <Clock className="h-4 w-4 text-green-600" />
    }
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-8">Loading route optimization data...</div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Route Optimizer</h2>
          <p className="text-gray-600">
            Cost analysis and optimization recommendations for {format(dateRange.start, 'MMM dd')} - {format(dateRange.end, 'MMM dd, yyyy')}
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Select onValueChange={setSelectedPriority} defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
            </SelectContent>
          </Select>
          
          <Select onValueChange={handleDateRangeChange} defaultValue="month">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalSavings.toFixed(2)}</div>
            <p className="text-xs text-gray-600 mt-1">
              {averageSavingsPercentage.toFixed(1)}% average reduction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Savings</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalTimeSavings} min</div>
            <p className="text-xs text-gray-600 mt-1">
              Per optimization cycle
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Routes Analyzed</CardTitle>
            <Route className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{filteredOptimizations.length}</div>
            <p className="text-xs text-gray-600 mt-1">
              Optimization opportunities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span>Route Optimization Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOptimizations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No optimization opportunities found for the selected criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOptimizations.map((optimization) => (
                <Card key={optimization.routeId} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getPriorityIcon(optimization.priority)}
                        <div>
                          <h4 className="font-semibold">{optimization.route}</h4>
                          <p className="text-sm text-gray-600">{optimization.recommendation}</p>
                        </div>
                      </div>
                      {getPriorityBadge(optimization.priority)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {/* Cost Optimization */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Cost Savings</span>
                          <span className="text-sm font-bold text-green-600">
                            ${optimization.savings.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>Current: ${optimization.currentCost.toFixed(2)}</span>
                          <span>Optimized: ${optimization.optimizedCost.toFixed(2)}</span>
                        </div>
                        <Progress 
                          value={optimization.savingsPercentage} 
                          className="h-2"
                        />
                        <div className="text-xs text-center text-green-600">
                          {optimization.savingsPercentage.toFixed(1)}% reduction
                        </div>
                      </div>

                      {/* Time Optimization */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Time Savings</span>
                          <span className="text-sm font-bold text-blue-600">
                            {optimization.timeSavings} min
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>Current: {optimization.currentTime} min</span>
                          <span>Optimized: {optimization.optimizedTime} min</span>
                        </div>
                        <Progress 
                          value={(optimization.timeSavings / optimization.currentTime) * 100} 
                          className="h-2"
                        />
                        <div className="text-xs text-center text-blue-600">
                          {((optimization.timeSavings / optimization.currentTime) * 100).toFixed(1)}% faster
                        </div>
                      </div>

                      {/* Distance Optimization */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Distance Savings</span>
                          <span className="text-sm font-bold text-purple-600">
                            {optimization.distanceSavings.toFixed(1)} km
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>Current: {optimization.currentDistance.toFixed(1)} km</span>
                          <span>Optimized: {optimization.optimizedDistance.toFixed(1)} km</span>
                        </div>
                        <Progress 
                          value={(optimization.distanceSavings / optimization.currentDistance) * 100} 
                          className="h-2"
                        />
                        <div className="text-xs text-center text-purple-600">
                          {((optimization.distanceSavings / optimization.currentDistance) * 100).toFixed(1)}% shorter
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button size="sm" variant="outline">
                        Apply Optimization
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optimization Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Impact Projection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="font-medium text-green-800">Cost Savings</div>
                  <div className="text-sm text-green-600">Per month if all optimizations applied</div>
                </div>
                <div className="text-xl font-bold text-green-800">
                  ${(totalSavings * 4).toFixed(2)}
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-medium text-blue-800">Time Savings</div>
                  <div className="text-sm text-blue-600">Hours saved per month</div>
                </div>
                <div className="text-xl font-bold text-blue-800">
                  {((totalTimeSavings * 4) / 60).toFixed(1)}h
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div>
                  <div className="font-medium text-purple-800">Efficiency Gain</div>
                  <div className="text-sm text-purple-600">Overall improvement</div>
                </div>
                <div className="text-xl font-bold text-purple-800">
                  {averageSavingsPercentage.toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Optimization Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium">Schedule Optimization</div>
                  <div className="text-sm text-gray-600">
                    Plan trips during off-peak hours to reduce travel time and fuel costs.
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <Users className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium">Load Consolidation</div>
                  <div className="text-sm text-gray-600">
                    Combine multiple small trips into fewer, more efficient journeys.
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <Route className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <div className="font-medium">Route Planning</div>
                  <div className="text-sm text-gray-600">
                    Use real-time traffic data to select the most efficient routes.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
