'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  Calendar, 
  Receipt, 
  Download, 
  TrendingUp, 
  Calculator,
  Settings,
  Plus,
  FileText
} from 'lucide-react'

// Billing Management Components
import { BillingPeriodList } from '@/components/billing/billing-period-list'
import { BillingPeriodForm } from '@/components/billing/billing-period-form'
import { ChargeList } from '@/components/billing/charge-list'
import { ChargeForm } from '@/components/billing/charge-form'
import { ChargeCalculator } from '@/components/billing/charge-calculator'
import { PayrollExport } from '@/components/billing/payroll-export'
import { ExportHistory } from '@/components/billing/export-history'

export default function BillingManagementPage() {
  const [activeTab, setActiveTab] = useState('periods')
  const [showPeriodForm, setShowPeriodForm] = useState(false)
  const [showChargeForm, setShowChargeForm] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Billing Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage billing periods, charges, and payroll exports
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
                <p className="text-sm font-medium text-muted-foreground">Current Period</p>
                <p className="text-2xl font-bold">Mar 2024</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Charges</p>
                <p className="text-2xl font-bold">$48,250</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processed Staff</p>
                <p className="text-2xl font-bold">186</p>
              </div>
              <Receipt className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Export Status</p>
                <p className="text-2xl font-bold">Ready</p>
              </div>
              <Download className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="periods">Billing Periods</TabsTrigger>
          <TabsTrigger value="charges">Charges</TabsTrigger>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="export">Payroll Export</TabsTrigger>
          <TabsTrigger value="history">Export History</TabsTrigger>
        </TabsList>

        <TabsContent value="periods" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Billing Periods</h2>
              <p className="text-sm text-muted-foreground">
                Manage billing periods and their processing status
              </p>
            </div>
            <Button onClick={() => setShowPeriodForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Period
            </Button>
          </div>
          <BillingPeriodList />
          {showPeriodForm && (
            <BillingPeriodForm />
          )}
        </TabsContent>

        <TabsContent value="charges" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Charge Management</h2>
              <p className="text-sm text-muted-foreground">
                View and manage individual charges for staff
              </p>
            </div>
            <Button onClick={() => setShowChargeForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Charge
            </Button>
          </div>
          <ChargeList />
          {showChargeForm && (
            <ChargeForm />
          )}
        </TabsContent>

        <TabsContent value="calculator" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Charge Calculator</h2>
            <p className="text-sm text-muted-foreground">
              Calculate charges with automatic proration and adjustments
            </p>
          </div>
          <ChargeCalculator />
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Payroll Export</h2>
            <p className="text-sm text-muted-foreground">
              Export billing data for payroll processing
            </p>
          </div>
          <PayrollExport />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Export History</h2>
            <p className="text-sm text-muted-foreground">
              View and download previous payroll exports
            </p>
          </div>
          <ExportHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}
