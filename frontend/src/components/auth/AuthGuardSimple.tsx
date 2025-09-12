import React, { ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useAuth } from '../../contexts/AuthContext'

interface AuthGuardSimpleProps {
  children: ReactNode
}

export const AuthGuardSimple: React.FC<AuthGuardSimpleProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user, profile } = useAuth()
  const navigate = useNavigate()

  // Fix navigation loop by using useEffect with better conditions
  useEffect(() => {
    // Add debugging
    const debugInfo = {
      isAuthenticated, 
      isLoading, 
      hasUser: !!user, 
      hasProfile: !!profile,
      sessionFlags: {
        auth_in_progress: sessionStorage.getItem('auth_in_progress'),
        login_in_progress: sessionStorage.getItem('login_in_progress')
      },
      currentPath: window.location.pathname
    }
    console.log('[AuthGuard] State check:', debugInfo)
    
    // Check if auth is in progress - if so, don't redirect
    const authInProgress = sessionStorage.getItem('auth_in_progress') === 'true'
    const loginInProgress = sessionStorage.getItem('login_in_progress') === 'true'
    
    if (authInProgress || loginInProgress) {
      console.log('[AuthGuard] Auth in progress, waiting...')
      return
    }
    
    // Only redirect if we're definitely not loading and not authenticated
    if (!isLoading && !isAuthenticated && !user) {
      console.log('[AuthGuard] Redirecting to login - user not authenticated')
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, isLoading, user, profile, navigate])

  // If either user or profile is present and we're not loading, treat as authenticated
  const effectiveAuthenticated = (!!user || !!profile) && !isLoading

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          Authenticating...
        </Typography>
      </Box>
    )
  }

  // Don't render anything during redirect
  if (!effectiveAuthenticated) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          Redirecting to login...
        </Typography>
      </Box>
    )
  }

  // ✅ FIXED: Render children if authenticated (profile OR user present)
  return <>{children}</>
}

export default AuthGuardSimple