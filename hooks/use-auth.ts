'use client'

import { useState, useCallback } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type {
  Staff,
  UserProfile,
  AuditLog,
  StaffWithProfile,
  UserProfileWithStaff,
  AuditLogWithDetails,
  CreateStaff,
  UpdateStaff,
  CreateUserProfile,
  UpdateUserProfile,
  CreateAuditLog,
  UserFilters,
  UserMetrics,
  PermissionCheck,
  UserRole,
  EmploymentStatus,
  AuditAction
} from '@/lib/types/user'
import { hasPermission, getUserPermissions, getFullName } from '@/lib/types/user'
import { useAuth as useSupabaseAuth } from '@/components/providers/auth-provider'

// Enhanced Auth Hook with ERP features
export function useAuth() {
  const { user, loading, signOut } = useSupabaseAuth()
  const supabase = createClient()

  const fetcher = useCallback(async () => {
    if (!user) return null

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        staff:staff(*)
      `)
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return profile as UserProfileWithStaff | null
  }, [user, supabase])

  const { data: userProfile, error, mutate } = useSWR(
    user ? ['user_profile', user.id] : null,
    fetcher
  )

  const checkPermission = useCallback((permission: string): boolean => {
    if (!userProfile) return false
    return hasPermission(userProfile.role, permission)
  }, [userProfile])

  const getUserRole = useCallback((): UserRole | null => {
    return userProfile?.role || null
  }, [userProfile])

  const getPermissions = useCallback((): string[] => {
    if (!userProfile) return []
    return getUserPermissions(userProfile.role)
  }, [userProfile])

  const logAudit = useCallback(async (auditData: Omit<CreateAuditLog, 'userId'>) => {
    if (!user) return

    const { error } = await supabase
      .from('audit_logs')
      .insert([{
        ...auditData,
        userId: user.id
      }])

    if (error) console.error('Audit log error:', error)
  }, [user, supabase])

  const updateProfile = useCallback(async (updates: UpdateUserProfile) => {
    if (!userProfile) throw new Error('No user profile found')

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userProfile.id)
      .select()
      .single()

    if (error) throw error

    await logAudit({
      action: AuditAction.UPDATE,
      tableName: 'user_profiles',
      recordId: userProfile.id,
      newValues: updates
    })

    await mutate()
    return data as UserProfile
  }, [userProfile, supabase, mutate, logAudit])

  return {
    user,
    userProfile,
    loading: loading || !user || (user && userProfile === undefined),
    error,
    signOut,
    checkPermission,
    getUserRole,
    getPermissions,
    updateProfile,
    logAudit,
    refresh: mutate
  }
}

// Staff Management Hook
export function useStaff(filters?: UserFilters) {
  const supabase = createClient()
  const { logAudit } = useAuth()
  
  const fetcher = useCallback(async () => {
    let query = supabase
      .from('staff')
      .select(`
        *,
        user_profile:user_profiles(*),
        housing_assignments:room_assignments(
          id,
          room_id,
          start_date,
          end_date,
          status
        )
      `)
      .order('last_name')

    if (filters?.role) {
      query = query.eq('role', filters.role)
    }

    if (filters?.employmentStatus) {
      query = query.eq('employment_status', filters.employmentStatus)
    }

    if (filters?.housingEligible !== undefined) {
      query = query.eq('housing_eligible', filters.housingEligible)
    }

    if (filters?.departmentId) {
      query = query.eq('department_id', filters.departmentId)
    }

    if (filters?.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,employee_id.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }

    if (filters?.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.start.toISOString())
        .lte('created_at', filters.dateRange.end.toISOString())
    }

    const { data, error } = await query
    if (error) throw error

    // Calculate additional metrics for each staff member
    const staffWithMetrics = await Promise.all(
      (data || []).map(async (staff) => {
        // Get total charges for this staff member
        const { data: charges } = await supabase
          .from('charges')
          .select('amount, proration_factor')
          .eq('staff_id', staff.id)

        const totalCharges = charges?.reduce((sum, c) => sum + (c.amount * (c.proration_factor || 1)), 0) || 0

        // Get last login date (would come from auth logs)
        const lastLoginDate = new Date() // Placeholder

        return {
          ...staff,
          totalCharges,
          lastLoginDate
        } as StaffWithProfile
      })
    )

    return staffWithMetrics
  }, [filters])

  const { data: staff, error, mutate, isLoading } = useSWR(
    ['staff', filters],
    fetcher
  )

  const createStaff = useCallback(async (staffData: CreateStaff) => {
    const { data, error } = await supabase
      .from('staff')
      .insert([staffData])
      .select()
      .single()

    if (error) throw error

    await logAudit({
      action: AuditAction.CREATE,
      tableName: 'staff',
      recordId: data.id,
      newValues: staffData
    })

    await mutate()
    return data as Staff
  }, [supabase, mutate, logAudit])

  const updateStaff = useCallback(async (id: string, updates: UpdateStaff) => {
    // Get current data for audit
    const { data: currentStaff } = await supabase
      .from('staff')
      .select('*')
      .eq('id', id)
      .single()

    const { data, error } = await supabase
      .from('staff')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    await logAudit({
      action: AuditAction.UPDATE,
      tableName: 'staff',
      recordId: id,
      oldValues: currentStaff,
      newValues: updates
    })

    await mutate()
    return data as Staff
  }, [supabase, mutate, logAudit])

  const deleteStaff = useCallback(async (id: string) => {
    // Check for dependencies
    const { data: assignments } = await supabase
      .from('room_assignments')
      .select('id')
      .eq('staff_id', id)
      .eq('status', 'active')

    if (assignments && assignments.length > 0) {
      throw new Error('Cannot delete staff with active room assignments')
    }

    const { data: charges } = await supabase
      .from('charges')
      .select('id')
      .eq('staff_id', id)

    if (charges && charges.length > 0) {
      throw new Error('Cannot delete staff with billing charges')
    }

    // Get current data for audit
    const { data: currentStaff } = await supabase
      .from('staff')
      .select('*')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id)

    if (error) throw error

    await logAudit({
      action: AuditAction.DELETE,
      tableName: 'staff',
      recordId: id,
      oldValues: currentStaff
    })

    await mutate()
  }, [supabase, mutate, logAudit])

  const setEmploymentStatus = useCallback(async (id: string, status: EmploymentStatus) => {
    return updateStaff(id, { employmentStatus: status })
  }, [updateStaff])

  const setHousingEligibility = useCallback(async (id: string, eligible: boolean) => {
    return updateStaff(id, { housingEligible: eligible })
  }, [updateStaff])

  return {
    staff,
    isLoading,
    error,
    createStaff,
    updateStaff,
    deleteStaff,
    setEmploymentStatus,
    setHousingEligibility,
    refresh: mutate
  }
}

// User Profiles Hook
export function useUserProfiles(filters?: UserFilters) {
  const supabase = createClient()
  const { logAudit } = useAuth()
  
  const fetcher = useCallback(async () => {
    let query = supabase
      .from('user_profiles')
      .select(`
        *,
        staff:staff(*)
      `)
      .order('created_at', { ascending: false })

    if (filters?.role) {
      query = query.eq('role', filters.role)
    }

    const { data, error } = await query
    if (error) throw error

    // Add additional metrics
    const profilesWithMetrics = (data || []).map(profile => ({
      ...profile,
      lastLoginDate: new Date(), // Placeholder
      loginCount: 0 // Placeholder
    })) as UserProfileWithStaff[]

    return profilesWithMetrics
  }, [filters])

  const { data: profiles, error, mutate, isLoading } = useSWR(
    ['user_profiles', filters],
    fetcher
  )

  const createUserProfile = useCallback(async (profileData: CreateUserProfile) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profileData])
      .select()
      .single()

    if (error) throw error

    await logAudit({
      action: AuditAction.CREATE,
      tableName: 'user_profiles',
      recordId: data.id,
      newValues: profileData
    })

    await mutate()
    return data as UserProfile
  }, [supabase, mutate, logAudit])

  const updateUserProfile = useCallback(async (id: string, updates: UpdateUserProfile) => {
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single()

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    await logAudit({
      action: AuditAction.UPDATE,
      tableName: 'user_profiles',
      recordId: id,
      oldValues: currentProfile,
      newValues: updates
    })

    await mutate()
    return data as UserProfile
  }, [supabase, mutate, logAudit])

  const deleteUserProfile = useCallback(async (id: string) => {
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', id)

    if (error) throw error

    await logAudit({
      action: AuditAction.DELETE,
      tableName: 'user_profiles',
      recordId: id,
      oldValues: currentProfile
    })

    await mutate()
  }, [supabase, mutate, logAudit])

  const updatePermissions = useCallback(async (id: string, permissions: string[]) => {
    return updateUserProfile(id, { permissions })
  }, [updateUserProfile])

  const updateRole = useCallback(async (id: string, role: UserRole) => {
    // Update role and reset permissions to role defaults
    const defaultPermissions = getUserPermissions(role)
    return updateUserProfile(id, { role, permissions: defaultPermissions })
  }, [updateUserProfile])

  return {
    profiles,
    isLoading,
    error,
    createUserProfile,
    updateUserProfile,
    deleteUserProfile,
    updatePermissions,
    updateRole,
    refresh: mutate
  }
}

// Audit Logs Hook
export function useAuditLogs(filters?: { 
  userId?: string
  action?: AuditAction
  tableName?: string
  dateRange?: { start: Date; end: Date }
}) {
  const supabase = createClient()
  
  const fetcher = useCallback(async () => {
    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        user:user_profiles(
          *,
          staff:staff(*)
        )
      `)
      .order('timestamp', { ascending: false })
      .limit(1000) // Limit for performance

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId)
    }

    if (filters?.action) {
      query = query.eq('action', filters.action)
    }

    if (filters?.tableName) {
      query = query.eq('table_name', filters.tableName)
    }

    if (filters?.dateRange) {
      query = query
        .gte('timestamp', filters.dateRange.start.toISOString())
        .lte('timestamp', filters.dateRange.end.toISOString())
    }

    const { data, error } = await query
    if (error) throw error

    // Process audit logs to show changes
    const logsWithChanges = (data || []).map(log => {
      const changes: { field: string; oldValue: any; newValue: any }[] = []
      
      if (log.old_values && log.new_values) {
        Object.keys(log.new_values).forEach(key => {
          if (log.old_values[key] !== log.new_values[key]) {
            changes.push({
              field: key,
              oldValue: log.old_values[key],
              newValue: log.new_values[key]
            })
          }
        })
      }

      return {
        ...log,
        changes
      } as AuditLogWithDetails
    })

    return logsWithChanges
  }, [filters])

  const { data: auditLogs, error, mutate, isLoading } = useSWR(
    ['audit_logs', filters],
    fetcher
  )

  return {
    auditLogs,
    isLoading,
    error,
    refresh: mutate
  }
}

// User Metrics Hook
export function useUserMetrics(dateRange?: { start: Date; end: Date }) {
  const supabase = createClient()
  
  const fetcher = useCallback(async (): Promise<UserMetrics> => {
    // Get staff metrics
    const { data: staff } = await supabase
      .from('staff')
      .select('id, employment_status, housing_eligible, role, department_id, created_at')

    const totalStaff = staff?.length || 0
    const activeStaff = staff?.filter(s => s.employment_status === 'active').length || 0
    const housingEligibleStaff = staff?.filter(s => s.housing_eligible).length || 0

    // Staff by role
    const staffByRole: Record<UserRole, number> = {
      [UserRole.ADMIN]: 0,
      [UserRole.HR_MANAGER]: 0,
      [UserRole.PROPERTY_MANAGER]: 0,
      [UserRole.TRANSPORT_MANAGER]: 0,
      [UserRole.FINANCE_MANAGER]: 0,
      [UserRole.STAFF]: 0
    }

    staff?.forEach(s => {
      staffByRole[s.role as UserRole]++
    })

    // Staff by department (simplified)
    const staffByDepartment: Record<string, number> = {}
    staff?.forEach(s => {
      if (s.department_id) {
        staffByDepartment[s.department_id] = (staffByDepartment[s.department_id] || 0) + 1
      }
    })

    // Recent logins (placeholder)
    const recentLogins = 0

    // New staff this month
    const thisMonth = new Date()
    thisMonth.setDate(1)
    const newStaffThisMonth = staff?.filter(s => new Date(s.created_at) >= thisMonth).length || 0

    return {
      totalStaff,
      activeStaff,
      housingEligibleStaff,
      staffByRole,
      staffByDepartment,
      recentLogins,
      newStaffThisMonth
    }
  }, [dateRange])

  const { data: metrics, error, mutate, isLoading } = useSWR(
    ['user_metrics', dateRange],
    fetcher
  )

  return {
    metrics,
    isLoading,
    error,
    refresh: mutate
  }
}

// Permission Check Hook
export function usePermissionCheck() {
  const { userProfile } = useAuth()

  const checkPermissions = useCallback((permissions: string[]): PermissionCheck[] => {
    if (!userProfile) {
      return permissions.map(permission => ({
        userId: '',
        permission,
        granted: false,
        reason: 'No user profile found'
      }))
    }

    return permissions.map(permission => ({
      userId: userProfile.userId,
      permission,
      granted: hasPermission(userProfile.role, permission),
      reason: hasPermission(userProfile.role, permission) ? undefined : 'Insufficient permissions'
    }))
  }, [userProfile])

  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    return checkPermissions(permissions).every(check => check.granted)
  }, [checkPermissions])

  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    return checkPermissions(permissions).some(check => check.granted)
  }, [checkPermissions])

  return {
    checkPermissions,
    hasAllPermissions,
    hasAnyPermission
  }
}