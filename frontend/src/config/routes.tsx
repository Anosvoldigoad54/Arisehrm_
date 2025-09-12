// Enhanced Route Configuration for Arise HRM System
// Comprehensive routing with lazy loading and responsive features

import React, { Suspense } from 'react'
import { Navigate } from 'react-router-dom'
import { CircularProgress, Box } from '@mui/material'

// ===========================================
// LOADING COMPONENTS
// ===========================================
const LoadingSpinner = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '60vh',
      flexDirection: 'column',
      gap: 2
    }}
  >
    <CircularProgress size={40} />
    <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
      Loading...
    </Box>
  </Box>
)

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
)

// ===========================================
// LAZY LOADED COMPONENTS
// ===========================================

// Dashboard Components
const CustomizableDashboard = React.lazy(() =>
  import('../components/dashboard/CustomizableDashboard')
)

// Employee Management
const EmployeeDirectory = React.lazy(() => 
  import('../components/employees/EmployeeDirectory')
)
// Removed: EmployeeManagement - component deleted, route conflicts with App.tsx redirect
const OrganizationChart = React.lazy(() => 
  import('../components/organization/OrganizationChart')
)

// Attendance Management
// Removed: SmartAttendance - component deleted, route conflicts with App.tsx

// Leave Management (named exports)
const LeaveManagementDashboard = React.lazy(() =>
  import('../components/leave/LeaveManagementDashboard').then(m => ({
    default: m.LeaveManagementDashboard,
  }))
)
const LeaveBalanceTracker = React.lazy(() =>
  import('../components/leave/LeaveBalanceTracker').then(m => ({
    default: m.LeaveBalanceTracker,
  }))
)
const TeamLeaveCalendar = React.lazy(() =>
  import('../components/leave/TeamLeaveCalendar').then(m => ({
    default: m.TeamLeaveCalendar,
  }))
)
const LeaveAnalytics = React.lazy(() =>
  import('../components/leave/LeaveAnalytics').then(m => ({
    default: m.LeaveAnalytics,
  }))
)

// Performance Management (default export)
// Removed: PerformanceReviewDashboard - component deleted, route conflicts with App.tsx

// Training & Development (default export)
const TrainingDashboard = React.lazy(() =>
  import('../components/training/TrainingDashboard')
)

// Recruitment (default export)
const RecruitmentDashboard = React.lazy(() =>
  import('../components/recruitment/RecruitmentDashboard')
)

// Onboarding (default export)
const OnboardingDashboard = React.lazy(() =>
  import('../components/onboarding/OnboardingDashboard')
)

// Payroll (default export)
const PayrollDashboard = React.lazy(() =>
  import('../components/payroll/DashboardPayroll')
)

// Benefits (default export)
const BenefitsManagement = React.lazy(() =>
  import('../components/benefits/BenefitsManagement')
)

// Documents (default export)
const DocumentManagement = React.lazy(() =>
  import('../components/documents/DocumentManagement')
)

// Self Service
const EmployeeSelfService = React.lazy(() =>
  import('../components/selfservice/EmployeeSelfService').then(m => ({
    default: m.EmployeeSelfService,
  }))
)

// Analytics
const AdvancedAnalyticsDashboard = React.lazy(() =>
  import('../components/analytics/AdvancedAnalyticsDashboard').then(m => ({
    default: m.AdvancedAnalyticsDashboard,
  }))
)

// Settings
const SettingsDashboard = React.lazy(() => 
  import('../components/settings/SettingsDashboard')
)

// ===========================================
// ROUTE CONFIGURATION
// ===========================================

export interface RouteConfig {
  path: string
  element: React.ReactElement
  title: string
  description?: string
  icon?: string
  requiresPermission?: string[]
  isPublic?: boolean
  mobileOptimized?: boolean
  children?: RouteConfig[]
}

export const routeConfig: RouteConfig[] = [
  // Dashboard
  {
    path: '/dashboard',
    element: <SuspenseWrapper><CustomizableDashboard /></SuspenseWrapper>,
    title: 'Dashboard',
    description: 'Comprehensive HR dashboard with real-time metrics',
    icon: 'dashboard',
    mobileOptimized: true
  },

  // HR Management Routes - Fix navigation redirect
  {
    path: '/hr',
    element: <Navigate to="/hr/employees" replace />,
    title: 'Human Resources',
    icon: 'people',
    children: [
      {
        path: '/hr/employees',
        element: <SuspenseWrapper><EmployeeDirectory /></SuspenseWrapper>,
        title: 'Employee Directory',
        description: 'Comprehensive employee directory with advanced search',
        mobileOptimized: true
      },
      // Removed: /hr/employee-management route - conflicts with App.tsx redirect to /hr/employees
      {
        path: '/hr/organization-chart',
        element: <SuspenseWrapper><OrganizationChart /></SuspenseWrapper>,
        title: 'Organization Chart',
        description: 'Interactive organizational structure visualization'
      },
      {
        path: '/hr/recruitment',
        element: <SuspenseWrapper><RecruitmentDashboard /></SuspenseWrapper>,
        title: 'Recruitment',
        description: 'Comprehensive recruitment and hiring management',
        requiresPermission: ['recruitment.manage']
      },
      // Removed: /hr/performance route - conflicts with App.tsx route that uses PerformanceManagement
      {
        path: '/hr/training',
        element: <SuspenseWrapper><TrainingDashboard /></SuspenseWrapper>,
        title: 'Training & Learning',
        description: 'Employee training programs and skill development'
      },
      {
        path: '/hr/onboarding',
        element: <SuspenseWrapper><OnboardingDashboard /></SuspenseWrapper>,
        title: 'Onboarding',
        description: 'Employee onboarding and offboarding workflows',
        requiresPermission: ['onboarding.manage']
      },
      {
        path: '/hr/documents',
        element: <SuspenseWrapper><DocumentManagement /></SuspenseWrapper>,
        title: 'Document Management',
        description: 'Secure document storage and management'
      },
      {
        path: '/hr/benefits',
        element: <SuspenseWrapper><BenefitsManagement /></SuspenseWrapper>,
        title: 'Benefits Administration',
        description: 'Employee benefits and compensation management',
        requiresPermission: ['benefits.manage']
      }
    ]
  },

  // Removed: /attendance route - conflicts with App.tsx route that uses ComprehensiveAttendanceSystem

  // Leave Management
  {
    path: '/leave',
    element: <Navigate to="/leave/dashboard" replace />,
    title: 'Leave Management',
    icon: 'assignment',
    children: [
      {
        path: '/leave/dashboard',
        element: <SuspenseWrapper><LeaveManagementDashboard /></SuspenseWrapper>,
        title: 'Leave Dashboard',
        description: 'Comprehensive leave management dashboard',
        mobileOptimized: true
      },
      {
        path: '/leave/balance',
        element: <SuspenseWrapper><LeaveBalanceTracker /></SuspenseWrapper>,
        title: 'Leave Balance',
        description: 'Track and manage leave balances',
        mobileOptimized: true
      },
      {
        path: '/leave/calendar',
        element: <SuspenseWrapper><TeamLeaveCalendar /></SuspenseWrapper>,
        title: 'Team Calendar',
        description: 'Visual team leave calendar'
      },
      {
        path: '/leave/analytics',
        element: <SuspenseWrapper><LeaveAnalytics /></SuspenseWrapper>,
        title: 'Leave Analytics',
        description: 'Advanced leave analytics and insights',
        requiresPermission: ['leave.analytics']
      }
    ]
  },

  // Payroll Management
  {
    path: '/payroll',
    element: <SuspenseWrapper><PayrollDashboard /></SuspenseWrapper>,
    title: 'Payroll',
    description: 'Comprehensive payroll processing and management',
    icon: 'attach_money',
    requiresPermission: ['payroll.manage']
  },

  // Self Service Portal
  {
    path: '/self-service',
    element: <SuspenseWrapper><EmployeeSelfService /></SuspenseWrapper>,
    title: 'Employee Self Service',
    description: 'Employee self-service portal for personal tasks',
    icon: 'person',
    mobileOptimized: true
  },

  // Analytics & Reporting
  {
    path: '/analytics',
    element: <SuspenseWrapper><AdvancedAnalyticsDashboard /></SuspenseWrapper>,
    title: 'Analytics & Reports',
    description: 'Advanced HR analytics and business intelligence',
    icon: 'analytics',
    requiresPermission: ['analytics.view']
  },

  // Settings & Administration
  {
    path: '/settings',
    element: <SuspenseWrapper><SettingsDashboard /></SuspenseWrapper>,
    title: 'Settings',
    description: 'System settings and administration',
    icon: 'settings',
    requiresPermission: ['settings.manage']
  },

  // Catch-all redirect
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
    title: 'Redirect',
    isPublic: true
  }
]

// ===========================================
// ROUTE UTILITIES
// ===========================================

// Get all routes flattened
export const getAllRoutes = (): RouteConfig[] => {
  const flattenRoutes = (routes: RouteConfig[]): RouteConfig[] => {
    return routes.reduce((acc: RouteConfig[], route) => {
      acc.push(route)
      if (route.children) {
        acc.push(...flattenRoutes(route.children))
      }
      return acc
    }, [])
  }
  
  return flattenRoutes(routeConfig)
}

// Get route by path
export const getRouteByPath = (path: string): RouteConfig | undefined => {
  return getAllRoutes().find(route => route.path === path)
}

// Get mobile-optimized routes
export const getMobileOptimizedRoutes = (): RouteConfig[] => {
  return getAllRoutes().filter(route => route.mobileOptimized)
}

// Get public routes
export const getPublicRoutes = (): RouteConfig[] => {
  return getAllRoutes().filter(route => route.isPublic)
}

// Get routes that require specific permissions
export const getRestrictedRoutes = (): RouteConfig[] => {
  return getAllRoutes().filter(route => route.requiresPermission)
}

// Generate breadcrumbs for a given path
export const generateBreadcrumbs = (path: string): Array<{ title: string; path: string }> => {
  const pathSegments = path.split('/').filter(Boolean)
  const breadcrumbs: Array<{ title: string; path: string }> = []
  
  let currentPath = ''
  
  pathSegments.forEach(segment => {
    currentPath += `/${segment}`
    const route = getRouteByPath(currentPath)
    
    if (route) {
      breadcrumbs.push({
        title: route.title,
        path: currentPath
      })
    }
  })
  
  return breadcrumbs
}

// Navigation items for sidebar/menu
export const getNavigationItems = () => {
  return routeConfig
    .filter(route => route.path !== '*' && !route.path.includes('*'))
    .map(route => ({
      id: route.path.replace('/', ''),
      label: route.title,
      path: route.path,
      icon: route.icon,
      description: route.description,
      children: route.children?.map(child => ({
        id: child.path.replace('/', '').replace('/', '-'),
        label: child.title,
        path: child.path,
        icon: child.icon,
        description: child.description,
        requiresPermission: child.requiresPermission
      })),
      requiresPermission: route.requiresPermission
    }))
}

// Quick actions for mobile
export const getQuickActions = () => [
  {
    id: 'attendance',
    label: 'Clock In/Out',
    path: '/attendance',
    icon: 'schedule',
    color: 'primary'
  },
  {
    id: 'leave-request',
    label: 'Request Leave',
    path: '/leave/dashboard',
    icon: 'assignment',
    color: 'secondary'
  },
  {
    id: 'employee-directory',
    label: 'Employees',
    path: '/hr/employees',
    icon: 'people',
    color: 'info'
  },
  {
    id: 'self-service',
    label: 'My Profile',
    path: '/self-service',
    icon: 'person',
    color: 'success'
  }
]
