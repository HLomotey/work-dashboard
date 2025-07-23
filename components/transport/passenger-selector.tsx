'use client'

import { useState, useEffect } from 'react'
import { Search, Users, X, Check, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useTripPassengers } from '@/hooks/use-transport'
import type { TripPassengerWithDetails } from '@/lib/types/transport'

// Mock staff data - in real implementation, this would come from a staff management system
interface StaffMember {
  id: string
  firstName: string
  lastName: string
  employeeId: string
  department: string
  email: string
}

const mockStaff: StaffMember[] = [
  { id: '1', firstName: 'John', lastName: 'Doe', employeeId: 'EMP001', department: 'Engineering', email: 'john.doe@company.com' },
  { id: '2', firstName: 'Jane', lastName: 'Smith', employeeId: 'EMP002', department: 'Marketing', email: 'jane.smith@company.com' },
  { id: '3', firstName: 'Mike', lastName: 'Johnson', employeeId: 'EMP003', department: 'Sales', email: 'mike.johnson@company.com' },
  { id: '4', firstName: 'Sarah', lastName: 'Wilson', employeeId: 'EMP004', department: 'HR', email: 'sarah.wilson@company.com' },
  { id: '5', firstName: 'David', lastName: 'Brown', employeeId: 'EMP005', department: 'Finance', email: 'david.brown@company.com' },
]

interface PassengerSelectorProps {
  tripId?: string
  vehicleCapacity: number
  selectedPassengers?: string[]
  onPassengersChange?: (passengerIds: string[]) => void
  onSave?: (passengers: TripPassengerWithDetails[]) => void
  onCancel?: () => void
  isModal?: boolean
}

export function PassengerSelector({
  tripId,
  vehicleCapacity,
  selectedPassengers = [],
  onPassengersChange,
  onSave,
  onCancel,
  isModal = false,
}: PassengerSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [localSelectedPassengers, setLocalSelectedPassengers] = useState<string[]>(selectedPassengers)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { passengers: tripPassengers, addPassenger: addTripPassenger, removePassenger: removeTripPassenger } = useTripPassengers(tripId)

  // Filter staff based on search term
  const filteredStaff = mockStaff.filter(staff => 
    staff.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle passenger selection
  const handlePassengerToggle = (staffId: string, checked: boolean) => {
    let newSelection: string[]
    
    if (checked) {
      if (localSelectedPassengers.length >= vehicleCapacity) {
        return // Don't add if at capacity
      }
      newSelection = [...localSelectedPassengers, staffId]
    } else {
      newSelection = localSelectedPassengers.filter(id => id !== staffId)
    }
    
    setLocalSelectedPassengers(newSelection)
    onPassengersChange?.(newSelection)
  }

  // Handle save for trip assignments
  const handleSave = async () => {
    if (!tripId || !onSave) return
    
    setIsSubmitting(true)
    try {
      // Create trip passenger records
      const passengers: TripPassengerWithDetails[] = []
      
      for (const staffId of localSelectedPassengers) {
        const staff = mockStaff.find(s => s.id === staffId)
        if (staff) {
          const tripPassenger = await addTripPassenger({
            tripId,
            staffId,
          })
          
          passengers.push({
            ...tripPassenger,
            staff: {
              id: staff.id,
              firstName: staff.firstName,
              lastName: staff.lastName,
              employeeId: staff.employeeId,
            }
          })
        }
      }
      
      onSave(passengers)
    } catch (error) {
      console.error('Error saving passengers:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  const isAtCapacity = localSelectedPassengers.length >= vehicleCapacity
  const remainingCapacity = vehicleCapacity - localSelectedPassengers.length

  const content = (
    <div className="space-y-6">
      {/* Header with capacity info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-semibold">Select Passengers</h3>
            <p className="text-sm text-gray-600">
              {localSelectedPassengers.length} of {vehicleCapacity} seats selected
            </p>
          </div>
        </div>
        
        <Badge variant={isAtCapacity ? 'destructive' : 'secondary'}>
          {remainingCapacity} seats remaining
        </Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search staff by name, ID, or department..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Selected passengers summary */}
      {localSelectedPassengers.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">Selected Passengers</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLocalSelectedPassengers([])
                  onPassengersChange?.([])
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {localSelectedPassengers.map(staffId => {
                const staff = mockStaff.find(s => s.id === staffId)
                if (!staff) return null
                
                return (
                  <Badge key={staffId} variant="secondary" className="flex items-center space-x-1">
                    <span>{staff.firstName} {staff.lastName}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handlePassengerToggle(staffId, false)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff list */}
      <ScrollArea className="h-96">
        <div className="space-y-2">
          {filteredStaff.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No staff members found matching your search.
            </div>
          ) : (
            filteredStaff.map((staff) => {
              const isSelected = localSelectedPassengers.includes(staff.id)
              const canSelect = !isSelected && !isAtCapacity
              
              return (
                <div
                  key={staff.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                    isSelected 
                      ? 'bg-blue-50 border-blue-200' 
                      : canSelect 
                        ? 'hover:bg-gray-50 border-gray-200' 
                        : 'bg-gray-50 border-gray-200 opacity-50'
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handlePassengerToggle(staff.id, checked as boolean)}
                    disabled={!canSelect && !isSelected}
                  />
                  
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {getInitials(staff.firstName, staff.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {staff.firstName} {staff.lastName}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {staff.employeeId}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {staff.department} • {staff.email}
                    </div>
                  </div>
                  
                  {isSelected && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>

      {/* Actions */}
      {(onSave || onCancel) && (
        <div className="flex justify-end space-x-3 pt-4 border-t">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          {onSave && (
            <Button
              onClick={handleSave}
              disabled={isSubmitting || localSelectedPassengers.length === 0}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : `Add ${localSelectedPassengers.length} Passengers`}
            </Button>
          )}
        </div>
      )}
    </div>
  )

  if (isModal) {
    return content
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Passenger Selection</CardTitle>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  )
}
