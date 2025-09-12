import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Skeleton,
  useTheme,
  alpha
} from '@mui/material'
import { BrokenImage } from '@mui/icons-material'

interface SimpleOptimizedImageProps {
  src: string
  alt: string
  width?: number | string
  height?: number | string
  priority?: boolean
  className?: string
  style?: React.CSSProperties
  fallbackSrc?: string
  onLoad?: () => void
  onError?: () => void
}

const SimpleOptimizedImage: React.FC<SimpleOptimizedImageProps> = ({
  src,
  alt,
  width = 'auto',
  height = 'auto',
  priority = false,
  className,
  style,
  fallbackSrc,
  onLoad,
  onError
}) => {
  const theme = useTheme()
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    )

    observerRef.current = observer
    observer.observe(imgRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [priority])

  // Load image immediately if priority is true
  useEffect(() => {
    if (priority) {
      setIsInView(true)
    }
  }, [priority])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  const shouldLoadImage = priority || isInView
  const currentSrc = hasError && fallbackSrc ? fallbackSrc : src

  return (
    <Box
      sx={{
        position: 'relative',
        width,
        height,
        overflow: 'hidden',
        borderRadius: 1,
        backgroundColor: alpha(theme.palette.grey[100], 0.5)
      }}
      className={className}
      style={style}
    >
      {/* Loading Skeleton */}
      {!isLoaded && !hasError && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1
          }}
        />
      )}

      {/* Error State */}
      {hasError && !fallbackSrc && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: theme.palette.text.secondary,
            backgroundColor: alpha(theme.palette.grey[200], 0.5)
          }}
        >
          <BrokenImage sx={{ fontSize: 40, mb: 1 }} />
          <Box sx={{ fontSize: '0.75rem', textAlign: 'center' }}>
            Failed to load image
          </Box>
        </Box>
      )}

      {/* Image */}
      {shouldLoadImage && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
        />
      )}
    </Box>
  )
}

export default SimpleOptimizedImage
