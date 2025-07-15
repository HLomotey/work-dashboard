"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3 } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  Area,
  AreaChart,
  Pie,
  PieChart as RechartsPieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

const revenueData = [
  { month: "Jan", revenue: 2100000, expenses: 1400000, profit: 700000 },
  { month: "Feb", revenue: 2300000, expenses: 1500000, profit: 800000 },
  { month: "Mar", revenue: 2200000, expenses: 1450000, profit: 750000 },
  { month: "Apr", revenue: 2500000, expenses: 1600000, profit: 900000 },
  { month: "May", revenue: 2400000, expenses: 1550000, profit: 850000 },
  { month: "Jun", revenue: 2600000, expenses: 1650000, profit: 950000 },
]

const clientRevenueData = [
  { client: "TechCorp", revenue: 450000, color: "#3b82f6" },
  { client: "GlobalInc", revenue: 380000, color: "#10b981" },
  { client: "StartupXYZ", revenue: 290000, color: "#f59e0b" },
  { client: "Enterprise Co", revenue: 520000, color: "#8b5cf6" },
  { client: "Others", revenue: 360000, color: "#ef4444" },
]

const cashFlowData = [
  { week: "Week 1", inflow: 580000, outflow: 420000 },
  { week: "Week 2", inflow: 620000, outflow: 380000 },
  { week: "Week 3", inflow: 540000, outflow: 450000 },
  { week: "Week 4", inflow: 680000, outflow: 520000 },
]

const expenseData = [
  { category: "Salaries", amount: 850000, color: "#3b82f6" },
  { category: "Operations", amount: 320000, color: "#10b981" },
  { category: "Marketing", amount: 180000, color: "#f59e0b" },
  { category: "Technology", amount: 150000, color: "#8b5cf6" },
  { category: "Other", amount: 150000, color: "#ef4444" },
]

export default function FinanceDashboard() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4"></div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Finance & Accounting Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Detailed financial performance and revenue metrics</p>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-green-600">$2.6M</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8.3% from last month
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gross Margin</p>
                  <p className="text-3xl font-bold text-blue-600">$68%</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +2.1% from last month
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Profit</p>
                  <p className="text-3xl font-bold text-purple-600">$950K</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +11.8% from last month
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cash Flow</p>
                  <p className="text-3xl font-bold text-orange-600">$1.2M</p>
                  <p className="text-sm text-red-600 flex items-center mt-1">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    -3.2% from last month
                  </p>
                </div>
                <PieChart className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue and Profit Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Profit Trend</CardTitle>
              <CardDescription>Monthly revenue, expenses, and profit comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  revenue: {
                    label: "Revenue",
                    color: "#10b981",
                  },
                  expenses: {
                    label: "Expenses",
                    color: "#ef4444",
                  },
                  profit: {
                    label: "Profit",
                    color: "#3b82f6",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stackId="2"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stackId="3"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue by Client</CardTitle>
              <CardDescription>Top clients by revenue contribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  revenue: {
                    label: "Revenue",
                    color: "#3b82f6",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={clientRevenueData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="revenue"
                      label={({ client, percent }) => `${client} ${(percent * 100).toFixed(0)}%`}
                    >
                      {clientRevenueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Cash Flow</CardTitle>
              <CardDescription>Cash inflow vs outflow by week</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  inflow: {
                    label: "Cash Inflow",
                    color: "#10b981",
                  },
                  outflow: {
                    label: "Cash Outflow",
                    color: "#ef4444",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashFlowData}>
                    <XAxis dataKey="week" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="inflow" fill="#10b981" />
                    <Bar dataKey="outflow" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>Monthly expenses by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  amount: {
                    label: "Amount",
                    color: "#3b82f6",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="amount"
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
