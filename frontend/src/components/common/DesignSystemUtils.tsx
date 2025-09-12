'use client'

import { useTheme, alpha, SxProps, Theme } from '@mui/material'
import { useResponsive } from '../../hooks/useResponsive'

// Design system utility functions for consistent styling
export const useDesignSystem = () => {
  const theme = useTheme()
  const responsive = useResponsive()

  const getCardStyles = (variant: 'default' | 'elevated' | 'outlined' | 'glass' = 'default'): SxProps<Theme> => {
    const baseStyles: SxProps<Theme> = {
      borderRadius: responsive.isMobile ? 2 : 3,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      '&:hover': {
        transform: 'translateY(-2px)',
      }
    }

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyles,
          boxShadow: theme.shadows[4],
          '&:hover': {
            ...baseStyles['&:hover'],
            boxShadow: theme.shadows[8],
          }
        }
      
      case 'outlined':
        return {
          ...baseStyles,
          border: `1px solid ${theme.palette.divider}`,
          '&:hover': {
            ...baseStyles['&:hover'],
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`,
          }
        }
      
      case 'glass':
        return {
          ...baseStyles,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          '&:hover': {
            ...baseStyles['&:hover'],
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
          }
        }
      
      default:
        return baseStyles
    }
  }

  const getButtonStyles = (variant: 'primary' | 'secondary' | 'outlined' | 'text' = 'primary'): SxProps<Theme> => {
    const baseStyles: SxProps<Theme> = {
      borderRadius: responsive.isMobile ? 2 : 2.5,
      fontWeight: 600,
      textTransform: 'none',
      transition: 'all 0.2s ease',
      minHeight: responsive.isMobile ? 40 : 44,
      px: responsive.getPadding(2, 2.5, 3),
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
          color: theme.palette.primary.contrastText,
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: theme.shadows[4],
          }
        }
      
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: alpha(theme.palette.secondary.main, 0.1),
          color: theme.palette.secondary.main,
          border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
          '&:hover': {
            backgroundColor: alpha(theme.palette.secondary.main, 0.2),
            borderColor: theme.palette.secondary.main,
          }
        }
      
      case 'outlined':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          border: `1px solid ${theme.palette.divider}`,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            borderColor: theme.palette.primary.main,
          }
        }
      
      default:
        return baseStyles
    }
  }

  const getTypographyStyles = (variant: 'heading' | 'subheading' | 'body' | 'caption'): SxProps<Theme> => {
    switch (variant) {
      case 'heading':
        return {
          fontWeight: 700,
          fontSize: responsive.getFontSize('1.5rem', '1.75rem', '2rem'),
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
        }
      
      case 'subheading':
        return {
          fontWeight: 600,
          fontSize: responsive.getFontSize('1.125rem', '1.25rem', '1.375rem'),
          lineHeight: 1.3,
          color: theme.palette.text.secondary,
        }
      
      case 'body':
        return {
          fontWeight: 400,
          fontSize: responsive.getFontSize('0.875rem', '1rem', '1rem'),
          lineHeight: 1.5,
        }
      
      case 'caption':
        return {
          fontWeight: 500,
          fontSize: responsive.getFontSize('0.75rem', '0.8125rem', '0.875rem'),
          lineHeight: 1.4,
          color: alpha(theme.palette.text.primary, 0.7),
        }
      
      default:
        return {}
    }
  }

  const getSpacing = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => {
    const spacingMap = {
      xs: responsive.getSpacing(0.5, 0.75, 1),
      sm: responsive.getSpacing(1, 1.5, 2),
      md: responsive.getSpacing(2, 2.5, 3),
      lg: responsive.getSpacing(3, 4, 5),
      xl: responsive.getSpacing(4, 5, 6),
    }
    return spacingMap[size]
  }

  const getGridColumns = (
    mobile: number = 12,
    tablet: number = 6,
    desktop: number = 4,
    large: number = 3
  ) => {
    return responsive.getGridColumns(mobile, tablet, desktop, large)
  }

  const getShadow = (intensity: 'low' | 'medium' | 'high' = 'medium') => {
    const shadowMap = {
      low: theme.shadows[2],
      medium: theme.shadows[4],
      high: theme.shadows[8],
    }
    return shadowMap[intensity]
  }

  const getGradient = (direction: 'horizontal' | 'vertical' | 'diagonal' = 'diagonal') => {
    const directionMap = {
      horizontal: '90deg',
      vertical: '180deg',
      diagonal: '135deg',
    }
    
    return `linear-gradient(${directionMap[direction]}, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
  }

  return {
    getCardStyles,
    getButtonStyles,
    getTypographyStyles,
    getSpacing,
    getGridColumns,
    getShadow,
    getGradient,
    responsive,
    theme,
  }
}

export default useDesignSystem
