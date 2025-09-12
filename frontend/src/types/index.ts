// ========================================
// ARISE HRM - CORE TYPE DEFINITIONS
// ========================================

export * from './auth'
export * from './database'
export * from './permissions'
export * from './supabase'

// Common utility types
export type UUID = string
export type DateString = string
export type TimeString = string
export type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue }

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  code?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  count: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// Common status types
export type Status = 'active' | 'inactive' | 'pending' | 'suspended' | 'terminated'
export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

// Employment types
export type EmploymentStatus = 'active' | 'inactive' | 'terminated' | 'on_leave' | 'probation'
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern' | 'consultant'
export type WorkLocation = 'office' | 'remote' | 'hybrid' | 'field'

// Attendance types
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'early_departure' | 'on_leave' | 'holiday'
export type ClockStatus = 'clocked_in' | 'clocked_out' | 'break' | 'lunch'

// Leave types
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'taken'
export type LeaveType = 'annual' | 'sick' | 'maternity' | 'paternity' | 'emergency' | 'unpaid'

// Performance types
export type PerformanceRating = 'outstanding' | 'exceeds' | 'meets' | 'below' | 'unsatisfactory'
export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'overdue' | 'cancelled'

// Common interface patterns
export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
  metadata?: Record<string, any>
}

export interface NamedEntity extends BaseEntity {
  name: string
  description?: string
  is_active: boolean
}

export interface AuditableEntity extends BaseEntity {
  version: number
  audit_log?: AuditLogEntry[]
}

export interface AuditLogEntry {
  id: string
  entity_type: string
  entity_id: string
  action: 'create' | 'update' | 'delete' | 'view'
  changes?: Record<string, { old: any; new: any }>
  user_id: string
  timestamp: string
  ip_address?: string
  user_agent?: string
}

// Form and validation types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'multiselect' | 'textarea' | 'checkbox' | 'file'
  required: boolean
  placeholder?: string
  options?: { label: string; value: any }[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    custom?: (value: any) => string | null
  }
}

export interface FormState {
  values: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  isSubmitting: boolean
  isValid: boolean
}

// Notification types
export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
  actions?: NotificationAction[]
}

export interface NotificationAction {
  label: string
  action: string
  variant?: 'primary' | 'secondary'
}

// Dashboard widget types
export interface DashboardWidget {
  id: string
  type: 'metric' | 'chart' | 'table' | 'calendar' | 'list' | 'custom'
  title: string
  size: 'small' | 'medium' | 'large' | 'full'
  position: { x: number; y: number; w: number; h: number }
  config: Record<string, any>
  permissions: string[]
}

// Filter and search types
export interface FilterOption {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'not_in' | 'between'
  value: any
  label?: string
}

export interface SortOption {
  field: string
  direction: 'asc' | 'desc'
  label?: string
}

export interface SearchParams {
  query?: string
  filters?: FilterOption[]
  sort?: SortOption[]
  page?: number
  limit?: number
}
