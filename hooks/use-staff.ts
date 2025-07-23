'use client'

import { useState, useCallback } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type {
  Staff,
  StaffWithProfile,
  UserProfile,
} from '@/lib/types/user'

// Staff Profile Hook
export function useStaffProfile(staffId?: string) {
  const supabase = createClient()
  
  const fetcher = useCallback(async () => {
    if (!staffId) return null
    
    const { data, error } = await supabase
      .from('staff')
      .select(`
        *,
        user_profiles (*)
      `)
      .eq('id', staffId)
      .single()
    
    if (error) throw error
    return data as StaffWithProfile
  }, [staffId])

  const {
    data: profile,
    error,
    mutate,
    isLoading
  } = useSWR(
    staffId ? ['staff_profile', staffId] : null,
    fetcher
  )

  const updateProfile = useCallback(async (updates: Partial<Staff>) => {
    if (!staffId) throw new Error('Staff ID is required')
    
    const { data, error } = await supabase
      .from('staff')
      .update(updates)
      .eq('id', staffId)
      .select()
      .single()
    
    if (error) throw error
    
    mutate()
    return data
  }, [staffId, mutate])

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    refresh: mutate
  }
}

// Profile Settings Hook
export function useProfileSettings(staffId?: string) {
  const supabase = createClient()
  
  const fetcher = useCallback(async () => {
    if (!staffId) return null
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', staffId)
      .single()
    
    if (error) throw error
    return data as UserProfile
  }, [staffId])

  const {
    data: settings,
    error,
    mutate,
    isLoading
  } = useSWR(
    staffId ? ['profile_settings', staffId] : null,
    fetcher
  )

  const updateSettings = useCallback(async (updates: Partial<UserProfile>) => {
    if (!staffId) throw new Error('Staff ID is required')
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', staffId)
      .select()
      .single()
    
    if (error) throw error
    
    mutate()
    return data
  }, [staffId, mutate])

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    refresh: mutate
  }
}

// Notification Settings Hook
export function useNotificationSettings(staffId?: string) {
  const supabase = createClient()
  
  const fetcher = useCallback(async () => {
    if (!staffId) return null
    
    // Mock data for now - replace with actual API call
    return {
      housing: {
        email: true,
        push: true,
        sms: false,
        inApp: true
      },
      billing: {
        email: true,
        push: false,
        sms: false,
        inApp: true
      },
      transport: {
        email: false,
        push: true,
        sms: false,
        inApp: true
      },
      system: {
        email: true,
        push: true,
        sms: false,
        inApp: true
      },
      social: {
        email: false,
        push: false,
        sms: false,
        inApp: true
      },
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00'
      },
      digest: {
        frequency: 'daily',
        time: '09:00'
      }
    }
  }, [staffId])

  const {
    data: notifications,
    error,
    mutate,
    isLoading
  } = useSWR(
    staffId ? ['notification_settings', staffId] : null,
    fetcher
  )

  const updateNotifications = useCallback(async (updates: any) => {
    if (!staffId) throw new Error('Staff ID is required')
    
    // Mock update - replace with actual API call
    mutate({ ...notifications, ...updates }, false)
    
    return { ...notifications, ...updates }
  }, [staffId, notifications, mutate])

  return {
    notifications,
    isLoading,
    error,
    updateNotifications,
    refresh: mutate
  }
}

// Contact Update Requests Hook
export function useContactUpdates(staffId?: string) {
  const supabase = createClient()
  
  const fetcher = useCallback(async () => {
    if (!staffId) return []
    
    // Mock data for now - replace with actual API call
    return [
      {
        id: '1',
        staffId,
        type: 'email',
        currentValue: 'john.doe@company.com',
        requestedValue: 'john.doe.new@company.com',
        reason: 'Changed personal email address',
        status: 'pending',
        submittedAt: new Date('2024-01-15'),
        reviewedAt: null,
        reviewedBy: null,
        notes: null
      }
    ]
  }, [staffId])

  const {
    data: requests,
    error,
    mutate,
    isLoading
  } = useSWR(
    staffId ? ['contact_updates', staffId] : null,
    fetcher
  )

  const submitRequest = useCallback(async (request: any) => {
    if (!staffId) throw new Error('Staff ID is required')
    
    // Mock submission - replace with actual API call
    const newRequest = {
      id: Date.now().toString(),
      staffId,
      ...request,
      status: 'pending',
      submittedAt: new Date(),
      reviewedAt: null,
      reviewedBy: null,
      notes: null
    }
    
    mutate([...(requests || []), newRequest], false)
    
    return newRequest
  }, [staffId, requests, mutate])

  return {
    requests,
    updates: requests, // Alias for compatibility
    currentContact: {
      email: 'john.doe@company.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, City, State 12345',
      emergencyContact: {
        name: 'Jane Doe',
        phone: '+1 (555) 987-6543',
        relationship: 'Spouse'
      }
    },
    isLoading,
    error,
    submitRequest,
    submitUpdate: submitRequest, // Alias for compatibility
    refresh: mutate
  }
}
