/**
 * Core Audit Logging Service for AriseHRM
 * Handles event capture, storage, and management of audit trails
 */

import { 
  AuditEvent, 
  AuditCategory, 
  AuditAction, 
  AuditSeverity, 
  AuditStatus,
  AuditConfig,
  PartialAuditConfig,
  AuditQueryFilters,
  AuditQueryResult,
  AuditStatistics,
  AuditDataChange,
  AuditDevice,
  AuditNetwork,
  AuditSecurityContext,
  DEFAULT_AUDIT_CONFIG
} from '../types/audit';
import { backgroundSyncManager } from '../utils/backgroundSync';

/**
 * Audit Logging Service Class
 */
export class AuditLoggingService {
  private static instance: AuditLoggingService;
  private config: AuditConfig = DEFAULT_AUDIT_CONFIG;
  private eventBuffer: AuditEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private listeners: Set<(event: AuditEvent) => void> = new Set();

  private constructor() {
    this.loadConfiguration();
    this.setupFlushTimer();
    this.detectUserContext();
  }

  static getInstance(): AuditLoggingService {
    if (!AuditLoggingService.instance) {
      AuditLoggingService.instance = new AuditLoggingService();
    }
    return AuditLoggingService.instance;
  }

  /**
   * Configure audit logging settings
   */
  configure(config: PartialAuditConfig): void {
    // Deep merge for categories to allow partial updates
    if (config.categories) {
      this.config.categories = { ...this.config.categories, ...config.categories };
    }
    
    // Merge other config properties with proper type handling
    const { categories, ...otherConfig } = config;
    // Use deep merge to preserve required properties
    this.config = {
      ...this.config,
      ...otherConfig,
      // Ensure storage properties are properly merged
      storage: {
        ...this.config.storage,
        ...(otherConfig.storage || {})
      },
      compliance: {
        ...this.config.compliance,
        ...(otherConfig.compliance || {})
      },
      performance: {
        ...this.config.performance,
        ...(otherConfig.performance || {})
      },
      realTime: {
        ...this.config.realTime,
        ...(otherConfig.realTime || {})
      }
    };
    
    this.persistConfiguration();
    this.setupFlushTimer();
  }

  /**
   * Log an audit event
   */
  async logEvent(eventData: Partial<AuditEvent>): Promise<string> {
    if (!this.config.enabled) {
      return '';
    }

    const event = await this.createAuditEvent(eventData);
    
    // Check if category is enabled
    const categoryConfig = this.config.categories[event.category];
    if (!categoryConfig?.enabled) {
      return event.id;
    }

    // Check severity threshold
    if (this.getSeverityLevel(event.severity) < this.getSeverityLevel(categoryConfig.severityThreshold)) {
      return event.id;
    }

    // Add to buffer
    this.eventBuffer.push(event);
    
    // Notify listeners
    this.notifyListeners(event);
    
    // Immediate flush for critical events
    if (event.severity === AuditSeverity.CRITICAL) {
      await this.flush();
    }

    // Check buffer size
    if (this.eventBuffer.length >= this.config.performance.batchSize) {
      await this.flush();
    }

    console.log(`[Audit] Event logged: ${event.category}.${event.action} by ${event.username}`);
    return event.id;
  }

  /**
   * Log authentication events
   */
  async logAuth(action: AuditAction, status: AuditStatus, details?: Record<string, any>): Promise<string> {
    return this.logEvent({
      category: AuditCategory.AUTHENTICATION,
      action,
      status,
      severity: status === AuditStatus.FAILURE ? AuditSeverity.HIGH : AuditSeverity.MEDIUM,
      description: this.getAuthDescription(action, status),
      details,
    });
  }

  /**
   * Log user management events
   */
  async logUserManagement(
    action: AuditAction, 
    targetUserId: string, 
    changes?: AuditDataChange[],
    details?: Record<string, any>
  ): Promise<string> {
    return this.logEvent({
      category: AuditCategory.USER_MANAGEMENT,
      action,
      status: AuditStatus.SUCCESS,
      severity: AuditSeverity.MEDIUM,
      targetType: 'user',
      targetId: targetUserId,
      description: `User ${action.toLowerCase()} operation`,
      dataChanges: changes,
      details,
    });
  }

  /**
   * Log attendance events
   */
  async logAttendance(
    action: AuditAction,
    employeeId?: string,
    details?: Record<string, any>
  ): Promise<string> {
    return this.logEvent({
      category: AuditCategory.ATTENDANCE,
      action,
      status: AuditStatus.SUCCESS,
      severity: AuditSeverity.LOW,
      targetType: 'attendance',
      targetId: employeeId,
      description: `Attendance ${action.toLowerCase()}`,
      details,
    });
  }

  /**
   * Log leave management events
   */
  async logLeave(
    action: AuditAction,
    leaveRequestId: string,
    details?: Record<string, any>
  ): Promise<string> {
    return this.logEvent({
      category: AuditCategory.LEAVE_MANAGEMENT,
      action,
      status: AuditStatus.SUCCESS,
      severity: AuditSeverity.MEDIUM,
      targetType: 'leave_request',
      targetId: leaveRequestId,
      description: `Leave ${action.toLowerCase()}`,
      details,
    });
  }

  /**
   * Log payroll events
   */
  async logPayroll(
    action: AuditAction,
    targetId: string,
    amount?: number,
    details?: Record<string, any>
  ): Promise<string> {
    return this.logEvent({
      category: AuditCategory.PAYROLL,
      action,
      status: AuditStatus.SUCCESS,
      severity: AuditSeverity.HIGH,
      targetType: 'payroll',
      targetId,
      description: `Payroll ${action.toLowerCase()}`,
      details: { ...details, amount },
    });
  }

  /**
   * Log security events
   */
  async logSecurity(
    action: AuditAction,
    severity: AuditSeverity = AuditSeverity.HIGH,
    details?: Record<string, any>
  ): Promise<string> {
    return this.logEvent({
      category: AuditCategory.SECURITY,
      action,
      status: AuditStatus.WARNING,
      severity,
      description: `Security event: ${action}`,
      details,
    });
  }

  /**
   * Log data access events
   */
  async logDataAccess(
    action: AuditAction,
    targetType: string,
    targetId?: string,
    dataClassification?: string,
    details?: Record<string, any>
  ): Promise<string> {
    return this.logEvent({
      category: AuditCategory.DATA_ACCESS,
      action,
      status: AuditStatus.SUCCESS,
      severity: dataClassification === 'restricted' ? AuditSeverity.HIGH : AuditSeverity.LOW,
      targetType,
      targetId,
      description: `Data access: ${action} on ${targetType}`,
      details: { ...details, dataClassification },
    });
  }

  /**
   * Query audit events
   */
  async queryEvents(filters: AuditQueryFilters): Promise<AuditQueryResult> {
    const startTime = Date.now();
    
    // Apply filters and get results
    const results = await this.applyFilters(filters);
    
    const executionTime = Date.now() - startTime;
    
    return {
      events: results.events,
      totalCount: results.total,
      pageCount: Math.ceil(results.total / (filters.limit || 50)),
      currentPage: filters.page || 1,
      hasNextPage: (filters.page || 1) * (filters.limit || 50) < results.total,
      hasPreviousPage: (filters.page || 1) > 1,
      filters,
      executionTime,
      fromCache: false,
    };
  }

  /**
   * Get audit statistics
   */
  async getStatistics(timeRange?: { startDate: Date; endDate: Date }): Promise<AuditStatistics> {
    const events = await this.getStoredEvents();
    const filteredEvents = timeRange 
      ? events.filter(e => e.timestamp >= timeRange.startDate && e.timestamp <= timeRange.endDate)
      : events;

    return {
      totalEvents: filteredEvents.length,
      eventsByCategory: this.groupByCategory(filteredEvents),
      eventsByAction: this.groupByAction(filteredEvents),
      eventsBySeverity: this.groupBySeverity(filteredEvents),
      eventsByStatus: this.groupByStatus(filteredEvents),
      eventsByUser: this.groupByUser(filteredEvents),
      eventsByHour: this.groupByHour(filteredEvents),
      eventsByDay: this.groupByDay(filteredEvents),
      topUsers: this.getTopUsers(filteredEvents),
      topComponents: this.getTopComponents(filteredEvents),
      securityEvents: filteredEvents.filter(e => e.category === AuditCategory.SECURITY).length,
      failedEvents: filteredEvents.filter(e => e.status === AuditStatus.FAILURE).length,
      timeRange: timeRange || {
        startDate: new Date(Math.min(...filteredEvents.map(e => e.timestamp.getTime()))),
        endDate: new Date(Math.max(...filteredEvents.map(e => e.timestamp.getTime()))),
      },
    };
  }

  /**
   * Export audit events
   */
  async exportEvents(filters: AuditQueryFilters, format: 'json' | 'csv'): Promise<string> {
    const result = await this.queryEvents(filters);
    
    if (format === 'json') {
      return JSON.stringify(result.events, null, 2);
    } else {
      return this.convertToCSV(result.events);
    }
  }

  /**
   * Add event listener
   */
  addListener(listener: (event: AuditEvent) => void): void {
    this.listeners.add(listener);
  }

  /**
   * Remove event listener
   */
  removeListener(listener: (event: AuditEvent) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * Manual flush of buffered events
   */
  async flush(): Promise<void> {
    if (this.eventBuffer.length === 0) {
      return;
    }

    const eventsToFlush = [...this.eventBuffer];
    this.eventBuffer = [];

    try {
      await this.persistEvents(eventsToFlush);
      // Only log successful flush if backend is available or it's a significant number of events
      const backendUnavailable = localStorage.getItem('audit_backend_unavailable');
      if (backendUnavailable !== 'true' || eventsToFlush.length > 10) {
        console.log(`[Audit] Flushed ${eventsToFlush.length} events`);
      }
    } catch (error) {
      // Only log flush errors if it's not a backend unavailable situation
      const backendUnavailable = localStorage.getItem('audit_backend_unavailable');
      if (backendUnavailable !== 'true') {
        console.error('[Audit] Failed to flush events:', error);
      }
      // Return events to buffer for retry
      this.eventBuffer.unshift(...eventsToFlush);
    }
  }

  /**
   * Reset backend availability flag and retry backend sync
   * Useful when backend becomes available after being down
   */
  resetBackendAvailability(): void {
    localStorage.removeItem('audit_backend_unavailable');
    console.log('[Audit] Backend availability flag reset - will retry backend sync on next event');
  }

  /**
   * Check if backend sync is currently disabled
   */
  isBackendSyncDisabled(): boolean {
    return localStorage.getItem('audit_backend_unavailable') === 'true';
  }

  // Private methods

  private async createAuditEvent(eventData: Partial<AuditEvent>): Promise<AuditEvent> {
    const now = new Date();
    const user = this.getCurrentUser();
    const device = this.getDeviceInfo();
    const network = this.getNetworkInfo();
    const security = this.getSecurityContext();

    const event: AuditEvent = {
      id: this.generateEventId(),
      eventId: this.generateEventId(),
      timestamp: now,
      eventDate: now.toISOString().split('T')[0],
      eventTime: now.toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      
      category: eventData.category || AuditCategory.SYSTEM_ADMIN,
      action: eventData.action || AuditAction.READ,
      severity: eventData.severity || AuditSeverity.LOW,
      status: eventData.status || AuditStatus.SUCCESS,
      
      userId: user.id || 'system',
      username: user.username || 'system',
      userRole: user.role || 'unknown',
      userDepartment: user.department,
      
      targetType: eventData.targetType || 'system',
      targetId: eventData.targetId,
      targetName: eventData.targetName,
      
      description: eventData.description || `${eventData.action} performed`,
      summary: this.generateSummary(eventData),
      details: eventData.details || {},
      dataChanges: eventData.dataChanges || [],
      
      source: 'web',
      component: eventData.component || 'unknown',
      function: eventData.function,
      
      network,
      device,
      security,
      
      sessionId: this.getSessionId(),
      requestId: this.generateRequestId(),
      
      complianceFlags: eventData.complianceFlags || [],
      legalHold: eventData.legalHold || false,
      retentionPeriod: this.config.compliance.retentionPolicyDays,
      dataClassification: eventData.dataClassification || 'internal',
      
      tags: eventData.tags || [],
      customFields: eventData.customFields || {},
      searchableText: this.generateSearchableText(eventData),
      
      createdAt: now,
      version: 1,
      
      ...eventData,
    };

    return event;
  }

  private getCurrentUser(): { id: string; username: string; role: string; department?: string } {
    // Get current user from authentication context
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      id: user.id || 'anonymous',
      username: user.username || user.email || 'anonymous',
      role: user.role?.name || 'unknown',
      department: user.department?.name,
    };
  }

  private getDeviceInfo(): AuditDevice {
    const ua = navigator.userAgent;
    
    return {
      userAgent: ua,
      browser: {
        name: this.getBrowserName(ua),
        version: this.getBrowserVersion(ua),
      },
      os: {
        name: this.getOSName(ua),
        version: this.getOSVersion(ua),
      },
      device: {
        type: this.getDeviceType(ua),
        model: this.getDeviceModel(ua),
      },
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth,
      },
    };
  }

  private getNetworkInfo(): AuditNetwork {
    return {
      ipAddress: 'unknown', // Would be provided by backend
      ipAddressType: 'IPv4',
      userAgent: navigator.userAgent,
      referer: document.referrer,
    };
  }

  private getSecurityContext(): AuditSecurityContext {
    return {
      authMethod: 'password', // Would be determined by auth context
      mfaUsed: false,
      riskScore: 0,
      securityFlags: [],
      threatLevel: 'low',
    };
  }

  private async persistEvents(events: AuditEvent[]): Promise<void> {
    try {
      // Store locally first (this is our primary storage)
      await this.storeLocally(events);
      
      // Try to send to backend (optional, graceful fallback)
      if (navigator.onLine) {
        try {
          await this.sendToBackend(events);
        } catch (error) {
          // Backend sync failed, but local storage succeeded
          // Only log if it's not a known unavailable backend
          const backendUnavailable = localStorage.getItem('audit_backend_unavailable');
          if (backendUnavailable !== 'true') {
            console.warn('[Audit] Backend sync failed, events stored locally:', error);
          }
          
          // Queue for background sync if available (but don't spam if backend is known unavailable)
          if (backendUnavailable !== 'true') {
            events.forEach(event => {
              backgroundSyncManager.addOperation({
                type: 'timesheet' as any, // Using any to bypass type limitation
                priority: 'medium',
                data: event,
                endpoint: '/api/audit/events',
                method: 'POST',
                maxRetries: 3,
                userId: event.userId,
              });
            });
          }
        }
      } else {
        // Offline: Queue for background sync (only if backend is not known unavailable)
        const backendUnavailable = localStorage.getItem('audit_backend_unavailable');
        if (backendUnavailable !== 'true') {
          console.log('[Audit] Offline: queuing events for background sync');
          events.forEach(event => {
            backgroundSyncManager.addOperation({
              type: 'timesheet' as any, // Using any to bypass type limitation
              priority: 'medium',
              data: event,
              endpoint: '/api/audit/events',
              method: 'POST',
              maxRetries: 3,
              userId: event.userId,
            });
          });
        } else {
          console.log('[Audit] Offline: backend unavailable, events stored locally only');
        }
      }
    } catch (error) {
      // Only throw if local storage also fails
      console.error('[Audit] Failed to persist events locally:', error);
      throw error;
    }
  }

  private async storeLocally(events: AuditEvent[]): Promise<void> {
    try {
      const stored = JSON.parse(localStorage.getItem('audit_events') || '[]');
      const updated = [...stored, ...events];
      
      // Keep only recent events to avoid storage overflow
      const maxEvents = this.config.storage.maxEvents;
      const eventsToKeep = updated.slice(-maxEvents);
      
      localStorage.setItem('audit_events', JSON.stringify(eventsToKeep));
    } catch (error) {
      console.error('[Audit] Failed to store events locally:', error);
    }
  }

  private async sendToBackend(events: AuditEvent[]): Promise<void> {
    // Check if we're in demo mode or if backend API is not available
    const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
    
    if (isDemoMode) {
      // In demo mode, just store locally and skip backend sync
      console.log('[Audit] Demo mode: skipping backend sync for', events.length, 'events');
      return;
    }

    // Check if we've already determined the backend is unavailable
    const backendUnavailable = localStorage.getItem('audit_backend_unavailable');
    if (backendUnavailable === 'true') {
      // Check if enough time has passed to retry (5 minutes)
      const lastCheck = localStorage.getItem('audit_backend_last_check');
      if (lastCheck) {
        const lastCheckTime = parseInt(lastCheck, 10);
        const currentTime = Date.now();
        const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
        
        if (currentTime - lastCheckTime < fiveMinutes) {
          // Reduce console noise in development
          if (import.meta.env.DEV) {
            // Only log once per minute in development
            const lastLog = localStorage.getItem('audit_backend_log_time');
            if (!lastLog || currentTime - parseInt(lastLog, 10) > 60000) {
              console.log('[Audit] Backend previously determined unavailable, skipping sync');
              localStorage.setItem('audit_backend_log_time', currentTime.toString());
            }
          } else {
            console.log('[Audit] Backend previously determined unavailable, skipping sync');
          }
          return;
        }
      }
      // Reset the unavailable flag to retry
      localStorage.removeItem('audit_backend_unavailable');
    }
    
    try {
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/audit/events/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ events }),
      });

      if (!response.ok) {
        // If we get a 404, mark backend as unavailable
        if (response.status === 404) {
          console.warn('[Audit] Backend API endpoint not found (404), disabling backend sync');
          localStorage.setItem('audit_backend_unavailable', 'true');
          localStorage.setItem('audit_backend_last_check', Date.now().toString());
          return;
        }
        throw new Error(`Failed to send audit events: ${response.statusText}`);
      }

      // If we successfully sent to backend, clear the unavailable flag
      localStorage.removeItem('audit_backend_unavailable');
      localStorage.removeItem('audit_backend_last_check');
      localStorage.removeItem('audit_backend_log_time');
      
    } catch (error) {
      // Handle network errors and connection failures
      if (error instanceof TypeError || 
          (error instanceof Error && (
            error.message.includes('fetch') ||
            error.message.includes('NetworkError') ||
            error.message.includes('Failed to fetch') ||
            error.message.includes('ERR_ABORTED')
          ))) {
        console.warn('[Audit] Backend API not reachable, marking as unavailable');
        localStorage.setItem('audit_backend_unavailable', 'true');
        localStorage.setItem('audit_backend_last_check', Date.now().toString());
        return;
      }
      
      // For 404 errors caught in catch block
      if (error instanceof Error && (
          error.message.includes('404') || 
          error.message.includes('Not Found')
        )) {
        console.warn('[Audit] Backend API endpoint not found, disabling backend sync');
        localStorage.setItem('audit_backend_unavailable', 'true');
        localStorage.setItem('audit_backend_last_check', Date.now().toString());
        return;
      }
      
      // For other server errors, don't disable backend but don't spam console
      if (error instanceof Error && /^[4-5]\d\d/.test(error.message)) {
        // Reduce console noise in development
        if (import.meta.env.DEV) {
          const lastLog = localStorage.getItem('audit_server_error_log_time');
          const currentTime = Date.now();
          if (!lastLog || currentTime - parseInt(lastLog, 10) > 60000) {
            console.warn('[Audit] Server error, will retry later:', error.message);
            localStorage.setItem('audit_server_error_log_time', currentTime.toString());
          }
        } else {
          console.warn('[Audit] Server error, will retry later:', error.message);
        }
        return;
      }
      
      // Only throw for unexpected errors
      throw error;
    }
  }

  private async getStoredEvents(): Promise<AuditEvent[]> {
    try {
      const stored = JSON.parse(localStorage.getItem('audit_events') || '[]');
      return stored.map((event: any) => ({
        ...event,
        timestamp: new Date(event.timestamp),
        createdAt: new Date(event.createdAt),
        updatedAt: event.updatedAt ? new Date(event.updatedAt) : undefined,
      }));
    } catch (error) {
      console.error('[Audit] Failed to load stored events:', error);
      return [];
    }
  }

  // Helper methods

  private generateEventId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('audit_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
      sessionStorage.setItem('audit_session_id', sessionId);
    }
    return sessionId;
  }

  private getSeverityLevel(severity: AuditSeverity): number {
    const levels = {
      [AuditSeverity.LOW]: 1,
      [AuditSeverity.MEDIUM]: 2,
      [AuditSeverity.HIGH]: 3,
      [AuditSeverity.CRITICAL]: 4,
    };
    return levels[severity] || 1;
  }

  private getAuthDescription(action: AuditAction, status: AuditStatus): string {
    const descriptions: Record<string, string> = {
      [AuditAction.LOGIN]: status === AuditStatus.SUCCESS ? 'User logged in successfully' : 'Failed login attempt',
      [AuditAction.LOGIN_FAILED]: 'Failed login attempt',
      [AuditAction.LOGOUT]: 'User logged out',
      [AuditAction.PASSWORD_CHANGED]: 'Password changed',
      [AuditAction.PASSWORD_RESET]: 'Password reset requested',
      [AuditAction.SESSION_EXPIRED]: 'User session expired',
    };
    return descriptions[action] || `Authentication ${action}`;
  }

  private generateSummary(eventData: Partial<AuditEvent>): string {
    return `${eventData.category || 'System'} ${eventData.action || 'action'} ${eventData.status || 'performed'}`;
  }

  private generateSearchableText(eventData: Partial<AuditEvent>): string {
    const parts = [
      eventData.description,
      eventData.targetType,
      eventData.targetName,
      eventData.category,
      eventData.action,
      JSON.stringify(eventData.details || {}),
    ];
    return parts.filter(Boolean).join(' ').toLowerCase();
  }

  // Browser detection helpers
  private getBrowserName(ua: string): string {
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getBrowserVersion(ua: string): string {
    const match = ua.match(/(Chrome|Firefox|Safari|Edge)\/(\d+)/);
    return match ? match[2] : 'Unknown';
  }

  private getOSName(ua: string): string {
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private getOSVersion(ua: string): string {
    // Simplified version detection
    return 'Unknown';
  }

  private getDeviceType(ua: string): 'mobile' | 'tablet' | 'desktop' {
    if (/Mobile|Android|iPhone/.test(ua)) return 'mobile';
    if (/iPad|Tablet/.test(ua)) return 'tablet';
    return 'desktop';
  }

  private getDeviceModel(ua: string): string | undefined {
    const match = ua.match(/\(([^)]+)\)/);
    return match ? match[1] : undefined;
  }

  private setupFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    if (this.config.performance.flushInterval > 0) {
      this.flushTimer = setInterval(() => {
        this.flush();
      }, this.config.performance.flushInterval);
    }
  }

  private loadConfiguration(): void {
    try {
      const stored = localStorage.getItem('audit_config');
      if (stored) {
        const config = JSON.parse(stored);
        this.config = { ...DEFAULT_AUDIT_CONFIG, ...config };
      }
    } catch (error) {
      console.error('[Audit] Failed to load configuration:', error);
    }
  }

  private persistConfiguration(): void {
    try {
      localStorage.setItem('audit_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('[Audit] Failed to persist configuration:', error);
    }
  }

  private detectUserContext(): void {
    // Detect page unload to flush events
    window.addEventListener('beforeunload', () => {
      this.flush();
    });

    // Detect visibility change to flush events
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flush();
      }
    });
  }

  private notifyListeners(event: AuditEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('[Audit] Listener error:', error);
      }
    });
  }

  // Placeholder implementations for query methods
  private async applyFilters(filters: AuditQueryFilters): Promise<{ events: AuditEvent[]; total: number }> {
    const events = await this.getStoredEvents();
    // TODO: Implement actual filtering logic
    return { events: events.slice(0, filters.limit || 50), total: events.length };
  }

  private groupByCategory(events: AuditEvent[]): Record<AuditCategory, number> {
    return events.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {} as Record<AuditCategory, number>);
  }

  private groupByAction(events: AuditEvent[]): Record<string, number> {
    return events.reduce((acc, event) => {
      acc[event.action] = (acc[event.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupBySeverity(events: AuditEvent[]): Record<AuditSeverity, number> {
    return events.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<AuditSeverity, number>);
  }

  private groupByStatus(events: AuditEvent[]): Record<AuditStatus, number> {
    return events.reduce((acc, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1;
      return acc;
    }, {} as Record<AuditStatus, number>);
  }

  private groupByUser(events: AuditEvent[]): Record<string, number> {
    return events.reduce((acc, event) => {
      acc[event.username] = (acc[event.username] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupByHour(events: AuditEvent[]): Record<string, number> {
    return events.reduce((acc, event) => {
      const hour = event.timestamp.toISOString().substr(11, 2);
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupByDay(events: AuditEvent[]): Record<string, number> {
    return events.reduce((acc, event) => {
      const day = event.eventDate;
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private getTopUsers(events: AuditEvent[]): Array<{ userId: string; username: string; eventCount: number }> {
    const userCounts = this.groupByUser(events);
    return Object.entries(userCounts)
      .map(([username, count]) => ({ userId: 'unknown', username, eventCount: count }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 10);
  }

  private getTopComponents(events: AuditEvent[]): Array<{ component: string; eventCount: number }> {
    const componentCounts = events.reduce((acc, event) => {
      acc[event.component] = (acc[event.component] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(componentCounts)
      .map(([component, count]) => ({ component, eventCount: count }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 10);
  }

  private convertToCSV(events: AuditEvent[]): string {
    if (events.length === 0) return '';
    
    const headers = [
      'ID', 'Timestamp', 'Category', 'Action', 'Severity', 'Status',
      'User', 'Target Type', 'Target ID', 'Description', 'IP Address'
    ];
    
    const rows = events.map(event => [
      event.id,
      event.timestamp.toISOString(),
      event.category,
      event.action,
      event.severity,
      event.status,
      event.username,
      event.targetType,
      event.targetId || '',
      event.description,
      event.network.ipAddress
    ]);
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }
}

// Export singleton instance
export const auditLogger = AuditLoggingService.getInstance();

// Export default
export default AuditLoggingService;