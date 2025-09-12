import React, { memo, useMemo } from 'react'
import { Grid, GridProps, useTheme, useMediaQuery } from '@mui/material'
import { useResponsive } from '../../hooks/useResponsive'

interface ResponsiveGridProps extends Omit<GridProps, 'xs' | 'sm' | 'md' | 'lg' | 'xl'> {
  // Responsive breakpoint values
  xs?: number | 'auto' | true | false
  sm?: number | 'auto' | true | false
  md?: number | 'auto' | true | false
  lg?: number | 'auto' | true | false
  xl?: number | 'auto' | true | false
  
  // Additional responsive utilities
  hideOnMobile?: boolean
  hideOnTablet?: boolean
  hideOnDesktop?: boolean
  showOnlyMobile?: boolean
  showOnlyTablet?: boolean
  showOnlyDesktop?: boolean
  
  // Dynamic sizing based on content
  autoSize?: boolean
  minColumns?: number
  maxColumns?: number
  
  // Advanced responsive behavior
  stackOnMobile?: boolean
  centerOnMobile?: boolean
  reverseOnMobile?: boolean
  
  children: React.ReactNode
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = memo(({
  xs = 12,
  sm,
  md,
  lg,
  xl,
  hideOnMobile = false,
  hideOnTablet = false,
  hideOnDesktop = false,
  showOnlyMobile = false,
  showOnlyTablet = false,
  showOnlyDesktop = false,
  autoSize = false,
  minColumns = 1,
  maxColumns = 12,
  stackOnMobile = false,
  centerOnMobile = false,
  reverseOnMobile = false,
  children,
  ...props
}) => {
  const theme = useTheme()
  const { isMobile, isTablet, isDesktop } = useResponsive()

  // Calculate responsive display
  const shouldShow = useMemo(() => {
    if (showOnlyMobile) return isMobile
    if (showOnlyTablet) return isTablet
    if (showOnlyDesktop) return isDesktop
    
    if (hideOnMobile && isMobile) return false
    if (hideOnTablet && isTablet) return false
    if (hideOnDesktop && isDesktop) return false
    
    return true
  }, [
    isMobile, isTablet, isDesktop,
    showOnlyMobile, showOnlyTablet, showOnlyDesktop,
    hideOnMobile, hideOnTablet, hideOnDesktop
  ])

  // Calculate auto sizing
  const calculatedSizes = useMemo(() => {
    if (!autoSize) {
      return { xs, sm, md, lg, xl }
    }

    // Auto-calculate based on content and screen size
    const childCount = React.Children.count(children)
    
    if (childCount === 0) return { xs: 12 }
    
    const sizes = {
      xs: stackOnMobile ? 12 : Math.max(minColumns, Math.min(maxColumns, 12 / Math.min(childCount, 2))),
      sm: sm || Math.max(minColumns, Math.min(maxColumns, 12 / Math.min(childCount, 3))),
      md: md || Math.max(minColumns, Math.min(maxColumns, 12 / Math.min(childCount, 4))),
      lg: lg || Math.max(minColumns, Math.min(maxColumns, 12 / Math.min(childCount, 6))),
      xl: xl || Math.max(minColumns, Math.min(maxColumns, 12 / Math.min(childCount, 6)))
    }

    return sizes
  }, [autoSize, xs, sm, md, lg, xl, children, minColumns, maxColumns, stackOnMobile])

  // Additional styling for mobile behavior
  const additionalSx = useMemo(() => {
    const sx: any = {}
    
    if (centerOnMobile && isMobile) {
      sx.textAlign = 'center'
      sx.display = 'flex'
      sx.flexDirection = 'column'
      sx.alignItems = 'center'
    }
    
    if (reverseOnMobile && isMobile) {
      sx.flexDirection = 'column-reverse'
    }
    
    return sx
  }, [centerOnMobile, reverseOnMobile, isMobile])

  if (!shouldShow) {
    return null
  }

  return (
    <Grid
      item
      xs={calculatedSizes.xs}
      sm={calculatedSizes.sm}
      md={calculatedSizes.md}
      lg={calculatedSizes.lg}
      xl={calculatedSizes.xl}
      sx={{
        ...additionalSx,
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Grid>
  )
})

ResponsiveGrid.displayName = 'ResponsiveGrid'

// Container component for responsive grids
interface ResponsiveGridContainerProps extends Omit<GridProps, 'container'> {
  // Responsive spacing
  spacing?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number }
  
  // Auto-fit columns based on item width
  autoFit?: boolean
  minItemWidth?: number
  
  // Masonry-like layout
  masonry?: boolean
  
  // Staggered animation
  stagger?: boolean
  staggerDelay?: number
  
  children: React.ReactNode
}

export const ResponsiveGridContainer: React.FC<ResponsiveGridContainerProps> = memo(({
  spacing = 3,
  autoFit = false,
  minItemWidth = 280,
  masonry = false,
  stagger = false,
  staggerDelay = 100,
  children,
  ...props
}) => {
  const theme = useTheme()
  const { isMobile, isTablet } = useResponsive()

  // Calculate responsive spacing
  const responsiveSpacing = useMemo(() => {
    if (typeof spacing === 'number') {
      return {
        xs: isMobile ? Math.max(1, spacing - 1) : spacing,
        sm: spacing,
        md: spacing,
        lg: spacing,
        xl: spacing
      }
    }
    return spacing
  }, [spacing, isMobile])

  // Auto-fit grid calculation
  const gridStyles = useMemo(() => {
    if (!autoFit) return {}

    return {
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}px, 1fr))`,
      gap: theme.spacing(typeof responsiveSpacing === 'number' ? responsiveSpacing : responsiveSpacing.md || 3),
      [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: '1fr',
        gap: theme.spacing(typeof responsiveSpacing === 'number' ? responsiveSpacing : responsiveSpacing.xs || 2)
      }
    }
  }, [autoFit, minItemWidth, responsiveSpacing, theme])

  // Masonry styles
  const masonryStyles = useMemo(() => {
    if (!masonry) return {}

    return {
      columns: {
        xs: 1,
        sm: 2,
        md: 3,
        lg: 4,
        xl: 4
      },
      columnGap: theme.spacing(typeof responsiveSpacing === 'number' ? responsiveSpacing : responsiveSpacing.md || 3),
      '& > *': {
        breakInside: 'avoid',
        marginBottom: theme.spacing(typeof responsiveSpacing === 'number' ? responsiveSpacing : responsiveSpacing.md || 3)
      }
    }
  }, [masonry, responsiveSpacing, theme])

  // Stagger animation for children
  const staggeredChildren = useMemo(() => {
    if (!stagger) return children

    return React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return child

      return React.cloneElement(child, {
        ...child.props,
        style: {
          ...child.props.style,
          animationDelay: `${index * staggerDelay}ms`
        }
      })
    })
  }, [children, stagger, staggerDelay])

  if (autoFit) {
    return (
      <div style={gridStyles} {...props}>
        {staggeredChildren}
      </div>
    )
  }

  if (masonry) {
    return (
      <div style={{ ...masonryStyles, ...props.sx }} {...props}>
        {staggeredChildren}
      </div>
    )
  }

  return (
    <Grid
      container
      spacing={responsiveSpacing}
      {...props}
    >
      {staggeredChildren}
    </Grid>
  )
})

ResponsiveGridContainer.displayName = 'ResponsiveGridContainer'

// Utility component for responsive visibility
interface ResponsiveVisibilityProps {
  children: React.ReactNode
  hideOnMobile?: boolean
  hideOnTablet?: boolean
  hideOnDesktop?: boolean
  showOnlyMobile?: boolean
  showOnlyTablet?: boolean
  showOnlyDesktop?: boolean
  fallback?: React.ReactNode
}

export const ResponsiveVisibility: React.FC<ResponsiveVisibilityProps> = memo(({
  children,
  hideOnMobile = false,
  hideOnTablet = false,
  hideOnDesktop = false,
  showOnlyMobile = false,
  showOnlyTablet = false,
  showOnlyDesktop = false,
  fallback = null
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive()

  const shouldShow = useMemo(() => {
    if (showOnlyMobile) return isMobile
    if (showOnlyTablet) return isTablet
    if (showOnlyDesktop) return isDesktop
    
    if (hideOnMobile && isMobile) return false
    if (hideOnTablet && isTablet) return false
    if (hideOnDesktop && isDesktop) return false
    
    return true
  }, [
    isMobile, isTablet, isDesktop,
    showOnlyMobile, showOnlyTablet, showOnlyDesktop,
    hideOnMobile, hideOnTablet, hideOnDesktop
  ])

  return shouldShow ? <>{children}</> : <>{fallback}</>
})

ResponsiveVisibility.displayName = 'ResponsiveVisibility'

// Hook for responsive grid calculations
export function useResponsiveGrid() {
  const { isMobile, isTablet, isDesktop, getGridColumns } = useResponsive()

  const getResponsiveColumns = useMemo(() => {
    return (mobileColumns: number, tabletColumns?: number, desktopColumns?: number) => {
      if (isMobile) return mobileColumns
      if (isTablet) return tabletColumns || mobileColumns
      return desktopColumns || tabletColumns || mobileColumns
    }
  }, [isMobile, isTablet, isDesktop])

  const getAutoColumns = useMemo(() => {
    return (itemCount: number, minColumns: number = 1, maxColumns: number = 12) => {
      const columns = Math.max(minColumns, Math.min(maxColumns, 12 / itemCount))
      
      if (isMobile) return Math.max(minColumns, Math.min(6, columns))
      if (isTablet) return Math.max(minColumns, Math.min(4, columns))
      return Math.max(minColumns, Math.min(3, columns))
    }
  }, [isMobile, isTablet])

  return {
    getResponsiveColumns,
    getAutoColumns,
    getGridColumns,
    isMobile,
    isTablet,
    isDesktop
  }
}

export default ResponsiveGrid
