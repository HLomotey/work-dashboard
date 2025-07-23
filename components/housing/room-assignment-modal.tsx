'use client'

import * as React from 'react'
import { z } from 'zod'
import { CalendarIcon, User, Bed, Building } from 'lucide-react'
import { format } from 'date-fns'

import type { Room, CreateRoomAssignment, Staff } from '@/lib/types/housing'
import { CreateRoomAssignmentSchema } from '@/lib/types/housing'
import { useRoomAssignments } from '@/hooks/use-housing'
import { useStaff } from '@/hooks/use-auth'
import { 
  Modal, 
  FormBuilder, 
  FormFieldConfig,
  DatePicker,
  SearchInput,
  LoadingSpinner 
} from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

interface RoomAssignmentModalProps {
  room: Room
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function RoomAssignmentModal({
  room,
  open,
  onOpenChange,
  onSuccess,
}: RoomAssignmentModalProps) {
  const [selectedStaff, setSelectedStaff] = React.useState<Staff | null>(null)
  const [step, setStep] = React.useState<'select-staff' | 'assignment-details'>('select-staff')
  
  const { createAssignment } = useRoomAssignments()
  const { staff, isLoading: staffLoading } = useStaff({
    housingEligible: true,
    employmentStatus: 'active',
  })

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (open) {
      setStep('select-staff')
      setSelectedStaff(null)
    }
  }, [open])

  const handleStaffSelect = (staff: Staff) => {
    setSelectedStaff(staff)
    setStep('assignment-details')
  }

  const handleBack = () => {
    setStep('select-staff')
    setSelectedStaff(null)
  }

  const handleAssignmentSubmit = async (data: any) => {
    if (!selectedStaff) return

    try {
      const assignmentData: CreateRoomAssignment = {
        roomId: room.id,
        staffId: selectedStaff.id,
        startDate: data.startDate,
        endDate: data.endDate,
        status: 'active',
        moveInDate: data.moveInDate,
      }

      await createAssignment(assignmentData)
      toast.success(`Room ${room.roomNumber} assigned to ${selectedStaff.firstName} ${selectedStaff.lastName}`)
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Assignment failed:', error)
      throw error
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={step === 'select-staff' ? 'Select Staff Member' : 'Assignment Details'}
      description={
        step === 'select-staff' 
          ? `Choose a staff member to assign to Room ${room.roomNumber}`
          : `Configure assignment details for ${selectedStaff?.firstName} ${selectedStaff?.lastName}`
      }
      size="lg"
    >
      {step === 'select-staff' ? (
        <StaffSelectionStep
          room={room}
          staff={staff || []}
          loading={staffLoading}
          onSelect={handleStaffSelect}
        />
      ) : (
        <AssignmentDetailsStep
          room={room}
          staff={selectedStaff!}
          onSubmit={handleAssignmentSubmit}
          onBack={handleBack}
        />
      )}
    </Modal>
  )
}

// Staff Selection Step
interface StaffSelectionStepProps {
  room: Room
  staff: Staff[]
  loading: boolean
  onSelect: (staff: Staff) => void
}

function StaffSelectionStep({ room, staff, loading, onSelect }: StaffSelectionStepProps) {
  const [searchQuery, setSearchQuery] = React.useState('')

  const filteredStaff = React.useMemo(() => {
    if (!searchQuery) return staff
    
    return staff.filter(s => 
      s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [staff, searchQuery])

  return (
    <div className="space-y-4">
      {/* Room Info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Bed className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg">Room {room.roomNumber}</CardTitle>
              <CardDescription>
                Capacity: {room.capacity} beds • Status: {room.status}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Search Staff</label>
        <SearchInput
          placeholder="Search by name, employee ID, or email..."
          onValueChange={setSearchQuery}
        />
      </div>

      {/* Staff List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {loading ? (
          <LoadingSpinner />
        ) : filteredStaff.length > 0 ? (
          filteredStaff.map((staffMember) => (
            <Card
              key={staffMember.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onSelect(staffMember)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {staffMember.firstName[0]}{staffMember.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">
                      {staffMember.firstName} {staffMember.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {staffMember.employeeId} • {staffMember.email}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="capitalize">
                      {staffMember.role.replace('_', ' ')}
                    </Badge>
                    {staffMember.housingEligible && (
                      <Badge variant="secondary">Housing Eligible</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? 'No staff members match your search.' : 'No eligible staff members found.'}
          </div>
        )}
      </div>
    </div>
  )
}

// Assignment Details Step
interface AssignmentDetailsStepProps {
  room: Room
  staff: Staff
  onSubmit: (data: any) => Promise<void>
  onBack: () => void
}

function AssignmentDetailsStep({ room, staff, onSubmit, onBack }: AssignmentDetailsStepProps) {
  const [loading, setLoading] = React.useState(false)

  // Form fields
  const fields: FormFieldConfig<any>[] = [
    {
      name: 'startDate',
      label: 'Assignment Start Date',
      type: 'date',
      required: true,
      description: 'When the room assignment begins',
    },
    {
      name: 'endDate',
      label: 'Assignment End Date',
      type: 'date',
      description: 'Leave empty for open-ended assignment',
    },
    {
      name: 'moveInDate',
      label: 'Expected Move-in Date',
      type: 'date',
      description: 'When the staff member is expected to move in',
    },
  ]

  const defaultValues = {
    startDate: new Date(),
    endDate: undefined,
    moveInDate: new Date(),
  }

  const handleSubmit = async (data: any) => {
    setLoading(true)
    try {
      await onSubmit(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Assignment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assignment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Room</div>
              <div className="flex items-center space-x-2">
                <Bed className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Room {room.roomNumber}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Capacity: {room.capacity} beds
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Staff Member</div>
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {staff.firstName[0]}{staff.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">
                  {staff.firstName} {staff.lastName}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {staff.employeeId}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assignment Details</CardTitle>
          <CardDescription>
            Configure the dates and details for this room assignment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormBuilder
            schema={z.object({
              startDate: z.date(),
              endDate: z.date().optional(),
              moveInDate: z.date().optional(),
            })}
            fields={fields}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            loading={loading}
            submitText="Create Assignment"
            cancelText="Back"
            onCancel={onBack}
          />
        </CardContent>
      </Card>
    </div>
  )
}