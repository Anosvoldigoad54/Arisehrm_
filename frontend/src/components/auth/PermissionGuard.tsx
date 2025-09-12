'use client'

import React, { ReactNode, useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Button,
  Stack,
  Chip,
  Avatar,
  Divider,
  Fade,
  Paper
} from '@mui/material'
import {
  Block,
  Security,
  Warning,
  Info,
  AdminPanelSettings,
  Business,
  Group,
  Person,
  Lock,
  Key,
  Shield,
  ErrorOutline
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { usePermissions, useRouteAccess } from '../../hooks/usePermissions'
import { ResourceType, ActionType } from '../../types/permissions'

interface PermissionGuardProps {
  children: ReactNode
  permissions?: string[]
  anyPermission?: boolean // If true, user needs ANY of the permissions, not ALL
  role?: string
  level?: number
  resource?: ResourceType
  action?: ActionType
  employmentStatus?: string[]
  fallback?: ReactNode
  showAccessDenied?: boolean
  redirectTo?: string
  customMessage?: string
  allowPartialAccess?: boolean
}

/**
 * Enhanced Permission Guard Component
 * Provides granular access control with detailed feedback
 */
export function PermissionGuard({
  children,
  permissions = [],
  anyPermission = false,
  role,
  level,
  resource,
  action,
  employmentStatus = ['active'],
  fallback,
  showAccessDenied = true,
  redirectTo,
  customMessage,
  allowPartialAccess = false
}: PermissionGuardProps) {
  const { profile } = useAuth()
  const userPermissions = usePermissions()
  const navigate = useNavigate()

  // Build effective permission requirements
  const effectivePermissions = useMemo(() => {
    const perms = [...permissions]
    
    if (resource && action) {
      perms.push(`${resource}.${action}`)
    }
    
    return perms
  }, [permissions, resource, action])

  // Check route access
  const hasRouteAccess = useRouteAccess(effectivePermissions, role, level)

  // Comprehensive access check
  const accessCheck = useMemo(() => {
    if (!profile) {
      return {
        hasAccess: false,
        reason: 'not_authenticated',
        details: 'User not authenticated'
      }
    }

    // Check employment status
    if (!employmentStatus.includes(profile.employment_status)) {
      return {
        hasAccess: false,
        reason: 'invalid_employment_status',
        details: `Employment status '${profile.employment_status}' not permitted. Required: ${employmentStatus.join(', ')}`
      }
    }

    // Check account status
    if (profile.account_locked) {
      return {
        hasAccess: false,
        reason: 'account_locked',
        details: 'User account is currently locked'
      }
    }

    if (!profile.is_active) {
      return {
        hasAccess: false,
        reason: 'account_inactive',
        details: 'User account is inactive'
      }
    }

    // Check role requirement
    if (role && profile.role?.name !== role) {
      return {
        hasAccess: false,
        reason: 'insufficient_role',
        details: `Required role: ${role}, Current role: ${profile.role?.display_name || 'None'}`
      }
    }

    // Check level requirement
    if (level && (profile.role?.level || 0) < level) {
      return {
        hasAccess: false,
        reason: 'insufficient_level',
        details: `Required level: ${level}, Current level: ${profile.role?.level || 0}`
      }
    }

    // Check permission requirements
    if (effectivePermissions.length > 0) {
      const hasPermissions = anyPermission
        ? userPermissions.hasAnyPermission(effectivePermissions)
        : userPermissions.hasAllPermissions(effectivePermissions)

      if (!hasPermissions && !allowPartialAccess) {
        return {
          hasAccess: false,
          reason: 'insufficient_permissions',
          details: `Missing required permissions: ${effectivePermissions.join(', ')}`
        }
      }
    }

    return {
      hasAccess: true,
      reason: 'authorized',
      details: 'Access granted'
    }
  }, [profile, userPermissions, effectivePermissions, anyPermission, role, level, employmentStatus, allowPartialAccess])

  // Handle redirect if specified
  React.useEffect(() => {
    if (!accessCheck.hasAccess && redirectTo) {
      navigate(redirectTo, { replace: true })
    }
  }, [accessCheck.hasAccess, redirectTo, navigate])

  // Get access denial reason icon and color
  const getAccessDenialInfo = (reason: string) => {
    switch (reason) {
      case 'not_authenticated':
        return { icon: <Lock />, color: 'error', severity: 'error' as const }
      case 'invalid_employment_status':
        return { icon: <Person />, color: 'warning', severity: 'warning' as const }
      case 'account_locked':
        return { icon: <Block />, color: 'error', severity: 'error' as const }
      case 'account_inactive':
        return { icon: <ErrorOutline />, color: 'warning', severity: 'warning' as const }
      case 'insufficient_role':
        return { icon: <AdminPanelSettings />, color: 'info', severity: 'info' as const }
      case 'insufficient_level':
        return { icon: <Security />, color: 'info', severity: 'info' as const }
      case 'insufficient_permissions':
        return { icon: <Key />, color: 'warning', severity: 'warning' as const }
      default:
        return { icon: <Warning />, color: 'error', severity: 'error' as const }
    }
  }

  // Render custom fallback if provided
  if (!accessCheck.hasAccess && fallback) {
    return <>{fallback}</>
  }

  // Render access denied screen
  if (!accessCheck.hasAccess && showAccessDenied) {
    const denialInfo = getAccessDenialInfo(accessCheck.reason)

    return (
      <Box 
        sx={{ 
          minHeight: '60vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          p: 2
        }}
      >
        <Fade in timeout={600}>
          <Paper
            elevation={8}
            sx={{
              p: 4,
              textAlign: 'center',
              maxWidth: 600,
              width: '100%',
              borderRadius: 3,
              background: (theme) => theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                : 'linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.05) 100%)'
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 3,
                backgroundColor: `${denialInfo.color}.main`,
                color: 'white'
              }}
            >
              <Shield sx={{ fontSize: 40 }} />
            </Avatar>

            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600, 
                mb: 2,
                color: `${denialInfo.color}.main`
              }}
            >
              Access Restricted
            </Typography>

            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ mb: 3 }}
            >
              {customMessage || accessCheck.details}
            </Typography>

            {/* User Information Card */}
            {profile && (
              <Card 
                variant="outlined" 
                sx={{ 
                  mb: 3, 
                  textAlign: 'left',
                  background: (theme) => theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.03)' 
                    : 'rgba(0,0,0,0.02)'
                }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        src={profile.profile_photo_url} 
                        sx={{ width: 48, height: 48 }}
                      >
                        {profile.first_name[0]}{profile.last_name[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {profile.first_name} {profile.last_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {profile.employee_id} • {profile.email}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider />

                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AdminPanelSettings fontSize="small" color="action" />
                        <Typography variant="body2">
                          <strong>Role:</strong> {profile.role?.display_name || 'No Role'} 
                          {profile.role?.level && ` (Level ${profile.role.level})`}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Business fontSize="small" color="action" />
                        <Typography variant="body2">
                          <strong>Department:</strong> {profile.department?.name || 'Unassigned'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person fontSize="small" color="action" />
                        <Typography variant="body2">
                          <strong>Employment:</strong> {profile.employment_status} • {profile.employment_type}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Permission Requirements */}
                    {effectivePermissions.length > 0 && (
                      <>
                        <Divider />
                        <Box>
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            Required Permissions:
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 0.5 }}>
                            {effectivePermissions.map((permission) => (
                              <Chip
                                key={permission}
                                label={permission}
                                size="small"
                                variant="outlined"
                                color={userPermissions.hasPermission(permission) ? 'success' : 'error'}
                                sx={{ fontSize: '0.75rem' }}
                              />
                            ))}
                          </Stack>
                        </Box>
                      </>
                    )}

                    {/* Current User Permissions Preview */}
                    {userPermissions.permissions.length > 0 && (
                      <>
                        <Divider />
                        <Box>
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            Your Permissions ({userPermissions.permissions.length}):
                          </Typography>
                          <Box sx={{ maxHeight: 120, overflow: 'auto' }}>
                            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 0.5 }}>
                              {userPermissions.permissions.slice(0, 8).map((permission) => (
                                <Chip
                                  key={permission.id}
                                  label={permission.action}
                                  size="small"
                                  variant="filled"
                                  color="primary"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              ))}
                              {userPermissions.permissions.length > 8 && (
                                <Chip
                                  label={`+${userPermissions.permissions.length - 8} more`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              )}
                            </Stack>
                          </Box>
                        </Box>
                      </>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              justifyContent="center"
              sx={{ mt: 3 }}
            >
              <Button
                variant="contained"
                onClick={() => navigate('/dashboard')}
                startIcon={<Business />}
                sx={{ minWidth: 140 }}
              >
                Dashboard
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                sx={{ minWidth: 140 }}
              >
                Go Back
              </Button>
              {accessCheck.reason === 'insufficient_permissions' && (
                <Button
                  variant="text"
                  onClick={() => navigate('/settings/permissions')}
                  startIcon={<Info />}
                  size="small"
                >
                  Request Access
                </Button>
              )}
            </Stack>

            {/* Help Text */}
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ display: 'block', mt: 3 }}
            >
              Need access? Contact your manager or system administrator.
            </Typography>
          </Paper>
        </Fade>
      </Box>
    )
  }

  // Render children if access is granted
  if (accessCheck.hasAccess) {
    return <>{children}</>
  }

  // Don't render anything if access denied and no fallback
  return null
}

/**
 * Higher-order component for wrapping components with permission guard
 */
export function withPermissions<P extends object>(
  Component: React.ComponentType<P>,
  guardProps: Omit<PermissionGuardProps, 'children'>
) {
  return function PermissionWrappedComponent(props: P) {
    return (
      <PermissionGuard {...guardProps}>
        <Component {...props} />
      </PermissionGuard>
    )
  }
}

/**
 * Simple permission check component for conditional rendering
 */
interface PermissionCheckProps {
  children: ReactNode
  permissions?: string[]
  anyPermission?: boolean
  role?: string
  level?: number
  fallback?: ReactNode
}

export function PermissionCheck({
  children,
  permissions = [],
  anyPermission = false,
  role,
  level,
  fallback = null
}: PermissionCheckProps) {
  const { profile } = useAuth()
  const userPermissions = usePermissions()

  const hasAccess = useMemo(() => {
    if (!profile) return false

    // Check role
    if (role && profile.role?.name !== role) return false

    // Check level
    if (level && (profile.role?.level || 0) < level) return false

    // Check permissions
    if (permissions.length > 0) {
      return anyPermission
        ? userPermissions.hasAnyPermission(permissions)
        : userPermissions.hasAllPermissions(permissions)
    }

    return true
  }, [profile, userPermissions, permissions, anyPermission, role, level])

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

export default PermissionGuard
