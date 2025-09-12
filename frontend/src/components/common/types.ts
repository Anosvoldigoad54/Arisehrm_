// Component Types for Arise HRM Component Library
import { ReactNode } from 'react'
import { SxProps, Theme } from '@mui/material/styles'

// ========================================
// COMMON TYPES
// ========================================

export type StatusType = 
  | 'active' 
  | 'inactive' 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'completed' 
  | 'in_progress'
  | 'draft'
  | 'archived'

export type PriorityType = 'low' | 'medium' | 'high' | 'urgent'

export type SizeType = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type ColorType = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'error' 
  | 'warning' 
  | 'info'
  | 'default'

// ========================================
// COMPONENT PROP TYPES
// ========================================

export interface BaseComponentProps {
  sx?: SxProps<Theme>
  className?: string
}

export interface MetricCardProps extends BaseComponentProps {
  title: string
  value: string | number
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  icon?: ReactNode
  trend?: Array<{ label: string; value: number }>
  color?: ColorType
  size?: SizeType
  loading?: boolean
  onClick?: () => void
  footer?: ReactNode
}

export interface StatusChipProps extends BaseComponentProps {
  status: StatusType
  label?: string
  size?: SizeType
  variant?: 'filled' | 'outlined' | 'soft'
}

export interface DataTableColumn<T = any> {
  id: keyof T
  label: string
  minWidth?: number
  align?: 'left' | 'center' | 'right'
  format?: (value: any) => string | ReactNode
  sortable?: boolean
  filterable?: boolean
  resizable?: boolean
  sticky?: boolean
}

export interface DataTableProps<T = any> extends BaseComponentProps {
  columns: DataTableColumn<T>[]
  data: T[]
  loading?: boolean
  selectable?: boolean
  selectedRows?: T[]
  onSelectionChange?: (selected: T[]) => void
  onRowClick?: (row: T) => void
  onSort?: (column: keyof T, direction: 'asc' | 'desc') => void
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
  }
  filters?: Record<string, any>
  onFilterChange?: (filters: Record<string, any>) => void
  toolbar?: ReactNode
  emptyState?: ReactNode
  stickyHeader?: boolean
  virtualScroll?: boolean
  rowHeight?: number
  maxHeight?: number
}

export interface SearchInputProps extends BaseComponentProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
  debounceMs?: number
  size?: SizeType
  variant?: 'outlined' | 'filled' | 'standard'
  fullWidth?: boolean
  disabled?: boolean
  autoFocus?: boolean
  clearable?: boolean
  suggestions?: string[]
  onSuggestionSelect?: (suggestion: string) => void
}

export interface FilterDropdownProps extends BaseComponentProps {
  label: string
  options: Array<{ value: any; label: string; count?: number }>
  value?: any[]
  onChange?: (value: any[]) => void
  multiple?: boolean
  searchable?: boolean
  clearable?: boolean
  size?: SizeType
  placeholder?: string
  maxHeight?: number
}

export interface ActionButtonProps extends BaseComponentProps {
  variant?: 'contained' | 'outlined' | 'text'
  color?: ColorType
  size?: SizeType
  icon?: ReactNode
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  href?: string
  target?: string
  onClick?: () => void
  children: ReactNode
  tooltip?: string
  badge?: number | string
}

export interface LoadingOverlayProps extends BaseComponentProps {
  loading: boolean
  children: ReactNode
  message?: string
  backdrop?: boolean
  size?: SizeType
}

export interface EmptyStateProps extends BaseComponentProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  illustration?: string
  size?: SizeType
}

export interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  severity?: 'info' | 'warning' | 'error' | 'success'
  loading?: boolean
}

export interface PageHeaderProps extends BaseComponentProps {
  title: string
  subtitle?: string
  breadcrumbs?: Array<{ label: string; href?: string }>
  actions?: ReactNode
  tabs?: Array<{ label: string; value: string; count?: number }>
  activeTab?: string
  onTabChange?: (tab: string) => void
  background?: string | 'gradient'
}

export interface QuickActionsProps extends BaseComponentProps {
  actions: Array<{
    id: string
    label: string
    icon: ReactNode
    onClick: () => void
    badge?: number
    disabled?: boolean
    color?: ColorType
  }>
  open: boolean
  onClose: () => void
  onOpen: () => void
  trigger?: ReactNode
}

export interface NotificationCenterProps extends BaseComponentProps {
  notifications: Array<{
    id: string
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
    timestamp: string
    read: boolean
    actions?: Array<{ label: string; onClick: () => void }>
  }>
  open: boolean
  onClose: () => void
  onNotificationClick?: (notification: any) => void
  onMarkAsRead?: (notificationId: string) => void
  onMarkAllAsRead?: () => void
  onClearAll?: () => void
  maxHeight?: number
}

export interface UserAvatarProps extends BaseComponentProps {
  user: {
    id?: string
    name: string
    email?: string
    avatar?: string
    role?: string
    status?: 'online' | 'offline' | 'away' | 'busy'
  }
  size?: SizeType
  showStatus?: boolean
  clickable?: boolean
  onClick?: () => void
  badge?: number | string
  tooltip?: boolean
}

export interface ProgressIndicatorProps extends BaseComponentProps {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  color?: ColorType
  size?: SizeType
  variant?: 'linear' | 'circular'
  animated?: boolean
}

export interface TimeAgoProps extends BaseComponentProps {
  date: string | Date
  format?: 'relative' | 'absolute' | 'both'
  updateInterval?: number
  tooltip?: boolean
}

export interface CountUpProps extends BaseComponentProps {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  separator?: string
  onComplete?: () => void
}

export interface GradientBackgroundProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'aurora' | 'sunset' | 'ocean' | 'custom'
  opacity?: number
  animate?: boolean
  overlay?: boolean
  children?: ReactNode
}

export interface GlassCardProps extends BaseComponentProps {
  children: ReactNode
  blur?: number
  opacity?: number
  variant?: 'light' | 'dark' | 'auto'
  border?: boolean
  shadow?: boolean
  hover?: boolean
  padding?: number | string
}

// ========================================
// UTILITY TYPES
// ========================================

export interface Employee {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  department: string
  position: string
  manager?: string
  startDate: string
  status: 'active' | 'inactive' | 'on_leave' | 'terminated'
  salary?: number
  location?: string
  skills?: string[]
  performance?: {
    rating: number
    lastReview: string
  }
}

export interface AttendanceRecord {
  id: string
  employeeId: string
  date: string
  checkIn?: string
  checkOut?: string
  breakDuration?: number
  totalHours?: number
  status: 'present' | 'absent' | 'late' | 'half_day' | 'holiday'
  location?: {
    latitude: number
    longitude: number
    address: string
  }
  notes?: string
}

export interface LeaveRequest {
  id: string
  employeeId: string
  type: 'sick' | 'vacation' | 'personal' | 'maternity' | 'emergency'
  startDate: string
  endDate: string
  days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  appliedDate: string
  approvedBy?: string
  approvedDate?: string
  rejectionReason?: string
  documents?: string[]
}

export interface Department {
  id: string
  name: string
  code: string
  manager: string
  employeeCount: number
  budget: number
  description?: string
  location?: string
}

export interface PayrollRecord {
  id: string
  employeeId: string
  period: string
  basicSalary: number
  allowances: Record<string, number>
  deductions: Record<string, number>
  grossSalary: number
  netSalary: number
  tax: number
  status: 'draft' | 'processed' | 'paid'
  payDate?: string
}
