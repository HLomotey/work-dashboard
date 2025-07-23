'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Settings,
  Save,
  RotateCcw,
  FileText,
  Download,
  Database,
  Users,
  Calendar,
  Info,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'

const exportSettingsSchema = z.object({
  // Default Export Settings
  defaultFormat: z.enum(['csv', 'excel', 'json']),
  defaultIncludeDetails: z.boolean(),
  defaultIncludeMetadata: z.boolean(),
  defaultGroupByDepartment: z.boolean(),
  defaultIncludeZeroAmounts: z.boolean(),
  
  // File Settings
  fileNamingPattern: z.string().min(1, 'File naming pattern is required'),
  compressionEnabled: z.boolean(),
  encryptionEnabled: z.boolean(),
  
  // Automation Settings
  autoExportEnabled: z.boolean(),
  autoExportSchedule: z.enum(['daily', 'weekly', 'monthly', 'period_end']),
  autoExportFormat: z.enum(['csv', 'excel', 'json']),
  
  // Notification Settings
  emailNotifications: z.boolean(),
  notificationEmails: z.string().optional(),
  slackNotifications: z.boolean(),
  slackWebhookUrl: z.string().optional(),
  
  // Data Retention
  retentionDays: z.number().min(1).max(365),
  autoCleanupEnabled: z.boolean(),
  
  // Integration Settings
  payrollSystemIntegration: z.boolean(),
  payrollSystemUrl: z.string().optional(),
  payrollSystemApiKey: z.string().optional(),
})

type ExportSettingsFormData = z.infer<typeof exportSettingsSchema>

interface ExportSettingsProps {
  onSave?: (settings: ExportSettingsFormData) => void
}

const defaultSettings: ExportSettingsFormData = {
  defaultFormat: 'csv',
  defaultIncludeDetails: true,
  defaultIncludeMetadata: false,
  defaultGroupByDepartment: false,
  defaultIncludeZeroAmounts: false,
  fileNamingPattern: 'payroll-export-{period}-{timestamp}',
  compressionEnabled: false,
  encryptionEnabled: true,
  autoExportEnabled: false,
  autoExportSchedule: 'period_end',
  autoExportFormat: 'csv',
  emailNotifications: true,
  notificationEmails: '',
  slackNotifications: false,
  slackWebhookUrl: '',
  retentionDays: 90,
  autoCleanupEnabled: true,
  payrollSystemIntegration: false,
  payrollSystemUrl: '',
  payrollSystemApiKey: '',
}

export function ExportSettings({ onSave }: ExportSettingsProps) {
  const [activeTab, setActiveTab] = useState('defaults')
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const form = useForm<ExportSettingsFormData>({
    resolver: zodResolver(exportSettingsSchema),
    defaultValues: defaultSettings,
  })

  const onSubmit = async (data: ExportSettingsFormData) => {
    try {
      setIsSaving(true)
      setSaveStatus('idle')
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onSave?.(data)
      setSaveStatus('success')
      
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    form.reset(defaultSettings)
  }

  const watchAutoExport = form.watch('autoExportEnabled')
  const watchEmailNotifications = form.watch('emailNotifications')
  const watchSlackNotifications = form.watch('slackNotifications')
  const watchPayrollIntegration = form.watch('payrollSystemIntegration')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Export Settings</h2>
          <p className="text-muted-foreground">
            Configure default settings for payroll exports
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSaving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Save Status */}
      {saveStatus === 'success' && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Export settings have been saved successfully.
          </AlertDescription>
        </Alert>
      )}

      {saveStatus === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to save export settings. Please try again.
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="defaults">Defaults</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="automation">Automation</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="integration">Integration</TabsTrigger>
            </TabsList>

            {/* Default Export Settings */}
            <TabsContent value="defaults" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Default Export Settings
                  </CardTitle>
                  <CardDescription>
                    Set default values for new exports
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="defaultFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Export Format</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select default format" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="csv">CSV (Comma Separated Values)</SelectItem>
                            <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                            <SelectItem value="json">JSON (JavaScript Object Notation)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The default file format for new exports
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="defaultIncludeDetails"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Include Details</FormLabel>
                            <FormDescription>
                              Include detailed breakdown by charge type
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
                      control={form.control}
                      name="defaultIncludeMetadata"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Include Metadata</FormLabel>
                            <FormDescription>
                              Include calculation metadata and audit information
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
                      control={form.control}
                      name="defaultGroupByDepartment"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Group by Department</FormLabel>
                            <FormDescription>
                              Organize export data by department
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
                      control={form.control}
                      name="defaultIncludeZeroAmounts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Include Zero Amounts</FormLabel>
                            <FormDescription>
                              Include staff with zero deductions
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* File Settings */}
            <TabsContent value="files" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    File Settings
                  </CardTitle>
                  <CardDescription>
                    Configure file naming, compression, and security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="fileNamingPattern"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>File Naming Pattern</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="payroll-export-{period}-{timestamp}"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Use {'{period}'} for billing period and {'{timestamp}'} for current date/time
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="compressionEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Compression</FormLabel>
                            <FormDescription>
                              Compress export files to reduce size
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
                      control={form.control}
                      name="encryptionEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Encryption</FormLabel>
                            <FormDescription>
                              Encrypt export files for security
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

                  <FormField
                    control={form.control}
                    name="retentionDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>File Retention (Days)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="365"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 90)}
                          />
                        </FormControl>
                        <FormDescription>
                          Number of days to keep export files before automatic cleanup
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="autoCleanupEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Auto Cleanup</FormLabel>
                          <FormDescription>
                            Automatically delete old export files
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
            </TabsContent>

            {/* Automation Settings */}
            <TabsContent value="automation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Automation Settings
                  </CardTitle>
                  <CardDescription>
                    Configure automatic export scheduling
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="autoExportEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Enable Auto Export</FormLabel>
                          <FormDescription>
                            Automatically export payroll data on schedule
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

                  {watchAutoExport && (
                    <div className="space-y-4 pl-4 border-l-2 border-muted">
                      <FormField
                        control={form.control}
                        name="autoExportSchedule"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Export Schedule</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select schedule" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="period_end">At Period End</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              When to automatically generate exports
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="autoExportFormat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Auto Export Format</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="csv">CSV</SelectItem>
                                <SelectItem value="excel">Excel</SelectItem>
                                <SelectItem value="json">JSON</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              File format for automatic exports
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Notification Settings
                  </CardTitle>
                  <CardDescription>
                    Configure export completion notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Email Notifications</FormLabel>
                          <FormDescription>
                            Send email notifications for export completion
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

                  {watchEmailNotifications && (
                    <FormField
                      control={form.control}
                      name="notificationEmails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notification Email Addresses</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="admin@company.com, hr@company.com"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Comma-separated list of email addresses to notify
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="slackNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Slack Notifications</FormLabel>
                          <FormDescription>
                            Send Slack notifications for export completion
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

                  {watchSlackNotifications && (
                    <FormField
                      control={form.control}
                      name="slackWebhookUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slack Webhook URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://hooks.slack.com/services/..."
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Slack webhook URL for notifications
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Integration Settings */}
            <TabsContent value="integration" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Payroll System Integration
                  </CardTitle>
                  <CardDescription>
                    Configure integration with external payroll systems
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="payrollSystemIntegration"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Enable Integration</FormLabel>
                          <FormDescription>
                            Automatically send exports to payroll system
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

                  {watchPayrollIntegration && (
                    <div className="space-y-4 pl-4 border-l-2 border-muted">
                      <FormField
                        control={form.control}
                        name="payrollSystemUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payroll System URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://api.payrollsystem.com/v1/imports"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              API endpoint for payroll system integration
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="payrollSystemApiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Key</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter API key"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              API key for authentication with payroll system
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Security Note:</strong> API keys are encrypted and stored securely. 
                          Test the connection after saving to ensure proper integration.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  )
}
