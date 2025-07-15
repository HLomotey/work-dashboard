"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Clock, Target, TrendingUp, TrendingDown, CheckCircle } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts"

const jobOrderData = [
  { month: "Jan", total: 298, filled: 267, pending: 31 },
  { month: "Feb", total: 312, filled: 278, pending: 34 },
  { month: "Mar", total: 285, filled: 251, pending: 34 },
  { month: "Apr", total: 334, filled: 295, pending: 39 },
  { month: "May", total: 356, filled: 312, pending: 44 },
  { month: "Jun", total: 342, filled: 298, pending: 44 },
]

const fillRateData = [
  { region: "North", fillRate: 92, placements: 156 },
  { region: "South", fillRate: 87, placements: 134 },
  { region: "East", fillRate: 89, placements: 178 },
  { region: "West", fillRate: 85, placements: 142 },
  { region: "Central", fillRate: 91, placements: 167 },
]

const timeToFillData = [
  { month: "Jan", avgDays: 14, target: 12 },
  { month: "Feb", avgDays: 13, target: 12 },
  { month: "Mar", avgDays: 15, target: 12 },
  { month: "Apr", avgDays: 11, target: 12 },
  { month: "May", avgDays: 12, target: 12 },
  { month: "Jun", avgDays: 12, target: 12 },
]

const jobTypeData = [
  { type: "Permanent", count: 198, color: "#3b82f6" },
  { type: "Contract", count: 89, color: "#10b981" },
  { type: "Temporary", count: 55, color: "#f59e0b" },
]

const placementTrendData = [
  { week: "Week 1", placements: 67, target: 70 },
  { week: "Week 2", placements: 72, target: 70 },
  { week: "Week 3", placements: 68, target: 70 },
  { week: "Week 4", placements: 74, target: 70 },
]

export default function OperationsDashboard() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4"></div>
          <h1 className="text-3xl font-bold text-gray-900">Field Operations Dashboard</h1>
          <p className="text-gray-600 mt-2">Detailed job orders and placement performance metrics</p>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Job Orders</p>
                  <p className="text-3xl font-bold text-orange-600">342</p>
                  <p className="text-sm text-red-600 flex items-center mt-1">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    -3.8% from last month
                  </p>
                </div>
                <Briefcase className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fill Rate</p>
                  <p className="text-3xl font-bold text-green-600">87%</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +2.3% from last month
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Time to Fill</p>
                  <p className="text-3xl font-bold text-blue-600">12</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">days</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Placement Rate</p>
                  <p className="text-3xl font-bold text-purple-600">91%</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +1.8% from last month
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Orders and Fill Rate Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Job Orders Trend</CardTitle>
              <CardDescription>Monthly job orders: total, filled, and pending</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  total: {
                    label: "Total Orders",
                    color: "#3b82f6",
                  },
                  filled: {
                    label: "Filled Orders",
                    color: "#10b981",
                  },
                  pending: {
                    label: "Pending Orders",
                    color: "#f59e0b",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={jobOrderData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="filled" fill="#10b981" />
                    <Bar dataKey="pending" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fill Rate by Region</CardTitle>
              <CardDescription>Regional performance comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  fillRate: {
                    label: "Fill Rate (%)",
                    color: "#8b5cf6",
                  },
                  placements: {
                    label: "Placements",
                    color: "#06b6d4",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fillRateData}>
                    <XAxis dataKey="region" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="fillRate" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Time to Fill Trend</CardTitle>
              <CardDescription>Average days to fill vs target</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  avgDays: {
                    label: "Avg Days",
                    color: "#ef4444",
                  },
                  target: {
                    label: "Target",
                    color: "#10b981",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeToFillData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="avgDays" stroke="#ef4444" strokeWidth={3} />
                    <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Job Types Distribution</CardTitle>
              <CardDescription>Breakdown by employment type</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: {
                    label: "Count",
                    color: "#3b82f6",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={jobTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                    >
                      {jobTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
