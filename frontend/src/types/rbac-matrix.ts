// ========================================
// ARISE HRM - IMPLEMENTATION-READY RBAC MATRIX
// ========================================
// Granular permission matrix with scope levels for all 8 roles
// Maps directly to Supabase RLS policies and frontend guards

export type ScopeLevel = 'NONE' | 'OWN' | 'TEAM' | 'DEPARTMENT' | 'ALL' | 'SYSTEM'

export type RoleLevel = 20 | 40 | 50 | 60 | 70 | 80 | 90 | 100

export type RoleName = 
  | 'intern' 
  | 'employee' 
  | 'senior_employee' 
  | 'team_lead' 
  | 'department_manager' 
  | 'hr_manager' 
  | 'admin' 
  | 'super_admin'

export interface PermissionScope {
  scope: ScopeLevel
  conditions?: string[]
  restrictions?: string[]
}

export interface RolePermissions {
  level: RoleLevel
  name: RoleName
  displayName: string
  permissions: Record<string, PermissionScope>
}

// ========================================
// COMPLETE RBAC PERMISSION MATRIX
// ========================================

export const RBAC_MATRIX: Record<RoleName, RolePermissions> = {
  // INTERN (Level 20) - Limited access for learning and basic tasks
  intern: {
    level: 20,
    name: 'intern',
    displayName: 'Intern',
    permissions: {
      // Dashboard
      'dashboard.view': { scope: 'OWN', restrictions: ['basic_widgets_only'] },
      'dashboard.customize': { scope: 'NONE' },
      
      // Employee Management
      'employees.view': { scope: 'OWN' },
      'employees.create': { scope: 'NONE' },
      'employees.edit': { scope: 'OWN', restrictions: ['limited_fields', 'no_sensitive_data'] },
      'employees.delete': { scope: 'NONE' },
      'employees.import': { scope: 'NONE' },
      'employees.export': { scope: 'NONE' },
      
      // Attendance
      'attendance.clock_in_out': { scope: 'OWN' },
      'attendance.view_records': { scope: 'OWN' },
      'attendance.approve_correct': { scope: 'NONE' },
      
      // Leave Management
      'leave.apply_request': { scope: 'OWN', restrictions: ['limited_types', 'max_days_per_request'] },
      'leave.approve': { scope: 'NONE' },
      'leave.manage_policies': { scope: 'NONE' },
      
      // Payroll
      'payroll.view_salary': { scope: 'NONE' },
      'payroll.process': { scope: 'NONE' },
      'payroll.approve': { scope: 'NONE' },
      'payroll.settings_mgmt': { scope: 'NONE' },
      
      // Performance
      'performance.self_goals': { scope: 'OWN' },
      'performance.reviews': { scope: 'OWN', restrictions: ['feedback_only'] },
      'performance.goal_setting': { scope: 'NONE' },
      
      // Reports
      'reports.view': { scope: 'NONE' },
      'reports.create_custom': { scope: 'NONE' },
      
      // Documents & Training
      'documents.access': { scope: 'OWN', restrictions: ['intern_guide_only'] },
      'training.access': { scope: 'OWN', restrictions: ['intern_track_only'] },
      
      // Compliance & Organization
      'compliance.view': { scope: 'OWN', restrictions: ['basic_policy_only'] },
      'compliance.manage': { scope: 'NONE' },
      'organization_chart.view': { scope: 'TEAM', restrictions: ['team_dept_only'] },
      'organization_chart.edit': { scope: 'NONE' },
      
      // Communication
      'messaging.internal': { scope: 'TEAM', restrictions: ['team_only'] },
      'announcements.view': { scope: 'OWN', restrictions: ['view_only'] },
      'announcements.create': { scope: 'NONE' },
      
      // System & Security
      'system.settings': { scope: 'NONE' },
      'user.management': { scope: 'NONE' },
      'audit.security_logs': { scope: 'NONE' }
    }
  },

  // EMPLOYEE (Level 40) - Standard self-service access
  employee: {
    level: 40,
    name: 'employee',
    displayName: 'Employee',
    permissions: {
      // Dashboard
      'dashboard.view': { scope: 'OWN' },
      'dashboard.customize': { scope: 'OWN', restrictions: ['limited_widgets'] },
      
      // Employee Management
      'employees.view': { scope: 'OWN' },
      'employees.create': { scope: 'NONE' },
      'employees.edit': { scope: 'OWN', restrictions: ['limited_fields', 'no_salary_data'] },
      'employees.delete': { scope: 'NONE' },
      'employees.import': { scope: 'NONE' },
      'employees.export': { scope: 'NONE' },
      
      // Attendance
      'attendance.clock_in_out': { scope: 'OWN' },
      'attendance.view_records': { scope: 'OWN' },
      'attendance.approve_correct': { scope: 'OWN', restrictions: ['request_only'] },
      
      // Leave Management
      'leave.apply_request': { scope: 'OWN' },
      'leave.approve': { scope: 'NONE' },
      'leave.manage_policies': { scope: 'NONE' },
      
      // Payroll
      'payroll.view_salary': { scope: 'OWN' },
      'payroll.process': { scope: 'NONE' },
      'payroll.approve': { scope: 'NONE' },
      'payroll.settings_mgmt': { scope: 'NONE' },
      
      // Performance
      'performance.self_goals': { scope: 'OWN' },
      'performance.reviews': { scope: 'OWN', restrictions: ['feedback_and_receive'] },
      'performance.goal_setting': { scope: 'OWN', restrictions: ['self_only'] },
      
      // Reports
      'reports.view': { scope: 'OWN', restrictions: ['own_data_only'] },
      'reports.create_custom': { scope: 'NONE' },
      
      // Documents & Training
      'documents.access': { scope: 'OWN', restrictions: ['personal_docs'] },
      'training.access': { scope: 'OWN', restrictions: ['assigned_only'] },
      
      // Compliance & Organization
      'compliance.view': { scope: 'OWN', restrictions: ['general_policy'] },
      'compliance.manage': { scope: 'NONE' },
      'organization_chart.view': { scope: 'TEAM', restrictions: ['team_dept_only'] },
      'organization_chart.edit': { scope: 'NONE' },
      
      // Communication
      'messaging.internal': { scope: 'DEPARTMENT', restrictions: ['dept_channels'] },
      'announcements.view': { scope: 'OWN', restrictions: ['view_only'] },
      'announcements.create': { scope: 'NONE' },
      
      // System & Security
      'system.settings': { scope: 'NONE' },
      'user.management': { scope: 'NONE' },
      'audit.security_logs': { scope: 'NONE' }
    }
  },

  // SENIOR EMPLOYEE (Level 50) - Enhanced access with mentoring capabilities
  senior_employee: {
    level: 50,
    name: 'senior_employee',
    displayName: 'Senior Employee',
    permissions: {
      // Dashboard
      'dashboard.view': { scope: 'OWN', conditions: ['mentorship_widgets'] },
      'dashboard.customize': { scope: 'OWN', conditions: ['own_and_team_widgets'] },
      
      // Employee Management
      'employees.view': { scope: 'OWN', conditions: ['plus_mentees'] },
      'employees.create': { scope: 'NONE' },
      'employees.edit': { scope: 'OWN', conditions: ['own_plus_mentees'] },
      'employees.delete': { scope: 'NONE' },
      'employees.import': { scope: 'NONE' },
      'employees.export': { scope: 'NONE' },
      
      // Attendance
      'attendance.clock_in_out': { scope: 'OWN' },
      'attendance.view_records': { scope: 'OWN', conditions: ['plus_mentees'] },
      'attendance.approve_correct': { scope: 'OWN', conditions: ['request_plus_mentor'] },
      
      // Leave Management
      'leave.apply_request': { scope: 'OWN', conditions: ['plus_mentees'] },
      'leave.approve': { scope: 'NONE' },
      'leave.manage_policies': { scope: 'NONE' },
      
      // Payroll
      'payroll.view_salary': { scope: 'OWN', conditions: ['plus_mentees'] },
      'payroll.process': { scope: 'NONE' },
      'payroll.approve': { scope: 'NONE' },
      'payroll.settings_mgmt': { scope: 'NONE' },
      
      // Performance
      'performance.self_goals': { scope: 'OWN', conditions: ['plus_mentees'] },
      'performance.reviews': { scope: 'OWN', conditions: ['review_mentees'] },
      'performance.goal_setting': { scope: 'OWN', conditions: ['self_plus_mentees'] },
      
      // Reports
      'reports.view': { scope: 'DEPARTMENT', restrictions: ['summaries_only'] },
      'reports.create_custom': { scope: 'NONE' },
      
      // Documents & Training
      'documents.access': { scope: 'OWN', conditions: ['personal_plus_mentorship'] },
      'training.access': { scope: 'OWN', conditions: ['advanced_plus_mentor'] },
      
      // Compliance & Organization
      'compliance.view': { scope: 'OWN', restrictions: ['general_policy'] },
      'compliance.manage': { scope: 'NONE' },
      'organization_chart.view': { scope: 'DEPARTMENT', conditions: ['enhanced_view'] },
      'organization_chart.edit': { scope: 'NONE' },
      
      // Communication
      'messaging.internal': { scope: 'DEPARTMENT', conditions: ['dept_plus_mentorship'] },
      'announcements.view': { scope: 'OWN', conditions: ['view_plus_shareable'] },
      'announcements.create': { scope: 'NONE' },
      
      // System & Security
      'system.settings': { scope: 'NONE' },
      'user.management': { scope: 'NONE' },
      'audit.security_logs': { scope: 'NONE' }
    }
  },

  // TEAM LEAD (Level 60) - Team management and approval authority
  team_lead: {
    level: 60,
    name: 'team_lead',
    displayName: 'Team Lead',
    permissions: {
      // Dashboard
      'dashboard.view': { scope: 'TEAM' },
      'dashboard.customize': { scope: 'TEAM', restrictions: ['team_widgets'] },
      
      // Employee Management
      'employees.view': { scope: 'TEAM' },
      'employees.create': { scope: 'TEAM', restrictions: ['limited_team_assign'] },
      'employees.edit': { scope: 'TEAM', restrictions: ['team_only'] },
      'employees.delete': { scope: 'NONE' },
      'employees.import': { scope: 'NONE' },
      'employees.export': { scope: 'NONE' },
      
      // Attendance
      'attendance.clock_in_out': { scope: 'OWN', conditions: ['approve_team'] },
      'attendance.view_records': { scope: 'TEAM' },
      'attendance.approve_correct': { scope: 'TEAM' },
      
      // Leave Management
      'leave.apply_request': { scope: 'TEAM', conditions: ['own_plus_recommend'] },
      'leave.approve': { scope: 'TEAM' },
      'leave.manage_policies': { scope: 'NONE' },
      
      // Payroll
      'payroll.view_salary': { scope: 'TEAM', restrictions: ['summary_only'] },
      'payroll.process': { scope: 'NONE' },
      'payroll.approve': { scope: 'NONE' },
      'payroll.settings_mgmt': { scope: 'NONE' },
      
      // Performance
      'performance.self_goals': { scope: 'TEAM' },
      'performance.reviews': { scope: 'TEAM', restrictions: ['team_reviews'] },
      'performance.goal_setting': { scope: 'TEAM' },
      
      // Reports
      'reports.view': { scope: 'TEAM', restrictions: ['team_metrics'] },
      'reports.create_custom': { scope: 'TEAM', restrictions: ['limited_scope'] },
      
      // Documents & Training
      'documents.access': { scope: 'TEAM', restrictions: ['team_docs'] },
      'training.access': { scope: 'TEAM', restrictions: ['team_training'] },
      
      // Compliance & Organization
      'compliance.view': { scope: 'DEPARTMENT', restrictions: ['dept_policy'] },
      'compliance.manage': { scope: 'NONE' },
      'organization_chart.view': { scope: 'TEAM' },
      'organization_chart.edit': { scope: 'TEAM', restrictions: ['team_assign'] },
      
      // Communication
      'messaging.internal': { scope: 'TEAM' },
      'announcements.view': { scope: 'TEAM', conditions: ['team_create'] },
      'announcements.create': { scope: 'TEAM' },
      
      // System & Security
      'system.settings': { scope: 'NONE' },
      'user.management': { scope: 'NONE' },
      'audit.security_logs': { scope: 'NONE' }
    }
  },

  // DEPARTMENT MANAGER (Level 70) - Department-wide authority
  department_manager: {
    level: 70,
    name: 'department_manager',
    displayName: 'Department Manager',
    permissions: {
      // Dashboard
      'dashboard.view': { scope: 'DEPARTMENT' },
      'dashboard.customize': { scope: 'DEPARTMENT', restrictions: ['dept_widgets'] },
      
      // Employee Management
      'employees.view': { scope: 'DEPARTMENT' },
      'employees.create': { scope: 'DEPARTMENT', restrictions: ['limited'] },
      'employees.edit': { scope: 'DEPARTMENT' },
      'employees.delete': { scope: 'NONE' },
      'employees.import': { scope: 'NONE' },
      'employees.export': { scope: 'NONE' },
      
      // Attendance
      'attendance.clock_in_out': { scope: 'OWN', conditions: ['approve_dept'] },
      'attendance.view_records': { scope: 'DEPARTMENT' },
      'attendance.approve_correct': { scope: 'DEPARTMENT' },
      
      // Leave Management
      'leave.apply_request': { scope: 'DEPARTMENT', conditions: ['endorse'] },
      'leave.approve': { scope: 'DEPARTMENT' },
      'leave.manage_policies': { scope: 'NONE' },
      
      // Payroll
      'payroll.view_salary': { scope: 'DEPARTMENT', restrictions: ['summary'] },
      'payroll.process': { scope: 'NONE' },
      'payroll.approve': { scope: 'NONE' },
      'payroll.settings_mgmt': { scope: 'NONE' },
      
      // Performance
      'performance.self_goals': { scope: 'DEPARTMENT', restrictions: ['dept_goals'] },
      'performance.reviews': { scope: 'DEPARTMENT', restrictions: ['dept_reviews'] },
      'performance.goal_setting': { scope: 'DEPARTMENT' },
      
      // Reports
      'reports.view': { scope: 'DEPARTMENT', restrictions: ['dept_reports'] },
      'reports.create_custom': { scope: 'DEPARTMENT', restrictions: ['dept_scope'] },
      
      // Documents & Training
      'documents.access': { scope: 'DEPARTMENT', restrictions: ['dept_docs'] },
      'training.access': { scope: 'DEPARTMENT', restrictions: ['dept_training'] },
      
      // Compliance & Organization
      'compliance.view': { scope: 'DEPARTMENT', conditions: ['plus_compliance'] },
      'compliance.manage': { scope: 'NONE' },
      'organization_chart.view': { scope: 'DEPARTMENT' },
      'organization_chart.edit': { scope: 'DEPARTMENT', restrictions: ['dept_structure'] },
      
      // Communication
      'messaging.internal': { scope: 'DEPARTMENT', conditions: ['plus_cross_team'] },
      'announcements.view': { scope: 'DEPARTMENT', conditions: ['dept_create'] },
      'announcements.create': { scope: 'DEPARTMENT' },
      
      // System & Security
      'system.settings': { scope: 'NONE' },
      'user.management': { scope: 'NONE' },
      'audit.security_logs': { scope: 'NONE' }
    }
  },

  // HR MANAGER (Level 80) - Enterprise HR control
  hr_manager: {
    level: 80,
    name: 'hr_manager',
    displayName: 'HR Manager',
    permissions: {
      // Dashboard
      'dashboard.view': { scope: 'ALL', restrictions: ['hr_dashboards'] },
      'dashboard.customize': { scope: 'ALL', restrictions: ['hr_widgets'] },
      
      // Employee Management
      'employees.view': { scope: 'ALL' },
      'employees.create': { scope: 'ALL' },
      'employees.edit': { scope: 'ALL' },
      'employees.delete': { scope: 'ALL', restrictions: ['inactive_only'] },
      'employees.import': { scope: 'ALL', restrictions: ['import_only'] },
      'employees.export': { scope: 'ALL' },
      
      // Attendance
      'attendance.clock_in_out': { scope: 'ALL', conditions: ['manage_all'] },
      'attendance.view_records': { scope: 'ALL' },
      'attendance.approve_correct': { scope: 'ALL', restrictions: ['all_approvals'] },
      
      // Leave Management
      'leave.apply_request': { scope: 'ALL' },
      'leave.approve': { scope: 'ALL' },
      'leave.manage_policies': { scope: 'ALL' },
      
      // Payroll
      'payroll.view_salary': { scope: 'ALL' },
      'payroll.process': { scope: 'ALL' },
      'payroll.approve': { scope: 'ALL' },
      'payroll.settings_mgmt': { scope: 'ALL', restrictions: ['limited_configs'] },
      
      // Performance
      'performance.self_goals': { scope: 'ALL' },
      'performance.reviews': { scope: 'ALL', restrictions: ['all_cycles'] },
      'performance.goal_setting': { scope: 'ALL', restrictions: ['org_wide'] },
      
      // Reports
      'reports.view': { scope: 'ALL', restrictions: ['hr_reports'] },
      'reports.create_custom': { scope: 'ALL', restrictions: ['hr_scope'] },
      
      // Documents & Training
      'documents.access': { scope: 'ALL', restrictions: ['hr_docs'] },
      'training.access': { scope: 'ALL', restrictions: ['hr_wide'] },
      
      // Compliance & Organization
      'compliance.view': { scope: 'ALL', restrictions: ['hr_wide'] },
      'compliance.manage': { scope: 'ALL', restrictions: ['hr_compliance'] },
      'organization_chart.view': { scope: 'ALL' },
      'organization_chart.edit': { scope: 'ALL', restrictions: ['hr_structure'] },
      
      // Communication
      'messaging.internal': { scope: 'ALL', restrictions: ['hr_broadcast'] },
      'announcements.view': { scope: 'ALL', conditions: ['hr_wide_publish'] },
      'announcements.create': { scope: 'ALL', restrictions: ['hr_wide'] },
      
      // System & Security
      'system.settings': { scope: 'ALL', restrictions: ['limited_policies'] },
      'user.management': { scope: 'ALL', restrictions: ['limited_onboarding'] },
      'audit.security_logs': { scope: 'NONE' }
    }
  },

  // ADMINISTRATOR (Level 90) - Full organizational control
  admin: {
    level: 90,
    name: 'admin',
    displayName: 'Administrator',
    permissions: {
      // Dashboard
      'dashboard.view': { scope: 'ALL', restrictions: ['admin_dashboards'] },
      'dashboard.customize': { scope: 'ALL' },
      
      // Employee Management
      'employees.view': { scope: 'ALL' },
      'employees.create': { scope: 'ALL' },
      'employees.edit': { scope: 'ALL' },
      'employees.delete': { scope: 'ALL' },
      'employees.import': { scope: 'ALL' },
      'employees.export': { scope: 'ALL' },
      
      // Attendance
      'attendance.clock_in_out': { scope: 'ALL', conditions: ['manage_all'] },
      'attendance.view_records': { scope: 'ALL' },
      'attendance.approve_correct': { scope: 'ALL' },
      
      // Leave Management
      'leave.apply_request': { scope: 'ALL' },
      'leave.approve': { scope: 'ALL' },
      'leave.manage_policies': { scope: 'ALL' },
      
      // Payroll
      'payroll.view_salary': { scope: 'ALL' },
      'payroll.process': { scope: 'ALL' },
      'payroll.approve': { scope: 'ALL' },
      'payroll.settings_mgmt': { scope: 'ALL' },
      
      // Performance
      'performance.self_goals': { scope: 'ALL' },
      'performance.reviews': { scope: 'ALL' },
      'performance.goal_setting': { scope: 'ALL' },
      
      // Reports
      'reports.view': { scope: 'ALL' },
      'reports.create_custom': { scope: 'ALL' },
      
      // Documents & Training
      'documents.access': { scope: 'ALL' },
      'training.access': { scope: 'ALL' },
      
      // Compliance & Organization
      'compliance.view': { scope: 'ALL' },
      'compliance.manage': { scope: 'ALL' },
      'organization_chart.view': { scope: 'ALL' },
      'organization_chart.edit': { scope: 'ALL', restrictions: ['org_level'] },
      
      // Communication
      'messaging.internal': { scope: 'ALL', restrictions: ['org_wide'] },
      'announcements.view': { scope: 'ALL' },
      'announcements.create': { scope: 'ALL', restrictions: ['org_wide'] },
      
      // System & Security
      'system.settings': { scope: 'ALL', restrictions: ['full_system_config'] },
      'user.management': { scope: 'ALL' },
      'audit.security_logs': { scope: 'ALL', restrictions: ['limited'] }
    }
  },

  // SUPER ADMINISTRATOR (Level 100) - Complete system control
  super_admin: {
    level: 100,
    name: 'super_admin',
    displayName: 'Super Administrator',
    permissions: {
      // Dashboard
      'dashboard.view': { scope: 'SYSTEM', restrictions: ['system_metrics'] },
      'dashboard.customize': { scope: 'SYSTEM', restrictions: ['bi_dashboards'] },
      
      // Employee Management
      'employees.view': { scope: 'SYSTEM', conditions: ['hidden_system_data'] },
      'employees.create': { scope: 'SYSTEM' },
      'employees.edit': { scope: 'SYSTEM' },
      'employees.delete': { scope: 'SYSTEM' },
      'employees.import': { scope: 'SYSTEM' },
      'employees.export': { scope: 'SYSTEM' },
      
      // Attendance
      'attendance.clock_in_out': { scope: 'SYSTEM', conditions: ['manage_all'] },
      'attendance.view_records': { scope: 'SYSTEM' },
      'attendance.approve_correct': { scope: 'SYSTEM', conditions: ['all_overrides'] },
      
      // Leave Management
      'leave.apply_request': { scope: 'SYSTEM' },
      'leave.approve': { scope: 'SYSTEM' },
      'leave.manage_policies': { scope: 'SYSTEM' },
      
      // Payroll
      'payroll.view_salary': { scope: 'SYSTEM' },
      'payroll.process': { scope: 'SYSTEM' },
      'payroll.approve': { scope: 'SYSTEM' },
      'payroll.settings_mgmt': { scope: 'SYSTEM' },
      
      // Performance
      'performance.self_goals': { scope: 'SYSTEM' },
      'performance.reviews': { scope: 'SYSTEM' },
      'performance.goal_setting': { scope: 'SYSTEM' },
      
      // Reports
      'reports.view': { scope: 'SYSTEM', conditions: ['bi_dashboards'] },
      'reports.create_custom': { scope: 'SYSTEM', conditions: ['advanced_analytics'] },
      
      // Documents & Training
      'documents.access': { scope: 'SYSTEM' },
      'training.access': { scope: 'SYSTEM' },
      
      // Compliance & Organization
      'compliance.view': { scope: 'SYSTEM' },
      'compliance.manage': { scope: 'SYSTEM' },
      'organization_chart.view': { scope: 'SYSTEM', conditions: ['system_level'] },
      'organization_chart.edit': { scope: 'SYSTEM', conditions: ['org_plus_system'] },
      
      // Communication
      'messaging.internal': { scope: 'SYSTEM', restrictions: ['system_wide'] },
      'announcements.view': { scope: 'SYSTEM' },
      'announcements.create': { scope: 'SYSTEM', restrictions: ['org_wide'] },
      
      // System & Security
      'system.settings': { scope: 'SYSTEM', restrictions: ['database_plus_infra'] },
      'user.management': { scope: 'SYSTEM', restrictions: ['system_level'] },
      'audit.security_logs': { scope: 'SYSTEM', restrictions: ['full_system'] }
    }
  }
}

// ========================================
// PERMISSION VALIDATION HELPERS
// ========================================

export function hasPermission(
  userRole: RoleName,
  permission: string,
  targetScope?: ScopeLevel
): boolean {
  const rolePermissions = RBAC_MATRIX[userRole]
  if (!rolePermissions) return false
  
  const permissionConfig = rolePermissions.permissions[permission]
  if (!permissionConfig) return false
  
  if (targetScope) {
    return isScopeAllowed(permissionConfig.scope, targetScope)
  }
  
  return permissionConfig.scope !== 'NONE'
}

export function isScopeAllowed(userScope: ScopeLevel, requiredScope: ScopeLevel): boolean {
  const scopeHierarchy: Record<ScopeLevel, number> = {
    'NONE': 0,
    'OWN': 1,
    'TEAM': 2,
    'DEPARTMENT': 3,
    'ALL': 4,
    'SYSTEM': 5
  }
  
  return scopeHierarchy[userScope] >= scopeHierarchy[requiredScope]
}

export function getPermissionScope(userRole: RoleName, permission: string): ScopeLevel {
  const rolePermissions = RBAC_MATRIX[userRole]
  if (!rolePermissions) return 'NONE'
  
  const permissionConfig = rolePermissions.permissions[permission]
  return permissionConfig?.scope || 'NONE'
}

export function getPermissionConditions(userRole: RoleName, permission: string): string[] {
  const rolePermissions = RBAC_MATRIX[userRole]
  if (!rolePermissions) return []
  
  const permissionConfig = rolePermissions.permissions[permission]
  return permissionConfig?.conditions || []
}

export function getPermissionRestrictions(userRole: RoleName, permission: string): string[] {
  const rolePermissions = RBAC_MATRIX[userRole]
  if (!rolePermissions) return []
  
  const permissionConfig = rolePermissions.permissions[permission]
  return permissionConfig?.restrictions || []
}

// ========================================
// ROLE HIERARCHY HELPERS
// ========================================

export function getRoleLevel(roleName: RoleName): RoleLevel {
  return RBAC_MATRIX[roleName]?.level || 0
}

export function canRoleAccessRole(userRole: RoleName, targetRole: RoleName): boolean {
  const userLevel = getRoleLevel(userRole)
  const targetLevel = getRoleLevel(targetRole)
  return userLevel >= targetLevel
}

export function getRolesAtOrBelowLevel(userRole: RoleName): RoleName[] {
  const userLevel = getRoleLevel(userRole)
  return Object.keys(RBAC_MATRIX).filter(role => 
    getRoleLevel(role as RoleName) <= userLevel
  ) as RoleName[]
}

export default RBAC_MATRIX
