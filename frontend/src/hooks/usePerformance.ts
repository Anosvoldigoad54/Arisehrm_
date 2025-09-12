import { useEffect, useRef, useCallback, useState } from 'react'
import { useTheme } from '@mui/material'

// Performance monitoring hook
export const usePerformance = () => {
  const [isLowPerformance, setIsLowPerformance] = useState(false)
  const [fps, setFps] = useState(60)
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())
  const animationFrameId = useRef<number>()

  // Measure FPS
  const measureFPS = useCallback(() => {
    frameCount.current++
    const currentTime = performance.now()
    
    if (currentTime - lastTime.current >= 1000) {
      const currentFPS = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current))
      setFps(currentFPS)
      
      // Detect low performance
      if (currentFPS < 30) {
        setIsLowPerformance(true)
      } else if (currentFPS > 45) {
        setIsLowPerformance(false)
      }
      
      frameCount.current = 0
      lastTime.current = currentTime
    }
    
    animationFrameId.current = requestAnimationFrame(measureFPS)
  }, [])

  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(measureFPS)
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [measureFPS])

  return { isLowPerformance, fps }
}

// Debounce hook for performance optimization
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

// Throttle hook for performance optimization
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastCall = useRef(0)
  const lastCallTimer = useRef<NodeJS.Timeout>()

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()

      if (now - lastCall.current >= delay) {
        lastCall.current = now
        callback(...args)
      } else {
        if (lastCallTimer.current) {
          clearTimeout(lastCallTimer.current)
        }

        lastCallTimer.current = setTimeout(() => {
          lastCall.current = Date.now()
          callback(...args)
        }, delay - (now - lastCall.current))
      }
    },
    [callback, delay]
  ) as T
}

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true)
      }
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    })

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [options, hasIntersected])

  return { elementRef, isIntersecting, hasIntersected }
}

// Memory usage monitoring hook
export const useMemoryUsage = () => {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  } | null>(null)

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        })
      }
    }

    updateMemoryInfo()
    const interval = setInterval(updateMemoryInfo, 5000)

    return () => clearInterval(interval)
  }, [])

  return memoryInfo
}

// Network status hook
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [connectionType, setConnectionType] = useState<string>('unknown')

  useEffect(() => {
    const updateNetworkStatus = () => {
      setIsOnline(navigator.onLine)
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        setConnectionType(connection?.effectiveType || 'unknown')
      }
    }

    window.addEventListener('online', updateNetworkStatus)
    window.addEventListener('offline', updateNetworkStatus)
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection?.addEventListener('change', updateNetworkStatus)
    }

    updateNetworkStatus()

    return () => {
      window.removeEventListener('online', updateNetworkStatus)
      window.removeEventListener('offline', updateNetworkStatus)
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        connection?.removeEventListener('change', updateNetworkStatus)
      }
    }
  }, [])

  return { isOnline, connectionType }
}

// Image optimization hook
export const useImageOptimization = () => {
  const [imageLoadTimes, setImageLoadTimes] = useState<Map<string, number>>(new Map())

  const optimizeImage = useCallback((src: string, quality: number = 0.8): string => {
    // Add quality parameter for image optimization
    if (src.includes('?')) {
      return `${src}&q=${quality}`
    }
    return `${src}?q=${quality}`
  }, [])

  const trackImageLoad = useCallback((src: string) => {
    const startTime = performance.now()
    
    return () => {
      const loadTime = performance.now() - startTime
      setImageLoadTimes(prev => new Map(prev).set(src, loadTime))
    }
  }, [])

  return { optimizeImage, trackImageLoad, imageLoadTimes }
}

// Animation performance hook
export const useAnimationPerformance = () => {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false)
  const theme = useTheme()

  useEffect(() => {
    // Check user's motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setShouldReduceMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setShouldReduceMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const getAnimationDuration = useCallback((baseDuration: number) => {
    if (shouldReduceMotion) {
      return baseDuration * 0.5
    }
    return baseDuration
  }, [shouldReduceMotion])

  const getAnimationProps = useCallback((baseProps: any) => {
    if (shouldReduceMotion) {
      return {
        ...baseProps,
        transition: { duration: 0.1 },
        whileHover: {},
        whileTap: {},
        animate: baseProps.initial
      }
    }
    return baseProps
  }, [shouldReduceMotion])

  return {
    shouldReduceMotion,
    getAnimationDuration,
    getAnimationProps
  }
}

// Bundle size optimization hook
export const useBundleOptimization = () => {
  const [loadedModules, setLoadedModules] = useState<Set<string>>(new Set())

  const trackModuleLoad = useCallback((moduleName: string) => {
    setLoadedModules(prev => new Set(prev).add(moduleName))
  }, [])

  const isModuleLoaded = useCallback((moduleName: string) => {
    return loadedModules.has(moduleName)
  }, [loadedModules])

  return { trackModuleLoad, isModuleLoaded, loadedModules }
}

// Performance metrics hook
export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState({
    fcp: 0, // First Contentful Paint
    lcp: 0, // Largest Contentful Paint
    fid: 0, // First Input Delay
    cls: 0, // Cumulative Layout Shift
    ttfb: 0 // Time to First Byte
  })

  useEffect(() => {
    // Measure First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
      if (fcpEntry) {
        setMetrics(prev => ({ ...prev, fcp: fcpEntry.startTime }))
      }
    })

    // Measure Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lcpEntry = entries[entries.length - 1]
      if (lcpEntry) {
        setMetrics(prev => ({ ...prev, lcp: lcpEntry.startTime }))
      }
    })

    // Measure First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const fidEntry = entries[0]
      if (fidEntry) {
        setMetrics(prev => ({ ...prev, fid: fidEntry.processingStart - fidEntry.startTime }))
      }
    })

    // Measure Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += (entry as any).value
        }
      }
      setMetrics(prev => ({ ...prev, cls: clsValue }))
    })

    try {
      fcpObserver.observe({ entryTypes: ['paint'] })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      fidObserver.observe({ entryTypes: ['first-input'] })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    } catch (error) {
    }

    return () => {
      fcpObserver.disconnect()
      lcpObserver.disconnect()
      fidObserver.disconnect()
      clsObserver.disconnect()
    }
  }, [])

  return metrics
}
