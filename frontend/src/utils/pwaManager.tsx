/**
 * PWA Registration and Update Management System
 * Handles service worker registration, updates, and user notifications
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

// Module-level registration guard to prevent multiple instances
let globalRegistrationAttempted = false;
let globalRegistration: ServiceWorkerRegistration | null = null;

// Types
export interface ServiceWorkerState {
  isRegistered: boolean;
  isControlling: boolean;
  isWaitingForUpdate: boolean;
  isUpdating: boolean;
  hasUpdate: boolean;
  registration: ServiceWorkerRegistration | null;
  error: string | null;
  lastUpdateCheck: Date | null;
}

export interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
  installationResult: 'accepted' | 'dismissed' | null;
}

export interface PWAUpdateInfo {
  version: string;
  features: string[];
  releaseNotes: string;
  isRequired: boolean;
}

// Custom event interface for beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Constants
const SW_UPDATE_CHECK_INTERVAL = 60000; // 1 minute
const INSTALL_BANNER_DELAY = 30000; // 30 seconds
const UPDATE_NOTIFICATION_TIMEOUT = 10000; // 10 seconds

/**
 * Custom hook for Service Worker management
 */
export function useServiceWorker() {
  const [swState, setSWState] = useState<ServiceWorkerState>({
    isRegistered: false,
    isControlling: !!navigator.serviceWorker?.controller,
    isWaitingForUpdate: false,
    isUpdating: false,
    hasUpdate: false,
    registration: null,
    error: null,
    lastUpdateCheck: null,
  });

  const updateCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const registrationAttempted = useRef(false);
  const currentRegistration = useRef<ServiceWorkerRegistration | null>(null);

  // Register service worker
  const register = useCallback(async () => {
    // ✅ COMPLETELY DISABLE SERVICE WORKER to prevent login page reloads
    console.log('[PWA] Service Worker registration is completely disabled to prevent authentication issues');
    return null;
  }, []);

  // Unregister service worker
  const unregister = useCallback(async () => {
    // No-op since service worker is disabled
    console.log('[PWA] Service Worker unregistration skipped - service worker is disabled');
  }, []);

  // Check for service worker updates
  const checkForUpdates = useCallback(async (registration?: ServiceWorkerRegistration) => {
    // No-op since service worker is disabled
    console.log('[PWA] Service Worker update check skipped - service worker is disabled');
  }, []);

  // Skip waiting and activate new service worker
  const skipWaiting = useCallback(() => {
    // No-op since service worker is disabled
    console.log('[PWA] Service Worker skip waiting skipped - service worker is disabled');
  }, []);

  // Set up service worker event listeners
  const setupServiceWorkerListeners = useCallback((registration: ServiceWorkerRegistration) => {
    // No-op since service worker is disabled
    console.log('[PWA] Service Worker listeners setup skipped - service worker is disabled');
  }, []);

  // Track individual service worker state changes
  const trackServiceWorkerState = useCallback((worker: ServiceWorker) => {
    // No-op since service worker is disabled
    console.log('[PWA] Service Worker state tracking skipped - service worker is disabled');
  }, []);

  // Show update notification
  const showUpdateNotification = useCallback((updateInfo?: PWAUpdateInfo) => {
    // No-op since service worker is disabled
    console.log('[PWA] Service Worker update notification skipped - service worker is disabled');
  }, []);

  // Initialize service worker on mount
  useEffect(() => {
    // ✅ COMPLETELY DISABLE SERVICE WORKER INITIALIZATION
    console.log('[PWA] Service Worker initialization is completely disabled to prevent authentication issues');
    
    // Set initial state to reflect disabled service worker
    setSWState(prev => ({
      ...prev,
      isRegistered: false,
      isControlling: false,
      hasUpdate: false,
      isWaitingForUpdate: false,
      isUpdating: false,
      registration: null,
      error: 'Service Worker is disabled to prevent authentication issues'
    }));
  }, []);

  return {
    ...swState,
    register,
    unregister,
    checkForUpdates: () => checkForUpdates(),
    skipWaiting,
  };
};

/**
 * Custom hook for PWA installation management
 */
export const usePWAInstall = () => {
  // Completely disable PWA installation to prevent authentication issues
  const [installState, setInstallState] = useState<PWAInstallState>({
    isInstallable: false,
    isInstalled: false,
    installPrompt: null,
    installationResult: null,
  });

  const installBannerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Install PWA - no-op since disabled
  const install = useCallback(async () => {
    console.log('[PWA] PWA installation is completely disabled to prevent authentication issues');
    return Promise.resolve();
  }, []);

  // Check if already installed - always return false since disabled
  const checkInstallationStatus = useCallback(() => {
    console.log('[PWA] PWA installation check is completely disabled to prevent authentication issues');
  }, []);

  // Show install banner after delay - no-op since disabled
  const showInstallBanner = useCallback(() => {
    console.log('[PWA] PWA install banner is completely disabled to prevent authentication issues');
  }, []);

  // Set up installation event listeners - no-op since disabled
  useEffect(() => {
    console.log('[PWA] PWA installation event listeners are completely disabled to prevent authentication issues');
    
    return () => {
      // Clean up any timeouts
      if (installBannerTimeoutRef.current) {
        clearTimeout(installBannerTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...installState,
    install,
    canInstall: false,
  };
};

/**
 * Main PWA Manager Hook
 */
export function usePWAManager() {
  // Completely disable PWA functionality to prevent authentication issues
  const serviceWorker = useServiceWorker();
  const install = usePWAInstall();

  // Get PWA capabilities - all disabled
  const capabilities = {
    serviceWorkerSupported: false,
    installSupported: false,
    notificationSupported: false,
    pushSupported: false,
    backgroundSyncSupported: false,
  };

  // PWA status - all disabled
  const status = {
    isReady: false,
    isInstalled: false,
    canInstall: false,
    hasUpdate: false,
    isOfflineCapable: false,
  };

  // Return completely disabled PWA manager
  return {
    serviceWorker: {
      ...serviceWorker,
      isRegistered: false,
      isControlling: false,
      hasUpdate: false,
      isWaitingForUpdate: false,
      isUpdating: false,
      register: () => Promise.resolve(null),
      unregister: () => Promise.resolve(),
      checkForUpdates: () => Promise.resolve(),
      skipWaiting: () => {},
    },
    install: {
      ...install,
      isInstallable: false,
      isInstalled: false,
      canInstall: false,
      install: () => Promise.resolve(),
    },
    capabilities,
    status,
  };
}

/**
 * PWA Update Banner Component
 */
export const PWAUpdateBanner: React.FC = () => {
  // Completely disable PWA update banner to prevent authentication issues
  console.log('[PWA] PWA Update Banner is completely disabled to prevent authentication issues');
  return null;
};

/**
 * PWA Install Button Component
 */
export const PWAInstallButton: React.FC<{ 
  variant?: 'button' | 'banner';
  className?: string;
}> = ({ variant = 'button', className = '' }) => {
  // Completely disable PWA install button to prevent authentication issues
  console.log('[PWA] PWA Install Button is completely disabled to prevent authentication issues');
  return null;
};

export default usePWAManager;