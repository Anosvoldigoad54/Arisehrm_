/**
 * Production-ready logging service for Arise HRM
 * Replaces console statements with configurable, secure logging
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  error?: Error;
}

export interface LogConfig {
  enableConsole: boolean;
  enableRemote: boolean;
  minLevel: LogLevel;
  remoteEndpoint?: string;
  apiKey?: string;
  batchSize: number;
  flushInterval: number; // milliseconds
}

class LoggingService {
  private config: LogConfig;
  private logQueue: LogEntry[] = [];
  private flushTimer?: NodeJS.Timeout;

  constructor() {
    this.config = this.getDefaultConfig();
    this.startFlushTimer();
  }

  private getDefaultConfig(): LogConfig {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isTest = process.env.NODE_ENV === 'test';
    
    return {
      enableConsole: isDevelopment || isTest,
      enableRemote: !isDevelopment && !isTest,
      minLevel: isDevelopment ? LogLevel.DEBUG : LogLevel.INFO,
      remoteEndpoint: process.env.VITE_LOG_ENDPOINT,
      apiKey: process.env.VITE_LOG_API_KEY,
      batchSize: 10,
      flushInterval: 5000
    };
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: any,
    context?: {
      userId?: string;
      sessionId?: string;
      component?: string;
      action?: string;
      error?: Error;
    }
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: this.sanitizeData(data),
      ...context
    };
  }

  private sanitizeData(data: any): any {
    if (!data) return data;

    // Remove sensitive information
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
    
    if (typeof data === 'object') {
      const sanitized = { ...data };
      
      for (const key in sanitized) {
        if (sensitiveKeys.some(sensitive => 
          key.toLowerCase().includes(sensitive.toLowerCase())
        )) {
          sanitized[key] = '[REDACTED]';
        }
      }
      
      return sanitized;
    }
    
    return data;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.minLevel;
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return;

    const { timestamp, level, message, data } = entry;
    const logMethod = this.getConsoleMethod(level);
    const prefix = `[${timestamp}] [${LogLevel[level]}]`;

    if (data) {
      logMethod(`${prefix} ${message}`, data);
    } else {
      logMethod(`${prefix} ${message}`);
    }
  }

  private getConsoleMethod(level: LogLevel): (...args: any[]) => void {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug;
      case LogLevel.INFO:
        return console.info;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        return console.error;
      default:
        return console.log;
    }
  }

  private addToQueue(entry: LogEntry): void {
    this.logQueue.push(entry);
    
    if (this.logQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.logQueue.length === 0 || !this.config.enableRemote) return;

    const logsToSend = [...this.logQueue];
    this.logQueue = [];

    try {
      if (this.config.remoteEndpoint && this.config.apiKey) {
        await fetch(this.config.remoteEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          },
          body: JSON.stringify({ logs: logsToSend })
        });
      }
    } catch (error) {
      // If remote logging fails, fall back to console in production
      if (this.config.enableConsole) {
        logsToSend.forEach(entry => this.logToConsole(entry));
      }
    }
  }

  /**
   * Log a debug message
   */
  debug(message: string, data?: any, context?: any): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    const entry = this.createLogEntry(LogLevel.DEBUG, message, data, context);
    this.logToConsole(entry);
    this.addToQueue(entry);
  }

  /**
   * Log an info message
   */
  info(message: string, data?: any, context?: any): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    const entry = this.createLogEntry(LogLevel.INFO, message, data, context);
    this.logToConsole(entry);
    this.addToQueue(entry);
  }

  /**
   * Log a warning message
   */
  warn(message: string, data?: any, context?: any): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    const entry = this.createLogEntry(LogLevel.WARN, message, data, context);
    this.logToConsole(entry);
    this.addToQueue(entry);
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error, data?: any, context?: any): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    const entry = this.createLogEntry(LogLevel.ERROR, message, data, {
      ...context,
      error
    });
    this.logToConsole(entry);
    this.addToQueue(entry);
  }

  /**
   * Log a critical error that needs immediate attention
   */
  critical(message: string, error?: Error, data?: any, context?: any): void {
    const entry = this.createLogEntry(LogLevel.CRITICAL, message, data, {
      ...context,
      error
    });
    this.logToConsole(entry);
    this.addToQueue(entry);
    
    // Immediately flush critical errors
    this.flush();
  }

  /**
   * User action logging for audit trails
   */
  auditLog(action: string, userId: string, data?: any): void {
    this.info(`USER_ACTION: ${action}`, data, {
      userId,
      component: 'AUDIT',
      action
    });
  }

  /**
   * Security event logging
   */
  securityLog(event: string, userId?: string, data?: any): void {
    this.warn(`SECURITY_EVENT: ${event}`, data, {
      userId,
      component: 'SECURITY',
      action: event
    });
  }

  /**
   * Performance logging
   */
  perfLog(metric: string, value: number, component?: string): void {
    this.debug(`PERFORMANCE: ${metric}`, { value, metric }, {
      component: component || 'PERFORMANCE',
      action: 'METRIC'
    });
  }

  /**
   * Update logging configuration
   */
  updateConfig(newConfig: Partial<LogConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.flushInterval) {
      this.startFlushTimer();
    }
  }

  /**
   * Manually flush all queued logs
   */
  async forceFlush(): Promise<void> {
    await this.flush();
  }

  /**
   * Clean shutdown - flush all logs before app termination
   */
  async shutdown(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    await this.flush();
  }
}

// Create singleton instance
const logger = new LoggingService();

// Export convenient methods
export const log = {
  debug: (message: string, data?: any, context?: any) => logger.debug(message, data, context),
  info: (message: string, data?: any, context?: any) => logger.info(message, data, context),
  warn: (message: string, data?: any, context?: any) => logger.warn(message, data, context),
  error: (message: string, error?: Error, data?: any, context?: any) => logger.error(message, error, data, context),
  critical: (message: string, error?: Error, data?: any, context?: any) => logger.critical(message, error, data, context),
  audit: (action: string, userId: string, data?: any) => logger.auditLog(action, userId, data),
  security: (event: string, userId?: string, data?: any) => logger.securityLog(event, userId, data),
  perf: (metric: string, value: number, component?: string) => logger.perfLog(metric, value, component)
};

export default logger;
