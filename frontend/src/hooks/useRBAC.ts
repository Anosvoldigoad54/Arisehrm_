// ========================================
// ARISE HRM - FRONTEND RBAC GUARDS HOOK
// ========================================
// React hook for permission checking and UI guards
// Maps directly to Supabase RLS policies

import React, { useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  RBAC_MATRIX, 
  RoleName, 
  ScopeLevel, 
  hasPermission, 
  getPermissionScope,
  getPermissionConditions,
  getPermissionRestrictions,
  getRoleLevel,
  canRoleAccessRole
} from '../types/rbac-matrix'

export interface RBACContext {
  userRole: RoleName | null
  userLevel: number
  userId: string | null
  departmentId: string | null
  teamId: string | null
  managerId: string | null
}

export interface PermissionCheck {
  allowed: boolean
  scope: ScopeLevel
  conditions: string[]
  restrictions: string[]
  reason?: string
}

// ========================================
// MAIN RBAC HOOK
// ========================================

export function useRBAC() {
  const { user, profile } = useAuth()

  const rbacContext: RBACContext = useMemo(() => ({
    userRole: profile?.role as RoleName || null,
    userLevel: profile?.role ? getRoleLevel(profile.role as RoleName) : 0,
    userId: user?.id || null,
    departmentId: profile?.department_id || null,
    teamId: profile?.team_id || null,
    managerId: profile?.manager_id || null
  }), [user, profile])

  // ========================================
  // PERMISSION CHECKING FUNCTIONS
  // ========================================

  const checkPermission = (permission: string, targetScope?: ScopeLevel): PermissionCheck => {
    if (!rbacContext.userRole) {
      return {
        allowed: false,
        scope: 'NONE',
        conditions: [],
        restrictions: [],
        reason: 'User not authenticated'
      }
    }

    const allowed = hasPermission(rbacContext.userRole, permission, targetScope)
    const scope = getPermissionScope(rbacContext.userRole, permission)
    const conditions = getPermissionConditions(rbacContext.userRole, permission)
    const restrictions = getPermissionRestrictions(rbacContext.userRole, permission)

    return {
      allowed,
      scope,
      conditions,
      restrictions,
      reason: allowed ? undefined : `Insufficient permissions for ${permission}`
    }
  }

  const canAccess = (permission: string, targetScope?: ScopeLevel): boolean => {
    return checkPermission(permission, targetScope).allowed
  }

  const canAccessRole = (targetRole: RoleName): boolean => {
    if (!rbacContext.userRole) return false
    return canRoleAccessRole(rbacContext.userRole, targetRole)
  }

  // ========================================
  // SCOPE-BASED PERMISSION CHECKS
  // ========================================

  const canAccessOwnData = (permission: string): boolean => {
    const check = checkPermission(permission, 'OWN')
    return check.allowed && ['OWN', 'TEAM', 'DEPARTMENT', 'ALL', 'SYSTEM'].includes(check.scope)
  }

  const canAccessTeamData = (permission: string): boolean => {
    const check = checkPermission(permission, 'TEAM')
    return check.allowed && ['TEAM', 'DEPARTMENT', 'ALL', 'SYSTEM'].includes(check.scope)
  }

  const canAccessDepartmentData = (permission: string): boolean => {
    const check = checkPermission(permission, 'DEPARTMENT')
    return check.allowed && ['DEPARTMENT', 'ALL', 'SYSTEM'].includes(check.scope)
  }

  const canAccessAllData = (permission: string): boolean => {
    const check = checkPermission(permission, 'ALL')
    return check.allowed && ['ALL', 'SYSTEM'].includes(check.scope)
  }

  const canAccessSystemData = (permission: string): boolean => {
    const check = checkPermission(permission, 'SYSTEM')
    return check.allowed && check.scope === 'SYSTEM'
  }

  // ========================================
  // FEATURE-SPECIFIC PERMISSION CHECKS
  // ========================================

  const dashboard = {
    canView: () => canAccess('dashboard.view'),
    canCustomize: () => canAccess('dashboard.customize'),
    getViewScope: () => getPermissionScope(rbacContext.userRole!, 'dashboard.view')
  }

  const employees = {
    canView: (scope?: ScopeLevel) => canAccess('employees.view', scope),
    canCreate: () => canAccess('employees.create'),
    canEdit: (scope?: ScopeLevel) => canAccess('employees.edit', scope),
    canDelete: () => canAccess('employees.delete'),
    canImport: () => canAccess('employees.import'),
    canExport: () => canAccess('employees.export'),
    getViewScope: () => getPermissionScope(rbacContext.userRole!, 'employees.view')
  }

  const attendance = {
    canClockInOut: () => canAccess('attendance.clock_in_out'),
    canViewRecords: (scope?: ScopeLevel) => canAccess('attendance.view_records', scope),
    canApproveCorrect: (scope?: ScopeLevel) => canAccess('attendance.approve_correct', scope),
    getViewScope: () => getPermissionScope(rbacContext.userRole!, 'attendance.view_records')
  }

  const leave = {
    canApplyRequest: () => canAccess('leave.apply_request'),
    canApprove: (scope?: ScopeLevel) => canAccess('leave.approve', scope),
    canManagePolicies: () => canAccess('leave.manage_policies'),
    getApprovalScope: () => getPermissionScope(rbacContext.userRole!, 'leave.approve')
  }

  const payroll = {
    canViewSalary: (scope?: ScopeLevel) => canAccess('payroll.view_salary', scope),
    canProcess: () => canAccess('payroll.process'),
    canApprove: () => canAccess('payroll.approve'),
    canManageSettings: () => canAccess('payroll.settings_mgmt'),
    getViewScope: () => getPermissionScope(rbacContext.userRole!, 'payroll.view_salary')
  }

  const performance = {
    canManageSelfGoals: () => canAccess('performance.self_goals'),
    canConductReviews: (scope?: ScopeLevel) => canAccess('performance.reviews', scope),
    canSetGoals: (scope?: ScopeLevel) => canAccess('performance.goal_setting', scope),
    getReviewScope: () => getPermissionScope(rbacContext.userRole!, 'performance.reviews')
  }

  const reports = {
    canView: (scope?: ScopeLevel) => canAccess('reports.view', scope),
    canCreateCustom: (scope?: ScopeLevel) => canAccess('reports.create_custom', scope),
    getViewScope: () => getPermissionScope(rbacContext.userRole!, 'reports.view')
  }

  const documents = {
    canAccess: (scope?: ScopeLevel) => canAccess('documents.access', scope),
    getAccessScope: () => getPermissionScope(rbacContext.userRole!, 'documents.access')
  }

  const training = {
    canAccess: (scope?: ScopeLevel) => canAccess('training.access', scope),
    getAccessScope: () => getPermissionScope(rbacContext.userRole!, 'training.access')
  }

  const compliance = {
    canView: () => canAccess('compliance.view'),
    canManage: () => canAccess('compliance.manage'),
    getViewScope: () => getPermissionScope(rbacContext.userRole!, 'compliance.view')
  }

  const organizationChart = {
    canView: (scope?: ScopeLevel) => canAccess('organization_chart.view', scope),
    canEdit: (scope?: ScopeLevel) => canAccess('organization_chart.edit', scope),
    getViewScope: () => getPermissionScope(rbacContext.userRole!, 'organization_chart.view')
  }

  const messaging = {
    canSendInternal: (scope?: ScopeLevel) => canAccess('messaging.internal', scope),
    getMessagingScope: () => getPermissionScope(rbacContext.userRole!, 'messaging.internal')
  }

  const announcements = {
    canView: () => canAccess('announcements.view'),
    canCreate: (scope?: ScopeLevel) => canAccess('announcements.create', scope),
    getCreateScope: () => getPermissionScope(rbacContext.userRole!, 'announcements.create')
  }

  const system = {
    canManageSettings: () => canAccess('system.settings'),
    getSettingsScope: () => getPermissionScope(rbacContext.userRole!, 'system.settings')
  }

  const userManagement = {
    canManageUsers: () => canAccess('user.management'),
    getManagementScope: () => getPermissionScope(rbacContext.userRole!, 'user.management')
  }

  const audit = {
    canViewSecurityLogs: () => canAccess('audit.security_logs'),
    getAuditScope: () => getPermissionScope(rbacContext.userRole!, 'audit.security_logs')
  }

  // ========================================
  // ROLE-BASED UI HELPERS
  // ========================================

  const isIntern = rbacContext.userLevel === 20
  const isEmployee = rbacContext.userLevel === 40
  const isSeniorEmployee = rbacContext.userLevel === 50
  const isTeamLead = rbacContext.userLevel === 60
  const isDepartmentManager = rbacContext.userLevel === 70
  const isHRManager = rbacContext.userLevel === 80
  const isAdmin = rbacContext.userLevel === 90
  const isSuperAdmin = rbacContext.userLevel === 100

  const isManagerLevel = rbacContext.userLevel >= 60
  const isHRLevel = rbacContext.userLevel >= 80
  const isAdminLevel = rbacContext.userLevel >= 90

  // ========================================
  // NAVIGATION MENU HELPERS
  // ========================================

  const getNavigationItems = () => {
    const items = []

    // Dashboard - available to all
    if (dashboard.canView()) {
      items.push({ key: 'dashboard', label: 'Dashboard', path: '/dashboard' })
    }

    // Employee Management
    if (employees.canView()) {
      const label = isHRLevel ? 'Employee Management' : 
                   isManagerLevel ? 'My Team' : 'My Profile'
      items.push({ key: 'employees', label, path: '/employees' })
    }

    // Attendance
    if (attendance.canViewRecords()) {
      items.push({ key: 'attendance', label: 'Attendance', path: '/attendance' })
    }

    // Leave Management
    if (leave.canApplyRequest()) {
      const label = leave.canApprove() ? 'Leave Management' : 'Leave Requests'
      items.push({ key: 'leave', label, path: '/leave' })
    }

    // Payroll
    if (payroll.canViewSalary()) {
      const label = payroll.canProcess() ? 'Payroll Management' : 'My Payroll'
      items.push({ key: 'payroll', label, path: '/payroll' })
    }

    // Performance
    if (performance.canManageSelfGoals()) {
      const label = performance.canConductReviews() ? 'Performance Management' : 'My Performance'
      items.push({ key: 'performance', label, path: '/performance' })
    }

    // Reports
    if (reports.canView()) {
      items.push({ key: 'reports', label: 'Reports', path: '/reports' })
    }

    // Training
    if (training.canAccess()) {
      const label = isIntern ? 'Learning' : 'Training'
      items.push({ key: 'training', label, path: '/training' })
    }

    // Documents
    if (documents.canAccess()) {
      items.push({ key: 'documents', label: 'Documents', path: '/documents' })
    }

    // HR-specific items
    if (isHRLevel) {
      items.push(
        { key: 'recruitment', label: 'Recruitment', path: '/recruitment' },
        { key: 'benefits', label: 'Benefits', path: '/benefits' }
      )
    }

    // Admin-specific items
    if (isAdminLevel) {
      items.push(
        { key: 'admin', label: 'Admin Panel', path: '/admin' },
        { key: 'settings', label: 'Settings', path: '/settings' }
      )
    }

    // Compliance
    if (compliance.canView()) {
      items.push({ key: 'compliance', label: 'Compliance', path: '/compliance' })
    }

    return items
  }

  // Missing method that EmployeeManagementInterface needs
  const hasMinimumLevel = (minimumLevel: number): boolean => {
    return rbacContext.userLevel >= minimumLevel
  }

  return {
    // Context
    context: rbacContext,
    
    // Core permission functions
    checkPermission,
    canAccess,
    canAccessRole,
    hasMinimumLevel,
    
    // Scope-based checks
    canAccessOwnData,
    canAccessTeamData,
    canAccessDepartmentData,
    canAccessAllData,
    canAccessSystemData,
    
    // Feature-specific permissions
    dashboard,
    employees,
    attendance,
    leave,
    payroll,
    performance,
    reports,
    documents,
    training,
    compliance,
    organizationChart,
    messaging,
    announcements,
    system,
    user: userManagement,
    audit,
    
    // Role checks
    isIntern,
    isEmployee,
    isSeniorEmployee,
    isTeamLead,
    isDepartmentManager,
    isHRManager,
    isAdmin,
    isSuperAdmin,
    isManagerLevel,
    isHRLevel,
    isAdminLevel,
    
    // UI helpers
    getNavigationItems
  }
}

// ========================================
// PERMISSION GUARD COMPONENTS
// ========================================

interface PermissionGuardProps {
  permission: string
  scope?: ScopeLevel
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGuard({ 
  permission, 
  scope, 
  fallback = null, 
  children 
}: PermissionGuardProps) {
  const { canAccess } = useRBAC()
  
  if (!canAccess(permission, scope)) {
    return fallback as React.ReactElement
  }
  
  return children as React.ReactElement
}

interface RoleGuardProps {
  roles: RoleName[]
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function RoleGuard({ roles, fallback = null, children }: RoleGuardProps) {
  const { context } = useRBAC()
  
  if (!context.userRole || !roles.includes(context.userRole)) {
    return fallback as React.ReactElement
  }
  
  return children as React.ReactElement
}

interface MinimumLevelGuardProps {
  minimumLevel: number
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function MinimumLevelGuard({ 
  minimumLevel, 
  fallback = null, 
  children 
}: MinimumLevelGuardProps) {
  const { context } = useRBAC()
  
  if (context.userLevel < minimumLevel) {
    return fallback as React.ReactElement
  }
  
  return children as React.ReactElement
}

// ========================================
// UTILITY HOOKS
// ========================================

export function usePermissionCheck(permission: string, scope?: ScopeLevel) {
  const { checkPermission } = useRBAC()
  return useMemo(() => checkPermission(permission, scope), [permission, scope])
}

export function useRoleCheck(targetRole: RoleName) {
  const { canAccessRole } = useRBAC()
  return useMemo(() => canAccessRole(targetRole), [targetRole])
}

export function useNavigationItems() {
  const { getNavigationItems } = useRBAC()
  return useMemo(() => getNavigationItems(), [])
}
