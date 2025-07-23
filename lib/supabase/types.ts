/**
 * Main types file for the Work Dashboard application
 * This file exports all types and provides additional utility types
 */

// Re-export all base types
export * from "./types/base";
export * from "./types/database";
export * from "./types/profile";

// Import specific types for utility type creation
import { Database } from "./types/database";
import { BaseEntity } from "./types/base";

// Database utility types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

// Specific table type shortcuts
export type UserRow = Tables<"users">;
export type ProfileRow = Tables<"profiles">;
export type PropertyRow = Tables<"properties">;
export type RoomRow = Tables<"rooms">;
export type RoomAssignmentRow = Tables<"room_assignments">;
export type VehicleRow = Tables<"vehicles">;
export type TripRow = Tables<"trips">;
export type TripPassengerRow = Tables<"trip_passengers">;
export type BillingPeriodRow = Tables<"billing_periods">;
export type ChargeRow = Tables<"charges">;
export type PayrollExportRow = Tables<"payroll_exports">;
export type EmployeeRow = Tables<"employees">;
export type DepartmentRow = Tables<"departments">;
export type TransactionRow = Tables<"transactions">;
export type BudgetRow = Tables<"budgets">;
export type ProjectRow = Tables<"projects">;
export type TaskRow = Tables<"tasks">;

// Insert type shortcuts
export type UserInsert = TablesInsert<"users">;
export type ProfileInsert = TablesInsert<"profiles">;
export type PropertyInsert = TablesInsert<"properties">;
export type RoomInsert = TablesInsert<"rooms">;
export type RoomAssignmentInsert = TablesInsert<"room_assignments">;
export type VehicleInsert = TablesInsert<"vehicles">;
export type TripInsert = TablesInsert<"trips">;
export type TripPassengerInsert = TablesInsert<"trip_passengers">;
export type BillingPeriodInsert = TablesInsert<"billing_periods">;
export type ChargeInsert = TablesInsert<"charges">;
export type PayrollExportInsert = TablesInsert<"payroll_exports">;
export type EmployeeInsert = TablesInsert<"employees">;
export type DepartmentInsert = TablesInsert<"departments">;
export type TransactionInsert = TablesInsert<"transactions">;
export type BudgetInsert = TablesInsert<"budgets">;
export type ProjectInsert = TablesInsert<"projects">;
export type TaskInsert = TablesInsert<"tasks">;

// Update type shortcuts
export type UserUpdate = TablesUpdate<"users">;
export type ProfileUpdate = TablesUpdate<"profiles">;
export type PropertyUpdate = TablesUpdate<"properties">;
export type RoomUpdate = TablesUpdate<"rooms">;
export type RoomAssignmentUpdate = TablesUpdate<"room_assignments">;
export type VehicleUpdate = TablesUpdate<"vehicles">;
export type TripUpdate = TablesUpdate<"trips">;
export type TripPassengerUpdate = TablesUpdate<"trip_passengers">;
export type BillingPeriodUpdate = TablesUpdate<"billing_periods">;
export type ChargeUpdate = TablesUpdate<"charges">;
export type PayrollExportUpdate = TablesUpdate<"payroll_exports">;
export type EmployeeUpdate = TablesUpdate<"employees">;
export type DepartmentUpdate = TablesUpdate<"departments">;
export type TransactionUpdate = TablesUpdate<"transactions">;
export type BudgetUpdate = TablesUpdate<"budgets">;
export type ProjectUpdate = TablesUpdate<"projects">;
export type TaskUpdate = TablesUpdate<"tasks">;

// Enum type shortcuts
export type UserRole = Enums<"user_role">;
export type UserStatus = Enums<"user_status">;
export type PropertyType = Enums<"property_type">;
export type RoomStatus = Enums<"room_status">;
export type VehicleType = Enums<"vehicle_type">;
export type TripStatus = Enums<"trip_status">;
export type BillingStatus = Enums<"billing_status">;
export type ChargeStatus = Enums<"charge_status">;
export type ExportStatus = Enums<"export_status">;
export type PriorityLevel = Enums<"priority_level">;

// Utility types for relationships
export interface PropertyWithRooms extends PropertyRow {
  rooms: RoomRow[];
}

export interface RoomWithAssignments extends RoomRow {
  assignments: RoomAssignmentRow[];
}

export interface RoomAssignmentWithDetails extends RoomAssignmentRow {
  room: RoomRow;
  staff: ProfileRow;
}

export interface TripWithPassengers extends TripRow {
  passengers: TripPassengerRow[];
  vehicle: VehicleRow;
}

export interface BillingPeriodWithCharges extends BillingPeriodRow {
  charges: ChargeRow[];
}

export interface ChargeWithDetails extends ChargeRow {
  billing_period: BillingPeriodRow;
  staff: ProfileRow;
}

export interface EmployeeWithProfile extends EmployeeRow {
  profile?: ProfileRow;
  department_info?: DepartmentRow;
}

export interface DepartmentWithEmployees extends DepartmentRow {
  employees: EmployeeRow[];
  manager?: EmployeeRow;
}

export interface ProjectWithTasks extends ProjectRow {
  tasks: TaskRow[];
  manager: ProfileRow;
}

export interface TaskWithProject extends TaskRow {
  project?: ProjectRow;
  assignee?: ProfileRow;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
  status: "success" | "error";
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Filter types
export interface BaseFilters {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface HousingFilters extends BaseFilters {
  property_type?: PropertyType;
  room_status?: RoomStatus;
  capacity_min?: number;
  capacity_max?: number;
}

export interface TransportFilters extends BaseFilters {
  vehicle_type?: VehicleType;
  trip_status?: TripStatus;
  date_from?: string;
  date_to?: string;
}

export interface BillingFilters extends BaseFilters {
  billing_status?: BillingStatus;
  charge_status?: ChargeStatus;
  amount_min?: number;
  amount_max?: number;
  period_id?: string;
}

export interface HRFilters extends BaseFilters {
  department?: string;
  position?: string;
  employee_status?: "active" | "inactive" | "terminated" | "on_leave";
  hire_date_from?: string;
  hire_date_to?: string;
}

export interface FinanceFilters extends BaseFilters {
  transaction_type?: "income" | "expense" | "transfer";
  category?: string;
  amount_min?: number;
  amount_max?: number;
  currency?: string;
}

export interface OperationsFilters extends BaseFilters {
  project_status?:
    | "planning"
    | "active"
    | "on_hold"
    | "completed"
    | "cancelled";
  task_status?: "todo" | "in_progress" | "review" | "completed" | "cancelled";
  priority?: PriorityLevel;
  assigned_to?: string;
}

// Dashboard types
export interface DashboardMetric {
  id: string;
  title: string;
  value: number | string;
  change?: number;
  changeType?: "increase" | "decrease";
  format?: "number" | "currency" | "percentage";
  icon?: string;
  color?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export interface DashboardWidget {
  id: string;
  type: "metric" | "chart" | "table" | "list";
  title: string;
  data: any;
  config?: Record<string, any>;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// File upload types
export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploaded_at: string;
  uploaded_by: string;
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

// Notification types
export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  user_id: string;
  action_url?: string;
}

// Export the Database type as default
export type { Database } from "./types/database";
