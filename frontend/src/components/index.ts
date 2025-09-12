// ========================================
// ARISE HRM COMPONENT LIBRARY EXPORTS
// ========================================

// Layout Components
export { MainLayout } from './layout/MainLayout'

// Dashboard Components
export { default as CustomizableDashboard } from './dashboard/CustomizableDashboard'
// Removed unused components: DashboardCustomizer, DashboardPreferencesContext, StatsAnimated

// Employee Components
export { AdvancedEmployeeDirectory } from './employees/AdvancedEmployeeDirectory'
export { default as EmployeeManagement } from './employees/EmployeeManagement'
export { EmployeeCards } from './employees/EmployeeCards'
export { EmployeeDirectory } from './employees/EmployeeDirectory'

// Attendance Components
// Removed SmartAttendance - component deleted during cleanup

// Leave Management Components
export { LeaveManagementDashboard } from './leave/LeaveManagementDashboard'
export { LeaveBalanceTracker } from './leave/LeaveBalanceTracker'
export { TeamLeaveCalendar } from './leave/TeamLeaveCalendar'
export { LeaveAnalytics } from './leave/LeaveAnalytics'
export { LeaveRequestForm } from './leave/LeaveRequestForm'

// Payroll Components
export { PayrollDashboard } from './payroll/DashboardPayroll'

// Performance Components
// Removed PerformanceReviewDashboard - component deleted during cleanup

// Recruitment Components
export { RecruitmentDashboard } from './recruitment/RecruitmentDashboard'

// Training Components
export { TrainingDashboard } from './training/TrainingDashboard'

// Onboarding Components
export { OnboardingDashboard } from './onboarding/OnboardingDashboard'

// Benefits Components
export { BenefitsManagement } from './benefits/BenefitsManagement'

// Document Components
export { DocumentManagement } from './documents/DocumentManagement'

// Organization Components
export { OrganizationChart } from './organization/OrganizationChart'

// Self Service Components
export { EmployeeSelfService } from './selfservice/EmployeeSelfService'

// Analytics Components
export { AdvancedAnalyticsDashboard } from './analytics/AdvancedAnalyticsDashboard'

// Settings Components
export { default as SettingsDashboard } from './settings/SettingsDashboard'

// Admin Components
export { default as DatabaseAdminPanel } from './admin/DatabaseAdminPanel'
export { default as UserManagement } from './admin/UserManagement'

// Auth Components
export { AuthGuard } from './auth/AuthGuard'
export { default as LoginPage } from './auth/LoginPageSimple'
export { PasswordStrengthMeter } from './auth/PasswordStrengthMeter'
export { PermissionGuard } from './auth/PermissionGuard'

// Common Components
export { default as MetricCard } from './common/MetricCard'
export { default as StatusChip } from './common/StatusChip'
export { default as CountUp } from './common/CountUp'
export { default as NumberTicker } from './common/NumberTicker'
export { default as ErrorBoundary } from './common/ErrorBoundary'
export { default as ErrorBoundaryEnhanced } from './common/ErrorBoundaryEnhanced'
export { FormErrorBoundary, DataTableErrorBoundary, WidgetErrorBoundary, RouteErrorBoundary, APIErrorBoundary } from './common/ErrorBoundaryEnhanced'
export { AnimatedNotifications } from './common/AnimatedNotifications'
export { ResponsiveComponents } from './common/ResponsiveComponents'
export { ResponsiveContainer } from './common/ResponsiveContainer'
export { ResponsiveDialog } from './common/ResponsiveDialog'
export { ResponsiveTable } from './common/ResponsiveTable'
export { RLSNotice } from './common/RLSNotice'
export { ThemeToggle } from './common/ThemeToggle'

// Types
export type * from './common/types'

// Component Groups for Easier Imports
export const DashboardComponents = {
  CustomizableDashboard,
  // Removed unused components: DashboardCustomizer, AnimatedStats
}

export const EmployeeComponents = {
  AdvancedEmployeeDirectory,
  EmployeeManagement,
  EmployeeCards,
  EmployeeDirectory,
}

export const AttendanceComponents = {
  // SmartAttendance removed during cleanup
}

export const LeaveComponents = {
  LeaveManagementDashboard,
  LeaveBalanceTracker,
  TeamLeaveCalendar,
  LeaveAnalytics,
  LeaveRequestForm,
}

export const CommonComponents = {
  MetricCard,
  StatusChip,
  CountUp,
  NumberTicker,
  ErrorBoundary,
  AnimatedNotifications,
  ResponsiveComponents,
  ResponsiveContainer,
  ResponsiveDialog,
  ResponsiveTable,
  RLSNotice,
  ThemeToggle,
}

export const AuthComponents = {
  AuthGuard,
  LoginPage,
  PasswordStrengthMeter,
  PermissionGuard,
}

export const AdminComponents = {
  DatabaseAdminPanel,
  UserManagement,
  SettingsDashboard,
}

// Default export for convenience
export default {
  Dashboard: DashboardComponents,
  Employee: EmployeeComponents,
  Attendance: AttendanceComponents,
  Leave: LeaveComponents,
  Common: CommonComponents,
  Auth: AuthComponents,
  Admin: AdminComponents,
}