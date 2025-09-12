import { toast } from 'sonner'

/**
 * Network Status Manager
 * Tracks connectivity and notifies users about offline/online status
 */
class NetworkStatusManager {
  private isOnline: boolean = navigator.onLine
  private hasShownOfflineNotice: boolean = false
  private reconnectionToastId: string | number | null = null

  constructor() {
    this.initializeEventListeners()
    this.checkInitialConnection()
  }

  private initializeEventListeners() {
    window.addEventListener('online', () => {
      this.handleOnline()
    })

    window.addEventListener('offline', () => {
      this.handleOffline()
    })
  }

  private async checkInitialConnection() {
    // Test with a simple request to detect if we're actually online
    try {
      await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-store' })
      this.isOnline = true
    } catch {
      this.isOnline = false
      this.handleOffline()
    }
  }

  private handleOnline() {
    this.isOnline = true
    this.hasShownOfflineNotice = false

    if (this.reconnectionToastId) {
      toast.dismiss(this.reconnectionToastId)
      this.reconnectionToastId = null
    }

    toast.success('Connection Restored', {
      description: 'You are back online. Data will sync automatically.',
      duration: 3000
    })

  }

  private handleOffline() {
    this.isOnline = false

    if (!this.hasShownOfflineNotice) {
      this.reconnectionToastId = toast.warning('Working Offline', {
        description: 'Network unavailable. Using cached data.',
        duration: Infinity // Keep showing until reconnected
      })
      
      this.hasShownOfflineNotice = true
    }
  }

  public getConnectionStatus(): 'online' | 'offline' | 'limited' {
    if (!this.isOnline) return 'offline'
    return 'online'
  }

  public async testSupabaseConnection(): Promise<boolean> {
    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        return false
      }

      const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })

      return response.ok
    } catch {
      return false
    }
  }

  public notifyNetworkError(operation: string) {
    if (!this.hasShownOfflineNotice) {
      toast.info('Using Cached Data', {
        description: `${operation} - Working with local data while offline`,
        duration: 3000
      })
    }
  }

  public static getInstance(): NetworkStatusManager {
    if (!NetworkStatusManager.instance) {
      NetworkStatusManager.instance = new NetworkStatusManager()
    }
    return NetworkStatusManager.instance
  }

  private static instance: NetworkStatusManager
}

// Create singleton instance
export const networkStatus = NetworkStatusManager.getInstance()

// Export utility functions
export function isOnline(): boolean {
  return networkStatus.getConnectionStatus() === 'online'
}

export function notifyNetworkError(operation: string) {
  networkStatus.notifyNetworkError(operation)
}

export async function testConnection(): Promise<boolean> {
  return networkStatus.testSupabaseConnection()
}

export default NetworkStatusManager
