'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { 
  Calculator,
  Calendar,
  DollarSign,
  Users,
  Home,
  Zap,
  Car,
  FileText,
  Info,
  AlertCircle,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Percent
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCharges } from '@/hooks/use-billing'
import { ChargeType, type Charge } from '@/lib/types/billing'
import { cn } from '@/lib/utils'

interface ChargeBreakdownProps {
  chargeId: string
  onClose?: () => void
}

const chargeTypeConfig = {
  [ChargeType.RENT]: {
    label: 'Rent',
    icon: Home,
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    description: 'Housing rent charges with daily proration'
  },
  [ChargeType.UTILITIES]: {
    label: 'Utilities',
    icon: Zap,
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    description: 'Utility costs allocated per occupant'
  },
  [ChargeType.TRANSPORT]: {
    label: 'Transport',
    icon: Car,
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    description: 'Transportation costs per passenger'
  },
  [ChargeType.OTHER]: {
    label: 'Other',
    icon: FileText,
    color: 'bg-gray-500',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50',
    description: 'Miscellaneous charges and fees'
  }
}

export function ChargeBreakdown({ chargeId, onClose }: ChargeBreakdownProps) {
  const [showDetails, setShowDetails] = useState(true)
  const [showMetadata, setShowMetadata] = useState(false)
  
  const { charges, isLoading } = useCharges()
  const charge = charges?.find(c => c.id === chargeId)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  if (!charge) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Charge not found
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const config = chargeTypeConfig[charge.type]
  const Icon = config.icon

  // Calculate period information
  const startDate = charge.startDate ? new Date(charge.startDate) : null
  const endDate = charge.endDate ? new Date(charge.endDate) : null
  const periodDays = startDate && endDate ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1 : 30
  const monthDays = 30 // Standard month for calculations
  const prorationFactor = periodDays / monthDays

  // Extract metadata for detailed breakdown
  const metadata = charge.metadata || {}
  const baseAmount = (metadata as any)?.baseAmount || charge.amount
  const breakdown = metadata.breakdown || []
  const hasProration = baseAmount !== charge.amount

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">Charge Breakdown</h2>
            <Badge variant="outline" className={cn('gap-1', config.textColor, config.bgColor)}>
              <Icon className="h-3 w-3" />
              {config.label}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Detailed analysis of charge calculation and components
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Charge Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            Charge Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Staff Member</p>
                <p className="text-lg font-semibold">
                  {charge.staff?.firstName} {charge.staff?.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Employee ID: {charge.staff?.employeeId}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-base">{charge.description}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Period</p>
                <p className="text-base">
                  {startDate && endDate ? 
                    `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}` :
                    'Full Billing Period'
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  {periodDays} days
                </p>
              </div>
            </div>

            {/* Amount Information */}
            <div className="space-y-4">
              <div className="text-center p-6 bg-muted rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-2">Final Amount</p>
                <p className="text-3xl font-bold">${charge.amount.toLocaleString()}</p>
                {hasProration && (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Base Amount: ${baseAmount.toLocaleString()}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Percent className="h-4 w-4" />
                      <span>Prorated: {(prorationFactor * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                )}
              </div>

              {charge.source && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Source</p>
                  <p className="text-base capitalize">{charge.source.type.replace('_', ' ')}</p>
                  {charge.source.details && (
                    <p className="text-sm text-muted-foreground">
                      {JSON.stringify(charge.source.details)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculation Breakdown */}
      {breakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Calculation Breakdown
            </CardTitle>
            <CardDescription>
              Step-by-step calculation details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {breakdown.map((step: any, index: number) => (
                <div key={index} className="flex justify-between items-center py-3 border-b last:border-b-0">
                  <div className="space-y-1">
                    <p className="font-medium">{step.label}</p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-lg">
                      {typeof step.value === 'number' 
                        ? step.value < 10 
                          ? step.value.toFixed(3)
                          : step.value.toLocaleString()
                        : step.value
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Proration Details */}
      {hasProration && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Proration Details
            </CardTitle>
            <CardDescription>
              How the charge was adjusted for the partial period
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Base Amount</p>
                <p className="text-2xl font-bold">${baseAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Monthly rate</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Proration Factor</p>
                <p className="text-2xl font-bold">{(prorationFactor * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">{periodDays} / {monthDays} days</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">Final Amount</p>
                <p className="text-2xl font-bold">${charge.amount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Prorated charge</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Proration Progress</span>
                <span>{(prorationFactor * 100).toFixed(1)}%</span>
              </div>
              <Progress value={prorationFactor * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Charge covers {periodDays} out of {monthDays} standard days
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Details */}
      <Collapsible open={showDetails} onOpenChange={setShowDetails}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Additional Details
              </CardTitle>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showDetails ? 'Hide' : 'Show'} Details
                </Button>
              </CollapsibleTrigger>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Charge ID</p>
                  <p className="text-sm font-mono">{charge.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Billing Period</p>
                  <p className="text-sm">{charge.billingPeriodId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created Date</p>
                  <p className="text-sm">{format(new Date(charge.createdAt), 'PPP')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-sm">{format(new Date(charge.updatedAt), 'PPP')}</p>
                </div>
              </div>

              {charge.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="text-sm bg-muted p-3 rounded-md">{charge.notes}</p>
                </div>
              )}

              {/* Metadata */}
              {Object.keys(metadata).length > 0 && (
                <Collapsible open={showMetadata} onOpenChange={setShowMetadata}>
                  <div className="space-y-2">
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <FileText className="h-4 w-4" />
                        {showMetadata ? 'Hide' : 'Show'} Technical Metadata
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="bg-muted p-4 rounded-md">
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(metadata, null, 2)}
                        </pre>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Charge Type Information */}
      <Alert>
        <Icon className="h-4 w-4" />
        <AlertDescription>
          <strong>{config.label} Charges:</strong> {config.description}
          {charge.type === ChargeType.RENT && (
            <span> Rent charges are typically calculated monthly and prorated based on actual occupancy days.</span>
          )}
          {charge.type === ChargeType.UTILITIES && (
            <span> Utility charges are shared costs divided among occupants and prorated by occupancy period.</span>
          )}
          {charge.type === ChargeType.TRANSPORT && (
            <span> Transport charges are calculated per trip based on distance and passenger count.</span>
          )}
          {charge.type === ChargeType.OTHER && (
            <span> Other charges include miscellaneous fees, adjustments, and one-time costs.</span>
          )}
        </AlertDescription>
      </Alert>
    </div>
  )
}
