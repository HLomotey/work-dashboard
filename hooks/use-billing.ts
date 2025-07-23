'use client'

import { useState, useCallback } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type {
  BillingPeriod,
  Charge,
  PayrollExport,
  BillingPeriodWithCharges,
  ChargeWithDetails,
  PayrollExportWithDetails,
  CreateBillingPeriod,
  UpdateBillingPeriod,
  CreateCharge,
  UpdateCharge,
  CreatePayrollExport,
  UpdatePayrollExport,
  BillingFilters,
  BillingMetrics,
  StaffBillingSummary,
  PayrollExportData,
} from '@/lib/types/billing'
import { BillingStatus, ChargeType, PayrollExportStatus } from '@/lib/types/billing'

// Billing Periods Hook
export function useBillingPeriods(filters?: BillingFilters) {
  const supabase = createClient()
  
  const fetcher = useCallback(async () => {
    let query = supabase
      .from('billing_periods')
      .select('*')
      .order('start_date', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.dateRange) {
      query = query
        .gte('start_date', filters.dateRange.start.toISOString())
        .lte('end_date', filters.dateRange.end.toISOString())
    }

    const { data, error } = await query
    if (error) throw error
    return data as BillingPeriod[]
  }, [filters])

  const { data: periods, error, mutate, isLoading } = useSWR(
    ['billing_periods', filters],
    fetcher
  )

  const createPeriod = useCallback(async (periodData: CreateBillingPeriod) => {
    // Check for overlapping periods
    const { data: existingPeriods } = await supabase
      .from('billing_periods')
      .select('id')
      .or(`start_date.lte.${periodData.endDate.toISOString()},end_date.gte.${periodData.startDate.toISOString()}`)
      .neq('status', 'cancelled')

    if (existingPeriods && existingPeriods.length > 0) {
      throw new Error('Billing period overlaps with existing period')
    }

    const { data, error } = await supabase
      .from('billing_periods')
      .insert([periodData])
      .select()
      .single()

    if (error) throw error
    await mutate()
    return data as BillingPeriod
  }, [supabase, mutate])

  const updatePeriod = useCallback(async (id: string, updates: UpdateBillingPeriod) => {
    const { data, error } = await supabase
      .from('billing_periods')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    await mutate()
    return data as BillingPeriod
  }, [supabase, mutate])

  const processPeriod = useCallback(async (id: string) => {
    // Generate charges for the billing period
    const { data: period } = await supabase
      .from('billing_periods')
      .select('*')
      .eq('id', id)
      .single()

    if (!period) throw new Error('Billing period not found')
    if (period.status !== 'draft') throw new Error('Only draft periods can be processed')

    // Update status to processing
    await updatePeriod(id, { status: BillingStatus.PROCESSING })

    // Auto-generate charges would happen here
    // For now, just mark as completed
    await updatePeriod(id, { status: BillingStatus.COMPLETED })

    return period
  }, [updatePeriod])

  const cancelPeriod = useCallback(async (id: string) => {
    return updatePeriod(id, { status: BillingStatus.CANCELLED })
  }, [updatePeriod])

  return {
    periods,
    isLoading,
    error,
    createPeriod,
    updatePeriod,
    processPeriod,
    cancelPeriod,
    refresh: mutate
  }
}

// Charges Hook
export function useCharges(filters?: BillingFilters) {
  const supabase = createClient()
  
  const fetcher = useCallback(async () => {
    let query = supabase
      .from('charges')
      .select(`
        *,
        staff:staff(*),
        billing_period:billing_periods(*)
      `)
      .order('created_at', { ascending: false })

    if (filters?.billingPeriodId) {
      query = query.eq('billing_period_id', filters.billingPeriodId)
    }

    if (filters?.staffId) {
      query = query.eq('staff_id', filters.staffId)
    }

    if (filters?.chargeType) {
      query = query.eq('type', filters.chargeType)
    }

    if (filters?.amountRange) {
      query = query
        .gte('amount', filters.amountRange.min)
        .lte('amount', filters.amountRange.max)
    }

    if (filters?.search) {
      query = query.ilike('description', `%${filters.search}%`)
    }

    const { data, error } = await query
    if (error) throw error
    return data as ChargeWithDetails[]
  }, [filters])

  const { data: charges, error, mutate, isLoading } = useSWR(
    ['charges', filters],
    fetcher
  )

  const createCharge = useCallback(async (chargeData: CreateCharge) => {
    // Validate billing period is not exported
    const { data: period } = await supabase
      .from('billing_periods')
      .select('status')
      .eq('id', chargeData.billingPeriodId)
      .single()

    if (!period) throw new Error('Billing period not found')
    if (period.status === 'exported') throw new Error('Cannot add charges to exported period')

    const { data, error } = await supabase
      .from('charges')
      .insert([chargeData])
      .select()
      .single()

    if (error) throw error
    await mutate()
    return data as Charge
  }, [supabase, mutate])

  const updateCharge = useCallback(async (id: string, updates: UpdateCharge) => {
    const { data, error } = await supabase
      .from('charges')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    await mutate()
    return data as Charge
  }, [supabase, mutate])

  const deleteCharge = useCallback(async (id: string) => {
    // Check if charge is in exported period
    const { data: charge } = await supabase
      .from('charges')
      .select(`
        billing_period:billing_periods(status)
      `)
      .eq('id', id)
      .single()

    if (charge?.billing_period?.status === 'exported') {
      throw new Error('Cannot delete charges from exported period')
    }

    const { error } = await supabase
      .from('charges')
      .delete()
      .eq('id', id)

    if (error) throw error
    await mutate()
  }, [supabase, mutate])

  const calculateProration = useCallback((
    baseAmount: number,
    startDate: Date,
    endDate: Date,
    periodStart: Date,
    periodEnd: Date
  ): number => {
    const totalPeriodDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24))
    const actualDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    
    return Math.min(actualDays / totalPeriodDays, 1)
  }, [])

  const generateHousingCharges = useCallback(async (billingPeriodId: string) => {
    // Get billing period
    const { data: period } = await supabase
      .from('billing_periods')
      .select('*')
      .eq('id', billingPeriodId)
      .single()

    if (!period) throw new Error('Billing period not found')

    // Get active room assignments during the period
    const { data: assignments } = await supabase
      .from('room_assignments')
      .select(`
        *,
        room:rooms(*),
        staff:staff(*)
      `)
      .eq('status', 'active')
      .lte('start_date', period.end_date)
      .or(`end_date.is.null,end_date.gte.${period.start_date}`)

    if (!assignments) return []

    const charges = []
    for (const assignment of assignments) {
      const assignmentStart = new Date(Math.max(new Date(assignment.start_date).getTime(), new Date(period.start_date).getTime()))
      const assignmentEnd = assignment.end_date 
        ? new Date(Math.min(new Date(assignment.end_date).getTime(), new Date(period.end_date).getTime()))
        : new Date(period.end_date)

      const prorationFactor = calculateProration(
        1,
        assignmentStart,
        assignmentEnd,
        new Date(period.start_date),
        new Date(period.end_date)
      )

      // Base rent charge (this would come from configuration)
      const baseRent = 500 // This should come from room/property configuration
      const rentCharge: CreateCharge = {
        staffId: assignment.staff_id,
        billingPeriodId: period.id,
        type: ChargeType.RENT,
        amount: baseRent,
        description: `Room rent for ${assignment.room.room_number}`,
        prorationFactor,
        sourceId: assignment.id
      }

      charges.push(rentCharge)
    }

    // Create all charges
    const createdCharges = []
    for (const charge of charges) {
      const created = await createCharge(charge)
      createdCharges.push(created)
    }

    return createdCharges
  }, [supabase, createCharge, calculateProration])

  const generateTransportCharges = useCallback(async (billingPeriodId: string) => {
    // Get billing period
    const { data: period } = await supabase
      .from('billing_periods')
      .select('*')
      .eq('id', billingPeriodId)
      .single()

    if (!period) throw new Error('Billing period not found')

    // Get completed trips during the period
    const { data: trips } = await supabase
      .from('trips')
      .select(`
        *,
        passengers:trip_passengers(
          *,
          staff:staff(*)
        )
      `)
      .eq('status', 'completed')
      .gte('date', period.start_date)
      .lte('date', period.end_date)

    if (!trips) return []

    const charges = []
    for (const trip of trips) {
      if (trip.passengers && trip.passengers.length > 0 && trip.cost) {
        const costPerPassenger = trip.cost / trip.passengers.length

        for (const passenger of trip.passengers) {
          const transportCharge: CreateCharge = {
            staffId: passenger.staff_id,
            billingPeriodId: period.id,
            type: ChargeType.TRANSPORT,
            amount: costPerPassenger,
            description: `Transport for ${trip.route} on ${new Date(trip.date).toLocaleDateString()}`,
            sourceId: trip.id
          }

          charges.push(transportCharge)
        }
      }
    }

    // Create all charges
    const createdCharges = []
    for (const charge of charges) {
      const created = await createCharge(charge)
      createdCharges.push(created)
    }

    return createdCharges
  }, [supabase, createCharge])

  return {
    charges,
    isLoading,
    error,
    createCharge,
    updateCharge,
    deleteCharge,
    generateHousingCharges,
    generateTransportCharges,
    calculateProration,
    refresh: mutate
  }
}

// Payroll Export Hook
export function usePayrollExport(billingPeriodId?: string) {
  const supabase = createClient()
  
  const fetcher = useCallback(async () => {
    if (!billingPeriodId) return []

    const { data, error } = await supabase
      .from('payroll_exports')
      .select(`
        *,
        billing_period:billing_periods(*)
      `)
      .eq('billing_period_id', billingPeriodId)
      .order('export_date', { ascending: false })

    if (error) throw error
    return data as PayrollExportWithDetails[]
  }, [billingPeriodId])

  const { data: exports, error, mutate, isLoading } = useSWR(
    billingPeriodId ? ['payroll_exports', billingPeriodId] : null,
    fetcher
  )

  const generateExportData = useCallback(async (billingPeriodId: string): Promise<PayrollExportData[]> => {
    // Get all charges for the billing period
    const { data: charges } = await supabase
      .from('charges')
      .select(`
        *,
        staff:staff(*)
      `)
      .eq('billing_period_id', billingPeriodId)

    if (!charges) return []

    // Group charges by staff
    const staffCharges = new Map<string, any[]>()
    charges.forEach(charge => {
      if (!staffCharges.has(charge.staff_id)) {
        staffCharges.set(charge.staff_id, [])
      }
      staffCharges.get(charge.staff_id)!.push(charge)
    })

    // Generate export data
    const exportData: PayrollExportData[] = []
    for (const [staffId, staffChargeList] of staffCharges.entries()) {
      const staff = staffChargeList[0].staff
      const totalDeductions = staffChargeList.reduce((sum, c) => sum + (c.amount * (c.proration_factor || 1)), 0)
      const rentCharges = staffChargeList.filter(c => c.type === 'rent').reduce((sum, c) => sum + (c.amount * (c.proration_factor || 1)), 0)
      const utilityCharges = staffChargeList.filter(c => c.type === 'utilities').reduce((sum, c) => sum + (c.amount * (c.proration_factor || 1)), 0)
      const transportCharges = staffChargeList.filter(c => c.type === 'transport').reduce((sum, c) => sum + (c.amount * (c.proration_factor || 1)), 0)
      const otherCharges = staffChargeList.filter(c => c.type === 'other').reduce((sum, c) => sum + (c.amount * (c.proration_factor || 1)), 0)

      // Get billing period info
      const { data: period } = await supabase
        .from('billing_periods')
        .select('start_date, end_date')
        .eq('id', billingPeriodId)
        .single()

      exportData.push({
        employeeId: staff.employee_id,
        firstName: staff.first_name,
        lastName: staff.last_name,
        totalDeductions,
        rentCharges,
        utilityCharges,
        transportCharges,
        otherCharges,
        billingPeriod: period ? `${new Date(period.start_date).toLocaleDateString()} - ${new Date(period.end_date).toLocaleDateString()}` : ''
      })
    }

    return exportData.sort((a, b) => a.employeeId.localeCompare(b.employeeId))
  }, [supabase])

  const createExport = useCallback(async (exportData: CreatePayrollExport) => {
    const { data, error } = await supabase
      .from('payroll_exports')
      .insert([exportData])
      .select()
      .single()

    if (error) throw error

    // Update billing period status to exported
    await supabase
      .from('billing_periods')
      .update({ 
        status: BillingStatus.EXPORTED,
        payroll_export_date: new Date().toISOString()
      })
      .eq('id', exportData.billingPeriodId)

    await mutate()
    return data as PayrollExport
  }, [supabase, mutate])

  const exportToCSV = useCallback(async (billingPeriodId: string): Promise<string> => {
    const data = await generateExportData(billingPeriodId)
    
    const headers = [
      'Employee ID',
      'First Name',
      'Last Name',
      'Total Deductions',
      'Rent Charges',
      'Utility Charges',
      'Transport Charges',
      'Other Charges',
      'Billing Period'
    ]

    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        row.employeeId,
        row.firstName,
        row.lastName,
        row.totalDeductions.toFixed(2),
        row.rentCharges.toFixed(2),
        row.utilityCharges.toFixed(2),
        row.transportCharges.toFixed(2),
        row.otherCharges.toFixed(2),
        `"${row.billingPeriod}"`
      ].join(','))
    ].join('\n')

    // Create export record
    const fileName = `payroll_export_${new Date().toISOString().split('T')[0]}.csv`
    await createExport({
      billingPeriodId,
      exportDate: new Date(),
      fileName,
      recordCount: data.length,
      totalAmount: data.reduce((sum, row) => sum + row.totalDeductions, 0),
      status: PayrollExportStatus.COMPLETED
    })

    return csvContent
  }, [generateExportData, createExport])

  return {
    exports,
    isLoading,
    error,
    generateExportData,
    createExport,
    exportToCSV,
    refresh: mutate
  }
}

// Billing Analytics Hook
export function useBillingAnalytics(dateRange?: { start: Date; end: Date }) {
  const supabase = createClient()
  
  const fetcher = useCallback(async (): Promise<BillingMetrics> => {
    // Get billing periods
    let periodQuery = supabase
      .from('billing_periods')
      .select('id, status, start_date, end_date')

    if (dateRange) {
      periodQuery = periodQuery
        .gte('start_date', dateRange.start.toISOString())
        .lte('end_date', dateRange.end.toISOString())
    }

    const { data: periods } = await periodQuery

    // Get charges
    let chargeQuery = supabase
      .from('charges')
      .select('id, type, amount, proration_factor, created_at')

    if (dateRange) {
      chargeQuery = chargeQuery
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString())
    }

    const { data: charges } = await chargeQuery

    const totalBillingPeriods = periods?.length || 0
    const activeBillingPeriods = periods?.filter(p => p.status === 'draft' || p.status === 'processing').length || 0
    const totalCharges = charges?.length || 0
    const totalAmount = charges?.reduce((sum, c) => sum + (c.amount * (c.proration_factor || 1)), 0) || 0
    const averageChargeAmount = totalCharges > 0 ? totalAmount / totalCharges : 0

    // Calculate charges by type
    const chargesByType: Record<ChargeType, { count: number; amount: number; percentage: number }> = {
      [ChargeType.RENT]: { count: 0, amount: 0, percentage: 0 },
      [ChargeType.UTILITIES]: { count: 0, amount: 0, percentage: 0 },
      [ChargeType.TRANSPORT]: { count: 0, amount: 0, percentage: 0 },
      [ChargeType.OTHER]: { count: 0, amount: 0, percentage: 0 }
    }

    charges?.forEach(charge => {
      const adjustedAmount = charge.amount * (charge.proration_factor || 1)
      chargesByType[charge.type as ChargeType].count++
      chargesByType[charge.type as ChargeType].amount += adjustedAmount
    })

    // Calculate percentages
    Object.values(chargesByType).forEach(typeData => {
      typeData.percentage = totalAmount > 0 ? (typeData.amount / totalAmount) * 100 : 0
    })

    // Generate monthly trends (simplified)
    const monthlyTrends = periods?.reduce((trends, period) => {
      const month = new Date(period.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      const existingTrend = trends.find(t => t.month === month)
      
      if (existingTrend) {
        existingTrend.chargeCount++
      } else {
        trends.push({
          month,
          totalAmount: 0, // Would need to calculate from charges
          chargeCount: 1
        })
      }
      
      return trends
    }, [] as { month: string; totalAmount: number; chargeCount: number }[]) || []

    return {
      totalBillingPeriods,
      activeBillingPeriods,
      totalCharges,
      totalAmount,
      averageChargeAmount,
      chargesByType,
      monthlyTrends
    }
  }, [dateRange])

  const { data: analytics, error, mutate, isLoading } = useSWR(
    ['billing_analytics', dateRange],
    fetcher
  )

  return {
    analytics,
    isLoading,
    error,
    refresh: mutate
  }
}

// Staff Billing Summary Hook
export function useStaffBillingSummary(staffId?: string, dateRange?: { start: Date; end: Date }) {
  const supabase = createClient()
  
  const fetcher = useCallback(async (): Promise<StaffBillingSummary[]> => {
    let query = supabase
      .from('charges')
      .select(`
        *,
        staff:staff(*),
        billing_period:billing_periods(*)
      `)

    if (staffId) {
      query = query.eq('staff_id', staffId)
    }

    if (dateRange) {
      query = query
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString())
    }

    const { data: charges } = await query
    if (!charges) return []

    // Group by staff
    const staffMap = new Map<string, any[]>()
    charges.forEach(charge => {
      if (!staffMap.has(charge.staff_id)) {
        staffMap.set(charge.staff_id, [])
      }
      staffMap.get(charge.staff_id)!.push(charge)
    })

    // Generate summaries
    const summaries: StaffBillingSummary[] = []
    for (const [staffId, staffCharges] of staffMap.entries()) {
      const staff = staffCharges[0].staff
      const totalCharges = staffCharges.length
      const totalAmount = staffCharges.reduce((sum, c) => sum + (c.amount * (c.proration_factor || 1)), 0)
      
      const chargesByType: Record<ChargeType, number> = {
        [ChargeType.RENT]: 0,
        [ChargeType.UTILITIES]: 0,
        [ChargeType.TRANSPORT]: 0,
        [ChargeType.OTHER]: 0
      }

      staffCharges.forEach(charge => {
        chargesByType[charge.type as ChargeType] += charge.amount * (charge.proration_factor || 1)
      })

      const lastBillingDate = new Date(Math.max(...staffCharges.map(c => new Date(c.created_at).getTime())))
      
      // Calculate average monthly amount (simplified)
      const months = dateRange 
        ? Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24 * 30))
        : 1
      const averageMonthlyAmount = months > 0 ? totalAmount / months : totalAmount

      summaries.push({
        staffId,
        staff: {
          firstName: staff.first_name,
          lastName: staff.last_name,
          employeeId: staff.employee_id
        },
        totalCharges,
        totalAmount,
        chargesByType,
        lastBillingDate,
        averageMonthlyAmount
      })
    }

    return summaries.sort((a, b) => b.totalAmount - a.totalAmount)
  }, [staffId, dateRange])

  const { data: summaries, error, mutate, isLoading } = useSWR(
    ['staff_billing_summary', staffId, dateRange],
    fetcher
  )

  return {
    summaries,
    isLoading,
    error,
    refresh: mutate
  }
}

// Staff Charges Hook (for staff self-service)
export function useStaffCharges(staffId?: string, filters?: BillingFilters) {
  const supabase = createClient()
  
  const fetcher = useCallback(async () => {
    if (!staffId) return []
    
    let query = supabase
      .from('charges')
      .select(`
        *,
        billing_period:billing_periods (*)
      `)
      .eq('staff_id', staffId)
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }

    if (filters?.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.start.toISOString())
        .lte('created_at', filters.dateRange.end.toISOString())
    }

    const { data, error } = await query
    if (error) throw error
    return data as ChargeWithDetails[]
  }, [staffId, filters])

  const {
    data: charges,
    error,
    mutate,
    isLoading
  } = useSWR(
    staffId ? ['staff_charges', staffId, filters] : null,
    fetcher
  )

  return {
    charges,
    isLoading,
    error,
    refresh: mutate
  }
}

// Charge History Hook (for staff self-service)
export function useChargeHistory(staffId?: string, dateRange?: { start: Date; end: Date }) {
  const supabase = createClient()
  
  const fetcher = useCallback(async () => {
    if (!staffId) return []
    
    let query = supabase
      .from('charges')
      .select(`
        *,
        billing_period:billing_periods (*)
      `)
      .eq('staff_id', staffId)
      .order('created_at', { ascending: false })

    if (dateRange) {
      query = query
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString())
    }

    const { data, error } = await query
    if (error) throw error
    return data as ChargeWithDetails[]
  }, [staffId, dateRange])

  const {
    data: history,
    error,
    mutate,
    isLoading
  } = useSWR(
    staffId ? ['charge_history', staffId, dateRange] : null,
    fetcher
  )

  return {
    history,
    isLoading,
    error,
    refresh: mutate
  }
}

// Payment History Hook (for staff self-service)
export function usePaymentHistory(staffId?: string, dateRange?: { start: Date; end: Date }) {
  const supabase = createClient()
  
  const fetcher = useCallback(async () => {
    if (!staffId) return []
    
    // Mock data for now - replace with actual API call
    return [
      {
        id: '1',
        staffId,
        amount: 850.00,
        method: 'payroll_deduction',
        status: 'completed',
        processedAt: new Date('2024-01-15'),
        description: 'Housing rent - January 2024',
        reference: 'PAY-2024-001',
        charges: [
          {
            id: 'charge-1',
            type: 'rent',
            amount: 800.00,
            description: 'Monthly rent'
          },
          {
            id: 'charge-2',
            type: 'utilities',
            amount: 50.00,
            description: 'Utilities'
          }
        ]
      }
    ]
  }, [staffId, dateRange])

  const {
    data: payments,
    error,
    mutate,
    isLoading
  } = useSWR(
    staffId ? ['payment_history', staffId, dateRange] : null,
    fetcher
  )

  return {
    payments,
    isLoading,
    error,
    refresh: mutate
  }
}