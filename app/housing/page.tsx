'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  Users, 
  Building, 
  MapPin, 
  TrendingUp, 
  Calendar,
  Settings,
  Plus
} from 'lucide-react'

// Housing Management Components
import { PropertyList } from '@/components/housing/property-list'
import { PropertyForm } from '@/components/housing/property-form'
import { RoomGrid } from '@/components/housing/room-grid'
import { RoomAssignmentModal } from '@/components/housing/room-assignment-modal'
import { OccupancyDashboard } from '@/components/housing/occupancy-dashboard'

export default function HousingManagementPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showPropertyForm, setShowPropertyForm] = useState(false)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Housing Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage properties, rooms, and staff assignments
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
                <p className="text-sm font-medium text-muted-foreground">Total Properties</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Rooms</p>
                <p className="text-2xl font-bold">248</p>
              </div>
              <Home className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Occupied Rooms</p>
                <p className="text-2xl font-bold">186</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Occupancy Rate</p>
                <p className="text-2xl font-bold">75%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <OccupancyDashboard />
        </TabsContent>

        <TabsContent value="properties" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Property Management</h2>
              <p className="text-sm text-muted-foreground">
                Manage housing properties and their details
              </p>
            </div>
            <Button onClick={() => setShowPropertyForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </div>
          <PropertyList />
          {showPropertyForm && (
            <PropertyForm />
          )}
        </TabsContent>

        <TabsContent value="rooms" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Room Management</h2>
              <p className="text-sm text-muted-foreground">
                Manage individual rooms and their configurations
              </p>
            </div>
          </div>
          <RoomGrid />
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Assignment Management</h2>
              <p className="text-sm text-muted-foreground">
                Manage staff housing assignments and transfers
              </p>
            </div>
            <Button onClick={() => setShowAssignmentModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Assignment
            </Button>
          </div>
          <div className="text-center py-8 text-muted-foreground">
            Assignment list will be displayed here
          </div>
          {showAssignmentModal && (
            <RoomAssignmentModal 
              room={{
                id: 'room-1',
                propertyId: 'prop-1',
                roomNumber: '101',
                capacity: 2,
                monthlyRate: 850,
                status: 'available' as any,
                amenities: ['wifi', 'ac'],
                createdAt: new Date(),
                updatedAt: new Date()
              }}
              open={showAssignmentModal}
              onOpenChange={setShowAssignmentModal}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
