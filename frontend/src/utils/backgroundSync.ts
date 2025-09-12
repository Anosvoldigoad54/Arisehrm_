/**
 * Background Sync Manager for AriseHRM
 * Handles critical operations that need to be synced when the connection is restored
 */

import React from 'react';
import { toast } from 'sonner';

// Types
export interface SyncableOperation {
  id: string;
  type: 'attendance' | 'leave_request' | 'timesheet' | 'profile_update' | 'emergency_contact';
  priority: 'high' | 'medium' | 'low';
  data: any;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  timestamp: Date;
  userId: string;
  retryCount: number;
  maxRetries: number;
  dependencies?: string[]; // IDs of operations that must complete first
  metadata?: Record<string, any>;
}

export interface SyncConfig {
  enabled: boolean;
  maxOperations: number;
  retryDelays: number[]; // milliseconds for each retry attempt
  batchSize: number;
  conflictResolution: 'client_wins' | 'server_wins' | 'manual';
}

export interface SyncResult {
  success: boolean;
  operationId: string;
  error?: string;
  conflictData?: any;
  serverResponse?: any;
}

export interface SyncStats {
  totalOperations: number;
  pendingOperations: number;
  successfulSyncs: number;
  failedSyncs: number;
  lastSyncTime: Date | null;
  estimatedSyncTime: number; // milliseconds
}

// Default configuration
const DEFAULT_SYNC_CONFIG: SyncConfig = {
  enabled: true,
  maxOperations: 500,
  retryDelays: [1000, 3000, 10000, 30000, 60000], // 1s, 3s, 10s, 30s, 1m
  batchSize: 10,
  conflictResolution: 'server_wins',
};

/**
 * Background Sync Manager Class
 */
export class BackgroundSyncManager {
  private static instance: BackgroundSyncManager;
  private operations: Map<string, SyncableOperation> = new Map();
  private config: SyncConfig = DEFAULT_SYNC_CONFIG;
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private syncQueue: string[] = [];
  private listeners: Set<(stats: SyncStats) => void> = new Set();

  private constructor() {
    this.setupEventListeners();
    this.loadPersistedOperations();
  }

  static getInstance(): BackgroundSyncManager {
    if (!BackgroundSyncManager.instance) {
      BackgroundSyncManager.instance = new BackgroundSyncManager();
    }
    return BackgroundSyncManager.instance;
  }

  /**
   * Configure sync settings
   */
  configure(config: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...config };
    this.persistConfig();
  }

  /**
   * Add operation to sync queue
   */
  addOperation(operation: Omit<SyncableOperation, 'id' | 'timestamp' | 'retryCount'>): string {
    const id = this.generateOperationId();
    const fullOperation: SyncableOperation = {
      ...operation,
      id,
      timestamp: new Date(),
      retryCount: 0,
    };

    // Check if we're at capacity
    if (this.operations.size >= this.config.maxOperations) {
      this.removeOldestOperation();
    }

    this.operations.set(id, fullOperation);
    this.persistOperations();
    this.notifyListeners();

    // Try immediate sync if online
    if (this.isOnline && this.config.enabled) {
      this.scheduleSync();
    }

    console.log(`[BackgroundSync] Added operation: ${operation.type} (${id})`);
    return id;
  }

  /**
   * Remove operation from queue
   */
  removeOperation(id: string): boolean {
    const removed = this.operations.delete(id);
    if (removed) {
      this.persistOperations();
      this.notifyListeners();
    }
    return removed;
  }

  /**
   * Get operation by ID
   */
  getOperation(id: string): SyncableOperation | undefined {
    return this.operations.get(id);
  }

  /**
   * Get all pending operations
   */
  getPendingOperations(): SyncableOperation[] {
    return Array.from(this.operations.values())
      .sort((a, b) => {
        // Sort by priority, then by timestamp
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return a.timestamp.getTime() - b.timestamp.getTime();
      });
  }

  /**
   * Get sync statistics
   */
  getStats(): SyncStats {
    const operations = Array.from(this.operations.values());
    const lastSync = localStorage.getItem('backgroundSync.lastSyncTime');
    
    return {
      totalOperations: operations.length,
      pendingOperations: operations.length,
      successfulSyncs: parseInt(localStorage.getItem('backgroundSync.successCount') || '0'),
      failedSyncs: parseInt(localStorage.getItem('backgroundSync.failCount') || '0'),
      lastSyncTime: lastSync ? new Date(lastSync) : null,
      estimatedSyncTime: this.estimateSyncTime(),
    };
  }

  /**
   * Force sync all operations
   */
  async forcSync(): Promise<SyncResult[]> {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress');
    }

    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    return this.performSync(true);
  }

  /**
   * Clear all operations
   */
  clearAll(): void {
    this.operations.clear();
    this.syncQueue = [];
    this.persistOperations();
    this.notifyListeners();
    toast.info('All offline operations cleared');
  }

  /**
   * Add sync listener
   */
  addListener(listener: (stats: SyncStats) => void): void {
    this.listeners.add(listener);
  }

  /**
   * Remove sync listener
   */
  removeListener(listener: (stats: SyncStats) => void): void {
    this.listeners.delete(listener);
  }

  // Private methods

  private setupEventListeners(): void {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('[BackgroundSync] Connection restored, starting sync...');
      this.scheduleSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('[BackgroundSync] Connection lost, queuing operations...');
    });

    // Service Worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'BACKGROUND_SYNC_COMPLETE') {
          this.handleServiceWorkerSyncComplete(event.data.payload);
        }
      });
    }

    // Page visibility change (sync when page becomes visible)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline && this.operations.size > 0) {
        this.scheduleSync();
      }
    });
  }

  private async performSync(force: boolean = false): Promise<SyncResult[]> {
    if (this.syncInProgress && !force) {
      return [];
    }

    if (!this.isOnline) {
      console.log('[BackgroundSync] Cannot sync while offline');
      return [];
    }

    this.syncInProgress = true;
    const results: SyncResult[] = [];
    const operations = this.getPendingOperations();

    console.log(`[BackgroundSync] Starting sync of ${operations.length} operations`);

    try {
      // Process operations in batches
      for (let i = 0; i < operations.length; i += this.config.batchSize) {
        const batch = operations.slice(i, i + this.config.batchSize);
        const batchResults = await this.processBatch(batch);
        results.push(...batchResults);

        // Small delay between batches to prevent overwhelming the server
        if (i + this.config.batchSize < operations.length) {
          await this.delay(500);
        }
      }

      // Update success/fail counts
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      this.updateSyncStats(successCount, failCount);

      if (successCount > 0) {
        toast.success(`Synced ${successCount} operation${successCount > 1 ? 's' : ''}`, {
          description: 'Your offline actions have been saved successfully.',
        });
      }

      if (failCount > 0) {
        toast.warning(`${failCount} operation${failCount > 1 ? 's' : ''} failed to sync`, {
          description: 'These will be retried automatically.',
        });
      }

    } catch (error) {
      console.error('[BackgroundSync] Sync failed:', error);
      toast.error('Sync failed', {
        description: 'Will retry automatically when connection improves.',
      });
    } finally {
      this.syncInProgress = false;
      this.notifyListeners();
    }

    return results;
  }

  private async processBatch(operations: SyncableOperation[]): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    for (const operation of operations) {
      try {
        const result = await this.syncOperation(operation);
        results.push(result);

        if (result.success) {
          this.removeOperation(operation.id);
        } else {
          // Increment retry count
          operation.retryCount++;
          if (operation.retryCount >= operation.maxRetries) {
            console.warn(`[BackgroundSync] Max retries reached for operation ${operation.id}`);
            this.removeOperation(operation.id);
          }
        }
      } catch (error) {
        console.error(`[BackgroundSync] Error syncing operation ${operation.id}:`, error);
        results.push({
          success: false,
          operationId: operation.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  private async syncOperation(operation: SyncableOperation): Promise<SyncResult> {
    try {
      const authHeaders = this.getAuthHeaders();
      
      const response = await fetch(operation.endpoint, {
        method: operation.method,
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(operation.data),
      });

      if (response.ok) {
        const serverResponse = await response.json().catch(() => null);
        return {
          success: true,
          operationId: operation.id,
          serverResponse,
        };
      } else if (response.status === 409) {
        // Conflict - handle based on configuration
        const conflictData = await response.json().catch(() => null);
        return this.handleConflict(operation, conflictData);
      } else {
        return {
          success: false,
          operationId: operation.id,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        operationId: operation.id,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  private handleConflict(operation: SyncableOperation, conflictData: any): SyncResult {
    switch (this.config.conflictResolution) {
      case 'client_wins':
        // Force update with client data - handle async
        this.forceClientUpdate(operation).then(result => {
          console.log(`[BackgroundSync] Force update result:`, result);
        }).catch(error => {
          console.error(`[BackgroundSync] Force update failed:`, error);
        });
        // Return immediate result for now
        return {
          success: false,
          operationId: operation.id,
          error: 'Client wins conflict - processing',
          conflictData,
        };
      
      case 'server_wins':
        // Accept server data and mark as successful
        console.log(`[BackgroundSync] Server data wins for operation ${operation.id}`);
        return {
          success: true,
          operationId: operation.id,
          conflictData,
        };
      
      case 'manual':
        // Require manual resolution
        this.notifyConflict(operation, conflictData);
        return {
          success: false,
          operationId: operation.id,
          error: 'Manual conflict resolution required',
          conflictData,
        };
      
      default:
        return {
          success: false,
          operationId: operation.id,
          error: 'Unknown conflict resolution strategy',
          conflictData,
        };
    }
  }

  private async forceClientUpdate(operation: SyncableOperation): Promise<SyncResult> {
    // Implementation would depend on API design
    // This is a simplified version
    try {
      const authHeaders = this.getAuthHeaders();
      
      const response = await fetch(operation.endpoint, {
        method: operation.method,
        headers: {
          'Content-Type': 'application/json',
          'X-Conflict-Resolution': 'force-client',
          ...authHeaders,
        },
        body: JSON.stringify(operation.data),
      });

      if (response.ok) {
        return {
          success: true,
          operationId: operation.id,
        };
      }
    } catch (error) {
      console.error('[BackgroundSync] Force update failed:', error);
    }

    return {
      success: false,
      operationId: operation.id,
      error: 'Force update failed',
    };
  }

  private notifyConflict(operation: SyncableOperation, conflictData: any): void {
    toast.error('Data conflict detected', {
      description: `${operation.type} requires manual resolution`,
      duration: 10000,
      action: {
        label: 'Resolve',
        onClick: () => {
          // Open conflict resolution dialog
          console.log('Opening conflict resolution for:', operation, conflictData);
        },
      },
    });
  }

  private scheduleSync(): void {
    if (this.syncInProgress || !this.isOnline || this.operations.size === 0) {
      return;
    }

    // Debounced sync - wait a bit before syncing to batch operations
    setTimeout(() => {
      if (this.isOnline && this.operations.size > 0 && !this.syncInProgress) {
        this.performSync();
      }
    }, 2000);
  }

  private generateOperationId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private removeOldestOperation(): void {
    const operations = Array.from(this.operations.values())
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    if (operations.length > 0) {
      this.operations.delete(operations[0].id);
    }
  }

  private estimateSyncTime(): number {
    const operationCount = this.operations.size;
    const avgTimePerOperation = 500; // 500ms per operation estimate
    return operationCount * avgTimePerOperation;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
      };
    }
    
    return {};
  }

  private updateSyncStats(successCount: number, failCount: number): void {
    const currentSuccess = parseInt(localStorage.getItem('backgroundSync.successCount') || '0');
    const currentFail = parseInt(localStorage.getItem('backgroundSync.failCount') || '0');
    
    localStorage.setItem('backgroundSync.successCount', (currentSuccess + successCount).toString());
    localStorage.setItem('backgroundSync.failCount', (currentFail + failCount).toString());
    localStorage.setItem('backgroundSync.lastSyncTime', new Date().toISOString());
  }

  private notifyListeners(): void {
    const stats = this.getStats();
    this.listeners.forEach(listener => {
      try {
        listener(stats);
      } catch (error) {
        console.error('[BackgroundSync] Listener error:', error);
      }
    });
  }

  private loadPersistedOperations(): void {
    try {
      const stored = localStorage.getItem('backgroundSync.operations');
      if (stored) {
        const operations = JSON.parse(stored);
        operations.forEach((op: any) => {
          const operation: SyncableOperation = {
            ...op,
            timestamp: new Date(op.timestamp),
          };
          this.operations.set(operation.id, operation);
        });
        console.log(`[BackgroundSync] Loaded ${this.operations.size} persisted operations`);
      }
    } catch (error) {
      console.error('[BackgroundSync] Failed to load persisted operations:', error);
      localStorage.removeItem('backgroundSync.operations');
    }
  }

  private persistOperations(): void {
    try {
      const operations = Array.from(this.operations.values());
      localStorage.setItem('backgroundSync.operations', JSON.stringify(operations));
    } catch (error) {
      console.error('[BackgroundSync] Failed to persist operations:', error);
    }
  }

  private persistConfig(): void {
    try {
      localStorage.setItem('backgroundSync.config', JSON.stringify(this.config));
    } catch (error) {
      console.error('[BackgroundSync] Failed to persist config:', error);
    }
  }

  private handleServiceWorkerSyncComplete(payload: any): void {
    console.log('[BackgroundSync] Service Worker sync complete:', payload);
    // Handle completion of background sync from service worker
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const backgroundSyncManager = BackgroundSyncManager.getInstance();

/**
 * React hook for background sync
 */
export const useBackgroundSync = () => {
  const [stats, setStats] = React.useState<SyncStats>(backgroundSyncManager.getStats());
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const updateStats = (newStats: SyncStats) => {
      setStats(newStats);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    backgroundSyncManager.addListener(updateStats);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      backgroundSyncManager.removeListener(updateStats);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addOperation = React.useCallback((operation: Omit<SyncableOperation, 'id' | 'timestamp' | 'retryCount'>) => {
    return backgroundSyncManager.addOperation(operation);
  }, []);

  const forcSync = React.useCallback(async () => {
    return backgroundSyncManager.forcSync();
  }, []);

  const clearAll = React.useCallback(() => {
    backgroundSyncManager.clearAll();
  }, []);

  return {
    stats,
    isOnline,
    addOperation,
    forcSync,
    clearAll,
    pendingOperations: backgroundSyncManager.getPendingOperations(),
  };
};

export default BackgroundSyncManager;