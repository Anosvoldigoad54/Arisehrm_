// Main unified login system
export { default as UnifiedLoginSystem } from './UnifiedLoginSystem'

// Legacy login selector (keeping for backward compatibility)
// export { default as RoleBasedLoginSelector } from './RoleBasedLoginSelector';

// Role-specific login pages (deprecated - use UnifiedLoginSystem instead)
// export { default as EmployeeLogin } from './EmployeeLogin';
// export { default as TeamLeaderLogin } from './TeamLeaderLogin';
// export { default as HRManagerLogin } from './HRManagerLogin';
// export { default as DepartmentManagerLogin } from './DepartmentManagerLogin';
// export { default as AdminLogin } from './AdminLogin';
// export { default as SuperAdminLogin } from './SuperAdminLogin';

// Other auth components
// export { default as LoginPage } from './LoginPage';
// export { default as LoginPageSimple } from './LoginPageSimple';
export { default as PasswordChangeDialog } from './PasswordChangeDialog'
export { default as AuthGuard } from './AuthGuard'
// export { default as ProtectedRoute } from './ProtectedRoute';
// export { default as RoleGuard } from './RoleGuard';
export { default as PermissionGuard } from './PermissionGuard'
export { default as AuthGuardSimple } from './AuthGuardSimple'