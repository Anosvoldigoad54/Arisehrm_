import React from 'react'
import { Chip, useTheme, alpha } from '@mui/material'
import { styled } from '@mui/material/styles'
import {
  CheckCircle,
  Schedule,
  Cancel,
  Pause,
  PlayArrow,
  EditNote,
  Archive,
  HourglassEmpty
} from '@mui/icons-material'
import { StatusChipProps, StatusType } from './types'
import { semantic, designTokens } from '../../styles/Theme/tokens'

// Status configuration mapping
const statusConfig: Record<StatusType, {
  color: string
  backgroundColor: string
  icon: React.ReactNode
  label: string
}> = {
  active: {
    color: semantic.status.positive,
    backgroundColor: alpha(semantic.status.positive, 0.1),
    icon: <CheckCircle fontSize="small" />,
    label: 'Active'
  },
  inactive: {
    color: semantic.status.neutral,
    backgroundColor: alpha(semantic.status.neutral, 0.1),
    icon: <Pause fontSize="small" />,
    label: 'Inactive'
  },
  pending: {
    color: semantic.status.warning,
    backgroundColor: alpha(semantic.status.warning, 0.1),
    icon: <Schedule fontSize="small" />,
    label: 'Pending'
  },
  approved: {
    color: semantic.status.positive,
    backgroundColor: alpha(semantic.status.positive, 0.1),
    icon: <CheckCircle fontSize="small" />,
    label: 'Approved'
  },
  rejected: {
    color: semantic.status.negative,
    backgroundColor: alpha(semantic.status.negative, 0.1),
    icon: <Cancel fontSize="small" />,
    label: 'Rejected'
  },
  completed: {
    color: semantic.status.positive,
    backgroundColor: alpha(semantic.status.positive, 0.1),
    icon: <CheckCircle fontSize="small" />,
    label: 'Completed'
  },
  in_progress: {
    color: semantic.status.info,
    backgroundColor: alpha(semantic.status.info, 0.1),
    icon: <PlayArrow fontSize="small" />,
    label: 'In Progress'
  },
  draft: {
    color: semantic.status.neutral,
    backgroundColor: alpha(semantic.status.neutral, 0.1),
    icon: <EditNote fontSize="small" />,
    label: 'Draft'
  },
  archived: {
    color: semantic.status.neutral,
    backgroundColor: alpha(semantic.status.neutral, 0.1),
    icon: <Archive fontSize="small" />,
    label: 'Archived'
  }
}

// Styled chip with enhanced animations and hover effects
const StyledChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'statusColor' && prop !== 'backgroundColor' && prop !== 'variant' && prop !== 'size'
})<{ 
  statusColor: string
  backgroundColor: string
  variant: 'filled' | 'outlined' | 'soft'
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}>(({ theme, statusColor, backgroundColor, variant, size }) => {
  const sizeConfig = {
    xs: { height: 20, fontSize: '0.65rem', padding: '0 6px' },
    sm: { height: 24, fontSize: '0.75rem', padding: '0 8px' },
    md: { height: 28, fontSize: '0.8rem', padding: '0 10px' },
    lg: { height: 32, fontSize: '0.875rem', padding: '0 12px' },
    xl: { height: 36, fontSize: '1rem', padding: '0 14px' }
  }

  const config = sizeConfig[size]

  return {
    height: config.height,
    fontSize: config.fontSize,
    padding: config.padding,
    borderRadius: designTokens.borderRadius.chip,
    fontWeight: designTokens.fontWeight.medium,
    transition: `all ${designTokens.animation.duration.normal} ${designTokens.animation.ease.inOut}`,
    cursor: 'default',
    position: 'relative',
    overflow: 'hidden',

    // Variant styles
    ...(variant === 'filled' && {
      backgroundColor: statusColor,
      color: theme.palette.common.white,
      '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
        transition: `left ${designTokens.animation.duration.slow} ${designTokens.animation.ease.inOut}`,
      },
      '&:hover:before': {
        left: '100%',
      },
    }),

    ...(variant === 'outlined' && {
      backgroundColor: 'transparent',
      color: statusColor,
      border: `1.5px solid ${statusColor}`,
      '&:hover': {
        backgroundColor: alpha(statusColor, 0.08),
        transform: 'scale(1.05)',
      },
    }),

    ...(variant === 'soft' && {
      backgroundColor: backgroundColor,
      color: statusColor,
      border: `1px solid ${alpha(statusColor, 0.2)}`,
      '&:hover': {
        backgroundColor: alpha(statusColor, 0.15),
        transform: 'translateY(-1px)',
        boxShadow: `0 4px 12px ${alpha(statusColor, 0.25)}`,
      },
    }),

    // Icon styling
    '& .MuiChip-icon': {
      color: 'inherit',
      marginLeft: '4px',
      marginRight: '-2px',
      fontSize: config.fontSize,
    },

    // Pulse animation for pending status
    ...(variant === 'filled' && statusColor === semantic.status.warning && {
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      '@keyframes pulse': {
        '0%, 100%': {
          opacity: 1,
        },
        '50%': {
          opacity: 0.8,
        },
      },
    }),
  }
})

const StatusChip: React.FC<StatusChipProps> = ({
  status,
  label,
  size = 'md',
  variant = 'soft',
  sx,
  className,
  ...props
}) => {
  const theme = useTheme()
  const config = statusConfig[status]

  if (!config) {
    return null
  }

  const displayLabel = label || config.label

  return (
    <StyledChip
      icon={config.icon}
      label={displayLabel}
      statusColor={config.color}
      backgroundColor={config.backgroundColor}
      variant={variant}
      size={size}
      sx={sx}
      className={className}
      {...props}
    />
  )
}

export { StatusChip }
export default StatusChip
