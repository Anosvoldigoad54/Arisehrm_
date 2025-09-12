'use client'

import React from 'react'
import { 
  Box, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button,
  IconButton,
  useTheme, 
  useMediaQuery,
  alpha,
  styled
} from '@mui/material'
import { motion } from 'framer-motion'

// Enhanced responsive breakpoints
const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400
}

// Responsive Container Component
interface ResponsiveContainerProps {
  children: React.ReactNode
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  fluid?: boolean
  className?: string
  padding?: number | string
  margin?: number | string
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ 
  children, 
  maxWidth = 'lg', 
  fluid = false,
  className = '',
  padding = 2,
  margin = 0
}) => {
  const theme = useTheme()
  
  return (
    <Container
      maxWidth={fluid ? false : maxWidth}
      sx={{
        px: { xs: 1, sm: 2, md: 3 },
        py: padding,
        mx: margin,
        width: fluid ? '100%' : 'auto',
        [theme.breakpoints.down('sm')]: {
          px: 1,
        },
      }}
      className={`responsive-container ${className}`}
    >
      {children}
    </Container>
  )
}

// Responsive Grid System
interface ResponsiveGridProps {
  children: React.ReactNode
  container?: boolean
  item?: boolean
  xs?: number | 'auto'
  sm?: number | 'auto'
  md?: number | 'auto'
  lg?: number | 'auto'
  xl?: number | 'auto'
  spacing?: number
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline'
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  className?: string
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  container = false,
  item = false,
  xs,
  sm,
  md,
  lg,
  xl,
  spacing = 2,
  alignItems,
  justifyContent,
  direction = 'row',
  className = ''
}) => {
  return (
    <Grid
      container={container}
      item={item}
      xs={xs}
      sm={sm}
      md={md}
      lg={lg}
      xl={xl}
      spacing={spacing}
      alignItems={alignItems}
      justifyContent={justifyContent}
      direction={direction}
      className={`responsive-grid ${className}`}
    >
      {children}
    </Grid>
  )
}

// Responsive Card Component
interface ResponsiveCardProps {
  children: React.ReactNode
  elevated?: boolean
  interactive?: boolean
  fullHeight?: boolean
  className?: string
  onClick?: () => void
  padding?: number | string
  margin?: number | string
}

const StyledResponsiveCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'interactive' && prop !== 'fullHeight'
})<{ interactive?: boolean; fullHeight?: boolean }>(({ theme, interactive, fullHeight }) => ({
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  height: fullHeight ? '100%' : 'auto',
  cursor: interactive ? 'pointer' : 'default',
  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  
  ...(interactive && {
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[8],
      borderColor: theme.palette.primary.main,
    },
    '&:active': {
      transform: 'translateY(-2px)',
    },
  }),
  
  [theme.breakpoints.down('md')]: {
    borderRadius: theme.spacing(1.5),
    ...(interactive && {
      '&:hover': {
        transform: 'translateY(-2px)',
      },
      '&:active': {
        transform: 'translateY(-1px)',
      },
    }),
  },
  
  [theme.breakpoints.down('sm')]: {
    borderRadius: theme.spacing(1),
    ...(interactive && {
      '&:hover': {
        transform: 'none',
      },
      '&:active': {
        transform: 'scale(0.98)',
      },
    }),
  },
}))

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  elevated = false,
  interactive = false,
  fullHeight = false,
  className = '',
  onClick,
  padding = 3,
  margin = 0
}) => {
  const theme = useTheme()
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ height: fullHeight ? '100%' : 'auto' }}
    >
      <StyledResponsiveCard
        elevation={elevated ? 4 : 1}
        interactive={interactive}
        fullHeight={fullHeight}
        onClick={onClick}
        className={`responsive-card ${className}`}
        sx={{ m: margin }}
      >
        <CardContent 
          sx={{ 
            p: { xs: 2, sm: padding, md: padding },
            '&:last-child': { pb: { xs: 2, sm: padding, md: padding } }
          }}
        >
          {children}
        </CardContent>
      </StyledResponsiveCard>
    </motion.div>
  )
}

// Responsive Typography Component
interface ResponsiveTypographyProps {
  children: React.ReactNode
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'overline'
  component?: React.ElementType
  responsive?: boolean
  truncate?: boolean
  className?: string
  align?: 'left' | 'center' | 'right' | 'justify'
  color?: string
  gutterBottom?: boolean
}

export const ResponsiveTypography: React.FC<ResponsiveTypographyProps> = ({
  children,
  variant = 'body1',
  component,
  responsive = true,
  truncate = false,
  className = '',
  align = 'left',
  color,
  gutterBottom = false
}) => {
  const theme = useTheme()
  
  // Responsive variant mapping
  const getResponsiveVariant = () => {
    if (!responsive) return variant
    
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const isTablet = useMediaQuery(theme.breakpoints.down('md'))
    
    if (variant === 'h1') return isMobile ? 'h3' : isTablet ? 'h2' : 'h1'
    if (variant === 'h2') return isMobile ? 'h4' : isTablet ? 'h3' : 'h2'
    if (variant === 'h3') return isMobile ? 'h5' : isTablet ? 'h4' : 'h3'
    if (variant === 'h4') return isMobile ? 'h6' : isTablet ? 'h5' : 'h4'
    
    return variant
  }
  
  return (
    <Typography
      variant={getResponsiveVariant()}
      component={component}
      align={align}
      color={color}
      gutterBottom={gutterBottom}
      className={`responsive-typography ${className}`}
      sx={{
        ...(truncate && {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }),
      }}
    >
      {children}
    </Typography>
  )
}

// Responsive Button Component
interface ResponsiveButtonProps {
  children: React.ReactNode
  variant?: 'text' | 'outlined' | 'contained'
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
  disabled?: boolean
  loading?: boolean
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  onClick?: () => void
  className?: string
  responsive?: boolean
}

export const ResponsiveButton: React.FC<ResponsiveButtonProps> = ({
  children,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  startIcon,
  endIcon,
  onClick,
  className = '',
  responsive = true
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  // Responsive size mapping
  const getResponsiveSize = () => {
    if (!responsive) return size
    if (isMobile && size === 'large') return 'medium'
    if (isMobile && size === 'medium') return 'small'
    return size
  }
  
  return (
    <Button
      variant={variant}
      color={color}
      size={getResponsiveSize()}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      startIcon={loading ? null : startIcon}
      endIcon={loading ? null : endIcon}
      onClick={onClick}
      className={`responsive-button ${className}`}
      sx={{
        borderRadius: { xs: 1, sm: 2 },
        textTransform: 'none',
        fontWeight: 600,
        px: { xs: 2, sm: 3 },
        py: { xs: 1, sm: 1.5 },
        ...(isMobile && {
          minHeight: 44, // iOS touch target size
        }),
      }}
    >
      {children}
    </Button>
  )
}

// Responsive Icon Button Component
interface ResponsiveIconButtonProps {
  children: React.ReactNode
  size?: 'small' | 'medium' | 'large'
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'
  disabled?: boolean
  onClick?: () => void
  className?: string
  edge?: 'start' | 'end' | false
}

export const ResponsiveIconButton: React.FC<ResponsiveIconButtonProps> = ({
  children,
  size = 'medium',
  color = 'default',
  disabled = false,
  onClick,
  className = '',
  edge = false
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  return (
    <IconButton
      size={isMobile ? 'medium' : size}
      color={color}
      disabled={disabled}
      onClick={onClick}
      edge={edge}
      className={`responsive-icon-button ${className}`}
      sx={{
        ...(isMobile && {
          minHeight: 44,
          minWidth: 44,
        }),
      }}
    >
      {children}
    </IconButton>
  )
}

// Responsive Spacing Utility
export const ResponsiveSpacing = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
    margin: theme.spacing(0.5, 0),
  },
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(2),
    margin: theme.spacing(1, 0),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(3),
    margin: theme.spacing(2, 0),
  },
}))

// Responsive Breakpoint Hook
export const useResponsiveBreakpoints = () => {
  const theme = useTheme()
  
  return {
    isXs: useMediaQuery(theme.breakpoints.only('xs')),
    isSm: useMediaQuery(theme.breakpoints.only('sm')),
    isMd: useMediaQuery(theme.breakpoints.only('md')),
    isLg: useMediaQuery(theme.breakpoints.only('lg')),
    isXl: useMediaQuery(theme.breakpoints.only('xl')),
    isSmDown: useMediaQuery(theme.breakpoints.down('sm')),
    isMdDown: useMediaQuery(theme.breakpoints.down('md')),
    isLgDown: useMediaQuery(theme.breakpoints.down('lg')),
    isSmUp: useMediaQuery(theme.breakpoints.up('sm')),
    isMdUp: useMediaQuery(theme.breakpoints.up('md')),
    isLgUp: useMediaQuery(theme.breakpoints.up('lg')),
  }
}

// Responsive Visibility Component
interface ResponsiveVisibilityProps {
  children: React.ReactNode
  hiddenBelow?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  hiddenAbove?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  onlyOn?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export const ResponsiveVisibility: React.FC<ResponsiveVisibilityProps> = ({
  children,
  hiddenBelow,
  hiddenAbove,
  onlyOn
}) => {
  const theme = useTheme()
  
  let display = {}
  
  if (hiddenBelow) {
    display = { 
      ...display, 
      [theme.breakpoints.down(hiddenBelow)]: { display: 'none' } 
    }
  }
  
  if (hiddenAbove) {
    display = { 
      ...display, 
      [theme.breakpoints.up(hiddenAbove)]: { display: 'none' } 
    }
  }
  
  if (onlyOn) {
    display = { 
      display: 'none',
      [theme.breakpoints.only(onlyOn)]: { display: 'block' } 
    }
  }
  
  return (
    <Box sx={display}>
      {children}
    </Box>
  )
}

// CSS Custom Properties for Responsive Design
export const responsiveStyles = `
  :root {
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    --spacing-xxl: 48px;
    
    --border-radius-xs: 4px;
    --border-radius-sm: 8px;
    --border-radius-md: 12px;
    --border-radius-lg: 16px;
    --border-radius-xl: 24px;
    
    --container-width-xs: 100%;
    --container-width-sm: 540px;
    --container-width-md: 720px;
    --container-width-lg: 960px;
    --container-width-xl: 1140px;
    --container-width-xxl: 1320px;
  }
  
  @media (max-width: 576px) {
    :root {
      --spacing-scale: 0.75;
      --font-scale: 0.9;
    }
  }
  
  @media (max-width: 768px) {
    :root {
      --spacing-scale: 0.85;
      --font-scale: 0.95;
    }
  }
  
  /* Touch-friendly interactions */
  @media (hover: none) and (pointer: coarse) {
    .responsive-card:hover {
      transform: none !important;
    }
    
    .responsive-button {
      min-height: 44px;
      min-width: 44px;
    }
    
    .responsive-icon-button {
      min-height: 44px;
      min-width: 44px;
    }
  }
  
  /* High DPI displays */
  @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    .responsive-card {
      border-width: 0.5px;
    }
  }
  
  /* Reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    .responsive-card {
      transition: none !important;
    }
    
    .responsive-button {
      transition: none !important;
    }
  }
  
  /* Dark mode improvements */
  @media (prefers-color-scheme: dark) {
    .responsive-card {
      background-color: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.12);
    }
  }
`
