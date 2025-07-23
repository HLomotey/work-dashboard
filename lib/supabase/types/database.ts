/**
 * Database type definitions for Supabase
 * This file defines the structure of the database for type-safe access
 * Follows the Row/Insert/Update pattern for each table
 * Entity interfaces are imported from their respective files
 */

// Import all entity types from their respective files
import { Profile } from "./profile";
import { User, UserRow, UserInsert, UserUpdate } from "./user";
import { Property, PropertyRow, PropertyInsert, PropertyUpdate } from "./property";
import { Room, RoomAssignment, RoomRow, RoomInsert, RoomUpdate, RoomAssignmentRow, RoomAssignmentInsert, RoomAssignmentUpdate } from "./room";
import { Vehicle, VehicleRow, VehicleInsert, VehicleUpdate } from "./vehicle";
import { Trip, TripPassenger, TripRow, TripInsert, TripUpdate, TripPassengerRow, TripPassengerInsert, TripPassengerUpdate } from "./trip";
import { BillingPeriod, Charge, PayrollExport, BillingPeriodRow, BillingPeriodInsert, BillingPeriodUpdate, ChargeRow, ChargeInsert, ChargeUpdate, PayrollExportRow, PayrollExportInsert, PayrollExportUpdate } from "./billing";
import { Employee, EmployeeRow, EmployeeInsert, EmployeeUpdate } from "./employee";
import { Department, DepartmentRow, DepartmentInsert, DepartmentUpdate } from "./department";
import { Transaction, TransactionRow, TransactionInsert, TransactionUpdate } from "./transaction";
import { Budget, BudgetRow, BudgetInsert, BudgetUpdate } from "./budget";
import { Project, ProjectRow, ProjectInsert, ProjectUpdate } from "./project";
import { Task, TaskRow, TaskInsert, TaskUpdate } from "./task";

/**
 * Database interface for Supabase
 * This provides type safety for all database operations
 */
export interface Database {
  public: {
    Tables: {
      // User management tables
      users: {
        Row: UserRow;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };

      // Housing management tables
      properties: {
        Row: PropertyRow;
        Insert: PropertyInsert;
        Update: PropertyUpdate;
      };
      rooms: {
        Row: RoomRow;
        Insert: RoomInsert;
        Update: RoomUpdate;
      };
      room_assignments: {
        Row: RoomAssignmentRow;
        Insert: RoomAssignmentInsert;
        Update: RoomAssignmentUpdate;
      };

      // Transport management tables
      vehicles: {
        Row: VehicleRow;
        Insert: VehicleInsert;
        Update: VehicleUpdate;
      };
      trips: {
        Row: TripRow;
        Insert: TripInsert;
        Update: TripUpdate;
      };
      trip_passengers: {
        Row: TripPassengerRow;
        Insert: TripPassengerInsert;
        Update: TripPassengerUpdate;
      };

      // Billing management tables
      billing_periods: {
        Row: BillingPeriodRow;
        Insert: BillingPeriodInsert;
        Update: BillingPeriodUpdate;
      };
      charges: {
        Row: ChargeRow;
        Insert: ChargeInsert;
        Update: ChargeUpdate;
      };
      payroll_exports: {
        Row: PayrollExportRow;
        Insert: PayrollExportInsert;
        Update: PayrollExportUpdate;
      };

      // HR management tables
      employees: {
        Row: EmployeeRow;
        Insert: EmployeeInsert;
        Update: EmployeeUpdate;
      };
      departments: {
        Row: DepartmentRow;
        Insert: DepartmentInsert;
        Update: DepartmentUpdate;
      };

      // Finance management tables
      transactions: {
        Row: TransactionRow;
        Insert: TransactionInsert;
        Update: TransactionUpdate;
      };
      budgets: {
        Row: BudgetRow;
        Insert: BudgetInsert;
        Update: BudgetUpdate;
      };

      // Operations management tables
      projects: {
        Row: ProjectRow;
        Insert: ProjectInsert;
        Update: ProjectUpdate;
      };
      tasks: {
        Row: TaskRow;
        Insert: TaskInsert;
        Update: TaskUpdate;
      };
    };
    Views: {
      // Define views when needed
      active_users: {
        Row: Record<string, unknown>;
      };
      department_summary: {
        Row: Record<string, unknown>;
      };
    };
    Functions: {
      // Define functions when needed
    };
    Enums: {
      user_role: "admin" | "manager" | "staff" | "guest";
      user_status: "active" | "inactive" | "suspended";
      property_type: "apartment" | "dormitory" | "guesthouse" | "villa";
      room_status: "available" | "occupied" | "maintenance" | "reserved";
      vehicle_type: "bus" | "van" | "car" | "truck";
      trip_status: "planned" | "in_progress" | "completed" | "cancelled";
      billing_status: "draft" | "active" | "closed" | "archived";
      charge_status: "pending" | "approved" | "disputed" | "cancelled";
      export_status: "pending" | "processing" | "completed" | "failed";
      priority_level: "low" | "medium" | "high" | "urgent";
    };
  };
}