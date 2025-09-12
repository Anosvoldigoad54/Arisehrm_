/**
 * Enhanced Error Handling System for AriseHRM
 * Provides comprehensive error management across the application
 */

import { toast } from 'sonner';

// Error Types
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Enhanced Error Interface
export interface EnhancedError extends Error {
  type: ErrorType;
  severity: ErrorSeverity;
  code?: string;
  details?: Record<string, any>;
  timestamp: Date;
  userMessage?: string;
  techMessage?: string;
  recoverable: boolean;
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

// Error Factory
export class ErrorFactory {
  static create(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    options: Partial<EnhancedError> = {}
  ): EnhancedError {
    const error = new Error(message) as EnhancedError;
    
    error.type = type;
    error.severity = severity;
    error.timestamp = new Date();
    error.recoverable = options.recoverable ?? true;
    error.code = options.code;
    error.details = options.details;
    error.userMessage = options.userMessage || this.getUserFriendlyMessage(type, message);
    error.techMessage = options.techMessage || message;
    error.userId = options.userId;
    error.sessionId = options.sessionId;
    error.component = options.component;
    error.action = options.action;
    error.metadata = options.metadata;

    return error;
  }

  private static getUserFriendlyMessage(type: ErrorType, originalMessage: string): string {
    const userMessages = {
      [ErrorType.NETWORK]: 'Connection problem. Please check your internet and try again.',
      [ErrorType.AUTHENTICATION]: 'Please log in again to continue.',
      [ErrorType.AUTHORIZATION]: 'You don\'t have permission to perform this action.',
      [ErrorType.VALIDATION]: 'Please check your input and try again.',
      [ErrorType.SERVER]: 'Server is temporarily unavailable. Please try again later.',
      [ErrorType.CLIENT]: 'Something went wrong. Please refresh the page.',
      [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again.'
    };

    return userMessages[type] || originalMessage;
  }

  // Specific error creators
  static networkError(message: string, details?: Record<string, any>): EnhancedError {
    return this.create(message, ErrorType.NETWORK, ErrorSeverity.HIGH, {
      details,
      recoverable: true,
      userMessage: 'Connection problem. Please check your internet and try again.'
    });
  }

  static authenticationError(message: string, details?: Record<string, any>): EnhancedError {
    return this.create(message, ErrorType.AUTHENTICATION, ErrorSeverity.HIGH, {
      details,
      recoverable: true,
      userMessage: 'Your session has expired. Please log in again.'
    });
  }

  static authorizationError(message: string, requiredPermission?: string): EnhancedError {
    return this.create(message, ErrorType.AUTHORIZATION, ErrorSeverity.MEDIUM, {
      details: { requiredPermission },
      recoverable: false,
      userMessage: 'You don\'t have permission to perform this action.'
    });
  }

  static validationError(message: string, fieldErrors?: Record<string, string>): EnhancedError {
    return this.create(message, ErrorType.VALIDATION, ErrorSeverity.LOW, {
      details: { fieldErrors },
      recoverable: true,
      userMessage: 'Please check your input and try again.'
    });
  }

  static serverError(message: string, statusCode?: number): EnhancedError {
    return this.create(message, ErrorType.SERVER, ErrorSeverity.HIGH, {
      details: { statusCode },
      recoverable: true,
      userMessage: 'Server is temporarily unavailable. Please try again later.'
    });
  }
}

// Error Handler with Context
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorReportingService?: (error: EnhancedError) => void;
  private userId?: string;
  private sessionId?: string;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Configuration
  configure(config: {
    errorReportingService?: (error: EnhancedError) => void;
    userId?: string;
    sessionId?: string;
  }) {
    this.errorReportingService = config.errorReportingService;
    this.userId = config.userId;
    this.sessionId = config.sessionId;
  }

  // Main error handling method
  handle(error: Error | EnhancedError, context?: {
    component?: string;
    action?: string;
    metadata?: Record<string, any>;
    showToast?: boolean;
    logToConsole?: boolean;
    reportToService?: boolean;
  }): EnhancedError {
    const enhancedError = this.enhanceError(error, context);
    
    // Log to console if enabled (default in development)
    if (context?.logToConsole !== false && process.env.NODE_ENV === 'development') {
      this.logToConsole(enhancedError);
    }

    // Show toast notification if enabled (default true)
    if (context?.showToast !== false) {
      this.showToast(enhancedError);
    }

    // Report to external service if configured and enabled
    if (context?.reportToService !== false && this.errorReportingService) {
      this.reportToService(enhancedError);
    }

    return enhancedError;
  }

  private enhanceError(error: Error | EnhancedError, context?: any): EnhancedError {
    if (this.isEnhancedError(error)) {
      // Update existing enhanced error with new context
      if (context?.component) error.component = context.component;
      if (context?.action) error.action = context.action;
      if (context?.metadata) {
        error.metadata = { ...error.metadata, ...context.metadata };
      }
      error.userId = error.userId || this.userId;
      error.sessionId = error.sessionId || this.sessionId;
      return error;
    }

    // Convert regular error to enhanced error
    const type = this.inferErrorType(error);
    const severity = this.inferErrorSeverity(error, type);
    
    return ErrorFactory.create(error.message, type, severity, {
      component: context?.component,
      action: context?.action,
      metadata: context?.metadata,
      userId: this.userId,
      sessionId: this.sessionId,
      details: { originalError: error.name }
    });
  }

  private isEnhancedError(error: any): error is EnhancedError {
    return error && typeof error === 'object' && 'type' in error && 'severity' in error;
  }

  private inferErrorType(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return ErrorType.NETWORK;
    }
    if (message.includes('unauthorized') || message.includes('authentication')) {
      return ErrorType.AUTHENTICATION;
    }
    if (message.includes('forbidden') || message.includes('permission')) {
      return ErrorType.AUTHORIZATION;
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorType.VALIDATION;
    }
    if (message.includes('server') || message.includes('500')) {
      return ErrorType.SERVER;
    }
    
    return ErrorType.CLIENT;
  }

  private inferErrorSeverity(error: Error, type: ErrorType): ErrorSeverity {
    if (type === ErrorType.AUTHENTICATION || type === ErrorType.NETWORK) {
      return ErrorSeverity.HIGH;
    }
    if (type === ErrorType.SERVER) {
      return ErrorSeverity.CRITICAL;
    }
    if (type === ErrorType.VALIDATION) {
      return ErrorSeverity.LOW;
    }
    
    return ErrorSeverity.MEDIUM;
  }

  private logToConsole(error: EnhancedError) {
    const logLevel = {
      [ErrorSeverity.LOW]: 'warn',
      [ErrorSeverity.MEDIUM]: 'error',
      [ErrorSeverity.HIGH]: 'error',
      [ErrorSeverity.CRITICAL]: 'error'
    }[error.severity] as 'warn' | 'error';

    console.group(`🔥 ${error.type} Error - ${error.severity}`);
    console[logLevel]('Message:', error.message);
    console[logLevel]('User Message:', error.userMessage);
    if (error.component) console.info('Component:', error.component);
    if (error.action) console.info('Action:', error.action);
    if (error.details) console.info('Details:', error.details);
    if (error.metadata) console.info('Metadata:', error.metadata);
    console.info('Timestamp:', error.timestamp.toISOString());
    console.info('Stack:', error.stack);
    console.groupEnd();
  }

  private showToast(error: EnhancedError) {
    const toastConfig = {
      description: this.getToastDescription(error),
      duration: this.getToastDuration(error.severity),
    };

    switch (error.severity) {
      case ErrorSeverity.LOW:
        toast.warning(error.userMessage || error.message, toastConfig);
        break;
      case ErrorSeverity.MEDIUM:
        toast.error(error.userMessage || error.message, toastConfig);
        break;
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        toast.error(error.userMessage || error.message, {
          ...toastConfig,
          duration: 8000, // Longer duration for critical errors
        });
        break;
    }
  }

  private getToastDescription(error: EnhancedError): string | undefined {
    if (error.type === ErrorType.NETWORK) {
      return 'Please check your internet connection and try again.';
    }
    if (error.type === ErrorType.AUTHENTICATION) {
      return 'Please log in again to continue.';
    }
    if (error.type === ErrorType.SERVER) {
      return 'Our servers are experiencing issues. Please try again in a few minutes.';
    }
    return undefined;
  }

  private getToastDuration(severity: ErrorSeverity): number {
    return {
      [ErrorSeverity.LOW]: 3000,
      [ErrorSeverity.MEDIUM]: 5000,
      [ErrorSeverity.HIGH]: 7000,
      [ErrorSeverity.CRITICAL]: 10000
    }[severity];
  }

  private reportToService(error: EnhancedError) {
    try {
      this.errorReportingService?.(error);
    } catch (reportingError) {
      console.error('Failed to report error to external service:', reportingError);
    }
  }
}

// Utility Functions
export const errorHandler = ErrorHandler.getInstance();

// React Hook for Error Handling
export function useErrorHandler() {
  const handleError = (
    error: Error | EnhancedError,
    context?: {
      component?: string;
      action?: string;
      metadata?: Record<string, any>;
      showToast?: boolean;
    }
  ) => {
    return errorHandler.handle(error, context);
  };

  const handleAsyncError = async <T>(
    asyncFn: () => Promise<T>,
    context?: {
      component?: string;
      action?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<[T | null, EnhancedError | null]> => {
    try {
      const result = await asyncFn();
      return [result, null];
    } catch (error) {
      const enhancedError = handleError(error as Error, context);
      return [null, enhancedError];
    }
  };

  return {
    handleError,
    handleAsyncError,
    createError: ErrorFactory.create,
    createNetworkError: ErrorFactory.networkError,
    createAuthError: ErrorFactory.authenticationError,
    createValidationError: ErrorFactory.validationError,
  };
}

// Error Recovery Utilities
export class ErrorRecovery {
  static async retry<T>(
    fn: () => Promise<T>,
    options: {
      maxAttempts?: number;
      delay?: number;
      backoff?: boolean;
      shouldRetry?: (error: Error, attempt: number) => boolean;
    } = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      delay = 1000,
      backoff = true,
      shouldRetry = (error) => !error.message.includes('401') && !error.message.includes('403')
    } = options;

    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts || !shouldRetry(lastError, attempt)) {
          throw lastError;
        }

        const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    throw lastError!;
  }

  static async withFallback<T>(
    primaryFn: () => Promise<T>,
    fallbackFn: () => Promise<T> | T,
    options: {
      shouldUseFallback?: (error: Error) => boolean;
    } = {}
  ): Promise<T> {
    const { shouldUseFallback = () => true } = options;

    try {
      return await primaryFn();
    } catch (error) {
      if (shouldUseFallback(error as Error)) {
        return await fallbackFn();
      }
      throw error;
    }
  }
}

export default ErrorHandler;