// Base types for leave management

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type LeavePriority = 'low' | 'medium' | 'high' | 'urgent';
export type ConflictLevel = 'none' | 'low' | 'medium' | 'high';

export interface EmployeeBasicInfo {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  profile_photo_url?: string;
  department: string;
  position: string;
}

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  description?: string;
  category: string;
  max_days_per_year?: number;
  max_days_per_period?: number;
  accrual_method: string;
  accrual_rate?: number;
  accrual_frequency: string;
  accrual_cap?: number;
  is_active: boolean;
  color_code: string;
  icon: string;
  display_order: number;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface LeaveRequest {
  id: string;
  request_number: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  start_period: string;
  end_period: string;
  start_time?: string;
  end_time?: string;
  total_days: number;
  business_days?: number;
  total_hours?: number;
  reason?: string;
  status: LeaveStatus;
  priority: LeavePriority;
  emergency_request: boolean;
  work_handover_completed: boolean;
  handover_notes?: string;
  coverage_arranged: boolean;
  created_at: string;
  updated_at: string;
  submitted_at: string;
  employee?: EmployeeBasicInfo;
  leave_type?: LeaveType;
}

export interface EmployeeLeaveBalance {
  id: string;
  employee_id: string;
  leave_type_id: string;
  current_balance: number;
  accrued_balance: number;
  used_balance: number;
  pending_balance: number;
  available_balance: number;
  last_accrual_date?: string;
  next_accrual_date?: string;
  carry_forward_balance: number;
  carry_forward_expiry_date?: string;
  created_at: string;
  updated_at: string;
  leave_type?: Pick<LeaveType, 'id' | 'name' | 'code' | 'color_code' | 'icon'>;
}

export interface LeaveStats {
  total_requests: number;
  pending_approvals: number;
  approved_requests: number;
  rejected_requests: number;
  team_utilization: number;
  average_leave_length: number;
  upcoming_leaves: number;
  critical_coverage: number;
}

export interface LeaveAnalyticsData {
  monthly_trends: Array<{
    month: string;
    requests: number;
    avg_duration: number;
  }>;
  leave_distribution: Array<{
    leave_type: string;
    count: number;
    percentage: number;
  }>;
  team_coverage: Array<{
    date: string;
    on_leave: number;
    available: number;
    coverage_percentage: number;
  }>;
}

export interface TeamLeaveEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  employee: EmployeeBasicInfo;
  leave_type: Pick<LeaveType, 'id' | 'name' | 'color_code'>;
  status: LeaveStatus;
  conflict_level: ConflictLevel;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}

// Form types
export interface LeaveRequestFormData {
  leave_type_id: string;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  reason: string;
  emergency_request: boolean;
  work_handover_completed: boolean;
  handover_notes?: string;
  coverage_arranged: boolean;
}

// Filter types
export interface LeaveRequestFilters {
  status?: LeaveStatus[];
  leave_type_id?: string[];
  start_date?: string;
  end_date?: string;
  employee_id?: string;
  department?: string;
}

// Pagination types
export interface PaginationParams {
  page: number;
  page_size: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// React Query key factories
export const leaveQueryKeys = {
  all: ['leave'] as const,
  lists: () => [...leaveQueryKeys.all, 'list'] as const,
  list: (filters: LeaveRequestFilters) =>
    [...leaveQueryKeys.lists(), { filters }] as const,
  details: () => [...leaveQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...leaveQueryKeys.details(), id] as const,
  balances: (employeeId: string) =>
    [...leaveQueryKeys.all, 'balances', employeeId] as const,
  analytics: (params: any) =>
    [...leaveQueryKeys.all, 'analytics', params] as const,
};
