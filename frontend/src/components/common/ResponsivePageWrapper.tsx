'use client'

import React from 'react'
import {
  Box,
  Container,
  useTheme,
  alpha,
  Fade,
  Paper,
  Stack,
} from '@mui/material'
import { motion } from 'framer-motion'
import { useResponsive } from '../../hooks/useResponsive'

interface ResponsivePageWrapperProps {
  children: React.ReactNode
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false
  disableGutters?: boolean
  enableGradientBackground?: boolean
  enableGlassEffect?: boolean
  padding?: boolean
  className?: string
  sx?: any
}

export const ResponsivePageWrapper: React.FC<ResponsivePageWrapperProps> = ({
  children,
  maxWidth = false,
  disableGutters = false,
  enableGradientBackground = false,
  enableGlassEffect = false,
  padding = true,
  className,
  sx = {},
}) => {
  const theme = useTheme()
  const responsive = useResponsive()

  const containerProps = {
    maxWidth,
    disableGutters: responsive.isMobile ? true : disableGutters,
  }

  const baseStyles = {
    minHeight: '100vh',
    width: '100%',
    position: 'relative' as const,
    ...(enableGradientBackground && {
      background: `linear-gradient(135deg, 
        ${alpha(theme.palette.primary.main, 0.02)} 0%, 
        ${alpha(theme.palette.secondary.main, 0.02)} 50%,
        ${alpha(theme.palette.primary.main, 0.01)} 100%)`,
    }),
    ...(enableGlassEffect && {
      backdropFilter: 'blur(20px)',
      backgroundColor: alpha(theme.palette.background.default, 0.8),
    }),
    ...sx
  }

  const paddingValue = padding ? responsive.getPadding(1, 2, 3) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }}
      className={className}
    >
      <Box sx={baseStyles}>
        <Container {...containerProps}>
          <Box
            sx={{
              py: paddingValue,
              px: responsive.isMobile ? 1 : paddingValue,
              width: '100%',
            }}
          >
            {children}
          </Box>
        </Container>
      </Box>
    </motion.div>
  )
}

// Specialized wrapper for dashboard-style layouts
export const DashboardPageWrapper: React.FC<ResponsivePageWrapperProps> = (props) => {
  return (
    <ResponsivePageWrapper
      enableGradientBackground
      maxWidth="xl"
      {...props}
    />
  )
}

// Specialized wrapper for form/detail pages
export const FormPageWrapper: React.FC<ResponsivePageWrapperProps> = (props) => {
  const responsive = useResponsive()
  
  return (
    <ResponsivePageWrapper
      maxWidth={responsive.isMobile ? 'sm' : 'md'}
      enableGlassEffect
      {...props}
    />
  )
}

// Specialized wrapper for data table/grid pages  
export const GridPageWrapper: React.FC<ResponsivePageWrapperProps> = (props) => {
  return (
    <ResponsivePageWrapper
      maxWidth="xl"
      disableGutters={false}
      {...props}
    />
  )
}

// Enhanced card container with consistent spacing
interface ResponsiveCardGridProps {
  children: React.ReactNode
  spacing?: number
  minCardWidth?: number
  maxColumns?: number
  className?: string
}

export const ResponsiveCardGrid: React.FC<ResponsiveCardGridProps> = ({
  children,
  spacing,
  minCardWidth = 280,
  maxColumns = 4,
  className
}) => {
  const responsive = useResponsive()
  const theme = useTheme()

  const gridSpacing = spacing ?? responsive.getSpacing(2, 2.5, 3)

  return (
    <Box
      className={className}
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: `repeat(auto-fit, minmax(${minCardWidth}px, 1fr))`,
          md: `repeat(auto-fit, minmax(${minCardWidth}px, 1fr))`,
          lg: `repeat(${Math.min(maxColumns, 4)}, 1fr)`,
        },
        gap: gridSpacing,
        width: '100%',
      }}
    >
      {children}
    </Box>
  )
}

export default ResponsivePageWrapper
