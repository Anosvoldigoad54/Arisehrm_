/**
 * Audit Logging React Hooks for AriseHRM
 * Provides easy integration of audit logging into React components
 */

import { useCallback, useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  AuditEvent, 
  AuditCategory, 
  AuditAction, 
  AuditSeverity, 
  AuditStatus,
  AuditQueryFilters,
  AuditQueryResult,
  AuditStatistics,
  AuditDataChange 
} from '../types/audit';
import { auditLogger } from '../services/auditLoggingService';
import { toast } from 'sonner';

/**
 * Main audit logging hook
 */
export const useAuditLogger = (componentName?: string) => {
  const location = useLocation();
  const component = componentName || location.pathname.split('/').pop() || 'unknown';

  // Log basic audit event
  const logEvent = useCallback(async (
    category: AuditCategory,
    action: AuditAction,
    options?: {
      targetType?: string;
      targetId?: string;
      targetName?: string;
      severity?: AuditSeverity;
      status?: AuditStatus;
      description?: string;
      details?: Record<string, any>;
      dataChanges?: AuditDataChange[];
    }
  ): Promise<string> => {
    return auditLogger.logEvent({
      category,
      action,
      component,
      targetType: options?.targetType,
      targetId: options?.targetId,
      targetName: options?.targetName,
      severity: options?.severity || AuditSeverity.LOW,
      status: options?.status || AuditStatus.SUCCESS,
      description: options?.description || `${action} performed in ${component}`,
      details: options?.details,
      dataChanges: options?.dataChanges,
    });
  }, [component]);

  // Log authentication events
  const logAuth = useCallback(async (
    action: AuditAction,
    status: AuditStatus = AuditStatus.SUCCESS,
    details?: Record<string, any>
  ): Promise<string> => {
    return auditLogger.logAuth(action, status, details);
  }, []);

  // Log user management events
  const logUserManagement = useCallback(async (
    action: AuditAction,
    targetUserId: string,
    changes?: AuditDataChange[],
    details?: Record<string, any>
  ): Promise<string> => {
    return auditLogger.logUserManagement(action, targetUserId, changes, details);
  }, []);

  // Log attendance events
  const logAttendance = useCallback(async (
    action: AuditAction,
    employeeId?: string,
    details?: Record<string, any>
  ): Promise<string> => {
    return auditLogger.logAttendance(action, employeeId, details);
  }, []);

  // Log leave management events
  const logLeave = useCallback(async (
    action: AuditAction,
    leaveRequestId: string,
    details?: Record<string, any>
  ): Promise<string> => {
    return auditLogger.logLeave(action, leaveRequestId, details);
  }, []);

  // Log payroll events
  const logPayroll = useCallback(async (
    action: AuditAction,
    targetId: string,
    amount?: number,
    details?: Record<string, any>
  ): Promise<string> => {
    return auditLogger.logPayroll(action, targetId, amount, details);
  }, []);

  // Log security events
  const logSecurity = useCallback(async (
    action: AuditAction,
    severity: AuditSeverity = AuditSeverity.HIGH,
    details?: Record<string, any>
  ): Promise<string> => {
    return auditLogger.logSecurity(action, severity, details);
  }, []);

  // Log data access events
  const logDataAccess = useCallback(async (
    action: AuditAction,
    targetType: string,
    targetId?: string,
    dataClassification?: string,
    details?: Record<string, any>
  ): Promise<string> => {
    return auditLogger.logDataAccess(action, targetType, targetId, dataClassification, details);
  }, []);

  return {
    logEvent,
    logAuth,
    logUserManagement,
    logAttendance,
    logLeave,
    logPayroll,
    logSecurity,
    logDataAccess,
  };
};

/**
 * Hook for tracking page views and navigation
 */
export const usePageViewAudit = () => {
  const location = useLocation();
  const { logDataAccess } = useAuditLogger('navigation');
  const previousPath = useRef<string>('');

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Log page view
    logDataAccess(
      AuditAction.READ,
      'page',
      currentPath,
      'internal',
      {
        previousPath: previousPath.current,
        search: location.search,
        hash: location.hash,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }
    );

    previousPath.current = currentPath;
  }, [location, logDataAccess]);
};

/**
 * Hook for tracking form interactions
 */
export const useFormAudit = (formName: string) => {
  const { logEvent } = useAuditLogger(`form-${formName}`);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const initialData = useRef<Record<string, any>>({});

  // Track form start
  const trackFormStart = useCallback((data?: Record<string, any>) => {
    const startData = data || {};
    setFormData(startData);
    initialData.current = { ...startData };
    
    logEvent(
      AuditCategory.DATA_ACCESS,
      AuditAction.READ,
      {
        targetType: 'form',
        targetName: formName,
        severity: AuditSeverity.LOW,
        description: `Form ${formName} opened`,
        details: { formFields: Object.keys(startData) },
      }
    );
  }, [formName, logEvent]);

  // Track field changes
  const trackFieldChange = useCallback((fieldName: string, oldValue: any, newValue: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: newValue }));
    
    // Only log sensitive field changes
    const sensitiveFields = ['password', 'ssn', 'salary', 'bankAccount'];
    if (sensitiveFields.some(field => fieldName.toLowerCase().includes(field))) {
      logEvent(
        AuditCategory.DATA_ACCESS,
        AuditAction.UPDATE,
        {
          targetType: 'form_field',
          targetName: `${formName}.${fieldName}`,
          severity: AuditSeverity.MEDIUM,
          description: `Sensitive field ${fieldName} modified in ${formName}`,
          details: { fieldName, hasOldValue: oldValue !== undefined },
        }
      );
    }
  }, [formName, logEvent]);

  // Track form submission
  const trackFormSubmit = useCallback(async (success: boolean, errors?: string[]) => {
    const changes = Object.keys(formData).map(key => ({
      field: key,
      oldValue: initialData.current[key],
      newValue: formData[key],
      dataType: typeof formData[key],
      sensitive: ['password', 'ssn', 'salary'].some(field => key.toLowerCase().includes(field)),
    }));

    return logEvent(
      AuditCategory.DATA_ACCESS,
      success ? AuditAction.CREATE : AuditAction.UPDATE,
      {
        targetType: 'form',
        targetName: formName,
        severity: success ? AuditSeverity.LOW : AuditSeverity.MEDIUM,
        status: success ? AuditStatus.SUCCESS : AuditStatus.FAILURE,
        description: `Form ${formName} ${success ? 'submitted successfully' : 'submission failed'}`,
        details: { 
          changeCount: changes.length,
          errors: errors || [],
          submissionTime: new Date().toISOString(),
        },
        dataChanges: changes,
      }
    );
  }, [formName, formData, logEvent]);

  // Track form abandonment
  const trackFormAbandon = useCallback(() => {
    const changeCount = Object.keys(formData).filter(key => 
      formData[key] !== initialData.current[key]
    ).length;

    if (changeCount > 0) {
      logEvent(
        AuditCategory.DATA_ACCESS,
        AuditAction.UPDATE,
        {
          targetType: 'form',
          targetName: formName,
          severity: AuditSeverity.LOW,
          status: AuditStatus.WARNING,
          description: `Form ${formName} abandoned with unsaved changes`,
          details: { changeCount, abandonedAt: new Date().toISOString() },
        }
      );
    }
  }, [formName, formData, logEvent]);

  return {
    trackFormStart,
    trackFieldChange,
    trackFormSubmit,
    trackFormAbandon,
    formData,
  };
};

/**
 * Hook for tracking API calls
 */
export const useApiAudit = () => {
  const { logEvent } = useAuditLogger('api');

  const trackApiCall = useCallback(async (
    method: string,
    endpoint: string,
    success: boolean,
    responseTime: number,
    statusCode?: number,
    errorMessage?: string,
    requestData?: any
  ) => {
    const isDataModification = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
    const isReadOperation = method.toUpperCase() === 'GET';

    return logEvent(
      AuditCategory.DATA_ACCESS,
      isDataModification ? AuditAction.UPDATE : AuditAction.READ,
      {
        targetType: 'api_endpoint',
        targetName: endpoint,
        severity: success ? AuditSeverity.LOW : AuditSeverity.MEDIUM,
        status: success ? AuditStatus.SUCCESS : AuditStatus.FAILURE,
        description: `API ${method.toUpperCase()} ${endpoint} ${success ? 'succeeded' : 'failed'}`,
        details: {
          method: method.toUpperCase(),
          endpoint,
          responseTime,
          statusCode,
          errorMessage,
          hasRequestData: !!requestData,
          timestamp: new Date().toISOString(),
        },
      }
    );
  }, [logEvent]);

  return { trackApiCall };
};

/**
 * Hook for query audit events
 */
export const useAuditQuery = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryEvents = useCallback(async (filters: AuditQueryFilters): Promise<AuditQueryResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await auditLogger.queryEvents(filters);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to query audit events';
      setError(errorMessage);
      toast.error('Audit Query Failed', {
        description: errorMessage,
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStatistics = useCallback(async (timeRange?: { startDate: Date; endDate: Date }): Promise<AuditStatistics | null> => {
    setLoading(true);
    setError(null);

    try {
      const stats = await auditLogger.getStatistics(timeRange);
      return stats;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get audit statistics';
      setError(errorMessage);
      toast.error('Statistics Query Failed', {
        description: errorMessage,
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportEvents = useCallback(async (filters: AuditQueryFilters, format: 'json' | 'csv'): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      const exportData = await auditLogger.exportEvents(filters, format);
      
      // Trigger download
      const blob = new Blob([exportData], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit_export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Export Successful', {
        description: `Audit events exported as ${format.toUpperCase()}`,
      });

      return exportData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export audit events';
      setError(errorMessage);
      toast.error('Export Failed', {
        description: errorMessage,
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    queryEvents,
    getStatistics,
    exportEvents,
    loading,
    error,
  };
};

/**
 * Hook for real-time audit events
 */
export const useAuditRealTime = () => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const eventListener = (event: AuditEvent) => {
      setEvents(prev => [event, ...prev.slice(0, 99)]); // Keep last 100 events
    };

    auditLogger.addListener(eventListener);
    setConnected(true);

    return () => {
      auditLogger.removeListener(eventListener);
      setConnected(false);
    };
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return {
    events,
    connected,
    clearEvents,
  };
};

/**
 * Hook for component lifecycle audit tracking
 */
export const useComponentAudit = (componentName: string) => {
  const { logEvent } = useAuditLogger(componentName);
  const mountTime = useRef<Date>(new Date());

  useEffect(() => {
    // Track component mount
    logEvent(
      AuditCategory.SYSTEM_ADMIN,
      AuditAction.READ,
      {
        targetType: 'component',
        targetName: componentName,
        severity: AuditSeverity.LOW,
        description: `Component ${componentName} mounted`,
        details: { 
          mountTime: mountTime.current.toISOString(),
          userAgent: navigator.userAgent,
        },
      }
    );

    // Track component unmount
    return () => {
      const sessionDuration = Date.now() - mountTime.current.getTime();
      logEvent(
        AuditCategory.SYSTEM_ADMIN,
        AuditAction.READ,
        {
          targetType: 'component',
          targetName: componentName,
          severity: AuditSeverity.LOW,
          description: `Component ${componentName} unmounted`,
          details: { 
            sessionDuration,
            unmountTime: new Date().toISOString(),
          },
        }
      );
    };
  }, [componentName, logEvent]);

  // Track errors in component
  const trackError = useCallback((error: Error, errorInfo?: any) => {
    logEvent(
      AuditCategory.SYSTEM_ADMIN,
      AuditAction.READ,
      {
        targetType: 'component_error',
        targetName: componentName,
        severity: AuditSeverity.HIGH,
        status: AuditStatus.FAILURE,
        description: `Error in component ${componentName}: ${error.message}`,
        details: {
          errorMessage: error.message,
          errorStack: error.stack,
          errorInfo,
          timestamp: new Date().toISOString(),
        },
      }
    );
  }, [componentName, logEvent]);

  return { trackError };
};

/**
 * Higher-order component for automatic audit tracking
 */
export const withAuditTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) => {
  const AuditTrackedComponent = (props: P) => {
    const name = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Unknown';
    useComponentAudit(name);
    usePageViewAudit();

    return <WrappedComponent {...props} />;
  };

  AuditTrackedComponent.displayName = `withAuditTracking(${componentName || WrappedComponent.displayName || WrappedComponent.name})`;

  return AuditTrackedComponent;
};

export default useAuditLogger;