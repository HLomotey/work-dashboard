/**
 * Task-related type definitions
 * Contains all interfaces and types related to task management
 * Matches frontend component expectations
 */

import { z } from 'zod';
import { BaseEntity } from './base';

// Task domain enums
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  TESTING = 'testing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold',
  BLOCKED = 'blocked'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

export enum TaskType {
  FEATURE = 'feature',
  BUG = 'bug',
  IMPROVEMENT = 'improvement',
  DOCUMENTATION = 'documentation',
  RESEARCH = 'research',
  MAINTENANCE = 'maintenance',
  TESTING = 'testing',
  DEPLOYMENT = 'deployment'
}

// Zod schemas for validation
export const TaskStatusSchema = z.nativeEnum(TaskStatus);
export const TaskPrioritySchema = z.nativeEnum(TaskPriority);
export const TaskTypeSchema = z.nativeEnum(TaskType);

// Task comment schema
export const TaskCommentSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1, 'Comment content is required').max(2000),
  authorId: z.string().uuid(),
  authorName: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Task attachment schema
export const TaskAttachmentSchema = z.object({
  id: z.string().uuid(),
  filename: z.string(),
  url: z.string().url(),
  type: z.string(),
  size: z.number().positive(),
  uploadedBy: z.string().uuid(),
  uploadedAt: z.date(),
});

// Task time entry schema
export const TaskTimeEntrySchema = z.object({
  id: z.string().uuid(),
  employeeId: z.string().uuid(),
  startTime: z.date(),
  endTime: z.date().optional(),
  duration: z.number().positive().optional(), // in minutes
  description: z.string().max(500).optional(),
  billable: z.boolean().default(true),
  createdAt: z.date(),
});

// Base task schema
const BaseTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Task title is required').max(255),
  description: z.string().max(5000).optional(),
  type: TaskTypeSchema,
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  projectId: z.string().uuid().optional(),
  assigneeId: z.string().uuid().optional(),
  reporterId: z.string().uuid(),
  parentTaskId: z.string().uuid().optional(),
  milestoneId: z.string().uuid().optional(),
  estimatedHours: z.number().positive().optional(),
  actualHours: z.number().min(0).default(0),
  storyPoints: z.number().int().positive().optional(),
  dueDate: z.date().optional(),
  startDate: z.date().optional(),
  completedDate: z.date().optional(),
  tags: z.array(z.string()).default([]),
  labels: z.array(z.string()).default([]),
  dependencies: z.array(z.string().uuid()).default([]), // Task IDs this task depends on
  blockers: z.array(z.string()).default([]), // Reasons why task is blocked
  acceptanceCriteria: z.array(z.string()).default([]),
  comments: z.array(TaskCommentSchema).default([]),
  attachments: z.array(TaskAttachmentSchema).default([]),
  timeEntries: z.array(TaskTimeEntrySchema).default([]),
  customFields: z.record(z.string(), z.any()).default({}),
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Task schema with refinements
export const TaskSchema = BaseTaskSchema.refine(
  (data) => !data.dueDate || !data.startDate || data.dueDate >= data.startDate,
  {
    message: 'Due date must be after start date',
    path: ['dueDate'],
  }
).refine(
  (data) => !data.completedDate || !data.startDate || data.completedDate >= data.startDate,
  {
    message: 'Completed date must be after start date',
    path: ['completedDate'],
  }
).refine(
  (data) => data.status !== TaskStatus.COMPLETED || data.completedDate,
  {
    message: 'Completed tasks must have a completed date',
    path: ['completedDate'],
  }
);

// Create schema
export const CreateTaskSchema = BaseTaskSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  actualHours: true,
  completedDate: true,
  comments: true,
  attachments: true,
  timeEntries: true,
});

// Update schema
export const UpdateTaskSchema = BaseTaskSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
}).partial();

// TypeScript interfaces (inferred from Zod schemas)
export type Task = z.infer<typeof TaskSchema>;
export type CreateTask = z.infer<typeof CreateTaskSchema>;
export type UpdateTask = z.infer<typeof UpdateTaskSchema>;
export type TaskComment = z.infer<typeof TaskCommentSchema>;
export type TaskAttachment = z.infer<typeof TaskAttachmentSchema>;
export type TaskTimeEntry = z.infer<typeof TaskTimeEntrySchema>;

// Extended interfaces with relations
export interface TaskWithDetails extends Task {
  project?: {
    id: string;
    name: string;
    code: string;
    status: string;
  };
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
    email: string;
  };
  reporter: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  parentTask?: {
    id: string;
    title: string;
    status: TaskStatus;
  };
  subtasks: Task[];
  milestone?: {
    id: string;
    name: string;
    dueDate: Date;
  };
  dependentTasks: Task[];
  totalTimeLogged: number;
  progressPercentage: number;
}

export interface TaskSummary {
  taskId: string;
  title: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours: number;
  progressPercentage: number;
  isOverdue: boolean;
  hasBlockers: boolean;
}

// Utility types for task operations
export type TaskFilters = {
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  projectId?: string;
  assigneeId?: string;
  reporterId?: string;
  milestoneId?: string;
  parentTaskId?: string;
  search?: string;
  tags?: string[];
  labels?: string[];
  estimatedHoursRange?: {
    min: number;
    max: number;
  };
  dueDateRange?: {
    start: Date;
    end: Date;
  };
  createdDateRange?: {
    start: Date;
    end: Date;
  };
  isOverdue?: boolean;
  hasSubtasks?: boolean;
  isBlocked?: boolean;
  hasDependencies?: boolean;
};

export type TaskMetrics = {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  blockedTasks: number;
  averageCompletionTime: number;
  tasksByStatus: Record<TaskStatus, number>;
  tasksByPriority: Record<TaskPriority, number>;
  tasksByType: Record<TaskType, number>;
  totalEstimatedHours: number;
  totalActualHours: number;
  productivityRate: number;
  onTimeCompletionRate: number;
};

export type TaskAnalytics = {
  taskId: string;
  task: Task;
  timeline: {
    created: Date;
    started?: Date;
    completed?: Date;
    totalDuration?: number;
    timeInStatus: Record<TaskStatus, number>;
  };
  effort: {
    estimated: number;
    actual: number;
    variance: number;
    efficiency: number;
  };
  collaboration: {
    commentsCount: number;
    attachmentsCount: number;
    participantsCount: number;
    lastActivity: Date;
  };
  dependencies: {
    blockedBy: Task[];
    blocking: Task[];
    criticalPath: boolean;
  };
};

export type TaskBoard = {
  id: string;
  name: string;
  columns: {
    id: string;
    name: string;
    status: TaskStatus;
    tasks: TaskSummary[];
    wipLimit?: number;
  }[];
  filters: TaskFilters;
  groupBy?: 'assignee' | 'priority' | 'type' | 'project';
};

// Database table type definitions for Supabase
export interface TaskRow extends BaseEntity {
  title: string;
  description?: string;
  type: 'feature' | 'bug' | 'improvement' | 'documentation' | 'research' | 'maintenance' | 'testing' | 'deployment';
  status: 'todo' | 'in_progress' | 'review' | 'testing' | 'completed' | 'cancelled' | 'on_hold' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  project_id?: string;
  assignee_id?: string;
  reporter_id: string;
  parent_task_id?: string;
  milestone_id?: string;
  estimated_hours?: number;
  actual_hours: number;
  story_points?: number;
  due_date?: string;
  start_date?: string;
  completed_date?: string;
  tags: string[];
  labels: string[];
  dependencies: string[]; // Task IDs
  blockers: string[];
  acceptance_criteria: string[];
  comments: {
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    createdAt: string;
    updatedAt: string;
  }[];
  attachments: {
    id: string;
    filename: string;
    url: string;
    type: string;
    size: number;
    uploadedBy: string;
    uploadedAt: string;
  }[];
  time_entries: {
    id: string;
    employeeId: string;
    startTime: string;
    endTime?: string;
    duration?: number;
    description?: string;
    billable: boolean;
    createdAt: string;
  }[];
  custom_fields: Record<string, any>;
  created_by: string;
}

export interface TaskInsert extends Omit<TaskRow, 'id' | 'created_at' | 'updated_at'> {}
export interface TaskUpdate extends Partial<TaskInsert> {}

// Form validation helpers
export const validateTask = (data: unknown) => TaskSchema.safeParse(data);
export const validateCreateTask = (data: unknown) => CreateTaskSchema.safeParse(data);
export const validateUpdateTask = (data: unknown) => UpdateTaskSchema.safeParse(data);
export const validateTaskComment = (data: unknown) => TaskCommentSchema.safeParse(data);
export const validateTaskAttachment = (data: unknown) => TaskAttachmentSchema.safeParse(data);
export const validateTaskTimeEntry = (data: unknown) => TaskTimeEntrySchema.safeParse(data);
