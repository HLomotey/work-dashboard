'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Edit,
  Save,
  X,
  Camera,
  Shield,
  Bell,
  Settings,
  AlertCircle,
  CheckCircle,
  Upload
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useStaffProfile } from '@/hooks/use-staff'
import { z } from 'zod'
import type { StaffWithProfile } from '@/lib/types/user'
import { EmploymentStatus, UserRole } from '@/lib/types/user'
import { cn } from '@/lib/utils'

interface StaffProfileProps {
  staffId: string
  onProfileUpdated?: (profile: any) => void
}

// Form schemas
const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  dateOfBirth: z.date().optional(),
  address: z.string().optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional(),
  }).optional(),
})

const professionalInfoSchema = z.object({
  department: z.string().optional(),
  position: z.string().optional(),
  startDate: z.date().optional(),
  supervisor: z.string().optional(),
  skills: z.array(z.string()).optional(),
  bio: z.string().max(500).optional(),
})

type PersonalInfoForm = z.infer<typeof personalInfoSchema>
type ProfessionalInfoForm = z.infer<typeof professionalInfoSchema>

// Mock staff profile data with extended properties for component functionality
const mockStaffProfile = {
  id: 'staff-1',
  employeeId: 'EMP001',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@company.com',
  phone: '+1 (555) 123-4567',
  employmentStatus: EmploymentStatus.ACTIVE,
  housingEligible: true,
  role: UserRole.STAFF,
  departmentId: 'dept-1',
  createdAt: new Date('2022-03-15'),
  updatedAt: new Date('2024-01-15'),
  department: {
    id: 'dept-1',
    name: 'Engineering'
  },
  userProfile: {
    id: 'profile-1',
    userId: 'user-1',
    staffId: 'staff-1',
    role: UserRole.STAFF,
    permissions: [],
    createdAt: new Date('2022-03-15'),
    updatedAt: new Date('2024-01-15')
  },
  // Extended properties for component functionality
  position: 'Senior Software Engineer',
  startDate: new Date('2022-03-15'),
  status: 'active',
  profile: {
    dateOfBirth: new Date('1990-05-20'),
    address: '123 Main Street, Apt 4B, New York, NY 10001',
    emergencyContact: {
      name: 'Jane Doe',
      phone: '+1 (555) 987-6543',
      relationship: 'Spouse'
    },
    supervisor: 'Alice Johnson',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'],
    bio: 'Experienced software engineer with a passion for building scalable web applications. Enjoys working with modern technologies and mentoring junior developers.',
    avatarUrl: null,
    preferences: {
      language: 'en',
      timezone: 'America/New_York',
      theme: 'light'
    },
    createdAt: new Date('2022-03-15'),
    updatedAt: new Date('2024-01-15')
  }
}

export function StaffProfile({ staffId, onProfileUpdated }: StaffProfileProps) {
  const [isEditingPersonal, setIsEditingPersonal] = useState(false)
  const [isEditingProfessional, setIsEditingProfessional] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  // In real implementation, this would fetch data based on staffId
  const { profile, isLoading, error, updateProfile } = useStaffProfile(staffId)
  
  // Use mock data for demonstration
  const staffProfile = mockStaffProfile

  const personalForm = useForm<PersonalInfoForm>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: staffProfile.firstName,
      lastName: staffProfile.lastName,
      email: staffProfile.email,
      phone: staffProfile.phone || '',
      dateOfBirth: (staffProfile as any).profile?.dateOfBirth,
      address: (staffProfile as any).profile?.address || '',
      emergencyContact: (staffProfile as any).profile?.emergencyContact || {
        name: '',
        phone: '',
        relationship: ''
      },
    },
  })

  const professionalForm = useForm<ProfessionalInfoForm>({
    resolver: zodResolver(professionalInfoSchema),
    defaultValues: {
      department: typeof (staffProfile as any).department === 'string' ? (staffProfile as any).department : (staffProfile as any).department?.name || '',
      position: (staffProfile as any).position || '',
      startDate: (staffProfile as any).startDate || new Date(),
      supervisor: (staffProfile as any).profile?.supervisor || '',
      skills: (staffProfile as any).profile?.skills || [],
      bio: (staffProfile as any).profile?.bio || '',
    },
  })

  const onSubmitPersonal = async (data: PersonalInfoForm) => {
    try {
      // In real implementation, this would call the API
      console.log('Updating personal info:', data)
      
      setIsEditingPersonal(false)
      onProfileUpdated?.(data)
    } catch (error) {
      console.error('Failed to update personal info:', error)
    }
  }

  const onSubmitProfessional = async (data: ProfessionalInfoForm) => {
    try {
      // In real implementation, this would call the API
      console.log('Updating professional info:', data)
      
      setIsEditingProfessional(false)
      onProfileUpdated?.(data)
    } catch (error) {
      console.error('Failed to update professional info:', error)
    }
  }

  const handleAvatarUpload = async (file: File) => {
    setIsUploadingAvatar(true)
    try {
      // In real implementation, this would upload the file
      console.log('Uploading avatar:', file.name)
      
      // Mock successful upload
      setTimeout(() => {
        setIsUploadingAvatar(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to upload avatar:', error)
      setIsUploadingAvatar(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Failed to load profile</p>
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
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={staffProfile.profile?.avatarUrl || undefined} />
                <AvatarFallback className="text-lg">
                  {staffProfile.firstName[0]}{staffProfile.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Profile Picture</DialogTitle>
                    <DialogDescription>
                      Upload a new profile picture. Recommended size is 400x400 pixels.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Drag and drop an image here, or click to browse
                      </p>
                      <Button variant="outline" size="sm" disabled={isUploadingAvatar}>
                        {isUploadingAvatar ? 'Uploading...' : 'Choose File'}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Supported formats: JPG, PNG (Max 5MB)
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">
                  {staffProfile.firstName} {staffProfile.lastName}
                </h1>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {staffProfile.status}
                </Badge>
              </div>
              
              <div className="space-y-1 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span>{(staffProfile as any).position} • {typeof (staffProfile as any).department === 'string' ? (staffProfile as any).department : (staffProfile as any).department?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{staffProfile.email}</span>
                </div>
                {staffProfile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{staffProfile.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {format(staffProfile.startDate, 'MMMM yyyy')}</span>
                </div>
              </div>
              
              {staffProfile.profile?.bio && (
                <p className="mt-3 text-sm leading-relaxed">
                  {staffProfile.profile.bio}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="professional">Professional Details</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Manage your personal details and contact information
                  </CardDescription>
                </div>
                <Button
                  variant={isEditingPersonal ? "outline" : "default"}
                  onClick={() => setIsEditingPersonal(!isEditingPersonal)}
                  className="gap-2"
                >
                  {isEditingPersonal ? (
                    <>
                      <X className="h-4 w-4" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4" />
                      Edit
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isEditingPersonal ? (
                <Form {...personalForm}>
                  <form onSubmit={personalForm.handleSubmit(onSubmitPersonal)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={personalForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={personalForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={personalForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={personalForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={personalForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Emergency Contact</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={personalForm.control}
                          name="emergencyContact.name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={personalForm.control}
                          name="emergencyContact.phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={personalForm.control}
                          name="emergencyContact.relationship"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Relationship</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="gap-2">
                        <Save className="h-4 w-4" />
                        Save Changes
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditingPersonal(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                      <p className="text-sm">{staffProfile.firstName} {staffProfile.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Employee ID</p>
                      <p className="text-sm font-mono">{staffProfile.employeeId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="text-sm">{staffProfile.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <p className="text-sm">{staffProfile.phone || 'Not provided'}</p>
                    </div>
                    {staffProfile.profile?.dateOfBirth && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                        <p className="text-sm">{format(staffProfile.profile.dateOfBirth, 'MMMM dd, yyyy')}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Address</p>
                      <p className="text-sm">{staffProfile.profile?.address || 'Not provided'}</p>
                    </div>
                  </div>

                  {staffProfile.profile?.emergencyContact && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium mb-3">Emergency Contact</h4>
                        <div className="grid grid-cols-3 gap-6">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Name</p>
                            <p className="text-sm">{staffProfile.profile.emergencyContact.name || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Phone</p>
                            <p className="text-sm">{staffProfile.profile.emergencyContact.phone || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Relationship</p>
                            <p className="text-sm">{staffProfile.profile.emergencyContact.relationship || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professional" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Professional Details</CardTitle>
                  <CardDescription>
                    Your work-related information and skills
                  </CardDescription>
                </div>
                <Button
                  variant={isEditingProfessional ? "outline" : "default"}
                  onClick={() => setIsEditingProfessional(!isEditingProfessional)}
                  className="gap-2"
                >
                  {isEditingProfessional ? (
                    <>
                      <X className="h-4 w-4" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4" />
                      Edit
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isEditingProfessional ? (
                <Form {...professionalForm}>
                  <form onSubmit={professionalForm.handleSubmit(onSubmitProfessional)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={professionalForm.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={professionalForm.control}
                        name="position"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Position</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={professionalForm.control}
                      name="supervisor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Supervisor</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={professionalForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Tell us about your professional background and interests..."
                              className="min-h-[100px]"
                            />
                          </FormControl>
                          <FormDescription>
                            Brief description of your role and expertise (max 500 characters)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="gap-2">
                        <Save className="h-4 w-4" />
                        Save Changes
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditingProfessional(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Department</p>
                      <p className="text-sm">{typeof (staffProfile as any).department === 'string' ? (staffProfile as any).department : (staffProfile as any).department?.name || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Position</p>
                      <p className="text-sm">{(staffProfile as any).position || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                      <p className="text-sm">{format(staffProfile.startDate, 'MMMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Supervisor</p>
                      <p className="text-sm">{staffProfile.profile?.supervisor || 'Not assigned'}</p>
                    </div>
                  </div>

                  {staffProfile.profile?.skills && staffProfile.profile.skills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {staffProfile.profile.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {staffProfile.profile?.bio && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Professional Bio</p>
                      <p className="text-sm leading-relaxed bg-muted p-3 rounded-md">
                        {staffProfile.profile.bio}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Preferences</CardTitle>
              <CardDescription>
                Customize your account settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Language</p>
                  <Select defaultValue={staffProfile.profile?.preferences?.language || 'en'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Timezone</p>
                  <Select defaultValue={staffProfile.profile?.preferences?.timezone || 'America/New_York'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Theme</p>
                <Select defaultValue={staffProfile.profile?.preferences?.theme || 'light'}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security and privacy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-muted-foreground">
                    Update your account password
                  </p>
                </div>
                <Button variant="outline">
                  Change Password
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="outline">
                  Enable 2FA
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
