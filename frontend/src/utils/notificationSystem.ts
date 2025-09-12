import { toast } from 'sonner'

// Enhanced notification system that integrates with Sonner toast
export class NotificationSystem {
  static show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', options?: {
    description?: string
    duration?: number
    action?: { label: string; onClick: () => void }
  }) {
    const toastOptions = {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick
      } : undefined
    }

    switch (type) {
      case 'success':
        toast.success(message, toastOptions)
        break
      case 'error':
        toast.error(message, toastOptions)
        break
      case 'warning':
        toast.warning(message, toastOptions)
        break
      case 'info':
      default:
        toast.info(message, toastOptions)
        break
    }
  }

  static success(message: string, description?: string) {
    this.show(message, 'success', { description })
  }

  static error(message: string, description?: string) {
    this.show(message, 'error', { description })
  }

  static warning(message: string, description?: string) {
    this.show(message, 'warning', { description })
  }

  static info(message: string, description?: string) {
    this.show(message, 'info', { description })
  }

  static promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ): Promise<T> {
    return toast.promise(promise, messages)
  }
}

// Global notification system for backward compatibility
if (typeof window !== 'undefined') {
  (window as any).showNotification = (
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    description?: string
  ) => {
    NotificationSystem.show(message, type, { description })
  }
}

export default NotificationSystem
