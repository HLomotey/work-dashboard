/**
 * Profile type definitions for the Work Dashboard application
 * This file defines user profile related types
 */

import { BaseEntity, Address, ContactInfo } from "./base";

// User Profile interface
export interface Profile extends BaseEntity {
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  phone?: string;
  department?: string;
  position?: string;
  employee_id?: string;
  hire_date?: string;
  address?: Address;
  contact_info?: ContactInfo;
  preferences?: ProfilePreferences;
  bio?: string;
  skills?: string[];
  certifications?: string[];
  emergency_contact?: EmergencyContact;
}

// Emergency contact interface
export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
}

// Profile preferences interface
export interface ProfilePreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  timezone?: string;
  notifications?: NotificationPreferences;
  dashboard_layout?: DashboardLayout;
}

// Notification preferences
export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  notification_types: {
    housing: boolean;
    transport: boolean;
    billing: boolean;
    hr: boolean;
    finance: boolean;
    operations: boolean;
  };
}

// Dashboard layout preferences
export interface DashboardLayout {
  widgets: DashboardWidget[];
  layout_type: 'grid' | 'list' | 'compact';
  sidebar_collapsed: boolean;
}

// Dashboard widget configuration
export interface DashboardWidget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'calendar' | 'tasks';
  title: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: Record<string, any>;
  visible: boolean;
}

// Profile update input types
export type CreateProfileInput = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
export type UpdateProfileInput = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;

// Profile with computed fields
export interface ProfileWithComputed extends Profile {
  full_name: string;
  display_name: string;
  years_of_service?: number;
  is_manager: boolean;
}

// Profile filters for queries
export interface ProfileFilters {
  department?: string;
  position?: string;
  status?: 'active' | 'inactive';
  search?: string;
  hire_date_from?: string;
  hire_date_to?: string;
}

// Profile statistics
export interface ProfileStats {
  total_profiles: number;
  active_profiles: number;
  by_department: Record<string, number>;
  by_position: Record<string, number>;
  recent_hires: number;
}