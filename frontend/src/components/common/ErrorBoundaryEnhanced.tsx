/**
 * Enhanced Error Boundaries for AriseHRM
 * Context-specific error handling components
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  AlertTitle,
  Stack,
  Card,
  CardContent,
  Skeleton,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  ArrowBack as BackIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  BugReport as BugIcon,
} from '@mui/icons-material';
import { errorHandler, ErrorType, ErrorSeverity } from '../utils/errorHandling';

// Base Enhanced Error Boundary
interface EnhancedErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  context?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showRefresh?: boolean;
  showBackButton?: boolean;
  minimized?: boolean;
}

interface EnhancedErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class EnhancedErrorBoundary extends Component<
  EnhancedErrorBoundaryProps,
  EnhancedErrorBoundaryState
> {
  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<EnhancedErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Use enhanced error handler
    const enhancedError = errorHandler.handle(error, {
      component: this.props.context || 'ErrorBoundary',
      action: 'componentDidCatch',
      metadata: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        errorId: this.state.errorId,
      },
      showToast: false, // Don't show toast as we'll show the error boundary UI
      logToConsole: true,
      reportToService: true,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      if (this.props.minimized) {
        return (
          <Alert 
            severity="error" 
            sx={{ my: 2 }}
            action={
              this.props.showRefresh !== false ? (
                <Button size="small" onClick={this.handleRetry}>
                  Retry
                </Button>
              ) : undefined
            }
          >
            <AlertTitle>Something went wrong</AlertTitle>
            {this.props.context ? `Error in ${this.props.context}` : 'An unexpected error occurred'}
          </Alert>
        );
      }

      return (
        <EnhancedErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          context={this.props.context}
          onRetry={this.handleRetry}
          onGoBack={this.props.showBackButton ? this.handleGoBack : undefined}
          showRefresh={this.props.showRefresh}
        />
      );
    }

    return this.props.children;
  }
}

// Enhanced Error Fallback Component
interface EnhancedErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  context?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  showRefresh?: boolean;
}

const EnhancedErrorFallback: React.FC<EnhancedErrorFallbackProps> = ({
  error,
  errorInfo,
  errorId,
  context,
  onRetry,
  onGoBack,
  showRefresh = true,
}) => {
  const getErrorSeverity = (error: Error | null): 'error' | 'warning' | 'info' => {
    if (!error) return 'error';
    
    const message = error.message.toLowerCase();
    if (message.includes('network') || message.includes('fetch')) return 'warning';
    if (message.includes('permission') || message.includes('unauthorized')) return 'info';
    return 'error';
  };

  const getErrorIcon = () => {
    const severity = getErrorSeverity(error);
    switch (severity) {
      case 'warning': return <WarningIcon sx={{ fontSize: 48 }} color="warning" />;
      case 'info': return <InfoIcon sx={{ fontSize: 48 }} color="info" />;
      default: return <ErrorIcon sx={{ fontSize: 48 }} color="error" />;
    }
  };

  const getErrorTitle = () => {
    if (!error) return 'Something went wrong';
    
    const message = error.message.toLowerCase();
    if (message.includes('network') || message.includes('fetch')) {
      return 'Connection Problem';
    }
    if (message.includes('permission') || message.includes('unauthorized')) {
      return 'Access Denied';
    }
    if (context) {
      return `Error in ${context}`;
    }
    return 'Something went wrong';
  };

  const getErrorDescription = () => {
    if (!error) return 'An unexpected error occurred.';
    
    const message = error.message.toLowerCase();
    if (message.includes('network') || message.includes('fetch')) {
      return 'Please check your internet connection and try again.';
    }
    if (message.includes('permission') || message.includes('unauthorized')) {
      return 'You don\'t have permission to access this resource.';
    }
    return 'We encountered an unexpected error. Our team has been notified.';
  };

  return (
    <Box sx={{ p: 4, textAlign: 'center', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card sx={{ maxWidth: 600, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          {getErrorIcon()}
          
          <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 2 }}>
            {getErrorTitle()}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {getErrorDescription()}
          </Typography>

          {process.env.NODE_ENV === 'development' && error && (
            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              <AlertTitle>
                Development Details
                <Typography variant="caption" sx={{ ml: 1, opacity: 0.7 }}>
                  (ID: {errorId})
                </Typography>
              </AlertTitle>
              
              <Typography variant="body2" component="pre" sx={{ 
                whiteSpace: 'pre-wrap', 
                fontSize: '0.875rem',
                fontFamily: 'monospace',
                mb: 1
              }}>
                {error.toString()}
              </Typography>
              
              {error.stack && (
                <details>
                  <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                    Stack Trace
                  </summary>
                  <Typography variant="body2" component="pre" sx={{ 
                    whiteSpace: 'pre-wrap', 
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    maxHeight: '200px',
                    overflow: 'auto',
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    p: 1,
                    borderRadius: 1
                  }}>
                    {error.stack}
                  </Typography>
                </details>
              )}
              
              {errorInfo?.componentStack && (
                <details>
                  <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                    Component Stack
                  </summary>
                  <Typography variant="body2" component="pre" sx={{ 
                    whiteSpace: 'pre-wrap', 
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    maxHeight: '200px',
                    overflow: 'auto',
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    p: 1,
                    borderRadius: 1
                  }}>
                    {errorInfo.componentStack}
                  </Typography>
                </details>
              )}
            </Alert>
          )}

          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
            {showRefresh && onRetry && (
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={onRetry}
                size="large"
              >
                Try Again
              </Button>
            )}
            
            {onGoBack && (
              <Button
                variant="outlined"
                startIcon={<BackIcon />}
                onClick={onGoBack}
                size="large"
              >
                Go Back
              </Button>
            )}
            
            <Button
              variant="text"
              startIcon={<BugIcon />}
              href={`mailto:support@arisehrm.com?subject=Error Report&body=Error ID: ${errorId}%0AContext: ${context || 'Unknown'}%0AMessage: ${error?.message || 'Unknown error'}`}
              size="large"
            >
              Report Issue
            </Button>
          </Stack>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
            Error ID: {errorId} • {new Date().toLocaleString()}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

// Specialized Error Boundaries

// Form Error Boundary
export const FormErrorBoundary: React.FC<{ children: ReactNode; formName?: string }> = ({ 
  children, 
  formName 
}) => (
  <EnhancedErrorBoundary
    context={formName ? `${formName} Form` : 'Form'}
    minimized
    showRefresh={true}
    showBackButton={false}
  >
    {children}
  </EnhancedErrorBoundary>
);

// Data Table Error Boundary
export const DataTableErrorBoundary: React.FC<{ children: ReactNode; tableName?: string }> = ({ 
  children, 
  tableName 
}) => (
  <EnhancedErrorBoundary
    context={tableName ? `${tableName} Table` : 'Data Table'}
    minimized
    showRefresh={true}
    fallback={
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          <AlertTitle>Data Loading Error</AlertTitle>
          Unable to load table data. Please refresh the page or try again later.
        </Alert>
        <Box sx={{ mt: 2 }}>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={40} sx={{ mb: 1 }} />
          ))}
        </Box>
      </Box>
    }
  >
    {children}
  </EnhancedErrorBoundary>
);

// Dashboard Widget Error Boundary
export const WidgetErrorBoundary: React.FC<{ children: ReactNode; widgetName?: string }> = ({ 
  children, 
  widgetName 
}) => (
  <EnhancedErrorBoundary
    context={widgetName ? `${widgetName} Widget` : 'Dashboard Widget'}
    minimized
    showRefresh={false}
    fallback={
      <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CardContent>
          <ErrorIcon color="disabled" sx={{ fontSize: 32, mb: 1 }} />
          <Typography variant="body2" color="text.secondary" align="center">
            Widget temporarily unavailable
          </Typography>
        </CardContent>
      </Card>
    }
  >
    {children}
  </EnhancedErrorBoundary>
);

// Route Error Boundary (enhanced version of existing)
export const RouteErrorBoundary: React.FC<{ 
  children: ReactNode; 
  routeName?: string;
  fallback?: ReactNode;
}> = ({ 
  children, 
  routeName, 
  fallback 
}) => (
  <EnhancedErrorBoundary
    context={routeName ? `${routeName} Page` : 'Page'}
    showRefresh={true}
    showBackButton={true}
    fallback={fallback}
  >
    {children}
  </EnhancedErrorBoundary>
);

// API Error Boundary for async operations
export const APIErrorBoundary: React.FC<{ children: ReactNode; apiName?: string }> = ({ 
  children, 
  apiName 
}) => (
  <EnhancedErrorBoundary
    context={apiName ? `${apiName} API` : 'API Operation'}
    minimized
    showRefresh={true}
    fallback={
      <Alert severity="error" sx={{ my: 2 }}>
        <AlertTitle>Service Unavailable</AlertTitle>
        Unable to connect to our services. Please check your connection and try again.
      </Alert>
    }
  >
    {children}
  </EnhancedErrorBoundary>
);

export default EnhancedErrorBoundary;