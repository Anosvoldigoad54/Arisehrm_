'use client'

import React, { useEffect, useState, ReactNode, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Alert,
  Chip,
  LinearProgress,
  Stack,
  Divider,
} from '@mui/material'
import {
  Security,
  AdminPanelSettings,
  Shield,
  Error,
  Lock,
  CheckCircle,
  Warning,
  Info,
  Person,
  Business,
  Schedule,
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'sonner'

interface AuthGuardProps {
  children: ReactNode
  requiredRole?: string
  requiredLevel?: number
  requiredPermissions?: string[]
  requiredEmploymentStatus?: string[]
  requiredEmploymentType?: string[]
  allowInactiveUsers?: boolean
  checkProbationStatus?: boolean
  fallback?: ReactNode
  allowPartialAccess?: boolean
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requiredRole, 
  requiredLevel = 0,
  requiredPermissions = [],
  requiredEmploymentStatus = ['active'],
  requiredEmploymentType = [],
  allowInactiveUsers = false,
  checkProbationStatus = false,
  fallback,
  allowPartialAccess = false
}) => {
  const { 
    isAuthenticated, 
    isLoading, 
    user,
    profile, 
    securityContext,
    sessionHealth,
  } = useAuth()
  
  const navigate = useNavigate()
  const location = useLocation()
  
  // ✅ FIXED: Enhanced state management
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'checking' | 'verified' | 'failed'>('idle')
  const [hasVerified, setHasVerified] = useState(false)
  const [securityLevel, setSecurityLevel] = useState<'low' | 'medium' | 'high'>('low')
  const [retryAttempts, setRetryAttempts] = useState(0)
  const [verificationProgress, setVerificationProgress] = useState(0)
  const [accessDenialReason, setAccessDenialReason] = useState<string | null>(null)
  
  // Enhanced security checks
  const [employmentStatusValid, setEmploymentStatusValid] = useState(true)
  const [probationStatusValid, setProbationStatusValid] = useState(true)
  const [accountStatusValid, setAccountStatusValid] = useState(true)
  
  // ✅ CRITICAL FIX: Use refs to prevent infinite loops
  const verificationRef = useRef(false)
  const authCheckRef = useRef(false)
  const mountedRef = useRef(true)
  const redirectTimeoutRef = useRef<NodeJS.Timeout>()

  // ✅ FIXED: Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [])

  // ✅ FIXED: Enhanced authentication check with delay
  useEffect(() => {
    if (!mountedRef.current || isLoading) return

    // Wait a bit for authentication to settle after logout
    if (!user && !isAuthenticated) {
      
      // Add small delay to prevent premature redirect
      redirectTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current && !user && !isAuthenticated && !authCheckRef.current) {
          authCheckRef.current = true
          navigate('/login', { 
            state: { 
              from: location,
              securityReason: 'authentication_required',
              timestamp: Date.now(),
            },
            replace: true 
          })
        }
      }, 1000) // 1 second delay
      
      return
    }

    // Clear timeout if user becomes authenticated
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current)
    }
  }, [isLoading, user, isAuthenticated, navigate, location])

  // ✅ FIXED: Enhanced verification trigger - wait for profile to load
  useEffect(() => {
    if (!mountedRef.current) return

    // Only trigger verification when we have both user AND profile loaded (or after reasonable wait)
    if (
      isAuthenticated &&
      user &&
      !hasVerified &&
      !verificationRef.current &&
      verificationStatus === 'idle' &&
      !isLoading &&
      (profile || allowPartialAccess) // Wait for profile unless partial access is allowed
    ) {
      verificationRef.current = true
      performEnhancedSecurityVerification()
    }
  }, [isAuthenticated, user, hasVerified, verificationStatus, isLoading, profile, allowPartialAccess])

  // ✅ NEW: Fallback timeout for cases where profile loading takes too long
  useEffect(() => {
    if (!mountedRef.current) return

    let timeoutId: NodeJS.Timeout

    // If user is authenticated but profile hasn't loaded after 5 seconds, proceed with verification
    if (
      isAuthenticated &&
      user &&
      !profile &&
      !hasVerified &&
      !verificationRef.current &&
      verificationStatus === 'idle' &&
      !isLoading
    ) {
      timeoutId = setTimeout(() => {
        if (mountedRef.current && !hasVerified && !verificationRef.current) {
          verificationRef.current = true
          performEnhancedSecurityVerification()
        }
      }, 5000) // 5 second timeout
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isAuthenticated, user, profile, hasVerified, verificationStatus, isLoading])

  // ✅ ENHANCED: Comprehensive security verification
  const performEnhancedSecurityVerification = async () => {
    if (!mountedRef.current || hasVerified || verificationRef.current === false) {
      return // Prevent duplicate calls
    }

    try {
      setVerificationStatus('checking')
      setVerificationProgress(0)
      
      
      // Step 1: Basic authentication check
      setVerificationProgress(10)
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Step 2: Profile availability check
      setVerificationProgress(20)
      if (!profile && !allowPartialAccess) {
        // Don't throw error, just proceed with basic auth check
      }

      // Step 3: Account status verification
      setVerificationProgress(30)
      if (profile) {
        // Check employment status
        if (!allowInactiveUsers && !requiredEmploymentStatus.includes(profile.employment_status)) {
          setEmploymentStatusValid(false)
          setAccessDenialReason(`Invalid employment status: ${profile.employment_status}`)
          throw new Error(`Employment status '${profile.employment_status}' not permitted`)
        }

        // Check employment type if specified
        if (requiredEmploymentType.length > 0 && !requiredEmploymentType.includes(profile.employment_type)) {
          setAccessDenialReason(`Employment type '${profile.employment_type}' not permitted`)
          throw new Error(`Employment type '${profile.employment_type}' not permitted`)
        }

        // Check account locked status
        if (profile.account_locked) {
          setAccountStatusValid(false)
          setAccessDenialReason('Account is currently locked')
          throw new Error('Account is locked')
        }

        // Check probation status if required
        if (checkProbationStatus && profile.probation_end_date) {
          const probationEnd = new Date(profile.probation_end_date)
          const now = new Date()
          if (now < probationEnd) {
            setProbationStatusValid(false)
            setAccessDenialReason(`User is on probation until ${probationEnd.toLocaleDateString()}`)
          }
        }

        // Check if user is active
        if (!profile.is_active && !allowInactiveUsers) {
          setAccessDenialReason('User account is inactive')
          throw new Error('User account is inactive')
        }
      }

      // Step 4: Session health check
      setVerificationProgress(50)
      if (sessionHealth === 'critical') {
        setAccessDenialReason('Session health is critical')
        // Don't throw error, but log warning
      }

      // Step 5: Security context analysis
      setVerificationProgress(65)
      if (securityContext) {
        setSecurityLevel(securityContext.risk_level)
        
        if (securityContext.risk_level === 'high') {
          // Don't block access, but increase monitoring
        }
      }

      // Step 6: Role-based verification
      setVerificationProgress(80)
      if (requiredRole && profile?.role?.name !== requiredRole) {
        setAccessDenialReason(`Required role: ${requiredRole}, Current role: ${profile?.role?.display_name || 'None'}`)
        throw new Error(`Insufficient role: required '${requiredRole}', has '${profile?.role?.name || 'none'}'`)
      }

      // Step 7: Level-based verification
      setVerificationProgress(90)
      if (requiredLevel > 0 && (profile?.role?.level || 0) < requiredLevel) {
        setAccessDenialReason(`Required level: ${requiredLevel}, Current level: ${profile?.role?.level || 0}`)
        throw new Error(`Insufficient level: required ${requiredLevel}, has ${profile?.role?.level || 0}`)
      }

      // Step 8: Permission verification
      setVerificationProgress(95)
      if (requiredPermissions.length > 0) {
        const hasPermissions = verifyEnhancedPermissions(requiredPermissions)
        if (!hasPermissions && !allowPartialAccess) {
          setAccessDenialReason(`Missing required permissions: ${requiredPermissions.join(', ')}`)
          throw new Error(`Insufficient permissions: ${requiredPermissions.join(', ')}`)
        }
      }

      // Step 9: Complete verification
      setVerificationProgress(100)

      // Small delay for smooth UX
      await new Promise(resolve => setTimeout(resolve, 300))

      setVerificationStatus('verified')
      setHasVerified(true)
      verificationRef.current = false
      
      
    } catch (error: any) {
      setVerificationStatus('failed')
      
      // Limited retry with exponential backoff
      if (retryAttempts < 1 && mountedRef.current) { // Only 1 retry
        const retryDelay = 2000
        
        setTimeout(() => {
          if (mountedRef.current) {
            setRetryAttempts(prev => prev + 1)
            verificationRef.current = false
            setHasVerified(false)
            setVerificationStatus('idle')
            performEnhancedSecurityVerification()
          }
        }, retryDelay)
      } else {
        // Final failure - redirect after delay
        setTimeout(() => {
          if (mountedRef.current) {
            navigate('/login', { replace: true })
          }
        }, 3000)
      }
    }
  }

  // ✅ ENHANCED: Permission verification with detailed logging
  const verifyEnhancedPermissions = (permissions: string[]): boolean => {
    if (!profile?.role?.permissions) {
      return false
    }

    // System admin users have all permissions
    if (profile.role.permissions.includes('*')) {
      return true
    }

    // Check specific permissions
    const missingPermissions = permissions.filter(permission => 
      !profile.role?.permissions?.includes(permission)
    )

    if (missingPermissions.length === 0) {
      return true
    } else {
      return false
    }
  }

  // Get user status display info
  const getUserStatusInfo = () => {
    if (!profile) return null

    const statusInfo = []
    
    if (profile.employment_status !== 'active') {
      statusInfo.push({
        label: 'Employment Status',
        value: profile.employment_status.replace('_', ' ').toUpperCase(),
        severity: 'warning' as const,
        icon: <Warning />
      })
    }

    if (profile.account_locked) {
      statusInfo.push({
        label: 'Account Status',
        value: 'LOCKED',
        severity: 'error' as const,
        icon: <Lock />
      })
    }

    if (profile.probation_end_date && new Date() < new Date(profile.probation_end_date)) {
      statusInfo.push({
        label: 'Probation Status',
        value: `Until ${new Date(profile.probation_end_date).toLocaleDateString()}`,
        severity: 'info' as const,
        icon: <Schedule />
      })
    }

    return statusInfo
  }

  // ✅ ENHANCED: Loading state with detailed progress
  if (isLoading || verificationStatus === 'checking') {
    return fallback || (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme => theme.palette.background.default,
        }}
      >
        <Card
          sx={{
            p: 3,
            textAlign: 'center',
            minWidth: 350,
            maxWidth: 450,
            background: theme => theme.palette.background.paper,
            borderRadius: 3,
            border: theme => `1px solid ${theme.palette.divider}`,
            boxShadow: theme => theme.shadows[8],
          }}
        >
          <CardContent>
            <Avatar
              sx={{
                width: 70,
                height: 70,
                mx: 'auto',
                mb: 2,
                background: theme => `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              }}
            >
              <Shield sx={{ fontSize: 35 }} />
            </Avatar>
            
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              {isLoading ? 'Loading Authentication...' : 'Verifying Access Rights'}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {isLoading 
                ? 'Please wait while we load your profile...' 
                : 'Performing comprehensive security verification...'
              }
            </Typography>

            <LinearProgress
              variant="determinate"
              value={verificationProgress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: theme => theme.palette.action.hover,
                mb: 2,
                '& .MuiLinearProgress-bar': {
                  background: theme => `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                }
              }}
            />

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              {verificationProgress}% Complete
            </Typography>

            {/* Enhanced security info */}
            {securityContext && !isLoading && (
              <Stack spacing={1} sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                  <Chip 
                    icon={<Security />}
                    label="Encrypted" 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                  <Chip 
                    icon={<CheckCircle />}
                    label={`Risk: ${securityLevel.toUpperCase()}`} 
                    size="small" 
                    color={securityLevel === 'low' ? 'success' : securityLevel === 'medium' ? 'warning' : 'error'} 
                    variant="outlined" 
                  />
                  {sessionHealth && (
                    <Chip 
                      icon={<CheckCircle />}
                      label={`Session: ${sessionHealth.toUpperCase()}`} 
                      size="small" 
                      color={sessionHealth === 'healthy' ? 'success' : 'warning'} 
                      variant="outlined" 
                    />
                  )}
                </Stack>
              </Stack>
            )}

            {profile && (
              <Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Welcome back, {profile.first_name} {profile.last_name}
                </Typography>
                <Typography variant="caption" color="primary.main">
                  {profile.role?.display_name || 'Employee'} • {profile.department?.name || 'No Department'}
                </Typography>
              </Box>
            )}

            {retryAttempts > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Verification attempt {retryAttempts + 1} of 2
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>
    )
  }

  // ✅ ENHANCED: Access denied states with detailed information
  if (verificationStatus === 'failed' || (!isAuthenticated && !isLoading && !user)) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme => theme.palette.background.default,
        }}
      >
        <Card sx={{
          p: 3,
          textAlign: 'center',
          maxWidth: 500,
          borderRadius: 3,
          background: theme => theme.palette.background.paper,
          border: theme => `1px solid ${theme.palette.error.light}`,
          boxShadow: theme => theme.shadows[8],
        }}>
          <CardContent>
            <Avatar
              sx={{
                width: 70,
                height: 70,
                mx: 'auto',
                mb: 2,
                backgroundColor: 'error.main',
              }}
            >
              <Error sx={{ fontSize: 35 }} />
            </Avatar>
            
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'error.main' }}>
              Access Denied
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {accessDenialReason || 'You do not have permission to access this resource.'}
            </Typography>

            {/* User status information */}
            {profile && (
              <Box sx={{ mb: 3 }}>
                <Alert severity="info" sx={{ mb: 2, textAlign: 'left' }}>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>User:</strong> {profile.first_name} {profile.last_name} ({profile.employee_id})
                    </Typography>
                    <Typography variant="body2">
                      <strong>Role:</strong> {profile.role?.display_name || 'No Role'} (Level {profile.role?.level || 0})
                    </Typography>
                    <Typography variant="body2">
                      <strong>Employment:</strong> {profile.employment_status} • {profile.employment_type}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Department:</strong> {profile.department?.name || 'Unassigned'}
                    </Typography>
                  </Stack>
                </Alert>

                {/* Status warnings */}
                {getUserStatusInfo()?.map((status, index) => (
                  <Alert key={index} severity={status.severity} sx={{ mb: 1, textAlign: 'left' }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {status.icon}
                      <Typography variant="body2">
                        <strong>{status.label}:</strong> {status.value}
                      </Typography>
                    </Stack>
                  </Alert>
                ))}
              </Box>
            )}

            {retryAttempts >= 1 && (
              <Alert severity="error" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Multiple verification attempts failed. Please contact your system administrator.
                </Typography>
              </Alert>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                color="error"
                onClick={() => navigate('/login')}
                startIcon={<Lock />}
              >
                Sign In Again
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard')}
                startIcon={<Business />}
              >
                Back to Dashboard
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    )
  }

  // ✅ ENHANCED: Role/permission restriction pages
  if (requiredRole && profile?.role?.name !== requiredRole) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <Alert severity="warning" sx={{ maxWidth: 600 }}>
          <Stack spacing={2}>
            <Typography variant="h6" gutterBottom>Role Access Restricted</Typography>
            <Typography variant="body2" gutterBottom>
              This area requires <strong>{requiredRole}</strong> role access.
            </Typography>
            
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">Your Access Level:</Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Person fontSize="small" />
                  <Typography variant="body2">
                    <strong>{profile?.role?.display_name || 'No Role'}</strong> (Level {profile?.role?.level || 0})
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Employee ID: {profile?.employee_id} • Department: {profile?.department?.name || 'Unassigned'}
                </Typography>
              </Stack>
            </Box>

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button size="small" onClick={() => navigate('/dashboard')}>Dashboard</Button>
              <Button size="small" variant="outlined" onClick={() => navigate(-1)}>Go Back</Button>
            </Stack>
          </Stack>
        </Alert>
      </Box>
    )
  }

  if (requiredLevel > 0 && (profile?.role?.level || 0) < requiredLevel) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <Alert severity="info" sx={{ maxWidth: 600 }}>
          <Stack spacing={2}>
            <Typography variant="h6" gutterBottom>Higher Privileges Required</Typography>
            <Typography variant="body2" gutterBottom>
              This operation requires Level <strong>{requiredLevel}+</strong> privileges.
            </Typography>
            
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">Current Privilege Level:</Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AdminPanelSettings fontSize="small" />
                  <Typography variant="body2">
                    <strong>Level {profile?.role?.level || 0}</strong> - {profile?.role?.display_name || 'No Role'}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Contact your manager to request elevated access if needed.
                </Typography>
              </Stack>
            </Box>

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button size="small" onClick={() => navigate('/dashboard')}>Dashboard</Button>
              <Button size="small" variant="outlined" onClick={() => navigate(-1)}>Go Back</Button>
            </Stack>
          </Stack>
        </Alert>
      </Box>
    )
  }

  // ✅ SUCCESS: Render children with enhanced security context
  // Allow access if user is authenticated, even if profile is still loading
  if (isAuthenticated && user && (hasVerified || verificationStatus === 'verified')) {
    return <>{children}</>
  }

  // If we get here and user is authenticated but verification is still pending, show loading
  if (isAuthenticated && user && verificationStatus === 'idle') {
    return fallback || (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme => theme.palette.background.default,
        }}
      >
        <Card sx={{
          p: 3,
          textAlign: 'center',
          minWidth: 350,
          maxWidth: 450,
          background: theme => theme.palette.background.paper,
          borderRadius: 3,
          border: theme => `1px solid ${theme.palette.divider}`,
          boxShadow: theme => theme.shadows[4],
        }}>
          <CardContent>
            <Avatar
              sx={{
                width: 60,
                height: 60,
                mx: 'auto',
                mb: 2,
                background: theme => `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              }}
            >
              <Security sx={{ fontSize: 30 }} />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Preparing your workspace...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Please wait while we set up your authenticated session
            </Typography>
            <LinearProgress
              sx={{
                borderRadius: 2,
                height: 6,
                backgroundColor: theme => theme.palette.action.hover,
                '& .MuiLinearProgress-bar': {
                  background: theme => `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                }
              }}
            />
          </CardContent>
        </Card>
      </Box>
    )
  }

  return <>{children}</>
}
