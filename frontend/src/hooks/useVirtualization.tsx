import { useState, useEffect, useMemo, useCallback, useRef } from 'react'

interface VirtualizationOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number
  scrollThreshold?: number
}

interface VirtualItem {
  index: number
  start: number
  end: number
  size: number
}

export function useVirtualization<T>(
  items: T[],
  options: VirtualizationOptions
) {
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    scrollThreshold = 100
  } = options

  const [scrollTop, setScrollTop] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )

    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length])

  // Generate virtual items
  const virtualItems = useMemo(() => {
    const virtualItems: VirtualItem[] = []
    
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      virtualItems.push({
        index: i,
        start: i * itemHeight,
        end: (i + 1) * itemHeight,
        size: itemHeight
      })
    }

    return virtualItems
  }, [visibleRange, itemHeight])

  // Get visible items
  const visibleItems = useMemo(() => {
    return virtualItems.map(virtualItem => ({
      item: items[virtualItem.index],
      index: virtualItem.index,
      style: {
        position: 'absolute' as const,
        top: virtualItem.start,
        left: 0,
        right: 0,
        height: virtualItem.size,
      }
    }))
  }, [virtualItems, items])

  // Total height for scrollbar
  const totalHeight = items.length * itemHeight

  // Scroll handler with debouncing
  const handleScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
    const newScrollTop = event.currentTarget.scrollTop
    setScrollTop(newScrollTop)
    setIsScrolling(true)

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    // Set new timeout
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false)
    }, 150)
  }, [])

  // Scroll to index
  const scrollToIndex = useCallback((index: number, align: 'start' | 'center' | 'end' = 'start') => {
    let scrollTop = index * itemHeight

    if (align === 'center') {
      scrollTop = scrollTop - containerHeight / 2 + itemHeight / 2
    } else if (align === 'end') {
      scrollTop = scrollTop - containerHeight + itemHeight
    }

    scrollTop = Math.max(0, Math.min(scrollTop, totalHeight - containerHeight))
    setScrollTop(scrollTop)

    return scrollTop
  }, [itemHeight, containerHeight, totalHeight])

  // Cleanup
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  return {
    visibleItems,
    totalHeight,
    scrollTop,
    isScrolling,
    visibleRange,
    handleScroll,
    scrollToIndex,
    containerProps: {
      style: {
        height: containerHeight,
        overflow: 'auto',
        position: 'relative' as const,
      },
      onScroll: handleScroll,
    },
    innerProps: {
      style: {
        height: totalHeight,
        position: 'relative' as const,
      }
    }
  }
}

// Hook for window virtualization (for very large lists)
export function useWindowVirtualization<T>(
  items: T[],
  itemHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0)
  const [windowHeight, setWindowHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 800
  )

  // Update window height on resize
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      setWindowHeight(window.innerHeight)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Use regular virtualization with window height
  return useVirtualization(items, {
    itemHeight,
    containerHeight: windowHeight,
    overscan
  })
}

// Hook for dynamic height virtualization
export function useDynamicVirtualization<T>(
  items: T[],
  estimatedItemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [itemHeights, setItemHeights] = useState<Map<number, number>>(new Map())
  const [scrollTop, setScrollTop] = useState(0)

  // Calculate item positions based on actual heights
  const itemPositions = useMemo(() => {
    const positions: { start: number; end: number }[] = []
    let currentPosition = 0

    for (let i = 0; i < items.length; i++) {
      const height = itemHeights.get(i) || estimatedItemHeight
      positions.push({
        start: currentPosition,
        end: currentPosition + height
      })
      currentPosition += height
    }

    return positions
  }, [items.length, itemHeights, estimatedItemHeight])

  // Find visible range
  const visibleRange = useMemo(() => {
    let startIndex = 0
    let endIndex = items.length - 1

    // Find start index
    for (let i = 0; i < itemPositions.length; i++) {
      if (itemPositions[i].end > scrollTop) {
        startIndex = Math.max(0, i - overscan)
        break
      }
    }

    // Find end index
    for (let i = startIndex; i < itemPositions.length; i++) {
      if (itemPositions[i].start > scrollTop + containerHeight) {
        endIndex = Math.min(items.length - 1, i + overscan)
        break
      }
    }

    return { startIndex, endIndex }
  }, [scrollTop, containerHeight, itemPositions, overscan, items.length])

  // Generate visible items
  const visibleItems = useMemo(() => {
    const result = []
    
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      const position = itemPositions[i]
      if (position) {
        result.push({
          item: items[i],
          index: i,
          style: {
            position: 'absolute' as const,
            top: position.start,
            left: 0,
            right: 0,
            height: position.end - position.start,
          }
        })
      }
    }

    return result
  }, [visibleRange, itemPositions, items])

  // Update item height
  const setItemHeight = useCallback((index: number, height: number) => {
    setItemHeights(prev => {
      const newHeights = new Map(prev)
      newHeights.set(index, height)
      return newHeights
    })
  }, [])

  // Total height
  const totalHeight = itemPositions.length > 0 
    ? itemPositions[itemPositions.length - 1].end 
    : 0

  // Scroll handler
  const handleScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    totalHeight,
    scrollTop,
    visibleRange,
    setItemHeight,
    handleScroll,
    containerProps: {
      style: {
        height: containerHeight,
        overflow: 'auto',
        position: 'relative' as const,
      },
      onScroll: handleScroll,
    },
    innerProps: {
      style: {
        height: totalHeight,
        position: 'relative' as const,
      }
    }
  }
}

export default useVirtualization
