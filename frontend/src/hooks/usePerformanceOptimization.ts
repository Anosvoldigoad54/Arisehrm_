import { useCallback, useMemo, useRef, useEffect, useState } from 'react'
import { debounce, throttle, measureExecutionTime } from '../utils/simplePerformanceUtils'

interface UsePerformanceOptimizationOptions {
  debounceDelay?: number
  throttleDelay?: number
  enableMemoization?: boolean
  enableLazyLoading?: boolean
  performanceThreshold?: number
}

export function usePerformanceOptimization<T>(
  options: UsePerformanceOptimizationOptions = {}
) {
  const {
    debounceDelay = 300,
    throttleDelay = 100,
    enableMemoization = true,
    enableLazyLoading = true,
    performanceThreshold = 16 // 60fps target
  } = options

  const performanceHistory = useRef<number[]>([])
  const [isPerformanceDegraded, setIsPerformanceDegraded] = useState(false)

  // Performance monitoring
  const trackPerformance = useCallback((operation: string, startTime: number) => {
    const endTime = performance.now()
    const duration = endTime - startTime
    
    performanceHistory.current.push(duration)
    
    // Keep only last 100 measurements
    if (performanceHistory.current.length > 100) {
      performanceHistory.current.shift()
    }
    
    // Check if performance is degraded
    const averageDuration = performanceHistory.current.reduce((a, b) => a + b, 0) / performanceHistory.current.length
    setIsPerformanceDegraded(averageDuration > performanceThreshold)
    
    if (duration > performanceThreshold) {
    }
    
    return duration
  }, [performanceThreshold])

  // Debounced function wrapper
  const createDebouncedFunction = useCallback(<T extends (...args: any[]) => any>(
    fn: T,
    delay?: number
  ) => {
    return debounce(fn, delay || debounceDelay)
  }, [debounceDelay])

  // Throttled function wrapper
  const createThrottledFunction = useCallback(<T extends (...args: any[]) => any>(
    fn: T,
    delay?: number
  ) => {
    return throttle(fn, delay || throttleDelay)
  }, [throttleDelay])

  // Memoized value with performance tracking
  const createMemoizedValue = useCallback(<T>(
    factory: () => T,
    deps: any[],
    key: string
  ): T => {
    if (!enableMemoization) {
      return factory()
    }

    return useMemo(() => {
      const startTime = performance.now()
      const result = factory()
      trackPerformance(`Memoization: ${key}`, startTime)
      return result
    }, deps)
  }, [enableMemoization, trackPerformance])

  // Lazy loading hook
  const useLazyLoad = useCallback(<T>(
    loader: () => Promise<T>,
    deps: any[] = []
  ) => {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const loadedRef = useRef(false)

    const load = useCallback(async () => {
      if (loadedRef.current || !enableLazyLoading) return
      
      const startTime = performance.now()
      setLoading(true)
      setError(null)
      
      try {
        const result = await loader()
        setData(result)
        loadedRef.current = true
        trackPerformance(`Lazy load`, startTime)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }, [loader, enableLazyLoading, trackPerformance])

    useEffect(() => {
      load()
    }, [load, ...deps])

    return { data, loading, error, reload: load }
  }, [enableLazyLoading, trackPerformance])

  // Intersection Observer hook for lazy loading
  const useIntersectionObserver = useCallback((
    options: IntersectionObserverInit = {}
  ) => {
    const [isIntersecting, setIsIntersecting] = useState(false)
    const [hasIntersected, setHasIntersected] = useState(false)
    const elementRef = useRef<HTMLElement | null>(null)

    useEffect(() => {
      const element = elementRef.current
      if (!element || !enableLazyLoading) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          const intersecting = entry.isIntersecting
          setIsIntersecting(intersecting)
          if (intersecting && !hasIntersected) {
            setHasIntersected(true)
          }
        },
        {
          rootMargin: '50px',
          threshold: 0.1,
          ...options
        }
      )

      observer.observe(element)
      return () => observer.disconnect()
    }, [options, hasIntersected, enableLazyLoading])

    return { elementRef, isIntersecting, hasIntersected }
  }, [enableLazyLoading])

  // Batch updates hook
  const useBatchUpdates = useCallback(() => {
    const updateQueue = useRef<(() => void)[]>([])
    const isProcessing = useRef(false)

    const batchUpdate = useCallback((update: () => void) => {
      updateQueue.current.push(update)
      
      if (!isProcessing.current) {
        isProcessing.current = true
        
        requestAnimationFrame(() => {
          const startTime = performance.now()
          
          // Process all queued updates
          while (updateQueue.current.length > 0) {
            const update = updateQueue.current.shift()
            if (update) update()
          }
          
          isProcessing.current = false
          trackPerformance('Batch updates', startTime)
        })
      }
    }, [trackPerformance])

    return { batchUpdate }
  }, [trackPerformance])

  // Resource preloading hook
  const useResourcePreloader = useCallback(() => {
    const preloadedResources = useRef<Set<string>>(new Set())

    const preloadResource = useCallback((url: string, type: 'script' | 'style' | 'image' | 'font') => {
      if (preloadedResources.current.has(url)) return

      const startTime = performance.now()
      
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = url

      switch (type) {
        case 'script':
          link.as = 'script'
          break
        case 'style':
          link.as = 'style'
          break
        case 'image':
          link.as = 'image'
          break
        case 'font':
          link.as = 'font'
          link.crossOrigin = 'anonymous'
          break
      }

      link.onload = () => {
        preloadedResources.current.add(url)
        trackPerformance(`Resource preload: ${type}`, startTime)
      }

      document.head.appendChild(link)
    }, [trackPerformance])

    return { preloadResource, isPreloaded: (url: string) => preloadedResources.current.has(url) }
  }, [trackPerformance])

  // Performance metrics
  const getPerformanceMetrics = useCallback(() => {
    const recent = performanceHistory.current.slice(-10)
    const average = recent.length > 0 ? recent.reduce((a, b) => a + b, 0) / recent.length : 0
    const max = Math.max(...recent, 0)
    const min = Math.min(...recent, 0)

    return {
      average,
      max,
      min,
      count: performanceHistory.current.length,
      isDegraded: isPerformanceDegraded,
      recommendations: getRecommendations(average)
    }
  }, [isPerformanceDegraded])

  const getRecommendations = useCallback((averageDuration: number) => {
    const recommendations: string[] = []
    
    if (averageDuration > performanceThreshold * 2) {
      recommendations.push('Consider reducing component complexity or implementing virtualization')
    }
    if (averageDuration > performanceThreshold * 1.5) {
      recommendations.push('Enable memoization for expensive calculations')
    }
    if (averageDuration > performanceThreshold) {
      recommendations.push('Consider debouncing or throttling frequent operations')
    }
    
    return recommendations
  }, [performanceThreshold])

  return {
    // Core utilities
    createDebouncedFunction,
    createThrottledFunction,
    createMemoizedValue,
    
    // Hooks
    useLazyLoad,
    useIntersectionObserver,
    useBatchUpdates,
    useResourcePreloader,
    
    // Performance monitoring
    trackPerformance,
    getPerformanceMetrics,
    isPerformanceDegraded,
    
    // Configuration
    setOptions: (newOptions: Partial<UsePerformanceOptimizationOptions>) => {
      Object.assign(options, newOptions)
    }
  }
}

export default usePerformanceOptimization
