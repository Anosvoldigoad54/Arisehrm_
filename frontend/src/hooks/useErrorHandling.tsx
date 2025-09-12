/**
 * Global Error Handler Hook for AriseHRM
 * Provides consistent error handling across the application
 */

import { useCallback, useContext, createContext, ReactNode, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { errorHandler, ErrorHandler, ErrorType, ErrorSeverity, ErrorFactory } from '../utils/errorHandling';
import { toast } from 'sonner';

// Global Error Context
interface GlobalErrorContextType {
  reportError: (error: Error, context?: string) => void;
  clearErrors: () => void;
  errorCount: number;
}

const GlobalErrorContext = createContext<GlobalErrorContextType | null>(null);

// Global Error Provider
export const GlobalErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  useEffect(() => {
    // Configure error handler with user context
    errorHandler.configure({
      userId: user?.id,
      sessionId: sessionStorage.getItem('sessionId') || undefined,
      errorReportingService: (error) => {
        // Here you would integrate with your error reporting service
        // For now, we'll just log to console in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Error reported to service:', error);
        }
        
        // In production, you might send to Sentry, LogRocket, etc.
        // Example: Sentry.captureException(error);
      }
    });
  }, [user?.id]);

  const reportError = useCallback((error: Error, context?: string) => {
    errorHandler.handle(error, { component: context });
  }, []);

  const clearErrors = useCallback(() => {
    // Implementation for clearing errors if needed
    toast.dismiss();
  }, []);

  const value = {
    reportError,
    clearErrors,
    errorCount: 0, // You could implement error counting if needed
  };

  return (
    <GlobalErrorContext.Provider value={value}>
      {children}
    </GlobalErrorContext.Provider>
  );
};

// Hook for using global error handling
export const useGlobalErrorHandler = () => {
  const context = useContext(GlobalErrorContext);
  if (!context) {
    throw new Error('useGlobalErrorHandler must be used within GlobalErrorProvider');
  }
  return context;
};

// Enhanced Error Handling Hook
export const useErrorHandling = () => {
  const { reportError } = useGlobalErrorHandler();

  // Handle API errors specifically
  const handleAPIError = useCallback((error: any, endpoint?: string) => {
    let enhancedError;

    if (error?.response) {
      // HTTP error response
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      if (status === 401) {
        enhancedError = ErrorFactory.authenticationError(message, {
          details: { endpoint, statusCode: status }
        });
      } else if (status === 403) {
        enhancedError = ErrorFactory.authorizationError(message, { details: { endpoint } });
      } else if (status >= 400 && status < 500) {
        enhancedError = ErrorFactory.validationError(message, {
          details: { endpoint, statusCode: status }
        });
      } else if (status >= 500) {
        enhancedError = ErrorFactory.serverError(message, status);
      } else {
        enhancedError = ErrorFactory.create(message, ErrorType.UNKNOWN, ErrorSeverity.MEDIUM, {
          details: { endpoint, statusCode: status }
        });
      }
    } else if (error?.code === 'NETWORK_ERROR' || !navigator.onLine) {
      enhancedError = ErrorFactory.networkError(error.message || 'Network connection failed', {
        details: { endpoint, offline: !navigator.onLine }
      });
    } else {
      enhancedError = ErrorFactory.create(
        error?.message || 'An unexpected error occurred',
        ErrorType.CLIENT,
        ErrorSeverity.MEDIUM,
        { details: { endpoint } }
      );
    }

    errorHandler.handle(enhancedError, {
      component: 'API',
      action: endpoint || 'unknown_endpoint',
      showToast: true
    });

    return enhancedError;
  }, []);

  // Handle form validation errors
  const handleFormError = useCallback((error: any, formName?: string) => {
    let enhancedError;

    if (error?.fieldErrors) {
      enhancedError = ErrorFactory.validationError(
        error.message || 'Form validation failed',
        error.fieldErrors
      );
    } else {
      enhancedError = ErrorFactory.create(
        error?.message || 'Form submission failed',
        ErrorType.VALIDATION,
        ErrorSeverity.LOW,
        { details: { formName } }
      );
    }

    errorHandler.handle(enhancedError, {
      component: 'Form',
      action: formName || 'form_submission',
      showToast: true
    });

    return enhancedError;
  }, []);

  // Handle async operations with automatic error handling
  const handleAsync = useCallback(async (
    asyncFn: () => Promise<any>,
    options?: {
      component?: string;
      action?: string;
      showLoading?: boolean;
      loadingMessage?: string;
      successMessage?: string;
      onError?: (error: any) => void;
      retryOptions?: {
        maxAttempts?: number;
        delay?: number;
      };
    }
  ): Promise<[any | null, Error | null]> => {
    const {
      component = 'AsyncOperation',
      action = 'execution',
      showLoading = false,
      loadingMessage = 'Processing...',
      successMessage,
      onError,
      retryOptions
    } = options || {};

    let loadingToast: string | number | undefined;

    try {
      if (showLoading) {
        loadingToast = toast.loading(loadingMessage);
      }

      let result: any;

      if (retryOptions) {
        // Use retry logic
        const { maxAttempts = 3, delay = 1000 } = retryOptions;
        let lastError: Error;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            result = await asyncFn();
            break;
          } catch (error) {
            lastError = error as Error;
            
            if (attempt === maxAttempts) {
              throw lastError;
            }

            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, delay * attempt));
          }
        }
      } else {
        result = await asyncFn();
      }

      if (loadingToast) {
        toast.dismiss(loadingToast);
      }

      if (successMessage) {
        toast.success(successMessage);
      }

      return [result!, null];
    } catch (error) {
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }

      const enhancedError = errorHandler.handle(error as Error, {
        component,
        action,
        showToast: true
      });

      onError?.(enhancedError);
      return [null, enhancedError];
    }
  }, []);

  // Handle file upload errors
  const handleFileError = useCallback((error: any, fileName?: string) => {
    let enhancedError;

    if (error?.code === 'FILE_TOO_LARGE') {
      enhancedError = ErrorFactory.validationError(
        'File size is too large',
        { details: { fileName: fileName || 'unknown', maxSize: '10MB' } }
      );
    } else if (error?.code === 'UNSUPPORTED_FILE_TYPE') {
      enhancedError = ErrorFactory.validationError(
        'File type is not supported',
        { details: { fileName: fileName || 'unknown', supportedTypes: 'PDF, DOC, DOCX, PNG, JPG' } }
      );
    } else {
      enhancedError = ErrorFactory.create(
        error?.message || 'File upload failed',
        ErrorType.CLIENT,
        ErrorSeverity.MEDIUM,
        { details: { fileName: fileName || 'unknown' } }
      );
    }

    errorHandler.handle(enhancedError, {
      component: 'FileUpload',
      action: 'upload',
      showToast: true
    });

    return enhancedError;
  }, []);

  // Generic error handler
  const handleError = useCallback((error: Error, context?: {
    component?: string;
    action?: string;
    showToast?: boolean;
    metadata?: Record<string, any>;
  }) => {
    return errorHandler.handle(error, context);
  }, []);

  return {
    handleAPIError,
    handleFormError,
    handleAsync,
    handleFileError,
    handleError,
    reportError,
  };
};

// Network status hook with error handling
export const useNetworkErrorHandling = () => {
  const { handleError } = useErrorHandling();

  useEffect(() => {
    const handleOnline = () => {
      toast.success('Connection restored', {
        description: 'You\'re back online!'
      });
    };

    const handleOffline = () => {
      const error = ErrorFactory.networkError('Connection lost', {
        timestamp: new Date().toISOString()
      });

      handleError(error, {
        component: 'NetworkMonitor',
        action: 'connection_lost',
        showToast: true
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleError]);

  return {
    isOnline: navigator.onLine,
  };
};

// Global unhandled error catcher
export const useGlobalErrorCatcher = () => {
  const { handleError } = useErrorHandling();

  useEffect(() => {
    const handleUnhandledError = (event: ErrorEvent) => {
      const error = ErrorFactory.create(
        event.message || 'Unhandled error',
        ErrorType.CLIENT,
        ErrorSeverity.HIGH,
        {
          details: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack
          }
        }
      );

      handleError(error, {
        component: 'GlobalErrorHandler',
        action: 'unhandled_error',
        showToast: true
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = ErrorFactory.create(
        event.reason?.message || 'Unhandled promise rejection',
        ErrorType.CLIENT,
        ErrorSeverity.HIGH,
        {
          details: {
            reason: event.reason,
            stack: event.reason?.stack
          }
        }
      );

      handleError(error, {
        component: 'GlobalErrorHandler',
        action: 'unhandled_rejection',
        showToast: true
      });
    };

    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [handleError]);
};

export default useErrorHandling;