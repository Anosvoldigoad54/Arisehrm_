/**
 * Comprehensive Audit Logging Types and Interfaces for AriseHRM
 * Defines the structure for tracking all user actions and system events
 */

// Audit Event Categories
export enum AuditCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  EMPLOYEE_MANAGEMENT = 'EMPLOYEE_MANAGEMENT',
  ATTENDANCE = 'ATTENDANCE',
  LEAVE_MANAGEMENT = 'LEAVE_MANAGEMENT',
  PAYROLL = 'PAYROLL',
  PERFORMANCE = 'PERFORMANCE',
  TRAINING = 'TRAINING',
  RECRUITMENT = 'RECRUITMENT',
  DOCUMENTS = 'DOCUMENTS',
  REPORTS = 'REPORTS',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  DATA_ACCESS = 'DATA_ACCESS',
  COMPLIANCE = 'COMPLIANCE',
  SECURITY = 'SECURITY'
}

// Audit Event Actions
export enum AuditAction {
  // Authentication Actions
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // CRUD Operations
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  BULK_UPDATE = 'BULK_UPDATE',
  BULK_DELETE = 'BULK_DELETE',
  
  // Attendance Actions
  CHECK_IN = 'CHECK_IN',
  CHECK_OUT = 'CHECK_OUT',
  BREAK_START = 'BREAK_START',
  BREAK_END = 'BREAK_END',
  OVERTIME_START = 'OVERTIME_START',
  OVERTIME_END = 'OVERTIME_END',
  
  // Leave Management
  LEAVE_REQUEST = 'LEAVE_REQUEST',
  LEAVE_APPROVE = 'LEAVE_APPROVE',
  LEAVE_REJECT = 'LEAVE_REJECT',
  LEAVE_CANCEL = 'LEAVE_CANCEL',
  
  // Payroll Actions
  PAYROLL_PROCESS = 'PAYROLL_PROCESS',
  PAYROLL_APPROVE = 'PAYROLL_APPROVE',
  SALARY_UPDATE = 'SALARY_UPDATE',
  BONUS_ASSIGN = 'BONUS_ASSIGN',
  
  // Administrative Actions
  PERMISSION_GRANT = 'PERMISSION_GRANT',
  PERMISSION_REVOKE = 'PERMISSION_REVOKE',
  ROLE_ASSIGN = 'ROLE_ASSIGN',
  ROLE_REMOVE = 'ROLE_REMOVE',
  
  // System Actions
  BACKUP_CREATE = 'BACKUP_CREATE',
  BACKUP_RESTORE = 'BACKUP_RESTORE',
  SYSTEM_CONFIG = 'SYSTEM_CONFIG',
  MAINTENANCE_MODE = 'MAINTENANCE_MODE',
  
  // Security Actions
  SECURITY_VIOLATION = 'SECURITY_VIOLATION',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  DATA_EXPORT = 'DATA_EXPORT',
  DATA_IMPORT = 'DATA_IMPORT',
  
  // Compliance Actions
  GDPR_REQUEST = 'GDPR_REQUEST',
  DATA_ANONYMIZE = 'DATA_ANONYMIZE',
  RETENTION_POLICY = 'RETENTION_POLICY'
}

// Audit Event Severity Levels
export enum AuditSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Audit Event Status
export enum AuditStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  WARNING = 'WARNING',
  PENDING = 'PENDING'
}

// Geographic Location Information
export interface AuditLocation {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Device Information
export interface AuditDevice {
  userAgent: string;
  browser: {
    name: string;
    version: string;
  };
  os: {
    name: string;
    version: string;
  };
  device: {
    type: 'mobile' | 'tablet' | 'desktop';
    model?: string;
    vendor?: string;
  };
  screen: {
    width: number;
    height: number;
    colorDepth: number;
  };
}

// Network Information
export interface AuditNetwork {
  ipAddress: string;
  ipAddressType: 'IPv4' | 'IPv6';
  userAgent: string;
  referer?: string;
  forwardedFor?: string;
  proxyChain?: string[];
}

// Security Context
export interface AuditSecurityContext {
  authMethod: 'password' | 'oauth' | 'sso' | 'token' | 'biometric';
  mfaUsed: boolean;
  riskScore?: number;
  securityFlags?: string[];
  threatLevel?: 'low' | 'medium' | 'high' | 'critical';
}

// Data Changes for Audit Trail
export interface AuditDataChange {
  field: string;
  oldValue: any;
  newValue: any;
  dataType: string;
  sensitive: boolean;
}

// Core Audit Event Interface
export interface AuditEvent {
  // Event Identification
  id: string;
  eventId: string;
  correlationId?: string;
  parentEventId?: string;
  
  // Temporal Information
  timestamp: Date;
  eventDate: string; // ISO date string
  eventTime: string; // ISO time string
  timezone: string;
  
  // Event Classification
  category: AuditCategory;
  action: AuditAction;
  severity: AuditSeverity;
  status: AuditStatus;
  
  // Actor Information
  userId: string;
  username: string;
  userRole: string;
  userDepartment?: string;
  actingAsUserId?: string; // For impersonation scenarios
  
  // Target Information
  targetType: string; // employee, document, payroll, etc.
  targetId?: string;
  targetName?: string;
  targetOwner?: string;
  
  // Event Details
  description: string;
  summary: string;
  details?: Record<string, any>;
  dataChanges?: AuditDataChange[];
  
  // Technical Context
  source: string; // web, mobile, api, system
  sourceVersion?: string;
  component: string; // component or module name
  function?: string; // specific function or method
  
  // Network and Device Context
  network: AuditNetwork;
  device: AuditDevice;
  location?: AuditLocation;
  security: AuditSecurityContext;
  
  // Additional Context
  sessionId: string;
  requestId?: string;
  transactionId?: string;
  batchId?: string;
  
  // Compliance and Legal
  complianceFlags?: string[];
  legalHold?: boolean;
  retentionPeriod?: number; // days
  dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted';
  
  // Metadata
  tags?: string[];
  customFields?: Record<string, any>;
  searchableText?: string;
  
  // System Information
  createdAt: Date;
  updatedAt?: Date;
  version: number;
  checksum?: string;
}

// Audit Query Filters
export interface AuditQueryFilters {
  // Time Range
  startDate?: Date;
  endDate?: Date;
  timeRange?: '1h' | '24h' | '7d' | '30d' | '90d' | 'custom';
  
  // User Filters
  userIds?: string[];
  userRoles?: string[];
  departments?: string[];
  
  // Event Filters
  categories?: AuditCategory[];
  actions?: AuditAction[];
  severities?: AuditSeverity[];
  statuses?: AuditStatus[];
  
  // Target Filters
  targetTypes?: string[];
  targetIds?: string[];
  
  // Context Filters
  sources?: string[];
  components?: string[];
  ipAddresses?: string[];
  
  // Search
  searchQuery?: string;
  searchFields?: string[];
  
  // Compliance
  complianceFlags?: string[];
  dataClassifications?: string[];
  
  // Pagination
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Audit Query Results
export interface AuditQueryResult {
  events: AuditEvent[];
  totalCount: number;
  pageCount: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  filters: AuditQueryFilters;
  executionTime: number;
  fromCache: boolean;
}

// Audit Statistics
export interface AuditStatistics {
  totalEvents: number;
  eventsByCategory: Record<AuditCategory, number>;
  eventsByAction: Record<string, number>;
  eventsBySeverity: Record<AuditSeverity, number>;
  eventsByStatus: Record<AuditStatus, number>;
  eventsByUser: Record<string, number>;
  eventsByHour: Record<string, number>;
  eventsByDay: Record<string, number>;
  topUsers: Array<{ userId: string; username: string; eventCount: number }>;
  topComponents: Array<{ component: string; eventCount: number }>;
  securityEvents: number;
  failedEvents: number;
  timeRange: {
    startDate: Date;
    endDate: Date;
  };
}

// Audit Configuration
export interface AuditConfig {
  enabled: boolean;
  categories: {
    [key in AuditCategory]: {
      enabled: boolean;
      actions: AuditAction[];
      retentionDays: number;
      severityThreshold: AuditSeverity;
    };
  };
  storage: {
    maxEvents: number;
    compressionEnabled: boolean;
    encryptionEnabled: boolean;
    archiveAfterDays: number;
  };
  realTime: {
    enabled: boolean;
    alertThresholds: {
      [key in AuditSeverity]: number;
    };
    notificationChannels: string[];
  };
  compliance: {
    gdprEnabled: boolean;
    retentionPolicyDays: number;
    anonymizationEnabled: boolean;
    encryptionRequired: boolean;
  };
  performance: {
    batchSize: number;
    flushInterval: number;
    indexingEnabled: boolean;
    cachingEnabled: boolean;
  };
}

// Partial AuditConfig for configure method
export interface PartialAuditConfig {
  enabled?: boolean;
  categories?: Partial<{
    [key in AuditCategory]: {
      enabled: boolean;
      actions: AuditAction[];
      retentionDays: number;
      severityThreshold: AuditSeverity;
    };
  }>;
  storage?: Partial<AuditConfig['storage']>;
  realTime?: Partial<AuditConfig['realTime']>;
  compliance?: Partial<AuditConfig['compliance']>;
  performance?: Partial<AuditConfig['performance']>;
}

// Audit Alert Configuration
export interface AuditAlert {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: {
    categories?: AuditCategory[];
    actions?: AuditAction[];
    severities?: AuditSeverity[];
    userRoles?: string[];
    thresholds?: {
      eventCount: number;
      timeWindow: number; // minutes
    };
    patterns?: {
      field: string;
      operator: 'equals' | 'contains' | 'regex' | 'greater_than' | 'less_than';
      value: any;
    }[];
  };
  notifications: {
    email?: string[];
    slack?: string[];
    webhook?: string[];
    sms?: string[];
  };
  cooldownPeriod: number; // minutes
  createdAt: Date;
  updatedAt: Date;
  lastTriggered?: Date;
}

// Audit Export Configuration
export interface AuditExportConfig {
  format: 'json' | 'csv' | 'xlsx' | 'pdf';
  filters: AuditQueryFilters;
  fields: string[];
  includeHeaders: boolean;
  compression: boolean;
  encryption: boolean;
  passwordProtection?: boolean;
  watermark?: boolean;
  metadata: {
    title: string;
    description: string;
    author: string;
    organization: string;
  };
}

// Audit Compliance Report
export interface AuditComplianceReport {
  id: string;
  reportType: 'gdpr' | 'sox' | 'hipaa' | 'iso27001' | 'custom';
  timeRange: {
    startDate: Date;
    endDate: Date;
  };
  scope: {
    departments?: string[];
    users?: string[];
    systems?: string[];
  };
  findings: {
    compliant: number;
    nonCompliant: number;
    warnings: number;
    critical: number;
  };
  details: {
    category: string;
    finding: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    recommendation: string;
    evidence: string[];
  }[];
  generatedAt: Date;
  generatedBy: string;
  approvedBy?: string;
  approvedAt?: Date;
}

// Type Guards
export const isAuditEvent = (obj: any): obj is AuditEvent => {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.timestamp === 'object' &&
    Object.values(AuditCategory).includes(obj.category) &&
    Object.values(AuditAction).includes(obj.action);
};

export const isValidAuditSeverity = (severity: string): severity is AuditSeverity => {
  return Object.values(AuditSeverity).includes(severity as AuditSeverity);
};

export const isValidAuditCategory = (category: string): category is AuditCategory => {
  return Object.values(AuditCategory).includes(category as AuditCategory);
};

// Default Values
export const DEFAULT_AUDIT_CONFIG: AuditConfig = {
  enabled: true,
  categories: Object.values(AuditCategory).reduce((acc, category) => {
    acc[category] = {
      enabled: true,
      actions: Object.values(AuditAction),
      retentionDays: 2555, // 7 years
      severityThreshold: AuditSeverity.LOW,
    };
    return acc;
  }, {} as AuditConfig['categories']),
  storage: {
    maxEvents: 1000000,
    compressionEnabled: true,
    encryptionEnabled: true,
    archiveAfterDays: 365,
  },
  realTime: {
    enabled: true,
    alertThresholds: {
      [AuditSeverity.LOW]: 100,
      [AuditSeverity.MEDIUM]: 50,
      [AuditSeverity.HIGH]: 10,
      [AuditSeverity.CRITICAL]: 1,
    },
    notificationChannels: ['email', 'dashboard'],
  },
  compliance: {
    gdprEnabled: true,
    retentionPolicyDays: 2555,
    anonymizationEnabled: true,
    encryptionRequired: true,
  },
  performance: {
    batchSize: 100,
    flushInterval: 5000,
    indexingEnabled: true,
    cachingEnabled: true,
  },
};

export default AuditEvent;