'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTheme } from '@mui/material/styles'
import { useMediaQuery } from '@mui/material'

export interface ResponsiveUtils {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isLargeDesktop: boolean
  getVariant: (mobile: string, tablet: string, desktop: string) => string
  getSpacing: (mobile: number, tablet: number, desktop: number) => number
  getPadding: (mobile: number, tablet: number, desktop: number) => number
  getButtonSize: () => 'small' | 'medium' | 'large'
  getGridColumns: (mobile: number, tablet: number, desktop: number) => { xs: number; sm: number; md: number }
}

export const useResponsive = (): ResponsiveUtils => {
  const theme = useTheme()
  
  // Media query breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('xs'))

  // Responsive utility functions
  const getVariant = (mobile: string, tablet: string, desktop: string): string => {
    if (isMobile) return mobile
    if (isTablet) return tablet
    return desktop
  }

  const getSpacing = (mobile: number, tablet: number, desktop: number): number => {
    if (isMobile) return mobile
    if (isTablet) return tablet
    return desktop
  }

  const getPadding = (mobile: number, tablet: number, desktop: number): number => {
    if (isMobile) return mobile
    if (isTablet) return tablet
    return desktop
  }

  const getButtonSize = (): 'small' | 'medium' | 'large' => {
    if (isMobile) return 'small'
    if (isTablet) return 'medium'
    return 'large'
  }

  const getGridColumns = (mobile: number, tablet: number, desktop: number) => {
    return {
      xs: mobile,
      sm: tablet,
      md: desktop,
    }
  }

  const getFlexDirection = (mobile: string, desktop: string): string => {
    if (isMobile) return mobile
    if (isDesktop) return desktop
    return mobile // Default for tablet
  }

  const getInputSize = (): 'small' | 'medium' => {
    if (isMobile) return 'small'
    if (isTablet) return 'medium'
    return 'small' // Default for desktop
  }

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    getVariant,
    getSpacing,
    getPadding,
    getButtonSize,
    getGridColumns,
  }
}
