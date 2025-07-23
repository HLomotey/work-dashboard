'use client'

import { useState } from 'react'
import { 
  Play,
  Download,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { useBillingPeriods, usePayrollExport } from '@/hooks/use-billing'
import { BillingStatus, PayrollExportStatus, type BillingPeriod } from '@/lib/types/billing'

interface BillingPeriodActionsProps {
  period: BillingPeriod
  onPeriodUpdate?: (period: BillingPeriod) => void
}

export function BillingPeriodActions({ period, onPeriodUpdate }: BillingPeriodActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  const { processPeriod, updatePeriod } = useBillingPeriods()
  const { createExport } = usePayrollExport()

  const canProcess = period.status === BillingStatus.DRAFT
  const canExport = period.status === BillingStatus.COMPLETED
  const canCancel = [BillingStatus.DRAFT, BillingStatus.PROCESSING].includes(period.status)

  const handleProcessCharges = async () => {
    try {
      setIsProcessing(true)
      setError(null)
      setProcessingProgress(0)

      // Simulate processing steps with progress updates
      const steps = [
        { message: 'Validating billing period...', progress: 20 },
        { message: 'Calculating housing charges...', progress: 40 },
        { message: 'Calculating transport charges...', progress: 60 },
        { message: 'Applying prorations...', progress: 80 },
        { message: 'Finalizing charges...', progress: 100 }
      ]

      for (const step of steps) {
        setProcessingProgress(step.progress)
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate processing time
      }

      const updatedPeriod = await processPeriod(period.id)
      onPeriodUpdate?.(updatedPeriod)
    } catch (err) {
      console.error('Error processing charges:', err)
      setError(err instanceof Error ? err.message : 'Failed to process charges')
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }

  const handleExportToPayroll = async () => {
    try {
      setIsExporting(true)
      setError(null)

      const exportData = await createExport({
        billingPeriodId: period.id,
        exportDate: new Date(),
        fileName: `payroll-export-${period.id}.csv`,
        recordCount: 0,
        totalAmount: 0,
        status: PayrollExportStatus.PENDING,
        format: 'csv',
        metadata: {
          includeDetails: true
        }
      })

      // Update period status to exported
      const updatedPeriod = await updatePeriod(period.id, {
        status: BillingStatus.EXPORTED,
        payrollExportDate: new Date()
      })

      onPeriodUpdate?.(updatedPeriod)
    } catch (err) {
      console.error('Error exporting to payroll:', err)
      setError(err instanceof Error ? err.message : 'Failed to export to payroll')
    } finally {
      setIsExporting(false)
    }
  }

  const handleCancelPeriod = async () => {
    try {
      const updatedPeriod = await updatePeriod(period.id, {
        status: BillingStatus.CANCELLED
      })
      onPeriodUpdate?.(updatedPeriod)
    } catch (err) {
      console.error('Error cancelling period:', err)
      setError(err instanceof Error ? err.message : 'Failed to cancel period')
    }
  }

  const handleReactivatePeriod = async () => {
    try {
      const updatedPeriod = await updatePeriod(period.id, {
        status: BillingStatus.DRAFT
      })
      onPeriodUpdate?.(updatedPeriod)
    } catch (err) {
      console.error('Error reactivating period:', err)
      setError(err instanceof Error ? err.message : 'Failed to reactivate period')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Period Actions
        </CardTitle>
        <CardDescription>
          Manage billing period operations and payroll export
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Processing Progress */}
        {isProcessing && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Processing Charges</span>
                  <span className="text-sm text-muted-foreground">{processingProgress}%</span>
                </div>
                <Progress value={processingProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  This may take a few minutes depending on the number of staff and charges...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Process Charges */}
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="default" 
                className="w-full gap-2" 
                disabled={!canProcess || isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Process Charges
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Process Billing Period Charges</DialogTitle>
                <DialogDescription>
                  This will calculate and generate all housing and transport charges for this billing period. 
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Processing will:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Calculate rent charges for all active housing assignments</li>
                      <li>Calculate utility charges based on occupancy</li>
                      <li>Calculate transport charges for all trips in this period</li>
                      <li>Apply prorations for partial periods</li>
                      <li>Update the billing period status to "Processing" then "Completed"</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
              <DialogFooter>
                <Button variant="outline" disabled={isProcessing}>
                  Cancel
                </Button>
                <Button onClick={handleProcessCharges} disabled={isProcessing}>
                  {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Start Processing
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Export to Payroll */}
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full gap-2" 
                disabled={!canExport || isExporting}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Export to Payroll
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export to Payroll System</DialogTitle>
                <DialogDescription>
                  Export the completed billing period charges to your payroll system for processing.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Export will:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Generate a CSV file with all staff deductions</li>
                      <li>Include detailed breakdown by charge type</li>
                      <li>Mark the billing period as "Exported"</li>
                      <li>Set the export timestamp for audit purposes</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
              <DialogFooter>
                <Button variant="outline" disabled={isExporting}>
                  Cancel
                </Button>
                <Button onClick={handleExportToPayroll} disabled={isExporting}>
                  {isExporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Export Now
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Generate Report */}
          <Button variant="outline" className="w-full gap-2">
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>

          {/* Cancel/Reactivate Period */}
          {period.status === BillingStatus.CANCELLED ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reactivate Period
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reactivate Billing Period</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reactivate the cancelled billing period and set its status back to "Draft". 
                    You can then process charges again.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReactivatePeriod}>
                    Reactivate
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : canCancel ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full gap-2">
                  <X className="h-4 w-4" />
                  Cancel Period
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Billing Period</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will cancel the billing period and prevent any further processing. 
                    This action can be reversed by reactivating the period.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Period</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleCancelPeriod}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Cancel Period
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </div>

        {/* Status Information */}
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {period.status === BillingStatus.DRAFT && (
              <>
                <Clock className="h-4 w-4" />
                Period is ready for charge processing
              </>
            )}
            {period.status === BillingStatus.PROCESSING && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Charges are being processed
              </>
            )}
            {period.status === BillingStatus.COMPLETED && (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                Period is ready for payroll export
              </>
            )}
            {period.status === BillingStatus.EXPORTED && (
              <>
                <Download className="h-4 w-4 text-purple-600" />
                Period has been exported to payroll
              </>
            )}
            {period.status === BillingStatus.CANCELLED && (
              <>
                <X className="h-4 w-4 text-red-600" />
                Period has been cancelled
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
