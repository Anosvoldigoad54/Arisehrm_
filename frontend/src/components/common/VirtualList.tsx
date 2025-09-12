import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { usePerformance } from '../../hooks/usePerformance';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  containerHeight?: number;
  overscan?: number;
  className?: string;
  style?: React.CSSProperties;
  onScroll?: (scrollTop: number) => void;
  loading?: boolean;
  emptyMessage?: string;
  error?: string | null;
  onRetry?: () => void;
}

interface VirtualListState {
  scrollTop: number;
  containerHeight: number;
  itemHeight: number;
  overscan: number;
}

const VirtualList = <T extends any>({
  items,
  itemHeight,
  renderItem,
  containerHeight = 400,
  overscan = 5,
  className,
  style,
  onScroll,
  loading = false,
  emptyMessage = 'No items found',
  error = null,
  onRetry
}: VirtualListProps<T>) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<VirtualListState>({
    scrollTop: 0,
    containerHeight,
    itemHeight,
    overscan
  });
  
  const { fps, isLowPerformance } = usePerformance();

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = Math.floor(state.scrollTop / state.itemHeight);
    const end = Math.min(
      start + Math.ceil(state.containerHeight / state.itemHeight) + state.overscan,
      items.length
    );
    
    return {
      start: Math.max(0, start - state.overscan),
      end
    };
  }, [state.scrollTop, state.containerHeight, state.itemHeight, state.overscan, items.length]);

  // Calculate total height
  const totalHeight = useMemo(() => {
    return items.length * state.itemHeight;
  }, [items.length, state.itemHeight]);

  // Calculate transform offset
  const transformOffset = useMemo(() => {
    return visibleRange.start * state.itemHeight;
  }, [visibleRange.start, state.itemHeight]);

  // Handle scroll events
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    setState(prev => ({ ...prev, scrollTop }));
    onScroll?.(scrollTop);
  }, [onScroll]);

  // Update container height on resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const newHeight = containerRef.current.clientHeight;
        setState(prev => ({ ...prev, containerHeight: newHeight }));
      }
    };

    const resizeObserver = new ResizeObserver(updateHeight);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Performance optimization: reduce re-renders on low FPS
  const shouldOptimize = isLowPerformance || fps < 30;
  const optimizedOverscan = shouldOptimize ? Math.min(overscan, 3) : overscan;

  // Render visible items
  const visibleItems = useMemo(() => {
    const itemsToRender = [];
    for (let i = visibleRange.start; i < visibleRange.end; i++) {
      if (items[i]) {
        itemsToRender.push({
          item: items[i],
          index: i,
          key: i
        });
      }
    }
    return itemsToRender;
  }, [items, visibleRange.start, visibleRange.end]);

  // Loading skeleton items
  const loadingItems = useMemo(() => {
    const count = Math.ceil(containerHeight / itemHeight);
    return Array.from({ length: count }, (_, i) => (
      <ListItem key={`loading-${i}`} sx={{ height: itemHeight }}>
        <ListItemText
          primary={<Skeleton variant="text" width="60%" />}
          secondary={<Skeleton variant="text" width="40%" />}
        />
      </ListItem>
    ));
  }, [containerHeight, itemHeight]);

  // Error state
  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height={containerHeight}
        p={3}
        textAlign="center"
      >
        <Typography variant="h6" color="error" gutterBottom>
          Error loading items
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {error}
        </Typography>
        {onRetry && (
          <motion.button
            onClick={onRetry}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Retry
          </motion.button>
        )}
      </Box>
    );
  }

  // Empty state
  if (!loading && items.length === 0) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height={containerHeight}
        p={3}
        textAlign="center"
      >
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      className={className}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
        ...style
      }}
      onScroll={handleScroll}
    >
      {/* Performance indicator for mobile */}
      {isMobile && shouldOptimize && (
        <Box
          position="absolute"
          top={8}
          right={8}
          zIndex={1}
          bgcolor="warning.main"
          color="white"
          px={1}
          py={0.5}
          borderRadius={1}
          fontSize="0.75rem"
        >
          Optimized
        </Box>
      )}

      {/* Virtual list container */}
      <Box
        style={{
          height: totalHeight,
          position: 'relative'
        }}
      >
        {/* Visible items */}
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${transformOffset}px)`
          }}
        >
          <AnimatePresence>
            {loading ? (
              <List>
                {loadingItems}
              </List>
            ) : (
              visibleItems.map(({ item, index, key }) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    duration: shouldOptimize ? 0.2 : 0.3,
                    delay: shouldOptimize ? 0 : index * 0.02
                  }}
                >
                  {renderItem(item, index)}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </Box>
      </Box>

      {/* Scroll indicator */}
      {items.length > 0 && (
        <Box
          position="absolute"
          bottom={8}
          right={8}
          bgcolor="rgba(0,0,0,0.7)"
          color="white"
          px={1}
          py={0.5}
          borderRadius={1}
          fontSize="0.75rem"
          zIndex={1}
        >
          {Math.round((state.scrollTop / (totalHeight - containerHeight)) * 100)}%
        </Box>
      )}
    </Box>
  );
};

export default VirtualList;
