import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Box,
  Skeleton,
  useTheme,
  alpha
} from '@mui/material'

interface SimpleVirtualListProps<T> {
  items: T[]
  height: number
  itemHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  loading?: boolean
  emptyMessage?: string
  errorMessage?: string
  hasError?: boolean
  onLoadMore?: () => void
  threshold?: number
}

const SimpleVirtualList = <T,>({
  items,
  height,
  itemHeight,
  renderItem,
  loading = false,
  emptyMessage = 'No items found',
  errorMessage = 'Error loading items',
  hasError = false,
  onLoadMore,
  threshold = 5
}: SimpleVirtualListProps<T>) => {
  const theme = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(height)

  // Calculate visible range
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + threshold,
    items.length
  )

  // Get visible items
  const visibleItems = items.slice(startIndex, endIndex)

  // Calculate total height for scrollbar
  const totalHeight = items.length * itemHeight

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop
    setScrollTop(scrollTop)

    // Check if we need to load more items
    if (onLoadMore && !loading) {
      const scrollBottom = scrollTop + containerHeight
      const thresholdPosition = totalHeight - (threshold * itemHeight)
      
      if (scrollBottom >= thresholdPosition) {
        onLoadMore()
      }
    }
  }, [onLoadMore, loading, containerHeight, totalHeight, threshold, itemHeight])

  // Update container height on resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight)
      }
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  // Render loading skeletons
  const renderLoadingSkeletons = () => {
    const skeletonCount = Math.ceil(containerHeight / itemHeight)
    return Array.from({ length: skeletonCount }, (_, index) => (
      <Box
        key={`skeleton-${index}`}
        sx={{
          height: itemHeight,
          padding: 1,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Skeleton variant="rectangular" height="100%" animation="wave" />
      </Box>
    ))
  }

  // Render empty state
  const renderEmptyState = () => (
    <Box
      sx={{
        height: containerHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.text.secondary,
        textAlign: 'center',
        padding: 2
      }}
    >
      {emptyMessage}
    </Box>
  )

  // Render error state
  const renderErrorState = () => (
    <Box
      sx={{
        height: containerHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.error.main,
        textAlign: 'center',
        padding: 2
      }}
    >
      {errorMessage}
    </Box>
  )

  // Render items
  const renderItems = () => {
    return visibleItems.map((item, index) => (
      <Box
        key={`${startIndex + index}`}
        sx={{
          position: 'absolute',
          top: (startIndex + index) * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight
        }}
      >
        {renderItem(item, startIndex + index)}
      </Box>
    ))
  }

  if (hasError) {
    return renderErrorState()
  }

  if (items.length === 0 && !loading) {
    return renderEmptyState()
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        height,
        overflow: 'auto',
        position: 'relative',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 1,
        backgroundColor: theme.palette.background.paper
      }}
      onScroll={handleScroll}
    >
      {/* Loading state */}
      {loading && renderLoadingSkeletons()}

      {/* Virtual items */}
      {!loading && (
        <Box sx={{ height: totalHeight, position: 'relative' }}>
          {renderItems()}
        </Box>
      )}
    </Box>
  )
}

export default SimpleVirtualList
