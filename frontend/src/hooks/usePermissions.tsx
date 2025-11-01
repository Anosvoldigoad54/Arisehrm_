'use client'

import { useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Permission, 
  Role, 
  ResourceType, 
  ActionType, 
  UserPermissions,
  ACCESS_LEVELS,
  AccessLevel,
  PERMISSIONS,
  ROLES,
  canUserAccess,
  getUserAccessLevel,
  hasHigherLevel
} from '../types/permissions'

/**
 * Enhanced Permission Hook for Arise HRM
 * Provides comprehensive role-based access control functionality
 */
export function usePermissions(): UserPermissions {
  const { profile, user } = useAuth()

  // Memoize permissions calculation for performance
  const userPermissions = useMemo(() => {
    if (!profile || !user) {
      return {
        roles: [],
        permissions: [],
        hasPermission: () => false,
        hasAnyPermission: () => false,
        hasAllPermissions: () => false,
        canAccess: () => false,
        getAccessLevel: () => ACCESS_LEVELS.NONE as AccessLevel,
        getUserRole: () => 'guest',
        getUserLevel: () => 0,
        getRoleName: () => 'Guest',
        isAdmin: () => false,
        isHR: () => false,
        isManager: () => false
      }
    }

    // Get user role and permissions
    const userRole = profile.role
    const userPermissionList = userRole?.permissions || []

    // Convert permission strings to Permission objects
    const permissions = userPermissionList
      .map(permissionName => PERMISSIONS[permissionName])
      .filter(Boolean)

    // Get role objects
    const roles = userRole ? [userRole] : []

    const hasPermission = (permission: string): boolean => {
      return canUserAccess(userPermissionList, permission, userRole)
    }

    const hasAnyPermission = (permissionList: string[]): boolean => {
      return permissionList.some(permission => hasPermission(permission))
    }

    const hasAllPermissions = (permissionList: string[]): boolean => {
      return permissionList.every(permission => hasPermission(permission))
    }

    const canAccess = (resource: ResourceType, action: ActionType): boolean => {
      const permissionKey = `${resource}.${action}`
      return hasPermission(permissionKey)
    }

    const getAccessLevel = (resource: ResourceType): AccessLevel => {
      return getUserAccessLevel(userPermissionList, resource)
    }

    // Helper functions for roles
    const getUserRole = () => profile?.role?.name || 'guest'
    const getUserLevel = () => profile?.role?.level || 0
    const getRoleName = () => {
      const role = profile?.role
      if (!role) return 'Guest'
      return role.display_name || role.displayName || role.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    const isAdmin = () => hasPermission('system.admin') || hasPermission('*')
    const isHR = () => getUserRole() === 'hr_manager' || getUserRole() === 'admin'
    const isManager = () => {
      const role = getUserRole()
      return ['department_manager', 'team_lead', 'hr_manager', 'admin', 'super_admin'].includes(role)
    }

    return {
      roles,
      permissions,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      canAccess,
      getAccessLevel,
      getUserRole,
      getUserLevel,
      getRoleName,
      isAdmin,
      isHR,
      isManager
    }
  }, [profile, user])

  return userPermissions
}

/**
 * Hook to check if user can access specific route
 */
export function useRouteAccess(
  requiredPermissions: string[] = [],
  requiredRole?: string,
  requiredLevel?: number
) {
  const { profile } = useAuth()
  const permissions = usePermissions()

  return useMemo(() => {
    if (!profile) return false

    // Check role requirement
    if (requiredRole && profile.role?.name !== requiredRole) {
      return false
    }

    // Check level requirement
    if (requiredLevel && !hasHigherLevel(profile.role?.level || 0, requiredLevel)) {
      return false
    }

    // Check permission requirements
    if (requiredPermissions.length > 0) {
      return permissions.hasAllPermissions(requiredPermissions)
    }

    return true
  }, [profile, permissions, requiredPermissions, requiredRole, requiredLevel])
}

/**
 * Hook for component-level permission checking
 */
export function useComponentAccess() {
  const permissions = usePermissions()
  const { profile } = useAuth()

  const canViewComponent = (requiredPermissions: string | string[]) => {
    const permissionList = Array.isArray(requiredPermissions) 
      ? requiredPermissions 
      : [requiredPermissions]
    
    return permissions.hasAnyPermission(permissionList)
  }

  const canEditComponent = (requiredPermissions: string | string[]) => {
    const permissionList = Array.isArray(requiredPermissions) 
      ? requiredPermissions 
      : [requiredPermissions]
    
    return permissions.hasAllPermissions(permissionList)
  }

  const getUserRole = () => profile?.role?.name || 'guest'
  const getUserLevel = () => profile?.role?.level || 0
  const getRoleName = () => {
    const role = profile?.role
    if (!role) return 'Guest'
    return role.display_name || role.displayName || role.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  const isAdmin = () => permissions.hasPermission('system.admin') || permissions.hasPermission('*')
  const isHR = () => getUserRole() === 'hr_manager' || getUserRole() === 'admin'
  const isManager = () => {
    const role = getUserRole()
    return ['department_manager', 'team_lead', 'hr_manager', 'admin', 'super_admin'].includes(role)
  }

  return {
    canViewComponent,
    canEditComponent,
    getUserRole,
    getUserLevel,
    getRoleName,
    isAdmin,
    isHR,
    isManager,
    permissions
  }
}

/**
 * Hook for data filtering based on access level
 */
export function useDataAccess() {
  const { profile } = useAuth()
  const permissions = usePermissions()

  const filterEmployeeData = (employees: any[], resource: ResourceType = 'employees') => {
    if (!profile || !employees) return []

    const accessLevel = permissions.getAccessLevel(resource)

    switch (accessLevel) {
      case ACCESS_LEVELS.ALL:
        return employees

      case ACCESS_LEVELS.DEPARTMENT:
        return employees.filter(emp => 
          emp.department_id === profile.department?.id
        )

      case ACCESS_LEVELS.TEAM:
        return employees.filter(emp => 
          emp.manager_id === profile.id || 
          emp.id === profile.id
        )

      case ACCESS_LEVELS.OWN:
        return employees.filter(emp => emp.id === profile.id)

      default:
        return []
    }
  }

  const filterDepartmentData = (departments: any[]) => {
    if (!profile || !departments) return []

    if (permissions.hasPermission('departments.view_all')) {
      return departments
    }

    if (permissions.hasPermission('departments.view_own')) {
      return departments.filter(dept => dept.id === profile.department?.id)
    }

    return []
  }

  const canAccessEmployee = (targetEmployeeId: string): boolean => {
    if (!profile) return false

    const accessLevel = permissions.getAccessLevel('employees')

    switch (accessLevel) {
      case ACCESS_LEVELS.ALL:
        return true

      case ACCESS_LEVELS.DEPARTMENT:
        // Would need to check if target employee is in same department
        // This would require additional data lookup
        return true // Simplified for now

      case ACCESS_LEVELS.TEAM:
        // Check if target is direct report or self
        return targetEmployeeId === profile.id // Simplified

      case ACCESS_LEVELS.OWN:
        return targetEmployeeId === profile.id

      default:
        return false
    }
  }

  return {
    filterEmployeeData,
    filterDepartmentData,
    canAccessEmployee
  }
}

/**
 * Hook for permission-based navigation
 */
export function useNavigationPermissions() {
  const permissions = usePermissions()

  const getAvailableRoutes = () => {
    const routes = []

    if (permissions.hasPermission('dashboard.view')) {
      routes.push({
        path: '/dashboard',
        label: 'Dashboard',
        icon: 'DashboardIcon'
      })
    }

    if (permissions.hasAnyPermission(['employees.view_own', 'employees.view_team', 'employees.view_department', 'employees.view_all'])) {
      routes.push({
        path: '/hr/employees',
        label: 'Employees',
        icon: 'PeopleIcon'
      })
    }

    if (permissions.hasAnyPermission(['attendance.view_own', 'attendance.view_team', 'attendance.view_all'])) {
      routes.push({
        path: '/attendance',
        label: 'Attendance',
        icon: 'AccessTimeIcon'
      })
    }

    if (permissions.hasAnyPermission(['leaves.view_own', 'leaves.view_team', 'leaves.view_all'])) {
      routes.push({
        path: '/leave',
        label: 'Leave Management',
        icon: 'EventAvailableIcon'
      })
    }

    if (permissions.hasAnyPermission(['payroll.view_own', 'payroll.view_all'])) {
      routes.push({
        path: '/payroll',
        label: 'Payroll',
        icon: 'PaymentIcon'
      })
    }

    if (permissions.hasAnyPermission(['performance.view_own', 'performance.view_team', 'performance.view_all'])) {
      routes.push({
        path: '/performance',
        label: 'Performance',
        icon: 'TrendingUpIcon'
      })
    }

    if (permissions.hasAnyPermission(['reports.view_department', 'reports.view_all'])) {
      routes.push({
        path: '/reports',
        label: 'Reports & Analytics',
        icon: 'AssessmentIcon'
      })
    }

    if (permissions.hasPermission('system.admin') || permissions.hasPermission('user_management.manage')) {
      routes.push({
        path: '/admin',
        label: 'Administration',
        icon: 'AdminPanelSettingsIcon'
      })
    }

    return routes
  }

  const canAccessRoute = (routePath: string): boolean => {
    const routePermissions: Record<string, string[]> = {
      '/dashboard': ['dashboard.view'],
      '/hr/employees': ['employees.view_own', 'employees.view_team', 'employees.view_department', 'employees.view_all'],
      '/attendance': ['attendance.view_own', 'attendance.view_team', 'attendance.view_all'],
      '/leave': ['leaves.view_own', 'leaves.view_team', 'leaves.view_all'],
      '/payroll': ['payroll.view_own', 'payroll.view_all'],
      '/performance': ['performance.view_own', 'performance.view_team', 'performance.view_all'],
      '/reports': ['reports.view_department', 'reports.view_all'],
      '/admin': ['system.admin', 'user_management.manage']
    }

    const requiredPermissions = routePermissions[routePath]
    if (!requiredPermissions) return false

    return permissions.hasAnyPermission(requiredPermissions)
  }

  return {
    getAvailableRoutes,
    canAccessRoute
  }
}

export default usePermissions
