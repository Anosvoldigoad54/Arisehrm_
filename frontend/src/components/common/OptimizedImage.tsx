import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Skeleton,
  Fade,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useIntersectionObserver } from '../../hooks/usePerformance';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  quality?: number;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  sizes?: string;
  aspectRatio?: number;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  quality = 75,
  placeholder,
  className,
  style,
  onLoad,
  onError,
  priority = false,
  sizes = '100vw',
  aspectRatio
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  
  const imageRef = useRef<HTMLImageElement>(null);
  const { elementRef, isIntersecting, hasIntersected } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  });

  // Generate responsive image sizes
  const getResponsiveSrc = (baseSrc: string, targetWidth: number) => {
    if (baseSrc.includes('?')) {
      return `${baseSrc}&w=${targetWidth}&q=${quality}`;
    }
    return `${baseSrc}?w=${targetWidth}&q=${quality}`;
  };

  // Generate srcset for responsive images
  const generateSrcSet = () => {
    const baseSrc = src;
    const breakpoints = [
      { width: 320, suffix: 'xs' },
      { width: 768, suffix: 'sm' },
      { width: 1024, suffix: 'md' },
      { width: 1440, suffix: 'lg' },
      { width: 1920, suffix: 'xl' }
    ];

    return breakpoints
      .map(bp => `${getResponsiveSrc(baseSrc, bp.width)} ${bp.width}w`)
      .join(', ');
  };

  // Load image when it comes into view
  useEffect(() => {
    if ((isIntersecting || priority) && !imageSrc && !hasError) {
      const img = new Image();
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
        onLoad?.();
      };
      
      img.onerror = () => {
        setHasError(true);
        onError?.();
      };
      
      img.src = src;
    }
  }, [isIntersecting, priority, src, imageSrc, hasError, onLoad, onError]);

  // Handle image load
  const handleImageLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error
  const handleImageError = () => {
    setHasError(true);
    onError?.();
  };

  // Calculate responsive dimensions
  const getResponsiveDimensions = () => {
    if (isMobile) {
      return {
        width: '100%',
        height: aspectRatio ? `calc(100vw / ${aspectRatio})` : 'auto'
      };
    }
    
    if (isTablet) {
      return {
        width: width || '100%',
        height: height || (aspectRatio && width ? `calc(${width} / ${aspectRatio})` : 'auto')
      };
    }
    
    return {
      width: width || 'auto',
      height: height || (aspectRatio && width ? `calc(${width} / ${aspectRatio})` : 'auto')
    };
  };

  const dimensions = getResponsiveDimensions();

  return (
    <Box
      ref={elementRef}
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...dimensions,
        ...style
      }}
    >
      {/* Loading Skeleton */}
      <AnimatePresence>
        {!isLoaded && !hasError && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <Skeleton
              variant="rectangular"
              width="100%"
              height="100%"
              animation="wave"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Placeholder */}
      {hasError && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgcolor="grey.100"
          color="text.secondary"
          height="100%"
          minHeight={200}
        >
          <Box textAlign="center">
            <Box fontSize="3rem" mb={1}>📷</Box>
            <Box fontSize="0.875rem">Image failed to load</Box>
          </Box>
        </Box>
      )}

      {/* Optimized Image */}
      {imageSrc && !hasError && (
        <motion.img
          ref={imageRef}
          src={imageSrc}
          alt={alt}
          srcSet={generateSrcSet()}
          sizes={sizes}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 1.05 }}
          transition={{ 
            duration: 0.5,
            ease: 'easeOut'
          }}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}

      {/* Placeholder Image */}
      {placeholder && !isLoaded && !hasError && (
        <Box
          component="img"
          src={placeholder}
          alt=""
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(10px)',
            transform: 'scale(1.1)',
            zIndex: -1
          }}
        />
      )}
    </Box>
  );
};

export default OptimizedImage;
