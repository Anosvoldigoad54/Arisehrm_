import { useState, useEffect } from 'react'

/**
 * Custom hook for Bootstrap utilities and responsive behavior
 */

export interface BootstrapBreakpoint {
  xs: boolean
  sm: boolean
  md: boolean
  lg: boolean
  xl: boolean
  xxl: boolean
}

export function useBootstrap() {
  const [screenSize, setScreenSize] = useState<BootstrapBreakpoint>({
    xs: false,
    sm: false,
    md: false,
    lg: false,
    xl: false,
    xxl: false
  })

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      setScreenSize({
        xs: width < 576,
        sm: width >= 576 && width < 768,
        md: width >= 768 && width < 992,
        lg: width >= 992 && width < 1200,
        xl: width >= 1200 && width < 1400,
        xxl: width >= 1400
      })
    }

    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
    return () => window.removeEventListener('resize', updateScreenSize)
  }, [])

  // Utility functions
  const isMobile = screenSize.xs || screenSize.sm
  const isTablet = screenSize.md
  const isDesktop = screenSize.lg || screenSize.xl || screenSize.xxl

  // Get responsive columns
  const getColClasses = (xs = 12, sm = 6, md = 4, lg = 3, xl = 2, xxl = 2) => {
    return `col-${xs} col-sm-${sm} col-md-${md} col-lg-${lg} col-xl-${xl} col-xxl-${xxl}`
  }

  // Get responsive spacing
  const getSpacingClass = (mobile = 2, desktop = 4) => {
    return isMobile ? `p-${mobile}` : `p-${desktop}`
  }

  // Get responsive button size
  const getButtonSize = () => {
    return isMobile ? 'btn-sm' : 'btn'
  }

  // Get responsive table classes
  const getTableClasses = () => {
    return isMobile ? 'table-responsive-stack' : 'table-responsive'
  }

  // Get responsive modal classes
  const getModalClasses = () => {
    return isMobile ? 'modal-fullscreen-md-down' : ''
  }

  // Get responsive card classes
  const getCardClasses = () => {
    return isMobile ? 'mb-3' : 'mb-4'
  }

  // Show/hide based on screen size
  const showOnMobile = isMobile
  const showOnDesktop = isDesktop
  const hideOnMobile = !isMobile
  const hideOnDesktop = !isDesktop

  return {
    screenSize,
    isMobile,
    isTablet,
    isDesktop,
    getColClasses,
    getSpacingClass,
    getButtonSize,
    getTableClasses,
    getModalClasses,
    getCardClasses,
    showOnMobile,
    showOnDesktop,
    hideOnMobile,
    hideOnDesktop
  }
}

export default useBootstrap
