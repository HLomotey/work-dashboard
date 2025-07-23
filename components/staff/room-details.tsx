'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { 
  Home,
  MapPin,
  Users,
  Bed,
  Wifi,
  Car,
  Coffee,
  Shield,
  Zap,
  Droplets,
  Wind,
  Camera,
  Star,
  Info,
  Phone,
  Mail,
  Clock,
  DollarSign,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useRoomDetails } from '@/hooks/use-housing'
import { type RoomWithAssignments, type PropertyWithRooms } from '@/lib/types/housing'
import { cn } from '@/lib/utils'

interface RoomDetailsProps {
  roomId: string
  onBack?: () => void
  onContactProperty?: () => void
}

const amenityIcons = {
  wifi: { icon: Wifi, label: 'High-Speed WiFi', description: 'Complimentary high-speed internet access' },
  ac: { icon: Wind, label: 'Air Conditioning', description: 'Individual climate control in each room' },
  parking: { icon: Car, label: 'Parking Space', description: 'Dedicated parking space included' },
  laundry: { icon: Coffee, label: 'Laundry Facilities', description: 'On-site washer and dryer access' },
  gym: { icon: Users, label: 'Fitness Center', description: '24/7 access to fully equipped gym' },
  kitchen: { icon: Coffee, label: 'Shared Kitchen', description: 'Fully equipped communal kitchen' },
  security: { icon: Shield, label: 'Security System', description: '24/7 security monitoring and keycard access' },
  utilities: { icon: Zap, label: 'Utilities Included', description: 'Electricity, water, and heating included' },
  cleaning: { icon: Droplets, label: 'Cleaning Service', description: 'Weekly cleaning service for common areas' }
}

// Mock room details data - in real implementation, this would come from the API
const mockRoomDetails: RoomWithAssignments & { property: PropertyWithRooms } = {
  id: 'room-1',
  propertyId: 'prop-1',
  roomNumber: '204',
  capacity: 2,
  currentOccupancy: 1,
  monthlyRate: 850.00,
  status: 'available' as any,
  amenities: ['wifi', 'ac', 'parking', 'laundry', 'gym', 'security', 'utilities'],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  assignments: [],
  isAvailable: true,
  property: {
    id: 'prop-1',
    name: 'Riverside Apartments',
    address: '123 River View Drive, Downtown',
    totalCapacity: 120,
    status: 'active' as any,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    rooms: [],
    occupancyRate: 85,
    availableCapacity: 18,
    description: 'Modern apartment complex with river views and premium amenities. Located in the heart of downtown with easy access to public transportation and major business districts.',
    contactInfo: {
      phone: '+1 (555) 123-4567',
      email: 'info@riversideapts.com',
      manager: 'Building A, Ground Floor - Mon-Fri: 9AM-6PM, Sat: 10AM-4PM'
    },
    photos: [
      '/images/room-1.jpg',
      '/images/room-2.jpg',
      '/images/common-area.jpg',
      '/images/exterior.jpg'
    ]
  }
}

export function RoomDetails({ roomId, onBack, onContactProperty }: RoomDetailsProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  
  // In real implementation, this would fetch data based on roomId
  const { room, isLoading, error } = useRoomDetails(roomId)
  
  // Use mock data for demonstration
  const roomDetails = mockRoomDetails

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev === (roomDetails.property.photos?.length || 1) - 1 ? 0 : prev + 1
    )
  }

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev === 0 ? (roomDetails.property.photos?.length || 1) - 1 : prev - 1
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading room details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Failed to load room details</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">Room {roomDetails.roomNumber}</h1>
            <p className="text-muted-foreground">{roomDetails.property.name}</p>
          </div>
        </div>
        <Badge 
          variant={roomDetails.isAvailable ? "default" : "secondary"}
          className="gap-1"
        >
          {roomDetails.isAvailable ? "Available" : "Occupied"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo Gallery */}
          <Card>
            <CardContent className="p-0">
              <div className="relative">
                <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                  {roomDetails.property.photos && roomDetails.property.photos.length > 0 ? (
                    <div className="relative h-full">
                      <div className="h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <Camera className="h-16 w-16 text-blue-400" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">Room Photo {currentPhotoIndex + 1}</span>
                        </div>
                      </div>
                      {roomDetails.property.photos.length > 1 && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                            onClick={prevPhoto}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                            onClick={nextPhoto}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="h-full bg-muted flex items-center justify-center">
                      <Camera className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                {roomDetails.property.photos && roomDetails.property.photos.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="flex gap-2">
                      {roomDetails.property.photos.map((_, index) => (
                        <button
                          key={index}
                          className={cn(
                            "w-2 h-2 rounded-full transition-colors",
                            index === currentPhotoIndex ? "bg-white" : "bg-white/50"
                          )}
                          onClick={() => setCurrentPhotoIndex(index)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Room Information Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
              <TabsTrigger value="property">Property Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Room Overview</CardTitle>
                  <CardDescription>Basic information about this room</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Room Number</p>
                      <p className="text-lg font-semibold">{roomDetails.roomNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Monthly Rate</p>
                      <p className="text-lg font-semibold text-green-600">
                        ${roomDetails.monthlyRate?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Capacity</p>
                      <p className="text-lg">{roomDetails.capacity} people</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Current Occupancy</p>
                      <p className="text-lg">
                        {roomDetails.currentOccupancy} of {roomDetails.capacity}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Availability Status</p>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        roomDetails.isAvailable ? "bg-green-500" : "bg-red-500"
                      )} />
                      <span className="text-sm">
                        {roomDetails.isAvailable ? "Available for assignment" : "Currently occupied"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="amenities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Room & Property Amenities</CardTitle>
                  <CardDescription>All available amenities and services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roomDetails.amenities?.map((amenity) => {
                      const amenityConfig = amenityIcons[amenity as keyof typeof amenityIcons]
                      if (!amenityConfig) return null
                      
                      const IconComponent = amenityConfig.icon
                      return (
                        <div key={amenity} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="bg-primary/10 p-2 rounded-md">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{amenityConfig.label}</h4>
                            <p className="text-sm text-muted-foreground">
                              {amenityConfig.description}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="property" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Property Information</CardTitle>
                  <CardDescription>Details about {roomDetails.property.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">About the Property</h4>
                    <p className="text-sm text-muted-foreground">
                      {(roomDetails.property as any).description}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Address</p>
                      <p className="text-sm">{roomDetails.property.address}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Capacity</p>
                      <p className="text-sm">{roomDetails.property.totalCapacity} residents</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Occupancy Rate</p>
                      <p className="text-sm">{roomDetails.property.occupancyRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Available Spaces</p>
                      <p className="text-sm">{roomDetails.property.availableCapacity} rooms</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">${roomDetails.monthlyRate?.toLocaleString() || 'N/A'}/month</p>
                  <p className="text-sm text-muted-foreground">Monthly rate</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{roomDetails.capacity} people max</p>
                  <p className="text-sm text-muted-foreground">Room capacity</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Bed className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {roomDetails.currentOccupancy} of {roomDetails.capacity} occupied
                  </p>
                  <p className="text-sm text-muted-foreground">Current occupancy</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Property Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{(roomDetails.property as any).contactInfo?.phone}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{(roomDetails.property as any).contactInfo?.email}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{(roomDetails.property as any).contactInfo?.office}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{(roomDetails.property as any).contactInfo?.hours}</span>
                </div>
              </div>
              
              <Button className="w-full" onClick={onContactProperty}>
                Contact Property Manager
              </Button>
            </CardContent>
          </Card>

          {/* Rating */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Property Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={cn(
                        "h-4 w-4",
                        star <= 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      )} 
                    />
                  ))}
                </div>
                <span className="font-medium">4.0</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Based on resident reviews and property standards
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
