import { 
  useMemo, 
  useCallback, 
  useRef, 
  useEffect, 
  useState,
  startTransition,
  useDeferredValue,
  memo,
  lazy,
  Suspense
} from 'react'
import { debounce, throttle } from 'lodash'

// Performance monitoring hook
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    memoryUsage: 0
  })

  const renderCountRef = useRef(0)
  const renderTimesRef = useRef<number[]>([])
  const startTimeRef = useRef<number>()

  // Start performance measurement
  useEffect(() => {
    startTimeRef.current = performance.now()
    
    return () => {
      if (startTimeRef.current) {
        const renderTime = performance.now() - startTimeRef.current
        renderCountRef.current += 1
        renderTimesRef.current.push(renderTime)
        
        // Keep only last 100 render times
        if (renderTimesRef.current.length > 100) {
          renderTimesRef.current = renderTimesRef.current.slice(-100)
        }

        const averageRenderTime = renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length

        setMetrics({
          renderCount: renderCountRef.current,
          lastRenderTime: renderTime,
          averageRenderTime,
          memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
        })
      }
    }
  })

  return metrics
}

// Debounced value hook
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const debouncedSetValue = useMemo(
    () => debounce((newValue: T) => setDebouncedValue(newValue), delay),
    [delay]
  )

  useEffect(() => {
    debouncedSetValue(value)
    return () => debouncedSetValue.cancel()
  }, [value, debouncedSetValue])

  return debouncedValue
}

// Throttled callback hook
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList
): T {
  return useMemo(
    () => throttle(callback, delay),
    [...deps, delay]
  ) as T
}

// Debounced callback hook
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList
): T {
  return useMemo(
    () => debounce(callback, delay),
    [...deps, delay]
  ) as T
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [elementRef, hasIntersected, options])

  return { isIntersecting, hasIntersected }
}

// Image lazy loading hook
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const { hasIntersected } = useIntersectionObserver(imgRef)

  useEffect(() => {
    if (!hasIntersected || !src) return

    const img = new Image()
    img.onload = () => {
      setImageSrc(src)
      setIsLoading(false)
    }
    img.onerror = () => {
      setHasError(true)
      setIsLoading(false)
    }
    img.src = src
  }, [src, hasIntersected])

  return {
    ref: imgRef,
    src: imageSrc,
    isLoading,
    hasError
  }
}

// Memoized search/filter hook
export function useMemoizedFilter<T>(
  items: T[],
  searchQuery: string,
  filterFn: (item: T, query: string) => boolean,
  deps: React.DependencyList = []
) {
  const deferredQuery = useDeferredValue(searchQuery)
  
  return useMemo(() => {
    if (!deferredQuery.trim()) return items
    return items.filter(item => filterFn(item, deferredQuery))
  }, [items, deferredQuery, filterFn, ...deps])
}

// Optimized sort hook
export function useMemoizedSort<T>(
  items: T[],
  sortKey: keyof T | ((item: T) => any),
  direction: 'asc' | 'desc' = 'asc',
  deps: React.DependencyList = []
) {
  return useMemo(() => {
    const sortedItems = [...items].sort((a, b) => {
      const aValue = typeof sortKey === 'function' ? sortKey(a) : a[sortKey]
      const bValue = typeof sortKey === 'function' ? sortKey(b) : b[sortKey]

      if (aValue < bValue) return direction === 'asc' ? -1 : 1
      if (aValue > bValue) return direction === 'asc' ? 1 : -1
      return 0
    })

    return sortedItems
  }, [items, sortKey, direction, ...deps])
}

// Pagination hook
export function usePagination<T>(
  items: T[],
  itemsPerPage: number = 10
) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(items.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  const paginatedItems = useMemo(() => {
    return items.slice(startIndex, endIndex)
  }, [items, startIndex, endIndex])

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }, [totalPages])

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1)
  }, [currentPage, goToPage])

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1)
  }, [currentPage, goToPage])

  // Reset to first page when items change
  useEffect(() => {
    setCurrentPage(1)
  }, [items.length])

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    startIndex,
    endIndex: Math.min(endIndex, items.length),
    totalItems: items.length
  }
}

// Optimized table data hook
export function useTableData<T>(
  data: T[],
  searchQuery: string = '',
  sortConfig: { key: keyof T | ((item: T) => any); direction: 'asc' | 'desc' } | null = null,
  filterFn?: (item: T, query: string) => boolean,
  itemsPerPage: number = 50
) {
  // Filter data
  const filteredData = useMemoizedFilter(
    data,
    searchQuery,
    filterFn || ((item: T, query: string) => 
      Object.values(item as any).some(value => 
        String(value).toLowerCase().includes(query.toLowerCase())
      )
    )
  )

  // Sort data
  const sortedData = useMemoizedSort(
    filteredData,
    sortConfig?.key || ((item: T) => item),
    sortConfig?.direction || 'asc'
  )

  // Paginate data
  const pagination = usePagination(sortedData, itemsPerPage)

  return {
    ...pagination,
    filteredCount: filteredData.length,
    sortedData,
    filteredData
  }
}

// Component lazy loading utilities
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  const LazyComponent = lazy(importFn)
  
  return memo((props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback ? React.createElement(fallback) : <div>Loading...</div>}>
      <LazyComponent {...props} />
    </Suspense>
  ))
}

// Bundle splitting helper
export const withBundleSplitting = <P extends object>(
  Component: React.ComponentType<P>,
  chunkName?: string
) => {
  return memo((props: P) => (
    <Suspense fallback={<div>Loading component...</div>}>
      <Component {...props} />
    </Suspense>
  ))
}

// Performance-optimized list component factory
export function createOptimizedList<T>({
  itemHeight,
  renderItem,
  getItemKey,
  estimatedSize = 50
}: {
  itemHeight?: number
  renderItem: (item: T, index: number) => React.ReactNode
  getItemKey: (item: T, index: number) => string | number
  estimatedSize?: number
}) {
  return memo(function OptimizedList({
    items,
    height = 400,
    overscan = 5,
    ...props
  }: {
    items: T[]
    height?: number
    overscan?: number
    [key: string]: any
  }) {
    // Use virtualization if itemHeight is provided
    if (itemHeight) {
      // Implementation would use our virtualization hook
      return (
        <div style={{ height, overflow: 'auto' }} {...props}>
          {items.map((item, index) => (
            <div key={getItemKey(item, index)} style={{ height: itemHeight }}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      )
    }

    // Fallback to regular rendering for dynamic heights
    return (
      <div style={{ height, overflow: 'auto' }} {...props}>
        {items.map((item, index) => (
          <div key={getItemKey(item, index)}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    )
  })
}

// Memory management hook
export function useMemoryManagement() {
  const [memoryInfo, setMemoryInfo] = useState<{
    used: number
    total: number
    percentage: number
  }>({ used: 0, total: 0, percentage: 0 })

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMemoryInfo({
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
        })
      }
    }

    updateMemoryInfo()
    const interval = setInterval(updateMemoryInfo, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return memoryInfo
}

// Optimized state update hook
export function useOptimizedState<T>(
  initialState: T,
  shouldUpdate?: (prevState: T, nextState: T) => boolean
) {
  const [state, setState] = useState<T>(initialState)

  const optimizedSetState = useCallback((newState: T | ((prevState: T) => T)) => {
    setState(prevState => {
      const nextState = typeof newState === 'function' 
        ? (newState as (prevState: T) => T)(prevState)
        : newState

      // Use custom comparison if provided
      if (shouldUpdate && !shouldUpdate(prevState, nextState)) {
        return prevState
      }

      // Default shallow comparison for objects
      if (typeof prevState === 'object' && typeof nextState === 'object') {
        if (JSON.stringify(prevState) === JSON.stringify(nextState)) {
          return prevState
        }
      }

      return nextState
    })
  }, [shouldUpdate])

  return [state, optimizedSetState] as const
}

export default {
  usePerformanceMonitor,
  useDebouncedValue,
  useThrottledCallback,
  useDebouncedCallback,
  useIntersectionObserver,
  useLazyImage,
  useMemoizedFilter,
  useMemoizedSort,
  usePagination,
  useTableData,
  createLazyComponent,
  withBundleSplitting,
  createOptimizedList,
  useMemoryManagement,
  useOptimizedState
}
