import { Theme } from '@mui/material/styles'

/**
 * Responsive Utility Helpers
 * Collection of utility functions for responsive design
 */

// Breakpoint utilities
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
}

// Responsive spacing calculator
export function getResponsiveSpacing(mobile: number, tablet?: number, desktop?: number) {
  return {
    xs: mobile,
    sm: mobile,
    md: tablet || mobile + 1,
    lg: desktop || tablet || mobile + 2,
    xl: desktop || tablet || mobile + 2,
  }
}

// Responsive padding calculator
export function getResponsivePadding(mobile: number, tablet?: number, desktop?: number) {
  return getResponsiveSpacing(mobile, tablet, desktop)
}

// Responsive grid columns
export function getResponsiveGridColumns(
  xs = 12,
  sm = 6,
  md = 4,
  lg = 3,
  xl = 2
) {
  return { xs, sm, md, lg, xl }
}

// Responsive font size
export function getResponsiveFontSize(theme: Theme, mobile: string, tablet?: string, desktop?: string) {
  return {
    [theme.breakpoints.down('md')]: {
      fontSize: mobile,
    },
    [theme.breakpoints.between('md', 'lg')]: {
      fontSize: tablet || mobile,
    },
    [theme.breakpoints.up('lg')]: {
      fontSize: desktop || tablet || mobile,
    },
  }
}

// Responsive dialog size
export function getResponsiveDialogSize(theme: Theme) {
  return {
    [theme.breakpoints.down('md')]: {
      margin: 0,
      maxWidth: '100%',
      height: '100%',
      maxHeight: '100%',
    },
    [theme.breakpoints.up('md')]: {
      margin: 32,
      maxWidth: 600,
    },
    [theme.breakpoints.up('lg')]: {
      maxWidth: 800,
    },
  }
}

// Responsive container padding
export function getResponsiveContainerPadding(theme: Theme) {
  return {
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
    [theme.breakpoints.between('sm', 'lg')]: {
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
    },
    [theme.breakpoints.up('lg')]: {
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
    },
  }
}

// Responsive card spacing
export function getResponsiveCardSpacing(theme: Theme) {
  return {
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
      margin: theme.spacing(1),
    },
    [theme.breakpoints.between('sm', 'lg')]: {
      padding: theme.spacing(3),
      margin: theme.spacing(2),
    },
    [theme.breakpoints.up('lg')]: {
      padding: theme.spacing(4),
      margin: theme.spacing(3),
    },
  }
}

// Responsive sidebar width
export function getResponsiveSidebarWidth() {
  return {
    mobile: 0, // Hidden
    tablet: 64, // Mini
    desktop: 280, // Full
  }
}

// Responsive table columns visibility
export function getResponsiveTableColumns<T>(
  columns: T[],
  screenSize: 'mobile' | 'tablet' | 'desktop'
): T[] {
  if (screenSize === 'mobile') {
    return columns.filter((col: any) => col.priority === 'high')
  }
  if (screenSize === 'tablet') {
    return columns.filter((col: any) => col.priority !== 'low')
  }
  return columns
}

// Common responsive breakpoint queries
export const mediaQueries = {
  mobile: '@media (max-width: 899px)',
  tablet: '@media (min-width: 900px) and (max-width: 1199px)',
  desktop: '@media (min-width: 1200px)',
  touchDevice: '@media (hover: none) and (pointer: coarse)',
  portrait: '@media (orientation: portrait)',
  landscape: '@media (orientation: landscape)',
  highDPI: '@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
}

// Responsive component props generator
export function getResponsiveProps(
  mobile: Record<string, any>,
  tablet?: Record<string, any>,
  desktop?: Record<string, any>
) {
  return {
    sx: {
      ...mobile,
      '@media (min-width: 900px)': {
        ...tablet,
      },
      '@media (min-width: 1200px)': {
        ...desktop,
      },
    },
  }
}

// Common responsive style mixins
export const responsiveStyles = {
  // Hide on mobile
  hideOnMobile: {
    display: {
      xs: 'none',
      md: 'block',
    },
  },
  
  // Hide on desktop
  hideOnDesktop: {
    display: {
      xs: 'block',
      md: 'none',
    },
  },
  
  // Full width on mobile
  fullWidthOnMobile: {
    width: {
      xs: '100%',
      md: 'auto',
    },
  },
  
  // Stack on mobile
  stackOnMobile: {
    flexDirection: {
      xs: 'column',
      md: 'row',
    },
  },
  
  // Center on mobile
  centerOnMobile: {
    textAlign: {
      xs: 'center',
      md: 'left',
    },
  },
}

export default {
  breakpoints,
  getResponsiveSpacing,
  getResponsivePadding,
  getResponsiveGridColumns,
  getResponsiveFontSize,
  getResponsiveDialogSize,
  getResponsiveContainerPadding,
  getResponsiveCardSpacing,
  getResponsiveSidebarWidth,
  getResponsiveTableColumns,
  mediaQueries,
  getResponsiveProps,
  responsiveStyles,
}
