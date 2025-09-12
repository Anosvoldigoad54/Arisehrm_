'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  Alert,
  AlertTitle,
  Stack,
} from '@mui/material'
import { Error as ErrorIcon, Refresh as RefreshIcon, Home as HomeIcon } from '@mui/icons-material'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
    }

    // In production, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return <ErrorFallback error={this.state.error} errorInfo={this.state.errorInfo} />
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error: Error | null
  errorInfo: ErrorInfo | null
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, errorInfo }) => {
  const handleRefresh = () => {
    // ✅ FIXED: Prevent refresh during authentication
    const isLoginInProgress = sessionStorage.getItem('login_in_progress') === 'true' ||
                             localStorage.getItem('auth_token') !== null ||
                             document.querySelector('.UnifiedLoginSystem') !== null;
    
    if (!isLoginInProgress) {
      window.location.reload()
    } else {
      console.log('[ErrorBoundary] Skipping refresh during authentication flow');
      // Show a message to the user instead
      if (typeof window !== 'undefined' && (window as any).showNotification) {
        (window as any).showNotification('Please complete login before refreshing', 'info')
      }
    }
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <ErrorIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
        
        <Typography variant="h4" component="h1" gutterBottom color="error">
          Oops! Something went wrong
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          We encountered an unexpected error. Don't worry, our team has been notified.
        </Typography>

        {process.env.NODE_ENV === 'development' && error && (
          <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
            <AlertTitle>Error Details (Development)</AlertTitle>
            <Typography variant="body2" component="pre" sx={{ 
              whiteSpace: 'pre-wrap', 
              fontSize: '0.875rem',
              fontFamily: 'monospace'
            }}>
              {error.toString()}
            </Typography>
            {errorInfo && (
              <Typography variant="body2" component="pre" sx={{ 
                whiteSpace: 'pre-wrap', 
                fontSize: '0.875rem',
                fontFamily: 'monospace',
                mt: 1
              }}>
                {errorInfo.componentStack}
              </Typography>
            )}
          </Alert>
        )}

        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            size="large"
          >
            Refresh Page
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={handleGoHome}
            size="large"
          >
            Go to Home
          </Button>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
          If this problem persists, please contact support with the error details above.
        </Typography>
      </Paper>
    </Container>
  )
}
