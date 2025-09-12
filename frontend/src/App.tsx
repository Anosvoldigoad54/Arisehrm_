'use client'

import React, { Suspense, lazy, useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { Box, CircularProgress, Typography, useTheme, Alert } from '@mui/material'
import ErrorBoundary from './components/common/ErrorBoundary'
import { RouteErrorBoundary } from './components/common/RouteErrorBoundary'
import ErrorBoundaryEnhanced from './components/common/ErrorBoundaryEnhanced'
import { GlobalErrorProvider } from './hooks/useErrorHandling'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeContextProvider } from './contexts/ThemeContext'
import { AuthGuardSimple as AuthGuard } from './components/auth/AuthGuardSimple'
import { MainLayout } from './components/layout/MainLayout'
// CSS imports consolidated in main.tsx for better performance
import { log } from './services/loggingService'

// PWA Imports
import { usePWAManager, PWAUpdateBanner, PWAInstallButton } from './utils/pwaManager'
import { PWAStatusIndicator } from './hooks/usePWAOfflineManager'
import { useBackgroundSync } from './utils/backgroundSync'

// Lazy load components for better performance
const Dashboard = lazy(() => import('./components/dashboard/ConsolidatedDashboard'))
const EmployeeDirectory = lazy(() => import('./components/employees/EmployeeDirectoryConsolidated'))
const TeamsPage = lazy(() => import('./pages/Teams'))
const AttendanceTracking = lazy(() => import('./components/attendance/AttendanceSystemComprehensive'))
const LocationBasedAttendance = lazy(() => import('./components/attendance/LocationBasedAttendance'))
const LeaveManagement = lazy(() => import('./components/leave/LeaveManagementComprehensive'))
const PayrollDashboard = lazy(() => import('./components/payroll/DashboardPayroll'))
const AdvancedAnalyticsDashboard = lazy(() => import('./components/analytics/AdvancedAnalyticsDashboard').then(module => ({ default: module.AdvancedAnalyticsDashboard })))
const EmployeeProfile = lazy(() => import('./components/employees/EmployeeProfile'))
const OrganizationChart = lazy(() => import('./components/organization/OrganizationChart').then(module => ({ default: module.OrganizationChart })))
const DocumentManagement = lazy(() => import('./components/documents/DocumentManagement'))
const AdminPanel = lazy(() => import('./components/admin/DatabaseAdminPanel'))
const SuperAdminUserCreation = lazy(() => import('./components/admin/SuperAdminUserCreation'))
const BenefitsManagement = lazy(() => import('./components/benefits/BenefitsManagement'))
const ProjectManagement = lazy(() => import('./components/projects/ProjectManagement'))
const UnifiedLoginSystem = lazy(() => import('./components/auth/UnifiedLoginSystem'))
const SettingsPage = lazy(() => import('./components/settings/SettingsPage'))
const ReportsPage = lazy(() => import('./components/reports/ReportsPage'))
const AuditReportsAndAnalytics = lazy(() => import('./components/reports/ReportsAuditAnalytics'))
// Removed: EmployeeManagementSystem - unused component (no routes reference it)
const MessagingSystem = lazy(() => import('./components/messaging/MessagingSystem'))
const PasswordChangeDialog = lazy(() => import('./components/auth/PasswordChangeDialog'))
const PerformanceManagement = lazy(() => import('./components/performance/PerformanceManagement'))
const HiringManagement = lazy(() => import('./components/hiring/HiringManagement'))
const InterviewManagement = lazy(() => import('./components/interviews/InterviewManagement'))
const RoleBasedDashboard = lazy(() => import('./components/dashboard/RoleBasedDashboard'))
const TrainingManagement = lazy(() => import('./components/training/TrainingManagement'))
const AnnouncementCenter = lazy(() => import('./components/announcements/AnnouncementCenter'))
const ExpenseManagement = lazy(() => import('./components/expenses/ExpenseManagement'))
const ComplianceManagement = lazy(() => import('./components/compliance/ComplianceManagement'))
const AIResumeAnalyzer = lazy(() => import('./components/ai/AIResumeAnalyzer'))
const AIInsights = lazy(() => import('./components/ai/AIInsights'))
const AIAttendanceAnalyzer = lazy(() => import('./components/ai/AIAttendanceAnalyzer'))
const AILeaveRecommendations = lazy(() => import('./components/ai/AILeaveRecommendations'))
const HRChatbot = lazy(() => import('./components/ai/HRChatbot'))

// Simple loading fallback
function LoadingScreen() {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress />
    </Box>
  )
}

// Route-level loading component
function RouteLoading() {
  const theme = useTheme()
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: 2,
        p: 4
      }}
    >
      <CircularProgress 
        size={40} 
        thickness={3}
        sx={{ color: theme.palette.primary.main }} 
      />
      <Typography variant="body2" color="text.secondary">
        Loading module...
      </Typography>
    </Box>
  )
}

// Simple route wrapper with error boundary
function SimpleRoute({ children, routeName }: { children: React.ReactNode, routeName?: string }) {
  return (
    <RouteErrorBoundary routeName={routeName}>
      <Suspense fallback={<RouteLoading />}>
        {children}
      </Suspense>
    </RouteErrorBoundary>
  )
}

function AppRoutes() {
  return (
    <Routes>
      {/* Root route - redirect to login if not authenticated */}
      <Route index element={<Navigate to="/login" replace />} />
      
      {/* NEW: Unified login system - primary login route */}
      <Route path="/login" element={<UnifiedLoginSystem />} />
      
      {/* Removed legacy routes that reference missing components */}
      
      {/* Protected routes */}
      <Route
        path="/*"
        element={
          <AuthGuard>
            <MainLayout>
              <Routes>
                {/* Dashboard Routes */}
                <Route 
                  path="dashboard" 
                  element={
                    <SimpleRoute routeName="Dashboard">
                      <RoleBasedDashboard />
                    </SimpleRoute>
                  } 
                />
                <Route 
                  path="dashboard/live" 
                  element={
                    <SimpleRoute routeName="Live Dashboard">
                      <Dashboard />
                    </SimpleRoute>
                  } 
                />

                {/* HR Routes */}
                <Route 
                  path="hr/teams" 
                  element={
                    <SimpleRoute>
                      <TeamsPage />
                    </SimpleRoute>
                  } 
                />
                <Route 
                  path="hr/employees" 
                  element={
                    <SimpleRoute>
                      <EmployeeDirectory />
                    </SimpleRoute>
                  } 
                />
                <Route 
                  path="hr/employee-management" 
                  element={
                    <SimpleRoute>
                      <Navigate to="/hr/employees" replace />
                    </SimpleRoute>
                  } 
                />
                <Route 
                  path="hr/organization-chart" 
                  element={
                    <SimpleRoute>
                      <OrganizationChart />
                    </SimpleRoute>
                  } 
                />
                <Route 
                  path="hr/recruitment" 
                  element={
                    <SimpleRoute>
                      <EmployeeDirectory />
                    </SimpleRoute>
                  } 
                />
                <Route 
                  path="hr/performance" 
                  element={
                    <SimpleRoute>
                      <PerformanceManagement />
                    </SimpleRoute>
                  } 
                />
                <Route 
                  path="hr/hiring" 
                  element={
                    <SimpleRoute>
                      <HiringManagement />
                    </SimpleRoute>
                  } 
                />
                <Route 
                  path="hr/interviews" 
                  element={
                    <SimpleRoute>
                      <InterviewManagement />
                    </SimpleRoute>
                  } 
                />
                <Route 
                  path="hr/training" 
                  element={
                    <SimpleRoute>
                      <TrainingManagement />
                    </SimpleRoute>
                  } 
                />
                <Route 
                  path="hr/onboarding" 
                  element={
                    <SimpleRoute>
                      <HiringManagement />
                    </SimpleRoute>
                  } 
                />
                <Route 
                  path="hr/documents" 
                  element={
                    <SimpleRoute>
                      <DocumentManagement />
                    </SimpleRoute>
                  } 
                />
                <Route 
                  path="hr/benefits" 
                  element={
                    <SimpleRoute>
                      <BenefitsManagement />
                    </SimpleRoute>
                  } 
                />
                <Route 
                  path="hr/announcements" 
                  element={
                    <SimpleRoute>
                      <AnnouncementCenter />
                    </SimpleRoute>
                  } 
                />
                <Route 
                  path="hr/compliance" 
                  element={
                    <SimpleRoute>
                      <ComplianceManagement />
                    </SimpleRoute>
                  } 
                />
                <Route 
                  path="hr/expenses" 
                  element={
                    <SimpleRoute>
                      <ExpenseManagement />
                    </SimpleRoute>
                  } 
                />

                {/* AI Routes */}
                <Route 
                  path="ai/resume-analyzer" 
                  element={
                    <SimpleRoute>
                      <AIResumeAnalyzer />
                    </SimpleRoute>
                  } 
                />
                <Route 
                  path="ai/insights" 
                  element={
                    <SimpleRoute>
                      <AIInsights />
                    </SimpleRoute>
                  } 
                />
                <Route 
                  path="ai/attendance-analyzer" 
                  element={
                    <SimpleRoute>
                      <AIAttendanceAnalyzer />
                    </SimpleRoute>
                  } 
                />
                <Route 
                  path="ai/leave-recommendations" 
                  element={
                    <SimpleRoute>
                      <AILeaveRecommendations />
                    </SimpleRoute>
                  } 
                />
                <Route 
                  path="ai/chatbot" 
                  element={
                    <SimpleRoute>
                      <HRChatbot />
                    </SimpleRoute>
                  } 
                />

                {/* Attendance Routes */}
                <Route 
                  path="attendance" 
                  element={
                    <SimpleRoute>
                      <AttendanceTracking />
                    </SimpleRoute>
                  } 
                />
                <Route 
                  path="attendance/location" 
                  element={
                    <SimpleRoute>
                      <LocationBasedAttendance />
                    </SimpleRoute>
                  } 
                />
                {/* Leave Management Routes */}
                <Route 
                  path="leave" 
                  element={
                    <SimpleRoute>
                      <LeaveManagement />
                    </SimpleRoute>
                  } 
                />
                <Route 
                  path="leave/dashboard" 
                  element={
                    <SimpleRoute>
                      <LeaveManagement />
                    </SimpleRoute>
                  } 
                />

                {/* Payroll Routes */}
                <Route 
                  path="payroll" 
                  element={
                    <SimpleRoute>
                      <PayrollDashboard />
                    </SimpleRoute>
                  } 
                />

                {/* Projects Routes */}
                <Route 
                  path="projects" 
                  element={
                    <SimpleRoute>
                      <ProjectManagement />
                    </SimpleRoute>
                  } 
                />

                {/* Reports Routes */}
                <Route 
                  path="reports" 
                  element={
                    <SimpleRoute>
                      <ReportsPage />
                    </SimpleRoute>
                  } 
                />
                <Route 
                  path="reports/audit" 
                  element={
                    <SimpleRoute>
                      <AuditReportsAndAnalytics />
                    </SimpleRoute>
                  } 
                />

                {/* Self-Service Routes */}
                <Route 
                  path="self-service" 
                  element={
                    <SimpleRoute>
                      <Dashboard />
                    </SimpleRoute>
                  } 
                />

                {/* Admin Routes */}
                <Route 
                  path="admin/database" 
                  element={
                    <SimpleRoute>
                      <AdminPanel />
                    </SimpleRoute>
                  } 
                />
                <Route 
                  path="admin/users" 
                  element={
                    <SimpleRoute>
                      <SuperAdminUserCreation />
                    </SimpleRoute>
                  } 
                />

                {/* Settings Routes */}
                <Route 
                  path="settings" 
                  element={
                    <SimpleRoute>
                      <SettingsPage />
                    </SimpleRoute>
                  } 
                />

                {/* Default Routes */}
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </MainLayout>
          </AuthGuard>
        }
      />
    </Routes>
  )
}

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true)
  
  // PWA Management
  const pwaManager = usePWAManager()
  const backgroundSync = useBackgroundSync()

  useEffect(() => {
    // Initialize PWA features
    const initializePWA = async () => {
      try {
        console.log('[PWA] Initializing PWA features...')
        
        // Log PWA capabilities
        console.log('[PWA] Capabilities:', pwaManager.capabilities)
        console.log('[PWA] Status:', pwaManager.status)
        
        // Configure background sync
        if (backgroundSync.stats.pendingOperations > 0) {
          console.log(`[PWA] Found ${backgroundSync.stats.pendingOperations} pending offline operations`)
        }
        
      } catch (error) {
        console.error('[PWA] Initialization failed:', error)
      }
    }

    // Initialize app and PWA
    const timer = setTimeout(() => {
      initializePWA()
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  // ✅ FIXED: Skip PWA components during authentication
  const isLoginInProgress = sessionStorage.getItem('login_in_progress') === 'true' ||
                           sessionStorage.getItem('auth_in_progress') === 'true' ||
                           localStorage.getItem('auth_token') !== null ||
                           document.querySelector('.UnifiedLoginSystem') !== null ||
                           window.location.pathname.includes('/login');

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeContextProvider>
          <AuthProvider>
            <GlobalErrorProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Router
                  future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true
                  }}
                >
                  {/* PWA Update Banner - skip during auth */}
                  {!isLoginInProgress && <PWAUpdateBanner />}
                  
                  <AppRoutes />
                  
                  {/* PWA Status Indicator - skip during auth */}
                  {!isLoginInProgress && (process.env.NODE_ENV === 'development' || !backgroundSync.isOnline) && (
                    <Box
                      sx={{
                        position: 'fixed',
                        bottom: 20,
                        right: 20,
                        zIndex: 9999,
                      }}
                    >
                      <PWAStatusIndicator />
                    </Box>
                  )}
                  
                  {/* PWA Install Button - skip during auth */}
                  {!isLoginInProgress && pwaManager.status.canInstall && (
                    <Box
                      sx={{
                        position: 'fixed',
                        bottom: 20,
                        left: 20,
                        zIndex: 9999,
                      }}
                    >
                      <PWAInstallButton variant="button" />
                    </Box>
                  )}
                  
                  <Toaster
                    position="top-right"
                    richColors
                    closeButton
                    duration={4000}
                    toastOptions={{
                      style: {
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: 500,
                      },
                    }}
                  />
                </Router>
              </LocalizationProvider>
            </GlobalErrorProvider>
          </AuthProvider>
        </ThemeContextProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
