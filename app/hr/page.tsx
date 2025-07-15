"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, UserX, Clock, TrendingUp } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts"

const headcountData = [
  { department: "Engineering", count: 342, male: 198, female: 144 },
  { department: "Sales", count: 156, male: 89, female: 67 },
  { department: "Marketing", count: 78, male: 34, female: 44 },
  { department: "HR", count: 45, male: 18, female: 27 },
  { department: "Finance", count: 67, male: 32, female: 35 },
  { department: "Operations", count: 234, male: 145, female: 89 },
  { department: "Support", count: 125, male: 67, female: 58 },
]

const retentionData = [
  { month: "Jan", rate: 92 },
  { month: "Feb", rate: 94 },
  { month: "Mar", rate: 91 },
  { month: "Apr", rate: 95 },
  { month: "May", rate: 93 },
  { month: "Jun", rate: 94 },
]

const genderData = [
  { name: "Male", value: 583, color: "#3b82f6" },
  { name: "Female", value: 464, color: "#ec4899" },
  { name: "Other", value: 12, color: "#10b981" },
]

const hiringData = [
  { month: "Jan", hires: 23, timeToHire: 21 },
  { month: "Feb", hires: 18, timeToHire: 19 },
  { month: "Mar", hires: 31, timeToHire: 16 },
  { month: "Apr", hires: 27, timeToHire: 18 },
  { month: "May", hires: 34, timeToHire: 15 },
  { month: "Jun", hires: 29, timeToHire: 18 },
]

export default function HRDashboard() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4"></div>
          <h1 className="text-3xl font-bold text-foreground">Human Resources Dashboard</h1>
          <p className="text-muted-foreground mt-2">Detailed employee management and satisfaction metrics</p>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Headcount</p>
                  <p className="text-3xl font-bold text-blue-600">1,247</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +5.2% from last month
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Employee Retention</p>
                  <p className="text-3xl font-bold text-green-600">94%</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +1.2% from last month
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Terminations</p>
                  <p className="text-3xl font-bold text-red-600">23</p>
                  <p className="text-sm text-red-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8 from last month
                  </p>
                </div>
                <UserX className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Time to Hire</p>
                  <p className="text-3xl font-bold text-orange-600">18</p>
                  <p className="text-sm text-muted-foreground">days</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Headcount by Department</CardTitle>
              <CardDescription>Employee distribution across departments</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: {
                    label: "Employees",
                    color: "#3b82f6",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={headcountData}>
                    <XAxis dataKey="department" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Employee Retention Rate</CardTitle>
              <CardDescription>Monthly retention rate trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  rate: {
                    label: "Retention Rate",
                    color: "#10b981",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={retentionData}>
                    <XAxis dataKey="month" />
                    <YAxis domain={[85, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Gender Distribution</CardTitle>
              <CardDescription>Employee gender breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  male: {
                    label: "Male",
                    color: "#3b82f6",
                  },
                  female: {
                    label: "Female",
                    color: "#ec4899",
                  },
                  other: {
                    label: "Other",
                    color: "#10b981",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hiring Trends</CardTitle>
              <CardDescription>Monthly hires and time to hire</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  hires: {
                    label: "New Hires",
                    color: "#8b5cf6",
                  },
                  timeToHire: {
                    label: "Time to Hire (days)",
                    color: "#f59e0b",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hiringData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="hires" fill="#8b5cf6" />
                    <Bar dataKey="timeToHire" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
