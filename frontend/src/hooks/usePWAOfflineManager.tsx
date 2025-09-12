/**
 * PWA Offline Detection and Notification System
 * Provides comprehensive offline/online status management for AriseHRM
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { toast } from 'sonner';

// Types
export interface NetworkStatus {
  isOnline: boolean;
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
  isSlowConnection: boolean;
  lastOnlineTime: Date | null;
  lastOfflineTime: Date | null;
}

export interface OfflineAction {
  id: string;
  type: 'attendance' | 'leave_request' | 'form_submission' | 'data_update';
  data: any;
  timestamp: Date;
  endpoint: string;
  method: string;
  retryCount: number;
  maxRetries: number;
}

export interface PWACapabilities {
  serviceWorkerSupported: boolean;
  pushNotificationSupported: boolean;
  backgroundSyncSupported: boolean;
  indexedDBSupported: boolean;
  cacheAPISupported: boolean;
  manifestSupported: boolean;
}

// Constants
const SLOW_CONNECTION_THRESHOLD = 1; // Mbps
const OFFLINE_NOTIFICATION_DELAY = 3000; // 3 seconds
const ONLINE_NOTIFICATION_DELAY = 1000; // 1 second
const SYNC_RETRY_INTERVAL = 30000; // 30 seconds
const MAX_OFFLINE_ACTIONS = 100;

/**
 * Custom hook for network status monitoring
 */
export const useNetworkStatus = (): NetworkStatus => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    isSlowConnection: false,
    lastOnlineTime: navigator.onLine ? new Date() : null,
    lastOfflineTime: navigator.onLine ? null : new Date(),
  });

  const updateNetworkStatus = useCallback(() => {
    const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;

    const isOnline = navigator.onLine;
    const now = new Date();

    const newStatus: NetworkStatus = {
      isOnline,
      connectionType: connection?.type || 'unknown',
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0,
      isSlowConnection: connection?.effectiveType === 'slow-2g' || 
                       connection?.effectiveType === '2g' ||
                       (connection?.downlink && connection.downlink < SLOW_CONNECTION_THRESHOLD),
      lastOnlineTime: isOnline ? now : networkStatus.lastOnlineTime,
      lastOfflineTime: !isOnline ? now : networkStatus.lastOfflineTime,
    };

    setNetworkStatus(newStatus);
  }, [networkStatus]);

  useEffect(() => {
    // Initial update
    updateNetworkStatus();

    // Event listeners
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // Connection change listener (if supported)
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, [updateNetworkStatus]);

  return networkStatus;
};

/**
 * Custom hook for offline actions management
 */
export const useOfflineActions = () => {
  const [offlineActions, setOfflineActions] = useState<OfflineAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load offline actions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('ariseHRM-offline-actions');
    if (stored) {
      try {
        const actions = JSON.parse(stored).map((action: any) => ({
          ...action,
          timestamp: new Date(action.timestamp),
        }));
        setOfflineActions(actions);
      } catch (error) {
        console.error('Failed to load offline actions:', error);
        localStorage.removeItem('ariseHRM-offline-actions');
      }
    }
  }, []);

  // Save offline actions to localStorage whenever they change
  useEffect(() => {
    if (offlineActions.length > 0) {
      localStorage.setItem('ariseHRM-offline-actions', JSON.stringify(offlineActions));
    } else {
      localStorage.removeItem('ariseHRM-offline-actions');
    }
  }, [offlineActions]);

  const addOfflineAction = useCallback((action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>) => {
    const newAction: OfflineAction = {
      ...action,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      retryCount: 0,
    };

    setOfflineActions(prev => {
      // Limit the number of offline actions
      const updated = [newAction, ...prev].slice(0, MAX_OFFLINE_ACTIONS);
      return updated;
    });

    toast.info('Action saved for when you\'re back online', {
      description: `${action.type.replace('_', ' ')} will be synced automatically`,
      duration: 3000,
    });

    return newAction.id;
  }, []);

  const removeOfflineAction = useCallback((actionId: string) => {
    setOfflineActions(prev => prev.filter(action => action.id !== actionId));
  }, []);

  const syncOfflineActions = useCallback(async (networkStatus: NetworkStatus) => {
    if (!networkStatus.isOnline || isSyncing || offlineActions.length === 0) {
      return;
    }

    setIsSyncing(true);
    const actionsToSync = [...offlineActions];
    let successCount = 0;
    let failureCount = 0;

    for (const action of actionsToSync) {
      try {
        const response = await fetch(action.endpoint, {
          method: action.method,
          headers: {
            'Content-Type': 'application/json',
            // Add authentication headers if available
            ...getAuthHeaders(),
          },
          body: JSON.stringify(action.data),
        });

        if (response.ok) {
          removeOfflineAction(action.id);
          successCount++;
        } else {
          // Increment retry count
          setOfflineActions(prev => 
            prev.map(a => 
              a.id === action.id 
                ? { ...a, retryCount: a.retryCount + 1 }
                : a
            )
          );

          if (action.retryCount >= action.maxRetries) {
            removeOfflineAction(action.id);
            failureCount++;
          }
        }
      } catch (error) {
        console.error('Failed to sync offline action:', error);
        
        // Increment retry count
        setOfflineActions(prev => 
          prev.map(a => 
            a.id === action.id 
              ? { ...a, retryCount: a.retryCount + 1 }
              : a
          )
        );

        if (action.retryCount >= action.maxRetries) {
          removeOfflineAction(action.id);
          failureCount++;
        }
      }
    }

    setIsSyncing(false);

    // Show sync results
    if (successCount > 0) {
      toast.success(`Synced ${successCount} offline action${successCount > 1 ? 's' : ''}`, {
        description: 'Your data has been updated successfully',
      });
    }

    if (failureCount > 0) {
      toast.error(`Failed to sync ${failureCount} action${failureCount > 1 ? 's' : ''}`, {
        description: 'Some actions could not be processed',
      });
    }
  }, [isSyncing, offlineActions, removeOfflineAction]);

  const clearOfflineActions = useCallback(() => {
    setOfflineActions([]);
    localStorage.removeItem('ariseHRM-offline-actions');
    toast.info('Offline actions cleared');
  }, []);

  return {
    offlineActions,
    addOfflineAction,
    removeOfflineAction,
    syncOfflineActions,
    clearOfflineActions,
    isSyncing,
    pendingCount: offlineActions.length,
  };
};

/**
 * Custom hook for PWA capabilities detection
 */
export const usePWACapabilities = (): PWACapabilities => {
  const [capabilities, setCapabilities] = useState<PWACapabilities>({
    serviceWorkerSupported: 'serviceWorker' in navigator,
    pushNotificationSupported: 'PushManager' in window && 'Notification' in window,
    backgroundSyncSupported: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
    indexedDBSupported: 'indexedDB' in window,
    cacheAPISupported: 'caches' in window,
    manifestSupported: 'manifest' in document.createElement('link'),
  });

  useEffect(() => {
    // Additional capability checks can be added here
    const checkAdvancedFeatures = async () => {
      // Check for more advanced PWA features
      const updates = { ...capabilities };

      // Check for push notification permission
      if (capabilities.pushNotificationSupported) {
        try {
          const permission = await Notification.requestPermission();
          updates.pushNotificationSupported = permission !== 'denied';
        } catch (error) {
          updates.pushNotificationSupported = false;
        }
      }

      setCapabilities(updates);
    };

    checkAdvancedFeatures();
  }, []);

  return capabilities;
};

/**
 * Main PWA Offline Manager Hook
 */
export const usePWAOfflineManager = () => {
  const networkStatus = useNetworkStatus();
  const offlineActions = useOfflineActions();
  const capabilities = usePWACapabilities();
  const notificationShownRef = useRef<{ offline: boolean; online: boolean }>({
    offline: false,
    online: false,
  });

  // Handle online/offline notifications
  useEffect(() => {
    if (!networkStatus.isOnline && !notificationShownRef.current.offline) {
      const timer = setTimeout(() => {
        toast.error('You\'re now offline', {
          description: 'Some features may be limited. Actions will be saved and synced when you\'re back online.',
          duration: 5000,
          action: {
            label: 'View Offline Actions',
            onClick: () => {
              // Could open a modal showing pending actions
              console.log('Offline actions:', offlineActions.offlineActions);
            },
          },
        });
        notificationShownRef.current.offline = true;
      }, OFFLINE_NOTIFICATION_DELAY);

      return () => clearTimeout(timer);
    }

    if (networkStatus.isOnline && notificationShownRef.current.offline && !notificationShownRef.current.online) {
      const timer = setTimeout(() => {
        toast.success('You\'re back online!', {
          description: offlineActions.pendingCount > 0 
            ? `Syncing ${offlineActions.pendingCount} pending action${offlineActions.pendingCount > 1 ? 's' : ''}...`
            : 'All features are now available.',
          duration: 3000,
        });
        notificationShownRef.current.online = true;
        notificationShownRef.current.offline = false;
      }, ONLINE_NOTIFICATION_DELAY);

      return () => clearTimeout(timer);
    }

    // Reset notification flags when going offline again
    if (!networkStatus.isOnline) {
      notificationShownRef.current.online = false;
    }
  }, [networkStatus.isOnline, offlineActions.pendingCount]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (networkStatus.isOnline && offlineActions.pendingCount > 0) {
      const timer = setTimeout(() => {
        offlineActions.syncOfflineActions(networkStatus);
      }, 2000); // Wait 2 seconds after coming online

      return () => clearTimeout(timer);
    }
  }, [networkStatus.isOnline, offlineActions.pendingCount]); // Removed circular dependencies

  // Periodic sync attempts when online
  useEffect(() => {
    if (networkStatus.isOnline && offlineActions.pendingCount > 0) {
      const interval = setInterval(() => {
        offlineActions.syncOfflineActions(networkStatus);
      }, SYNC_RETRY_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [networkStatus.isOnline, offlineActions.pendingCount]); // Removed circular dependencies

  // Slow connection warning
  useEffect(() => {
    if (networkStatus.isOnline && networkStatus.isSlowConnection) {
      toast.warning('Slow connection detected', {
        description: 'Some features may load slowly. Consider switching to a better network.',
        duration: 4000,
      });
    }
  }, [networkStatus.isSlowConnection]);

  return {
    networkStatus,
    offlineActions: offlineActions.offlineActions,
    addOfflineAction: offlineActions.addOfflineAction,
    syncOfflineActions: () => offlineActions.syncOfflineActions(networkStatus),
    clearOfflineActions: offlineActions.clearOfflineActions,
    isSyncing: offlineActions.isSyncing,
    pendingActionsCount: offlineActions.pendingCount,
    capabilities,
    isOnline: networkStatus.isOnline,
    isSlowConnection: networkStatus.isSlowConnection,
  };
};

/**
 * Simple PWA Status Component - Prevents infinite render loops
 */
export const PWAStatusIndicator: React.FC = () => {
  // Use a simple approach without complex state dependencies
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  // Simple network status listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check pending actions from localStorage
    const checkPendingActions = () => {
      try {
        const stored = localStorage.getItem('ariseHRM-offline-actions');
        if (stored) {
          const actions = JSON.parse(stored);
          setPendingCount(Array.isArray(actions) ? actions.length : 0);
        } else {
          setPendingCount(0);
        }
      } catch {
        setPendingCount(0);
      }
    };

    checkPendingActions();
    
    // Check every 5 seconds for changes
    const interval = setInterval(checkPendingActions, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []); // Empty dependency array to prevent loops

  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        Offline
        {pendingCount > 0 && (
          <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
            {pendingCount}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      Online
    </div>
  );
};

// Utility functions
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
    };
  }
  
  return {};
}

export default usePWAOfflineManager;