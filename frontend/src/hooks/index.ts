// Consolidated hooks exports for Arise HRM System
// Custom hooks for enhanced functionality and reusability

// ===========================================
// CORE HOOKS
// ===========================================
export { useResponsive } from './useResponsive'
export { useNavigation } from './useNavigation'
export { usePermissions } from './usePermissions'
export { useBootstrap } from './useBootstrap'

// ===========================================
// ADDITIONAL UTILITY HOOKS
// ===========================================

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useTheme, useMediaQuery } from '@mui/material'
import { log } from '@/services/loggingService'

// Enhanced localStorage hook with SSR safety
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      log.warn('Failed to parse localStorage value', error as Error, { key });
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      log.error('Failed to set localStorage value', error as Error, { key, value: valueToStore });
    }
  }, [key, storedValue])

  return [storedValue, setValue] as const
}

// Session storage hook
export const useSessionStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      log.warn('Failed to parse sessionStorage value', error as Error, { key });
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      log.error('Failed to set sessionStorage value', error as Error, { key, value: valueToStore });
    }
  }, [key, storedValue])

  return [storedValue, setValue] as const
}

// Debounced value hook
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Previous value hook
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

// Window size hook
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}

// Online status hook
export const useOnline = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

// Advanced breakpoints hook
export const useAdvancedBreakpoints = () => {
  const theme = useTheme()
  
  return {
    // Specific breakpoints
    isXs: useMediaQuery(theme.breakpoints.only('xs')),
    isSm: useMediaQuery(theme.breakpoints.only('sm')),
    isMd: useMediaQuery(theme.breakpoints.only('md')),
    isLg: useMediaQuery(theme.breakpoints.only('lg')),
    isXl: useMediaQuery(theme.breakpoints.only('xl')),
    
    // Range breakpoints
    isSmDown: useMediaQuery(theme.breakpoints.down('sm')),
    isMdDown: useMediaQuery(theme.breakpoints.down('md')),
    isLgDown: useMediaQuery(theme.breakpoints.down('lg')),
    isSmUp: useMediaQuery(theme.breakpoints.up('sm')),
    isMdUp: useMediaQuery(theme.breakpoints.up('md')),
    isLgUp: useMediaQuery(theme.breakpoints.up('lg')),
    
    // Device type detection
    isMobile: useMediaQuery(theme.breakpoints.down('md')),
    isTablet: useMediaQuery(theme.breakpoints.between('md', 'lg')),
    isDesktop: useMediaQuery(theme.breakpoints.up('lg')),
    
    // Orientation
    isPortrait: useMediaQuery('(orientation: portrait)'),
    isLandscape: useMediaQuery('(orientation: landscape)'),
    
    // Interaction capabilities
    isTouchDevice: useMediaQuery('(pointer: coarse)'),
    canHover: useMediaQuery('(hover: hover)'),
    
    // Accessibility preferences
    prefersReducedMotion: useMediaQuery('(prefers-reduced-motion: reduce)'),
    prefersColorScheme: {
      dark: useMediaQuery('(prefers-color-scheme: dark)'),
      light: useMediaQuery('(prefers-color-scheme: light)'),
    }
  }
}

// Async data fetching hook
export const useAsync = <T, E = string>(
  asyncFunction: () => Promise<T>,
  immediate = true
) => {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<E | null>(null)

  const execute = useCallback(async () => {
    setStatus('pending')
    setData(null)
    setError(null)

    try {
      const response = await asyncFunction()
      setData(response)
      setStatus('success')
      return response
    } catch (error) {
      setError(error as E)
      setStatus('error')
      throw error
    }
  }, [asyncFunction])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return useMemo(
    () => ({
      execute,
      status,
      data,
      error,
      isIdle: status === 'idle',
      isPending: status === 'pending',
      isSuccess: status === 'success',
      isError: status === 'error',
    }),
    [execute, status, data, error]
  )
}

// Intersection Observer hook
export const useIntersectionObserver = (
  elementRef: React.RefObject<Element>,
  {
    threshold = 0,
    root = null,
    rootMargin = '0%',
    freezeOnceVisible = false,
  } = {}
) => {
  const [entry, setEntry] = useState<IntersectionObserverEntry>()

  const frozen = entry?.isIntersecting && freezeOnceVisible

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry)
  }

  useEffect(() => {
    const node = elementRef?.current
    const hasIOSupport = !!window.IntersectionObserver

    if (!hasIOSupport || frozen || !node) return

    const observerParams = { threshold, root, rootMargin }
    const observer = new IntersectionObserver(updateEntry, observerParams)

    observer.observe(node)

    return () => observer.disconnect()
  }, [elementRef, threshold, root, rootMargin, frozen])

  return entry
}

// Form validation hook with proper typing
type ValidationRule<T> = (value: T) => string | null;
type ValidationRules<T extends Record<string, any>> = {
  [K in keyof T]: ValidationRule<T[K]>;
};

export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules<T>
) => {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})

  const setValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [field]: value }))
    
    // Validate field if it has been touched
    if (touched[field]) {
      const error = validationRules[field]?.(value)
      setErrors(prev => ({ ...prev, [field]: error }))
    }
  }, [validationRules, touched])

  const setFieldTouched = useCallback((field: keyof T, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }))
    
    if (isTouched) {
      const error = validationRules[field]?.(values[field])
      setErrors(prev => ({ ...prev, [field]: error }))
    }
  }, [validationRules, values])

  const validateAll = useCallback(() => {
    const newErrors: Partial<Record<keyof T, string>> = {}
    let isValid = true

    Object.keys(validationRules).forEach((field) => {
      const error = validationRules[field as keyof T]?.(values[field as keyof T])
      if (error) {
        newErrors[field as keyof T] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    setTouched(Object.keys(validationRules).reduce((acc, field) => {
      acc[field as keyof T] = true
      return acc
    }, {} as Partial<Record<keyof T, boolean>>))

    return isValid
  }, [validationRules, values])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateAll,
    reset,
    isValid: Object.keys(errors).every(key => !errors[key as keyof T])
  }
}

// Copy to clipboard hook
export const useClipboard = () => {
  const [hasCopied, setHasCopied] = useState(false)

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setHasCopied(true)
      setTimeout(() => setHasCopied(false), 2000)
    } catch (error) {
      log.error('Failed to copy to clipboard', error as Error, { text });
    }
  }, [])

  return { copyToClipboard, hasCopied }
}
