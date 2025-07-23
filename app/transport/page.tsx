'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Car, 
  Route, 
  Users, 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Settings,
  Plus,
  MapPin
} from 'lucide-react'

// Transport Management Components
import { VehicleList } from '@/components/transport/vehicle-list'
import { VehicleForm } from '@/components/transport/vehicle-form'
import { TripList } from '@/components/transport/trip-list'
import { TripForm } from '@/components/transport/trip-form'
import { TransportDashboard } from '@/components/transport/transport-dashboard'
import { RouteOptimizer } from '@/components/transport/route-optimizer'
import { FleetUtilization } from '@/components/transport/fleet-utilization'
import { TransportReports } from '@/components/transport/transport-reports'

export default function TransportManagementPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [showTripForm, setShowTripForm] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transport Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage fleet vehicles, trips, and transportation analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Vehicles</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <Car className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Trips</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <Route className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Passengers Today</p>
                <p className="text-2xl font-bold">156</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fleet Utilization</p>
                <p className="text-2xl font-bold">82%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="trips">Trips</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <TransportDashboard />
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Vehicle Management</h2>
              <p className="text-sm text-muted-foreground">
                Manage fleet vehicles and their maintenance schedules
              </p>
            </div>
            <Button onClick={() => setShowVehicleForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </div>
          <VehicleList />
          {showVehicleForm && (
            <VehicleForm />
          )}
        </TabsContent>

        <TabsContent value="trips" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Trip Management</h2>
              <p className="text-sm text-muted-foreground">
                Schedule and track transportation trips
              </p>
            </div>
            <Button onClick={() => setShowTripForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Trip
            </Button>
          </div>
          <TripList />
          {showTripForm && (
            <TripForm />
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Route Optimization
                </CardTitle>
                <CardDescription>
                  Optimize routes for cost and efficiency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RouteOptimizer />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Fleet Utilization
                </CardTitle>
                <CardDescription>
                  Monitor vehicle usage and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FleetUtilization />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Transport Reports</h2>
            <p className="text-sm text-muted-foreground">
              Generate comprehensive reports and analytics
            </p>
          </div>
          <TransportReports />
        </TabsContent>
      </Tabs>
    </div>
  )
}
