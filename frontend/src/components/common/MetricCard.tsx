import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  LinearProgress,
  useMediaQuery,
} from '@mui/material'
import { styled, keyframes } from '@mui/material/styles'
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  MoreVert,
  Refresh,
} from '@mui/icons-material'
import { MetricCardProps } from './types'
import { designTokens, semantic, gradients } from '../../styles/Theme/tokens'
import { useResponsive } from '../../hooks/useResponsive'
import CountUp from './CountUp'

// Animations
const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`

// Styled Card with enhanced hover effects
const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'color' && prop !== 'size' && prop !== 'clickable'
})<{ 
  color: string
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  clickable: boolean
}>(({ theme, color, size, clickable }) => {
  const sizeConfig = {
    xs: { padding: theme.spacing(1.5), minHeight: 80 },
    sm: { padding: theme.spacing(2), minHeight: 100 },
    md: { padding: theme.spacing(2.5), minHeight: 120 },
    lg: { padding: theme.spacing(3), minHeight: 140 },
    xl: { padding: theme.spacing(3.5), minHeight: 160 }
  }

  const config = sizeConfig[size]

  return {
    borderRadius: designTokens.borderRadius.card,
    border: `1px solid ${theme.palette.divider}`,
    transition: `all ${designTokens.animation.duration.normal} ${designTokens.animation.ease.inOut}`,
    cursor: clickable ? 'pointer' : 'default',
    position: 'relative',
    overflow: 'hidden',
    minHeight: config.minHeight,
    background: theme.palette.background.paper,
    
    '&:before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 3,
      background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.6)})`,
      transform: 'scaleX(0)',
      transformOrigin: 'left',
      transition: `transform ${designTokens.animation.duration.normal} ${designTokens.animation.ease.out}`,
    },

    '&:hover': {
      transform: clickable ? 'translateY(-4px)' : 'translateY(-2px)',
      boxShadow: theme.shadows[8],
      borderColor: alpha(color, 0.5),
      
      '&:before': {
        transform: 'scaleX(1)',
      },
    },

    '& .MuiCardContent-root': {
      padding: config.padding,
      '&:last-child': {
        paddingBottom: config.padding,
      },
    },
  }
})

// Trend indicator component
const TrendIndicator: React.FC<{ 
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
}> = ({ change, changeType }) => {
  const theme = useTheme()
  
  const getColor = () => {
    switch (changeType) {
      case 'increase': return semantic.status.positive
      case 'decrease': return semantic.status.negative
      default: return semantic.status.neutral
    }
  }

  const getIcon = () => {
    switch (changeType) {
      case 'increase': return <TrendingUp fontSize="small" />
      case 'decrease': return <TrendingDown fontSize="small" />
      default: return <TrendingFlat fontSize="small" />
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        color: getColor(),
        fontSize: '0.875rem',
        fontWeight: designTokens.fontWeight.medium,
      }}
    >
      {getIcon()}
      <Typography variant="body2" color="inherit" fontWeight="inherit">
        {Math.abs(change)}%
      </Typography>
    </Box>
  )
}

// Mini chart component for trend data
const MiniChart: React.FC<{ trend: Array<{ label: string; value: number }> }> = ({ trend }) => {
  const theme = useTheme()
  const maxValue = Math.max(...trend.map(item => item.value))
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'end', gap: 1, height: 32, mt: 1 }}>
      {trend.map((item, index) => (
        <Box
          key={index}
          sx={{
            flex: 1,
            height: `${(item.value / maxValue) * 100}%`,
            backgroundColor: alpha(theme.palette.primary.main, 0.6),
            borderRadius: '2px 2px 0 0',
            transition: `all ${designTokens.animation.duration.normal} ${designTokens.animation.ease.out}`,
            '&:hover': {
              backgroundColor: theme.palette.primary.main,
              transform: 'scaleY(1.1)',
            },
          }}
        />
      ))}
    </Box>
  )
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  trend,
  color = 'primary',
  size = 'md',
  loading = false,
  onClick,
  footer,
  sx,
  className,
  ...props
}) => {
  const theme = useTheme()
  const responsive = useResponsive()

  // Auto-adjust size based on device
  const responsiveSize = responsive.isSmallMobile ? 'xs' :
                        responsive.isMobile ? 'sm' :
                        responsive.isTablet ? 'md' :
                        size

  const colorValue = color === 'primary' ? theme.palette.primary.main :
                    color === 'secondary' ? theme.palette.secondary.main :
                    color === 'success' ? semantic.status.positive :
                    color === 'error' ? semantic.status.negative :
                    color === 'warning' ? semantic.status.warning :
                    color === 'info' ? semantic.status.info :
                    theme.palette.primary.main

  if (loading) {
    return (
      <StyledCard
        color={colorValue}
        size={responsiveSize}
        clickable={false}
        sx={sx}
        className={className}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="circular" width={24} height={24} />
          </Box>
          <Skeleton variant="text" width="40%" height={32} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="30%" height={20} />
        </CardContent>
      </StyledCard>
    )
  }

  return (
    <StyledCard
      color={colorValue}
      size={responsiveSize}
      clickable={!!onClick}
      onClick={onClick}
      sx={sx}
      className={className}
      {...props}
    >
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              fontWeight: designTokens.fontWeight.medium,
              fontSize: size === 'xs' ? '0.75rem' : size === 'sm' ? '0.8rem' : '0.875rem'
            }}
          >
            {title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {icon && (
              <Box 
                sx={{ 
                  color: colorValue,
                  display: 'flex',
                  alignItems: 'center',
                  '& svg': {
                    fontSize: size === 'xs' ? '1rem' : size === 'sm' ? '1.25rem' : '1.5rem'
                  }
                }}
              >
                {icon}
              </Box>
            )}
            <Tooltip title="More options">
              <IconButton size="small" sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
                <MoreVert fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Value */}
        <Typography 
          variant={size === 'xs' ? 'h6' : size === 'sm' ? 'h5' : size === 'lg' ? 'h3' : size === 'xl' ? 'h2' : 'h4'}
          sx={{ 
            fontWeight: designTokens.fontWeight.bold,
            color: 'text.primary',
            mb: change !== undefined ? 1 : 2,
            lineHeight: 1.2,
          }}
        >
          <CountUp value={typeof value === 'number' ? value : parseInt(value.toString()) || 0} />
          {typeof value === 'string' && isNaN(parseInt(value)) && value}
        </Typography>

        {/* Change Indicator */}
        {change !== undefined && (
          <TrendIndicator change={change} changeType={changeType} />
        )}

        {/* Trend Chart */}
        {trend && trend.length > 0 && (
          <MiniChart trend={trend} />
        )}

        {/* Footer */}
        {footer && (
          <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
            {footer}
          </Box>
        )}

        {/* Loading Progress */}
        {loading && (
          <LinearProgress 
            sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              borderRadius: `${designTokens.borderRadius.card} ${designTokens.borderRadius.card} 0 0`,
            }}
          />
        )}
      </CardContent>
    </StyledCard>
  )
}

export { MetricCard }
export default MetricCard
