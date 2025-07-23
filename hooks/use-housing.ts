"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { mockHousingAPI, shouldUseMockData } from "@/lib/api/housing-mock";
import type {
  Property,
  Room,
  RoomAssignment,
  PropertyWithRooms,
  RoomWithAssignments,
  RoomAssignmentWithDetails,
  CreateProperty,
  UpdateProperty,
  CreateRoom,
  UpdateRoom,
  CreateRoomAssignment,
  UpdateRoomAssignment,
  HousingFilters,
  OccupancyMetrics,
  RoomAvailability,
  PropertyStatus,
  RoomStatus,
} from "@/lib/types/housing";
import { AssignmentStatus } from "@/lib/types/housing";

// Properties Hook
export function useProperties(filters?: HousingFilters) {
  const supabase = createClient();

  const fetcher = useCallback(async () => {
    // Use mock data if Supabase is not properly configured
    if (shouldUseMockData()) {
      const mockData = await mockHousingAPI.getPropertiesWithRooms();
      let filteredData = mockData;

      if (filters?.status) {
        filteredData = filteredData.filter(p => p.status === filters.status);
      }

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.address.toLowerCase().includes(searchLower)
        );
      }

      return filteredData;
    }

    // Original Supabase logic
    try {
      let query = supabase.from("properties").select("*").order("name");

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,address.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Property[];
    } catch (error) {
      console.warn('Supabase error, falling back to mock data:', error);
      return await mockHousingAPI.getPropertiesWithRooms();
    }
  }, [filters, supabase]);

  const {
    data: properties,
    error,
    mutate,
    isLoading,
  } = useSWR(["properties", filters], fetcher);

  const createProperty = useCallback(
    async (propertyData: CreateProperty) => {
      const { data, error } = await supabase
        .from("properties")
        .insert([propertyData])
        .select()
        .single();

      if (error) throw error;
      await mutate();
      return data as Property;
    },
    [supabase, mutate]
  );

  const updateProperty = useCallback(
    async (id: string, updates: UpdateProperty) => {
      const { data, error } = await supabase
        .from("properties")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      await mutate();
      return data as Property;
    },
    [supabase, mutate]
  );

  const deleteProperty = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("properties").delete().eq("id", id);

      if (error) throw error;
      await mutate();
    },
    [supabase, mutate]
  );

  return {
    properties,
    isLoading,
    error,
    createProperty,
    updateProperty,
    deleteProperty,
    refresh: mutate,
  };
}

// Rooms Hook
export function useRooms(propertyId?: string, filters?: HousingFilters) {
  const supabase = createClient();

  const fetcher = useCallback(async () => {
    let query = supabase.from("rooms").select("*").order("room_number");

    if (propertyId) {
      query = query.eq("property_id", propertyId);
    }

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.search) {
      query = query.ilike("room_number", `%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Room[];
  }, [propertyId, filters]);

  const {
    data: rooms,
    error,
    mutate,
    isLoading,
  } = useSWR(["rooms", propertyId, filters], fetcher);

  const createRoom = useCallback(
    async (roomData: CreateRoom) => {
      const { data, error } = await supabase
        .from("rooms")
        .insert([roomData])
        .select()
        .single();

      if (error) throw error;
      await mutate();
      return data as Room;
    },
    [supabase, mutate]
  );

  const updateRoom = useCallback(
    async (id: string, updates: UpdateRoom) => {
      const { data, error } = await supabase
        .from("rooms")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      await mutate();
      return data as Room;
    },
    [supabase, mutate]
  );

  const deleteRoom = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("rooms").delete().eq("id", id);

      if (error) throw error;
      await mutate();
    },
    [supabase, mutate]
  );

  const checkRoomAvailability = useCallback(
    async (
      roomId: string,
      startDate: Date,
      endDate?: Date
    ): Promise<RoomAvailability> => {
      // Get room details
      const { data: room, error: roomError } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      if (roomError) throw roomError;

      // Check for overlapping assignments
      let query = supabase
        .from("room_assignments")
        .select("*")
        .eq("room_id", roomId)
        .eq("status", "active");

      if (endDate) {
        query = query.or(
          `start_date.lte.${endDate.toISOString()},end_date.gte.${startDate.toISOString()}`
        );
      } else {
        query = query.or(
          `end_date.is.null,end_date.gte.${startDate.toISOString()}`
        );
      }

      const { data: assignments, error: assignmentError } = await query;
      if (assignmentError) throw assignmentError;

      const currentOccupancy = assignments?.length || 0;
      const available = currentOccupancy < room.capacity;

      return {
        roomId,
        available,
        currentOccupancy,
        maxCapacity: room.capacity,
        availableFrom: available ? startDate : undefined,
        availableUntil: available ? endDate : undefined,
      };
    },
    [supabase]
  );

  return {
    rooms,
    isLoading,
    error,
    createRoom,
    updateRoom,
    deleteRoom,
    checkRoomAvailability,
    refresh: mutate,
  };
}

// Room Assignments Hook
export function useRoomAssignments(filters?: HousingFilters) {
  const supabase = createClient();

  const fetcher = useCallback(async () => {
    let query = supabase
      .from("room_assignments")
      .select(
        `
        *,
        room:rooms(*),
        property:rooms(properties(*)),
        staff:staff(*)
      `
      )
      .order("start_date", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.dateRange) {
      query = query
        .gte("start_date", filters.dateRange.start.toISOString())
        .lte("start_date", filters.dateRange.end.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as RoomAssignmentWithDetails[];
  }, [filters]);

  const {
    data: assignments,
    error,
    mutate,
    isLoading,
  } = useSWR(["room_assignments", filters], fetcher);

  const createAssignment = useCallback(
    async (assignmentData: CreateRoomAssignment) => {
      // First check room availability
      const { data: room } = await supabase
        .from("rooms")
        .select("capacity")
        .eq("id", assignmentData.roomId)
        .single();

      if (!room) throw new Error("Room not found");

      // Check current occupancy
      const { data: currentAssignments } = await supabase
        .from("room_assignments")
        .select("*")
        .eq("room_id", assignmentData.roomId)
        .eq("status", "active");

      if (currentAssignments && currentAssignments.length >= room.capacity) {
        throw new Error("Room is at full capacity");
      }

      const { data, error } = await supabase
        .from("room_assignments")
        .insert([assignmentData])
        .select()
        .single();

      if (error) throw error;
      await mutate();
      return data as RoomAssignment;
    },
    [supabase, mutate]
  );

  const updateAssignment = useCallback(
    async (id: string, updates: UpdateRoomAssignment) => {
      const { data, error } = await supabase
        .from("room_assignments")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      await mutate();
      return data as RoomAssignment;
    },
    [supabase, mutate]
  );

  const completeAssignment = useCallback(
    async (id: string, moveOutDate?: Date) => {
      const updates: UpdateRoomAssignment = {
        status: AssignmentStatus.COMPLETED,
        moveOutDate: moveOutDate || new Date(),
        endDate: moveOutDate || new Date(),
      };

      return updateAssignment(id, updates);
    },
    [updateAssignment]
  );

  const cancelAssignment = useCallback(
    async (id: string) => {
      const updates: UpdateRoomAssignment = {
        status: AssignmentStatus.CANCELLED,
      };

      return updateAssignment(id, updates);
    },
    [updateAssignment]
  );

  return {
    assignments,
    isLoading,
    error,
    createAssignment,
    updateAssignment,
    completeAssignment,
    cancelAssignment,
    refresh: mutate,
  };
}

// Housing Analytics Hook
export function useHousingAnalytics(dateRange?: { start: Date; end: Date }) {
  const supabase = createClient();

  const fetcher = useCallback(async (): Promise<OccupancyMetrics> => {
    // Get total properties and rooms
    const { data: properties } = await supabase
      .from("properties")
      .select("id, total_capacity")
      .eq("status", "active");

    const { data: rooms } = await supabase
      .from("rooms")
      .select("id, capacity, status");

    // Get current active assignments
    const { data: activeAssignments } = await supabase
      .from("room_assignments")
      .select("room_id")
      .eq("status", "active");

    const totalProperties = properties?.length || 0;
    const totalRooms = rooms?.length || 0;
    const totalCapacity =
      rooms?.reduce((sum, room) => sum + room.capacity, 0) || 0;
    const occupiedRooms = new Set(activeAssignments?.map((a) => a.room_id))
      .size;
    const availableRooms =
      rooms?.filter((r) => r.status === "available").length || 0;
    const maintenanceRooms =
      rooms?.filter((r) => r.status === "maintenance").length || 0;
    const occupancyRate =
      totalCapacity > 0 ? (occupiedRooms / totalCapacity) * 100 : 0;

    return {
      totalProperties,
      totalRooms,
      totalCapacity,
      occupiedRooms,
      occupancyRate,
      availableRooms,
      maintenanceRooms,
    };
  }, [dateRange]);

  const {
    data: analytics,
    error,
    mutate,
    isLoading,
  } = useSWR(["housing_analytics", dateRange], fetcher);

  return {
    analytics,
    isLoading,
    error,
    refresh: mutate,
  };
}

// Properties with Rooms Hook (for detailed views)
export function usePropertiesWithRooms(filters?: HousingFilters) {
  const supabase = createClient();

  const fetcher = useCallback(async () => {
    let query = supabase
      .from("properties")
      .select(
        `
        *,
        rooms(*)
      `
      )
      .order("name");

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Calculate occupancy metrics for each property
    const propertiesWithMetrics = await Promise.all(
      (data || []).map(async (property) => {
        const { data: assignments } = await supabase
          .from("room_assignments")
          .select("room_id")
          .eq("status", "active")
          .in(
            "room_id",
            property.rooms.map((r: Room) => r.id)
          );

        const occupiedRooms = new Set(assignments?.map((a) => a.room_id)).size;
        const occupancyRate =
          property.total_capacity > 0
            ? (occupiedRooms / property.total_capacity) * 100
            : 0;
        const availableCapacity = property.total_capacity - occupiedRooms;

        return {
          ...property,
          occupancyRate,
          availableCapacity,
        } as PropertyWithRooms;
      })
    );

    return propertiesWithMetrics;
  }, [filters]);

  const {
    data: properties,
    error,
    mutate,
    isLoading,
  } = useSWR(["properties_with_rooms", filters], fetcher);

  return {
    properties,
    isLoading,
    error,
    refresh: mutate,
  };
}

// Housing Assignments Hook (for staff self-service)
export function useHousingAssignments(staffId?: string) {
  const supabase = createClient();

  const fetcher = useCallback(async () => {
    if (!staffId) return [];

    const { data, error } = await supabase
      .from("room_assignments")
      .select(`
        *,
        room:rooms (
          *,
          property:properties (*)
        )
      `)
      .eq("staff_id", staffId)
      .order("start_date", { ascending: false });

    if (error) throw error;
    return data as RoomAssignmentWithDetails[];
  }, [staffId]);

  const {
    data: assignments,
    error,
    mutate,
    isLoading,
  } = useSWR(
    staffId ? ["housing_assignments", staffId] : null,
    fetcher
  );

  return {
    assignments,
    isLoading,
    error,
    refresh: mutate,
  };
}

// Room Details Hook (for staff self-service)
export function useRoomDetails(roomId?: string) {
  const supabase = createClient();

  const fetcher = useCallback(async () => {
    if (!roomId) return null;

    const { data, error } = await supabase
      .from("rooms")
      .select(`
        *,
        property:properties (*),
        assignments:room_assignments (
          *,
          staff:staff (*)
        )
      `)
      .eq("id", roomId)
      .single();

    if (error) throw error;
    return data as RoomWithAssignments & { property: PropertyWithRooms };
  }, [roomId]);

  const {
    data: room,
    error,
    mutate,
    isLoading,
  } = useSWR(
    roomId ? ["room_details", roomId] : null,
    fetcher
  );

  return {
    room,
    isLoading,
    error,
    refresh: mutate,
  };
}

// Housing Requests Hook (for staff self-service)
export function useHousingRequests(staffId?: string) {
  const supabase = createClient();

  const fetcher = useCallback(async () => {
    if (!staffId) return [];

    // Mock data for now - replace with actual API call
    return [
      {
        id: "1",
        staffId,
        type: "room_change",
        title: "Request room change",
        description: "Current room is too noisy",
        status: "pending",
        priority: "medium",
        submittedAt: new Date("2024-01-15"),
        reviewedAt: null,
        reviewedBy: null,
        notes: null,
        attachments: []
      }
    ];
  }, [staffId]);

  const {
    data: requests,
    error,
    mutate,
    isLoading,
  } = useSWR(
    staffId ? ["housing_requests", staffId] : null,
    fetcher
  );

  const submitRequest = useCallback(async (request: any) => {
    if (!staffId) throw new Error("Staff ID is required");

    // Mock submission - replace with actual API call
    const newRequest = {
      id: Date.now().toString(),
      staffId,
      ...request,
      status: "pending",
      submittedAt: new Date(),
      reviewedAt: null,
      reviewedBy: null,
      notes: null
    };

    mutate([...(requests || []), newRequest], false);

    return newRequest;
  }, [staffId, requests, mutate]);

  return {
    requests,
    isLoading,
    error,
    submitRequest,
    refresh: mutate,
  };
}
