'use client'

import { useState, useCallback } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import {
  TripStatus,
  VehicleStatus
} from '@/lib/types/transport'
import type {
  Vehicle,
  Trip,
  TripPassenger,
  VehicleWithTrips,
  TripWithDetails,
  TripPassengerWithDetails,
  CreateVehicle,
  UpdateVehicle,
  CreateTrip,
  UpdateTrip,
  CreateTripPassenger,
  UpdateTripPassenger,
  TransportFilters,
  FleetMetrics,
  VehicleUtilization,
  RouteAnalytics
} from '@/lib/types/transport'

// Vehicles Hook
export function useVehicles(filters?: TransportFilters) {
  const supabase = createClient()
  
  const fetcher = useCallback(async () => {
    let query = supabase
      .from('vehicles')
      .select('*')
      .order('make', { ascending: true })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters?.search) {
      query = query.or(`make.ilike.%${filters.search}%,model.ilike.%${filters.search}%,registration.ilike.%${filters.search}%`)
    }

    const { data, error } = await query
    if (error) throw error
    return data as Vehicle[]
  }, [filters])

  const { data: vehicles, error, mutate, isLoading } = useSWR(
    ['vehicles', filters],
    fetcher
  )

  const createVehicle = useCallback(async (vehicleData: CreateVehicle) => {
    const { data, error } = await supabase
      .from('vehicles')
      .insert([vehicleData])
      .select()
      .single()

    if (error) throw error
    await mutate()
    return data as Vehicle
  }, [supabase, mutate])

  const updateVehicle = useCallback(async (id: string, updates: UpdateVehicle) => {
    const { data, error } = await supabase
      .from('vehicles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    await mutate()
    return data as Vehicle
  }, [supabase, mutate])

  const deleteVehicle = useCallback(async (id: string) => {
    // Check if vehicle has active trips
    const { data: activeTrips } = await supabase
      .from('trips')
      .select('id')
      .eq('vehicle_id', id)
      .in('status', ['scheduled', 'in_progress'])

    if (activeTrips && activeTrips.length > 0) {
      throw new Error('Cannot delete vehicle with active trips')
    }

    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id)

    if (error) throw error
    await mutate()
  }, [supabase, mutate])

  const setVehicleStatus = useCallback(async (id: string, status: VehicleStatus) => {
    return updateVehicle(id, { status })
  }, [updateVehicle])

  return {
    vehicles,
    isLoading,
    error,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    setVehicleStatus,
    refresh: mutate
  }
}

// Trips Hook
export function useTrips(filters?: TransportFilters) {
  const supabase = createClient()
  
  const fetcher = useCallback(async () => {
    let query = supabase
      .from('trips')
      .select(`
        *,
        vehicle:vehicles(*),
        driver:staff(*),
        passengers:trip_passengers(
          *,
          staff:staff(*)
        )
      `)
      .order('date', { ascending: false })

    if (filters?.vehicleId) {
      query = query.eq('vehicle_id', filters.vehicleId)
    }

    if (filters?.driverId) {
      query = query.eq('driver_id', filters.driverId)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.route) {
      query = query.ilike('route', `%${filters.route}%`)
    }

    if (filters?.dateRange) {
      query = query
        .gte('date', filters.dateRange.start.toISOString())
        .lte('date', filters.dateRange.end.toISOString())
    }

    const { data, error } = await query
    if (error) throw error

    // Calculate load factor and cost per passenger for each trip
    const tripsWithMetrics = (data || []).map(trip => ({
      ...trip,
      loadFactor: trip.vehicle ? (trip.passenger_count / trip.vehicle.capacity) * 100 : 0,
      costPerPassenger: trip.cost && trip.passenger_count > 0 ? trip.cost / trip.passenger_count : 0
    })) as TripWithDetails[]

    return tripsWithMetrics
  }, [filters])

  const { data: trips, error, mutate, isLoading } = useSWR(
    ['trips', filters],
    fetcher
  )

  const createTrip = useCallback(async (tripData: CreateTrip) => {
    // Validate vehicle availability
    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('status, capacity')
      .eq('id', tripData.vehicleId)
      .single()

    if (!vehicle) throw new Error('Vehicle not found')
    if (vehicle.status !== 'active') throw new Error('Vehicle is not available')
    if (tripData.passengerCount > vehicle.capacity) {
      throw new Error(`Passenger count exceeds vehicle capacity (${vehicle.capacity})`)
    }

    const { data, error } = await supabase
      .from('trips')
      .insert([tripData])
      .select()
      .single()

    if (error) throw error
    await mutate()
    return data as Trip
  }, [supabase, mutate])

  const updateTrip = useCallback(async (id: string, updates: UpdateTrip) => {
    const { data, error } = await supabase
      .from('trips')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    await mutate()
    return data as Trip
  }, [supabase, mutate])

  const deleteTrip = useCallback(async (id: string) => {
    // Check if trip is in progress
    const { data: trip } = await supabase
      .from('trips')
      .select('status')
      .eq('id', id)
      .single()

    if (trip?.status === 'in_progress') {
      throw new Error('Cannot delete trip in progress')
    }

    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', id)

    if (error) throw error
    await mutate()
  }, [supabase, mutate])

  const startTrip = useCallback(async (id: string) => {
    return updateTrip(id, { status: TripStatus.IN_PROGRESS })
  }, [updateTrip])

  const completeTrip = useCallback(async (id: string, actualDistance?: number, actualCost?: number) => {
    const updates: UpdateTrip = {
      status: TripStatus.COMPLETED
    }

    if (actualDistance !== undefined) updates.distance = actualDistance
    if (actualCost !== undefined) updates.cost = actualCost

    return updateTrip(id, updates)
  }, [updateTrip])

  const cancelTrip = useCallback(async (id: string) => {
    return updateTrip(id, { status: TripStatus.CANCELLED })
  }, [updateTrip])

  return {
    trips,
    isLoading,
    error,
    createTrip,
    updateTrip,
    deleteTrip,
    startTrip,
    completeTrip,
    cancelTrip,
    refresh: mutate
  }
}

// Trip Passengers Hook
export function useTripPassengers(tripId?: string) {
  const supabase = createClient()
  
  const fetcher = useCallback(async () => {
    if (!tripId) return []

    const { data, error } = await supabase
      .from('trip_passengers')
      .select(`
        *,
        staff:staff(*)
      `)
      .eq('trip_id', tripId)
      .order('created_at')

    if (error) throw error
    return data as TripPassengerWithDetails[]
  }, [tripId])

  const { data: passengers, error, mutate, isLoading } = useSWR(
    tripId ? ['trip_passengers', tripId] : null,
    fetcher
  )

  const addPassenger = useCallback(async (passengerData: CreateTripPassenger) => {
    // Check trip capacity
    const { data: trip } = await supabase
      .from('trips')
      .select(`
        passenger_count,
        vehicle:vehicles(capacity)
      `)
      .eq('id', passengerData.tripId)
      .single()

    if (!trip) throw new Error('Trip not found')
    
    const currentPassengers = passengers?.length || 0
    if (currentPassengers >= (trip.vehicle as any)?.capacity) {
      throw new Error('Trip is at full capacity')
    }

    const { data, error } = await supabase
      .from('trip_passengers')
      .insert([passengerData])
      .select()
      .single()

    if (error) throw error

    // Update trip passenger count
    await supabase
      .from('trips')
      .update({ passenger_count: currentPassengers + 1 })
      .eq('id', passengerData.tripId)

    await mutate()
    return data as TripPassenger
  }, [supabase, mutate, passengers])

  const removePassenger = useCallback(async (id: string) => {
    const passenger = passengers?.find(p => p.id === id)
    if (!passenger) throw new Error('Passenger not found')

    const { error } = await supabase
      .from('trip_passengers')
      .delete()
      .eq('id', id)

    if (error) throw error

    // Update trip passenger count
    const currentCount = passengers?.length || 0
    await supabase
      .from('trips')
      .update({ passenger_count: Math.max(0, currentCount - 1) })
      .eq('id', passenger.tripId)

    await mutate()
  }, [supabase, mutate, passengers])

  const updatePassenger = useCallback(async (id: string, updates: UpdateTripPassenger) => {
    const { data, error } = await supabase
      .from('trip_passengers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    await mutate()
    return data as TripPassenger
  }, [supabase, mutate])

  return {
    passengers,
    isLoading,
    error,
    addPassenger,
    removePassenger,
    updatePassenger,
    refresh: mutate
  }
}

// Transport Analytics Hook
export function useTransportAnalytics(dateRange?: { start: Date; end: Date }) {
  const supabase = createClient()
  
  const fetcher = useCallback(async (): Promise<FleetMetrics> => {
    // Get vehicle metrics
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('id, capacity, status')

    // Get trip metrics
    let tripQuery = supabase
      .from('trips')
      .select('id, passenger_count, distance, cost, status')

    if (dateRange) {
      tripQuery = tripQuery
        .gte('date', dateRange.start.toISOString())
        .lte('date', dateRange.end.toISOString())
    }

    const { data: trips } = await tripQuery

    const totalVehicles = vehicles?.length || 0
    const activeVehicles = vehicles?.filter(v => v.status === 'active').length || 0
    const maintenanceVehicles = vehicles?.filter(v => v.status === 'maintenance').length || 0
    const totalCapacity = vehicles?.reduce((sum, v) => sum + v.capacity, 0) || 0
    
    const completedTrips = trips?.filter(t => t.status === 'completed') || []
    const totalTrips = completedTrips.length
    const totalPassengers = completedTrips.reduce((sum, t) => sum + t.passenger_count, 0)
    const totalDistance = completedTrips.reduce((sum, t) => sum + (t.distance || 0), 0)
    const totalCost = completedTrips.reduce((sum, t) => sum + (t.cost || 0), 0)
    
    const averageLoadFactor = totalTrips > 0 
      ? completedTrips.reduce((sum, t) => {
          const vehicle = vehicles?.find(v => v.id === (t as any).vehicle_id)
          return sum + (vehicle ? (t.passenger_count / vehicle.capacity) * 100 : 0)
        }, 0) / totalTrips
      : 0

    const costPerMile = totalDistance > 0 ? totalCost / totalDistance : 0
    const costPerPassenger = totalPassengers > 0 ? totalCost / totalPassengers : 0

    return {
      totalVehicles,
      activeVehicles,
      maintenanceVehicles,
      totalCapacity,
      totalTrips,
      totalPassengers,
      totalDistance,
      totalCost,
      averageLoadFactor,
      costPerMile,
      costPerPassenger
    }
  }, [dateRange])

  const { data: analytics, error, mutate, isLoading } = useSWR(
    ['transport_analytics', dateRange],
    fetcher
  )

  return {
    analytics,
    isLoading,
    error,
    refresh: mutate
  }
}

// Vehicle Utilization Hook
export function useVehicleUtilization(vehicleId?: string, dateRange?: { start: Date; end: Date }) {
  const supabase = createClient()
  
  const fetcher = useCallback(async (): Promise<VehicleUtilization[]> => {
    let vehicleQuery = supabase
      .from('vehicles')
      .select('*')
      .eq('status', 'active')

    if (vehicleId) {
      vehicleQuery = vehicleQuery.eq('id', vehicleId)
    }

    const { data: vehicles } = await vehicleQuery
    if (!vehicles) return []

    const utilizationData = await Promise.all(
      vehicles.map(async (vehicle) => {
        let tripQuery = supabase
          .from('trips')
          .select('id, passenger_count, distance, cost, status')
          .eq('vehicle_id', vehicle.id)
          .eq('status', 'completed')

        if (dateRange) {
          tripQuery = tripQuery
            .gte('date', dateRange.start.toISOString())
            .lte('date', dateRange.end.toISOString())
        }

        const { data: trips } = await tripQuery
        const tripsCount = trips?.length || 0
        const totalDistance = trips?.reduce((sum, t) => sum + (t.distance || 0), 0) || 0
        const totalPassengers = trips?.reduce((sum, t) => sum + t.passenger_count, 0) || 0
        
        // Calculate utilization rate (trips per day in date range)
        const days = dateRange 
          ? Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24))
          : 30 // Default to 30 days
        const utilizationRate = days > 0 ? (tripsCount / days) * 100 : 0
        
        const averageLoadFactor = tripsCount > 0 
          ? trips!.reduce((sum, t) => sum + (t.passenger_count / vehicle.capacity) * 100, 0) / tripsCount
          : 0

        return {
          vehicleId: vehicle.id,
          vehicle,
          tripsCount,
          totalDistance,
          totalPassengers,
          utilizationRate,
          averageLoadFactor,
          maintenanceHours: 0 // This would come from maintenance records
        }
      })
    )

    return utilizationData
  }, [vehicleId, dateRange])

  const { data: utilization, error, mutate, isLoading } = useSWR(
    ['vehicle_utilization', vehicleId, dateRange],
    fetcher
  )

  return {
    utilization,
    isLoading,
    error,
    refresh: mutate
  }
}

// Route Analytics Hook
export function useRouteAnalytics(dateRange?: { start: Date; end: Date }) {
  const supabase = createClient()
  
  const fetcher = useCallback(async (): Promise<RouteAnalytics[]> => {
    let query = supabase
      .from('trips')
      .select('route, passenger_count, cost, date, status')
      .eq('status', 'completed')

    if (dateRange) {
      query = query
        .gte('date', dateRange.start.toISOString())
        .lte('date', dateRange.end.toISOString())
    }

    const { data: trips } = await query
    if (!trips) return []

    // Group trips by route
    const routeMap = new Map<string, any[]>()
    trips.forEach(trip => {
      if (!routeMap.has(trip.route)) {
        routeMap.set(trip.route, [])
      }
      routeMap.get(trip.route)!.push(trip)
    })

    // Calculate analytics for each route
    const routeAnalytics = Array.from(routeMap.entries()).map(([route, routeTrips]) => {
      const tripsCount = routeTrips.length
      const totalPassengers = routeTrips.reduce((sum, t) => sum + t.passenger_count, 0)
      const totalCost = routeTrips.reduce((sum, t) => sum + (t.cost || 0), 0)
      const averagePassengers = tripsCount > 0 ? totalPassengers / tripsCount : 0
      const averageCost = tripsCount > 0 ? totalCost / tripsCount : 0

      // Find popular times (simplified - just hour of day)
      const timeMap = new Map<string, number>()
      routeTrips.forEach(trip => {
        const hour = new Date(trip.date).getHours()
        const timeSlot = `${hour}:00`
        timeMap.set(timeSlot, (timeMap.get(timeSlot) || 0) + 1)
      })

      const popularTimes = Array.from(timeMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([time]) => time)

      return {
        route,
        tripsCount,
        totalPassengers,
        averagePassengers,
        totalCost,
        averageCost,
        popularTimes
      }
    })

    return routeAnalytics.sort((a, b) => b.tripsCount - a.tripsCount)
  }, [dateRange])

  const { data: analytics, error, mutate, isLoading } = useSWR(
    ['route_analytics', dateRange],
    fetcher
  )

  return {
    analytics,
    isLoading,
    error,
    refresh: mutate
  }
}