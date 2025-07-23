'use client'

import { useState } from 'react'
import { 
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  Home,
  Car,
  DollarSign,
  AlertTriangle,
  Calendar,
  Users,
  Settings,
  Volume2,
  VolumeX,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNotificationSettings } from '@/hooks/use-staff'
import { cn } from '@/lib/utils'

interface NotificationSettingsProps {
  staffId: string
  onSettingsUpdated?: (settings: any) => void
}

// Notification categories and types
enum NotificationCategory {
  HOUSING = 'housing',
  BILLING = 'billing',
  TRANSPORT = 'transport',
  SYSTEM = 'system',
  SOCIAL = 'social'
}

enum NotificationMethod {
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
  IN_APP = 'in_app'
}

enum NotificationFrequency {
  IMMEDIATE = 'immediate',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  NEVER = 'never'
}

// Form schema
const notificationSettingsSchema = z.object({
  // Housing notifications
  housingAssignmentChanges: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
    inApp: z.boolean(),
  }),
  housingMaintenanceUpdates: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
    inApp: z.boolean(),
  }),
  
  // Billing notifications
  billingStatements: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
    inApp: z.boolean(),
  }),
  paymentReminders: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
    inApp: z.boolean(),
  }),
  chargeDisputes: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
    inApp: z.boolean(),
  }),
  
  // Transport notifications
  tripUpdates: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
    inApp: z.boolean(),
  }),
  scheduleChanges: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
    inApp: z.boolean(),
  }),
  
  // System notifications
  systemMaintenance: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
    inApp: z.boolean(),
  }),
  securityAlerts: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
    inApp: z.boolean(),
  }),
  
  // Social notifications
  directMessages: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
    inApp: z.boolean(),
  }),
  mentions: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
    inApp: z.boolean(),
  }),
  
  // General settings
  quietHours: z.object({
    enabled: z.boolean(),
    startTime: z.string(),
    endTime: z.string(),
  }),
  digestFrequency: z.nativeEnum(NotificationFrequency),
  soundEnabled: z.boolean(),
})

type NotificationSettingsForm = z.infer<typeof notificationSettingsSchema>

// Mock notification settings
const mockNotificationSettings: NotificationSettingsForm = {
  housingAssignmentChanges: { email: true, push: true, sms: false, inApp: true },
  housingMaintenanceUpdates: { email: true, push: true, sms: false, inApp: true },
  billingStatements: { email: true, push: false, sms: false, inApp: true },
  paymentReminders: { email: true, push: true, sms: true, inApp: true },
  chargeDisputes: { email: true, push: true, sms: false, inApp: true },
  tripUpdates: { email: false, push: true, sms: false, inApp: true },
  scheduleChanges: { email: true, push: true, sms: false, inApp: true },
  systemMaintenance: { email: true, push: false, sms: false, inApp: true },
  securityAlerts: { email: true, push: true, sms: true, inApp: true },
  directMessages: { email: false, push: true, sms: false, inApp: true },
  mentions: { email: true, push: true, sms: false, inApp: true },
  quietHours: { enabled: true, startTime: '22:00', endTime: '07:00' },
  digestFrequency: NotificationFrequency.DAILY,
  soundEnabled: true,
}

const notificationTypes = [
  {
    category: 'Housing',
    icon: Home,
    color: 'text-blue-600',
    items: [
      {
        key: 'housingAssignmentChanges',
        label: 'Housing Assignment Changes',
        description: 'Room assignments, move-in/out dates, and housing status updates'
      },
      {
        key: 'housingMaintenanceUpdates',
        label: 'Maintenance Updates',
        description: 'Maintenance request status updates and completion notifications'
      }
    ]
  },
  {
    category: 'Billing',
    icon: DollarSign,
    color: 'text-green-600',
    items: [
      {
        key: 'billingStatements',
        label: 'Billing Statements',
        description: 'Monthly billing statements and charge summaries'
      },
      {
        key: 'paymentReminders',
        label: 'Payment Reminders',
        description: 'Payment due dates and overdue payment notifications'
      },
      {
        key: 'chargeDisputes',
        label: 'Charge Dispute Updates',
        description: 'Updates on billing dispute status and resolutions'
      }
    ]
  },
  {
    category: 'Transport',
    icon: Car,
    color: 'text-purple-600',
    items: [
      {
        key: 'tripUpdates',
        label: 'Trip Updates',
        description: 'Trip confirmations, cancellations, and real-time updates'
      },
      {
        key: 'scheduleChanges',
        label: 'Schedule Changes',
        description: 'Transport schedule modifications and route updates'
      }
    ]
  },
  {
    category: 'System',
    icon: Settings,
    color: 'text-orange-600',
    items: [
      {
        key: 'systemMaintenance',
        label: 'System Maintenance',
        description: 'Planned maintenance windows and system downtime notifications'
      },
      {
        key: 'securityAlerts',
        label: 'Security Alerts',
        description: 'Account security notifications and suspicious activity alerts'
      }
    ]
  },
  {
    category: 'Social',
    icon: Users,
    color: 'text-pink-600',
    items: [
      {
        key: 'directMessages',
        label: 'Direct Messages',
        description: 'Private messages from other staff members'
      },
      {
        key: 'mentions',
        label: 'Mentions',
        description: 'When you are mentioned in comments or discussions'
      }
    ]
  }
]

const methodIcons = {
  email: Mail,
  push: Smartphone,
  sms: MessageSquare,
  inApp: Bell
}

export function NotificationSettings({ staffId, onSettingsUpdated }: NotificationSettingsProps) {
  const [isSaving, setIsSaving] = useState(false)

  // In real implementation, this would fetch data based on staffId
  const { settings, isLoading, error, updateSettings } = useNotificationSettings(staffId)
  
  // Use mock data for demonstration
  const notificationSettings = mockNotificationSettings

  const form = useForm<NotificationSettingsForm>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: notificationSettings,
  })

  const onSubmit = async (data: NotificationSettingsForm) => {
    setIsSaving(true)
    try {
      // In real implementation, this would call the API
      console.log('Updating notification settings:', data)
      
      // Mock successful update
      setTimeout(() => {
        setIsSaving(false)
        onSettingsUpdated?.(data)
      }, 1000)
    } catch (error) {
      console.error('Failed to update notification settings:', error)
      setIsSaving(false)
    }
  }

  const handleTestNotification = async (type: string) => {
    try {
      // In real implementation, this would send a test notification
      console.log('Sending test notification:', type)
    } catch (error) {
      console.error('Failed to send test notification:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading notification settings...</p>
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
            <p className="text-muted-foreground">Failed to load notification settings</p>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Customize how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="preferences" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="preferences">Notification Preferences</TabsTrigger>
                  <TabsTrigger value="general">General Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="preferences" className="space-y-6">
                  {notificationTypes.map((category) => {
                    const IconComponent = category.icon
                    
                    return (
                      <Card key={category.category}>
                        <CardHeader>
                          <CardTitle className={cn("flex items-center gap-2 text-base", category.color)}>
                            <IconComponent className="h-4 w-4" />
                            {category.category}
                          </CardTitle>
                          <CardDescription>
                            Configure {category.category.toLowerCase()} notification preferences
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {category.items.map((item) => (
                            <div key={item.key} className="space-y-3">
                              <div>
                                <h4 className="font-medium">{item.label}</h4>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              </div>
                              
                              <div className="grid grid-cols-4 gap-4">
                                {(['email', 'push', 'sms', 'inApp'] as const).map((method) => {
                                  const MethodIcon = methodIcons[method]
                                  const fieldName = `${item.key}.${method}` as any
                                  
                                  return (
                                    <FormField
                                      key={method}
                                      control={form.control}
                                      name={fieldName}
                                      render={({ field }) => (
                                        <FormItem className="flex flex-col items-center space-y-2">
                                          <div className="flex flex-col items-center space-y-1">
                                            <MethodIcon className="h-4 w-4 text-muted-foreground" />
                                            <FormLabel className="text-xs font-normal capitalize">
                                              {method === 'inApp' ? 'In-App' : method}
                                            </FormLabel>
                                          </div>
                                          <FormControl>
                                            <Switch
                                              checked={field.value}
                                              onCheckedChange={field.onChange}
                                            />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                  )
                                })}
                              </div>
                              
                              <div className="flex justify-end">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleTestNotification(item.key)}
                                >
                                  Test
                                </Button>
                              </div>
                              
                              {category.items.indexOf(item) < category.items.length - 1 && (
                                <Separator className="mt-4" />
                              )}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )
                  })}
                </TabsContent>

                <TabsContent value="general" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>General Settings</CardTitle>
                      <CardDescription>
                        Configure general notification behavior and preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Quiet Hours */}
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="quietHours.enabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="flex items-center gap-2">
                                  <VolumeX className="h-4 w-4" />
                                  Quiet Hours
                                </FormLabel>
                                <FormDescription>
                                  Disable notifications during specified hours
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {form.watch('quietHours.enabled') && (
                          <div className="grid grid-cols-2 gap-4 ml-4">
                            <FormField
                              control={form.control}
                              name="quietHours.startTime"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Start Time</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {Array.from({ length: 24 }, (_, i) => {
                                        const hour = i.toString().padStart(2, '0')
                                        return (
                                          <SelectItem key={hour} value={`${hour}:00`}>
                                            {hour}:00
                                          </SelectItem>
                                        )
                                      })}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="quietHours.endTime"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>End Time</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {Array.from({ length: 24 }, (_, i) => {
                                        const hour = i.toString().padStart(2, '0')
                                        return (
                                          <SelectItem key={hour} value={`${hour}:00`}>
                                            {hour}:00
                                          </SelectItem>
                                        )
                                      })}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Digest Frequency */}
                      <FormField
                        control={form.control}
                        name="digestFrequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Digest Frequency
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value={NotificationFrequency.IMMEDIATE}>
                                  Immediate - Get notifications as they happen
                                </SelectItem>
                                <SelectItem value={NotificationFrequency.DAILY}>
                                  Daily - Receive a daily summary
                                </SelectItem>
                                <SelectItem value={NotificationFrequency.WEEKLY}>
                                  Weekly - Receive a weekly summary
                                </SelectItem>
                                <SelectItem value={NotificationFrequency.NEVER}>
                                  Never - Disable digest emails
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              How often you want to receive notification summaries via email
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Separator />

                      {/* Sound Settings */}
                      <FormField
                        control={form.control}
                        name="soundEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="flex items-center gap-2">
                                {field.value ? (
                                  <Volume2 className="h-4 w-4" />
                                ) : (
                                  <VolumeX className="h-4 w-4" />
                                )}
                                Notification Sounds
                              </FormLabel>
                              <FormDescription>
                                Play sounds for in-app notifications
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Notification Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Summary</CardTitle>
                      <CardDescription>
                        Overview of your current notification preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {Object.values(form.getValues()).filter((category: any) => 
                              typeof category === 'object' && category.email
                            ).length}
                          </div>
                          <div className="text-sm text-muted-foreground">Email Notifications</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {Object.values(form.getValues()).filter((category: any) => 
                              typeof category === 'object' && category.push
                            ).length}
                          </div>
                          <div className="text-sm text-muted-foreground">Push Notifications</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {Object.values(form.getValues()).filter((category: any) => 
                              typeof category === 'object' && category.sms
                            ).length}
                          </div>
                          <div className="text-sm text-muted-foreground">SMS Notifications</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {Object.values(form.getValues()).filter((category: any) => 
                              typeof category === 'object' && category.inApp
                            ).length}
                          </div>
                          <div className="text-sm text-muted-foreground">In-App Notifications</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isSaving} className="gap-2">
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Notification Settings
                </Button>
                <Button type="button" variant="outline" onClick={() => handleTestNotification('all')}>
                  Send Test Notification
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
