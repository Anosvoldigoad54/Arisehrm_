import React, { Suspense, lazy, memo, useRef } from 'react'
import { Box, Skeleton, CircularProgress, Typography, Alert } from '@mui/material'
import { useIntersectionObserver } from '../../hooks/usePerformance'
import { motion } from 'framer-motion'

interface LazyLoadWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  errorFallback?: React.ReactNode
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  height?: number | string
  width?: number | string
  className?: string
  placeholder?: 'skeleton' | 'spinner' | 'custom'
  skeletonVariant?: 'text' | 'rectangular' | 'circular'
  skeletonLines?: number
  fadeIn?: boolean
  delay?: number
}

// Default loading components
const SkeletonLoader: React.FC<{
  variant?: 'text' | 'rectangular' | 'circular'
  lines?: number
  height?: number | string
  width?: number | string
}> = ({ variant = 'rectangular', lines = 3, height, width }) => {
  if (variant === 'text') {
    return (
      <Box>
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            variant="text"
            width={index === lines - 1 ? '60%' : '100%'}
            height={24}
            sx={{ mb: 1 }}
          />
        ))}
      </Box>
    )
  }

  return (
    <Skeleton
      variant={variant}
      width={width || '100%'}
      height={height || 200}
      sx={{ borderRadius: 2 }}
    />
  )
}

const SpinnerLoader: React.FC<{
  height?: number | string
  width?: number | string
}> = ({ height = 200, width = '100%' }) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="center"
    height={height}
    width={width}
  >
    <CircularProgress />
  </Box>
)

const ErrorFallback: React.FC<{
  error?: Error
  retry?: () => void
}> = ({ error, retry }) => (
  <Alert
    severity="error"
    action={
      retry && (
        <button onClick={retry}>
          Retry
        </button>
      )
    }
  >
    <Typography variant="body2">
      {error?.message || 'Failed to load component'}
    </Typography>
  </Alert>
)

// Intersection observer based lazy loader
export const LazyLoadWrapper: React.FC<LazyLoadWrapperProps> = memo(({
  children,
  fallback,
  errorFallback,
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true,
  height,
  width,
  className,
  placeholder = 'skeleton',
  skeletonVariant = 'rectangular',
  skeletonLines = 3,
  fadeIn = true,
  delay = 0
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const { isIntersecting, hasIntersected } = useIntersectionObserver(ref, {
    threshold,
    rootMargin
  })

  const shouldLoad = triggerOnce ? hasIntersected : isIntersecting

  // Default fallback based on placeholder type
  const defaultFallback = () => {
    switch (placeholder) {
      case 'spinner':
        return <SpinnerLoader height={height} width={width} />
      case 'skeleton':
        return (
          <SkeletonLoader
            variant={skeletonVariant}
            lines={skeletonLines}
            height={height}
            width={width}
          />
        )
      case 'custom':
        return fallback || <div>Loading...</div>
      default:
        return <SkeletonLoader height={height} width={width} />
    }
  }

  const content = shouldLoad ? (
    <Suspense fallback={fallback || defaultFallback()}>
      {fadeIn ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.3, 
            delay: delay / 1000,
            ease: 'easeOut' 
          }}
        >
          {children}
        </motion.div>
      ) : (
        children
      )}
    </Suspense>
  ) : (
    fallback || defaultFallback()
  )

  return (
    <Box
      ref={ref}
      className={className}
      sx={{
        height,
        width,
        minHeight: height || 'auto'
      }}
    >
      {content}
    </Box>
  )
})

LazyLoadWrapper.displayName = 'LazyLoadWrapper'

// HOC for lazy loading components
export function withLazyLoading<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<LazyLoadWrapperProps, 'children'> = {}
) {
  return memo((props: P) => (
    <LazyLoadWrapper {...options}>
      <Component {...props} />
    </LazyLoadWrapper>
  ))
}

// Lazy image component
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  placeholder?: string
  fallback?: React.ReactNode
  onLoad?: () => void
  onError?: () => void
  threshold?: number
  rootMargin?: string
  fadeIn?: boolean
}

export const LazyImage: React.FC<LazyImageProps> = memo(({
  src,
  alt,
  placeholder,
  fallback,
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '50px',
  fadeIn = true,
  className,
  style,
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)
  
  const { hasIntersected } = useIntersectionObserver(ref, {
    threshold,
    rootMargin
  })

  React.useEffect(() => {
    if (!hasIntersected || !src) return

    const img = new Image()
    img.onload = () => {
      setIsLoaded(true)
      onLoad?.()
    }
    img.onerror = () => {
      setHasError(true)
      onError?.()
    }
    img.src = src
  }, [src, hasIntersected, onLoad, onError])

  const imageContent = () => {
    if (hasError) {
      return fallback || (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgcolor="grey.100"
          color="grey.500"
          height="100%"
          width="100%"
        >
          <Typography variant="body2">Failed to load image</Typography>
        </Box>
      )
    }

    if (!hasIntersected || !isLoaded) {
      return placeholder ? (
        <img
          src={placeholder}
          alt={alt}
          style={{ ...style, filter: 'blur(5px)' }}
          {...props}
        />
      ) : (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          sx={{ borderRadius: 1 }}
        />
      )
    }

    return (
      <motion.img
        ref={imgRef}
        src={src}
        alt={alt}
        className={className}
        style={style}
        initial={fadeIn ? { opacity: 0 } : undefined}
        animate={fadeIn ? { opacity: 1 } : undefined}
        transition={fadeIn ? { duration: 0.3 } : undefined}
        {...props}
      />
    )
  }

  return (
    <Box ref={ref} position="relative" overflow="hidden">
      {imageContent()}
    </Box>
  )
})

LazyImage.displayName = 'LazyImage'

// Lazy section component for large content blocks
interface LazySectionProps {
  children: React.ReactNode
  height?: number | string
  placeholder?: React.ReactNode
  threshold?: number
  rootMargin?: string
  className?: string
  fadeIn?: boolean
  stagger?: boolean
  staggerDelay?: number
}

export const LazySection: React.FC<LazySectionProps> = memo(({
  children,
  height = 'auto',
  placeholder,
  threshold = 0.1,
  rootMargin = '100px',
  className,
  fadeIn = true,
  stagger = false,
  staggerDelay = 100
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const { hasIntersected } = useIntersectionObserver(ref, {
    threshold,
    rootMargin
  })

  const defaultPlaceholder = (
    <Box height={height} display="flex" alignItems="center" justifyContent="center">
      <CircularProgress />
    </Box>
  )

  const content = hasIntersected ? (
    fadeIn ? (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.6, 
          ease: 'easeOut',
          staggerChildren: stagger ? staggerDelay / 1000 : 0
        }}
      >
        {stagger ? (
          React.Children.map(children, (child, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.4, 
                delay: index * (staggerDelay / 1000),
                ease: 'easeOut' 
              }}
            >
              {child}
            </motion.div>
          ))
        ) : (
          children
        )}
      </motion.div>
    ) : (
      children
    )
  ) : (
    placeholder || defaultPlaceholder
  )

  return (
    <Box ref={ref} className={className} minHeight={height}>
      {content}
    </Box>
  )
})

LazySection.displayName = 'LazySection'

export default LazyLoadWrapper
