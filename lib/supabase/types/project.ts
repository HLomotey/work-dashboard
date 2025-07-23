/**
 * Project-related type definitions
 * Contains all interfaces and types related to project management
 * Matches frontend component expectations
 */

import { z } from 'zod';
import { BaseEntity } from './base';

// Project domain enums
export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived'
}

export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

export enum ProjectType {
  INTERNAL = 'internal',
  CLIENT = 'client',
  RESEARCH = 'research',
  MAINTENANCE = 'maintenance',
  DEVELOPMENT = 'development',
  MARKETING = 'marketing',
  TRAINING = 'training'
}

// Zod schemas for validation
export const ProjectStatusSchema = z.nativeEnum(ProjectStatus);
export const ProjectPrioritySchema = z.nativeEnum(ProjectPriority);
export const ProjectTypeSchema = z.nativeEnum(ProjectType);

// Project milestone schema
export const ProjectMilestoneSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Milestone name is required').max(255),
  description: z.string().max(500).optional(),
  dueDate: z.date(),
  completedDate: z.date().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'overdue']),
  deliverables: z.array(z.string()).default([]),
});

// Project team member schema
export const ProjectTeamMemberSchema = z.object({
  employeeId: z.string().uuid(),
  role: z.string().min(1, 'Role is required').max(100),
  responsibilities: z.array(z.string()).default([]),
  hourlyRate: z.number().positive().optional(),
  allocatedHours: z.number().positive().optional(),
  joinedDate: z.date(),
  leftDate: z.date().optional(),
});

// Base project schema
const BaseProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Project name is required').max(255),
  code: z.string().min(2, 'Project code must be at least 2 characters').max(20).toUpperCase(),
  description: z.string().max(2000).optional(),
  type: ProjectTypeSchema,
  status: ProjectStatusSchema,
  priority: ProjectPrioritySchema,
  managerId: z.string().uuid(),
  clientId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  budgetId: z.string().uuid().optional(),
  estimatedBudget: z.number().positive().optional(),
  actualBudget: z.number().min(0).default(0),
  estimatedHours: z.number().positive().optional(),
  actualHours: z.number().min(0).default(0),
  startDate: z.date(),
  endDate: z.date().optional(),
  actualStartDate: z.date().optional(),
  actualEndDate: z.date().optional(),
  completionPercentage: z.number().min(0).max(100).default(0),
  milestones: z.array(ProjectMilestoneSchema).default([]),
  teamMembers: z.array(ProjectTeamMemberSchema).default([]),
  tags: z.array(z.string()).default([]),
  objectives: z.array(z.string()).default([]),
  deliverables: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  notes: z.string().max(2000).optional(),
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Project schema with refinements
export const ProjectSchema = BaseProjectSchema.refine(
  (data) => !data.endDate || data.endDate >= data.startDate,
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
).refine(
  (data) => !data.actualStartDate || data.actualStartDate >= data.startDate,
  {
    message: 'Actual start date cannot be before planned start date',
    path: ['actualStartDate'],
  }
).refine(
  (data) => !data.actualEndDate || !data.actualStartDate || data.actualEndDate >= data.actualStartDate,
  {
    message: 'Actual end date must be after actual start date',
    path: ['actualEndDate'],
  }
);

// Create schema
export const CreateProjectSchema = BaseProjectSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  actualBudget: true,
  actualHours: true,
  actualStartDate: true,
  actualEndDate: true,
  completionPercentage: true,
}).refine(
  (data) => data.startDate >= new Date(new Date().setHours(0, 0, 0, 0)),
  {
    message: 'Project start date cannot be in the past',
    path: ['startDate'],
  }
);

// Update schema
export const UpdateProjectSchema = BaseProjectSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  code: true, // Project code should not be changed after creation
}).partial();

// TypeScript interfaces (inferred from Zod schemas)
export type Project = z.infer<typeof ProjectSchema>;
export type CreateProject = z.infer<typeof CreateProjectSchema>;
export type UpdateProject = z.infer<typeof UpdateProjectSchema>;
export type ProjectMilestone = z.infer<typeof ProjectMilestoneSchema>;
export type ProjectTeamMember = z.infer<typeof ProjectTeamMemberSchema>;

// Extended interfaces with relations
export interface ProjectWithDetails extends Project {
  manager: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
    email: string;
  };
  client?: {
    id: string;
    name: string;
    email: string;
    contactPerson: string;
  };
  department?: {
    id: string;
    name: string;
    code: string;
  };
  budget?: {
    id: string;
    name: string;
    allocatedAmount: number;
    spentAmount: number;
  };
  tasks: any[]; // Will be Task[] when task types are created
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  teamSize: number;
}

export interface ProjectSummary {
  projectId: string;
  name: string;
  code: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  completionPercentage: number;
  startDate: Date;
  endDate?: Date;
  manager: string;
  teamSize: number;
  budgetUtilization: number;
  daysRemaining: number;
  isOverdue: boolean;
}

// Utility types for project operations
export type ProjectFilters = {
  status?: ProjectStatus;
  priority?: ProjectPriority;
  type?: ProjectType;
  managerId?: string;
  clientId?: string;
  departmentId?: string;
  search?: string;
  budgetRange?: {
    min: number;
    max: number;
  };
  completionRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  isOverdue?: boolean;
  hasActiveTasks?: boolean;
};

export type ProjectMetrics = {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  overdueProjects: number;
  averageCompletionTime: number;
  averageBudgetUtilization: number;
  projectsByStatus: Record<ProjectStatus, number>;
  projectsByPriority: Record<ProjectPriority, number>;
  projectsByType: Record<ProjectType, number>;
  totalBudget: number;
  totalSpent: number;
  onTimeDeliveryRate: number;
};

export type ProjectAnalytics = {
  projectId: string;
  project: Project;
  timeline: {
    planned: {
      start: Date;
      end: Date;
      duration: number;
    };
    actual: {
      start?: Date;
      end?: Date;
      duration?: number;
    };
    variance: number;
  };
  budget: {
    estimated: number;
    actual: number;
    variance: number;
    utilizationRate: number;
  };
  progress: {
    tasksCompleted: number;
    totalTasks: number;
    milestonesCompleted: number;
    totalMilestones: number;
    overallCompletion: number;
  };
  team: {
    totalMembers: number;
    activeMembers: number;
    totalHours: number;
    averageProductivity: number;
  };
  risks: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    mitigation: string[];
  };
};

// Database table type definitions for Supabase
export interface ProjectRow extends BaseEntity {
  name: string;
  code: string;
  description?: string;
  type: 'internal' | 'client' | 'research' | 'maintenance' | 'development' | 'marketing' | 'training';
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  manager_id: string;
  client_id?: string;
  department_id?: string;
  budget_id?: string;
  estimated_budget?: number;
  actual_budget: number;
  estimated_hours?: number;
  actual_hours: number;
  start_date: string;
  end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  completion_percentage: number;
  milestones: {
    id: string;
    name: string;
    description?: string;
    dueDate: string;
    completedDate?: string;
    status: string;
    deliverables: string[];
  }[];
  team_members: {
    employeeId: string;
    role: string;
    responsibilities: string[];
    hourlyRate?: number;
    allocatedHours?: number;
    joinedDate: string;
    leftDate?: string;
  }[];
  tags: string[];
  objectives: string[];
  deliverables: string[];
  risks: string[];
  notes?: string;
  created_by: string;
}

export interface ProjectInsert extends Omit<ProjectRow, 'id' | 'created_at' | 'updated_at'> {}
export interface ProjectUpdate extends Partial<ProjectInsert> {}

// Form validation helpers
export const validateProject = (data: unknown) => ProjectSchema.safeParse(data);
export const validateCreateProject = (data: unknown) => CreateProjectSchema.safeParse(data);
export const validateUpdateProject = (data: unknown) => UpdateProjectSchema.safeParse(data);
export const validateProjectMilestone = (data: unknown) => ProjectMilestoneSchema.safeParse(data);
export const validateProjectTeamMember = (data: unknown) => ProjectTeamMemberSchema.safeParse(data);
