'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  DollarSign, 
  User, 
  Bell, 
  Settings, 
  MapPin,
  Receipt,
  Phone
} from 'lucide-react'

// Staff Self-Service Components
import { StaffHousingView } from '@/components/staff/staff-housing-view'
import { HousingHistory } from '@/components/staff/housing-history'
import { RoomDetails } from '@/components/staff/room-details'
import { HousingRequests } from '@/components/staff/housing-requests'
import { StaffCharges } from '@/components/staff/staff-charges'
import { ChargeHistory } from '@/components/staff/charge-history'
import { BillingDispute } from '@/components/staff/billing-dispute'
import { PaymentHistory } from '@/components/staff/payment-history'
import { StaffProfile } from '@/components/staff/staff-profile'
import { ProfileSettings } from '@/components/staff/profile-settings'
import { NotificationSettings } from '@/components/staff/notification-settings'
import { ContactUpdate } from '@/components/staff/contact-update'

export default function StaffPortalPage() {
  const [activeTab, setActiveTab] = useState('housing')
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  
  // Mock staff ID - in real implementation, this would come from authentication
  const staffId = 'staff-1'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Portal</h1>
          <p className="text-muted-foreground mt-2">
            Manage your housing, billing, and profile information
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
        </div>
      </div>

      {/* Quick Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Housing</p>
                <p className="text-lg font-semibold">Room 204B</p>
                <p className="text-xs text-muted-foreground">Riverside Apartments</p>
              </div>
              <Home className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Charges</p>
                <p className="text-lg font-semibold">$850.00</p>
                <p className="text-xs text-muted-foreground">March 2024</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profile Status</p>
                <p className="text-lg font-semibold">Complete</p>
                <p className="text-xs text-muted-foreground">Last updated 2 days ago</p>
              </div>
              <User className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="housing">Housing</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="housing" className="space-y-4">
          <Tabs defaultValue="current" className="space-y-4">
            <TabsList>
              <TabsTrigger value="current">Current Assignment</TabsTrigger>
              <TabsTrigger value="history">Housing History</TabsTrigger>
              <TabsTrigger value="requests">Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Current Housing Assignment</h2>
                <p className="text-sm text-muted-foreground">
                  View your current housing details and room information
                </p>
              </div>
              <StaffHousingView 
                staffId={staffId}
                onViewDetails={(roomId: string) => setSelectedRoomId(roomId)}
              />
              {selectedRoomId && (
                <RoomDetails 
                  roomId={selectedRoomId}
                  onBack={() => setSelectedRoomId(null)}
                />
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Housing History</h2>
                <p className="text-sm text-muted-foreground">
                  View your complete housing assignment history
                </p>
              </div>
              <HousingHistory staffId={staffId} />
            </TabsContent>

            <TabsContent value="requests" className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Housing Requests</h2>
                <p className="text-sm text-muted-foreground">
                  Submit and track housing change requests
                </p>
              </div>
              <HousingRequests staffId={staffId} />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Tabs defaultValue="current" className="space-y-4">
            <TabsList>
              <TabsTrigger value="current">Current Charges</TabsTrigger>
              <TabsTrigger value="history">Charge History</TabsTrigger>
              <TabsTrigger value="payments">Payment History</TabsTrigger>
              <TabsTrigger value="disputes">Disputes</TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Current Charges</h2>
                <p className="text-sm text-muted-foreground">
                  View your current billing charges and breakdown
                </p>
              </div>
              <StaffCharges staffId={staffId} />
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Charge History</h2>
                <p className="text-sm text-muted-foreground">
                  View your complete billing history with detailed breakdowns
                </p>
              </div>
              <ChargeHistory staffId={staffId} />
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Payment History</h2>
                <p className="text-sm text-muted-foreground">
                  Track your payment history and deduction details
                </p>
              </div>
              <PaymentHistory staffId={staffId} />
            </TabsContent>

            <TabsContent value="disputes" className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Billing Disputes</h2>
                <p className="text-sm text-muted-foreground">
                  Submit and track billing dispute inquiries
                </p>
              </div>
              <BillingDispute staffId={staffId} />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList>
              <TabsTrigger value="profile">Profile Information</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="contact">Contact Updates</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Profile Information</h2>
                <p className="text-sm text-muted-foreground">
                  Manage your personal and professional information
                </p>
              </div>
              <StaffProfile staffId={staffId} />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Profile Settings</h2>
                <p className="text-sm text-muted-foreground">
                  Configure your preferences and privacy settings
                </p>
              </div>
              <ProfileSettings staffId={staffId} />
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Notification Settings</h2>
                <p className="text-sm text-muted-foreground">
                  Control how and when you receive notifications
                </p>
              </div>
              <NotificationSettings staffId={staffId} />
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Contact Information Updates</h2>
                <p className="text-sm text-muted-foreground">
                  Request changes to your contact information
                </p>
              </div>
              <ContactUpdate staffId={staffId} />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  )
}
