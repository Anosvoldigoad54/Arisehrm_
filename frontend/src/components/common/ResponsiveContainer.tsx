import React from 'react'
import { Box, Container, ContainerProps } from '@mui/material'
import { useResponsive } from '../../hooks/useResponsive'

interface ResponsiveContainerProps extends Omit<ContainerProps, 'maxWidth'> {
  children: React.ReactNode
  padding?: 'none' | 'small' | 'medium' | 'large'
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false | 'auto'
  fluid?: boolean // For full-width containers
}

export function ResponsiveContainer({ 
  children, 
  padding = 'medium',
  maxWidth = 'lg',
  fluid = false,
  sx = {},
  ...props 
}: ResponsiveContainerProps) {
  const responsive = useResponsive()

  const getPaddingValue = () => {
    switch (padding) {
      case 'none':
        return 0
      case 'small':
        return responsive.getPadding(1, 1.5, 2)
      case 'medium':
        return responsive.getPadding(2, 3, 4)
      case 'large':
        return responsive.getPadding(3, 4, 6)
      default:
        return responsive.getPadding(2, 3, 4)
    }
  }

  if (fluid) {
    return (
      <Box
        sx={{
          width: '100%',
          px: getPaddingValue(),
          py: getPaddingValue(),
          ...sx
        }}
        {...props}
      >
        {children}
      </Box>
    )
  }

  return (
    <Container
      maxWidth={maxWidth}
      sx={{
        px: getPaddingValue(),
        py: getPaddingValue(),
        ...sx
      }}
      {...props}
    >
      {children}
    </Container>
  )
}

export default ResponsiveContainer
