'use client'

import { useState } from 'react'
import { 
  Settings,
  Globe,
  Clock,
  Palette,
  Shield,
  Key,
  Smartphone,
  Mail,
  Bell,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useProfileSettings } from '@/hooks/use-staff'
import { cn } from '@/lib/utils'

interface ProfileSettingsProps {
  staffId: string
  onSettingsUpdated?: (settings: any) => void
}

// Form schemas
const generalSettingsSchema = z.object({
  language: z.string(),
  timezone: z.string(),
  theme: z.enum(['light', 'dark', 'system']),
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']),
  timeFormat: z.enum(['12h', '24h']),
})

const securitySettingsSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

const privacySettingsSchema = z.object({
  profileVisibility: z.enum(['public', 'internal', 'private']),
  showEmail: z.boolean(),
  showPhone: z.boolean(),
  allowDirectMessages: z.boolean(),
  showOnlineStatus: z.boolean(),
})

type GeneralSettingsForm = z.infer<typeof generalSettingsSchema>
type SecuritySettingsForm = z.infer<typeof securitySettingsSchema>
type PrivacySettingsForm = z.infer<typeof privacySettingsSchema>

// Mock settings data
const mockSettings = {
  general: {
    language: 'en',
    timezone: 'America/New_York',
    theme: 'light' as const,
    dateFormat: 'MM/DD/YYYY' as const,
    timeFormat: '12h' as const,
  },
  privacy: {
    profileVisibility: 'internal' as const,
    showEmail: true,
    showPhone: false,
    allowDirectMessages: true,
    showOnlineStatus: true,
  },
  security: {
    twoFactorEnabled: false,
    lastPasswordChange: new Date('2023-10-15'),
    activeSessions: 3,
  }
}

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' },
]

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
]

export function ProfileSettings({ staffId, onSettingsUpdated }: ProfileSettingsProps) {
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // In real implementation, this would fetch data based on staffId
  const { settings, isLoading, error, updateSettings } = useProfileSettings(staffId)
  
  // Use mock data for demonstration
  const profileSettings = mockSettings

  const generalForm = useForm<GeneralSettingsForm>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: profileSettings.general,
  })

  const securityForm = useForm<SecuritySettingsForm>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const privacyForm = useForm<PrivacySettingsForm>({
    resolver: zodResolver(privacySettingsSchema),
    defaultValues: profileSettings.privacy,
  })

  const onSubmitGeneral = async (data: GeneralSettingsForm) => {
    setIsSaving(true)
    try {
      // In real implementation, this would call the API
      console.log('Updating general settings:', data)
      
      // Mock successful update
      setTimeout(() => {
        setIsSaving(false)
        onSettingsUpdated?.(data)
      }, 1000)
    } catch (error) {
      console.error('Failed to update general settings:', error)
      setIsSaving(false)
    }
  }

  const onSubmitSecurity = async (data: SecuritySettingsForm) => {
    setIsSaving(true)
    try {
      // In real implementation, this would call the API
      console.log('Updating password:', data)
      
      // Mock successful update
      setTimeout(() => {
        setIsSaving(false)
        setIsChangingPassword(false)
        securityForm.reset()
      }, 1000)
    } catch (error) {
      console.error('Failed to update password:', error)
      setIsSaving(false)
    }
  }

  const onSubmitPrivacy = async (data: PrivacySettingsForm) => {
    setIsSaving(true)
    try {
      // In real implementation, this would call the API
      console.log('Updating privacy settings:', data)
      
      // Mock successful update
      setTimeout(() => {
        setIsSaving(false)
        onSettingsUpdated?.(data)
      }, 1000)
    } catch (error) {
      console.error('Failed to update privacy settings:', error)
      setIsSaving(false)
    }
  }

  const handleEnable2FA = async () => {
    try {
      // In real implementation, this would initiate 2FA setup
      console.log('Enabling 2FA...')
    } catch (error) {
      console.error('Failed to enable 2FA:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
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
            <p className="text-muted-foreground">Failed to load settings</p>
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
            <Settings className="h-5 w-5" />
            Profile Settings
          </CardTitle>
          <CardDescription>
            Manage your account preferences, security, and privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    General Preferences
                  </CardTitle>
                  <CardDescription>
                    Customize your language, timezone, and display preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...generalForm}>
                    <form onSubmit={generalForm.handleSubmit(onSubmitGeneral)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={generalForm.control}
                          name="language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                Language
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {languages.map((lang) => (
                                    <SelectItem key={lang.value} value={lang.value}>
                                      {lang.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={generalForm.control}
                          name="timezone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Timezone
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {timezones.map((tz) => (
                                    <SelectItem key={tz.value} value={tz.value}>
                                      {tz.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={generalForm.control}
                          name="theme"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Palette className="h-4 w-4" />
                                Theme
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="light">Light</SelectItem>
                                  <SelectItem value="dark">Dark</SelectItem>
                                  <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={generalForm.control}
                          name="dateFormat"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date Format</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={generalForm.control}
                          name="timeFormat"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Time Format</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="12h">12 Hour</SelectItem>
                                  <SelectItem value="24h">24 Hour</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button type="submit" disabled={isSaving} className="gap-2">
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your account security and authentication methods
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Password Change */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Password</h4>
                        <p className="text-sm text-muted-foreground">
                          Last changed on {profileSettings.security.lastPasswordChange.toLocaleDateString()}
                        </p>
                      </div>
                      <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="gap-2">
                            <Key className="h-4 w-4" />
                            Change Password
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Change Password</DialogTitle>
                            <DialogDescription>
                              Enter your current password and choose a new one
                            </DialogDescription>
                          </DialogHeader>
                          
                          <Form {...securityForm}>
                            <form onSubmit={securityForm.handleSubmit(onSubmitSecurity)} className="space-y-4">
                              <FormField
                                control={securityForm.control}
                                name="currentPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Current Password</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Input
                                          type={showCurrentPassword ? "text" : "password"}
                                          {...field}
                                        />
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        >
                                          {showCurrentPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                          ) : (
                                            <Eye className="h-4 w-4" />
                                          )}
                                        </Button>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={securityForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Input
                                          type={showNewPassword ? "text" : "password"}
                                          {...field}
                                        />
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                          onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                          {showNewPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                          ) : (
                                            <Eye className="h-4 w-4" />
                                          )}
                                        </Button>
                                      </div>
                                    </FormControl>
                                    <FormDescription>
                                      Password must be at least 8 characters long
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={securityForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl>
                                      <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <DialogFooter>
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={() => setIsChangingPassword(false)}
                                >
                                  Cancel
                                </Button>
                                <Button type="submit" disabled={isSaving}>
                                  {isSaving ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : null}
                                  Update Password
                                </Button>
                              </DialogFooter>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <Separator />

                  {/* Two-Factor Authentication */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">
                        {profileSettings.security.twoFactorEnabled 
                          ? 'Add an extra layer of security to your account'
                          : 'Two-factor authentication is currently disabled'
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {profileSettings.security.twoFactorEnabled ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600">Enabled</span>
                          <Button variant="outline" size="sm">
                            Disable
                          </Button>
                        </div>
                      ) : (
                        <Button variant="outline" className="gap-2" onClick={handleEnable2FA}>
                          <Smartphone className="h-4 w-4" />
                          Enable 2FA
                        </Button>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Active Sessions */}
                  <div>
                    <h4 className="font-medium mb-2">Active Sessions</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      You have {profileSettings.security.activeSessions} active sessions across different devices
                    </p>
                    <Button variant="outline" size="sm">
                      Manage Sessions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Privacy Settings
                  </CardTitle>
                  <CardDescription>
                    Control who can see your information and how you appear to others
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...privacyForm}>
                    <form onSubmit={privacyForm.handleSubmit(onSubmitPrivacy)} className="space-y-6">
                      <FormField
                        control={privacyForm.control}
                        name="profileVisibility"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Profile Visibility</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="public">Public - Visible to everyone</SelectItem>
                                <SelectItem value="internal">Internal - Visible to company members only</SelectItem>
                                <SelectItem value="private">Private - Only visible to you</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Choose who can view your profile information
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <h4 className="font-medium">Contact Information Visibility</h4>
                        
                        <FormField
                          control={privacyForm.control}
                          name="showEmail"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="flex items-center gap-2">
                                  <Mail className="h-4 w-4" />
                                  Show Email Address
                                </FormLabel>
                                <FormDescription>
                                  Allow others to see your email address in your profile
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

                        <FormField
                          control={privacyForm.control}
                          name="showPhone"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="flex items-center gap-2">
                                  <Smartphone className="h-4 w-4" />
                                  Show Phone Number
                                </FormLabel>
                                <FormDescription>
                                  Allow others to see your phone number in your profile
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
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium">Communication Preferences</h4>
                        
                        <FormField
                          control={privacyForm.control}
                          name="allowDirectMessages"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="flex items-center gap-2">
                                  <Mail className="h-4 w-4" />
                                  Allow Direct Messages
                                </FormLabel>
                                <FormDescription>
                                  Allow other users to send you direct messages
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

                        <FormField
                          control={privacyForm.control}
                          name="showOnlineStatus"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel>Show Online Status</FormLabel>
                                <FormDescription>
                                  Show when you're online or active to other users
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
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button type="submit" disabled={isSaving} className="gap-2">
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Save Privacy Settings
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
