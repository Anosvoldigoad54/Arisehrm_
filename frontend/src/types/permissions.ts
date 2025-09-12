// ========================================
// ARISE HRM - ROLE-BASED ACCESS CONTROL (RBAC)
// ========================================
// Comprehensive permission system for enterprise HRM
// Based on your database schema and business requirements

export type ResourceType = 
  | 'dashboard'
  | 'employees' 
  | 'attendance'
  | 'leaves'
  | 'payroll'
  | 'performance'
  | 'reports'
  | 'analytics'
  | 'system'
  | 'departments'
  | 'positions'
  | 'teams'
  | 'hierarchy'
  | 'user_management'
  | 'settings'
  | 'audit_logs'
  | 'notifications'
  | 'workflow'
  | 'goals'
  | 'benefits'
  | 'documents'
  | 'calendar'

export type ActionType = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'export'
  | 'import'
  | 'bulk_action'
  | 'manage'
  | 'view_all'
  | 'view_own'
  | 'view_team'
  | 'view_department'
  | 'edit_own'
  | 'edit_team'
  | 'edit_department'
  | 'execute'
  | 'configure'

export interface Permission {
  id: string
  name: string
  displayName: string
  description: string
  resource: ResourceType
  action: ActionType
  conditions?: string[]
  isActive: boolean
}

export interface Role {
  id: string
  name: string
  displayName: string
  description: string
  level: number
  permissions: string[]
  isSystemRole: boolean
  colorCode: string
  icon: string
  maxUsers?: number
}

export interface UserPermissions {
  roles: Role[]
  permissions: Permission[]
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
  canAccess: (resource: ResourceType, action: ActionType) => boolean
  getAccessLevel: (resource: ResourceType) => 'none' | 'own' | 'team' | 'department' | 'all'
  getUserRole: () => string
  getUserLevel: () => number
  getRoleName: () => string
  isAdmin: () => boolean
  isHR: () => boolean
  isManager: () => boolean
}

// ========================================
// PERMISSION DEFINITIONS
// ========================================

export const PERMISSIONS: Record<string, Permission> = {
  // Dashboard Permissions
  'dashboard.view': {
    id: 'dashboard.view',
    name: 'dashboard.view',
    displayName: 'View Dashboard',
    description: 'Access to main dashboard',
    resource: 'dashboard',
    action: 'read',
    isActive: true
  },
  'dashboard.customize': {
    id: 'dashboard.customize',
    name: 'dashboard.customize',
    displayName: 'Customize Dashboard',
    description: 'Customize dashboard layout and widgets',
    resource: 'dashboard',
    action: 'update',
    isActive: true
  },

  // Employee Management Permissions
  'employees.view_all': {
    id: 'employees.view_all',
    name: 'employees.view_all',
    displayName: 'View All Employees',
    description: 'View all employee profiles across organization',
    resource: 'employees',
    action: 'view_all',
    isActive: true
  },
  'employees.view_department': {
    id: 'employees.view_department',
    name: 'employees.view_department',
    displayName: 'View Department Employees',
    description: 'View employees within same department',
    resource: 'employees',
    action: 'view_department',
    isActive: true
  },
  'employees.view_team': {
    id: 'employees.view_team',
    name: 'employees.view_team',
    displayName: 'View Team Members',
    description: 'View direct reports and team members',
    resource: 'employees',
    action: 'view_team',
    isActive: true
  },
  'employees.view_own': {
    id: 'employees.view_own',
    name: 'employees.view_own',
    displayName: 'View Own Profile',
    description: 'View own employee profile',
    resource: 'employees',
    action: 'view_own',
    isActive: true
  },
  'employees.create': {
    id: 'employees.create',
    name: 'employees.create',
    displayName: 'Create Employees',
    description: 'Add new employees to the system',
    resource: 'employees',
    action: 'create',
    isActive: true
  },
  'employees.edit_all': {
    id: 'employees.edit_all',
    name: 'employees.edit_all',
    displayName: 'Edit All Employees',
    description: 'Edit any employee profile',
    resource: 'employees',
    action: 'update',
    isActive: true
  },
  'employees.edit_department': {
    id: 'employees.edit_department',
    name: 'employees.edit_department',
    displayName: 'Edit Department Employees',
    description: 'Edit employees within same department',
    resource: 'employees',
    action: 'edit_department',
    isActive: true
  },
  'employees.edit_team': {
    id: 'employees.edit_team',
    name: 'employees.edit_team',
    displayName: 'Edit Team Members',
    description: 'Edit direct reports and team members',
    resource: 'employees',
    action: 'edit_team',
    isActive: true
  },
  'employees.edit_own': {
    id: 'employees.edit_own',
    name: 'employees.edit_own',
    displayName: 'Edit Own Profile',
    description: 'Edit own employee profile (limited fields)',
    resource: 'employees',
    action: 'edit_own',
    isActive: true
  },
  'employees.delete': {
    id: 'employees.delete',
    name: 'employees.delete',
    displayName: 'Delete Employees',
    description: 'Remove employees from system',
    resource: 'employees',
    action: 'delete',
    isActive: true
  },
  'employees.export': {
    id: 'employees.export',
    name: 'employees.export',
    displayName: 'Export Employee Data',
    description: 'Export employee information',
    resource: 'employees',
    action: 'export',
    isActive: true
  },
  'employees.import': {
    id: 'employees.import',
    name: 'employees.import',
    displayName: 'Import Employee Data',
    description: 'Bulk import employee information',
    resource: 'employees',
    action: 'import',
    isActive: true
  },

  // Attendance Permissions
  'attendance.view_all': {
    id: 'attendance.view_all',
    name: 'attendance.view_all',
    displayName: 'View All Attendance',
    description: 'View attendance records for all employees',
    resource: 'attendance',
    action: 'view_all',
    isActive: true
  },
  'attendance.view_department': {
    id: 'attendance.view_department',
    name: 'attendance.view_department',
    displayName: 'View Department Attendance',
    description: 'View attendance for department employees',
    resource: 'attendance',
    action: 'view_department',
    isActive: true
  },
  'attendance.view_team': {
    id: 'attendance.view_team',
    name: 'attendance.view_team',
    displayName: 'View Team Attendance',
    description: 'View attendance for team members',
    resource: 'attendance',
    action: 'view_team',
    isActive: true
  },
  'attendance.view_own': {
    id: 'attendance.view_own',
    name: 'attendance.view_own',
    displayName: 'View Own Attendance',
    description: 'View own attendance records',
    resource: 'attendance',
    action: 'view_own',
    isActive: true
  },
  'attendance.clock_in_out': {
    id: 'attendance.clock_in_out',
    name: 'attendance.clock_in_out',
    displayName: 'Clock In/Out',
    description: 'Record attendance check-in and check-out',
    resource: 'attendance',
    action: 'create',
    isActive: true
  },
  'attendance.edit_all': {
    id: 'attendance.edit_all',
    name: 'attendance.edit_all',
    displayName: 'Edit All Attendance',
    description: 'Edit attendance records for any employee',
    resource: 'attendance',
    action: 'update',
    isActive: true
  },
  'attendance.edit_team': {
    id: 'attendance.edit_team',
    name: 'attendance.edit_team',
    displayName: 'Edit Team Attendance',
    description: 'Edit attendance for team members',
    resource: 'attendance',
    action: 'edit_team',
    isActive: true
  },
  'attendance.approve': {
    id: 'attendance.approve',
    name: 'attendance.approve',
    displayName: 'Approve Attendance',
    description: 'Approve attendance corrections and records',
    resource: 'attendance',
    action: 'approve',
    isActive: true
  },
  'attendance.reports': {
    id: 'attendance.reports',
    name: 'attendance.reports',
    displayName: 'Attendance Reports',
    description: 'Generate attendance reports and analytics',
    resource: 'attendance',
    action: 'export',
    isActive: true
  },

  // Leave Management Permissions
  'leaves.view_all': {
    id: 'leaves.view_all',
    name: 'leaves.view_all',
    displayName: 'View All Leave Requests',
    description: 'View leave requests for all employees',
    resource: 'leaves',
    action: 'view_all',
    isActive: true
  },
  'leaves.view_department': {
    id: 'leaves.view_department',
    name: 'leaves.view_department',
    displayName: 'View Department Leaves',
    description: 'View leave requests for department employees',
    resource: 'leaves',
    action: 'view_department',
    isActive: true
  },
  'leaves.view_team': {
    id: 'leaves.view_team',
    name: 'leaves.view_team',
    displayName: 'View Team Leaves',
    description: 'View leave requests for team members',
    resource: 'leaves',
    action: 'view_team',
    isActive: true
  },
  'leaves.view_own': {
    id: 'leaves.view_own',
    name: 'leaves.view_own',
    displayName: 'View Own Leaves',
    description: 'View own leave requests and balances',
    resource: 'leaves',
    action: 'view_own',
    isActive: true
  },
  'leaves.apply': {
    id: 'leaves.apply',
    name: 'leaves.apply',
    displayName: 'Apply for Leave',
    description: 'Submit leave requests',
    resource: 'leaves',
    action: 'create',
    isActive: true
  },
  'leaves.approve_team': {
    id: 'leaves.approve_team',
    name: 'leaves.approve_team',
    displayName: 'Approve Team Leaves',
    description: 'Approve/reject leave requests for team members',
    resource: 'leaves',
    action: 'approve',
    isActive: true
  },
  'leaves.approve_department': {
    id: 'leaves.approve_department',
    name: 'leaves.approve_department',
    displayName: 'Approve Department Leaves',
    description: 'Approve/reject leave requests for department',
    resource: 'leaves',
    action: 'approve',
    isActive: true
  },
  'leaves.approve_all': {
    id: 'leaves.approve_all',
    name: 'leaves.approve_all',
    displayName: 'Approve All Leaves',
    description: 'Approve/reject any leave request',
    resource: 'leaves',
    action: 'approve',
    isActive: true
  },
  'leaves.manage_balances': {
    id: 'leaves.manage_balances',
    name: 'leaves.manage_balances',
    displayName: 'Manage Leave Balances',
    description: 'Adjust leave balances and allocations',
    resource: 'leaves',
    action: 'manage',
    isActive: true
  },
  'leaves.manage_types': {
    id: 'leaves.manage_types',
    name: 'leaves.manage_types',
    displayName: 'Manage Leave Types',
    description: 'Create and configure leave types',
    resource: 'leaves',
    action: 'configure',
    isActive: true
  },

  // Payroll Permissions
  'payroll.view_all': {
    id: 'payroll.view_all',
    name: 'payroll.view_all',
    displayName: 'View All Payroll',
    description: 'View payroll records for all employees',
    resource: 'payroll',
    action: 'view_all',
    isActive: true
  },
  'payroll.view_own': {
    id: 'payroll.view_own',
    name: 'payroll.view_own',
    displayName: 'View Own Payroll',
    description: 'View own payroll records and payslips',
    resource: 'payroll',
    action: 'view_own',
    isActive: true
  },
  'payroll.process': {
    id: 'payroll.process',
    name: 'payroll.process',
    displayName: 'Process Payroll',
    description: 'Process monthly payroll calculations',
    resource: 'payroll',
    action: 'execute',
    isActive: true
  },
  'payroll.approve': {
    id: 'payroll.approve',
    name: 'payroll.approve',
    displayName: 'Approve Payroll',
    description: 'Approve processed payroll records',
    resource: 'payroll',
    action: 'approve',
    isActive: true
  },
  'payroll.manage': {
    id: 'payroll.manage',
    name: 'payroll.manage',
    displayName: 'Manage Payroll Settings',
    description: 'Configure payroll settings and tax rules',
    resource: 'payroll',
    action: 'manage',
    isActive: true
  },

  // Performance Management Permissions
  'performance.view_all': {
    id: 'performance.view_all',
    name: 'performance.view_all',
    displayName: 'View All Performance Data',
    description: 'View performance reviews for all employees',
    resource: 'performance',
    action: 'view_all',
    isActive: true
  },
  'performance.view_team': {
    id: 'performance.view_team',
    name: 'performance.view_team',
    displayName: 'View Team Performance',
    description: 'View performance data for team members',
    resource: 'performance',
    action: 'view_team',
    isActive: true
  },
  'performance.view_own': {
    id: 'performance.view_own',
    name: 'performance.view_own',
    displayName: 'View Own Performance',
    description: 'View own performance reviews and goals',
    resource: 'performance',
    action: 'view_own',
    isActive: true
  },
  'performance.review_team': {
    id: 'performance.review_team',
    name: 'performance.review_team',
    displayName: 'Review Team Performance',
    description: 'Conduct performance reviews for team members',
    resource: 'performance',
    action: 'update',
    isActive: true
  },
  'performance.set_goals': {
    id: 'performance.set_goals',
    name: 'performance.set_goals',
    displayName: 'Set Performance Goals',
    description: 'Set and assign performance goals',
    resource: 'goals',
    action: 'create',
    isActive: true
  },

  // Reports & Analytics Permissions
  'reports.view_all': {
    id: 'reports.view_all',
    name: 'reports.view_all',
    displayName: 'View All Reports',
    description: 'Access all system reports and analytics',
    resource: 'reports',
    action: 'read',
    isActive: true
  },
  'reports.view_department': {
    id: 'reports.view_department',
    name: 'reports.view_department',
    displayName: 'View Department Reports',
    description: 'Access reports for own department',
    resource: 'reports',
    action: 'view_department',
    isActive: true
  },
  'reports.create': {
    id: 'reports.create',
    name: 'reports.create',
    displayName: 'Create Custom Reports',
    description: 'Create and schedule custom reports',
    resource: 'reports',
    action: 'create',
    isActive: true
  },
  'analytics.advanced': {
    id: 'analytics.advanced',
    name: 'analytics.advanced',
    displayName: 'Advanced Analytics',
    description: 'Access advanced analytics and business intelligence',
    resource: 'analytics',
    action: 'read',
    isActive: true
  },

  // System Administration Permissions
  'system.admin': {
    id: 'system.admin',
    name: 'system.admin',
    displayName: 'System Administration',
    description: 'Full system administration access',
    resource: 'system',
    action: 'manage',
    isActive: true
  },
  'user_management.manage': {
    id: 'user_management.manage',
    name: 'user_management.manage',
    displayName: 'User Management',
    description: 'Manage user accounts and roles',
    resource: 'user_management',
    action: 'manage',
    isActive: true
  },
  'departments.manage': {
    id: 'departments.manage',
    name: 'departments.manage',
    displayName: 'Manage Departments',
    description: 'Create and manage departments',
    resource: 'departments',
    action: 'manage',
    isActive: true
  },
  'positions.manage': {
    id: 'positions.manage',
    name: 'positions.manage',
    displayName: 'Manage Positions',
    description: 'Create and manage job positions',
    resource: 'positions',
    action: 'manage',
    isActive: true
  },
  'audit_logs.view': {
    id: 'audit_logs.view',
    name: 'audit_logs.view',
    displayName: 'View Audit Logs',
    description: 'Access system audit logs',
    resource: 'audit_logs',
    action: 'read',
    isActive: true
  },
  'settings.manage': {
    id: 'settings.manage',
    name: 'settings.manage',
    displayName: 'Manage Settings',
    description: 'Configure system settings',
    resource: 'settings',
    action: 'manage',
    isActive: true
  },

  // Team Management Permissions
  'teams.view_all': {
    id: 'teams.view_all',
    name: 'teams.view_all',
    displayName: 'View All Teams',
    description: 'View all teams across the organization',
    resource: 'teams',
    action: 'view_all',
    isActive: true
  },
  'teams.view_own': {
    id: 'teams.view_own',
    name: 'teams.view_own',
    displayName: 'View Own Team',
    description: 'View team that user belongs to',
    resource: 'teams',
    action: 'view_own',
    isActive: true
  },
  'teams.manage_all': {
    id: 'teams.manage_all',
    name: 'teams.manage_all',
    displayName: 'Manage All Teams',
    description: 'Create, edit, and delete any team',
    resource: 'teams',
    action: 'manage',
    isActive: true
  },
  'teams.manage_own': {
    id: 'teams.manage_own',
    name: 'teams.manage_own',
    displayName: 'Manage Own Team',
    description: 'Manage team members and team settings for own team',
    resource: 'teams',
    action: 'update',
    isActive: true
  },
  'teams.assign_members': {
    id: 'teams.assign_members',
    name: 'teams.assign_members',
    displayName: 'Assign Team Members',
    description: 'Add or remove members from teams',
    resource: 'teams',
    action: 'update',
    isActive: true
  },
  'teams.assign_leaders': {
    id: 'teams.assign_leaders',
    name: 'teams.assign_leaders',
    displayName: 'Assign Team Leaders',
    description: 'Assign or change team leadership roles',
    resource: 'teams',
    action: 'update',
    isActive: true
  },

  // Hierarchy Management Permissions
  'hierarchy.view_all': {
    id: 'hierarchy.view_all',
    name: 'hierarchy.view_all',
    displayName: 'View Full Hierarchy',
    description: 'View complete organizational hierarchy',
    resource: 'hierarchy',
    action: 'view_all',
    isActive: true
  },
  'hierarchy.view_department': {
    id: 'hierarchy.view_department',
    name: 'hierarchy.view_department',
    displayName: 'View Department Hierarchy',
    description: 'View hierarchy within department',
    resource: 'hierarchy',
    action: 'view_department',
    isActive: true
  },
  'hierarchy.view_team': {
    id: 'hierarchy.view_team',
    name: 'hierarchy.view_team',
    displayName: 'View Team Hierarchy',
    description: 'View hierarchy within team',
    resource: 'hierarchy',
    action: 'view_team',
    isActive: true
  },
  'hierarchy.manage_reporting': {
    id: 'hierarchy.manage_reporting',
    name: 'hierarchy.manage_reporting',
    displayName: 'Manage Reporting Structure',
    description: 'Modify manager-employee reporting relationships',
    resource: 'hierarchy',
    action: 'manage',
    isActive: true
  },
  'hierarchy.org_chart': {
    id: 'hierarchy.org_chart',
    name: 'hierarchy.org_chart',
    displayName: 'Access Organization Chart',
    description: 'View and interact with organization chart',
    resource: 'hierarchy',
    action: 'read',
    isActive: true
  }
}

// ========================================
// ROLE DEFINITIONS
// ========================================

export const ROLES: Record<string, Role> = {
  // Super Administrator (Level 100)
  super_admin: {
    id: 'super_admin',
    name: 'super_admin',
    displayName: 'Super Administrator',
    description: 'Complete system access with all permissions',
    level: 100,
    isSystemRole: true,
    colorCode: '#dc2626',
    icon: 'SupervisorAccountIcon',
    permissions: Object.keys(PERMISSIONS), // All permissions
  },

  // Administrator (Level 90)
  admin: {
    id: 'admin',
    name: 'admin',
    displayName: 'Administrator',
    description: 'Full administrative access except system management',
    level: 90,
    isSystemRole: true,
    colorCode: '#ea580c',
    icon: 'AdminPanelSettingsIcon',
    permissions: [
      'dashboard.view', 'dashboard.customize',
      'employees.view_all', 'employees.create', 'employees.edit_all', 'employees.export', 'employees.import',
      'attendance.view_all', 'attendance.edit_all', 'attendance.approve', 'attendance.reports',
      'leaves.view_all', 'leaves.approve_all', 'leaves.manage_balances', 'leaves.manage_types',
      'payroll.view_all', 'payroll.process', 'payroll.approve', 'payroll.manage',
      'performance.view_all', 'performance.review_team', 'performance.set_goals',
      'reports.view_all', 'reports.create', 'analytics.advanced',
      'teams.view_all', 'teams.manage_all', 'teams.assign_members', 'teams.assign_leaders',
      'hierarchy.view_all', 'hierarchy.manage_reporting', 'hierarchy.org_chart',
      'user_management.manage', 'departments.manage', 'positions.manage',
      'audit_logs.view', 'settings.manage'
    ],
  },

  // HR Manager (Level 80)
  hr_manager: {
    id: 'hr_manager',
    name: 'hr_manager',
    displayName: 'HR Manager',
    description: 'Human Resources management with full employee lifecycle control',
    level: 80,
    isSystemRole: false,
    colorCode: '#c2410c',
    icon: 'PeopleIcon',
    permissions: [
      'dashboard.view', 'dashboard.customize',
      'employees.view_all', 'employees.create', 'employees.edit_all', 'employees.export', 'employees.import',
      'attendance.view_all', 'attendance.edit_all', 'attendance.approve', 'attendance.reports',
      'leaves.view_all', 'leaves.approve_all', 'leaves.manage_balances', 'leaves.manage_types',
      'payroll.view_all', 'payroll.process', 'payroll.approve',
      'performance.view_all', 'performance.review_team', 'performance.set_goals',
      'reports.view_all', 'reports.create', 'analytics.advanced',
      'teams.view_all', 'teams.manage_all', 'teams.assign_members', 'teams.assign_leaders',
      'hierarchy.view_all', 'hierarchy.manage_reporting', 'hierarchy.org_chart',
      'departments.manage', 'positions.manage'
    ],
  },

  // Department Manager (Level 70)
  department_manager: {
    id: 'department_manager',
    name: 'department_manager',
    displayName: 'Department Manager',
    description: 'Management role with department-wide access and control',
    level: 70,
    isSystemRole: false,
    colorCode: '#dc2626',
    icon: 'BusinessIcon',
    permissions: [
      'dashboard.view', 'dashboard.customize',
      'employees.view_department', 'employees.edit_department',
      'attendance.view_department', 'attendance.edit_team', 'attendance.approve',
      'leaves.view_department', 'leaves.approve_department',
      'performance.view_team', 'performance.review_team', 'performance.set_goals',
      'teams.view_own', 'teams.assign_members',
      'hierarchy.view_department', 'hierarchy.org_chart',
      'reports.view_department', 'reports.create'
    ],
  },

  // Team Lead (Level 60)
  team_lead: {
    id: 'team_lead',
    name: 'team_lead',
    displayName: 'Team Lead',
    description: 'Team leadership role with direct report management',
    level: 60,
    isSystemRole: false,
    colorCode: '#2563eb',
    icon: 'GroupIcon',
    permissions: [
      'dashboard.view', 'dashboard.customize',
      'employees.view_team', 'employees.edit_team',
      'attendance.view_team', 'attendance.edit_team', 'attendance.approve',
      'leaves.view_team', 'leaves.approve_team',
      'performance.view_team', 'performance.review_team', 'performance.set_goals',
      'teams.view_own', 'teams.manage_own',
      'hierarchy.view_team', 'hierarchy.org_chart',
      'reports.view_department'
    ],
  },

  // Senior Employee (Level 50)
  senior_employee: {
    id: 'senior_employee',
    name: 'senior_employee',
    displayName: 'Senior Employee',
    description: 'Senior level employee with enhanced access',
    level: 50,
    isSystemRole: false,
    colorCode: '#059669',
    icon: 'StarIcon',
    permissions: [
      'dashboard.view',
      'employees.view_own', 'employees.edit_own',
      'attendance.view_own', 'attendance.clock_in_out',
      'leaves.view_own', 'leaves.apply',
      'performance.view_own', 'performance.set_goals',
      'teams.view_own', 'hierarchy.org_chart',
      'reports.view_department'
    ],
  },

  // Employee (Level 40)
  employee: {
    id: 'employee',
    name: 'employee',
    displayName: 'Employee',
    description: 'Standard employee with basic access rights',
    level: 40,
    isSystemRole: false,
    colorCode: '#7c3aed',
    icon: 'PersonIcon',
    permissions: [
      'dashboard.view',
      'employees.view_own', 'employees.edit_own',
      'attendance.view_own', 'attendance.clock_in_out',
      'leaves.view_own', 'leaves.apply',
      'payroll.view_own',
      'performance.view_own',
      'hierarchy.org_chart'
    ],
  },

  // Intern (Level 20)
  intern: {
    id: 'intern',
    name: 'intern',
    displayName: 'Intern',
    description: 'Intern level with limited access',
    level: 20,
    isSystemRole: false,
    colorCode: '#64748b',
    icon: 'SchoolIcon',
    permissions: [
      'dashboard.view',
      'employees.view_own',
      'attendance.view_own', 'attendance.clock_in_out',
      'leaves.view_own', 'leaves.apply',
      'performance.view_own'
    ],
  },
}

// ========================================
// PERMISSION GROUPS FOR EASIER MANAGEMENT
// ========================================

export const PERMISSION_GROUPS = {
  EMPLOYEE_BASIC: [
    'dashboard.view',
    'employees.view_own', 'employees.edit_own',
    'attendance.view_own', 'attendance.clock_in_out',
    'leaves.view_own', 'leaves.apply',
    'payroll.view_own',
    'performance.view_own'
  ],
  TEAM_LEAD_BASIC: [
    'employees.view_team', 'employees.edit_team',
    'attendance.view_team', 'attendance.edit_team', 'attendance.approve',
    'leaves.view_team', 'leaves.approve_team',
    'performance.view_team', 'performance.review_team'
  ],
  MANAGER_BASIC: [
    'employees.view_department', 'employees.edit_department',
    'attendance.view_department',
    'leaves.view_department', 'leaves.approve_department',
    'reports.view_department', 'reports.create'
  ],
  HR_SPECIALIST: [
    'employees.view_all', 'employees.create', 'employees.edit_all',
    'leaves.manage_balances', 'leaves.manage_types',
    'payroll.process', 'payroll.approve',
    'departments.manage', 'positions.manage'
  ],
  ADMIN_CORE: [
    'user_management.manage',
    'audit_logs.view',
    'settings.manage',
    'analytics.advanced'
  ]
}

// ========================================
// ACCESS LEVEL DEFINITIONS
// ========================================

export const ACCESS_LEVELS = {
  NONE: 'none',
  OWN: 'own',
  TEAM: 'team', 
  DEPARTMENT: 'department',
  ALL: 'all'
} as const

export type AccessLevel = typeof ACCESS_LEVELS[keyof typeof ACCESS_LEVELS]

// ========================================
// HELPER FUNCTIONS
// ========================================

export const getPermissionsByResource = (resource: ResourceType): Permission[] => {
  return Object.values(PERMISSIONS).filter(permission => permission.resource === resource)
}

export const getRolesByLevel = (minLevel: number = 0): Role[] => {
  return Object.values(ROLES).filter(role => role.level >= minLevel)
}

export const hasHigherLevel = (userLevel: number, requiredLevel: number): boolean => {
  return userLevel >= requiredLevel
}

export const canUserAccess = (
  userPermissions: string[], 
  requiredPermission: string,
  userRole?: Role
): boolean => {
  // System admin has all permissions
  if (userPermissions.includes('system.admin') || userPermissions.includes('*')) {
    return true
  }
  
  // Check specific permission
  return userPermissions.includes(requiredPermission)
}

export const getUserAccessLevel = (
  userPermissions: string[],
  resource: ResourceType
): AccessLevel => {
  if (userPermissions.includes(`${resource}.view_all`) || userPermissions.includes('*')) {
    return ACCESS_LEVELS.ALL
  }
  if (userPermissions.includes(`${resource}.view_department`)) {
    return ACCESS_LEVELS.DEPARTMENT
  }
  if (userPermissions.includes(`${resource}.view_team`)) {
    return ACCESS_LEVELS.TEAM
  }
  if (userPermissions.includes(`${resource}.view_own`)) {
    return ACCESS_LEVELS.OWN
  }
  return ACCESS_LEVELS.NONE
}

export default PERMISSIONS
