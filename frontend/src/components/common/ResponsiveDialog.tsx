import React from 'react'
import {
  Dialog,
  DialogProps,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Slide,
  Box,
  useTheme,
} from '@mui/material'
import { Close } from '@mui/icons-material'
import { TransitionProps } from '@mui/material/transitions'
import { useResponsive } from '../../hooks/useResponsive'

const Transition = React.forwardRef<unknown, TransitionProps & { children: React.ReactElement<any, any> }>(
  function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />
  }
)

interface ResponsiveDialogProps extends Omit<DialogProps, 'fullScreen' | 'fullWidth'> {
  title?: string
  onClose?: () => void
  children: React.ReactNode
  actions?: React.ReactNode
  hideCloseButton?: boolean
  responsive?: 'auto' | 'fullscreen' | 'modal'
}

export function ResponsiveDialog({
  title,
  onClose,
  children,
  actions,
  hideCloseButton = false,
  responsive = 'auto',
  sx = {},
  ...props
}: ResponsiveDialogProps) {
  const theme = useTheme()
  const responsiveUtils = useResponsive()

  const getDialogProps = () => {
    if (responsive === 'fullscreen') {
      return {
        fullScreen: true,
        fullWidth: true,
        maxWidth: false as const,
        TransitionComponent: Transition,
      }
    }

    if (responsive === 'modal') {
      return {
        fullScreen: false,
        fullWidth: true,
        maxWidth: 'md' as const,
      }
    }

    // Auto responsive
    if (responsiveUtils.isMobile) {
      return {
        fullScreen: true,
        fullWidth: true,
        maxWidth: false as const,
        TransitionComponent: Transition,
      }
    }

    return {
      fullScreen: false,
      fullWidth: true,
      maxWidth: responsiveUtils.isTablet ? 'md' : 'lg' as const,
    }
  }

  const dialogProps = getDialogProps()

  return (
    <Dialog
      {...dialogProps}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: responsiveUtils.isMobile ? 0 : 3,
          margin: responsiveUtils.isMobile ? 0 : 2,
          maxHeight: responsiveUtils.isMobile ? '100vh' : '90vh',
          ...sx,
        },
      }}
      onClose={onClose}
      {...props}
    >
      {title && (
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: responsiveUtils.getPadding(2, 3, 3),
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography 
            variant={responsiveUtils.isMobile ? 'h6' : 'h5'} 
            fontWeight={600}
          >
            {title}
          </Typography>
          {!hideCloseButton && onClose && (
            <IconButton
              aria-label="close"
              onClick={onClose}
              size={responsiveUtils.isMobile ? 'small' : 'medium'}
              sx={{
                color: theme.palette.grey[500],
                ml: 2,
              }}
            >
              <Close />
            </IconButton>
          )}
        </DialogTitle>
      )}

      <DialogContent
        sx={{
          p: responsiveUtils.getPadding(2, 3, 3),
          '&.MuiDialogContent-root': {
            paddingTop: responsiveUtils.getPadding(2, 3, 3),
          },
        }}
      >
        {children}
      </DialogContent>

      {actions && (
        <DialogActions
          sx={{
            p: responsiveUtils.getPadding(2, 3, 3),
            pt: 0,
            borderTop: `1px solid ${theme.palette.divider}`,
            gap: responsiveUtils.getSpacing(1, 2, 2),
            flexDirection: responsiveUtils.isMobile ? 'column' : 'row',
            '& > *': {
              flex: responsiveUtils.isMobile ? 1 : 'unset',
              width: responsiveUtils.isMobile ? '100%' : 'auto',
            },
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  )
}

export default ResponsiveDialog
