"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, DollarSign, Briefcase, TrendingUp, TrendingDown, Clock, Target } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function MainDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Corporate Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of key metrics across all departments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Human Resources Section */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-xl">Human Resources</CardTitle>
              </div>
              <Badge variant="secondary">HR</Badge>
            </div>
            <CardDescription>Employee management and satisfaction metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">1,247</div>
                <div className="text-sm text-muted-foreground">Head Count</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600">94%</div>
                <div className="text-sm text-muted-foreground">Retention Rate</div>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">23</div>
                <div className="text-sm text-muted-foreground">Terminations</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">18</div>
                <div className="text-sm text-muted-foreground">Days to Hire</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-1 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">+5.2% from last month</span>
              </div>
              <Link href="/hr">
                <Button
                  variant="outline"
                  size="sm"
                  className="group-hover:bg-blue-600 group-hover:text-white transition-colors bg-transparent"
                >
                  View Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Finance/Accounting Section */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-6 w-6 text-green-600" />
                <CardTitle className="text-xl">Finance & Accounting</CardTitle>
              </div>
              <Badge variant="secondary">FIN</Badge>
            </div>
            <CardDescription>Financial performance and revenue metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600">$2.4M</div>
                <div className="text-sm text-muted-foreground">Daily Revenue</div>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">68%</div>
                <div className="text-sm text-muted-foreground">Gross Margin</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">$890K</div>
                <div className="text-sm text-muted-foreground">Net Profit</div>
              </div>
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">92%</div>
                <div className="text-sm text-muted-foreground">Client Satisfaction</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-1 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">+12.8% from last month</span>
              </div>
              <Link href="/finance">
                <Button
                  variant="outline"
                  size="sm"
                  className="group-hover:bg-green-600 group-hover:text-white transition-colors bg-transparent"
                >
                  View Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Field Operations Section */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-6 w-6 text-orange-600" />
                <CardTitle className="text-xl">Field Operations</CardTitle>
              </div>
              <Badge variant="secondary">OPS</Badge>
            </div>
            <CardDescription>Job orders and placement performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">342</div>
                <div className="text-sm text-muted-foreground">Total Job Orders</div>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">87%</div>
                <div className="text-sm text-muted-foreground">Fill Rate</div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-sm text-muted-foreground">Days to Fill</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">91%</div>
                <div className="text-sm text-muted-foreground">Placement Rate</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-1 text-red-600">
                <TrendingDown className="h-4 w-4" />
                <span className="text-sm">-2.1% from last month</span>
              </div>
              <Link href="/operations">
                <Button
                  variant="outline"
                  size="sm"
                  className="group-hover:bg-orange-600 group-hover:text-white transition-colors bg-transparent"
                >
                  View Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">8.2</div>
                <div className="text-sm text-muted-foreground">Avg Daily Hours</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">$4,200</div>
                <div className="text-sm text-muted-foreground">Cost Per Hire</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">$1.2M</div>
                <div className="text-sm text-muted-foreground">Cash Flow</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">89%</div>
                <div className="text-sm text-muted-foreground">Employee Satisfaction</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
